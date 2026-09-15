// Copy a line here - return player.w.points.add(1).pow(0.265)
addLayer("o", {
    upgrades: {
        11: {
            title: "Boosted!",
            description: "Grams increase Weight gain by ^0.1.",
            cost: new Decimal(1),
            effect() {
                let effect = player.points.add(1.1).pow(0.1)
                if (hasChallenge("c", 31)) effect = player.points.add(1.5).pow(0.125)
                if (inChallenge("c", 21)) effect = player.points.add(1.1).pow(0.05)
                if (inChallenge("c", 22)) effect = player.points.add(1.1).pow(0.075)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "Raging In!",
            description: "Gain multi based on overweights. (3^x)",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("o", 11) },
            
            effect() {
                let effect = new Decimal(3).pow(player.o.points).add(1)
                if (hasChallenge("c", 41)) effect = new Decimal(4).pow(player.o.points)
                if (inChallenge("c", 22)) effect = new Decimal(32)
                return effect
            },
        },
        13: {
            title: "New sales!",
            description: "Unlock new Weight Upgrades.",
            unlocked() { return hasUpgrade("o", 11) },
            cost: new Decimal(3),
        },
        14: {
            title: "Weight+!",
            description: "Weights boost itself at reduced rate.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("o", 12) },
            effect() {
                let effect = player.w.points.add(1).pow(0.185)
                if (inChallenge("c", 22)) effect = new Decimal(10)
                if (inChallenge("c", 41)) effect = player.w.points.add(1).pow(0.15)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
            title: "Tantrum!",
            description: "Throw a tantrum and gain 10x more grams at first minute (Currently: gain 10x more grams).",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("o", 14) },
        },
        21: {
            title: "Heavier than Mountain Everest!",
            description: "Unlock Comparison Layer.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade("o", 15) },
        },
        22: {
            title: "Obesity",
            description: "Increase power of grams by ^.0001",
            cost: new Decimal(380),
            unlocked() { return hasUpgrade("sa", 14) },
        },
        23: {
            title: "Overweightly Harsh",
            description: "Increase power of weights by ^.002",
            cost: new Decimal(680),
            unlocked() { return hasUpgrade("o", 22) },
        },
        24: {
            title: "Compare Base",
            description: "Increase power of comparisons by ^.002",
            cost: new Decimal(730),
            unlocked() { return hasUpgrade("o", 23) },
        },
        25: {
            title: "Universal Base",
            description: "Increase power of universes by ^.002",
            cost: new Decimal(780),
            unlocked() { return hasUpgrade("o", 24) },
        },
    },
    milestones: {
        1: {
            requirementDescription: "2 Overweights",
            effectDescription: "You gain 50% of Weight on reset per second.",
            done() { return player.o.points.gte(2) }
        },
        2: {
            requirementDescription: "4 Overweights",
            effectDescription: "You can autobuy Weight Upgrades.",
            done() { return player.o.points.gte(4) },
            toggles: [["w", "auto"]],
        },
    },
    autoUpgrade() {
        return hasMilestone("u", 1)
    },
    canBuyMax() {return hasMilestone("c", 6)},
    name: "overweight",
    symbol: "O",
    branches: ["u", "ob"],
    position: 3,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#3B9C66",
    requires: new Decimal(1000000),
    resource: "overweights",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.79,
    gainMult() {
        mult = new Decimal(1)
        // mult = softcap(mult, 300, 0.8) // Tetra-softcapped Layer 1
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    //doReset(resettingLayer) {
    //    var keep = []
    //    if (hasMilestone("u", 1)) keep.push("upgrades")
    //    if (hasMilestone("u", 3)) keep.push("milestones")
    //    if (player[this.layer].row < player[resettingLayer].row) return
    //    layerDataReset(this.layer, keep)
    //},
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Reset for Overweights", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('w', 15) || hasUpgrade("o", 11)}
})