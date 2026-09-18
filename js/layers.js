addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    branches: ["r","sp","sr"],
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 12)) mult = mult.times(upgradeEffect('p', 12))
        if (hasUpgrade('ar', 12)) mult = mult.times(upgradeEffect('ar', 12))
        if (hasUpgrade('y', 12)) mult = mult.times(upgradeEffect('y', 12))
        if (hasUpgrade('y', 13)) mult = mult.times(upgradeEffect('y', 13))
        if (hasUpgrade('c', 12)) mult = mult.times(upgradeEffect('c', 12))
        if (hasMilestone('c', 1)) mult = mult.times("e2500")
        if (hasUpgrade('cp', 12)) mult = mult.times("6.9e69420")
        if (hasUpgrade('E', 11)) mult = mult.times("1e500")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Yes",
            description: "Double point gain because of yes.",
            cost: new Decimal(1),
        },

        12: {
            title: "Better Yes",
            description: "Scales with your prestige points! (Also boosts PP gain.)",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        13: {
            title: "The Heheheha",
            description: "Scales with your prestige points! (But ^0.1)",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        14: {
            title: "Super Yes",
            description: "Quadruple point gain because of yes.",
            cost: new Decimal(100),
        },

        15: {
            title: "Fortnite Gaming",
            description: "Get pro at fortnite 100x Point Gain!!!",
            cost: new Decimal(10000),
        },
    },
})
addLayer("r", {
    name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Blue",
    branches: ["ar"],
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "Rebirth Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
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
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Amogus",
            description: "Does 10x point gain.",
            cost: new Decimal(10),
        },

        12: {
            title: "The Aswdasrfege Theory",
            description: "(Literally every science tihng ever) Multiply point gain by 1,000,000",
            cost: new Decimal(50),
        },

        13: {
            title: "More Pointssssssssssssss",
            description: "Costs so much but gives x1e50 point gain.",
            cost: new Decimal(1e6),
        },
    },
})
addLayer("sp", {
    name: "superprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00e4ff",
    branches: ["y"],
    requires: new Decimal(1e23), // Can be a function that takes requirement increases into account
    resource: "Super Prestige Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('sr', 12)) mult = mult.times(upgradeEffect('sr', 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none6", description: "None: Reset for super prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Less Memes",
            description: "NOOOOOOOOOOOOOOOOOO! Points scale with amount of SPP. (^0.5)",
            cost: new Decimal(500),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "More Points II",
            description: "Multiplies SPP by something",
            cost: new Decimal(1500),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        
        13: {
            title: "More Points III",
            description: "Multiplies SPP by something",
            cost: new Decimal(500000),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})
addLayer("sr", {
    name: "superrebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0c0d5f",
    branches: ["b"],
    requires: new Decimal(1e23), // Can be a function that takes requirement increases into account
    resource: "Super Rebirth Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
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
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none5", description: "none: Reset for super rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Bruh",
            description: "Does Bruh",
            cost: new Decimal(11111),
        },

        12: {
            title: "YesYes",
            description: "Multiplies SPP by a lot.",
            cost: new Decimal(1500),
            effect() {
                return player[this.layer].points.times(1.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})

addLayer("b", {
    name: "bruh", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Grey",
    branches: ["a"],
    requires: new Decimal("e69420"), // Can be a function that takes requirement increases into account
    resource: "Bruhs", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('b', 12)) mult = mult.times(upgradeEffect('b', 12))
        if (hasUpgrade('l', 11)) mult = mult.times("1e5000")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "b: Reset for Bruhs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "More Bruh",
            description: "Bruh is best meme 10/10.",
            cost: new Decimal(69.420),
        },

        12: {
            title: "Bruhhhhhhhhhh",
            description: "Bruhhhhhhhhh I was playing fortnite!",
            cost: new Decimal(69420),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})
addLayer("ar", {
    name: "AmogusRebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Red",
    branches: ["sb"],
    requires: new Decimal("e70"), // Can be a function that takes requirement increases into account
    resource: "Amogus Rebirth Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "a: Reset for Amogus Rebirths no r ;-;", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Imposter Amogus",
            description: "Scaling thing again. Also gives x1,000,000 point.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "Multiply PP",
            description: "Multiplies PP by 10",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).times(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        13: {
            title: "Fard",
            description: "But I thought fards = :skull:",
            cost: new Decimal(3),
        },

        14: {
            title: "Anti-Fard",
            description: " ------------------------(WARNING: YOU NEED FARD FOR IT TO DO SOMETHING!)-------------------------------                                       Remove Fard Boost But Get Scaling! Formula: Points = Points + 1^1.2 times 1e125.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).pow(1.2).times(1e125)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        15: {
            title: "Xing Ming",
            description: "Xing Xong. Times 1,000,000 Points.",
            cost: new Decimal(50),
        },

        16: {
            title: "Yes Returns",
            description: "Yes likes you. x1e9 Points.",
            cost: new Decimal(100),
        },
    },
})
addLayer("y", {
    name: "Yes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Green",
    branches: ["c"],
    requires: new Decimal("e150"), // Can be a function that takes requirement increases into account
    resource: "Yes", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('y', 15)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "y", description: "y: Reset for Yes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Yes Class",
            description: "Go to yes class. Points times 1e20",
            cost: new Decimal("e10"),
        },

        12: {
            title: "Multiply PP II",
            description: "Multiplies PP by 1e6 base!",
            cost: new Decimal("e50"),
            effect() {
                return player[this.layer].points.add(1).times("e6")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        13: {
            title: "Multiply PP III",
            description: "x1e10 base...",
            cost: new Decimal("e100"),
            effect() {
                return player[this.layer].points.add(1).times("e10")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        14: {
            title: "Yessir",
            description: "New Yes?",
            cost: new Decimal("e250"),
        },

        15: {
            title: "MORE YES",
            description: "Yes earnings x10",
            cost: new Decimal("e1500"),
        },

        16: {
            title: "Meme Reset",
            description: "Every meme go :skull:",
            cost: new Decimal("e2500"),
        },
    },
})

addLayer("c", {
    name: "Cheetos", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Yellow",
    branches: ["cb"],
    requires: new Decimal("e1000"), // Can be a function that takes requirement increases into account
    resource: "Cheetos", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "c: Reset for Cheetos!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
            toggleAuto();
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Feed the kid in your basement",
            description: "Wait wha- x1e5000 Points",
            cost: new Decimal("1"),
        },

        12: {
            title: "Multiply PP IV",
            description: "Multiplies PP by 1e50 base!",
            cost: new Decimal("50"),
            effect() {
                return player[this.layer].points.add(1).times("e50")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },

    milestones: {
        0: {
            requirementDescription: "25 Cheetos",
            effectDescription: "NOT Auto Cheeto. U just get to be cool.",
            tooltip:"More food",
            done() { return player.c.points.gte(25) }
        },

        1: {
            requirementDescription: "50 Cheetos",
            effectDescription: "x1e2500 PP.",
            tooltip:"More PP yesssssssss",
            done() { return player.c.points.gte(50) }
        }
    },    
})
addLayer("cb", {
    name: "CheetoBags", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#b45f06",
    branches: ["cc"],
    requires: new Decimal("125"), // Can be a function that takes requirement increases into account
    resource: "Cheeto Bags", // Name of prestige currency
    baseResource: "Cheetos", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('cb', 11)) mult = mult.times(100)
        if (hasMilestone('cb', 0)) mult = mult.times("10")
        if (hasUpgrade('cb', 12)) mult = mult.times(1000)
        if (hasUpgrade('cb', 13)) mult = mult.times("1e6")
        if (hasUpgrade('cb', 14)) mult = mult.times("1e10")
        if (hasUpgrade('cb', 15)) mult = mult.times("1e20")
        if (hasUpgrade('cb', 16)) mult = mult.times("1e40")
        if (hasUpgrade('cb', 17)) mult = mult.times("1e69")
        if (hasUpgrade('cb', 18)) mult = mult.times("1e100")
        if (hasUpgrade('cb', 19)) mult = mult.times("1e150")
        if (hasUpgrade('cb', 21)) mult = mult.times("1e250")
        if (hasUpgrade('cb', 22)) mult = mult.times("1e250")
        if (hasUpgrade('cc', 12)) mult = mult.times("1e500")
        if (hasUpgrade('cc', 14)) mult = mult.times("1e25")
        if (hasUpgrade('cp', 11)) mult = mult.times("1e2500")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none4", description: "none: Reset for Cheeto Bags!", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "More CHEEZ",
            description: "x100 CB",
            cost: new Decimal("1"),
        },

        12: {
            title: "More CHEEZ II",
            description: "x1000 CB",
            cost: new Decimal("1e4"),
        },

        13: {
            title: "More CHEEZ III",
            description: "x1e6 CB",
            cost: new Decimal("0.5e8"),
        },

        14: {
            title: "More CHEEZ IV",
            description: "x1e10 CB",
            cost: new Decimal("5e13"),
        },

        15: {
            title: "More CHEEZ V",
            description: "x1e20 CB",
            cost: new Decimal("1e24"),
        },

        16: {
            title: "More CHEEZ VI",
            description: "x1e40 CB",
            cost: new Decimal("2.5e43"),
        },

        17: {
            title: "More CHEEZ VII",
            description: "x1e69 CB",
            cost: new Decimal("1e84"),
        },

        18: {
            title: "More CHEEZ VIII",
            description: "x1e100 CB",
            cost: new Decimal("5e152"),
        },

        19: {
            title: "More CHEEZ IX",
            description: "x1e150 CB",
            cost: new Decimal("1.55e253"),
        },

        21: {
            title: "More CHEEZ X",
            description: "x1e250 CB",
            cost: new Decimal("1.55e402"),
        },

        22: {
            title: "More CHEEZ XI",
            description: "x1e250 CB",
            cost: new Decimal("1.25e652"),
        },
    },
    milestones: {
        0: {
            requirementDescription: "500 Cheeto Bags",
            effectDescription: "x10 Cheeto Bags",
            tooltip:"Ok",
            done() { return player.cb.points.gte(500) }
        },
    },
})
addLayer("cc", {
    name: "CheetoCubes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#5a3208",
    branches: ["cp"],
    requires: new Decimal("1e903"), // Can be a function that takes requirement increases into account
    resource: "Cheeto Cubes", // Name of prestige currency
    baseResource: "Cheeto Bags", // Name of resource prestige is based on
    baseAmount() {return player.cb.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('cc', 11)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none3", description: "None: Reset for Cheeto Cubes!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "More Compact Cubes",
            description: "x2 CC",
            cost: new Decimal("10"),
        },

        12: {
            title: "Bags Galore",
            description: "x1e500 CB!",
            cost: new Decimal("1e18"),
        },

        13: {
            title: "Mega Multi",
            description: "x1e25000 Points",
            cost: new Decimal("1"),
        },

        14: {
            title: "I got cheetosssssssssssssssssss. In a bag.",
            description: "x1e25 CB",
            cost: new Decimal("3"),
        },
    },  
})

addLayer("a", {
    name: "Ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "White",
    branches: ["E", "l"],
    requires: new Decimal("5e150000"), // Can be a function that takes requirement increases into account
    resource: "Ascensions", // Name of prestige currency
    baseResource: "Bruhs", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.6, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('a', 11)) mult = mult.times("100")
        if (hasUpgrade('a', 12)) mult = mult.times("1e6")
        if (hasUpgrade('E', 11)) mult = mult.times("1e24")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none2", description: "None: Reset for Ascensions!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Ascend",
            description: "Ascend. x100",
            cost: new Decimal("1"),
        },

        12: {
            title: "Ascend More",
            description: "x1e6 Ascensions",
            cost: new Decimal("e100"),
        },
        
        13: {
            title: "More Ideas",
            description: "x100 Ideas (Trust me ideas are like important)",
            cost: new Decimal("e100"),
        },  
    }
})
addLayer("cp", {
    name: "CheetoPlanets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#6a329f",
    branches: ["None"],
    requires: new Decimal("5e393"), // Can be a function that takes requirement increases into account
    resource: "Cheeto Planets", // Name of prestige currency
    baseResource: "Cheeto Cubes", // Name of resource prestige is based on
    baseAmount() {return player.cc.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none", description: "None: Reset for Cheeto Planets!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Cheeto Aliens",
            description: "First species to be started on your new cheeto planet. x1e2500 CB",
            cost: new Decimal("1"),
        },

        12: {
            title: "Too Much Cheetos",
            description: "'But I thought there was never too much of a good thing...'-Timmy's Last Words. Finish off the cheeto chain? x6.9e69420 PP...",
            cost: new Decimal("3"),
    },  
    }
})

addLayer("E", {
    name: "Enlightenment", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "White",
    branches: ["c2"],
    canBuyMax:"true",
    requires: new Decimal("1e1500"), // Can be a function that takes requirement increases into account
    resource: "Enlightened Energy", // Name of prestige currency
    baseResource: "Ascensions", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('qu', 12)) mult = mult.times("1e6")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for Enlightenment!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Enlightenment",
            description: "You are now enlightened. x1e24 Ascensions.",
            cost: new Decimal("1"),
        },
        12: {
            title: "Creativity",
            description: "Get the ability to unlock the creativity stat without it giving 0.",
            cost: new Decimal("3"),
        },
    },
    achievements: {
        11: {
            name: "Heheheha",
            goalTooltip:"Get 1 Enlightenment Energy",
            doneTooltip:"You are now heheheheha!",
            image:"img/heheheha.png",
            done() { return player.E.points.gte(1) }
        },
    }
})
addLayer("l", {
    name: "Light", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "White",
    branches: ["None"],
    requires: new Decimal("1e1500"), // Can be a function that takes requirement increases into account
    resource: "Light", // Name of prestige currency
    baseResource: "Ascensions", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('l', 12)) mult = mult.times("500")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for light!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Glowy Orb",
            description: "The first light to exist. x1e5000 Bruhs.",
            cost: new Decimal("1"),
        },

        12: {
            title: "A Lamp",
            description: "L A M P (x500 Light)",
            cost: new Decimal("1"),
        },
    },
})
addLayer("c2", {
    name: "Creativity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Brown",
    resetsNothing:"true",
    branches: ["qu", "v", "k"],
    requires: new Decimal("10"), // Can be a function that takes requirement increases into account
    resource: "Ideas", // Name of prestige currency
    baseResource: "Enlightened Energy", // Name of resource prestige is based on
    baseAmount() {return player.E.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(0)
        if (hasUpgrade('E', 12)) mult = mult.add("1")
        if (hasUpgrade('a', 13)) mult = mult.times("100")
        if (hasUpgrade('qu', 12)) mult = mult.times("50")
        if (hasUpgrade('v', 12)) mult = mult.times("1e6")
        if (hasUpgrade('qu', 14)) mult = mult.times("5000")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none6", description: "None: Reset for creativity!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "The invention of x1e50000 Points. (Note: Creativity is basically a hub for many trees to start. So it is recommended you have a lot of it.)",
            description: "Read the title",
            cost: new Decimal("1"),
        },
    },
})
addLayer("qu", {
    name: "QuantumFluctuations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "QU", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Grey",
    resetsNothing:"true",
    branches: ["g", "p2","qf"],
    requires: new Decimal("5000"), // Can be a function that takes requirement increases into account
    resource: "Quantum Fluctuations", // Name of prestige currency
    baseResource: "Creativity", // Name of resource prestige is based on
    baseAmount() {return player.c2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('qu', 11)) mult = mult.times("3")
        if (hasUpgrade('qu', 12)) mult = mult.times("20")
        if (hasUpgrade('qu', 13)) mult = mult.times("1500")
        if (hasUpgrade('qu', 15)) mult = mult.times("1e6")
        if (hasUpgrade('k', 12)) mult = mult.times("1e10")
        if (hasUpgrade('g', 14)) mult = mult.times("5e5")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none7", description: "None: Reset for Quantum Fluctations!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Cosmic Shift",
            description: "There has been a shift in the cosmos. x3 QU.",
            cost: new Decimal("1"),
        },

        12: {
            title: "Quantum Physics",
            description: "Ayyyyyyyyyy. Quantum physics exist now. x20 QU, x50 Ideas & x1e6 EE.",
            cost: new Decimal("1"),
        },

        
        13: {
            title: "Time travel",
            description: "Speeds up the process thus giving you x1000 QU.",
            cost: new Decimal("1500"),
        },

        14: {
            title: "Mega Mind",
            description: "BIG BRAIN. x5000 Ideas.",
            cost: new Decimal("1500"),
        },

        15: {
            title: "Scientists that study quantum physics",
            description: "Studying is broing lol. x1e6 QU.",
            cost: new Decimal("1e12"),
        },

        15: {
            title: "K N O W L E D G E",
            description: "Unlock Knowledge (A sub of Creativity) to study more quantum physics to progress.",
            cost: new Decimal("1e14"),
        },
    },
})
addLayer("v", {
    name: "Value", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Gold",
    resetsNothing:"true",
    branches: ["None"],
    requires: new Decimal("1e6"), // Can be a function that takes requirement increases into account
    resource: "Valueables", // Name of prestige currency
    baseResource: "Creativity", // Name of resource prestige is based on
    baseAmount() {return player.c2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('v', 12)) mult = mult.times("3")
        if (hasUpgrade('v', 13)) mult = mult.times("0.5")
        if (hasUpgrade('g', 12)) mult = mult.times("50")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none8", description: "None: Reset for Value!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Pure Gold",
            description: "M O N E Y. x1e150000 Points",
            cost: new Decimal("3"),
        },

        12: {
            title: "Gold Bars",
            description: "Gold but better. x1e6 Ideas + x3 Gold",
            cost: new Decimal("100"),
        },

        13: {
            title: "Heavier Gold",
            description: "Gold is now heavier meaning less can be earned. Gravity x1000 & Valueables /2.",
            cost: new Decimal("50000"),
        },
    },
})
addLayer("g", {
    name: "Gravity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "Red",
    resetsNothing:"true",
    branches: ["None"],
    requires: new Decimal("1e30"), // Can be a function that takes requirement increases into account
    resource: "Gravity", // Name of prestige currency
    baseResource: "Quantum Fluctuations", // Name of resource prestige is based on
    baseAmount() {return player.qu.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('g', 11)) mult = mult.times("2")
        if (hasUpgrade('v', 13)) mult = mult.times("1000")
        if (hasUpgrade('g', 12)) mult = mult.times("0.5")
        if (hasUpgrade('g', 13)) mult = mult.times("1e6")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none9", description: "None: Reset for Gravity!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Better Gravity",
            description: "Now Bigger = Stronger Gravity! Now basically nothing goes in one direction. (x2 Gravity)",
            cost: new Decimal("1"),
        },

        12: {
            title: "Lighter Objects",
            description: "Less gravity required so it gets halfed. But valueables x50. (Gravity /2 & Valueables x50)",
            cost: new Decimal("1e5"),
        },

        13: {
            title: "Denseity",
            description: "More densely packed plantes and mroe gravity. x1e6 Gravity.",
            cost: new Decimal("1.5e5"),
        },

        14: {
            title: "Particles",
            description: "OOOOOO First form of matter! (x5e5 QU & Unlocks Particles)",
            cost: new Decimal("1e11"),
        },
    },
})
addLayer("k", {
    name: "Knowledge", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "K", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#30E080",
    branches: ["None"],
    requires: new Decimal("5e13"), // Can be a function that takes requirement increases into account
    resource: "Knowledge", // Name of prestige currency
    baseResource: "Ideas", // Name of resource prestige is based on
    baseAmount() {return player.c2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(0)
        if (hasUpgrade('qu', 15)) mult = mult.add("1")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "k", description: "k: Reset for Knowledge!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Point Research",
            description: "Knowledge now gives you points. Scaling with a base of x1e50000.",
            cost: new Decimal("1"),
            effect() {
                return player[this.layer].points.add(1).times("e50000")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        12: {
            title: "Study Quantum Physics",
            description: "More smart on Quantum Physics. x5e10 QU.",
            cost: new Decimal("1"),
        },

        13: {
            title: "Study The Particles Theory/ Kinetic Theory Of Matter",
            description: "'All matter consists of many, very small particles which are constantly moving or in a continual state of motion. The degree to which the particles move is determined by the amount of energy they have and their relationship to other particles.' x1e6 Particles.",
            cost: new Decimal("2500"),
        },
    },
})
addLayer("p2", {
    name: "Particles", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00faff",
    resetsNothing:"true",
    branches: ["None"],
    requires: new Decimal("1e35"), // Can be a function that takes requirement increases into account
    resource: "Particles", // Name of prestige currency
    baseResource: "Quantum Fluctuations", // Name of resource prestige is based on
    baseAmount() {return player.qu.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(0)
        if (hasUpgrade('g', 14)) mult = mult.add("1")
        if (hasUpgrade('p2', 11)) mult = mult.times("10")
        if (hasUpgrade('k', 13)) mult = mult.times("1e6")
        if (hasUpgrade('p2', 13)) mult = mult.times("1e6")
        if (hasUpgrade('p2', 14)) mult = mult.times("1e10")
        if (hasUpgrade('sb', 14)) mult = mult.times("1e10")
        if (hasUpgrade('p2', 21)) mult = mult.times("1e20")
        if (hasUpgrade('p2', 22)) mult = mult.times("1e5")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none10", description: "None: Reset for Particles!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Particle Accelerators",
            description: "More Particles. x10 Particles.",
            cost: new Decimal("1"),
        },

        12: {
            title: "Quantum Foam",
            description: "Unlocks Quantum Foam!",
            cost: new Decimal("1.5e7"),
        },

        13: {
            title: "More Particles",
            description: "Read the title lol. x1e6 Particles",
            cost: new Decimal("2.5e9"),
        },

        14: {
            title: "More Particles II",
            description: "Oh no not this again... x1e10 Particles",
            cost: new Decimal("1e15"),
        },

        15: {
            title: "Sussy Bakas+",
            description: "Ok good it's not like CB. x1e6 SB.",
            cost: new Decimal("1e25"),
        },

        21: {
            title: "Mega Particle",
            description: "Yes this one particle is 5e1e16 times better than other particle for no reason. x1e20",
            cost: new Decimal("1.5e35"),
        },

        22: {
            title: "Better Mega Particle",
            description: "(I'm out of ideas ok?) Yes this one particle is 17e1e303 times better than other particle for no reason. x1e5",
            cost: new Decimal("1.5e35"),
        },
    },
})
addLayer("qf", {
    name: "QuantumFoam", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "QF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffe5f0",
    resetsNothing:"true",
    branches: ["None"],
    requires: new Decimal("1e36"), // Can be a function that takes requirement increases into account
    resource: "Quantum Foam", // Name of prestige currency
    baseResource: "Quantum Fluctuations", // Name of resource prestige is based on
    baseAmount() {return player.qu.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(0)
        if (hasUpgrade('p2', 12)) mult = mult.add("1")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none11", description: "None: Reset for QF!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Particle Accelerators",
            description: "More Particles. x10 Particles.",
            cost: new Decimal("1"),
        },

        12: {
            title: "Quantum Foam",
            description: "Unlocks Quantum Foam!",
            cost: new Decimal("1.5e7"),
        },

        13: {
            title: "Denseity",
            description: "More densely packed plantes and mroe gravity. x1e6 Gravity.",
            cost: new Decimal("1.5e5"),
        },
    },
})
addLayer("sb", {
    name: "SussyBakas", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#841109",
    branches: ["None"],
    requires: new Decimal("125"), // Can be a function that takes requirement increases into account
    resource: "Sussy Bakas", // Name of prestige currency
    baseResource: "Amogus Rebirth Points", // Name of resource prestige is based on
    baseAmount() {return player.ar.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(0)
        if (hasUpgrade('p2', 12)) mult = mult.add("1")
        if (hasUpgrade('sb', 11)) mult = mult.times("10")
        if (hasUpgrade('sb', 12)) mult = mult.times("1e3")
        if (hasUpgrade('p2', 15)) mult = mult.times("1e6")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "none12", description: "None: Reset for SB!", onPress(){
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Sussy Baka Workers",
            description: "They do work. x10 Sussy Bakas",
            cost: new Decimal("1"),
        },

        12: {
            title: "Sussy Basement",
            description: "Where you keep your slav- Errrrr I mean sussy bakas. x1000 Sussy Bakas.",
            cost: new Decimal("1e3"),
        },

        13: {
            title: "Sussy Hell",
            description: "Where your Sussy Bakas go after they unalive. x1e6 SB (Yup you need upgrades somewhere else.)",
            cost: new Decimal("5e11"),
        },

        14: {
            title: "Particle Boost",
            description: "Particle boost SB. SB boost Particle. Fair Trade. x1e10 Particles",
            cost: new Decimal("1e12"),
        },
    },
})