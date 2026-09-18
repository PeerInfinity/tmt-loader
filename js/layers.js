addLayer("p", {
    name: "MJ points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MJ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    doReset(p) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[p].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('G', 11)) keep.push("upgrades");
	if (hasUpgrade('G', 11)) keep.push("milestones");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle: {
	"border-radius": "10% / 10%",
	"width": "125px",
	"height": "125px"
    },
    color: "#0022ff",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "MJ points", // Name of prestige currency
    baseResource: "MJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    passiveGeneration() {
        if (hasUpgrade('B', 11)) return 10
	if (hasMilestone('S', 0)) return 1
	return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('S', 11)) mult = mult.times(10)
	if (hasUpgrade('S', 12)) mult = mult.times(upgradeEffect('S', 12))
        if (hasUpgrade('S', 13)) mult = mult.times(upgradeEffect('S', 13))
	if (hasUpgrade('S', 23)) mult = mult.pow(1.08)
        if (hasUpgrade('L', 13) && !inChallenge('GLA', 11)) mult = mult.times(1000)
	if (hasUpgrade('p', 23)) mult = mult.times(1.4)
	if (inChallenge('S', 11)) mult = mult.pow(0.3)
	if (hasChallenge('S', 11)) mult = mult.pow(1.1)
	if (inChallenge('G', 11)) mult = mult.pow(0.8)
	if (inChallenge('H', 11)) mult = mult.pow(0.5)
	if (hasUpgrade('G', 11)) mult = mult.times(1000)
	if (hasUpgrade('H', 11)) mult = mult.times(1e20)
	if (hasUpgrade('L', 35) && !inChallenge('GLA', 11)) mult = mult.times(1e25)
	if (hasUpgrade('L', 42) && !inChallenge('GLA', 11)) mult = mult.pow(1.011)
	if (hasUpgrade('UT', 23) && !inChallenge('GLA', 11)) mult = mult.pow(1.01)
	if (hasUpgrade('UT', 14) && !inChallenge('GLA', 11)) mult = mult.times(1e300)
	if (hasUpgrade('UT', 16) && !inChallenge('GLA', 11)) mult = mult.times(upgradeEffect('UT', 16))
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	if (inChallenge('SAC', 11) || inChallenge('SAC', 19)) mult = mult.pow(0.005)
	if (inChallenge('SAC', 15)) mult = mult.pow(0.0001)
	if (hasUpgrade('SCH', 21)) mult = mult.times("ee7")
	return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if(hasUpgrade('SCH',13)) exp = exp.times(1.15)
	return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for MJ points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Milestones": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "milestones"
            ],
        },
    },
    upgrades: {
        11: {
            title: "MJ Doubler",
            description: "Double your MJ gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "MJ Boost",
            description: "Multiply MJ gain based on MJ points.",
            cost: new Decimal(4),
            effect(){
                let expu3 = 0.5
                let eff = player.p.points.add(1).pow(expu3)
                eff = softcap(eff, new Decimal("1e5000"), 0.5)
                return eff
	    },
            effectDisplay() { // Add formatting to the effect
                let softcapDescription = ""
                let upgEffect = upgradeEffect(this.layer, this.id)
                if (upgEffect.gte(new Decimal("e5000")) ) {
                    softcapDescription = " (Softcapped)"
		}
	        return "This upgrade boosts MJs by " + format(upgEffect)+"x" + softcapDescription
            },
	    unlocked() { return (hasUpgrade('p', 11)) },
        },
        13: {
            title: "MJs boost MJs",
            description: "MJ gain is boosted by MJs.",
            cost: new Decimal(18),
            effect(){
                let expu3 = 0.15
                let eff = player.points.add(1).pow(expu3)
                eff = softcap(eff, new Decimal("1e3100"), 0.5)
                return eff
	    },
            effectDisplay() { // Add formatting to the effect
                let softcapDescription = ""
                let upgEffect = upgradeEffect(this.layer, this.id)
                if (upgEffect.gte(new Decimal("e3100")) ) {
                    softcapDescription = " (Softcapped)"
		}
	        return "This upgrade boosts MJs by " + format(upgEffect)+"x" + softcapDescription
            },
	    unlocked() { return (hasUpgrade('p', 12)) },
	},
	14: {
            title: "speeding through this layer",
            description: "Unlock Layer 1 Speeders.",
            cost: new Decimal(20),
	    unlocked() { return (hasUpgrade('p', 13)) },
	},
	21: {
            title: "MJ Swarm",
            description: "×10 MJ gain.",
            cost: new Decimal(150),
	    unlocked() { return (hasUpgrade('p', 14)) },
	},
	22: {
            title: "MJ Boost but nerfed",
            description: "Multiply MJ gain based on MJ points with a reduced effect.",
            cost: new Decimal(13000),
            effect(){
                return player[this.layer].points.add(1).pow(0.33)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return (hasUpgrade('p', 21)) },
	},
        23: {
            title: "MJ Point Boost to speed up this layer",
            description: "×1.4 MJ Point gain.",
            cost: new Decimal(100000),
	    unlocked() { return (hasUpgrade('p', 22)) },
	},
	24: {
            title: "Last upgrade until the next layer!",
            description: "×1000 MJ gain and unlock a new layer.",
            cost: new Decimal(550000000),
	    unlocked() { return (hasUpgrade('p', 23)) },
	},
        31: {
            title: "MJ Upgrade Extension",
            description: "×e50 MJs.",
            cost: new Decimal("e17840"),
	    unlocked() { return (hasUpgrade('UT', 25)) },
	},
        32: {
            title: "Pow",
            description: "^1.01 Super MJ Points.",
            cost: new Decimal("e18040"),
	    unlocked() { return (hasUpgrade('p', 31)) },
	},
        33: {
            title: "Super MJ Boost",
            description: "×e20 Super MJ Points.",
            cost: new Decimal("e18105"),
	    unlocked() { return (hasUpgrade('p', 32)) },
	},
        34: {
            title: "Upgrade Tree Continuation",
            description: "Unlock more upgrade tree upgrades and a new upgrade tree tab!!",
            cost: new Decimal("e18255"),
	    unlocked() { return (hasUpgrade('p', 33)) },
	},
    }, 
    milestones: {
        0: {
            requirementDescription: "40 MJ Points",
            effectDescription: "Multiply MJ gain by 4.",
            done() { return player.p.points >= (40) }
        },
        1: {
            requirementDescription: "1,000 MJ Points",
            effectDescription: "Multiply MJ gain by 15.",
            done() { return player.p.points >= (1000) }
        },
        2: {
            requirementDescription: "1,000,000 MJ Points",
            effectDescription: "Multiply MJ gain by 250.",
            done() { return player.p.points >= (1000000) }
        },
    },
})

addLayer("S", {
    name: "Super MJ Points",
    symbol: "SMJ",
    position: 0,
    doReset(S) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[S].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('H', 11)) keep.push("upgrades");
        if (hasUpgrade('H', 11)) keep.push("challenges");
	if (hasUpgrade('GLA', 21)) keep.push("milestones");
	if (hasUpgrade('SCH', 32)) keep.push("milestones");
	
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle: {
	"border-radius": "100%",
	"width": "120px",
	"height": "100px"
    },
    color: "#0ec466",
    requires: new Decimal(1e11), // Can be a function that takes requirement increases into account
    resource: "Super MJ Points", // Name of prestige currency
    baseResource: "MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1425, // Prestige currency exponent
    passiveGeneration() {
        if (hasUpgrade('B', 11)) return 2
	if (hasUpgrade('L', 15)) return 1
	if (hasUpgrade('S', 15)) return 0.075
	return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('S', 21)) mult = mult.times(10)
	if (hasUpgrade('S', 22)) mult = mult.times(upgradeEffect('S', 22))
	if (hasMilestone('S', 1)) mult = mult.times(10)
	if (hasMilestone('S', 2)) mult = mult.times(20)
	if (inChallenge('G', 11)) mult = mult.pow(0.8)
	if (inChallenge('H', 11)) mult = mult.pow(0.5)
	if (hasChallenge('G', 11)) mult = mult.pow(1.05)
	if (hasUpgrade('G', 11)) mult = mult.times(10)
	if (hasUpgrade('G', 13)) mult = mult.times(25)
	if (hasMilestone('C', 0)) mult = mult.times(5)
	if (hasUpgrade('G', 14)) mult = mult.times(100)
	if (hasUpgrade('H', 11)) mult = mult.times(1e6)
	if (hasUpgrade('L', 34) && !inChallenge('GLA', 11)) mult = mult.times(1e10)
	if (hasUpgrade('L', 43) && !inChallenge('GLA', 11)) mult = mult.pow(1.012)
	if (hasUpgrade('L', 55) && !inChallenge('GLA', 11)) mult = mult.times(upgradeEffect('L', 55))
	if (hasAchievement('a', 64)) mult = mult.times(2)
	if (hasUpgrade('p', 32)) mult = mult.pow(1.01)
	if (hasUpgrade('p', 33)) mult = mult.times(1e20)
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	if (inChallenge('SAC', 15)) mult = mult.pow(0.0001)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if(hasUpgrade('SCH',12)) exp = exp.times(3)
	if(hasUpgrade('SCH',24)) exp = exp.times(1.25)
	return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for Super MJ Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('p', 24) || player.S.unlocked) visible = true
       return visible
    },
    branches:["p"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Milestones": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "milestones"
            ],
        },
        "Challenges": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "challenges"
            ],
        },
    },
    upgrades: {
        11: {
            title: "SUPER MJ?",
            description: "×10 MJ & MJ Point Gain.",
            cost: new Decimal(1),
	},
        12: {
            title: "You need more MJs? Then here you go!",
            description: "Multiply MJ Point gain based on MJs.",
            cost: new Decimal(3),
            effect(){
                return player.points.add(1).pow(0.08)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('S', 11)) },
	},
        13: { 
	    title: "Super MJ Boost",
            description: "Multiply MJ Point gain based on Super MJ points.",
            cost: new Decimal(10),
            effect(){
                return player[this.layer].points.add(2).pow(1.33)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return (hasUpgrade('S', 12)) },
	},
        14: { 
	    title: "YEEEEEES!!!",
            description: "^1.05 MJ Gain.",
            cost: new Decimal(250),
	    unlocked() { return (hasChallenge('S', 11)) },
	},
        15: { 
	    title: "Passive Generation",
            description: "Gain 7.5% of Super MJ Points per second.",
            cost: new Decimal(2000),
	    unlocked() { return (hasUpgrade('S', 14)) },
	},
        21: { 
	    title: "BIG BOOST",
            description: "×10 Super MJ Point Gain.",
            cost: new Decimal(250000),
	    unlocked() { return (hasUpgrade('S', 15)) },
	},
        22: {
            title: "BIG LAYER 2 BOOST!",
            description: "Multiply Super MJ Point gain based on MJs.",
            cost: new Decimal(2.5e7),
            effect(){
                return player.points.add(1).pow(0.035)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('S', 21)) },
	},
        23: {
            title: "Almost as strong as the challenge",
            description: "^1.08 MJ Point gain.",
            cost: new Decimal(1e12),
	    unlocked() { return (hasUpgrade('S', 22)) },
	},
        24: {
            title: "A scaling layer",
            description: "Unlock Scaler MJs.",
            cost: new Decimal(1e100),
	    unlocked() { return (hasUpgrade('S', 23)) },
	},
    },
    milestones: {
        0: {
            requirementDescription: "100 Super MJ Points",
            effectDescription: "Passively gain 100% of MJ Points per second!",
            done() { return player.S.points >= (100) }
        },
        1: {
            requirementDescription: "10000 Super MJ Points",
            effectDescription: "×10 Super MJ Point gain",
            done() { return player.S.points >= (10000) }
        },
        2: {
            requirementDescription: "2e14 Super MJ Points",
            effectDescription: "×20 Super MJ Point gain and unlock a new layer",
            done() { return player.S.points >= (2e14) }
        },
    },
    challenges: {
        11: {
            name: "Super MJ Challenge",
            challengeDescription: "^0.3 MJ Points",
            canComplete: function() {return player.points.gte("1e34")},
            goalDescription: "Get e34 MJs.",
            rewardDescription: "^1.1 MJ Points and unlock a new upgrade"
        },
    },
})

addLayer("C", {
    name: "Scaler MJs",
    symbol: "SC",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle: {
	"border-radius": "20% / 10%",
	"width": "125px",
	"height": "125px"
    },
    color: "#9c5005",
    requires: new Decimal(1e130), // Can be a function that takes requirement increases into account
    resource: "Scaler MJs", // Name of prestige currency
    baseResource: "Super MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.S.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2.15, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row
    displayRow: 1,
    hotkeys: [
        {key: "a", description: "A: Reset for Scaler MJs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('S', 24) || player.C.unlocked) visible = true
       return visible
     },
    branches:["S"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Milestones": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "milestones"
            ],
        },
    },
    upgrades: {
        11: {
            title: "Scaler Boost",
            description: "Multiply Giga MJ Point gain based on Scaler MJs.",
            cost: new Decimal(1),
	    effect(){
                return player.C.points.add(2).pow(1.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        12: {
            title: "MJ Click Boost",
            description: "Multiply MJ Click gain based on Scaler MJs.",
            cost: new Decimal(42),
	    effect(){
                return player.C.points.add(2).pow(0.9)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
    },
    milestones: {
        0: {
            requirementDescription: "3 Scaler MJs",
            effectDescription: "×5 Super MJ Points",
            done() { return player.C.points >= (3) }
	},
        1: {
            requirementDescription: "35 Scaler MJs",
            effectDescription: "×10 Hyper MJ Points!",
            done() { return player.C.points >= (35) }
	},
    },
})

addLayer("G", {
    name: "Giga MJ Points",
    symbol: "GMJ",
    position: 0,
    doReset(G) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[G].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('H', 11)) keep.push("upgrades");
	if (hasUpgrade('H', 11)) keep.push("challenges");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle: {
	"border-radius": "25% / 10%",
	"width": "100px",
	"height": "125px"
    },
    color: "#fcd303",
    requires: new Decimal(1e25), // Can be a function that takes requirement increases into account
    resource: "Giga MJ Points", // Name of prestige currency
    baseResource: "Super MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.S.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.115, // Prestige currency exponent
    passiveGeneration() {
        if (hasUpgrade('B', 11)) return 1
	if (hasUpgrade('L', 15)) return 0.25
        return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('G', 13)) mult = mult.times(5)
	if (hasUpgrade('C', 11)) mult = mult.times(upgradeEffect('C', 11))
	if (hasUpgrade('H', 11)) mult = mult.times(1000)
	if (inChallenge('H', 11)) mult = mult.pow(0.5)
	if (hasChallenge('H', 11)) mult = mult.pow(1.1)
	if (hasUpgrade('L', 44) && !inChallenge('GLA', 11)) mult = mult.pow(1.013)
	if (hasUpgrade('L', 32) && !inChallenge('GLA', 11)) mult = mult.times(1e6)
	if (hasUpgrade('B', 15)) mult = mult.times(upgradeEffect('B', 15))
	if (hasAchievement('a', 35)) mult = mult.times(1.2)
	if (hasUpgrade('G', 15)) mult = mult.pow(upgradeEffect('G', 15))
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for Giga MJ Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasMilestone('S', 2) || player.G.unlocked) visible = true
       return visible
     },
    branches: ["S", "C"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Challenges": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "challenges"
            ],
        },
    },
    upgrades: {
        11: {
            title: "This is OP!?",
            description: "×1M MJs, ×1000 MJ Points and ×10 Super MJ Points and keep MJ upgrades and milestones.",
            cost: new Decimal(1),
	},
        12: {
            title: "MJs boost MJs but nerfed",
            description: "MJ gain is boosted by MJs but nerfed.",
            cost: new Decimal(50),
            effect(){
                return player.points.add(1).pow(0.08)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('G', 11)) },
	},
        13: {
	    title: "Double Layer Boost",
            description: "×5 Giga MJ Points and ×25 Super MJ Points.",
            cost: new Decimal(350),
	    unlocked() { return (hasUpgrade('G', 12)) },
	},
        14: {
            title: "×100 Boost to Super MJ Points and unlock Hyper MJs",
            description: "Exactly what the title says.",
            cost: new Decimal(2e16),
	    unlocked() { return (hasChallenge('G', 11)) },
	},
        15: {
            title: "Giga MJ Power",
            description: "Raise Giga MJ point gain based on MJs.",
            cost: new Decimal(1e308),
            effect(){
                let expu3 = 0.000004
                let eff = player.points.add(1).pow(expu3)
                eff = softcap(eff, new Decimal(50000), 0)
                return eff
	    },
            effectDisplay() { // Add formatting to the effect
                let softcapDescription = ""
                let upgEffect = upgradeEffect(this.layer, this.id)
                if (upgEffect.gte(new Decimal(50000)) ) {
                    softcapDescription = " (Hardcapped)"
		}
	        return "This upgrade boosts Giga MJs by " + format(upgEffect)+"^" + softcapDescription
            },
	    unlocked() { return (hasUpgrade('G', 14)) },
	},
    },
    challenges: {
        11: {
            name: "Exponential Downgrade",
            challengeDescription: "^0.8 all layers except Scaler MJs and this layer.",
            canComplete: function() {return player.points.gte("1e185")},
            goalDescription: "Get e185 MJs.",
            rewardDescription: "^1.05 Super MJ Points and unlocka upgrade"
	},
    },
})

addLayer("H", {
    name: "Hyper MJ Points",
    symbol: "HMJ",
    position: 0,
    doReset(H) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[H].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('GLA', 11) || hasUpgrade('SCH', 11)) keep.push("upgrades");
	if (hasUpgrade('GLA', 11)) keep.push("challenges");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#ffffff",
    requires: new Decimal(4e17), // Can be a function that takes requirement increases into account
    resource: "Hyper MJ Points", // Name of prestige currency
    baseResource: "Giga MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.G.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.045, // Prestige currency exponent
    passiveGeneration() {
        if (hasUpgrade('B', 11)) return 0.5
	if (hasUpgrade('L', 15)) return 0.1
        return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasMilestone('C', 1)) mult = mult.times(10)
	if (hasUpgrade('L', 13) && !inChallenge('GLA', 11)) mult = mult.times(3)
	if (hasUpgrade('L', 22) && !inChallenge('GLA', 11)) mult = mult.times(upgradeEffect('L', 22))
	if (hasUpgrade('L', 32) && !inChallenge('GLA', 11)) mult = mult.times(20)
	if (hasUpgrade('B', 11)) mult = mult.times(upgradeEffect('B', 11))
	if (hasUpgrade('B', 14)) mult = mult.times(300)
	if (hasUpgrade('B', 13)) mult = mult.times(upgradeEffect('B', 13))
	if (hasUpgrade('Ge', 23)) mult = mult.times(upgradeEffect('Ge', 23))
	if (hasUpgrade('Ge', 27)) mult = mult.times(0.1)
	if (hasAchievement('a', 64)) mult = mult.times(20)
	if (hasAchievement('a', 43)) mult = mult.times(1.1)
	if (hasUpgrade('Ge', 32)) mult = mult.times(1000)
	if (hasUpgrade('H', 13)) mult = mult.times(100)
	if (hasUpgrade('Ge', 35)) mult = mult.times(1e5)
	if (hasUpgrade('UT', 22) && !inChallenge('GLA', 11)) mult = mult.times(10)
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
	if(hasUpgrade('SCH',23)) exp = exp.times(2)
	return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for Hyper MJ Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('G', 14) || player.H.unlocked) visible = true
       return visible
     },
    branches: ["G", "C"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Challenges": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "challenges"
            ],
        },
    },
    upgrades: {
        11: {
            title: "Hyper MJs are SUPER OP!!!!!!!!",
            description: "×1e50 MJs, ×1e20 MJ Points, ×1e6 Super MJ Points, ×1000 Giga MJ Points, keep Super MJ upgrades and challenges and keep Giga MJ upgrades and challenges.",
            cost: new Decimal(1),
	},
        12: {
            title: "Important for the challenge",
            description: "×1e10 MJs and unlock.",
            cost: new Decimal(1000),
	    unlocked() { return (hasUpgrade('H', 11)) },
	},
        13: {
            title: "GET THAT 13th ULTRA SCALER!",
            description: "×100 Hyper MJ Points.",
            cost: new Decimal(3e80),
            unlocked() { return (hasUpgrade('H', 12)) },
	},
    },
    challenges: {
        11: {
            name: "The hardest challenge in this game",
            challengeDescription: "^0.5 all layers except this layer.",
            canComplete: function() {return player.points.gte("1e555")},
            goalDescription: "Get e555 MJs.",
            rewardDescription: "^1.1 Giga MJ Points and unlock 3 new layers and automate Layer 1 Speeders, they reset nothing and you can max buy them."
	},
    },
})

addLayer("L", {
    name: "MJ Clicks",
    symbol: "CL",
    position: 1,
    doReset(L) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[L].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('GLA', 15) || hasUpgrade('SCH', 22)) keep.push("upgrades");
	if (hasUpgrade('GLA', 22)) keep.push("milestones");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle: {
	"border-radius": "50% / 10%",
	"width": "60px",
	"height": "100px"
    },
    color: "#911f82",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "MJ Clicks", // Name of prestige currency
    baseResource: "Hyper MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.H.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.08, // Prestige currency exponent
    passiveGeneration() {
        if (hasUpgrade('B', 11)) return 200
	if (hasUpgrade('L', 54)) return 100
	if (hasUpgrade('L', 23)) return 3
	return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('L', 11) && !inChallenge('GLA', 11)) mult = mult.times(3)
	if (hasUpgrade('L', 12) && !inChallenge('GLA', 11)) mult = mult.times(4)
	if (hasUpgrade('L', 13) && !inChallenge('GLA', 11)) mult = mult.times(5)
	if (hasUpgrade('L', 14) && !inChallenge('GLA', 11)) mult = mult.times(upgradeEffect('L', 14))
	if (hasMilestone('L', 0)) mult = mult.times(10)
	if (hasUpgrade('L', 21) && !inChallenge('GLA', 11)) mult = mult.times(4)
        if (hasUpgrade('L', 24) && !inChallenge('GLA', 11)) mult = mult.times(5)
	if (hasMilestone('L', 1)) mult = mult.times(10)
	if (hasMilestone('L', 2)) mult = mult.times(7.5)
	if (hasUpgrade('L', 31) && !inChallenge('GLA', 11)) mult = mult.times(1.5)
	if (hasUpgrade('C', 12)) mult = mult.times(upgradeEffect('C', 12))
	if (hasUpgrade('L', 45) && !inChallenge('GLA', 11)) mult = mult.pow(1.5)
	if (hasUpgrade('L', 51) && !inChallenge('GLA', 11)) mult = mult.times(100)
	if (hasUpgrade('L', 52) && !inChallenge('GLA', 11)) mult = mult.times(1000)
	if (hasUpgrade('L', 53) && !inChallenge('GLA', 11)) mult = mult.times(1e5)
	if (hasUpgrade('L', 55) && !inChallenge('GLA', 11)) mult = mult.times(1e6)
	if (hasUpgrade('B', 12)) mult = mult.times(upgradeEffect('B', 12))
	if (hasUpgrade('GLA', 11)) mult = mult.times(2)
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    resetsNothing: true,
    hotkeys: [
        {key: "c", description: "C: Reset for MJ Clicks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasChallenge('H', 11) || player.L.unlocked) visible = true
       return visible
     },
    branches: ["H", "G"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Milestones": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "milestones"
            ],
        },
    },
    upgrades: {
        11: {
            title: "Clicker in The Modding Tree?",
            description: "×3 MJ Clicks.",
            cost: new Decimal(20),
	},
        12: {
            title: " Clicking Boost",
            description: "×4 MJ Clicks.",
            cost: new Decimal(100),
	},
        13: {
            title: "boost boost boost",
            description: "×5 MJ Clicks, ×3 Hyper MJ Points and ×1000 MJ Points.",
            cost: new Decimal(500),
	},
        14: {
            title: "MOAR CLICKS!",
            description: "Multiply MJ Click gain based on MJ Clicks.",
            cost: new Decimal(10000),
            effect(){
                return player.L.points.add(1).pow(0.225)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        15: {
            title: "SUPER OP UPGRADE!!",
            description: "Passivley gain 10% of Hyper MJ Point gain per second, 25% of Giga MJ Points per second and 100% of Super MJ Points per second!.",
            cost: new Decimal(5e6),
	},
        21: {
            title: "Click boost!",
            description: "×4 MJ Clicks.",
            cost: new Decimal(6e6),
	},
        22: {
            title: "Even MORE CLICKS!",
            description: "Multiply Hyper MJ Point gain based on MJ Clicks.",
            cost: new Decimal(2e7),
            effect(){
                return player.L.points.add(1).pow(0.4)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        23: {
            title: "PASSIVE CLICKS",
            description: "Passively gain 300% of MJ Clicks per second!.",
            cost: new Decimal(3e8),
	},
        24: {
            title: "More click boosts!",
            description: "×5 MJ Clicks.",
            cost: new Decimal(4e8),
	},
        25: {
            title: "Milestone!!",
            description: "Get a milestone.",
            cost: new Decimal(3e9),
	},
	31: {
            title: "Little click boost",
            description: "×1.5 MJ Clicks.",
            cost: new Decimal(1e11),
	},
        32: {
            title: "Hyper Boost",
            description: "×20 Hyper MJ Points.",
            cost: new Decimal(2e11),
	},
        33: {
            title: "Giga Boost",
            description: "×1e6 Giga MJ Points.",
            cost: new Decimal(3e11),
	},
        34: {
            title: "Super Boost",
            description: "×1e10 Super MJ Points.",
            cost: new Decimal(5e11),
	},
        35: {
            title: "Normal Boost",
            description: "×1e25 MJ Points.",
            cost: new Decimal(7e11),
	},
        41: {
            title: "The POWER row!!!",
            description: "^1.01 MJs.",
            cost: new Decimal(1e14),
	},
        42: {
            title: "Power 2",
            description: "^1.011 MJ Points.",
            cost: new Decimal(1.5e14),
	},
        43: {
            title: "Power 3",
            description: "^1.012 Super MJ Points.",
            cost: new Decimal(2e14),
	},
        44: {
            title: "Power 4",
            description: "^1.013 Giga MJ Points.",
            cost: new Decimal(2.5e14),
	}, 
        45: {
            title: "SUPER OP!!!",
            description: "^1.5 MJ Clicks.",
            cost: new Decimal(3e14),
	},
        51: {
            title: "Big click boost! Click row",
            description: "×100 MJ Clicks.",
            cost: new Decimal(2e22),
	},
        52: {
            title: "The click row is op!",
            description: "×1000 MJ Clicks.",
            cost: new Decimal(4e25),
	},
        53: {
            title: "Huge click boost",
            description: "×1e5 MJ Clicks.",
            cost: new Decimal(8e29),
	},
        54: {
            title: "More passive gain",
            description: "Now gain 10000% of MJ Click gain per second.",
            cost: new Decimal(5e35),
	},
        55: {
            title: "The last upgrade is this layer",
            description: "×1e6 MJ Clicks and boost Super MJ Point gain based on MJ Clicks and unlock Ultra Scalers.",
            cost: new Decimal(3e37),
	    effect(){
                return player.L.points.add(1).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
    },
    milestones: {
        0: {
            requirementDescription: "2e5 MJ Clicks",
            effectDescription: "×10 MJ Clicks",
            done() { return player.L.points >= (200000) }
        },
        1: {
            requirementDescription: "3e6 MJ Clicks",
            effectDescription: "×6 MJ Clicks",
            done() { return player.L.points >= (3e6) }
        },
        2: {
            requirementDescription: "Upgrade 25",
            effectDescription: "×7.5 MJ Clicks",
            done() { return (hasUpgrade('L', 25)) }
        },
        3: {
            requirementDescription: "5e252 MJ Clicks",
            effectDescription: "×e20000 MJs",
            done() { return player.L.points.gte(5e252) },
            unlocked() { return (hasMilestone('GLA', 0)) }
	},
    },
})

addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    tabFormat: {
        "Achievements": {
            content: [
                "achievements",
                "blank",
                ],
        },
        "Savebank": {
            content: [
                ["clickables", [1, 2, 3, 4, 5, 6, 7]],
            ],
        },
    },
    clickables: {
        11: {
            title: "MJ",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjQ5NDI5NTY4MCwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJrZWVwR29pbmciOmZhbHNlLCJoYXNOYU4iOmZhbHNlLCJwb2ludHMiOiIyLjQ0OTk5OTk5OTk5OTk5OSIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiQyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkciOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJIIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiTCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkdlIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiUG8iOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJVVCI6eyJtYWluVGFicyI6IlVwZ3JhZGUgVHJlZSJ9fSwibGFzdFNhZmVUYWIiOiJwIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwicCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMSIsInRvdGFsIjoiMSIsImJlc3QiOiIxIiwicmVzZXRUaW1lIjoyLjQ0OTk5OTk5OTk5OTk5OSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJTIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkciOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjE5LjQ4ODU5OTM1MzUwNDI3NCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJIIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiTCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImEiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkIiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjE5LjQ4ODU5OTM1MzUwNDI3NCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHZSI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2IiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjE5LjQ4ODU5OTM1MzUwNDI3NCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkJvIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxOS40ODg1OTkzNTM1MDQyNzQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjIuNDQ5OTk5OTk5OTk5OTk5IiwidG90YWwiOiIwIiwiYmVzdCI6IjE3LjAzODU5OTM1MzUwNDI2NyIsInJlc2V0VGltZSI6MTkuNDg4NTk5MzUzNTA0Mjc0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjE5LjQ4ODU5OTM1MzUwNDI3NCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ==")
            },
            style() {return{
                'background-color': tmp.p.color,
            }},
        },
        12: {
            title: "Super MJ",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjQ5NjMzMTQ5Miwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6MjA1Ni4wNTM3OTcwNDgyNDIsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjguNzM5NDk5OTk5OTk5OTk4Iiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwicCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlMiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJDIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiRyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkgiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJMIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiR2UiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJQbyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlVUIjp7Im1haW5UYWJzIjoiVXBncmFkZSBUcmVlIn0sImEiOnsibWFpblRhYnMiOiJTYXZlYmFuayJ9fSwibGFzdFNhZmVUYWIiOiJTIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwib3B0aW9ucy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJwIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjUuODYyOTk5OTk5OTk5OTk3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEiLCJ0b3RhbCI6IjEiLCJiZXN0IjoiMSIsInJlc2V0VGltZSI6NS44NjI5OTk5OTk5OTk5OTcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NS44NjI5OTk5OTk5OTk5OTcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiRyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiSCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiTCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIwNTYuMDUzNzk3MDQ4MjQyLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnsiMTEiOiIifSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6WyIxMSIsIjEyIiwiMTMiLCIxNCIsIjE1IiwiMTYiLCIyMSJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1Ljg2Mjk5OTk5OTk5OTk5NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHZSI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMCJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjA1Ni4wNTM3OTcwNDgyNDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2MiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIwNTYuMDUzNzk3MDQ4MjQyLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkJvIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJQbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiOC43Mzk0OTk5OTk5OTk5OTgiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMi4yOTY3MzIyOTUzNDMxMzg0ZTIyIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIwIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlVUIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMDU2LjA1Mzc5NzA0ODI0MiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ==")
            },
            style() {return{
                'background-color': tmp.S.color,
            }},
        },
        21: {
            title: "Giga MJ",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjQ5Nzg5NjI2Miwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6MzYyMC45MzA0OTM3OTY5NjMsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjYuNzgzMzU0NDQxODI0MTM3Iiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwicCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlMiOnsibWFpblRhYnMiOiJNaWxlc3RvbmVzIn0sIkMiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiSCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlBvIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUifSwiYSI6eyJtYWluVGFicyI6IlNhdmViYW5rIn19LCJsYXN0U2FmZVRhYiI6IkciLCJpbmZvYm94ZXMiOnsiR2UiOnsiYnV5YWJsZSI6ZmFsc2V9fSwiaW5mby10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozNjIwLjkzMDQ5Mzc5Njk2MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJvcHRpb25zLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjM2MjAuOTMwNDkzNzk2OTYzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozNjIwLjkzMDQ5Mzc5Njk2MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJwIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjQuNTIyMjM2Mjk0NTQ5NDIyNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJTIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjQuNTIyMjM2Mjk0NTQ5NDIyNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkMiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjQuNTIyMjM2Mjk0NTQ5NDIyNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjQuNTIyMjM2Mjk0NTQ5NDIyNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJIIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozNjIwLjkzMDQ5Mzc5Njk2MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJMIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozNjIwLjkzMDQ5Mzc5Njk2MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzYyMC45MzA0OTM3OTY5NjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6eyIxMSI6IiIsIjEyIjoiIn0sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOlsiMTEiLCIxMiIsIjEzIiwiMTQiLCIxNSIsIjE2IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMzEiLCIzMiJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo0LjUyMjIzNjI5NDU0OTQyMjYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzYyMC45MzA0OTM3OTY5NjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2UiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjM2MjAuOTMwNDkzNzk2OTYzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2IiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjM2MjAuOTMwNDkzNzk2OTYzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozNjIwLjkzMDQ5Mzc5Njk2MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzYyMC45MzA0OTM3OTY5NjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjYuNzgzMzU0NDQxODI0MTM3IiwidG90YWwiOiIwIiwiYmVzdCI6IjEuNDI0NTMyNzg2NTIzMjE2MmUxNTYiLCJyZXNldFRpbWUiOjM2MjAuOTMwNDkzNzk2OTYzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjM2MjAuOTMwNDkzNzk2OTYzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInRyZWUtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzYyMC45MzA0OTM3OTY5NjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifX0=")
            },
            style() {return{
                'background-color': tmp.G.color,
            }},
        },
        22: {
            title: "Hyper MJ",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjUwMTk4MzcyNCwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6NzcxMC4xMTkwODI0OTkxMjMsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjM0Ljk1NDQ5OTk5OTk5OTg5NiIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiQyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkciOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJIIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiTCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkdlIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiUG8iOnsibWFpblRhYnMiOiJCdXlhYmxlcyJ9LCJVVCI6eyJtYWluVGFicyI6IlVwZ3JhZGUgVHJlZSJ9LCJhIjp7Im1haW5UYWJzIjoiQWNoaWV2ZW1lbnRzIn19LCJsYXN0U2FmZVRhYiI6IkgiLCJpbmZvYm94ZXMiOnsiR2UiOnsiYnV5YWJsZSI6ZmFsc2V9fSwiaW5mby10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3NzEwLjExOTA4MjQ5OTEyMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJvcHRpb25zLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3NzEwLjExOTA4MjQ5OTEyMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJ0cmVlLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInAiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjMuMzAyOTk5OTk5OTk5OTk0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjMuMzAyOTk5OTk5OTk5OTk0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiQyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMy4zMDI5OTk5OTk5OTk5OTQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiRyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMy4zMDI5OTk5OTk5OTk5OTQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJIIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjIzLjMwMjk5OTk5OTk5OTk5NCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJMIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3NzEwLjExOTA4MjQ5OTEyMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NzcxMC4xMTkwODI0OTkxMjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6eyIxMSI6IiIsIjEyIjoiIiwiMjEiOiIifSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6WyIxMSIsIjEyIiwiMTMiLCIxNCIsIjE1IiwiMTYiLCIyMSIsIjIyIiwiMjMiLCIyNCIsIjI1IiwiMjYiLCIzMSIsIjMyIiwiMzMiLCIzNCIsIjM1IiwiMzYiLCI0MSJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMy4zMDI5OTk5OTk5OTk5OTQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NzcxMC4xMTkwODI0OTkxMjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2UiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2IiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3NzEwLjExOTA4MjQ5OTEyMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NzcxMC4xMTkwODI0OTkxMjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjM0Ljk1NDQ5OTk5OTk5OTg5NiIsInRvdGFsIjoiMCIsImJlc3QiOiI4LjcwMDUwMzgzNzQ1NjI3NGU5ODUiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc3MTAuMTE5MDgyNDk5MTIzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn19")
            },
            style() {return{
                'background-color': tmp.H.color,
            }},
        },
        31: {
            title: "Clicker",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjUxMDc3Mjg5OSwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6MTU4NjguMjAxMDkzNjk1Njg1LCJrZWVwR29pbmciOmZhbHNlLCJoYXNOYU4iOmZhbHNlLCJwb2ludHMiOiIzLjk5NjE3MDY4ODIxMzYyNTRlNDQ3Iiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwicCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlMiOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkMiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiSCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlBvIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUifSwiYSI6eyJtYWluVGFicyI6IkFjaGlldmVtZW50cyJ9fSwibGFzdFNhZmVUYWIiOiJMIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTU4NjguMjAxMDkzNjk1Njg1LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTU4NjguMjAxMDkzNjk1Njg1LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwicCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMi4yNDc5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJTIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjMyLjI0Nzk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiQyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMi4yNDc5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjMyLjI0Nzk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiSCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMzc0NzE1ODI0MCIsInRvdGFsIjoiMzc0NzE1OTI0MSIsImJlc3QiOiIzNzQ3MTU4MjQwIiwicmVzZXRUaW1lIjozMi4yNDc5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTJdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MX0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiTCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMiIsInRvdGFsIjoiMiIsImJlc3QiOiIyIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjE1ODY4LjIwMTA5MzY5NTY4NSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7IjExIjoiIiwiMTIiOiIiLCIyMSI6IiIsIjIyIjoiIn0sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOlsiMTEiLCIxMiIsIjEzIiwiMTQiLCIxNSIsIjE2IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMzEiLCIzMiIsIjMzIiwiMzQiLCIzNSIsIjM2IiwiNDEiLCI0MiIsIjQzIiwiNDQiXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImIiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjI3NSIsInRvdGFsIjoiMjc1IiwiYmVzdCI6IjI3NSIsInJlc2V0VGltZSI6MzIuMjQ3OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTU4NjguMjAxMDkzNjk1Njg1LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdlIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMCJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTU4NjguMjAxMDkzNjk1Njg1LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQm8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjYzMC44MTQ5OTk5OTk5OTg3IiwidG90YWwiOiI3MzAuODE0OTk5OTk5OTk5MSIsImJlc3QiOiI2MzAuODE0OTk5OTk5OTk4NyIsInJlc2V0VGltZSI6MTE5LjA4ODAwMDAwMDAwMTE5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMuOTk2MTcwNjg4MjEzNjI1NGU0NDciLCJ0b3RhbCI6IjAiLCJiZXN0IjoiNC4wOTE1NjQyMDYyNzA3MDJlMTI1MzEiLCJyZXNldFRpbWUiOjE1ODY4LjIwMTA5MzY5NTY4NSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIxOSJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlVUIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxNTg2OC4yMDEwOTM2OTU2ODUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifX0=")
            },
            style() {return{
                'background-color': tmp.L.color,
            }},
        },
        32: {
            title: "Ultra Scaler",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjU1MjkyMjg2Miwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6Mjc0NDQuNzQyMjIzNjYyMzYsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjMuNjE0MzM2MDMwMjY3MTQzMmU1MTIzIiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwicCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlMiOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkMiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiSCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlBvIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUifSwiYSI6eyJtYWluVGFicyI6IkFjaGlldmVtZW50cyJ9fSwibGFzdFNhZmVUYWIiOiJCIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwib3B0aW9ucy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyNzQ0NC43NDIyMjM2NjIzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwicCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNS42Nzc5MzkxMzk3NjU0MTFlMzgwNyIsInRvdGFsIjoiNS42Nzc5MzkxMzk3NjU0MTFlMzgwNyIsImJlc3QiOiI1LjY3NzkzOTEzOTc2NTQxMWUzODA3IiwicmVzZXRUaW1lIjoyMi40NDgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDIxLDIyLDIzLDI0XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNy44NjExNjczMjk1MTAzMDFlNTc4IiwidG90YWwiOiI3Ljg2MTE2NzMyOTUxMDMwMWU1NzgiLCJiZXN0IjoiNy44NjExNjczMjk1MTAzMDFlNTc4IiwicmVzZXRUaW1lIjoyMi40NDgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJDIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIyLjQ0OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxLjAxNTUwOTEwMDA3MzIyNDZlNzUiLCJ0b3RhbCI6IjEuMDE1NTA5MTAwMDczMjI0NmU3NSIsImJlc3QiOiIxLjAxNTUwOTEwMDA3MzIyNDZlNzUiLCJyZXNldFRpbWUiOjIyLjQ0OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiSCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMS4wNjEyNjYyMTc3MTc3MjYzZTM4IiwidG90YWwiOiIxLjA2MTI2NjIxNzcxNzcyNjNlMzgiLCJiZXN0IjoiMS4wNjEyNjYyMTc3MTc3MjYzZTM4IiwicmVzZXRUaW1lIjoxMTYwOC43ODkxMjk5NzUwNTQsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjF9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkwiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuMTkwMjc2MDUxNDkxNjczZTUzIiwidG90YWwiOiIxLjE5MDI3NjA1MTQ5MTY3M2U1MyIsImJlc3QiOiIxLjE5MDI3NjA1MTQ5MTY3M2U1MyIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1LDIxLDIyLDIzLDI0LDI1LDMxLDMyLDMzLDM0LDM1LDQxLDQyLDQzLDQ0LDQ1LDUxLDUyLDUzLDU0LDU1XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjI3NDQ0Ljc0MjIyMzY2MjM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnsiMTEiOiIiLCIxMiI6IiIsIjIxIjoiIiwiMjIiOiIiLCIzMSI6IiJ9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbIjExIiwiMTIiLCIxMyIsIjE0IiwiMTUiLCIxNiIsIjIxIiwiMjIiLCIyMyIsIjI0IiwiMjUiLCIyNiIsIjMxIiwiMzIiLCIzMyIsIjM0IiwiMzUiLCIzNiIsIjQxIiwiNDIiLCI0MyIsIjQ0IiwiNDUiLCI0NiIsIjUxIiwiNTIiLCI1MyIsIjU0IiwiNTUiLCI1NiIsIjYxIl0sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI0NDMiLCJ0b3RhbCI6IjQ0MyIsImJlc3QiOiI0NDMiLCJyZXNldFRpbWUiOjIyLjQ0OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIyIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjIyLjQ0OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTFdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdlIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyNzQ0NC43NDIyMjM2NjIzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIwIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdiIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyNzQ0NC43NDIyMjM2NjIzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQm8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjExNDg1OC40OTYyOTk3NjA4NCIsInRvdGFsIjoiMTE0OTU4LjQ5NjI5OTc2MDgyIiwiYmVzdCI6IjExNDg1OC40OTYyOTk3NjA4NCIsInJlc2V0VGltZSI6MTE2OTUuNjI5MTI5OTc1MDI2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMuNjE0MzM2MDMwMjY3MTQzMmU1MTIzIiwidG90YWwiOiIwIiwiYmVzdCI6IjEuNTM3NjMwMzA5NjEyMDY3MWUxNDgwNyIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMjgifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJVVCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Mjc0NDQuNzQyMjIzNjYyMzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyNzQ0NC43NDIyMjM2NjIzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ==")
            },
            style() {return{
                'background-color': tmp.B.color,
            }},
        },
        41: {
            title: "Generator",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjY0OTA1NDg3NCwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6NTUwNDEuNTgzMTgwNzQ1OCwia2VlcEdvaW5nIjpmYWxzZSwiaGFzTmFOIjpmYWxzZSwicG9pbnRzIjoiNi45Nzc0MjY3NTEzODIyNWU1NDM2Iiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwicCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlMiOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkMiOnsibWFpblRhYnMiOiJNaWxlc3RvbmVzIn0sIkciOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkgiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJMIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiR2UiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJQbyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlVUIjp7Im1haW5UYWJzIjoiVXBncmFkZSBUcmVlIn0sImEiOnsibWFpblRhYnMiOiJTYXZlYmFuayJ9fSwibGFzdFNhZmVUYWIiOiJHZSIsImluZm9ib3hlcyI6eyJHZSI6eyJidXlhYmxlIjpmYWxzZX19LCJpbmZvLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjU1MDQxLjU4MzE4MDc0NTgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwib3B0aW9ucy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NTA0MS41ODMxODA3NDU4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NTA0MS41ODMxODA3NDU4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInRyZWUtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJwIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI2LjkzMjk5MDA2NzI0NzYxNGU0MDQ1IiwidG90YWwiOiI2LjkzMjk5MDA2NzI0NzYxNGU0MDQ1IiwiYmVzdCI6IjYuOTMyOTkwMDY3MjQ3NjE0ZTQwNDUiLCJyZXNldFRpbWUiOjkxMi4wMzU1MzA5ODgyNzM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwyMSwyMiwyMywyNF0sIm1pbGVzdG9uZXMiOlsiMCIsIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOiIyIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjUuMDg5OTg5NzA4Nzg1NTMxZTYxOSIsInRvdGFsIjoiNS4wODk5ODk3MDg3ODU1MzFlNjE5IiwiYmVzdCI6IjUuMDg5OTg5NzA4Nzg1NTMxZTYxOSIsInJlc2V0VGltZSI6OTEyLjAzNTUzMDk4ODI3MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJDIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjkxMi4wMzU1MzA5ODgyNzM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkciOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMuNDk5Mjc4MDkyNDE1OTQ4ZTk1IiwidG90YWwiOiIzLjQ5OTI3ODA5MjQxNTk0OGU5NSIsImJlc3QiOiIzLjQ5OTI3ODA5MjQxNTk0OGU5NSIsInJlc2V0VGltZSI6OTEyLjAzNTUzMDk4ODI3MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkgiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjcuMDg4OTYxNjM5ODMxMTU3ZTU2IiwidG90YWwiOiI3LjA4ODk2MTYzOTgzMTE1N2U1NiIsImJlc3QiOiI3LjA4ODk2MTYzOTgzMTE1N2U1NiIsInJlc2V0VGltZSI6MzkyMDUuNjMwMDg3MDUzMjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjF9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkwiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjUuNjY1MjQxNzEwNzcwNjI2ZTcwIiwidG90YWwiOiI1LjY2NTI0MTcxMDc3MDYyNmU3MCIsImJlc3QiOiI1LjY2NTI0MTcxMDc3MDYyNmU3MCIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMTUsMjEsMjIsMjMsMjQsMjUsMzEsMzIsMzMsMzQsMzUsNDEsNDIsNDMsNDQsNDUsNTEsNTIsNTMsNTQsNTVdLCJtaWxlc3RvbmVzIjpbIjAiLCIxIiwiMiJdLCJsYXN0TWlsZXN0b25lIjoiMiIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7IjExIjoiIiwiMTIiOiIiLCIyMSI6IiIsIjIyIjoiIiwiMzEiOiIiLCIzMiI6IiJ9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbIjExIiwiMTIiLCIxMyIsIjE0IiwiMTUiLCIxNiIsIjIxIiwiMjIiLCIyMyIsIjI0IiwiMjUiLCIyNiIsIjMxIiwiMzIiLCIzMyIsIjM0IiwiMzUiLCIzNiIsIjQxIiwiNDIiLCI0MyIsIjQ0IiwiNDUiLCI0NiIsIjUxIiwiNTIiLCI1MyIsIjU0IiwiNTUiLCI1NiIsIjYxIiwiNjIiLCI2MyIsIjY0Il0sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI4MTciLCJ0b3RhbCI6IjgxNyIsImJlc3QiOiI4MTciLCJyZXNldFRpbWUiOjkxMi4wMzU1MzA5ODgyNzM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkIiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjkiLCJ0b3RhbCI6IjM3IiwiYmVzdCI6IjkiLCJyZXNldFRpbWUiOjkxOC4xNTQ1MzA5ODgyNzM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2UiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEiLCJ0b3RhbCI6IjEiLCJiZXN0IjoiMSIsInJlc2V0VGltZSI6OTEyLjAzNTUzMDk4ODI3MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMCJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYiI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMjg0MDQ2LjY3ODI5MTc3MDYzIiwidG90YWwiOiIyODQxNDYuNjc4MjkxNzcwNzUiLCJiZXN0IjoiMjg0MDQ2LjY3ODI5MTc3MDYzIiwicmVzZXRUaW1lIjozOTI5Mi40NzAwODcwNTMyLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjYuOTc3NDI2NzUxMzgyMjVlNTQzNiIsInRvdGFsIjoiMCIsImJlc3QiOiI3LjYzNTkyNzMwOTIzMzAzM2UxNTAxMyIsInJlc2V0VGltZSI6NTUwNDEuNTgzMTgwNzQ1OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIyOCJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlVUIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NTA0MS41ODMxODA3NDU4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn19")
            },
            style() {return{
                'background-color': tmp.Ge.color,
            }},
        },
        42: {
            title: "Accelerators",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjY1NTE4ODQ5Nywibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6NjExNzUuMzQzNTIyNTYyNTM2LCJrZWVwR29pbmciOmZhbHNlLCJoYXNOYU4iOmZhbHNlLCJwb2ludHMiOiIxLjAwMjM3NDkxMDMyMDI0NDRlNTQyNSIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiQ2hhbGxlbmdlcyJ9LCJDIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiRyI6eyJtYWluVGFicyI6IkNoYWxsZW5nZXMifSwiSCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6IkJ1eWFibGVzIn0sIlBvIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUifSwiYSI6eyJtYWluVGFicyI6IlNhdmViYW5rIn19LCJsYXN0U2FmZVRhYiI6IkdiIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjExNzUuMzQzNTIyNTYyNTM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjExNzUuMzQzNTIyNTYyNTM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2MTE3NS4zNDM1MjI1NjI1MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2MTE3NS4zNDM1MjI1NjI1MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwicCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNi44OTQ5MDA3MzM4ODg5MjQ1ZTQwMjkiLCJ0b3RhbCI6IjYuODk0OTAwNzMzODg4OTI0NWU0MDI5IiwiYmVzdCI6IjYuODk0OTAwNzMzODg4OTI0NWU0MDI5IiwicmVzZXRUaW1lIjo1LjM1MDAwMDAwMDAwMDAwMDUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDIxLDIyLDIzLDI0XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi40NzEwNTkwODE3OTU0MTQzZTYxNSIsInRvdGFsIjoiMi40NzEwNTkwODE3OTU0MTQzZTYxNSIsImJlc3QiOiIyLjQ3MTA1OTA4MTc5NTQxNDNlNjE1IiwicmVzZXRUaW1lIjo1LjM1MDAwMDAwMDAwMDAwMDUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJDIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjUuMzUwMDAwMDAwMDAwMDAwNSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI0LjcxOTcyODIxOTcyMzI0M2U5MSIsInRvdGFsIjoiNC43MTk3MjgyMTk3MjMyNDNlOTEiLCJiZXN0IjoiNC43MTk3MjgyMTk3MjMyNDNlOTEiLCJyZXNldFRpbWUiOjUuMzUwMDAwMDAwMDAwMDAwNSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiSCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi4yNzY0NTU1NTI2NzQ0NTIzZTc5IiwidG90YWwiOiIyLjI3NjQ1NTU1MjY3NDQ1MjNlNzkiLCJiZXN0IjoiMi4yNzY0NTU1NTI2NzQ0NTIzZTc5IiwicmVzZXRUaW1lIjo0NTMzOS4zOTA0Mjg4Njk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTJdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MX0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiTCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi4xODcxMjU3NDg4MjMzMDRlNzMiLCJ0b3RhbCI6IjIuMTg3MTI1NzQ4ODIzMzA0ZTczIiwiYmVzdCI6IjIuMTg3MTI1NzQ4ODIzMzA0ZTczIiwicmVzZXRUaW1lIjo2MTE3NS4zNDM1MjI1NjI1MzYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1LDIxLDIyLDIzLDI0LDI1LDMxLDMyLDMzLDM0LDM1LDQxLDQyLDQzLDQ0LDQ1LDUxLDUyLDUzLDU0LDU1XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjYxMTc1LjM0MzUyMjU2MjUzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7IjExIjoiIiwiMTIiOiIiLCIyMSI6IiIsIjIyIjoiIiwiMzEiOiIiLCIzMiI6IiIsIjQxIjoiIn0sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOlsiMTEiLCIxMiIsIjEzIiwiMTQiLCIxNSIsIjE2IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMzEiLCIzMiIsIjMzIiwiMzQiLCIzNSIsIjM2IiwiNDEiLCI0MiIsIjQzIiwiNDQiLCI0NSIsIjQ2IiwiNTEiLCI1MiIsIjUzIiwiNTQiLCI1NSIsIjU2IiwiNjEiLCI2MiIsIjYzIiwiNjQiLCI2NSIsIjY2IiwiNzEiLCI3MiIsIjczIiwiNzQiLCI3NSIsIjc2IiwiODEiLCI4MiJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiODUiLCJ0b3RhbCI6Ijg1IiwiYmVzdCI6Ijg1IiwicmVzZXRUaW1lIjo1LjM1MDAwMDAwMDAwMDAwMDUsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMTMiLCJ0b3RhbCI6IjY2IiwiYmVzdCI6IjEzIiwicmVzZXRUaW1lIjo5MC42NjE5OTk5OTk5OTk4NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMTUsMTYsMTddLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdlIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI5MzAzNjM1NjA5MzU4NDkuMiIsInRvdGFsIjoiMTA4OTU2NTMwMzYzNDEzNS4yIiwiYmVzdCI6IjkzMDM2MzU2MDkzNTg0OS4yIiwicmVzZXRUaW1lIjo3MDQ1Ljc5NTg3Mjc5MjM1NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIxMCJ9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMTUsMTYsMTcsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMzEsMzIsMzMsMzQsMzVdLCJtaWxlc3RvbmVzIjpbIjAiLCIxIl0sImxhc3RNaWxlc3RvbmUiOiIxIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjUuMzUwMDAwMDAwMDAwMDAwNSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjExNzUuMzQzNTIyNTYyNTM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkJvIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIzMzc3MTYuNzY2NzA5ODA1NiIsInRvdGFsIjoiMzM3ODE2Ljc2NjcwOTgwNTciLCJiZXN0IjoiMzM3NzE2Ljc2NjcwOTgwNTYiLCJyZXNldFRpbWUiOjQ1NDI2LjIzMDQyODg2OTk0LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuMDAyMzc0OTEwMzIwMjQ0NGU1NDI1IiwidG90YWwiOiIwIiwiYmVzdCI6IjIuNTc5NzY4NDAwNjk5MjQ0NWUxNTA0OSIsInJlc2V0VGltZSI6NjExNzUuMzQzNTIyNTYyNTM2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjI4In0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxM10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOmZhbHNlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjYxMTc1LjM0MzUyMjU2MjUzNiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ==")
            },
            style() {return{
                'background-color': tmp.Gb.color,
            }},
        },
        51: {
            title: "Raisers",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjY1NTg5OTkzOCwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6NjE4ODYuODI1NTQzNTkyNjgsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjUuMzY4MjkwMjIxOTg2MDI2ZTU0NDciLCJzdWJ0YWJzIjp7ImNoYW5nZWxvZy10YWIiOnt9LCJwIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiUyI6eyJtYWluVGFicyI6IkNoYWxsZW5nZXMifSwiQyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkciOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkgiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJMIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiR2UiOnsibWFpblRhYnMiOiJCdXlhYmxlcyJ9LCJQbyI6eyJtYWluVGFicyI6IkJ1eWFibGVzIn0sIlVUIjp7Im1haW5UYWJzIjoiVXBncmFkZSBUcmVlIn0sImEiOnsibWFpblRhYnMiOiJTYXZlYmFuayJ9fSwibGFzdFNhZmVUYWIiOiJHYyIsImluZm9ib3hlcyI6eyJHZSI6eyJidXlhYmxlIjpmYWxzZX19LCJpbmZvLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjYxODg2LjgyNTU0MzU5MjY4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjE4ODYuODI1NTQzNTkyNjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiY2hhbmdlbG9nLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjYxODg2LjgyNTU0MzU5MjY4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInRyZWUtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjE4ODYuODI1NTQzNTkyNjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwicCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNS41OTE2MTQxOTYzMzU5NjFlNDA0OCIsInRvdGFsIjoiNS41OTE2MTQxOTYzMzU5NjFlNDA0OCIsImJlc3QiOiI1LjU5MTYxNDE5NjMzNTk2MWU0MDQ4IiwicmVzZXRUaW1lIjo3LjE2NTk5OTk5OTk5OTk5NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMjEsMjIsMjMsMjRdLCJtaWxlc3RvbmVzIjpbIjAiLCIxIiwiMiJdLCJsYXN0TWlsZXN0b25lIjoiMiIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJTIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI2LjcxOTA1NTIwNDEzNTAzMWU2MTgiLCJ0b3RhbCI6IjYuNzE5MDU1MjA0MTM1MDMxZTYxOCIsImJlc3QiOiI2LjcxOTA1NTIwNDEzNTAzMWU2MTgiLCJyZXNldFRpbWUiOjcuMTY1OTk5OTk5OTk5OTk3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxM10sIm1pbGVzdG9uZXMiOlsiMCIsIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOiIyIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MH0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiQyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3LjE2NTk5OTk5OTk5OTk5NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI0LjgzNTk5NzA5MDIyNTM4MzVlOTIiLCJ0b3RhbCI6IjQuODM1OTk3MDkwMjI1MzgzNWU5MiIsImJlc3QiOiI0LjgzNTk5NzA5MDIyNTM4MzVlOTIiLCJyZXNldFRpbWUiOjcuMTY1OTk5OTk5OTk5OTk3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxM10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJIIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIyLjI3NjYyMzMwMzg2NTc3MzdlNzkiLCJ0b3RhbCI6IjIuMjc2NjIzMzAzODY1NzczN2U3OSIsImJlc3QiOiIyLjI3NjYyMzMwMzg2NTc3MzdlNzkiLCJyZXNldFRpbWUiOjQ2MDUwLjg3MjQ0OTkwMDEwNCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTJdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MX0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiTCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi41ODcxMDM1NjA1ODIwNzk0ZTczIiwidG90YWwiOiIyLjU4NzEwMzU2MDU4MjA3OTRlNzMiLCJiZXN0IjoiMi41ODcxMDM1NjA1ODIwNzk0ZTczIiwicmVzZXRUaW1lIjo2MTg4Ni44MjU1NDM1OTI2OCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMTUsMjEsMjIsMjMsMjQsMjUsMzEsMzIsMzMsMzQsMzUsNDEsNDIsNDMsNDQsNDUsNTEsNTIsNTMsNTQsNTVdLCJtaWxlc3RvbmVzIjpbIjAiLCIxIiwiMiJdLCJsYXN0TWlsZXN0b25lIjoiMiIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjE4ODYuODI1NTQzNTkyNjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6eyIxMSI6IiIsIjEyIjoiIiwiMjEiOiIiLCIyMiI6IiIsIjMxIjoiIiwiMzIiOiIiLCI0MSI6IiIsIjQyIjoiIn0sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOlsiMTEiLCIxMiIsIjEzIiwiMTQiLCIxNSIsIjE2IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMzEiLCIzMiIsIjMzIiwiMzQiLCIzNSIsIjM2IiwiNDEiLCI0MiIsIjQzIiwiNDQiLCI0NSIsIjQ2IiwiNTEiLCI1MiIsIjUzIiwiNTQiLCI1NSIsIjU2IiwiNjEiLCI2MiIsIjYzIiwiNjQiLCI2NSIsIjY2IiwiNzEiLCI3MiIsIjczIiwiNzQiLCI3NSIsIjc2IiwiODEiLCI4MiIsIjgzIiwiODQiLCI4NSIsIjg2Il0sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxMzIiLCJ0b3RhbCI6IjEzMiIsImJlc3QiOiIxMzIiLCJyZXNldFRpbWUiOjcuMTY1OTk5OTk5OTk5OTk3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkIiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEzIiwidG90YWwiOiI2NiIsImJlc3QiOiIxMyIsInJlc2V0VGltZSI6ODAyLjE0NDAyMTAyOTMxNDksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1LDE2LDE3XSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHZSI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMS4xMjY5ODMwODM4Njc1MzEyZTIzIiwidG90YWwiOiIxLjQzMTM0NzExOTQ4OTMyNGUyMyIsImJlc3QiOiIxLjEyNjk4MzA4Mzg2NzUzMTJlMjMiLCJyZXNldFRpbWUiOjc3NTcuMjc3ODkzODIxNzEzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjIyIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNSwxNiwxNywyMSwyMiwyMywyNCwyNSwyNiwyNywzMSwzMiwzMywzNCwzNV0sIm1pbGVzdG9uZXMiOlsiMCIsIjEiXSwibGFzdE1pbGVzdG9uZSI6IjEiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2IiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjExIiwidG90YWwiOiIyMyIsImJlc3QiOiIxMSIsInJlc2V0VGltZSI6MTYuMTIwMDAwMDAwMDAwMDIsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMSIsInRvdGFsIjoiMSIsImJlc3QiOiIxIiwicmVzZXRUaW1lIjo3LjE2NTk5OTk5OTk5OTk5NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMzQxMjU5LjQ5MTgxNDk1MzMiLCJ0b3RhbCI6IjM0MTM1OS40OTE4MTQ5NTM0IiwiYmVzdCI6IjM0MTI1OS40OTE4MTQ5NTMzIiwicmVzZXRUaW1lIjo0NjEzNy43MTI0NDk5MDAwOCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTFdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlBvIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI1LjM2ODI5MDIyMTk4NjAyNmU1NDQ3IiwidG90YWwiOiIwIiwiYmVzdCI6IjIuNTc5NzY4NDAwNjk5MjQ0NWUxNTA0OSIsInJlc2V0VGltZSI6NjE4ODYuODI1NTQzNTkyNjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMjgifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJVVCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjE4ODYuODI1NTQzNTkyNjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifX0=")
            },
            style() {return{
                'background-color': tmp.Gc.color,
            }},
        },
        52: {
            title: "Upgrade Tree",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcxNjY1NjMzMzY3Miwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMS41LjAgQmlnZ2VzdCB1cGRhdGUgeWV0IiwidGltZVBsYXllZCI6NjIzMjAuNjIxMzA1MjQxNzMsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjEuNDYzMDIxMzQxNjQ3NzllNTQ3NyIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiQ2hhbGxlbmdlcyJ9LCJDIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiRyI6eyJtYWluVGFicyI6IkNoYWxsZW5nZXMifSwiSCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6IkJ1eWFibGVzIn0sIlBvIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUifSwiYSI6eyJtYWluVGFicyI6IlNhdmViYW5rIn19LCJsYXN0U2FmZVRhYiI6IlVUIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjIzMjAuNjIxMzA1MjQxNzMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwib3B0aW9ucy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2MjMyMC42MjEzMDUyNDE3MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjIzMjAuNjIxMzA1MjQxNzMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2MjMyMC42MjEzMDUyNDE3MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJwIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxLjQ3NzgwNzE0NDQzODkxOTFlNDA3NCIsInRvdGFsIjoiMS40Nzc4MDcxNDQ0Mzg5MTkxZTQwNzQiLCJiZXN0IjoiMS40Nzc4MDcxNDQ0Mzg5MTkxZTQwNzQiLCJyZXNldFRpbWUiOjIwLjA1MDAwMDAwMDAwMDAzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwyMSwyMiwyMywyNF0sIm1pbGVzdG9uZXMiOlsiMCIsIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOiIyIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjIuMDg4MTIwMjY4NDI5NDU1ZTYyNCIsInRvdGFsIjoiMi4wODgxMjAyNjg0Mjk0NTVlNjI0IiwiYmVzdCI6IjIuMDg4MTIwMjY4NDI5NDU1ZTYyNCIsInJlc2V0VGltZSI6MjAuMDUwMDAwMDAwMDAwMDMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJDIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIwLjA1MDAwMDAwMDAwMDAzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkciOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuNjk4MjUzOTgxMDE4Njg4N2U5NCIsInRvdGFsIjoiMS42OTgyNTM5ODEwMTg2ODg3ZTk0IiwiYmVzdCI6IjEuNjk4MjUzOTgxMDE4Njg4N2U5NCIsInJlc2V0VGltZSI6MjAuMDUwMDAwMDAwMDAwMDMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkgiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMuMTA3MjMwNzM2OTIwMDEzZTk1IiwidG90YWwiOiIzLjEwNzIzMDczNjkyMDAxM2U5NSIsImJlc3QiOiIzLjEwNzIzMDczNjkyMDAxM2U5NSIsInJlc2V0VGltZSI6NDY0ODQuNjY4MjExNTQ5MTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjF9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkwiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuNDIwODIxODIzNDgzNzcxNWU3NyIsInRvdGFsIjoiMS40MjA4MjE4MjM0ODM3NzE1ZTc3IiwiYmVzdCI6IjEuNDIwODIxODIzNDgzNzcxNWU3NyIsInJlc2V0VGltZSI6NjIzMjAuNjIxMzA1MjQxNzMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1LDIxLDIyLDIzLDI0LDI1LDMxLDMyLDMzLDM0LDM1LDQxLDQyLDQzLDQ0LDQ1LDUxLDUyLDUzLDU0LDU1XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6IjIiLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjYyMzIwLjYyMTMwNTI0MTczLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnsiMTEiOiIiLCIxMiI6IiIsIjIxIjoiIiwiMjIiOiIiLCIzMSI6IiIsIjMyIjoiIiwiNDEiOiIiLCI0MiI6IiIsIjUxIjoiIn0sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOlsiMTEiLCIxMiIsIjEzIiwiMTQiLCIxNSIsIjE2IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMzEiLCIzMiIsIjMzIiwiMzQiLCIzNSIsIjM2IiwiNDEiLCI0MiIsIjQzIiwiNDQiLCI0NSIsIjQ2IiwiNTEiLCI1MiIsIjUzIiwiNTQiLCI1NSIsIjU2IiwiNjEiLCI2MiIsIjYzIiwiNjQiLCI2NSIsIjY2IiwiNzEiLCI3MiIsIjczIiwiNzQiLCI3NSIsIjc2IiwiODEiLCI4MiIsIjgzIiwiODQiLCI4NSIsIjg2IiwiOTEiLCI5MiJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMzkzIiwidG90YWwiOiIzOTMiLCJiZXN0IjoiMzkzIiwicmVzZXRUaW1lIjoyMC4wNTAwMDAwMDAwMDAwMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxNCIsInRvdGFsIjoiNjciLCJiZXN0IjoiMTQiLCJyZXNldFRpbWUiOjI3Mi42OTk3NjE2NDY1MTU5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNSwxNiwxN10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2UiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMuMzYxOTM0MTUzNDg4NTc4ZTI1IiwidG90YWwiOiI0LjQ0NTY0NzQ5MTM2MTMzN2UyNSIsImJlc3QiOiIzLjM2MTkzNDE1MzQ4ODU3OGUyNSIsInJlc2V0VGltZSI6ODE5MS4wNzM2NTU0NjgyNjksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMjQifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1LDE2LDE3LDIxLDIyLDIzLDI0LDI1LDI2LDI3LDMxLDMyLDMzLDM0LDM1XSwibWlsZXN0b25lcyI6WyIwIiwiMSJdLCJsYXN0TWlsZXN0b25lIjoiMSIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMTIiLCJ0b3RhbCI6IjI0IiwiYmVzdCI6IjEyIiwicmVzZXRUaW1lIjoyNjYuNzA3NzYxNjQ2NTE1OSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI0IiwidG90YWwiOiI5IiwiYmVzdCI6IjQiLCJyZXNldFRpbWUiOjI2OS4wNjU3NjE2NDY1MTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMzQ0NjA4LjkzOTQzMTQyMDEiLCJ0b3RhbCI6IjM0NDcwOC45Mzk0MzE0MjAyNCIsImJlc3QiOiIzNDQ2MDguOTM5NDMxNDIwMSIsInJlc2V0VGltZSI6NDY1NzEuNTA4MjExNTQ5MTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJQbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMS40NjMwMjEzNDE2NDc3OWU1NDc3IiwidG90YWwiOiIwIiwiYmVzdCI6IjIuNTc5NzY4NDAwNjk5MjQ0NWUxNTA0OSIsInJlc2V0VGltZSI6NjIzMjAuNjIxMzA1MjQxNzMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiMjgifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJVVCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMSIsInRvdGFsIjoiMSIsImJlc3QiOiIxIiwicmVzZXRUaW1lIjoyMC4wNTAwMDAwMDAwMDAwMywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ==")
            },
            style() {return{
                'background-color': tmp.UT.color,
            }},
        },
        61: {
            title: "Galactical MJ",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcyMTkzNjYzMTgwOSwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMi4wLjAhIiwidGltZVBsYXllZCI6NjkwMzYuMTQ3Mjc3MjgzMjgsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6ZmFsc2UsInBvaW50cyI6IjguMzIwMDMzNzUyMDg1NDMzZTczNCIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiQ2hhbGxlbmdlcyJ9LCJDIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiRyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkgiOnsibWFpblRhYnMiOiJDaGFsbGVuZ2VzIn0sIkwiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJHZSI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIlBvIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiVVQiOnsibWFpblRhYnMiOiJVcGdyYWRlIFRyZWUgMiJ9LCJhIjp7Im1haW5UYWJzIjoiU2F2ZWJhbmsifX0sImxhc3RTYWZlVGFiIjoiR0xBIiwiaW5mb2JveGVzIjp7IkdlIjp7ImJ1eWFibGUiOmZhbHNlfX0sImluZm8tdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjkwMzYuMTQ3Mjc3MjgzMjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwib3B0aW9ucy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2OTAzNi4xNDcyNzcyODMyOCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjkwMzYuMTQ3Mjc3MjgzMjgsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo2OTAzNi4xNDcyNzcyODMyOCwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJwIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjU0OS44NDk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiUyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NDkuODQ5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTQ5Ljg0OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiRyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NDkuODQ5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkgiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTQ5Ljg0OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjowfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJMIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjU0OS44NDk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiYSI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjY5MDM2LjE0NzI3NzI4MzI4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnsiMTEiOiIiLCIxMiI6IiIsIjIxIjoiIiwiMjIiOiIiLCIzMSI6IiIsIjMyIjoiIiwiNDEiOiIiLCI0MiI6IiIsIjUxIjoiIiwiNTIiOiIifSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6WyIxMSIsIjEyIiwiMTMiLCIxNCIsIjE1IiwiMTYiLCIyMSIsIjIyIiwiMjMiLCIyNCIsIjI1IiwiMjYiLCIzMSIsIjMyIiwiMzMiLCIzNCIsIjM1IiwiMzYiLCI0MSIsIjQyIiwiNDMiLCI0NCIsIjQ1IiwiNDYiLCI1MSIsIjUyIiwiNTMiLCI1NCIsIjU1IiwiNTYiLCI2MSIsIjYyIiwiNjMiLCI2NCIsIjY1IiwiNjYiLCI3MSIsIjcyIiwiNzMiLCI3NCIsIjc1IiwiNzYiLCI4MSIsIjgyIiwiODMiLCI4NCIsIjg1IiwiODYiLCI5MSIsIjkyIiwiOTMiLCI5NCIsIjk1IiwiOTYiLCIxMDEiLCIxMDIiLCIxMDMiXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImIiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTQ5Ljg0OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NDkuODQ5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHZSI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo1NDkuODQ5OTk5OTk5OTk5NiwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIwIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjU0OS44NDk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjU0OS44NDk5OTk5OTk5OTk2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkJvIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI3MDAwNzguMDU5MjkxMjcyOSIsInRvdGFsIjoiNzAwMTc4LjA1OTI5MTI3MjkiLCJiZXN0IjoiNzAwMDc4LjA1OTI5MTI3MjkiLCJyZXNldFRpbWUiOjUzMjg3LjAzNDE4MzU1OTAxLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiUG8iOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjguMzIwMDMzNzUyMDg1NDMzZTczNCIsInRvdGFsIjoiMCIsImJlc3QiOiIxLjQwOTM2NDI2MzY5ODI5MDZlMjMwMTMiLCJyZXNldFRpbWUiOjY5MDM2LjE0NzI3NzI4MzI4LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjI5In0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxM10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NTQ5Ljg0OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJHTEEiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEiLCJ0b3RhbCI6IjEiLCJiZXN0IjoiMSIsInJlc2V0VGltZSI6NTQ5Ljg0OTk5OTk5OTk5OTYsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifX0=")
            },
            style() {return{
                'background-color': tmp.GLA.color,
            }},
        },
        62: {
            title: "Sanas Challenge",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
        	importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcyODgzMzM0MDkyNCwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMi4zLjAiLCJ0aW1lUGxheWVkIjoxMzA2NzguNDUxNTkyNTMyNTcsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6dHJ1ZSwicG9pbnRzIjoiMi45MzI1MDI5NTc2Mzg2NDZlNTA2MjM2MyIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiQyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkciOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJIIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiTCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkdlIjp7Im1haW5UYWJzIjoiQnV5YWJsZXMifSwiUG8iOnsibWFpblRhYnMiOiJCdXlhYmxlcyJ9LCJVVCI6eyJtYWluVGFicyI6IlVwZ3JhZGUgVHJlZSAyIn0sImEiOnsibWFpblRhYnMiOiJBY2hpZXZlbWVudHMifSwiU0FDIjp7Im1haW5UYWJzIjoiU2FuYXMgQ2hhbGxlbmdlcyJ9LCJTQ0giOnsibWFpbiI6Im1haW4iLCJ1cGdyYWRlcyI6IlVwZ3JhZGVzIn19LCJsYXN0U2FmZVRhYiI6IlNBQyIsImluZm9ib3hlcyI6eyJHZSI6eyJidXlhYmxlIjpmYWxzZX19LCJpbmZvLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjEzMDY3OC40NTE1OTI1MzI1NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJvcHRpb25zLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjEzMDY3OC40NTE1OTI1MzI1NywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMwNjc4LjQ1MTU5MjUzMjU3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlNDSCI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJzdHVkZW50cyI6IjAiLCJ0aG91Z2h0cyI6IjAiLCJ0aW1lIjoiMCIsImNsaWNrcyI6IjAiLCJ3b3JrIjoiMCIsImJhY2t5YXJkcyI6IjAiLCJ0ZWFjaGVycyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6NjE2NDIuMzA0MzE1Njk0MjY2LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInAiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjQuMDY0NDk3NTIxNzU5OTE1ZTQ0MDUxMTUiLCJ0b3RhbCI6IjQuMDY0NDk3NTIxNzU5OTE1ZTQ0MDUxMTUiLCJiZXN0IjoiNC4wNjQ0OTc1MjE3NTk5MTVlNDQwNTExNSIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwyMSwyMiwyMywyNCwzMSwzMiwzMywzNF0sIm1pbGVzdG9uZXMiOlsiMCIsIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIlMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuNjk2NTcwMzk5Mjg1NDI5NWU4MTg4OTciLCJ0b3RhbCI6IjEuNjk2NTcwMzk5Mjg1NDI5NWU4MTg4OTciLCJiZXN0IjoiMS42OTY1NzAzOTkyODU0Mjk1ZTgxODg5NyIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNSwyMSwyMiwyMywyNF0sIm1pbGVzdG9uZXMiOlsiMCIsIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjF9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkciOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjUuODUyMDYyNDg0ODI4MzVlNjA0MjA4IiwidG90YWwiOiI1Ljg1MjA2MjQ4NDgyODM1ZTYwNDIwOCIsImJlc3QiOiI1Ljg1MjA2MjQ4NDgyODM1ZTYwNDIwOCIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjoxfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJIIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI4LjcyMzEyMzk2NDYwNTA2OWUyODU5MyIsInRvdGFsIjoiOC43MjMxMjM5NjQ2MDUwNjllMjg1OTMiLCJiZXN0IjoiOC43MjMxMjM5NjQ2MDUwNjllMjg1OTMiLCJyZXNldFRpbWUiOjMyNTAuNzEzNDc1MjEzOSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MX0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiTCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi45MTI3ODI5NzUxMzQ3MTI1ZTM0OTciLCJ0b3RhbCI6IjIuOTEyNzgyOTc1MTM0NzEyNWUzNDk3IiwiYmVzdCI6IjIuOTEyNzgyOTc1MTM0NzEyNWUzNDk3IiwicmVzZXRUaW1lIjozMjUwLjcxMzQ3NTIxMzksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDE0LDEzLDE1LDIxLDIyLDIzLDI0LDI1LDMxLDMyLDM1LDM0LDMzLDQyLDQ1LDQ0LDQzLDQxLDUxLDUyLDUzLDU0LDU1XSwibWlsZXN0b25lcyI6WyIyIiwiMCIsIjEiLCIzIl0sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sImEiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxMzA2NzguNDUxNTkyNTMyNTcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6eyIxMSI6IiIsIjEyIjoiIiwiMjEiOiIiLCIyMiI6IiIsIjMxIjoiIiwiMzIiOiIiLCI0MSI6IiIsIjQyIjoiIiwiNTEiOiIiLCI1MiI6IiIsIjYxIjoiIiwiNjIiOiIiLCI3MSI6IiJ9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbIjExIiwiMTIiLCIxMyIsIjE0IiwiMTUiLCIxNiIsIjIxIiwiMjIiLCIyMyIsIjI0IiwiMjUiLCIyNiIsIjMxIiwiMzIiLCIzMyIsIjM0IiwiMzUiLCIzNiIsIjQxIiwiNDIiLCI0MyIsIjQ0IiwiNDUiLCI0NiIsIjUxIiwiNTIiLCI1MyIsIjU0IiwiNTUiLCI1NiIsIjYxIiwiNjIiLCI2MyIsIjY0IiwiNjUiLCI2NiIsIjcxIiwiNzIiLCI3MyIsIjc0IiwiNzUiLCI3NiIsIjgxIiwiODIiLCI4MyIsIjg0IiwiODUiLCI4NiIsIjkxIiwiOTIiLCI5MyIsIjk0IiwiOTUiLCI5NiIsIjEwMSIsIjEwMiIsIjEwMyIsIjEwNCIsIjEwNSIsIjEwNiIsIjExMSIsIjExMiJdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMzYxNjA4IiwidG90YWwiOiIzNjE2MDgiLCJiZXN0IjoiMzYxNjA4IiwicmVzZXRUaW1lIjozMjUwLjcxMzQ3NTIxMzksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMjUwLjcxMzQ3NTIxMzksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2UiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiR2IiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjMyNTAuNzEzNDc1MjEzOSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJCbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNzAwMDc4LjA1OTI5MTI3MjkiLCJ0b3RhbCI6IjcwMDE3OC4wNTkyOTEyNzI5IiwiYmVzdCI6IjcwMDA3OC4wNTkyOTEyNzI5IiwicmVzZXRUaW1lIjoxMTQ5MjkuMzM4NDk4ODU5ODcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJQbyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMi45MzI1MDI5NTc2Mzg2NDZlNTA2MjM2MyIsInRvdGFsIjoiMCIsImJlc3QiOiIyLjIxNDkxOTM5Mjc2MjQyMjJlNTA2NzI3MyIsInJlc2V0VGltZSI6MTMwNjc4LjQ1MTU5MjUzMjU3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6eyIxMSI6IjQyIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxM10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiVVQiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjMyNTA3MTM0Ljc1MjEzOTAwNiIsInRvdGFsIjoiMzI1MDcxMzQuNzUyMTM5MDA2IiwiYmVzdCI6IjMyNTA3MTM0Ljc1MjEzOTAwNiIsInJlc2V0VGltZSI6MzI1MC43MTM0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxNSwyNiwxNiwzMywxMSwyMSwyMiwzMSwzMiwyMywxMiwxMywyNCwxNCwyNV0sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJHTEEiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuNTQzNjAwNjQ2OTM5MDUyMmU1MzAiLCJ0b3RhbCI6IjEuNTQzNjAwNjQ2OTM5MDUyMmU1MzAiLCJiZXN0IjoiMS41NDM2MDA2NDY5MzkwNTIyZTUzMCIsInJlc2V0VGltZSI6MzI2NS4zNjE0NzUyMTM5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNSwyMSwyMiwyMywyNCwyNSwzMSwzMiwzMywzNCwzNV0sIm1pbGVzdG9uZXMiOlsiMCJdLCJsYXN0TWlsZXN0b25lIjoiMCIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjEsIjEyIjoxfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJTQUMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEiLCJiZWF0ZW4iOiIwIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjMyNTAuNzEzNDc1MjEzOSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjAsIjEyIjowLCIxMyI6MCwiMTQiOjAsIjE1IjowLCIxNiI6MCwiMTciOjAsIjE4IjowLCIxOSI6MCwiMjEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sInRyZWUtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMwNjc4LjQ1MTU5MjUzMjU3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9mZlRpbWUiOnsicmVtYWluIjozNTQuNTE3NTI0Nzg2MTAwMn19")
            },
            style() {return{
                'background-color': tmp.GLA.color,
            }},
        },
        71: {
            title: "MJ School",
            display: "Layer Finished",
            canClick: true,
            onClick() {
                if(!confirm("Your current progress will not be saved!")) return;
                importSave("eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTcyODI1MjU0NzY4NSwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJhYmMxMjMiLCJ2ZXJzaW9uIjoiMi4yLjAiLCJ0aW1lUGxheWVkIjozMzk1MTUuNzExOTMzMTYzMSwia2VlcEdvaW5nIjp0cnVlLCJoYXNOYU4iOmZhbHNlLCJwb2ludHMiOiIxLjU4ODE2OTY5MjA0MzYwMWUyNjA4MTYzNyIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sInAiOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJTIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiQyI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkciOnsibWFpblRhYnMiOiJNYWluIHRhYiJ9LCJIIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiTCI6eyJtYWluVGFicyI6Ik1haW4gdGFiIn0sIkdlIjp7Im1haW5UYWJzIjoiTWFpbiB0YWIifSwiUG8iOnsibWFpblRhYnMiOiJCdXlhYmxlcyJ9LCJVVCI6eyJtYWluVGFicyI6IlVwZ3JhZGUgVHJlZSAyIn0sImEiOnsibWFpblRhYnMiOiJBY2hpZXZlbWVudHMifSwiU0FDIjp7Im1haW5UYWJzIjoiU2FuYXMgQ2hhbGxlbmdlcyJ9fSwibGFzdFNhZmVUYWIiOiJHTEEiLCJpbmZvYm94ZXMiOnsiR2UiOnsiYnV5YWJsZSI6ZmFsc2V9fSwiaW5mby10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMzk1MTUuNzExOTMzMTYzMSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJvcHRpb25zLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjMzOTUxNS43MTE5MzMxNjMxLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImNoYW5nZWxvZy10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMzk1MTUuNzExOTMzMTYzMSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJ0cmVlLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjMzOTUxNS43MTE5MzMxNjMxLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInAiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEuMjEwNjg2ODMwMzk1MDg5ZTE1NDYzNTcyIiwidG90YWwiOiIxLjIxMDY4NjgzMDM5NTA4OWUxNTQ2MzU3MiIsImJlc3QiOiIxLjIxMDY4NjgzMDM5NTA4OWUxNTQ2MzU3MiIsInJlc2V0VGltZSI6Nzg3OC4zMDQ1NzUzNjMwOTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzMxLDMyLDExLDEyLDMzLDEzLDM0LDE0LDIxLDIyLDIzLDI0XSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjIiXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiUyI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMy40MTI2MTk3ODY5ODA1NDc3ZTMxODQ4MDYiLCJ0b3RhbCI6IjMuNDEyNjE5Nzg2OTgwNTQ3N2UzMTg0ODA2IiwiYmVzdCI6IjMuNDEyNjE5Nzg2OTgwNTQ3N2UzMTg0ODA2IiwicmVzZXRUaW1lIjo3ODc4LjMwNDU3NTM2MzA5MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMTIsMTMsMTQsMTUsMjEsMjIsMjMsMjRdLCJtaWxlc3RvbmVzIjpbIjAiLCIxIiwiMiJdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7IjExIjoxfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJDIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc4NzguMzA0NTc1MzYzMDkzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkciOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjguNzIwMDkyNjk4NDU0NDJlODU3NTY0IiwidG90YWwiOiI4LjcyMDA5MjY5ODQ1NDQyZTg1NzU2NCIsImJlc3QiOiI4LjcyMDA5MjY5ODQ1NDQyZTg1NzU2NCIsInJlc2V0VGltZSI6Nzg3OC4zMDQ1NzUzNjMwOTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzLDE0LDE1XSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjF9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkgiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjguMDY4OTcwMDIwMzQ5MDAxZTQwNTc2IiwidG90YWwiOiI4LjA2ODk3MDAyMDM0OTAwMWU0MDU3NiIsImJlc3QiOiI4LjA2ODk3MDAyMDM0OTAwMWU0MDU3NiIsInJlc2V0VGltZSI6Nzg3OC4zMDQ1NzUzNjMwOTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjB9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sIkwiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjIuMjIwODAxNjUyMzMyMDY0ZTQ5NDYiLCJ0b3RhbCI6IjIuMjIwODAxNjUyMzMyMDY0ZTQ5NDYiLCJiZXN0IjoiMi4yMjA4MDE2NTIzMzIwNjRlNDk0NiIsInJlc2V0VGltZSI6Nzg3OC4zMDQ1NzUzNjMwOTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzU1LDUyLDQ1LDQxLDQzLDQyLDUzLDUxLDU0LDQ0LDM1LDMxLDM0LDMyLDMzLDI1LDIxLDI0LDIyLDIzLDE1LDE0LDEyLDEzLDExXSwibWlsZXN0b25lcyI6WyIwIiwiMSIsIjMiLCIyIl0sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiIsImFjdGl2ZUNoYWxsZW5nZSI6bnVsbH0sImEiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjozMzk1MTUuNzExOTMzMTYzMSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7IjExIjoiIiwiMTIiOiIiLCIyMSI6IiIsIjIyIjoiIiwiMzEiOiIiLCIzMiI6IiIsIjQxIjoiIiwiNDIiOiIiLCI1MSI6IiIsIjUyIjoiIiwiNjEiOiIifSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6WyIxMSIsIjEyIiwiMTMiLCIxNCIsIjE1IiwiMTYiLCIyMSIsIjIyIiwiMjMiLCIyNCIsIjI1IiwiMjYiLCIzMSIsIjMyIiwiMzMiLCIzNCIsIjM1IiwiMzYiLCI0MSIsIjQyIiwiNDMiLCI0NCIsIjQ1IiwiNDYiLCI1MSIsIjUyIiwiNTMiLCI1NCIsIjU1IiwiNTYiLCI2MSIsIjYyIiwiNjMiLCI2NCIsIjY1IiwiNjYiLCI3MSIsIjcyIiwiNzMiLCI3NCIsIjc1IiwiNzYiLCI4MSIsIjgyIiwiODMiLCI4NCIsIjg1IiwiODYiLCI5MSIsIjkyIiwiOTMiLCI5NCIsIjk1IiwiOTYiLCIxMDEiLCIxMDIiLCIxMDMiLCIxMDQiLCIxMDUiLCIxMDYiLCIxMTEiLCIxMTIiLCIxMTMiLCIxMTQiLCIxMTUiLCIxMTYiXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImIiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Nzg3OC4zMDQ1NzUzNjMwOTMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiQiI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3ODc4LjMwNDU3NTM2MzA5MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJHZSI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjo3ODc4LjMwNDU3NTM2MzA5MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnsiMTEiOiIwIn0sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdiIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc4NzguMzA0NTc1MzYzMDkzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkdjIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIwIiwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjc4NzguMzA0NTc1MzYzMDkzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIkJvIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI3MDAwNzguMDU5MjkxMjcyOSIsInRvdGFsIjoiNzAwMTc4LjA1OTI5MTI3MjkiLCJiZXN0IjoiNzAwMDc4LjA1OTI5MTI3MjkiLCJyZXNldFRpbWUiOjMyMzc2Ni41OTg4Mzk0NDAyNywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTFdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIlBvIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxLjU4ODE2OTY5MjA0MzYwMWUyNjA4MTYzNyIsInRvdGFsIjoiMCIsImJlc3QiOiIxLjU4ODE2OTY5MjA0MzYwMWUyNjA4MTYzNyIsInJlc2V0VGltZSI6MzM5NTE1LjcxMTkzMzE2MzEsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7IjExIjoiNTAifSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6WzExLDEyLDEzXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJVVCI6eyJ1bmxvY2tlZCI6dHJ1ZSwicG9pbnRzIjoiNzg3ODMwNDUuNzUzNjMwODMiLCJ0b3RhbCI6Ijc4NzgzMDQ1Ljc1MzYzMDgzIiwiYmVzdCI6Ijc4NzgzMDQ1Ljc1MzYzMDgzIiwicmVzZXRUaW1lIjo3ODc4LjMwNDU3NTM2MzA5MywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbMTEsMjEsMjIsMzEsMzIsMjMsMTIsMTMsMjQsMTQsMjUsMTUsMjYsMTYsMzNdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiR0xBIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiI4Ljk5MzM5NDgwNzQ5NjM3NGU0NTMxIiwidG90YWwiOiI4Ljk5MzM5NDgwNzQ5NjM3NGU0NTMxIiwiYmVzdCI6IjguOTkzMzk0ODA3NDk2Mzc0ZTQ1MzEiLCJyZXNldFRpbWUiOjc4NzguMzA0NTc1MzYzMDkzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOlsxMSwxMiwxMywxNCwxNSwyMSwyMiwyMywyNCwyNSwzMSwzMiwzMywzNCwzNV0sIm1pbGVzdG9uZXMiOlsiMCJdLCJsYXN0TWlsZXN0b25lIjoiMCIsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnsiMTEiOjEsIjEyIjoxfSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJTQUMiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEwIiwiYmVhdGVuIjoiMCIsInRvdGFsIjoiMTAiLCJiZXN0IjoiMTAiLCJyZXNldFRpbWUiOjE2ODQ2OS4wNTgxNjc0NzAzLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6eyIxMSI6MSwiMTIiOjEsIjEzIjoxLCIxNCI6MSwiMTUiOjEsIjE2IjoxLCIxNyI6MSwiMTgiOjEsIjE5IjoxLCIyMSI6MX0sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiU0NIIjp7InVubG9ja2VkIjpmYWxzZSwicG9pbnRzIjoiMCIsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxMjU4Mi4zODkxMDQzOTA5MjMsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJzdHVkZW50cyI6IjAiLCJ0aG91Z2h0cyI6IjAifX0=")
	    },
	    style() {return{
                'background-color': tmp.SCH.color,
            }},
        },
    },
    achievements: {
        rows: 25,
        cols: 6,
        11: {
            name: "Double!",
            done() { return (hasUpgrade('p', 11)) },
            tooltip: "Get MJ Upgrade 11.",	   
        },
        12: {
            name: "MJ Boost!",
            done() { return (hasUpgrade('p', 12)) },
            tooltip: "Get MJ Upgrade 12.",	   
        },
        13: {
            name: "MJ boosts MJs!!",
            done() { return (hasUpgrade('p', 13)) },
            tooltip: "Get MJ Upgrade 13.",	   
        },
        14: {
            name: "Swarm of MJs",
            done() { return (hasUpgrade('p', 21)) },
            tooltip: "Get MJ Upgrade 21.",	   
        },
        15: {
            name: "The same as MJ upgrade 12 but nerfed",
            done() { return (hasUpgrade('p', 22)) },
            tooltip: "Get MJ Upgrade 22.",	   
        },
        16: {
            name: "About to reset",
            done() { return (hasUpgrade('p', 24)) },
            tooltip: "Get MJ Upgrade 24",	   
        },
        21: {
            name: "SUPER MJ!",
            done() { return player.S.points.gte(1) },
            tooltip: "Get a Super MJ Point. Reward: ×1.5 MJs",
        },
        22: {
            name: "MJs boost MJ Points",
            done() { return (hasUpgrade('S', 12)) },
            tooltip: "Get Super MJ Upgrade 12.",	   
        },
        23: {
            name: "Big MJ Point Boost",
            done() { return (hasUpgrade('S', 13)) },
            tooltip: "Get Super MJ Upgrade 13.",	   
        },
        24: {
            name: "That was a grind",
            done() { return (hasChallenge('S', 11)) },
            tooltip: "Beat the Super MJ Challenge. Reward: ×2 Super MJ Points",	   
        },
        25: {
            name: "EXPONENT!!!",
            done() { return (hasUpgrade('S', 14)) },
            tooltip: "Get Super MJ Upgrade 14.",	   
        },
	26: {
            name: "More grinding, great",
            done() { return (hasUpgrade('S', 15)) },
            tooltip: "Get Super MJ Upgrade 15.",	   
        },
        31: {
            name: "FINALLY!!",
            done() { return (hasUpgrade('S', 23)) },
            tooltip: "Get Super MJ Upgrade 23.",	   
        },
        32: {
            name: "Giga?",
            done() { return player.G.points.gte(1) },
            tooltip: "Reset for a Giga MJ Point.",	   
        }, 	   
        33: {
            name: "You need this!",
            done() { return (hasUpgrade('G', 12)) },
            tooltip: "Get Giga MJ Upgrade 12.",	   
        }, 	
        34: {
            name: "Layer boost",
            done() { return (hasUpgrade('G', 13)) },
            tooltip: "Get Giga MJ Upgrade 13.",	   
        }, 
        35: {
            name: "The challenge is done!",
            done() { return (hasChallenge('G', 11)) },
            tooltip: "Beat Exponential Downgrade. Reward: ×1.2 Giga MJ Points",	   
        }, 
        36: {
            name: "Hyper is coming!!",
            done() { return (hasUpgrade('G', 14)) },
            tooltip: "Get Giga MJ Upgrade 14.",	   
        }, 
        41: {
            name: "HYPER!!!",
            done() { return player.H.points.gte(1) },
            tooltip: "Get a Hyper MJ Point",	   
        }, 
        42: {
            name: "Challenge soon!",
            done() { return (hasUpgrade('H', 12)) },
            tooltip: "Get Hyper MJ Upgrade 12.",	   
        }, 
        43: {
            name: "Hyper is done!?",
            done() { return (hasChallenge('H', 11)) },
            tooltip: "Beat the Hyper MJ Challenge. Reward: ×1.1 Hyper MJ Points",	   
        }, 
        44: {
            name: "Clicker?",
            done() { return player.L.points.gte(1) },
            tooltip: "Get a MJ Click.",	   
        }, 
        45: {
            name: "Layer boost 2",
            done() { return (hasUpgrade('L', 13)) },
            tooltip: "Get MJ Click Upgrade 13.",	   
        }, 
        46: {
            name: "OP UPGRADE",
            done() { return (hasUpgrade('L', 15)) },
            tooltip: "Get MJ Click Upgrade 15.",	   
        }, 
        51: {
            name: "Passive Clicks",
            done() { return (hasUpgrade('L', 23)) },
            tooltip: "Get MJ Click Upgrade 23.",	   
        }, 
        52: {
            name: "More powers!",
            done() { return (hasUpgrade('L', 41)) },
            tooltip: "Get MJ Click Upgrade 41.",	   
        }, 
        53: {
            name: "Big power boost",
            done() { return (hasUpgrade('L', 42)) },
            tooltip: "Get MJ Click Upgrade 42.",	   
        }, 
        54: {
            name: "Super MJ Power Boost. Finally!!!",
            done() { return (hasUpgrade('L', 43)) },
            tooltip: "Get MJ Click Upgrade 43.",	   
        }, 
        55: {
            name: "MJ Click Power Boost",
            done() { return (hasUpgrade('L', 45)) },
            tooltip: "Get MJ Click Upgrade 45.",	   
        }, 
        56: {
            name: "The last upgrade in the click layer",
            done() { return (hasUpgrade('L', 55)) },
            tooltip: "Get MJ Click Upgrade 55.",	   
        }, 
        61: {
            name: "The ULTRA SCALER layer",
            done() { return (hasUpgrade('B', 11)) },
            tooltip: "Get Ultra Scaler Upgrade 11.",	   
        },
        62: {
            name: "MJ Click Swarm",
            done() { return (hasUpgrade('B', 12)) },
            tooltip: "Get Ultra Scaler Upgrade 12.",	   
        },
        63: {
            name: "The last upgrade in this layer",
            done() { return (hasUpgrade('B', 15)) },
            tooltip: "Get Ultra Scaler Upgrade 15.",	   
        },
        64: {
            name: "Generator MJs!",
            done() { return player.Ge.points.gte(1) },
            tooltip: "Get a Generator MJ. Reward: ×20 Hyper MJ Points",	
        },
        65: {
            name: "The grind of generator MJs",
            done() { return player.Ge.points.gte(10000) },
            tooltip: "Get 10000 Generator MJs",	   
        }, 
        66: {
            name: "The overpowered Hyper boost",
            done() { return (hasUpgrade('Ge', 23)) },
            tooltip: "Get Generatir MJ Upgrade 23",	   
        }, 
	71: {
            name: "The generator speed up",
            done() { return (hasUpgrade('Ge', 24)) },
            tooltip: "Get Generator MJ Upgrade 24",	   
        }, 
	72: {
            name: "1M Generator MJs!",
            done() { return player.Ge.points.gte(1000000) },
            tooltip: "Get 1000000 Generator MJs",	   
        }, 
	73: {
            name: "A long wait",
            done() { return player.Ge.points.gte(4e6) },
            tooltip: "Get 4e6 Generator MJs",	   
        }, 
	74: {
            name: "Almost there",
            done() { return player.Ge.points.gte(1.75e7) },
            tooltip: "Get 1.75e7 Generator MJs",	   
        }, 
	75: {
            name: "FINALLY!!!",
            done() { return (hasUpgrade('Ge', 26)) },
            tooltip: "Get Generator MJ Upgrade 26",	   
        }, 
	76: {
            name: "1e9 Generator MJs",
            done() { return player.Ge.points.gte(1e9) },
            tooltip: "Get 1e9 Generator MJs",	   
        }, 
        81: {
            name: "BUYABLE!",
            done() { return (hasUpgrade('Ge', 34)) },
            tooltip: "Get Generator MJ Upgrade 34",	   
        }, 
        82: {
            name: "Accelerators!",
            done() { return player.Gb.points.gte(1) },
            tooltip: "Get a Generator Accelerator",	   
        }, 
        83: {
            name: "More Generator MJs",
            done() { return (hasUpgrade('Gb', 11)) },
            tooltip: "Get Generator Accelerator Upgrade 11",	   
        }, 
        84: {
            name: "Stronger buyable",
            done() { return (hasUpgrade('Gb', 12)) },
            tooltip: "Get Generator Accelerator Upgrade 12",	   
        }, 
	85: {
            name: "New layer",
            done() { return (hasUpgrade('Gb', 13)) },
            tooltip: "Get Generator Accelerator Upgrade 13",	   
        }, 
        86: {
            name: "Raising Generator MJs more",
            done() { return player.Gc.points.gte(1) },
            tooltip: "Get a Generator Raiser",	   
        }, 
        91: {
            name: "Stronger raising boost",
            done() { return (hasUpgrade('Gc', 11)) },
            tooltip: "Get Generator Raiser Upgrade 11",	   
        }, 
        92: {
            name: "Let unlock a NEW LAYER!!",
            done() { return (hasUpgrade('Gc', 12)) },
            tooltip: "Get Generator Raiser Upgrade 12",	   
        }, 
        93: {
            name: "These feel like normal upgrades...",
            done() { return (hasUpgrade('UT', 11)) },
            tooltip: "Get Upgrade Tree Upgrade 11",	   
        },
	94: {
            name: "Oh this is the Upgrade Tree!",
            done() { return (hasUpgrade('UT', 21)) },
            tooltip: "Get Upgrade Tree Upgrade 21",	   
        },
        95: {
            name: "MJ Point Raise",
            done() { return (hasUpgrade('UT', 23)) },
            tooltip: "Get Upgrade Tree Upgrade 23",	   
        },
        96: {
            name: "Massive MJ Point boost",
            done() { return (hasUpgrade('UT', 14)) },
            tooltip: "Get Upgrade Tree Upgrade 14",	   
        },
        101: {
            name: "Extension!",
            done() { return (hasUpgrade('p', 31)) },
            tooltip: "Get MJ Point Upgrade 31",	   
        },
        102: {
            name: "UPGRADE TREE 2!",
            done() { return (hasUpgrade('p', 34)) },
            tooltip: "Get MJ Point Upgrade 34",	   
        },
        103: {
            name: "e23k",
            done() { return player.points.gte("e23000") },
            tooltip: "Get e23000 MJs",	   
        },
        104: {
            name: "e100k!",
            done() { return player.points.gte("e100000") },
            tooltip: "Get e100000 MJs",	   
        },
        105: {
            name: "e1M!!!",
            done() { return player.points.gte("e1000000") },
            tooltip: "Get e1000000 MJs",	   
        },
        106: {
            name: "e2M!!!!",
            done() { return player.points.gte("e2000000") },
            tooltip: "Get e2000000 MJs",	   
        },
        111: {
            name: "Cosmicless!",
            done() { return (hasChallenge('GLA', 11)) },
            tooltip: "Beat the Cosmicless Challenge",	   
        },
        112: {
            name: "Fixed MJs",
            done() { return (hasChallenge('GLA', 12)) },
            tooltip: "Beat the Broken MJs Challenge",	   
        },
        113: {
            name: "Sanas challenges?",
            done() { return (hasChallenge('SAC', 11)) },
            tooltip: "Beat Sanas Challenge 1",	   
        },
        113: {
            name: "Timewall",
            done() { return (hasChallenge('SAC', 12)) },
            tooltip: "Beat Sanas Challenge 2",	   
        },
        114: {
            name: "3 exponents",
            done() { return (hasChallenge('SAC', 15)) },
            tooltip: "Beat Sanas Challenge 5",	   
        },
        115: {
            name: "Galactical MJs are Useless",
            done() { return (hasChallenge('SAC', 16)) },
            tooltip: "Beat Sanas Challenge 6",	   
        },
        116: {
            name: "Timewall 2",
            done() { return (hasChallenge('SAC', 21)) },
            tooltip: "Beat Sanas Challenge 10",	   
        },
        121: {
            name: "All our progress...",
            done() { return player.SCH.points.gte(1) },
            tooltip: "Get a MJ School",	   
        },
        122: {
            name: "e100,000,000!",
            done() { return player.points.gte("ee8") },
            tooltip: "Get e100,000,000 MJs",	   
        },
        123: {
            name: "Double e!",
            done() { return player.points.gte("ee9") },
            tooltip: "Get e1.000e9 MJs",	   
        },
        124: {
            name: "Thoughts!",
            done() { return player.SCH.thoughts.gte("1") },
            tooltip: "Get 1 Thought.",	   
        },
        125: {
            name: "Thoughts are op!",
            done() { return player.points.gte("ee10") },
            tooltip: "Get e1.000e10 MJs",	   
        },
        126: {
            name: "(hardcapped)",
            done() { return player.points.gte("e2.000e10") },
            tooltip: "Get e2.000e10 MJs",	   
        },
    },
})

addLayer("b", {
    name: "Layer 1 Speeders",
    symbol: "SPE",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#6bb012",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Layer 1 Speeders", // Name of prestige currency
    baseResource: "MJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    autoPrestige() { return hasChallenge('H', 11) },
    resetsNothing() { return hasChallenge('H', 11) },
    canBuyMax() { return hasChallenge('H', 11) },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for Layer 1 Speeders", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('p', 14) || player.b.unlocked) visible = true
       return visible
     },
    branches:["p"],

    upgrades: {
        11: {
            title: "More MJs!",
            description: "Multiply MJ gain based on Layer 1 Speeders.",
            cost: new Decimal(1),
	    effect(){
                return player.b.points.add(1).pow(0.9)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
    },
})

addLayer("B", {
    name: "Ultra Scalers",
    symbol: "USC",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#570a0a",
    requires: new Decimal(1e38), // Can be a function that takes requirement increases into account
    resource: "Ultra Scalers", // Name of prestige currency
    baseResource: "Hyper MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.H.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.98, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    canReset() {return !hasUpgrade('SCH', 32)},
    hotkeys: [
        {key: "u", description: "U: Reset for Ultra Scalers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('L', 55) || player.B.unlocked) visible = true
       return visible
     },
    branches:["L", "H"],
    
    upgrades: {
        11: {
            title: "SUPER OP GENERATION AND INSANE HYPER BOOST!!",
            description: "Multiply Hyper MJ Point gain based on Ultra Scalers and get 1000% of MJ Point gain per second, 200% of Super MJ Points per second, 100% of Giga MJ Points per second, 50% of Hyper MJ Points per second and 20000% of MJ Click gain per second.",
            cost: new Decimal(1),
	    effect(){
                return player.B.points.add(1).pow(4)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        12: {
            title: "This boost will boost Hyper a lot!!",
            description: "MASSIVLEY boost MJ Click gain based on Ultra Scalers.",
            cost: new Decimal(4),
	    effect(){
                return player.B.points.add(1).pow(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        13: {
            title: "Hyper boosts Hyper",
            description: "Boost Hyper MJ Point gain based on Hyper MJs.",
            cost: new Decimal(6),
	    effect(){
                return player.H.points.add(1).pow(0.075)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	},
        15: {
            title: "MORE GIGA!!!!!",
            description: "Multiply Giga MJ Point gain based on Giga MJ Points. Also unlock a new layer",
            cost: new Decimal(9),
	    effect(){
                return player.G.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (!player.GLA.points.gte(1))}
	},
        14: {
            title: "Speed up",
            description: "×300 Hyper MJ Points.",
            cost: new Decimal(8),
	},
        16: {
            title: "Unlock something OP",
            description: "Unlock a upgrade in Generator layer and ×15 Generator MJs.",
            cost: new Decimal(12),
	},
	17: {
            title: "Generator Multi",
            description: "×20 Generator MJs",
            cost: new Decimal(13),
	},
    },
})

addLayer("Ge", {
    name: "Generator MJs",
    symbol: "GEN",
    position: 2,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#f542dd",
    requires: new Decimal(9), // Can be a function that takes requirement increases into account
    resource: "Generator MJs", // Name of prestige currency
    baseResource: "Ultra Scalers", // Name of resource prestige is based on
    baseAmount() {return player.B.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1e-6, // Prestige currency exponent
    passiveGeneration() {
	if (hasUpgrade('Ge', 31)) return 500
	if (hasMilestone('Ge', 1)) return 100
	if (hasUpgrade('Ge', 21)) return 30
	if (hasUpgrade('Ge', 17)) return 20
	if (hasUpgrade('Ge', 14)) return 10
	if (hasUpgrade('Ge', 13)) return 5
	if (hasUpgrade('Ge', 12)) return 2
	if (hasUpgrade('Ge', 11)) return 1
	return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	mult = mult.times(buyableEffect('Ge', 11))
	if (layers.Gb.effect().gte(1)) mult = mult.times(layers.Gb.effect())
	if (layers.Gc.effect().gte(1)) mult = mult.pow(layers.Gc.effect())
	if (hasMilestone('Ge', 0)) mult = mult.times(4)
        if (hasUpgrade('Ge', 15)) mult = mult.times(1.5)
	if (hasUpgrade('Ge', 16)) mult = mult.times(2)
	if (hasUpgrade('Ge', 22)) mult = mult.times(2)
	if (hasUpgrade('Ge', 24)) mult = mult.times(upgradeEffect('Ge', 24))
	if (hasUpgrade('Ge', 25)) mult = mult.times(10)
	if (hasUpgrade('Ge', 26)) mult = mult.times(2)
	if (hasUpgrade('Ge', 26)) mult = mult.times(upgradeEffect('Ge', 26))
	if (hasUpgrade('Ge', 27)) mult = mult.times(7.5)
	if (hasUpgrade('Ge', 31)) mult = mult.pow(1.02)
	if (hasUpgrade('B', 17)) mult = mult.times(20)
	if (hasUpgrade('Gb', 11)) mult = mult.times(10)
	if (hasUpgrade('UT', 32) && !inChallenge('GLA', 11)) mult = mult.times(1000)
	if (hasUpgrade('B', 16)) mult = mult.times(15)
	if (hasUpgrade('GLA', 11)) mult = mult.times(1000)
	if (inChallenge('GLA', 11)) mult = mult.pow(0.2)
	return mult
    },


    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row
    hotkeys: [
        {key: "e", description: "E: Get Generator MJs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        let visible = false
        if (hasUpgrade('B', 15) || player.Ge.unlocked) visible = true
       return visible
     },
    branches:["G"],
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Milestones": {
            content: [
                ["infobox", "blank"],
                "main-display",
                "blank",
                "blank",
                "milestones"
            ],
        },
	"Buyables": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "buyables"
            ],
        },
    },
    upgrades: {
        11: {
            title: "Start generating generator MJs",
            description: "Get 1 base Generator MJ per second if you have 9 Ultra Scalers",
            cost: new Decimal(1),
	},
        12: {
            title: "More generating MJs",
            description: "Now get 2 base Generator MJs per second",
            cost: new Decimal(10),
	    unlocked() { return (hasUpgrade('Ge', 11)) },
	},
        13: {
            title: "Even more generating MJs",
            description: "Now get 5 base Generator MJs per second!",
            cost: new Decimal(25),
	    unlocked() { return (hasUpgrade('Ge', 12)) },
	},
        14: {
            title: "10 per second?",
            description: "Get 10 base Generator MJs per second!",
            cost: new Decimal(100),
	    unlocked() { return (hasUpgrade('Ge', 13)) },
	},
        15: {
            title: "Generator Boost",
            description: "×1.5 Gernerator MJs",
            cost: new Decimal(1000),
	    unlocked() { return (hasUpgrade('Ge', 14)) },
	},
        16: {
            title: "More boosts",
            description: "×2 Generator MJs",
            cost: new Decimal(1750),
	    unlocked() { return (hasUpgrade('Ge', 15)) },
	},
        17: {
            title: "Increasing the base to 20",
            description: "Base gain is 20 per second",
            cost: new Decimal(4000),
	    unlocked() { return (hasUpgrade('Ge', 16)) },
	},
        21: {
            title: "Now 30 per second",
            description: "Get 30 base Generator MJ per second",
            cost: new Decimal(6000),
	    unlocked() { return (hasUpgrade('Ge', 17)) },
	},
        22: {
            title: "×2 Boost",
            description: "What the title says",
            cost: new Decimal(10000),
	    unlocked() { return (hasUpgrade('Ge', 21)) },
	},
        23: {
            title: "More Hyper",
            description: "Multiply Hyper MJ Point gain based on Generator MJs",
            cost: new Decimal(22500),
	    effect(){
                return player.Ge.points.add(1).pow(0.80)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('Ge', 22)) },
	},
        24: {
            title: "Generation Speed Up",
            description: "Multiply Generator MJs based on Generatir MJs.",
            cost: new Decimal(50000),
	    effect(){
                return player.Ge.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('Ge', 23)) },
	},
        25: {
            title: "😱😱😱",
            description: "×10 Generator MJs",
            cost: new Decimal(1e6),
	    unlocked() { return (hasUpgrade('Ge', 24)) },
	},
        26: {
            title: "😊😊😊",
            description: "×2 Generator MJs & Boost Generator MJ gain based on Generator MJs again -nerfed-",
            cost: new Decimal(2e7),
	    effect(){
                return player.Ge.points.add(1).pow(0.0750)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return (hasUpgrade('Ge', 25)) },
	},
        27: {
            title: "A boost but a nerf",
            description: "×7.5 Generator MJs but /10 Hyper MJ Points.",
            cost: new Decimal(3e8),
	    unlocked() { return (hasUpgrade('Ge', 26)) },
	},
        31: {
            title: "Speed up Generator MJs",
            description: "Base gain 500 per second.",
            cost: new Decimal(1e9),
	    unlocked() { return (hasUpgrade('Ge', 27)) },
	},
	32: {
            title: "Generator Power!",
            description: "^1.02 Generator MJs.",
            cost: new Decimal(4e9),
	    unlocked() { return (hasUpgrade('Ge', 31)) },
	},
        33: {
            title: "Revival",
            description: "×1000 Hyper MJ Points.",
            cost: new Decimal(6e9),
	    unlocked() { return (hasUpgrade('Ge', 32)) },
	},
        34: {
            title: "A BUYABLE!!!",
            description: "Unlock a buyable",
            cost: new Decimal(2e11),
	    unlocked() { return (hasUpgrade('Ge', 33)) },
	},
        35: {
            title: "The OP Upgrade",
            description: "×1e5 Hyper MJ Points and a new layer.",
            cost: new Decimal(1e12),
	    unlocked() { return (hasUpgrade('B', 16)) },
	},
    },
    milestones: {
        0: {
            requirementDescription: "250 Generator MJs",
            effectDescription: "×4 Generator MJs which boosts generation",
            done() { return player.Ge.points >= (250) }
        },
        1: {
            requirementDescription: "250K Generator MJs",
            effectDescription: "Base gain is increased to 100 per second",
            done() { return player.Ge.points >= (250000) }
        },
    },
    buyables: {
        11: {
        title: "Generator MJ Compounder",
        unlocked() { return (hasUpgrade('Ge', 34)) },
        cost(x) {
            let exp2 = 1.1
            if (inChallenge('GLA', 11)) exp2 = 2
	    return new Decimal(1e11).mul(Decimal.pow(1.2, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Generator MJs." + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Generator MJ gain by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player[this.layer].points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal (1)
            player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(1.5)
            let base2 = x
            if (hasUpgrade('Gb', 12)) base2 = x.mul(new Decimal(1.33))
	    if (hasUpgrade('Gc', 12)) base2 = x.mul(new Decimal(1.42))
	    let expo = new Decimal(1.001)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
},
infoboxes: {
        buyable: {
            title: "Generator MJ buyable",
            body() { return "This buyable can give BIG boosts to generator MJ gain and is important for the game!" },
        },
    }, 
})

addLayer("Gb", {
    name: "Generator Accelerators",
    symbol: "Ge⏩",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#00fbff",
    requires: new Decimal(4e14), // Can be a function that takes requirement increases into account
    resource: "Generator Accelerators", // Name of prestige currency
    baseResource: "Generator MJs", // Name of resource prestige is based on
    baseAmount() {return player.Ge.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.425, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row
    displayRow: 5,
    hotkeys: [
        {key: "o", description: "O: Get Generator Accelerators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('Ge', 35) || player.Gb.unlocked) visible = true
       return visible
     },
    branches:["B"],
    
    upgrades: {
        11: {
            title: "Stronger boost",
            description: "Improve the Generator Accelerator effect to ^2.2 instead of ^2 and ×10 Generator MJs.",
            cost: new Decimal(3),
	},
        12: {
            title: "Buyable improving",
            description: "Improve Generator MJ Compounder effect.",
            cost: new Decimal(4),
	},
        13: {
            title: "It's time to raise generator MJs MORE!",
            description: "Unlock a new layer.",
            cost: new Decimal(5),
	},
    },
    effect(){
    let enpow = 2
    if (hasUpgrade('Gb', 11)) enpow = 2.2
	let eff = player.Gb.points.add(1).pow(enpow)
       return eff
       },
        effectDescription() {
            let desc = "which is boosting Generator MJs by x" + format(tmp[this.layer].effect);
            return desc;
        },
})

addLayer("Gc", {
    name: "Generator Raisers",
    symbol: "Ge^",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#0f6a94",
    requires: new Decimal(7e22), // Can be a function that takes requirement increases into account
    resource: "Generator Raisers", // Name of prestige currency
    baseResource: "Generator MJs", // Name of resource prestige is based on
    baseAmount() {return player.Ge.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.46, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row
    displayRow: 5,
    hotkeys: [
        {key: "r", description: "R: Get Generator Raisers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('Gb', 13) || player.Gc.unlocked) visible = true
       return visible
     },
    branches:["Ge"],
    
    upgrades: {
        11: {
            title: "Stronger raising",
            description: "Improve the Generator Raiser effect to ^0.029",
            cost: new Decimal(2),
	},
        12: {
            title: "Buyable improving 2",
            description: "Improve Generator MJ Compounder effect again and unlock a new layer.",
            cost: new Decimal(3),
	},
    },
    effect(){
    let rapow = 0.025
    if (hasUpgrade('Gc', 11)) rapow = 0.029
	let eff = player.Gc.points.add(1).pow(rapow)
       return eff
       },
        effectDescription() {
            let desc = "which is raising Generator MJs by ^" + format(tmp[this.layer].effect);
            return desc;
        },
})
addLayer("Bo", {
    name: "MJ Boosters",
    symbol: "×",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#a0a0a0",
    requires() {
        let req = new Decimal("e308")
        if (player.Bo.points.gte(700000)) req = req.add("ee100")
        return req
    }, // Ca// Can be a function that takes requirement increases into account
    resource: "MJ Boosters", // Name of prestige currency
    baseResource: "MJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.000025, // Prestige currency exponent
    passiveGeneration() {
           if (player.Bo.points.gte(700000)) return 0 
	if (hasUpgrade('Bo', 11)) return 5
        return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('UT', 21) && !inChallenge('GLA', 11)) mult = mult.times(2)
	if (hasUpgrade('UT', 25) && !inChallenge('GLA', 11)) mult = mult.times(50)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row, side is the side
    hotkeys: [
        {key: "J", description: "J: Get MJ Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasChallenge('H', 11) || player.Bo.unlocked) visible = true
       return visible
     },
    effect(){
    let raipow = 100
	let eff = player.Bo.points.add(1).pow(raipow)
       return eff
       },
        effectDescription() {
            let desc = "which is boosting MJs by x" + format(tmp[this.layer].effect);
            return desc;
        },
    upgrades: {  
	11: {
            title: "Passive gain",
            description: "Gain 5 base MJ Boosters per second unless you have 700000 MJ Boosters",
            cost: new Decimal(100),
	},
    },
})
addLayer("Po", {
    name: "MJs",
    symbol: "P",
    position: 2,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffffff",
    requires: new Decimal(4e17), // Can be a function that takes requirement increases into account
    resource: "MJs", // Name of prestige currency
    baseResource: "Giga MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.G.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.045, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row.
    canReset: false,
    layerShown(){
        let visible = false
        if (hasChallenge('H', 11) || player.Po.unlocked) visible = true
       return visible
     },
    tabFormat: {
        "Main tab": {
            content: [
                "main-display",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "blank",
                "upgrades"
            ],
        },
        "Buyables": {
            content: [
                ["infobox", "buyable"],
                "main-display",
                "blank",
                "blank",
                "buyables"
            ],
        },
    },
    automate() {
	player.Po.points = player.points
    },
    upgrades: {  
	11: {
            title: "MJ layer!",
            description: "×100 MJ gain",
            cost: new Decimal(1e30),
	    unlocked() { return (hasChallenge('H', 11)) },
	},
        12: {
            title: "Raising boost",
            description: "^1.02 MJs",
            cost: new Decimal(1e100),
	    unlocked() { return (hasUpgrade('Po', 11)) },
	},
        13: {
            title: "Buyable fun",
            description: "Unlock a buyable.",
            cost: new Decimal(1e200),
	    unlocked() { return (hasUpgrade('Po', 12)) },
	},
    },
    buyables: {
        11: {
        title: "MJ Booster",
        unlocked() { return (hasUpgrade('Po', 13)) },
        cost(x) {
            let exp2 = 1.4
            return new Decimal(1e300).mul(Decimal.pow(1.2, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " MJs." + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost MJ gain by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player[this.layer].points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal (1)
            player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(1e5)
            let base2 = x
	    let expo = new Decimal(1.001)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
},
})

addLayer("UT", {
    name: "Upgrade Points",
    symbol: "UT",
    position: 4,
    doReset(UT) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[UT].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('GLA', 15)) keep.push("upgrades");
	if (hasUpgrade('SCH', 32)) keep.push("upgrades");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#765dba",
    requires: new Decimal(2e95), // Can be a function that takes requirement increases into account
    resource: "Upgrade Points", // Name of prestige currency
    baseResource: "Hyper MJ Points", // Name of resource prestige is based on
    baseAmount() {return player.H.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2.475, // Prestige currency exponent
    passiveGeneration() {
	if (hasUpgrade('GLA', 11)) return 10000
	if (hasUpgrade('UT', 15)) return 100
	if (hasUpgrade('UT', 12)) return 2
	if (hasUpgrade('UT', 31)) return 1
	return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row
    displayRow: 5,
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Upgrade Tree")
    }, 
    hotkeys: [
        {key: "t", description: "T: Get Upgrade Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (hasUpgrade('Gc', 12) || player.UT.unlocked) visible = true
       return visible
     },
    branches:["G"],
    tabFormat: {
        "Upgrade Tree 1": {
            content: [
                ["display-text", "Welcome to the Upgrade Tree! In this layer, there is going to be a upgrade tree to boost the production of layers!"],
                "main-display",
                "prestige-button",
                "blank",
				["upgrade-tree", [[11, 12, 13, 14], [21, 22, 23, 24, 25], [31, 32]]]
            ]
        },
        "Upgrade Tree 2": {
          unlocked() { return (hasUpgrade('p', 34)) },
	    content: [
                ["display-text", "Here is the second upgrade tree! There are more upgrades here!"],
                "main-display",
                "prestige-button",
                "blank",
				["upgrade-tree", [[15, 16], [26], [33]]]
            ]
        },
    },
    upgrades: {
        11: {
            title: "Upgrade tree!",
            description: "×1e10 MJ gain",
            cost: new Decimal(1),
        },
        21: {
            title: "Yes!",
            description: "×2 MJ Booster gain",
            cost: new Decimal(2),
	    branches: [11, 22],
	    unlocked() { return (hasUpgrade('UT', 11)) },
	},
        22: {
            title: "Power",
            description: "^1.01 MJ gain and ×10 Hyper MJ gain",
            cost: new Decimal(3),
	    branches: [31],
	    unlocked() { return (hasUpgrade('UT', 11)) },
	},
        31: {
            title: "MJ World",
            description: "×1e100 MJ gain and gain 1 upgrade point every second!",
            cost: new Decimal(4),
	    branches: [32],
	    unlocked() { return (hasUpgrade('UT', 22)) },
	},
        32: {
            title: "Boosting",
            description: "×1e3 Generator MJ gain",
            cost: new Decimal(30),
	    branches: [23],
	    unlocked() { return (hasUpgrade('UT', 31)) },
	},
        23: {
            title: "The MJ Swarm has returned",
            description: "^1.01 MJ Point gain",
            cost: new Decimal(45),
	    branches: [12],
	    unlocked() { return (hasUpgrade('UT', 32)) },
	},
        12: {
            title: "More generation",
            description: "×2 Upgrade Point generation (WON'T WORK IF YOU HAVE GALACTICAL MJ UPGRADE 11)",
            cost: new Decimal(60),
	    branches: [13],
	    unlocked() { return (hasUpgrade('UT', 23)) },
	},
        13: {
            title: "More MJ Worlds",
            description: "×e200 MJ gain",
            cost: new Decimal(130),
	    branches: [24],
	    unlocked() { return (hasUpgrade('UT', 12)) },
	},
        24: {
            title: "Time to raise",
            description: "^1.02 MJ gain.",
            cost: new Decimal(140),
	    unlocked() { return (hasUpgrade('UT', 13)) },
	    branches: [14],
	}, 
        14: {
            title: "Massive Boost!",
            description: "×e300 MJ Point gain!.",
            cost: new Decimal(150),
	    branches: [25],
	    unlocked() { return (hasUpgrade('UT', 24)) },
	},
        25: {
            title: "Extension!",
            description: "Unlock more MJ upgrades! And ×50 MJ Boosters",
            cost: new Decimal(155),
	    unlocked() { return (hasUpgrade('UT', 14)) },
	},
        15: {
            title: "More generation!!",
            description: "×50 upgrade point generation (WON'T WORK IF YOU HAVE GALACTICAL MJ UPGRADE 11)",
            cost: new Decimal(1000),
	    branches: [26],
	    unlocked() { return (hasUpgrade('p', 34)) },
	},
        26: {
            title: "Boost!!",
            description: "×e150 MJ gain",
            cost: new Decimal(15000),
	    branches: [16],
	    unlocked() { return (hasUpgrade('UT', 15)) },
	},
        16: {
            title: "Growing Booster!",
            description: "Multiply MJ point gain based on MJ points!",
            cost: new Decimal(1.6e4),
	    effect(){
                return player.p.points.add(1).pow(0.014)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            branches: [33],
	    unlocked() { return (hasUpgrade('UT', 26)) },
	},
        33: {
            title: "Biggest MJ boost yet",
            description: "×e300 MJ gain.",
            cost: new Decimal(17500),
	    unlocked() { return (hasUpgrade('UT', 16)) },
	},
    },
})

addLayer("GLA", {
    name: "Galactical MJs",
    symbol: "G",
    position: 0,
    doReset(GLA) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[GLA].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('SCH', 32)) keep.push("upgrades");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    nodeStyle() {return {
        "background": "radial-gradient(#791ceb, #300c5c)",
        "width": "150px",
        "height": "150px",
    }
},
componentStyles: {
    "prestige-button"() {return { "background": "radial-gradient(#791ceb, #300c5c)",
        "width": "200px",
        "height": "150px",
    }},
},
    color: "#310b5e",
    passiveGeneration() {
        if (hasUpgrade('SCH', 34)) return 1
	return 0
    },
    requires: new Decimal("e23010"), // Can be a function that takes requirement increases into account
    resource: "Galactical MJs", // Name of prestige currency
    baseResource: "MJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.0001, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('GLA', 25)) mult = mult.times(1e10)
	if (hasUpgrade('GLA', 31)) mult = mult.times(1e15)
	if (hasChallenge('SAC', 12)) mult = mult.times(1e50)
	if (hasChallenge('SAC', 13)) mult = mult.times(1e175)
	if (hasChallenge('SAC', 14)) mult = mult.times(1e200)
	if (hasChallenge('SAC', 15)) mult = mult.times(1e225)
	if (hasChallenge('SAC', 16)) mult = mult.times(1e250)
	if (hasChallenge('SAC', 19)) mult = mult.times("e1000")
	if (hasUpgrade('SCH', 11)) mult = mult.times(100)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    displayRow: 6,
    hotkeys: [
        {key: "l", description: "L: Reset for Galactical MJs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (player.points.gte("e23010") || player.GLA.unlocked) visible = true
       return visible
},
    branches:["Gb", "Gc", "UT"],
    upgrades: {
        11: {
            title: "BOOST",
            description: "That reset reseted almost everything. Let me give some boosts to you, ×1e1000 MJs, ×2 MJ Clicks, keep Hyper MJ Upgrades and Challenges, ×1000 Generator MJs and get 10000 Upgrade Points per second!",
            cost: new Decimal(1),
        },
        12: {
            title: "We need more MJs!",
            description: "×e1500 MJs",
            cost: new Decimal(4),
	    unlocked() { return (hasUpgrade('GLA', 11)) },
	},
        13: {
            title: "WE NEED MORE!!!",
            description: "Multiply MJ gain based on Galactical MJs",
            cost: new Decimal(10),
	    effect(){
                return player.GLA.points.add(1).pow(1500)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
	    unlocked() { return (hasUpgrade('GLA', 12)) },
	}, 
        14: {
            title: "EVEN MORE",
            description: "^1.1 MJs",
            cost: new Decimal(45),
	    unlocked() { return (hasUpgrade('GLA', 13)) },
	},
        15: {
            title: "We need more keeping!",
            description: "Keep MJ Click upgrades and Upgrade Tree upgrades!",
            cost: new Decimal(1e9),
	    unlocked() { return (hasUpgrade('GLA', 14)) },
	},
        21: {
            title: "More keeping!",
            description: "Keep Super MJ Milestones.",
            cost: new Decimal(2e13),
	    unlocked() { return (hasUpgrade('GLA', 15)) },
	},
        22: {
            title: "MORE!!!!!",
            description: "×e10000 MJs and keep MJ Click milestones.",
            cost: new Decimal(5e13),
	    unlocked() { return (hasUpgrade('GLA', 21)) },
	},
        23: {
            title: "EVEN MORE!!!!!",
            description: "×e10000 MJs again",
            cost: new Decimal(3e34),
	    unlocked() { return (hasUpgrade('GLA', 22)) },
	},
        24: {
            title: "EVEN MORE!!!!!!!!!!!!",
            description: "×e25000 MJs",
            cost: new Decimal(3e122),
	    unlocked() { return (hasUpgrade('GLA', 23)) },
	},
        25: {
            title: "End of v2.0.0",
            description: "×e10 Galactical MJs",
            cost: new Decimal(3e174),
	    unlocked() { return (hasUpgrade('GLA', 24)) },
	},
        31: {
            title: "😃",
            description: "×e15 Galactical MJs",
            cost: new Decimal(1e223),
	    unlocked() { return (hasChallenge('GLA', 11)) },
	},
        32: {
            title: "Prepare for Broken MJs Challenge 1",
            description: "×e20000 MJs",
            cost: new Decimal(1e289),
	    unlocked() { return (hasUpgrade('GLA', 31)) },
	},
        33: {
            title: "Prepare for Broken MJs Challenge 2",
            description: "×e25000 MJs",
            cost: new Decimal("e330"),
	    unlocked() { return (hasUpgrade('GLA', 32)) },
	},
        34: {
            title: "Prepare for Broken MJs Challenge 3",
            description: "×e15000 MJs (before all exponents)",
            cost: new Decimal("e383"),
	    unlocked() { return (hasUpgrade('GLA', 33)) },
	},
        35: {
            title: "Prepare for Broken MJs Challenge final",
            description: "×e50000 MJs",
            cost: new Decimal("e422"),
	    unlocked() { return (hasUpgrade('GLA', 34)) },
	},
    },
    milestones: {
        0: {
            requirementDescription: "1e55 Galactical MJs",
            effectDescription: "Multiply MJ gain by 1e10000.",
            done() { return player.GLA.points >= (1e55) },
        },
    },
    challenges: {
        11: {
            name: "Cosmicless Challenge",
            challengeDescription: "Every MJ Click and Upgrade Tree upgrades is disabled, Every layer ^0.2 except this layer and buyables scale a lot faster except MJ Booster.",
            canComplete: function() {return player.points.gte("e982000")},
            goalDescription: "Get e982000 MJs.",
            rewardDescription: "Unlock more Galactic MJ Upgrades"
        },
        12: {
            name: "Broken MJs",
            challengeDescription: "^0.01 MJs",
            canComplete: function() {return player.points.gte("e10805")},
            goalDescription: "Get e10805 MJs.",
            rewardDescription: "Beat v2.1.0",
            unlocked() { return (hasChallenge('GLA', 11)) },
	},
    },
})

addLayer("SAC", {
    name: "Sanas Challenges",
    symbol: "Sa",
    position: 1,
    doReset(SAC) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[SAC].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
	if (hasUpgrade('SCH', 32)) keep.push("challenges");
    
        // Stage 4, do the actual data resetautomate() {
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
                beaten: new Decimal(0),
    }},
    nodeStyle() {return {
        "background": "radial-gradient(#791ceb, #300c5c)",
        "width": "125px",
        "height": "125px",
    }
},
componentStyles: {
    "prestige-button"() {return { "background": "radial-gradient(#791ceb, #300c5c)",
        "width": "150px",
        "height": "150px",
    }},
},
    color: "#310b5e",
    requires: new Decimal("e5066885"), // Can be a function that takes requirement increases into account
    resource: "Unlocked Sanas Challenges", // Name of prestige currency
    baseResource: "MJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 8, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	return mult
    },



    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    displayRow: 6,
    hotkeys: [
        {key: "n", description: "N: Reset for unlocked challenges", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        let visible = false
        if (player.points.gte("e5066884") || player.SAC.unlocked) visible = true
       return visible
},
    branches:["Gb", "Gc", "UT"],
    tabFormat: {
        "Sanas Challenges": {
            content: [
                ["display-text", "Welcome to Sanas Challenges! These challenges are hard and give big boosts"],
                "main-display",
		"prestige-button",
                "blank",
                "challenges"
	    ]
        },
    },
    challenges: {
        11: {
            name: "Sanas Challenge 1",
            challengeDescription: "MJs and MJ Points ^0.005.",
            canComplete: function() {return player.points.gte("e5361")},
            goalDescription: "Get e5361 MJs.",
            rewardDescription: "^1.05 MJs",
            unlocked() { return (player.SAC.points.gte(1)) },
	},
        12: {
            name: "Sanas Challenge 2",
            challengeDescription: "MJs ^0.00001.",
            canComplete: function() {return player.points.gte(5e25)},
            goalDescription: "Get 5e25 MJs.",
            rewardDescription: "×1e50 Galactial MJs",
            unlocked() { return (player.SAC.points.gte(2)) },
	},
        13: {
            name: "Sanas Challenge 3",
            challengeDescription: "MJ Point upgrade 12 and 13 is useless.",
            canComplete: function() {return player.points.gte("e4591000")},
            goalDescription: "Get e4591000 MJs.",
            rewardDescription: "×1e175 Galactial MJs",
            unlocked() { return (player.SAC.points.gte(3)) },
	},
        14: {
            name: "Sanas Challenge 4",
            challengeDescription: "^^0.9 MJs",
            canComplete: function() {return player.points.gte("e10370000")},
            goalDescription: "Get e10370000 MJs.",
            rewardDescription: "×1e200 Galactial MJs",
            unlocked() { return (player.SAC.points.gte(4)) },
	},
        15: {
            name: "Sanas Challenge 5",
            challengeDescription: "^0.0001 MJs, MJ Points, Super MJ Points.",
            canComplete: function() {return player.points.gte("e347")},
            goalDescription: "Get e347 MJs.",
            rewardDescription: "×1e225 Galactial MJs",
            unlocked() { return (player.SAC.points.gte(5)) },
	},
        16: {
            name: "Sanas Challenge 6",
            challengeDescription: "Galactical MJ Upgrade 13, 14 and Sanas Challenge 1 reward is disabled.",
            canComplete: function() {return player.points.gte("e689400")},
            goalDescription: "Get e689400 MJs.",
            rewardDescription: "×1e250 Galactial MJs",
            unlocked() { return (player.SAC.points.gte(6)) },
	},
        17: {
	    name: "Sanas Challenge 7",
            challengeDescription: "^0.0987654321 MJs (random amount)",
            canComplete: function() {return player.points.gte("e502135")},
            goalDescription: "Get e502135 MJs.",
            rewardDescription: "^1.02 MJs",
            unlocked() { return (player.SAC.points.gte(7)) },
	},
        18: {
            name: "Sanas Challenge 8",
            challengeDescription: "^^0.25 MJs",
            canComplete: function() {return player.points.gte("e1562324")},
            goalDescription: "Get e1562324 MJs.",
            rewardDescription: "^1.05 MJs",
            unlocked() { return (player.SAC.points.gte(8)) },
	},
        19: {
            name: "Sanas Challenge 9",
            challengeDescription: "You're stuck in Sanas challenge 1, 3, 4 and 6.",
            canComplete: function() {return player.points.gte("2e968")},
            goalDescription: "Get 2e968 MJs.",
            rewardDescription: "×1e1000 Galactical MJs",
            unlocked() { return (player.SAC.points.gte(9)) },
	},
        21: {
            name: "Sanas Challenge 10",
            challengeDescription: "MJ gain is stuck at 1",
            canComplete: function() {return player.points.gte("300")},
            goalDescription: "Wait 5 minutes.",
            rewardDescription: "Beat v2.2.0",
            unlocked() { return (player.SAC.points.gte(10) && hasChallenge('SAC', 19)) },
	},
    },
})
