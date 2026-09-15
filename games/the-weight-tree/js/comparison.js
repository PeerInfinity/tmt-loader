// if (hasUpgrade('o', 21)
addLayer("c", {
    milestones: {
        1: {
            requirementDescription: "10 Comparisons",
            effectDescription: "Unlock Mountain Chellange.",
            done() { return player.c.points.gte(10) }
        },
        2: {
            requirementDescription: "100 Comparisons",
            effectDescription: "Unlock Everest Challenge.",
            done() { return player.c.points.gte(100) }
        },
        3: {
            requirementDescription: "1,000 Comparisons",
            effectDescription: "Unlock Earth Challenge.",
            done() { return player.c.points.gte(1000) }
        },
        4: {
            requirementDescription: "100,000 Comparisons",
            effectDescription: "Unlock Sun Challenge.",
            done() { return player.c.points.gte(100000) }
        },
        5: {
            requirementDescription: "10,000,000 Comparisons",
            effectDescription: "Unlock Milky Way Challenge.",
            done() { return player.c.points.gte(10000000) }
        },
        6: {
            requirementDescription: "1e9 Comparisons",
            effectDescription: "Unlock Universe Challenge, you can buy max Overweights.",
            done() { return player.c.points.gte(1e9) }
        },
        7: {
            requirementDescription: "1e10 Comparisons",
            effectDescription: "Unlock 1 new upgrade on Weight layer.",
            done() { return player.c.points.gte(1e10) }
        },
        8: {
            requirementDescription: "1e12 Comparisons",
            effectDescription: "Unlock Shattered Challenge.",
            done() { return player.c.points.gte(1e12) }
        }
    },
    upgrades: {
        11: {
            title: "Compare the Earth with Mars!",
            description: "Get 1.2x more Weight per each Overweight.",
            cost: new Decimal(100),
            effect() {
                let effect = Decimal.pow(1.2, player.o.points)
                if (hasChallenge("c", 11)) effect = Decimal.pow(1.25, player.o.points)
                if (hasUpgrade("u", 11)) effect = Decimal.pow(1.30, player.o.points)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "Comparisons... COMPARE!",
            description: "Get ((????)^0.75)x amount of grams.",
            cost: new Decimal(10000),
            effect() {
                let effect = player.c.points.add(10000).mul(0.001).pow(0.8)
                if (inChallenge("c", 41)) effect = player.c.points.mul(1e-10).pow(0.75)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "I think we got too far.",
            description: "Get 1.075x more comparison each overweight.",
            cost: new Decimal(10000),
            effect() {
                let effect = Decimal.pow(1.08, player.o.points)
                if (hasUpgrade("c", 14)) effect = Decimal.pow(1.155, player.o.points)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "I think we got too slow.",
            description: "Improve comparison gain formula on Upgrade C13.",
            cost: new Decimal(1e10),
        },
        15: {
            title: "Πάpα πoλύ.",
            description: "Now you can gain MORE.",
            cost: new Decimal("e3000"),
            effect() {
                return player.c.points.add(1).pow(0.014)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
    challenges: {
        11: {
            name: "Mountaintop: Volcanic",
            challengeDescription: "Upgrade W12 is nerfed and reduce gram gain to ^0.5.",
            goalDescription: "3e15 Grams",
            rewardDescription: "The Other Realm has significantly improved formula!",
            canComplete: function() {return player.points.gte(3e15)},
            unlocked() { return (hasMilestone('c', 1)) },
            
        },
        12: {
            name: "Mountain Evertop",
            challengeDescription: "Upgrade W13,14 is nerfed and reduce gram gain to ^0.75.",
            goalDescription: "2e20 Grams",
            rewardDescription: "Prestigious has improved formula.",
            canComplete: function() {return player.points.gte(3e20)},
            unlocked() { return (hasMilestone('c', 2)) },
        },
        21: {
            name: "Moon",
            challengeDescription: "Upgrade O11 and W12 is capped/nerfed and divide gram gain by 1e6.",
            goalDescription: "1e27 Grams",
            rewardDescription: "Singularity has significantly improved formula.",
            canComplete: function() {return player.points.gte(1e27)},
            unlocked() { return (hasMilestone('c', 3)) },
        },
        22: {
            name: "Betelgeuse",
            challengeDescription: "Upgrade O11,12,14 is nerfed and reduce gram gain to ^0.8.",
            goalDescription: "4e31 Grams",
            rewardDescription: "Gorda Echinadna has improved formula.",
            canComplete: function() {return player.points.gte(4e31)},
            unlocked() { return (hasMilestone('c', 4)) },
        },
        31: {
            name: "Choco Way",
            challengeDescription: "Upgrade W12 is nerfed drastically and reduce gram gain to ^0.75",
            goalDescription: "2e45 Grams",
            rewardDescription: "Heavier weights has significantly changed formula!",
            canComplete: function() {return player.points.gte(2e45)},
            unlocked() { return (hasMilestone('c', 5)) },
        },
        32: {
            name: "The Edge",
            challengeDescription: "Upgrade W13,14,15 is nerfed.",
            goalDescription: "1e67 Grams",
            rewardDescription: "Unlock a new layer.",
            canComplete: function() {return player.points.gte(1e67)},
            unlocked() { return (hasMilestone('c', 6)) },
        },
        41: {
            name: "The Shattered Universe",
            challengeDescription: "Upgrade W12,13,14,15 and O15 is nerfed significally and reduce gram gain to ^0.1",
            goalDescription: "1e303 Grams",
            rewardDescription: "Unlock Row 4 Layer.",
            canComplete: function() {return player.points.gte(1e303)},
            unlocked() { return (hasMilestone('c', 4)) },

        },
        42: {
            name: "MegaDeath",
            challengeDescription: "Reduce gram gain to ^0.002.",
            goalDescription: "1e303 Grams",
            rewardDescription: "^1.1 to all below currencies.",
            canComplete: function() {return player.points.gte(1e303)},
            unlocked() { return (hasMilestone('c', 7)) },

        },
    },
    autoUpgrade() {
        return hasMilestone("u", 2)
    },
    passiveGeneration() {
        let gen = new Decimal(0)
        if (hasMilestone("u", 2)) gen = new Decimal(0.001)
        if (hasMilestone("s", 3)) gen = new Decimal(0.01)
        return gen
    },
    name: "comparison", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["u"],
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        // compares: new Decimal(0),
    }},
    color: "#4C5866",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "comparisons", // Name of prestige currency
    baseResource: "weights", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.265, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('w', 24)) mult = mult.times(upgradeEffect('w', 24))
        if (hasUpgrade('w', 31)) mult = mult.times(upgradeEffect('w', 31))
        if (hasUpgrade('c', 13)) mult = mult.times(upgradeEffect('c', 13))
        if (hasUpgrade('s', 13)) mult = mult.times(upgradeEffect('s', 13))
        if (hasMilestone('t', 3)) mult = mult.times(player.t.points.pow(2.5))
        if (hasUpgrade('o', 24)) mult = mult.pow(player.o.points.add(1).log(1.009).div(510).add(1)).log(1.025)
        mult = softcap(mult, new Decimal("e30000"), 0.15) // Tetra-softcapped Layer 1
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    //doReset(resettingLayer) {
    //    var keep = []
    //    if (hasMilestone("u", 1)) keep.push("upgrades")
    //    if (layers[this.layer].row < layers[resettingLayer].row) return
    //    layerDataReset(this.layer, keep)
    //},
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for comparisons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('o', 21) || player.c.points.gte(1)}
})