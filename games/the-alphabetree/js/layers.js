addLayer("a", {
    name: "A", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#880000",
    requires(){ 
        let requirement = new Decimal(3);
        if (hasUpgrade('a', 13)) requirement = requirement.div(2)
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "A points", // Name of prestige currency
    baseResource: " points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        let powerage = 1.25
        if (hasMilestone('a', 1)) mult = mult.mul(2) 
        if (hasMilestone('b', 1)) mult = mult.mul(3)
        if (hasMilestone('b', 2)) mult = mult.pow(powerage)
        if (hasUpgrade("b", 13)) powerage = 1.35
        if (hasUpgrade('c', 12)) mult = mult.mul(player.points.max(1).log10().add(1))
        if (hasMilestone('c', 1)) mult = mult.mul(3)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for A points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    milestones: {
        1: {
            requirementDescription: "10 A Points",
            effectDescription: "A Points gain is doubled",
            done() { return player.a.points.gte(10) }
        },
        2: {
            requirementDescription: "50 A Points",
            effectDescription: "Letters gain is boosted by Letters at a decreased rate",
            done() { return player.a.points.gte(50) }
        },
        3: {
            requirementDescription: "300 A Points",
            effectDescription: "Gain 10% of A Point Gain every second",
            done() { return player.a.points.gte(300)} 
        }
    },

    upgrades: {
        11: {
            title: "Point Noob",
            description: "Point gain is doubled",
            cost: new Decimal(5)
        },
        12: {
            title: "A-power!",
            description: "A Points boost Point gain at a decreased rate.",
            cost: new Decimal(10),
            effect() {
                let effect = player.a.points.max(1).log10().add(1)
                if (hasUpgrade('a', 22)) effect = effect.mul(upgradeEffect('a', 22))
                return effect
            }
        },
        13: {
            title: "A Point mayhem",
            description: "A point requirement is halved",
            cost: new Decimal(25)
        },
        21: {
            title: "Points aren't for losers",
            description: "Point gain is tripled",
            cost: new Decimal(75)
        },
        22: {
            title: "Points, Points, Baby!",
            description: "'A-power!' effect is slightly boosted",
            cost: new Decimal(150),
            effect() {
                let effect = new Decimal(1.2) // the amount to boost upgrade 12 by
                return effect
           }
        },   
    },
    resetsNothing: () => hasMilestone('b', 3),
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return;
      
        let keep = [];
        if (hasUpgrade('b', 23)) keep.push("upgrades");
        if (hasMilestone('b', 5)) keep.push("milestones");
      
        layerDataReset(this.layer, keep);
    },
    passiveGeneration() {
        let aGeneration = 0
        if (hasMilestone('a', 3)) aGeneration = 0.1
        return aGeneration
    }
})

addLayer("automation", {
    name: "Automation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AU", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#880000",
    requires(){ 
        let requirement = new Decimal(100);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Automation Points", // Name of prestige currency
    baseResource: "A points", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "A", description: "Shift + A: Reset for Automation points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["a", "bases"],
    layerShown(){return true},
})

addLayer("b", {
    name: "B", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#cc0000",
    requires(){ 
        let requirement = new Decimal(300);
        let BUPG2 = 2
        if (hasUpgrade("b", 12)) requirement = requirement.div(BUPG2)
        if (hasMilestone("b", 4)) BUPG2 = 2.5
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "B points", // Name of prestige currency
    baseResource: "A points", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        let powerage = 1.25
        if (hasUpgrade("c", 11)) mult = mult.mul(player.a.points.max(1).log10().add(1))
        if (hasMilestone("c", 3)) mult = mult.pow(powerage)
        if (hasUpgrade("c", 31)) powerage = 1.35
        if (hasMilestone("c", 1)) mult = mult.mul(3)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for B points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["a"],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Point Starter",
            description: "B points boost points at a decreased rate",
            cost: new Decimal(1),
            effect(){
                let upgradeb1 = player.b.points.max(1).log10().add(1)
                if (hasUpgrade("b", 13)) player.a.points.mul(upgradeb1.div(1.5))
                return upgradeb1
            }
        },
        12: {
            title: "B points are cool",
            description: "B point requirement is halved",
            cost: new Decimal(3)
        },
        13: {
            title: "A points are A-mazing",
            description: "B Milestone 2 is boosted",
            cost: new Decimal(5)
        },
        21: {
            title: "A point starter",
            description: "A points are also boosted by 'Point Starter'",
            cost: new Decimal(7),
        },
        22: {
            title: "Points are also cool (I guess...)",
            description: "Points boost points at a decreased rate",
            cost: new Decimal(10)
        },
        23: {
            title: "A Points are repetitive",
            description: "A Point upgrades are kept on reset",
            cost: new Decimal(15)
        }
    },
    milestones: {
        1: {
            requirementDescription: "1 B Point",
            effectDescription: "A point gain is tripled",
            done() {return player.b.points.gte(1)}
        },
        2: {
            requirementDescription: "5 B Points",
            effectDescription: "A Point Gain is put to the power of 1.25",
            done() {return player.b.points.gte(5)}
        },
        3: {
            requirementDescription: "25 B Points",
            effectDescription: "A Points Reset nothing",
            done() {return player.b.points.gte(25)}
        },
        4: {
            requirementDescription: "35 B Points",
            effectDescription: "B Upgrade 2 is boosted slightly",
            done() {return player.b.points.gte(35)}
        },
        5: {
            requirementDescription: "50 B Points",
            effectDescription: "Keep A Point's Milestones on reset",
            done() {return player.b.points.gte(50)}
        }
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row <= this.row) return;
      
        let keep = [];
        if (hasUpgrade('c', 21)) keep.push("upgrades");
      
        layerDataReset(this.layer, keep);
    },
})

addLayer("bases", {
    name: "Bases", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff1100",
    requires(){ 
        let requirement = new Decimal(100);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Base Points", // Name of prestige currency
    baseResource: "B points", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [
        {key: "B", description: "Shift + B: Reset for Base points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["a", "b"],
    layerShown(){return true},
})

addLayer("c", {
    name: "C", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF5500",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "C points", // Name of prestige currency
    baseResource: "B points", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        if (hasUpgrade('c', 23)) mult = mult.mul(player.points.max(1).log10().add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for C points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["b"],
    milestones: {
        1: {
            requirementDescription: "1 C Point",
            effectDescription: "A Points and B Point gain is tripled",
            done() {return player.c.points.gte(1)}
        },
        2: {
            requirementDescription: "3 C Points",
            effectDescription: "C Point gain is boosted based on itself",
            done() {return player.c.points.gte(3)}
        },
        3: {
            requirementDescription: "7 C Points",
            effectDescription: "B Point gain is powered by 1.25",
            done() {return player.c.points.gte(7)}
        },
    },
    upgrades: {
        11: {
            title: "B Point synergy",
            description: "B points are boosted by A Points at a decreased rate",
            cost: new Decimal(2)
        },
        12: {
            title: "A Point synergy",
            description: "A points are boosted by letters at a decreased rate",
            cost: new Decimal(5)
        },
        13: {
            title: "Point Novice",
            description: "Letters are boosted by C Points",
            cost: new Decimal(7),
            effect(){
                let upgradec3 = player.c.points.max(1).log10().add(1)
                if (hasUpgrade("c", 22)) player.a.points.mul(upgradec3.div(1.75))
                if (hasUpgrade("c", 33)) player.b.points.mul(upgradec3.div(1.5))
                return upgradec3
            }
        },
        21: {
            title: "B points are also Repetitive",
            description: "Keep B Point upgrades on reset",
            cost: new Decimal(10)
        },
        22: {
            title: "A Point Novice",
            description: "A Points are also boosted by 'Point Novice' at a decreased rate",
            cost: new Decimal(15)
        },
        23: {
            title: "C Points synergy",
            description: "C Points are boosted by Letters",
            cost: new Decimal(25)
        },
        31: {
            title: "B Points are B-eautiful",
            description: "C Milestone 3 is boosted",
            cost: new Decimal(75)
        },
        32: {
            title: "C Points are cool too... I guess",
            description: "C Milestone 2 is boosted",
            cost: new Decimal(85)
        },
        33: {
            title: "B Point Novice",
            description: "B Points are also boosted by 'Point Novice' at a decreased rate",
            cost: new Decimal(100)
        }
    },
    layerShown(){return true},
})

addLayer("challenges", {
    name: "Challenges", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CH", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF9900",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Challenge Points", // Name of prestige currency
    baseResource: "C points", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    displayRow: 2,
    hotkeys: [
        {key: "C", description: "Shift + C: finish the current Challenge", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["b", "c", "bases"],
    layerShown(){return true},
})

addLayer("clock", {
    name: "Clock", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFDD00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Time Points", // Name of prestige currency
    baseResource: "C points", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    displayRow: 2,
    hotkeys: [
        {key: "ctrl+c", description: "CNTRL + C: Reset for Time Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["b", "c", "bases"],
    layerShown(){return true},
})

addLayer("d", {
    name: "D", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#DDFF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "D points", // Name of prestige currency
    baseResource: "C points", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for D points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["c"],
    layerShown(){return true},
})

addLayer("e", {
    name: "E", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#99FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "E points", // Name of prestige currency
    baseResource: "D points", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for E points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["d"],
    layerShown(){return true},
})

addLayer("empower", {
    name: "Empower", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "EM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#55FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Empowering points", // Name of prestige currency
    baseResource: "E points", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    displayRow: 4,
    hotkeys: [
        {key: "E", description: "Shift + E: Reset for Empowering points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["e", "challenges", "clock"],
    layerShown(){return true},
})

addLayer("f", {
    name: "F", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#11FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "F points", // Name of prestige currency
    baseResource: "E points", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset for F points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["e"],
    layerShown(){return true},
})

addLayer("flux", {
    name: "Flux", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FF33",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Fluxuating points", // Name of prestige currency
    baseResource: "F points", // Name of resource prestige is based on
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    displayRow: 5,
    hotkeys: [
        {key: "F", description: "Shift + F: Reset for Fluxuating points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["f", "empower",],
    layerShown(){return true},
})

addLayer("g", {
    name: "G", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FF77",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "G points", // Name of prestige currency
    baseResource: "F points", // Name of resource prestige is based on
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for G points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["f"],
    layerShown(){return true},
})

addLayer("h", {
    name: "H", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FFBB",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "H points", // Name of prestige currency
    baseResource: "G points", // Name of resource prestige is based on
    baseAmount() {return player.g.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for H points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["g"],
    layerShown(){return true},
})

addLayer("hindrances", {
    name: "Hindrances", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FFFF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Hindrance points", // Name of prestige currency
    baseResource: "H points", // Name of resource prestige is based on
    baseAmount() {return player.h.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    displayRow: 7,
    hotkeys: [
        {key: "H", description: "Shift + H: Reset for Hindrance points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["h", "flux"],
    layerShown(){return true},
})

addLayer("i", {
    name: "I", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00AAFF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "I points", // Name of prestige currency
    baseResource: "H points", // Name of resource prestige is based on
    baseAmount() {return player.h.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "i", description: "I: Reset for I points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["h"],
    layerShown(){return true},
})

addLayer("inquiry", {
    name: "Inquiry", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IN", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0066FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Inquiring points", // Name of prestige currency
    baseResource: "I points", // Name of resource prestige is based on
    baseAmount() {return player.i.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    displayRow: 8,
    hotkeys: [
        {key: "I", description: "Shift + I: Reset for Inquiring points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["i", "hindrances"],
    layerShown(){return true},
})

addLayer("irregulations", {
    name: "Irregulations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0022FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Irregulating points", // Name of prestige currency
    baseResource: "I points", // Name of resource prestige is based on
    baseAmount() {return player.i.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    displayRow: 8,
    hotkeys: [
        {key: "ctrl+i", description: "Control + I: Reset for Irregulating points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["i", "hindrances"],
    layerShown(){return true},
})

addLayer("j", {
    name: "J", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "J", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#2200FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "J points", // Name of prestige currency
    baseResource: "I points", // Name of resource prestige is based on
    baseAmount() {return player.i.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "j", description: "J: Reset for J points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["i"],
    layerShown(){return true},
})

addLayer("juxtapositions", {
    name: "Juxtapositions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "JU", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#6600FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Juxtapositioning points", // Name of prestige currency
    baseResource: "J points", // Name of resource prestige is based on
    baseAmount() {return player.j.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 10, // Row the layer is in on the tree (0 is the first row)
    displayRow: 9,
    hotkeys: [
        {key: "J", description: "Shift + J: Reset for Juxtapositioning points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["j", "inquiry", "irregulations"],
    layerShown(){return true},
})

addLayer("k", {
    name: "K", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "K", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#AA00FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "K points", // Name of prestige currency
    baseResource: "J points", // Name of resource prestige is based on
    baseAmount() {return player.j.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 10, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "k", description: "K: Reset for K points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["j"],
    layerShown(){return true},
})

addLayer("l", {
    name: "L", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#EE00FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "L points", // Name of prestige currency
    baseResource: "K points", // Name of resource prestige is based on
    baseAmount() {return player.k.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 11, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for L points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["k"],
    layerShown(){return true},
})

addLayer("m", {
    name: "M", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF33FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "M points", // Name of prestige currency
    baseResource: "L points", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 12, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for M points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["k"],
    layerShown(){return true},
})

addLayer("mastery", {
    name: "Mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF77FF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Mastery points", // Name of prestige currency
    baseResource: "M points", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 13, // Row the layer is in on the tree (0 is the first row)
    displayRow: 12,
    hotkeys: [
        {key: "M", description: "Shift + M: Reset for Mastery points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["m", "juxtapositions"],
    layerShown(){return true},
})

addLayer("n", {
    name: "N", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFBBFF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "N points", // Name of prestige currency
    baseResource: "M points", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 13, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Reset for N points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["m"],
    layerShown(){return true},
})

addLayer("nitrogen", {
    name: "Nitrogen", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "NI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Nitrogenated points", // Name of prestige currency
    baseResource: "N points", // Name of resource prestige is based on
    baseAmount() {return player.n.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 14, // Row the layer is in on the tree (0 is the first row)
    displayRow: 13,
    hotkeys: [
        {key: "N", description: "Shift + N: Reset for Nitrogenated points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["n", "mastery"],
    layerShown(){return true},
})

addLayer("negativity", {
    name: "Negativity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "NE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#DDDDDD",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Negative points", // Name of prestige currency
    baseResource: "N points", // Name of resource prestige is based on
    baseAmount() {return player.n.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 14, // Row the layer is in on the tree (0 is the first row)
    displayRow: 13,
    hotkeys: [
        {key: "ctrl+n", description: "Control + N: Reset for Negative points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["n", "mastery", "nitrogen"],
    layerShown(){return true},
})

addLayer("o", {
    name: "O", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#BBBBBB",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "O points", // Name of prestige currency
    baseResource: "N points", // Name of resource prestige is based on
    baseAmount() {return player.n.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 14, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Reset for O points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["n"],
    layerShown(){return true},
})

addLayer("p", {
    name: "P", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#999999",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "P points", // Name of prestige currency
    baseResource: "O points", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 15, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for P points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["o"],
    layerShown(){return true},
})

addLayer("printing", {
    name: "Printing", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#777777",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Printing points", // Name of prestige currency
    baseResource: "P points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 16, // Row the layer is in on the tree (0 is the first row)
    displayRow: 15,
    hotkeys: [
        {key: "P", description: "Shift + P: Reset for Printing points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["p", "negativity", "nitrogen"],
    layerShown(){return true},
})

addLayer("positivity", {
    name: "Positivity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PO", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#555555",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Positivity points", // Name of prestige currency
    baseResource: "P points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 16, // Row the layer is in on the tree (0 is the first row)
    displayRow: 15,
    hotkeys: [
        {key: "ctrl+p", description: "Control + P: Reset for Positivity points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["p", "negativity", "nitrogen", "printing"],
    layerShown(){return true},
})

addLayer("q", {
    name: "Q", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#333333",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Q points", // Name of prestige currency
    baseResource: "P points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 16, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for Q points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["p"],
    layerShown(){return true},
})

addLayer("r", {
    name: "R", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#333333",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "R points", // Name of prestige currency
    baseResource: "Q points", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 17, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for R points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["q"],
    layerShown(){return true},
})

addLayer("s", {
    name: "S", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#880000",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "S points", // Name of prestige currency
    baseResource: "R points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 18, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for S points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["r"],
    layerShown(){return true},
})

addLayer("science", {
    name: "Science", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#880000",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Scientific points", // Name of prestige currency
    baseResource: "S points", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 19, // Row the layer is in on the tree (0 is the first row)
    displayRow: 18,
    hotkeys: [
        {key: "S", description: "Shift + S: Reset for Scientific points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["s", "positivity", "printing"],
    layerShown(){return true},
})

addLayer("super-mastery", {
    name: "Super Mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#CC0000",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Super Mastery points", // Name of prestige currency
    baseResource: "S points", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 19, // Row the layer is in on the tree (0 is the first row)
    displayRow: 18,
    hotkeys: [
        {key: "ctrl+s", description: "Control + S: Reset for Super Mastery points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["s", "positivity", "printing", "science"],
    layerShown(){return true},
})

addLayer("t", {
    name: "T", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF1100",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "T points", // Name of prestige currency
    baseResource: "S points", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 19, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for T points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["s"],
    layerShown(){return true},
})

addLayer("timeline", {
    name: "Timeline", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF5500",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Timeline points", // Name of prestige currency
    baseResource: "T points", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 20, // Row the layer is in on the tree (0 is the first row)
    displayRow: 19,
    hotkeys: [
        {key: "T", description: "Shift + T: Reset for Timeline points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["t", "super-mastery", "science"],
    layerShown(){return true},
})

addLayer("u", {
    name: "U", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF9900",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "U points", // Name of prestige currency
    baseResource: "T points", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 20, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for U points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["t"],
    layerShown(){return true},
})

addLayer("v", {
    name: "V", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFDD00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "V points", // Name of prestige currency
    baseResource: "U points", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 21, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "v", description: "V: Reset for V points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["u"],
    layerShown(){return true},
})

addLayer("visualise", {
    name: "Visualise", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "VI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#DDFF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Visualising points", // Name of prestige currency
    baseResource: "V points", // Name of resource prestige is based on
    baseAmount() {return player.v.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 22, // Row the layer is in on the tree (0 is the first row)
    displayRow: 21,
    hotkeys: [
        {key: "V", description: "Shift + V: Reset for Visualising points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["v", "timeline"],
    layerShown(){return true},
})

addLayer("w", {
    name: "W", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#99FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "W points", // Name of prestige currency
    baseResource: "V points", // Name of resource prestige is based on
    baseAmount() {return player.v.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 22, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: Reset for W points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["v"],
    layerShown(){return true},
})

addLayer("x", {
    name: "X", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "X", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#55FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "X points", // Name of prestige currency
    baseResource: "W points", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 23, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "x", description: "X: Reset for X points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["w"],
    layerShown(){return true},
})

addLayer("y", {
    name: "Y", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#11FF00",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Y points", // Name of prestige currency
    baseResource: "X points", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 24, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "y", description: "Y: Reset for Y points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["x"],
    layerShown(){return true},
})

addLayer("z", {
    name: "Z", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Z", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FF33",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Z points", // Name of prestige currency
    baseResource: "Y points", // Name of resource prestige is based on
    baseAmount() {return player.y.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 25, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "z", description: "Z: Reset for Z points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["y"],
    layerShown(){return true},
})

addLayer("zenith", {
    name: "Zenith", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ZE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00FF77",
    requires(){ 
        let requirement = new Decimal(50);
       return requirement},  // Can be a function that takes requirement increases into account
    resource: "Zeniths", // Name of prestige currency
    baseResource: "Z points", // Name of resource prestige is based on
    baseAmount() {return player.z.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 26, // Row the layer is in on the tree (0 is the first row)
    displayRow: 25,
    hotkeys: [
        {key: "Z", description: "Shift + Z: Reset for Zeniths", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["z", "visualise"],
    layerShown(){return true},
})
