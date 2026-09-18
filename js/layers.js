addLayer("l", {
    name: "layer", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(25), // Can be a function that takes requirement increases into account
    resource: "layers", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 12)) mult = mult.times(2)
        if (hasUpgrade("p", 13)) mult = mult.times(1.5)
        if (hasMilestone("c", 1)) mult = mult.times(10)
        return mult
    },

    passiveGeneration() {
        return hasMilestone("c", 2)
    },

    gainExp() {return new Decimal(1)

    },
    
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for layers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
    11: {
        title: "just starting out",
        description: "2x points",
        cost: new Decimal(1),
        
        
    },
    12: {
        
        title: "same upg again",
        description: "2x points",
        cost: new Decimal(3),
        unlocked() {
            if (hasUpgrade('l', 11)) return true
            return false
        }
    },
    13: {
        title: "WOW! thats a bigger number than 2!!",
        description: "3x points",
        cost: new Decimal(5),
        unlocked() {
            if (hasUpgrade('l', 12)) return true
            return false
        }
    },
    14: {
        title: "what if something booted something",
        description: "layers boost points",
        cost: new Decimal(10),
        unlocked() {
            if (hasUpgrade('l', 13)) return true
            return false
        },
        effect() {
            let eff = player.l.points.add(1).pow(0.5)
            if (hasUpgrade('p', 14)) eff = eff.pow(1.5)
            return eff
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect   
    
    },
  
    
}

})
addLayer("p", {
    name: "Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#1ad339",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "layers", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("c", 1)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    branches: ['l'],
    upgrades: {
    11: {
        title: "wow another layer",
        description: "5x points",
        cost: new Decimal(1),
        
    },
    12: {
        title: "first layer boost",
        description: "2x layers",
        cost: new Decimal(3),
        unlocked() {
            if (hasUpgrade('p', 11)) return true
            return false
        },
    },
    13: {
        title: "amother one",
        description: "1.5x layers and points",
        cost: new Decimal(10),
        unlocked() {
            if (hasUpgrade('p', 12)) return true
            return false
        },
    },
    14: {
        title: "4th layer upgrade is boosted",
        description: "boost is increased by ^1.5",
        cost: new Decimal(25),
        unlocked() {
            if (hasUpgrade('p', 13)) return true
            return false
        },
    },
}, 
    
                 

})
addLayer("u", {
    name: "Ultra", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#0015ff",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "ultra", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("c", 3)) mult = mult.times(25)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for ultra", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    branches: ['p'],
    upgrades: {
    11: {
        title: "wow another layer.. again ",
        description: "25x points",
        cost: new Decimal(1),
        
    
    },
    12: {
        title: "very exact number ",
        description: "^1.13428342937462893423457284502347605082349856283465238475923 points",
        cost: new Decimal(25),
        unlocked() {
            if (hasUpgrade('u', 11)) return true
            return false
        }, 
    
    },
    13: {
        title: "oh yeah",
        description: "100x points",
        cost: new Decimal(1e5),
        unlocked() {
            if (hasUpgrade('u', 12)) return true
            return false
        }, 
    
    },
    
  },
    challenges: {
    11: {
        name: "powers",
        challengeDescription: "points are raised to ^0.5",
        goalDescription: "reach 1e6 points",
        rewardDescription: "points gain is raised by ^1.15",
        unlocked() {
            if (hasUpgrade('u', 11)) return true
            return false
        }, 
        canComplete: function() {return player.points.gte(1e6)},
    },
     12: {
        name: "powers 2 electric boogaloo",
        challengeDescription: "points are raised to ^0.25",
        goalDescription: "reach 100,000 points",
        rewardDescription: "points gain is raised by ^1.16",
        unlocked() {
            if (hasUpgrade('u', 12)) return true
            return false
        }, 
        canComplete: function() {return player.points.gte(1e5)},
        
    },
    
        
    },
    



})
addLayer("c", {
    name: "Charge ", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#eeff00",
    requires: new Decimal(1e12), // Can be a function that takes requirement increases into account
    resource: "charge", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for charge", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    branches: ['p'],
    upgrades: {
    
   
},
   milestones: {
     1: {
        requirementDescription: "1 charge",
        effectDescription: "boosts layers and prestige points gain by 10x",
        done() {
            return player.c.points.gte(1)
        },
     }, 
     2: {
        requirementDescription: "10 charge",
        effectDescription: "layers generate at 100% of their normal gain",
        done() {
            return player.c.points.gte(10)
        }, 
        },       
    3: {
        requirementDescription: "100 charge",
        effectDescription: "25x ultra",
        done() {
            return player.c.points.gte(100)
        },        
        
    },
},
  
    

})