addLayer("p", {
    name: "particles", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "#DC4B13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "particles", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 21)) mult = mult.mul(2)

        if (hasChallenge("e", 11)) mult = mult.mul(challengeEffect("e", 11))

        if (hasMilestone("a", 1)) mult = mult.mul(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (inChallenge("e", 12)) exp = exp.mul(0.5)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            title: "Protons",
            cost(x) { return new Decimal(1).mul(x).add(1) },
            display() { return "Increase point gain by " + this.effect() + 
            " (x" + getBuyableAmount(this.layer, 12).add(1).pow(getBuyableAmount(this.layer, 13).add(1)).round() + ")" + 
            "<br> You Have " + getBuyableAmount(this.layer, this.id) + " Protons" +
            "<br>Cost: " + format(this.cost(getBuyableAmount(this.layer, this.id))) + " particles" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return getBuyableAmount(this.layer, this.id) },
        },
        12: {
            title: "Neutrons",
            cost(x) { if (x.eq(0)) return new Decimal(10); else return new Decimal(10).mul(x.add(1)).pow(x.div(2)); },
            display() { return "Multiply Proton effect and point gain by " + this.effect() + 
            " (^" + getBuyableAmount(this.layer, 13).round().add(1) + ")" + 
            "<br> You Have " + getBuyableAmount(this.layer, this.id) + " Neutrons" +
            "<br>Cost: " + format(this.cost(getBuyableAmount(this.layer, this.id))) + " particles" },
            canAfford() { 
                if (inChallenge("e", 11) && getBuyableAmount(this.layer, this.id).gte(1)) return false
                return player[this.layer].points.gte(this.cost()) 
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return getBuyableAmount(this.layer, this.id).add(1) },
        },
        13: {
            title: "Electrons",
            cost(x) { if (x.eq(0)) return new Decimal(100); else return new Decimal(10).pow(x.add(2)); },
            display() { return "Raise Neutron effect to the power of " + this.effect() + 
            "<br> You Have " + getBuyableAmount(this.layer, this.id) + " Electrons" +
            "<br>Cost: " + format(this.cost(getBuyableAmount(this.layer, this.id))) + " particles" },
            canAfford() { 
                if (inChallenge("e", 11) && getBuyableAmount(this.layer, this.id).gte(1)) return false
                return player[this.layer].points.gte(this.cost()) 
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { if (!hasUpgrade("p", 13)) return getBuyableAmount(this.layer, this.id).add(1)
            else return getBuyableAmount(this.layer, this.id).add(1).add(upgradeEffect("p", 13)).toPrecision(3) },
        },
    },
    upgrades: {
        11: {
            title: "Stable Protons",
            description: "Protons are now twice as powerful.",
            cost: new Decimal(50),
            unlocked() { return getBuyableAmount(this.layer, 12).gte(1) },
        },
        12: {
            title: "Proton Power!",
            description: "Protons get a boost based on your points.",
            cost: new Decimal(200),
            unlocked() { return getBuyableAmount(this.layer, 13).gte(1) },
            effect() { return player.points.add(1).log(10).add(1).pow(0.85) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        13: {
            title: "Electrolysis",
            description: "Electrons effect is now improved by your best amount of particles.",
            cost: new Decimal(1500),
            unlocked() { return getBuyableAmount(this.layer, 13).gte(2) },
            effect() { return player[this.layer].best.add(1).log(10).add(1).pow(0.75) },
            effectDisplay() { return "+" + format(this.effect()) },
        },
        21: {
            title: "Particles Galore",
            description: "Gain twice as many particles.",
            cost: new Decimal(15000),
            unlocked() { return getBuyableAmount(this.layer, 13).gte(3) },
        },
        22: {
            title: "The Electron Effect",
            description: "The Electron effect also affects your points at a greatly reduced rate.",
            cost: new Decimal(200000),
            unlocked() { return getBuyableAmount(this.layer, 13).gte(4) },
            effect() { return getBuyableAmount(this.layer, 13).add(1).pow(0.5) },
            effectDisplay() { return "^" + format(this.effect()) },
        },
        23: {
            title: "Pushing to the Max",
            description: "Particles boost the Proton effect.",
            cost: new Decimal(2000000),
            unlocked() { return hasChallenge("e", 12) },
            effect() { return player[this.layer].points.add(1).log(10).add(1).pow(0.5) },
            effectDisplay() { return "x" + format(this.effect()) },
        },
    },
})

addLayer("a", {
    name: "atoms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#34568B",
    requires: new Decimal("3.5e6"), // Can be a function that takes requirement increases into account
    resource: "atoms", // Name of prestige currency
    baseResource: "particles", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
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
        {key: "a", description: "A: Reset for atoms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return getBuyableAmount("p", 13).gte(5) || player[this.layer].unlocked},
    branches: ["p"],
    milestones: {
        0: {
            requirementDescription: "1 Total Atoms",
            effectDescription: "Unlock the Element Challenges.",
            done() { return player[this.layer].total.gte(1) },
        },
        1: {
            requirementDescription: "2 Total Atoms",
            effectDescription: "Multiply point and particle gain by 10.",
            done() { return player[this.layer].total.gte(2) },
        },
        2: {
            requirementDescription: "5 Total Atoms",
            effectDescription: "Unlock Heat and a new Element Challenge.",
            done() { return player[this.layer].total.gte(5) },
        },
    },
    upgrades: {
        11: {
            title: "Atomic Aid",
            description: "Gain a buff to point generation based on atoms.",
            cost: new Decimal(1),
            effect() { return player[this.layer].points.add(5).pow(0.75) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
    },
})
addLayer("e", {
    name: "elements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#34568B",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "elements", // Name of prestige currency
    baseResource: "atoms", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("a", 0) || player[this.layer].unlocked},
    branches: ["a"],
    challenges: {
        11: {
            name: "Hydrogen",
            challengeDescription: "You can only buy 1 Neutron and 1 Electron.",
            canComplete() { return player.p.points.gte(1000) },
            goalDescription: "1000 Particles",
            rewardDescription: "Protons give a boost to particle production.",
            rewardEffect() { return getBuyableAmount("p", 11).add(10).log(10) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return hasMilestone("a", 0) },
            onExit() { if (player[this.layer].points.lt(1)) player[this.layer].points = new Decimal(1) },
        },
        12: {
            name: "Helium",
            challengeDescription: "Particle gain is now ^0.5.",
            canComplete() { return getBuyableAmount("p", 12).gte(5) },
            goalDescription: "5 Neutrons",
            rewardDescription: "Unlock a new upgrade.",
            unlocked() { return hasMilestone("a", 2) },
            onExit() { if (player[this.layer].points.lt(2)) player[this.layer].points = new Decimal(2) },
        },
    },
})
var hot = true
addLayer("h", {
    name: "heat", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#34568B",
    requires: new Decimal("5e10"), // Can be a function that takes requirement increases into account
    resource: "heat", // Name of prestige currency
    baseResource: "particles", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("a", 2) || player[this.layer].unlocked},
    branches: ["a"],
    clickables: {
        11: {
            title: "Heat Generator",
            display() { if (hot) return "Current Mode: Hot<br>" + this.effect().toString() + "x multiplier to electron exponent"
            else return "Current Mode: Cold<br>" + this.effect().toString() + "^ to neutron and proton multipliers" },
            unlocked() { return hasMilestone("a", 2) },
            effect() { hot = !hot 
            if (!hot) return player.h.points.add(1).mul(3)
            else return player.h.points.add(1).pow(1.05).toPrecision(3) 
            },
            cost: new Decimal(1),
        },
    },
})