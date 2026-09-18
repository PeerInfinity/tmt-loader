addLayer("up", {
    name: "Up Quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0914e3",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Up Quarks", // Name of prestige currency
    baseResource: "Gluons", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)   
        if (hasUpgrade('top', 13)) mult = mult.times(2) 
        if (hasUpgrade('up', 13)) mult = mult.times(upgradeEffect('up', 13))
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "u: Reset for Up Quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "Up duplication",
            description: "Adds +1 base to Gluon gain",
            cost: new Decimal(2),          
        },
        12: {
            title: "Up acceleration",
            description: "Up Quarks boosts Gluon gain",
            cost: new Decimal(15),   
            effectDisplay() { return "×" + format(this.effect()) },       
            effect() {
            return player.up.points.add(1).pow(0.3)
            },
        },   
        13: {
            title: "A little push",
            description: "Up quark boosts itself weakly",
            cost: new Decimal(250),   
            effectDisplay() { return "×" + format(this.effect()) },       
            effect() {
            return player.up.points.add(1).pow(0.1)
            },
        }, 
        14: {
            title: "A little push",
            description: "Up quark boosts itself weakly",
            cost: new Decimal(250), 
            unlocked: false   
                       
        },                                
    },
    layerShown(){return true}
})
addLayer("charm", {
    name: "Charm Quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e81414",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Charm Quarks", // Name of prestige currency
    baseResource: "Gluons", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('top', 12)) mult = mult.times(2)
        if (hasUpgrade('p', 11)) mult = mult.times(2)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "c: Reset for Charm Quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "Charm duplication",
            description: "Adds +1 base to Gluon gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Gluonology",
            description: "Doubles Gluon gain",
            cost: new Decimal(10),
        },
        13: {
            title: "Self acceleration",
            description: "Gluon boosts itself",
            cost: new Decimal(100),
            effectDisplay() { return "x" + format(this.effect()) },       
            effect() {
            return player.points.add(1).pow(0.15)
            },
        },
        14: {
            title: "Gluonology²",
            description: "Triples Gluon gain",
            cost: new Decimal(500),
        },
    },
    layerShown(){return true}
})
addLayer("top", {
    name: "Top Quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#19e012",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Top Quarks", // Name of prestige currency
    baseResource: "Gluons", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('top', 15)) mult = mult.times(2)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for Top Quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "Top duplication",
            description: "Adds +1 base to Gluon gain",
            cost: new Decimal(2),
        },
        12: {
            title: "No inflation here",
            description: "Doubles Charm quark gain",
            cost: new Decimal(15),
        },
        13: {
            title: "No inflation there",
            description: "Doubles Up quark gain",
            cost: new Decimal(100),
        },
        14: {
            title: "Top acceleration",
            description: "Top quarks boosts Gluon gain",
            cost: new Decimal(1000),
            effectDisplay() { return "×" + format(this.effect()) },       
            effect() {
            return player.top.points.add(1).pow(0.3)
            },
        },    
        15: {
            title: "Inflation nowhere",
            description: "Doubles Top quark gain",
            cost: new Decimal(1000),
        },
    },
    layerShown(){return true}
})
addLayer("p", {
    name: "Subatomical Formation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(4),
        total: new Decimal (0),
    }},
    color: "#9e9e9e",
    requires: new Decimal(10000000), // Can be a function that takes requirement increases into account
    resource: "Particles", // Name of prestige currency
    baseResource: "Gluons", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.15, // Prestige currency exponent
    branches: ["up","charm","top"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "p: Reset for Particles", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "Double boost",
            description: "Doubles Gluon gain and Charm quark gain",
            cost: new Decimal(1),
        },
        12: {
            title: "Scaling",
            description: "5x Gluon",
            cost: new Decimal(2),
        },
        13: {
            title: "Third dimension",
            description: "Particles boosts every Quark gain strongly",
            cost: new Decimal(3),
            effectDisplay() { return "×" + format(this.effect()) },                
            effect() {           
            return player.p.points.add(1).pow(1)
            },
        },
        14: {
            title: "Manipulation",
            description: "Particles boosts Gluon gain strongly",
            cost: new Decimal(10),
            effectDisplay() { return "×" + format(this.effect()) },                
            effect() {           
            return player.p.points.add(1).pow(2)
            },
        },
        15: {
            title: "Expansion",
            description: "Unlock new Quark upgrades",
            cost: new Decimal(1000),           
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Total particle",
            effectDescription: "Charm quarks boosts Gluon gain slightly",
            done() { return player.p.points.gte(1)},        
            effectDisplay() { return "×" + format(this.effect()) },                
            effect() {           
            return player.charm.points.add(1).pow(0.05)             
            },             
        },          
    },            
    layerShown(){return true}
})