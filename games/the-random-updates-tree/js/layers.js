addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#138cdc",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

      upgrades: {

            11: {
                title: "P1 - Too Slow",
                description: "Gain 1 extra point per second.",
                cost: new Decimal(1),
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
               
            },
            12: {
                title: "P2 - Better Generation",
                description: "Double point gain.",
                cost: new Decimal(3),
                unlocked() { return hasUpgrade('p', 11) }, // The upgrade is only visible when this is true
               
            },
            13: {
                title: "P3 - Generic Enough?",
                description: "Prestige points boost points.",
                cost: new Decimal(6),
                unlocked() { return hasUpgrade('p', 12) }, // The upgrade is only visible when this is true
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.p.points.add(1).pow(0.5)
                    if (ret.gte("1e400")) ret = ret.sqrt().times("1e200")
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            14: {
                title: "P4 - Upgraded Base",
                description: "Prestige upgrades bought add to point gain.",
                cost: new Decimal(20),
                unlocked() { return hasUpgrade('p', 13) }, // The upgrade is only visible when this is true
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.p.upgrades.length
                    return new Decimal(ret).pow(0.7);
                },
                effectDisplay() { return format(this.effect())+"" }, // Add formatting to the effect
            },
             15: {
                title: "P5 - Even Better Generation",
                description: "Triple point gain.",
                cost: new Decimal(50),
                unlocked() { return hasUpgrade('p', 14) }, // The upgrade is only visible when this is true
               
            },
        },
})
addLayer("a", {
    name: "addition", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#db5050",
    requires: new Decimal(3000), // Can be a function that takes requirement increases into account
    resource: "addition", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
     softcap: new Decimal(1e16), 
        softcapPower: new Decimal(0.1), 
    branches: ['p'],
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for addition", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

      effect() {
        let eff = player.a.points.add(0)
        if (hasMilestone('a', 2)) eff = eff.pow(1.4)
            if (eff.gte(1e9)) eff = eff.sqrt().times(1000)
        return eff
      },
      effectDescription() {
        return "adding " +format(tmp.a.effect) + " to base point gain"
      },
      milestones: {
    1: {
        requirementDescription: "(1) 1 addition",
        effectDescription: "Gain 1.75x more points.",
        done() { return player.a.points.gte(1) }
    },
     2: {
        requirementDescription: "(2) 4 addition",
        effectDescription: "Addition effect ^1.4.",
        done() { return player.a.points.gte(4) }
    },
    3: {
        requirementDescription: "(3) 10 addition",
        effectDescription: "Raise point gain ^1.1.",
        done() { return player.a.points.gte(10) }
    },
    4: {
        requirementDescription: "(4) 50 addition",
        effectDescription: "Unlock a challenge, subtraction.",
        done() { return player.a.points.gte(50) }
    },
},
challenges: {

		    11: {
                name: "Subtraction",
                completionLimit: 1,
			    challengeDescription() {return "Subtract 0.8 from point gain exponent<br>"+challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"},
                unlocked() { return hasMilestone('a', 4) },
                goalDescription: 'Reach 250 points',
                canComplete() {
                    return player.points.gte(250)
                },
              
                rewardDescription: "Unlock energy.",
               

            },
        }, 
})
addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#eeff00",
    requires: new Decimal(3000), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.54, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('e', 13)) mult = mult.times(10000)
        return mult
    },
    softcap: new Decimal(1e9), 
        softcapPower: new Decimal(0.1), 
    branches: ['p'],
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge('a', 11) || player.e.unlocked},

      effect() {
        let eff = player.e.points.add(1).log(70).add(1).pow(0.27)
        if (hasUpgrade('e', 12)) eff = eff.pow(1.3)
        return eff
      },
      effectDescription() {
        return "raising point gain to ^" +format(tmp.e.effect) + ""
      },
      passiveGeneration() { return (hasUpgrade("e", 11))?1:0 },
		doReset(resettingLayer) {
			let keep = [];
			
			if (layers[resettingLayer].row > this.row) layerDataReset("e", keep)
		},
     upgrades: {

            11: {
                title: "E1 - Talk About Exponential Growth...",
                description: "Generate energy.",
                cost: new Decimal(1e10),
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
               
            },
            12: {
                title: "E2 - More Power",
                description: "Energy effect is ^1.3.",
                cost: new Decimal(1e11),
                unlocked() { return hasUpgrade('e', 11) }, // The upgrade is only visible when this is true
               
            },
            13: {
                title: "E3 - Energized",
                description: "10,000x energy gain.",
                cost: new Decimal(5e11),
                unlocked() { return hasUpgrade('e', 12) }, // The upgrade is only visible when this is true
               
            },
        },
})