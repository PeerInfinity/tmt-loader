addLayer("ES2", {
    name: "Ethereal Sticks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ES", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return true},
        points: new Decimal(0),
        pps: new Decimal(0)
    }},
    color: "#3f2399",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "ethereal sticks", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
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
    row: "-10", // Row the layer is in on the tree (0 is the first row)
    create() {
    	if (hasUpgrade("ES2", 11) && inArea("statica")) {
    	    let mult = new Decimal(1)
            if (hasUpgrade("ES2", 12)) mult = mult.times(5)
            if (hasUpgrade("ES2", 13)) mult = mult.times(upgradeEffect("ES2", 13))
            if (hasUpgrade("ES2", 14)) mult = mult.times(3)
            if (getBuyableAmount("ES2", 11).gte(1)) mult = mult.times(buyableEffect("ES2", 11))
            if (hasUpgrade("ES2", 11) && hasUpgrade("ES2", 21) ) mult = mult.times(upgradeEffect("ES2", 11))
            if (hasUpgrade("ES2", 22)) mult = mult.times(4)
            if (hasUpgrade("ES2", 24)) mult = mult.times(100)
            if (hasUpgrade("M2", 13)) mult = mult.pow(1.5)
            if (hasUpgrade("M2", 14)) mult = mult.times(upgradeEffect("M2", 14))
            if (hasUpgrade("ES2", 31)) mult = mult.times(upgradeEffect("ES2", 31))
            if (hasUpgrade("ES2", 33)) mult = mult.times(upgradeEffect("ES2", 33))
            if (hasUpgrade("ES2", 34)) mult = mult.times(upgradeEffect("ES2", 34))
            player.ES2.pps = mult
            player.ES2.points = player.ES2.points.plus(mult.div(30))
        }
    },
    upgrades: {
    	11: {
    	    title: "Imaginary",
            description() {
            	if(hasUpgrade("ES2", 21)) {
            	    return "Start to gain ethereal sticks, and boost ethereal sticks by the square root of Discovery's effect."
                } else {
                    return "Start to gain ethereal sticks"
                }
            },
            tooltip() {
            	if(hasUpgrade("ES2", 21)) {
            	    return "sqrt(x)"
                } else {
                    return ""
                }
            },
            effect() { return upgradeEffect("ES2", 13).sqrt() },
            effectDisplay() {
            	if(hasUpgrade("ES2", 21)) {
            	    return format(upgradeEffect("ES2", 11))+"x"
                } else {
                    return "+1"
                }
            },
            cost: new Decimal(0)
        },
        12: {
    	    title: "Inspecting",
            description: "Boost ethereal sticks by 5",
            cost: new Decimal(10)
        },
        13: {
    	    title: "Discovery",
            description: "Boost ethereal sticks depending on how many upgrades you bought.",
            cost: new Decimal(60),
            unlocked() {return hasUpgrade("ES2", 12)},
            tooltip: "2^x",
            effect() { 
            	if(hasUpgrade("M2", 16)) {
            	    return new Decimal(2).pow(upgradeLength("ES2")).times(4)
                } else {
                    return new Decimal(2).pow(upgradeLength("ES2")) 
                }
            },
            effectDisplay() { return format(upgradeEffect("ES2", 13))+"x" }
        },
        14: {
    	    title: "Researching",
            description: "Triple ethereal stick gain and unlock a new buyable",
            cost: new Decimal(600),
            unlocked() {return hasUpgrade("ES2", 13)}
        },
        21: {
    	    title: "It's real!",
            description: "Imaginary upgrade now also has an effect",
            cost: new Decimal(5000),
            unlocked() {return hasUpgrade("ES2", 14) && getBuyableAmount("ES2", 11).gte(1)}
        },
        22: {
    	    title: "It's real?",
            description: "Quadruple ethereal stick gain, but Content doesn't reset this upgrade, and the first 3 upgrades.",
            cost: new Decimal(100000),
            unlocked() {return hasUpgrade("ES2", 21) && getBuyableAmount("ES2", 11).gte(2)}
        },
        23: {
    	    title: "EtherRealReal",
            description: "Double Content's effects to ethereal sticks.",
            cost: new Decimal(2e6),
            unlocked() {return hasUpgrade("ES2", 21) && hasUpgrade("ES2", 22) && getBuyableAmount("ES2", 11).gte(3)}
        },
        24: {
        	title: "Statically",
            description: "Multiply ethereal sticks by a hundred",
            cost: new Decimal("1.5e7"),
            unlocked() {return hasUpgrade("ES2", 23) && getBuyableAmount("ES2", 11).gte(4)}
        },
        31: {
        	title: "Monostickium",
            description: "Multiply ethereal sticks depending on your monoium",
            cost: new Decimal("7e14"),
            unlocked() {return hasUpgrade("ES2", 24) && getBuyableAmount("ES2", 11).gte(5)},
            tooltip: "(x+2)/2",
            effect() { return player.M2.points.plus(2).div(2).plus(1) },
            effectDisplay() { return format(upgradeEffect("ES2", 31))+"x" }
        },
        32: {
        	title: "Contented",
            description: "Boost Content's effects based on Discovery's effect",
            cost: new Decimal("1e16"),
            unlocked() {return hasUpgrade("ES2", 31) && getBuyableAmount("ES2", 11).gte(6)},
            tooltip: "log10(x)^0.85",
            effect() { return upgradeEffect("ES2", 13).log10().pow(0.85) },
            effectDisplay() { return format(upgradeEffect("ES2", 32))+"x" }
        },
        33: {
        	title: "Wooden Interferance",
            description: "Multiply ethereal sticks depending on refined wood",
            cost: new Decimal("5e18"),
            unlocked() {return hasUpgrade("ES2", 32) && getBuyableAmount("ES2", 11).gte(7)},
            tooltip: "log10(sqrt(x/2)+1)",
            effect() { return player.W.refinedwood.div(2).sqrt().plus(1).log10().plus(1) },
            effectDisplay() { return format(upgradeEffect("ES2", 33))+"x" }
        },
        34: {
        	title: "Imported",
            description: "Multiply ethereal sticks depending on difficult sticks",
            cost: new Decimal("4e20"),
            unlocked() {return hasUpgrade("ES2", 33) && getBuyableAmount("ES2", 11).gte(8)},
            tooltip: "(x^2)*2+1",
            effect() { return player.DS3.points.pow(2).times(2).plus(1) },
            effectDisplay() { return format(upgradeEffect("ES2", 34))+"x" }
        },
    },
    buyables: {
        11: {
            cost(x) { 
            	let stop = 0
                let max = 4
                if(hasUpgrade("M2", 12)) max = 6
                if(hasUpgrade("M2", 18)) max = 8
                if(x.gte(max)) stop = 100
                return new Decimal(4).plus(x).plus(stop)
            },
            title: "Content",
            display() { return "Reset all your ethereal stick upgrades and ethereal sticks, to double ethereal stick gain by 2 (not compounding) and unlock new upgrades. Cost: "+format(this.cost())+" upgrades<br />Currently: "+format(buyableEffect("ES2", 11))+"x"},
            canAfford() { return new Decimal(upgradeLength("ES2")).gte(this.cost()) },
            buy() {
            	let keep = []
                if(hasUpgrade("ES2", 22)) {
                    keep.push(11, 12, 13, 22)
                }
                if(hasUpgrade("M2", 15)) {
                	if (!keep.includes(11)) keep.push(11)
                    if (!keep.includes(12)) keep.push(12)
                    if (!keep.includes(13)) keep.push(13)
                    if (!keep.includes(14)) keep.push(14)
                }
                player.ES2.upgrades = keep
                player.ES2.points = new Decimal(0)
                player.ES2.pps = new Decimal(0)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { 
            	let mult = new Decimal(1)
                if (hasUpgrade("ES2", 23)) mult = mult.times(2)
                if (hasUpgrade("ES2", 32)) mult = mult.times(upgradeEffect("ES2", 32))
                return x.mul(2).mul(mult)
            },
            unlocked() { return hasUpgrade("ES2",  14) }
        },
    },
    place() {
    	if(hasUpgrade("M2", 11)) {
    	    buyUpgrade("ES2", 11)
            buyUpgrade("ES2", 12)
            buyUpgrade("ES2", 13)
            buyUpgrade("ES2", 14)
            buyUpgrade("ES2", 21)
            buyUpgrade("ES2", 22)
            buyUpgrade("ES2", 23)
            buyUpgrade("ES2", 24)
        }
    },
    layerShown() { return inArea("statica")},
    isActive() {return tmp[this.layer].layerShown},
    branches: ["M2"],
    tabFormat: [
    	["row", [
      	  "main-display",
      	  ["display-image", "resources/etherealstickicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
        ]],
        "resource-display",
        ["display-text", function() { return "You are making "+format(player.ES2.pps)+" ethereal sticks per second." }],
        "upgrades",
        "buyables"
    ]
}),
addLayer("M2", {
    name: "Monoium", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    canBuyMax() {return hasUpgrade("M2", 17)},
    color: "#8f8f8f",
    requires: new Decimal("1e10"), // Can be a function that takes requirement increases into account
    resource: "monoium", // Name of prestige currency
    baseResource: "ethereal sticks", // Name of resource prestige is based on
    baseAmount() {return player.ES2.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    onPrestige(gain) {
    	player.ES2.points = new Decimal(0)
        let keep = []
        if(hasUpgrade("M2", 15)) {
            if (!keep.includes(11)) keep.push(11)
            if (!keep.includes(12)) keep.push(12)
            if (!keep.includes(13)) keep.push(13)
            if (!keep.includes(14)) keep.push(14)
        }
        player.ES2.upgrades = keep
        setBuyableAmount("ES2", 11, new Decimal(0))
    },
    microtabs: {
    	stuff: {
    	    "Automation Upgrades": {
    	        content: [
                    ["row",[["upgrade", 11], ["upgrade", 15], ["upgrade", 17]]]
                ]
            },
            "Progression Upgrades": {
    	        content: [
                    ["row",[["upgrade", 12], ["upgrade", 18], ["upgrade", 19]]]
                ]
            },
            "Speed Upgrades": {
    	        content: [
                    ["row",[["upgrade", 13], ["upgrade", 14], ["upgrade", 16]]]
                ]
            },
        }
    },
    componentStyles: {
        "upgrade"() { return {'transform': 'scale3d(var(--m2anim), var(--m2anim), 1)'} },
    },
    upgrades: {
    	// Automation Upgrades
    	11: {
    	    title: "Mechanical",
            description: "Auto-buy the first 8 ethereal stick upgrades",
            cost: new Decimal(1)
        },
        15: {
    	    title: "Industry",
            description: "Keep the first 4 ethereal stick upgrades",
            cost: new Decimal(3)
        },
        17: {
    	    title: "Mining Operation",
            description: "Be able to buy max monoium",
            cost: new Decimal(6),
            unlocked() {return hasUpgrade("M2", 12)},
        },
        // Progression Upgrades
        12: {
    	    title: "Explore",
            description: "Unlock new ethereal stick upgrades and move upgrade wall",
            cost: new Decimal(5)
        },
        18: {
    	    title: "Dig Deeper",
            description: "Move upgrade wall again.",
            cost: new Decimal(6),
            unlocked() {return hasUpgrade("M2", 12)},
        },
        19: {
    	    title: "Antreematter",
            description: "Unlock new antimatter upgrades",
            cost: new Decimal(8),
            unlocked() {return hasUpgrade("M2", 18)},
        },
        // Speed Upgrades
        13: {
    	    title: "Speed of Sound",
            description: "Raise ethereal sticks to the power of 1.5",
            cost: new Decimal(1)
        },
        14: {
    	    title: "Challenging Ethereal Sticks",
            description: "Multiply ethereal sticks based on challenge experience",
            cost: new Decimal(3),
            tooltip: "log8(sqrt(x+256))",
            effect() { return player.CE3.points.plus(256).sqrt().log(8) },
            effectDisplay() { return format(upgradeEffect("M2", 14))+"x" }
        },
        16: {
    	    title: "Speed of Light",
            description: "Multiply Discovery's effect by 4",
            cost: new Decimal(6),
            unlocked() {return hasUpgrade("M2", 12)},
        },
    },
    row: "-10", // Row the layer is in on the tree (0 is the first row)
    layerShown() { return inArea("statica")},
    isActive() {return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
   	     "main-display",
   	     ["display-image", "resources/monoiumicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
        ]],
        "resource-display",
        "prestige-button",
        ["microtabs", "stuff"]
    ]

})
