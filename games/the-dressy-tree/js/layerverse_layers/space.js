addLayer("Da", {
    name: "Dark matter", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    layerShown(){
        let visible = false
        if (inChallenge("L",14)) visible = true
        if (!inChallenge("L",14)) visible = false
        return visible
     },
    passiveGeneration() {
        if (hasMilestone("Hy",5)) return 1
        if (hasMilestone("Hy",4)) return 0.50
        if (hasMilestone("Hy",3)) return 0.25
        if (hasMilestone("Hy",2)) return 0.05
        if (hasMilestone("Hy",1)) return 0.01
        return 0
    },
    autoUpgrade() {
        if (hasMilestone("Hy",1)) return true
        return false
    },
    color: "#1b003b",
    requires: function() {
        if (hasMilestone("Hy",7)) {
            return new Decimal(10)
        }
        else {
            return new Decimal(200)
        }
    }, // Can be a function that takes requirement increases into account
    resource: "Dark matter", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('Da', 12)) mult = mult.times(2)
        if (hasUpgrade('Da', 13)) mult = mult.add(upgradeEffect("Da",13))
        if (hasUpgrade('Da', 15)) mult = mult.times(1.5)
        if (hasUpgrade('St', 14)) mult = mult.times(3)
        if (hasUpgrade('St', 16)) mult = mult.times(2.5)
        if (hasMilestone("Hy",6)) mult = mult.times(1.5)
        if (hasChallenge("L",14)) mult = mult.div(new Decimal(2).pow(challengeCompletions("L",14)).add(1))
        mult = mult.times(layers.Hy.effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ['Da','St'],
    upgrades: {
        11: {
            title: "Darkness",
            description: "3x points",
            cost: new Decimal(1),
        },
        12: {
            title: "Expansion",
            description: "2x Dark matter",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("Da",11)}
        },
        13: {
            title: "Self-expansion",
            description: "Dark matter boosts the multiplier for itself",
            cost: new Decimal(15),
            effect() {
                return player.Da.points.add(1).log(3).times(upgradeEffect("St",13)).div(new Decimal(2).pow(new Decimal(challengeCompletions("L",14))))
            },
            effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            unlocked() {return hasUpgrade("Da",12)}
        },
        14: {
            title: "Vastness",
            description: "1.5x points",
            cost: new Decimal(35),
            unlocked() {return hasUpgrade("Da",13)}
        },
        15: {
            title: "Strangeness",
            description: "1.5x Dark matter",
            cost: new Decimal(75),
            unlocked() {return hasUpgrade("Da",14)}
        },
        16: {
            title: "Anomaly",
            description: "Points boosts itself",
            cost: new Decimal(175),
            effect() {
                return player.points.add(1).log(3).add(1).div(new Decimal(2).pow(new Decimal(challengeCompletions("L",14))))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("Da",15)}
        },
    },
})

addLayer("St", {
    name: "Star dust", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    layerShown(){
        let visible = false
        if (inChallenge("L",14) && hasUpgrade("Da",16) || player.St.unlocked) visible = true
        if (!inChallenge("L",14)) visible = false
        return visible
     },
    autoUpgrade() {
        if (hasMilestone("Hy",8)) return true
        return false
    },
    passiveGeneration() {
        if (hasMilestone("Hy",8)) return 0.25
        return 0
    },
    color: "#ffd900ff",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "Stardust", // Name of prestige currency
    baseResource: "Dark matter", // Name of resource prestige is based on
    baseAmount() {return player.Da.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.7, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("Hy",3)) mult = mult.times(1.5)
        if (hasMilestone("Hy",4)) mult = mult.times(3)
        if (hasMilestone("Hy",6)) mult = mult.times(1.5)
        if (hasChallenge("L",14)) mult = mult.div(new Decimal(challengeCompletions("L",14)).add(1))
        mult = mult.times(layers.Hy.effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "Hey I thought these challenges had only one layer",
            description: "Total stardust boosts points",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].total.add(1).pow(0.3).add(1).div(new Decimal(2).pow(new Decimal(challengeCompletions("L",14)))).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "This seems familiar",
            description: "Total stardust boosts points again",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].total.add(1).pow(0.5).add(1).div(new Decimal(2).pow(new Decimal(challengeCompletions("L",14)))).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("St",11)}
        },
        13: {
            title: "The better",
            description: "Dark matters 3rd upgrade is 5x better",
            cost: new Decimal(5),
            effect() {
                if (hasUpgrade("St",13)) {
                    return new Decimal(5)
                }
                else {
                    return new Decimal(1)
                }
            },
            unlocked() {return hasUpgrade("St",12)}
        },
        14: {
            title: "Starry night",
            description: "3x dark matter",
            cost: new Decimal(7),
            unlocked() {return hasUpgrade("St",13)}
        },
        15: {
            title: "Cosmic",
            description: "5x points",
            cost: new Decimal(10),
            unlocked() {return hasUpgrade("St",14)}
        },
        16: {
            title: "Hydrogen",
            description: "2.5x points and dark matter and the next layer",
            cost: new Decimal(250),
            unlocked() {return hasUpgrade("St",15)}
        },
    },
})

addLayer("Hy", {
    name: "Hydrogen", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    milestonePopups: function() {
        if (inChallenge("L", 14)) {
            return true
        }
        else {
            return false
        }
    },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    passiveGeneration() {
        return 0
    },
    autoUpgrade() {
        return false
    },
    layerShown(){
        let visible = false
        if (inChallenge("L",14) && hasUpgrade("St",16) || player.Hy.unlocked) visible = true
        if (!inChallenge("L",14)) visible = false
        return visible
     },   
    canBuyMax() {
        if (hasMilestone("Hy",9)) return true
        return false
    },
    effect() {
        Hyeff = player[this.layer].points.add(1).log(1.5).div(new Decimal(2).pow(new Decimal(challengeCompletions("L",14)))).add(1)
        return Hyeff
        },
        effectDescription() {
            Heff = this.effect();
            return "that are boosting Dark matter gain AND Stardust gain by "+format(Hyeff.add(1))+"x."
        },
    branches: ["St","Hy"],
    color: "#00a2ff",
    requires: new Decimal(1e3), // Can be a function that takes requirement increases into account
    resource: "Hydrogen", // Name of prestige currency
    baseResource: "Stardust", // Name of resource prestige is based on
    baseAmount() {return player.St.points}, // Get the current amount of baseResource
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
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
    1: {
        requirementDescription: "1 Hydrogen",
        effectDescription: "Autobuy Dark matter upgrades and gain 1% of dark matter reset",
        done() { return player.Hy.points.gte(1) }
    },
    2: {
        requirementDescription: "2 Hydrogen",
        effectDescription: "2x points and 5% Dark matter reset",
        done() { return player.Hy.points.gte(2) }
    },
    3: {
        requirementDescription: "3 Hydrogen",
        effectDescription: "25% Dark matter reset and 1.5x stardust",
        done() { return player.Hy.points.gte(3) }
    },
    4: {
        requirementDescription: "4 Hydrogen",
        effectDescription: "50% Dark matter reset and 3x stardust",
        done() { return player.Hy.points.gte(4) }
    },
    5: {
        requirementDescription: "5 Hydrogen",
        effectDescription: "100% Dark matter reset",
        done() { return player.Hy.points.gte(5) }
    },
    6: {
        requirementDescription: "10 Hydrogen",
        effectDescription: "1.5x stardust & Dark matter",
        done() { return player.Hy.points.gte(10) }
    },
    7: {
        requirementDescription: "15 Hydrogen",
        effectDescription: "Dark matters requirement is 10",
        done() { return player.Hy.points.gte(15) }
    },
    8: {
        requirementDescription: "25 Hydrogen",
        effectDescription: "Autobuy Stardust upgrades and 25% Stardust reset",
        done() { return player.Hy.points.gte(25) }
    },
    9: {
        requirementDescription: "50 Hydrogen OR 1 challenge completion",
        effectDescription: "You can reset max",
        done() { return player.Hy.points.gte(50) || new Decimal(challengeCompletions("L",14)).gte(1) }
    },
    10: {
        requirementDescription: "400 Hydrogen",
        effectDescription: "Win",
        done() { return player.Hy.points.gte(400) }
    },

},
})