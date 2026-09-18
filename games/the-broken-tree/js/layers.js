addLayer("a", {
    name: "attention span", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Attention spans", // Name of prestige currency
    baseResource: "ADHD", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    softcap: new Decimal(1000000),
    softcapPower: new Decimal(0.5),
    autoUpgrade: false,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("a", 23)) mult = mult.times(upgradeEffect("a", 23))
        if (hasUpgrade("a", 32)) mult = mult.times(upgradeEffect("a", 32))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("h", 11)) exp = exp.pow(upgradeEffect("h", 11))
        exp = exp.pow(buyableEffect("d", 11))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for Attention spans", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        rows: 3,
        cols: 3,
        11: {
            title: "Generator of Genericness",
            description: "Gain 1 ADHD every second.",
            cost: new Decimal(1),
            unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        12: {
            title: "Dawdling",
            description: "ADHD generation is faster based on your unspent Attention span.",
            cost: new Decimal(1),
            unlocked() { return (hasUpgrade(this.layer, 11))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(2).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5))
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                if (hasUpgrade("a", 31)) ret = ret.pow(upgradeEffect("a", 31))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Harder dawdling",
            description: "ADHD generation is even faster based on your unspent Attention span.",
            cost: new Decimal(5),
            unlocked() { return (hasUpgrade(this.layer, 12))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?1.1:0.9)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        21: {
            title: "Exponential dawdling",
            description: "ADHD generation is faster based on your ADHD.",
            cost: new Decimal(20),
            unlocked() { return (hasUpgrade(this.layer, 12))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.4:0.2)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                if (hasUpgrade("a", 22)) ret = ret.times(upgradeEffect("a", 22))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        22: {
            title: "Logarithmic dawdling",
            description: "The last upgrade is better based on your unspent Attention span.",
            cost: new Decimal(100),
            unlocked() { return (hasUpgrade(this.layer, 21))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.2:0.1)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        23: {
            title: "Dawdled dawdling",
            description: "Attention span gain is better based on your unspent Attention span.",
            cost: new Decimal(1000),
            unlocked() { return (hasUpgrade(this.layer, 22))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.5:0.3)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        31: {
            title: "Doggo",
            description: "Doggo.",
            cost: new Decimal(1e10),
            unlocked() {return hasMilestone("h", 0)},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.1:0.05)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                if (hasUpgrade("d", 11)) ret = ret.times(upgradeEffect("d", 11))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        32: {
            title: "Staring at the clock",
            description: "Attention span gain is faster based on Hyperfixations.",
            cost: new Decimal(1e12),
            unlocked() { return (hasUpgrade(this.layer, 31))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player["h"].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.5:0.3)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
    },
})  
addLayer("h", {
    name: "Hyperfixation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#47eda8",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "Hyperfixations", // Name of prestige currency
    baseResource: "Attention spans", // Name of resource prestige is based on
    baseAmount() {return player["a"].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8, // Prestige currency exponent
    base: 3,
    canBuyMax() {return hasMilestone("h", 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("p", 11)) exp = exp.pow(upgradeEffect("p", 11))
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    hotkeys: [
        {key: "h", description: "H: Reset for Hyperfixations", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "POOOWWWEEEEERRR",
            description: "Add an exponent......... somewhere? Probably based of something.",
            cost: new Decimal(1),
            unlocked: true,
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1.5).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.5:0.25)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                if (hasUpgrade("h", 12)) ret = ret.times(2)
                return ret;
            },
            effectDisplay() { return format(this.effect())+"^" }, // Add formatting to the effect
        },
        12: {
            title: "Where was i?",
            description: "Makes the effect of the previous upgrade better.",
            cost: new Decimal(6),
            unlocked() { return (hasUpgrade(this.layer, 11))},
            effectDisplay() { return "2x" }, // Add formatting to the effect
        },
        13: {
            title: "Ultra-instinct!",
            description: "I swear this does something, cross my heart!.",
            cost: new Decimal(15),
            unlocked() { return (hasUpgrade(this.layer, 12))},
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.3:(player[this.layer].upgrades.includes(14)?0.623:0.211)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
        },
    },
    milestones: {
        0: {requirementDescription: "3 Hyperfixations",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "Unlock extra Upgrades for Attention spans",
        },
        1: {requirementDescription: "10 Hyperfixations",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "Unlock MAX buy for Hyperfixations",
        },
    }
})
addLayer("d", {
    name: "Doggo", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#ff952b",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "Doggo's", // Name of prestige currency
    baseResource: "Attention spans", // Name of resource prestige is based on
    baseAmount() {return player["a"].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8, // Prestige currency exponent
    base: 3,
    canBuyMax() {return hasMilestone("d", 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("q", 11)) exp = exp.pow(upgradeEffect("q", 11))
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    hotkeys: [
        {key: "d", description: "D: Reset for Doggo's", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Puppy",
            description: "Descriptions are hard, have a puppy",
            cost: new Decimal(1),
            unlocked: true,
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.5:0.3)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"^" }, // Add formatting to the effect
        }
    },
    buyables: {
        rows: 1,
        cols: 3,
        showRespec: true,
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
            resetBuyables(this.layer)
            doReset(this.layer, true) // Force a reset
        },
        respecText: "Respec Dogs", // Text on Respec button, optional
        11: {
            title: "Labradors", // Optional, displayed at the top in a larger font
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25)) x = x.pow(2).div(25)
                let cost = Decimal.pow(2, x.pow(1.5))
                return cost.floor()
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(1.1))
                else eff.first = Decimal.pow(1/25, x.times(-1).pow(1.1))
            
                if (x.gte(0)) eff.second = x.pow(0.8)
                else eff.second = x.times(-1).pow(0.8).times(-1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Doggo's\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Adds + " + format(data.effect.first) + " things and multiplies stuff by " + format(data.effect.second)
            },
            unlocked() {return hasMilestone(this.layer, 0)},
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'222px'},
            sellOne() {
                let amount = getBuyableAmount(this.layer, this.id)
                if (amount.lte(0)) return // Only sell one if there is at least one
                setBuyableAmount(this.layer, this.id, amount.sub(1))
                player[this.layer].points = player[this.layer].points.add(this.cost)
            },
        },
    },
    milestones: {
        0: {requirementDescription: "3 Doggo's",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks the next milestone, i guess?",
        },
        1: {requirementDescription: "10 Doggo's",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            unlocked() {return hasMilestone(this.layer, 0)},
            effectDescription: "Unlock MAX buy for Doggo's",
        },
    }
})
addLayer("p", {
    name: "Hyperprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#390273",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Hyper points", // Name of prestige currency
    baseResource: "Hyperfixations", // Name of resource prestige is based on
    baseAmount() {return player["h"].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8, // Prestige currency exponent
    base: 3,
    canBuyMax() {return hasMilestone("p", 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["h"],
    hotkeys: [
        {key: "p", description: "P: Reset for Prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player["h"].unlocked},
    milestones: {
        0: {requirementDescription: "3 Hyper points",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks the next milestone, again.",
        },
        1: {requirementDescription: "10 Hyper points",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            unlocked() {return hasMilestone(this.layer, 0)},
            effectDescription: "Unlock MAX buy for Prestige points",
        },
    },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Hyperigious",
            description: "Bet you feel cool now, huh?",
            cost: new Decimal(1),
            unlocked: true,
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.5:0.3)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"^" }, // Add formatting to the effect
        }
    },
})
addLayer("q", {
    name: "Doggoprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#390273",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Doggo points", // Name of prestige currency
    baseResource: "Doggo's", // Name of resource prestige is based on
    baseAmount() {return player["d"].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8, // Prestige currency exponent
    base: 3,
    canBuyMax() {return hasMilestone("q", 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["d"],
    hotkeys: [
        {key: "q", description: "Q: Reset for Doggo points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player["d"].unlocked},
    milestones: {
        0: {requirementDescription: "3 Doggo points",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks the next milestone, one more time.",
        },
        1: {requirementDescription: "10 Doggo points",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            unlocked() {return hasMilestone(this.layer, 0)},
            effectDescription: "Unlock MAX buy for Prestige points",
        },
    },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Doggoious",
            description: "Bet you feel cute now, huh?",
            cost: new Decimal(1),
            unlocked: true,
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.52:0.33)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"^" }, // Add formatting to the effect
        }
    },
})
addLayer("g", {
    name: "Gold", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#390273",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Gold coins", // Name of prestige currency
    baseResource: "Hyperfixations and Doggo's", // Name of resource prestige is based on
    baseAmount() {return player["h", "d"].points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.8, // Prestige currency exponent
    base: 3,
    canBuyMax() {return hasMilestone("g", 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["d", "h"],
    hotkeys: [
        {key: "g", description: "G: Reset for Gold", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player["h", "d"].unlocked},
    milestones: {
        0: {requirementDescription: "3 Gold coins",
            done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks the next milestone for the last time, i swear!",
        },
        1: {requirementDescription: "10 Gold coins",
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            unlocked() {return hasMilestone(this.layer, 0)},
            effectDescription: "Unlock MAX buy for Prestige points",
        },
    },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Gamer",
            description: "Bet you feel gross now, huh?",
            cost: new Decimal(1),
            unlocked: true,
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.8:0.4)) 
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        }
    },
})