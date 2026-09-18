let info = {
    modFiles: ["layers.js", "tree.js"],
}

addLayer("s", {
    name: "stringify", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
	    points: new Decimal(0),
    }},
    color: "#00FFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "strings", // Name of prestige currency
    baseResource: "planck lenghts", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(player.a.points.add(1).pow(1.25))
        if (hasUpgrade('s', 13)) mult = mult.times(3)
        if (hasUpgrade('s', 14)) mult = mult.times(1.5)
        if (hasUpgrade('s', 23)) mult = mult.times(5)
        if (hasUpgrade('s', 24)) mult = mult.times(upgradeEffect('s', 24))
        if (hasUpgrade('q', 11)) mult = mult.times(1.75)
        if (hasMilestone('q', 0)) mult = mult.times(3)
        if (hasUpgrade('q', 12)) mult = mult.times(upgradeEffect('q', 12))
        if (hasMilestone('q', 1)) mult = mult.times(2.5)
        if (hasUpgrade('q', 13)) mult = mult.times(5)
        if (hasUpgrade('a', 11)) mult = mult.times(2.65)
        if (hasUpgrade('a', 13)) mult = mult.times(4)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for strings", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() { return (hasMilestone("q", 2))?1:0 },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("av", 1) && resettingLayer=="av") keep.push("upgrades")
        if (hasMilestone("av", 1) && resettingLayer=="q") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("s", keep)
    },
    upgrades: {
        11: {
            title: "Universal Booster I",
            description: "Double your planck lenght gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Universal Booster II",
            description: "Triple your planck lenght gain.",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade('s', 11)},
        },
        13: {
            title: "Strings, STRINGS!",
            description: "x2.5 your string gain.",
            cost: new Decimal(8),
            unlocked() {return hasUpgrade('s', 12)},
        },
        14: {
            title: "Strings and planck lenghts",
            description: "x1.5 your planck lenght and string gain.",
            cost: new Decimal(30),
            unlocked() {return hasUpgrade('s', 13)},
        },
        21: {
            title: "funny booster ig",
            description: "Boost planck lenght gain based on strings",
            cost: new Decimal(75),
            unlocked() {return hasUpgrade('s', 14)},
            effect() {
                return player[this.layer].points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        22: {
            title: "funny booster again",
            description: "Boost planck lenght gain based on planck lenght",
            cost: new Decimal(150),
            unlocked() {return hasUpgrade('s', 21)},
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title: "Universal Booster III",
            description: "x5 your string gain.",
            cost: new Decimal(500),
            unlocked() {return hasUpgrade('s', 22)},
        },
        24: {
            title: "the last funny booster",
            description: "Boost string gain based on planck lenght",
            cost: new Decimal(2000),
            unlocked() {return hasUpgrade('s', 23)},
            effect() {
                return player.points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})

addLayer("q", {
    name: "quarkify", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["s"],
    color: "#32CD32",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "quarks", // Name of prestige currency
    baseResource: "strings", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('q', 14)) mult = mult.times(upgradeEffect('q', 14))
        if (hasUpgrade('q', 21)) mult = mult.times(5.5)
        if (hasUpgrade('q', 22)) mult = mult.times(6)
        if (hasMilestone('av', 0)) mult = mult.times(10)
        if (hasUpgrade('av', 12)) mult = mult.times(5)
        if (hasUpgrade('av', 14)) mult = mult.times(upgradeEffect('av', 14))
        if (hasUpgrade('av', 21)) mult = mult.times(upgradeEffect('av', 21))
        if (hasUpgrade('a', 11)) mult = mult.times(7.5)
        if (hasUpgrade('a', 12)) mult = mult.times(4.5)
        if (hasUpgrade('a', 13)) mult = mult.times(4)
        if (hasUpgrade('a', 14)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.s.unlocked},
    upgrades: {
        11: {
            title: "Quark Booster I",
            description: "x1.75 your planck lenght and string gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Quark Booster II",
            description: "Boost string gain based on quarks",
            cost: new Decimal(4),
            unlocked() {return hasUpgrade('q', 11)},
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "Quark Booster III",
            description: "x5 your string gain.",
            cost: new Decimal(35),
            unlocked() {return hasUpgrade('q', 12)},
        },
        14: {
            title: "Quark Booster IV",
            description: "Boost quark gain based on quarks",
            cost: new Decimal(1e8),
            unlocked() {return hasUpgrade('q', 13)},
            effect() {
                return player[this.layer].points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "Quark Booster V",
            description: "x5.5 your quark gain.",
            cost: new Decimal(1.5e14),
            unlocked() {return hasUpgrade('q', 14)},
        },
        22: {
            title: "Quark Booster VI",
            description: "x6 your quark gain.",
            cost: new Decimal(5e25),
            unlocked() {return hasUpgrade('q', 21)},
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 Quarks",
            done() {return player.q.best.gte(2)},
            effectDescription: "Triple your string gain.",
        },
        1: {
            requirementDescription: "10 Quarks",
            done() {return player.q.best.gte(10)},
            effectDescription: "x2.5 your string gain.",
        },
        2: {
            requirementDescription: "10,000 Quarks",
            done() {return player.q.best.gte(10000)},
            effectDescription: "Gain 100% of strings gain per second",
        },
    },
})

addLayer("av", {
    name: "advance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AV", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["s"],
    color: "#EFD936",
    requires: new Decimal(1e7), // Can be a function that takes requirement increases into account
    resource: "advancements", // Name of prestige currency
    baseResource: "strings", // Name of resource prestige is based on
    base: new Decimal(1e7),
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "ctrl+a", description: "CTRL+A: Reset for advancements", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.q.unlocked},
    canBuyMax() { return (hasMilestone("av", 2))},
    upgrades: {
        11: {
            title: "More Planck Lenght",
            description: "Boost planck lenght gain based on quarks.",
            cost: new Decimal(1),
            effect() {
                return player.q.points.add(1).pow(0.75)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Epic Booster",
            description: "x5 your quark gain",
            cost: new Decimal(3),
            unlocked() {return hasUpgrade('av', 11)},
        },
        13: {
            title: "Advancement Booster I",
            description: "Boost planck lenght gain based on advancements",
            cost: new Decimal(4),
            unlocked() {return hasUpgrade('av', 12)},
            effect() {
                return player[this.layer].points.add(1).pow(3.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Advancement Booster II",
            description: "Boost quark gain based on advancements",
            cost: new Decimal(12),
            unlocked() {return hasUpgrade('av', 13)},
            effect() {
                return player[this.layer].points.add(1).pow(0.85)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Advancement Booster II",
            description: "Boost quark gain based on advancements",
            cost: new Decimal(6),
            unlocked() {return hasUpgrade('av', 13)},
            effect() {
                return player[this.layer].points.add(1).pow(0.9)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "Quarky Quark",
            description: "Boost quark gain based on quarks",
            cost: new Decimal(7),
            unlocked() {return hasUpgrade('av', 14)},
            effect() {
                return player.q.points.add(1).pow(0.0235)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 Advancements",
            done() {return player.av.best.gte(2)},
            effectDescription: "x10 Quarks",
        },
        1: {
            requirementDescription: "5 Advancements",
            done() {return player.av.best.gte(5) || hasMilestone('a', 0) },
            effectDescription: "Keep string upgrades on advance and quarkify",
        },
        2: {
            requirementDescription: "15 Advancements",
            done() {return player.av.best.gte(15)},
            effectDescription: "You can now max buy advancements",
        },
    },
})

addLayer("a", {
    name: "atomize", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["av", "q"],
    color: "#00599B",
    glowColor: "#00599B",
    requires: new Decimal(1e40), // Can be a function that takes requirement increases into account
    resource: "atoms", // Name of prestige currency
    baseResource: "quarks", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.075, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for atoms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.av.unlocked},
    effectDescription() {
        return "which are boosting planck lenghts and strings by x"+format(player.a.points.add(1).pow(1.25))
    },
    upgrades: {
        11: {
            title: "Planck lenghter V1000",
            description: "x7.5 your quark gain and x2.65 your planck lenght and string gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "WE NEED THE QUARKS",
            description: "x4.5 your quark gain.",
            cost: new Decimal(4),
        },
        13: {
            title: "do we actually need the quarks",
            description: "x4 your quark and string gain",
            cost: new Decimal(6),
        },
        14: {
            title: "BIG JUMP",
            description: "x10 your quark gain",
            cost: new Decimal(10000),
        },
    },
    milestones: {
        0: {
            requirementDescription: "5 Atoms",
            done() {return player.a.best.gte(5)},
            effectDescription: "Keep advancement's milestone 2 on row 2 reset",
            unlocked() {return hasUpgrade('a', 12)},
        }
    }
})
