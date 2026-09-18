addLayer("achievements", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFF00",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "achievements", // Name of prestige currency
    baseResource: "colour points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side",
    achievements: {
        11: {
            name: "Begin",
            tooltip: "Buy the Begin upgrade in White Points.",
            done() {return hasUpgrade("w", 11)},
        },
        12: {
            name: "White",
            tooltip: "Perform your first White Point reset.",
            done() {return player.w.points.gte(1)},
        },
        13: {
            name: "Bright",
            tooltip: "Get 10 White Points.",
            done() {return player.w.points.gte(10)},
        },
        14: {
            name: "TOO BRIGHT",
            tooltip: "Get 1,000 White Points.",
            done() {return player.w.points.gte(1000)},
        },
        15: {
            name: "Colourful",
            tooltip: "Perform a Row 2 reset.",
            done() {return player.r.points.gte(1) || player.g.points.gte(1) || player.b.points.gte(1)},
        },
        21: {
            name: "Red",
            tooltip: "Perform your first Red Point reset. Red upgrade in White Points now saves on Row 2 reset.",
            done() {return player.r.points.gte(1)},
        },
        22: {
            name: "Green",
            tooltip: "Perform your first Green Point reset. Green upgrade in White Points now saves on Row 2 reset.",
            done() {return player.g.points.gte(1)},
        },
        23: {
            name: "Blue",
            tooltip: "Perform your first Blue Point reset. Blue upgrade in White Points now saves on Row 2 reset.",
            done() {return player.b.points.gte(1)},
        },
        24: {
            name: "Vibrant",
            tooltip: "Get 5 of any Row 2 currency. Unlocks an additional column of White Point upgrades.",
            done() {return player.r.points.gte(5) || player.g.points.gte(5) || player.b.points.gte(5)},
        },
    },
    layerShown(){return true}
})

addLayer("w", {
    name: "white", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "white points", // Name of prestige currency
    baseResource: "colour points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    branches: ["r", "g", "b"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('w', 22)) mult = mult.times(upgradeEffect('w', 22))
        if (hasUpgrade('w', 24)) mult = mult.times(upgradeEffect('w', 24))
        if (hasUpgrade('w', 34)) mult = mult.times(upgradeEffect('w', 34))
        // if (hasUpgrade('r', 11)) mult = mult.times(2)
        // if (hasUpgrade('r', 21)) mult = mult.times(2.5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: Reset Colour Points for White Points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
       let check = [31, 32, 33];
       let keep = [];
       for (let i = 0; i < check.length; i++) {
            if (hasUpgrade("w", check[i])) {
                keep.push(check[i])
            }
       }
       layerDataReset(this.layer);
       player[this.layer].upgrades.push(...keep);
       if (hasMilestone("r", 0)) player[this.layer].upgrades.push(12)
       if (hasMilestone("r", 1)) player[this.layer].upgrades.push(13)
    },
    upgrades: {
        11: {
            title: "Begin",
            description: "Start generating Colour Points.",
            cost: new Decimal(0),
        },
        12: {
            title: "Original",
            description: "Double Colour Points.",
            cost: new Decimal(1),
            unlocked() {return hasUpgrade("w", 11) || hasUpgrade("w", 12)},
            effectDisplay() {return "×2.00"},
        },
        13: {
            title: "Synergy",
            description: "Colour Point generation is boosted by White Points.",
            cost: new Decimal(3),
            unlocked() {return hasUpgrade("w", 11) || hasUpgrade("w", 13)},
            effect() {return player[this.layer].points.add(1).pow(0.5)},
            effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "Novel",
            description: "/0.75 Colour Point production.",
            cost: new Decimal(500),
            unlocked() {return hasAchievement("achievements", 24)},
            effectDisplay() {return "/0.75"},
        },
        21: {
            title: "Unique",
            description: "Colour Point production is multiplied by ×1.5.",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("w", 13)},
            effectDisplay() {return "×1.50"},
        },
        22: {
            title: "Reverse Synergy",
            description: "White Points are boosted by Colour Points.",
            cost: new Decimal(10),
            unlocked() {return hasUpgrade("w", 13)},
            effect() {return player.points.add(1).pow(0.15)},
            effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "Inverse Synergy",
            description: "Colour Point production is boosted by Colour Point generation per second.",
            cost: new Decimal(25),
            unlocked() {return hasUpgrade("w", 13)},
            effect() {return getPointGen().pow(0.2)},
            effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "Reverse Inverse Synergy",
            description: "White Points are boosted by Colour Point generation per second.",
            cost: new Decimal(5000),
            unlocked() {return hasAchievement("achievements", 24)},
            effect() {return getPointGen().pow(0.05)},
            effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "Red",
            description: "Unlock Red Points. Green and Blue have their price multiplied by ×100,000.",
            cost() {
                let cost = new Decimal(50)
                if (hasUpgrade("w", 32)) cost = cost.times(100000)
                if (hasUpgrade("w", 33)) cost = cost.times(100000)
                return cost
            },
            unlocked() {return hasUpgrade("w", 23) || hasUpgrade("w", 31)},
        },
        32: {
            title: "Green",
            description: "Unlock Green Points. Red and Blue have their price multiplied by ×100,000.",
            cost() {
                let cost = new Decimal(50)
                if (hasUpgrade("w", 31)) cost = cost.times(100000)
                if (hasUpgrade("w", 33)) cost = cost.times(100000)
                return cost
            },
            unlocked() {return hasUpgrade("w", 23) || hasUpgrade("w", 32)},
        },
        33: {
            title: "Blue",
            description: "Unlock Blue Points. Red and Green have their price multiplied by ×100,000.",
            cost() {
                let cost = new Decimal(50)
                if (hasUpgrade("w", 31)) cost = cost.times(100000)
                if (hasUpgrade("w", 32)) cost = cost.times(100000)
                return cost
            },
            unlocked() {return hasUpgrade("w", 23) || hasUpgrade("w", 33)},
        },
        34: {
            title: "Vibrancy",
            description: "Colour Points and White Points are boosted by the amount of Row 2 layers you have unlocked.",
            cost: new Decimal(50000),
            unlocked() {return hasAchievement("achievements", 24)},
            effect() {
                let boost = new Decimal(1)
                if (hasUpgrade("w", 31)) boost = boost.times(1.33)
                if (hasUpgrade("w", 32)) boost = boost.times(1.33)
                if (hasUpgrade("w", 33)) boost = boost.times(1.33)
                return boost
            },
            effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        },
    },
    layerShown(){return true}
});
addLayer("r", {
    name: "red", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF4444",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "red points", // Name of prestige currency
    baseResource: "white points", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset White Points for Red Points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Red Points",
            body() { return "Welcome to Layer 2! Or, well, welcome back if you didn't choose this first. Red Points are primarily focused on short-term boosts. To help with your next choice, Green Points are focused on long-term but better boosts, and Blue Points are focused on big boosts that cost alot." },
        },
    },
    upgrades: {
        // 11: {
        //     title: "Innovation",
        //     description: "Double Colour Points and White Points.",
        //     cost: new Decimal(1),
        //     effectDisplay() {return "×2.00"},
        // },
        // 12: {
        //     title: "Powerful",
        //     description: "Colour Points are raised to 1.1st power.",
        //     cost: new Decimal(2),
        //     unlocked() {return hasUpgrade("r", 11)},
        //     effectDisplay() {return "^1.1"},
        // },
        // 13: {
        //     title: "Self-Synergetic",
        //     description: "Colour Points now get boosted by themself.",
        //     cost: new Decimal(3),
        //     unlocked() {return hasUpgrade("r", 11)},
        //     effect() {return player.points.pow(0.05).add(1)},
        //     effectDisplay() {return "×"+format(upgradeEffect(this.layer, this.id))},
        // },
        // 21: {
        //     title: "Luminous",
        //     description: "White points are multiplied by ×2.5.",
        //     cost: new Decimal(5),
        //     unlocked() {return hasUpgrade("r", 13)},
        //     effectDisplay() {return "2.50"},
        // }
    },
    milestones: {
        // 0: {
        //     requirementDescription: "2 Red Points",
        //     effectDescription: "Original saves on Red Point reset.",
        //     done() {return player.r.points.gte(2)},
        // },
        // 1: {
        //     requirementDescription: "5 Red Points",
        //     effectDescription: "Synergy saves on Red Point reset.",
        //     done() {return player.r.points.gte(5)},
        // },
    },
    layerShown(){return hasUpgrade("w", 31)}
});
addLayer("g", {
    name: "green", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#44FF44",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "green points", // Name of prestige currency
    baseResource: "white points", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset White Points for Green Points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Green Points",
            body() { return "Welcome to Layer 2! Or, well, welcome back if you didn't choose this first. Green Points are primarily focused on long-term boosts. To help with your next choice, Red Points are focused on short-term but worse boosts, and Blue Points are focused on big boosts that cost alot." },
        },
    },
    upgrades: {
    },
    layerShown(){return hasUpgrade("w", 32)}
});
addLayer("b", {
    name: "blue", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4444FF",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "blue points", // Name of prestige currency
    baseResource: "white points", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset White Points for Blue Points.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Green Points",
            body() { return "Welcome to Layer 2! Or, well, welcome back if you didn't choose this first. Blue Points are primarily focused on big boosts which cost alot. To help with your next choice, Red Points are focused on short-term but worse boosts, and Green Points are focused on long-term but better boosts." },
        },
    },
    upgrades: {
    },
    layerShown(){return hasUpgrade("w", 33)}
});
