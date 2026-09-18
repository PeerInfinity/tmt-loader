addLayer("CE3", {
    name: "Challenge Experience", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CE", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return true},
        points: new Decimal(0),
        pps: new Decimal(1),
        oldce3ch: 0
    }},
    color: "#c2625b",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "challenge experience", // Name of prestige currency
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
    gen() {
    	if(inArea("challe26e")) {
        	let mult = new Decimal(1)
            if(hasChallenge("CE3", 11)) mult = mult.times(challengeEffect("CE3", 11))
            if(hasMilestone("CE3", 0)) mult = mult.times(2)
            if(hasMilestone("DS3", 0)) mult = mult.times(16)
            if(hasMilestone("DS3", 1)) mult = mult.times(3)
            if(hasChallenge("CE3", 22)) mult = mult.times(challengeEffect("CE3", 22))
            if(hasMilestone("DS3", 2)) mult = mult.times(new Decimal(5).pow(milestoneLength("DS3") - 2))
            if(hasChallenge("DS3", 11)) mult = mult.times(challengeEffect("DS3", 11))
            if(getBuyableAmount("CE3", 11).gte(1)) mult = mult.pow(buyableEffect("CE3", 11).plus(1))
            if(hasChallenge("DS3", 12)) mult = mult.times(challengeEffect("DS3", 12))
            if(inChallenge("CE3", 11)) mult = mult.div(new Decimal(2).pow(challengeCompletions("CE3", 11) + 1))
            if(inChallenge("CE3", 12)) mult = mult.sqrt()
            if(inChallenge("CE3", 22)) mult = mult.log10()
            if(inChallenge("DS3", 11)) mult = mult.pow(0.6)
            if(inChallenge("DS3", 12)) mult = mult.pow(0.1)
            if(getBuyableAmount("DS3", 12).gte(1)) if(inChallenge("DS3", 12)) mult = mult.times(buyableEffect("DS3", 12))
            player.CE3.pps = mult
            player.CE3.points = player.CE3.points.plus(mult.div(30))
        }
    },
    row: "-10", // Row the layer is in on the tree (0 is the first row)
    challenges: {
    	11: {
    	    name: "Inconvenience",
            challengeDescription: function() { return "Reset challenge experience and divide it by "+format(new Decimal(2).pow(challengeCompletions("CE3", 11) + 1))+". Completions: "+challengeCompletions("CE3", 11)+"/"+tmp.CE3.challenges[this.id].completionLimit},
            goalDescription: function() { return format(new Decimal(10).times(new Decimal(1.5).pow(challengeCompletions("CE3", 11))))+" Challenge Experience" },
            canComplete: function() {return player.CE3.points.gte(new Decimal(10).times(new Decimal(1.5).pow(challengeCompletions("CE3", 11))))},
            rewardDescription: "Quadruple challenge experience gain compounding every completion",
            completionLimit: function() {return 5 + challengeEffect("CE3", 12)},
            rewardEffect() {return new Decimal(4).pow(challengeCompletions("CE3", 11)) },
            rewardDisplay() {return format(challengeEffect("CE3", 11))+"x"},
            onEnter() {
            	player.CE3.points = new Decimal(0)
            }
        },
        12: {
    	    name: "The Opposite",
            unlocked() {return hasMilestone("CE3", 0)},
            challengeDescription: function() { return "Square root challenge experience."+" Completions: "+challengeCompletions("CE3", 12)+"/3"},
            goalDescription: function() { return format(new Decimal(675).times(new Decimal(3).pow(challengeCompletions("CE3", 12))))+" Challenge Experience" },
            canComplete: function() {return player.CE3.points.gte(new Decimal(675).times(new Decimal(3).pow(challengeCompletions("CE3", 12))))},
            rewardDescription: "Increase completion limit of Inconvenience by 1",
            completionLimit: 3,
            rewardEffect() {return challengeCompletions("CE3", 12)},
            rewardDisplay() {return "+"+format(challengeEffect("CE3", 12))},
            onEnter() {
            	player.CE3.points = new Decimal(0)
            }
        },
        21: {
    	    name: "First Test",
            unlocked() {return getBuyableAmount("CE3", 11).gte(3) && challengeCompletions("CE3", 11) >= 8 && challengeCompletions("CE3", 12) >= 3 },
            challengeDescription: function() { return "Combine the effects of Inconvenience and The Opposite."},
            goalDescription: "1,000 Challenge Experience",
            canComplete: function() {return player.CE3.points.gte(new Decimal(1000))},
            rewardDescription: "Unlock the next layer",
            countsAs: [11, 12],
            onEnter() {
            	player.CE3.points = new Decimal(0)
            }
        },
        22: { // WORK ON THIS also 1st goal is 50, then 2nd goal is 200 so figure a formula 50*(4^x) new Decimal(50).times(new Decimal(4).pow(challengeCompletions("CE3", 22)))
    	    name: "Speedwalk",
            unlocked() {return hasMilestone("DS3", 1) && getBuyableAmount("CE3", 11).gte(3) },
            challengeDescription: function() { return "Combine the effects of Inconvenience and The Opposite, but your challenge exp is log10(x)."+" Completions: "+challengeCompletions("CE3", 22)+"/2"},
            goalDescription: function() { return format(new Decimal(50).times(new Decimal(3).pow(challengeCompletions("CE3", 22))))+" Challenge Experience" },
            canComplete: function() {return player.CE3.points.gte(new Decimal(50).times(new Decimal(3).pow(challengeCompletions("CE3", 22))))},
            rewardDescription: "9x compunding challenge exp gain every completion",
            countsAs: [11, 12],
            completionLimit: 2,
            rewardEffect() {return new Decimal(9).pow(challengeCompletions("CE3", 22))},
            rewardDisplay() {return format(challengeEffect("CE3", 22))+"x"},
            onEnter() {
            	player.CE3.points = new Decimal(0)
            }
        },
    },
    milestones: {
    	0: {
            requirementDescription: "10000 challenge experience",
            effectDescription: "Unlock more challenges and double challenge exp gain",
            done() { return player.CE3.points.gte(10000) }
        },
        1: {
            requirementDescription: "2,500,000 challenge experience",
            effectDescription: "Unlock some buyables",
            done() { return player.CE3.points.gte("2.5e6") }
        },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal("2.5e6").mul(x.plus(1)) },
            title: "Speedrun",
            display() { return "Reset your challenge experience and challenges, to increase the exponent of challenge experience gain by +0.05. Cost: "+format(this.cost())+" challenge experience. Amount: "+getBuyableAmount("CE3", 11)+"/3 <br />Currently: +"+format(buyableEffect("CE3", 11))},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = new Decimal(0),
                player[this.layer].challenges[11] = getBuyableAmount("DS3", 11).toNumber()
                player[this.layer].challenges[12] = 0,
                player[this.layer].challenges[22] = 0,
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasMilestone("CE3", 1)},
            effect(x) {return x.mul(0.05)},
            purchaseLimit: 3
        },
    },
    layerShown() { return inArea("challe26e")},
    isActive() {return tmp[this.layer].layerShown},
    branches: ["DS3"],
    tabFormat: [
    	["row", [
      	  "main-display",
      	  ["display-image", "resources/challengeexperienceicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
        "resource-display",
        ["display-text", function() { return "You are making "+format(player.CE3.pps)+" challenge experience per second." }],
        "milestones",
        "challenges",
        "buyables"
    ]
}),

addLayer("DS3", {
    name: "Difficult Sticks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DS", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("S", 22) || hasUpgrade("L", 11) | hasUpgrade("TI", 11) },
        points: new Decimal(0),
    }},
    color: "#9c3e1f",
    requires: new Decimal("1e7"), // Can be a function that takes requirement increases into account
    resource: "difficult sticks", // Name of prestige currency
    baseResource: "challenge experience", // Name of resource prestige is based on
    baseAmount() {return player.CE3.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    onPrestige(gain) {
    	player.CE3.points = new Decimal(0)
    	// reset challenges except first test
    	setChallengeCompletions("CE3", 11, getBuyableAmount("DS3", 11).toNumber())
    	setChallengeCompletions("CE3", 12, 0)
    	setChallengeCompletions("CE3", 22, 0)
    	//reset milestones
    	player.CE3.milestones = []
    	//reset buyales
        setBuyableAmount("CE3", 11, new Decimal(0))
    },
    row: "-10", // Row the layer is in on the tree (0 is the first row)
    milestones: {
 	   0: {
  	      requirementDescription: "1 difficult stick",
   	     effectDescription: "Multiply challenge experience by 16.",
	        done() { return player.DS3.points.gte(1) }
 	   },
 	   1: {
  	      requirementDescription: "2 difficult sticks",
   	     effectDescription: "Unlock more challenges, triple challenge exp gain.",
	        done() { return player.DS3.points.gte(2) },
	        unlocked() { return hasMilestone("DS3", 0) }
 	   },
 	   2: {
  	      requirementDescription: "3 difficult sticks",
   	     effectDescription() { return "x5 compunding challenge exp per milestone starting here. Currently: "+format(new Decimal(5).pow(milestoneLength("DS3") - 2))+"x"},
	        done() { return player.DS3.points.gte(3) },
	        unlocked() { return hasMilestone("DS3", 1) }
 	   },
 	   3: {
  	      requirementDescription: "5 difficult sticks",
   	     effectDescription() { return "Unlock tier 2 challenges"},
	        done() { return player.DS3.points.gte(5) },
	        unlocked() { return hasMilestone("DS3", 2) }
 	   },
 	   4: {
  	      requirementDescription: "6 difficult sticks",
   	     effectDescription() { return "Unlock new buyables"},
	        done() { return player.DS3.points.gte(6) },
	        unlocked() { return hasMilestone("DS3", 3) }
 	   },
 	   5: {
  	      requirementDescription: "8 difficult sticks",
   	     effectDescription() { return "Unlock new challenges"},
	        done() { return player.DS3.points.gte(8) },
	        unlocked() { return hasMilestone("DS3", 4) }
 	   },
    },
    challenges: {
    	11: {
    	    name: "Disturbance", // change goal, ccomp rewards and onenter.
            challengeDescription: function() { return "Reset challenge experience and tier 1 challenges and challenge exp is ^0.6. Completions: "+challengeCompletions("DS3", 11)+"/"+tmp.DS3.challenges[this.id].completionLimit},
            goalDescription: function() { return format(new Decimal(4000).times(new Decimal(8).pow(challengeCompletions("DS3", 11))))+" Challenge Experience" },
            canComplete: function() {return player.CE3.points.gte(new Decimal(4000).times(new Decimal(8).pow(challengeCompletions("DS3", 11))))},
            rewardDescription: "4x challenge experience gain compounding every completion",
            completionLimit: function() {return 3},
            rewardEffect() {return new Decimal(4).pow(challengeCompletions("DS3", 11)) },
            rewardDisplay() {return format(challengeEffect("DS3", 11))+"x"},
            onEnter() {
            	player.CE3.oldce3ch = player.CE3.challenges
            	player.CE3.points = new Decimal(0)
            	player.CE3.challenges = {11:0, 12:0, 22: 0, 21: 1}
            },
            onExit() {
            	player.CE3.challenges = player.CE3.oldce3ch
            },
            unlocked() {return hasMilestone("DS3", 3)}
        },
        12: {
    	    name: "Slowed Down", // change goal, ccomp rewards and onenter.
            challengeDescription: function() { return "Reset challenge experience and tier 1 challenges and challenge exp is ^0.1. Unlock a buyable only during this challenge. Completions: "+challengeCompletions("DS3", 12)+"/"+tmp.DS3.challenges[this.id].completionLimit},
            goalDescription: function() { return format(new Decimal(1000).times(new Decimal(2).pow(challengeCompletions("DS3", 12))))+" Challenge Experience" },
            canComplete: function() {return player.CE3.points.gte(new Decimal(1000).times(new Decimal(2).pow(challengeCompletions("DS3", 12))))},
            rewardDescription: "5x challenge experience gain compounding every completion",
            completionLimit: function() {return 3},
            rewardEffect() {return new Decimal(5).pow(challengeCompletions("DS3", 12)) },
            rewardDisplay() {return format(challengeEffect("DS3", 12))+"x"},
            onEnter() {
            	player.CE3.oldce3ch = player.CE3.challenges
            	player.CE3.points = new Decimal(0)
            	player.CE3.challenges = {11:0, 12:0, 22: 0, 21: 1}
            },
            onExit() {
            	player.CE3.challenges = player.CE3.oldce3ch
            	setBuyableAmount("DS3", 12, new Decimal(0))
            },
            unlocked() {return hasMilestone("DS3", 5)}
        },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal("1e15").times(new Decimal(2).pow(x)) },
            title: "Conveniently Convenient",
            display() { return "Keep +1 level of the Inconvenient challenge from resetting for difficult sticks and below. Cost: "+format(this.cost())+" challenge experience. Amount: "+getBuyableAmount("DS3", 11)+"/8 <br />Currently: +"+format(buyableEffect("DS3", 11))},
            canAfford() { return player.CE3.points.gte(this.cost()) },
            buy() {
                player.CE3.points = player.CE3.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasMilestone("DS3", 4)},
            effect(x) {return "+"+x},
            purchaseLimit: 8
        },
        12: {
            cost(x) { return new Decimal(100).times(new Decimal(x.plus(1)).factorial()) },
            title: "Speed Up",
            display() { return "x2 challenge experience compounding. Ignores nerfs. Cost: "+format(this.cost())+" challenge experience. Amount: "+getBuyableAmount("DS3", 12)+"/5 <br />Currently: "+format(buyableEffect("DS3", 12))+"x"},
            canAfford() { return player.CE3.points.gte(this.cost()) },
            buy() {
                player.CE3.points = player.CE3.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return inChallenge("DS3", 12)},
            effect(x) {return new Decimal(2).pow(x)},
            purchaseLimit: 5
        },
    },
    getNextAt(canMax=false){ // Formula: 5e7 * (15^x)
    	return new Decimal("5e7").times(new Decimal(15).pow(player.DS3.points))
    },
    layerShown() { return inArea("challe26e") && hasChallenge("CE3", 21) },
    isActive() {return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
   	     "main-display",
   	     ["display-image", "resources/difficultstickicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
        ]],
        "resource-display",
        "prestige-button",
        "milestones",
        "challenges",
        "buyables"
    ]
})