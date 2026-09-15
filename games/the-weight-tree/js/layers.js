addLayer("w", {
    upgrades: {
        11: {
            title: "Speed Up!",
            description: "Doubles your grams.",
            cost: new Decimal(1),
        },
        12: {
            title: "Heavier Weights!",
            description: "Multiplies your grams by weights; each weights is 1 more heavier.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("w", 11) },
            effect() {
                let effect = player.w.points.add(1.5).pow(0.25)
                if (hasChallenge("c", 31)) effect = player.w.points.add(1.5).pow(0.275)
                if (inChallenge("c", 11)) effect = player.points.add(1.5).pow(0.2)
                if (inChallenge("c", 21)) effect = player.points.add(1).pow(0.25)
                if (inChallenge("c", 31)) effect = player.points.add(1).pow(0.225)
                if (inChallenge("c", 41)) effect = player.points.add(1).pow(0.2)
                if (inChallenge("u", 21)) effect = new Decimal(1)
                effect = softcap(effect, new Decimal("e5000"), 0.4) // Tetra-softcapped Layer 1
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Prestigious!",
            description: "Transcend your grams into a buffed grams.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("w", 12) },
            effect() {
                let effect = player.points.add(1.1).pow(0.18)
                if (hasChallenge("c", 12)) effect = player.points.add(1.5).pow(0.19)
                if (hasUpgrade("u", 15)) effect = player.points.add(1.5).pow(0.2)
                if (inChallenge("c", 12)) effect = player.points.add(1.1).pow(0.12)
                if (inChallenge("c", 32)) effect = player.points.add(1).pow(0.025)
                if (inChallenge("u", 21)) effect = new Decimal(1)
                effect = softcap(effect, new Decimal("e4000"), 0.4) // Tetra-softcapped Layer 1
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Transcendious!",
            description: "Transcend your grams into a more buffed grams.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("w", 13) },
            effect() {
                let effect = player.points.add(1.05).pow(0.175)
                if (inChallenge("c", 12)) effect = new Decimal(10)
                if (inChallenge("c", 32)) effect = player.points.add(1).pow(0.15)
                if (inChallenge("u", 21)) effect = new Decimal(1)
                effect = softcap(effect, new Decimal("e5000"), 0.4) // Tetra-softcapped Layer 1
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
            title: "Upgrade of Upgrades!",
            description: "Upgrades boosts Grams by 1.75x each.",
            cost: new Decimal(50),
            effect() {
                let effect = Decimal.pow(1.75, player.w.upgrades.length)
                // if (hasMilestone("o", 3)) effect = Decimal.pow(1.75, player.w.upgrades.length.add((player.o.upgrades.length.times(0.5))))
                if (inChallenge("c", 32)) effect = Decimal.pow(2.5, player.w.upgrades.length)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21: {
            title: "Singularity!",
            description: "Gain more weights... by grams?",
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade("o", 12) },
            effect() {
                let effect = player.points.add(1).pow(0.045)
                if (hasChallenge("c", 21)) effect = player.points.add(1.5).pow(0.0475)
                if (hasUpgrade("u", 15)) effect = player.points.add(1.5).pow(0.05)
                if (inChallenge("u", 21)) effect = player.points.add(1.5).pow(0.005)
                effect = softcap(effect, new Decimal("e800"), 0.5) // Tetra-softcapped Layer 1
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        22: {
            title: "Softcapped...",
            description: "Buff Weight+ by ^0.08.",
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade("w", 21) },
            effect() {
                let effect = player.w.points.add(1).pow(0.08)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        23: {
            title: "Ascendious!",
            description: "Transcend your grams into a ascended grams.",
            cost: new Decimal(1e14),
            unlocked() { return hasUpgrade("w", 22) },
            effect() {
                return player.points.add(1.0).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        24: {
            title: "Gorda Echinadna!",
            description: "Get more comparisons based on OVERWEIGHTS.",
            cost: new Decimal(1e35),
            unlocked() { return hasMilestone("c", 7) },
            effect() {
                let effect = player.o.points.add(1).pow(2.5)
                if (hasChallenge("c", 22)) effect = player.o.points.add(1).pow(2.85)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        25: {
            title: "The Other Realm",
            description: "Get more weights based on COMPARISONS.",
            cost: new Decimal(1e100),
            unlocked() { return hasMilestone("u", 3) },
            effect() {
                let effect = player.c.points.add(1).pow(0.145)
                if (hasChallenge("c", 11)) effect = player.points.add(1.25).pow(0.15)
                if (inChallenge("c", 41)) effect = player.c.points.add(1).pow(0.1)
                if (inChallenge("u", 21)) effect = player.c.points.add(1).pow(0.01)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        31: {
            title: "Colliding Universes",
            description: "Gain more COMPARISONS based on UNIVERSES.",
            cost: new Decimal("e10000"),
            unlocked() { return hasMilestone("u", 3) },
            effect() {
                let effect = player.u.points.add(1).pow(0.225)
                if (inChallenge("u", 21)) effect = player.u.points.add(1).pow(0.01)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        32: {
            title: "God of Universe",
            description: "Universe multiplies your grams.",
            cost: new Decimal("e12500"),
            unlocked() { return hasUpgrade("w", 31) },
            effect() {
                return player.u.points.add(1.0).pow(0.9)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        33: {
            title: "Overweightful Weights",
            description: "Scale up gram base.",
            cost: new Decimal("e41925"),
            unlocked() { return hasMilestone("u", 3) },
            effect() {
                let effect = player.o.points.add(1).log(1.2).add(1).pow(0.025).pow(player.ob.points)
                
                return effect
            },
            effectDisplay() { return "^"+format(upgradeEffect(this.layer, this.id)) },
        },
    },
    milestones: {
        1: {
            requirementDescription: "e1e5 Weights",
            effectDescription: "Inflation Era.",
            done() { return player.w.points.gte("e100000") }
        },
    },
    autoUpgrade() {
        return hasMilestone("o", 2)
    },
    passiveGeneration() {
        let gen = new Decimal(0)
        if (hasMilestone("o", 1)) gen = new Decimal(0.5)
        return gen
    },
    name: "weight", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "w", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["o", "c"],
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#9BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "weights", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('o', 11)) mult = mult.times(upgradeEffect('o', 11))
        if (hasUpgrade('w', 21)) mult = mult.times(upgradeEffect('w', 21))
        if (hasUpgrade('w', 22)) mult = mult.times(upgradeEffect('w', 22))
        if (hasUpgrade('w', 25)) mult = mult.times(upgradeEffect('w', 25))
        if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11))
        if (hasUpgrade('u', 11)) mult = mult.times(upgradeEffect('u', 11))
        if (hasUpgrade('u', 12)) mult = mult.times(upgradeEffect('u', 12))
        if (hasUpgrade('s', 12)) mult = mult.times(upgradeEffect('s', 12))
        if (hasUpgrade('s', 15)) mult = mult.times(upgradeEffect('s', 15))
        if (hasMilestone('t', 2)) mult = mult.times(player.t.points.pow(4))
        if (hasAchievement('o', 24)) mult = mult.times(achievementEffect('o', 24))
        if (hasUpgrade('o', 23)) mult = mult.pow(player.o.points.add(1).log(1.01).div(495).add(1))
        if (hasUpgrade('ob', 12)) mult = mult.pow(player.ob.points.add(1).pow(1.75).log(1.05).div(1000).add(1))
        if (inChallenge("u", 12)) mult = mult.pow(0.5)
        mult = softcap(mult, new Decimal("e4000"), 0.25) // Tetra-softcapped Layer 1
        mult = softcap(mult, new Decimal("e100000"), 0.1) // Tetra-softcapped Layer 2
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    //    doReset(resettingLayer) {
    //    var keep = []
    //    if (hasMilestone("o", 4)) keep.push("upgrades")
    //    if (hasMilestone("u", 1)) keep.push("milestones")
    //    if (layers[this.layer].row < layers[resettingLayer].row) return
    //    layerDataReset(this.layer, keep)
    //},    
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: Reset for weights", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})
