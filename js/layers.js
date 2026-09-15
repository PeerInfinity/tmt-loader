addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasMilestone('p', 1)) mult = mult.times(3)
        if (hasUpgrade('r', 11)) mult = mult.times(2)
        if (hasUpgrade('p', 14)) mult = mult.pow(1.1)
        if (hasMilestone('d', 0)) mult = mult.times(5)
        if (hasMilestone('d', 3)) mult = mult.times(5)
        if (hasMilestone('d', 6)) mult = mult.pow(1.25)
        if (hasMilestone('d', 8)) mult = mult.pow(2.5)
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
            title: "Prestige Upgrade 1",
            description: "2x Point gain :0",
            cost: new Decimal(1),
        },
        12: {
            title: "Prestige Upgrade 2",
            description: "Prestige points boost point gain",
            cost: new Decimal(5),  

            effect() {
              return player[this.layer].points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
        },

        13: {
            title: "Prestige Upgrade 3",
            description: "Points boost prestige point gain",
            cost: new Decimal(10),

            effect() {
              return player.points.add(1).pow(0.5)
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
        },

        14: {
            title: "Prestige Upgrade 4",
            description: "10x Points, ^1.1 PP",
            cost: new Decimal(3e23),
            unlocked() { return hasUpgrade('r', 16) },
        }
    },

    milestones:
    {
        0: {
            requirementDescription: "50 Prestige Points",
            effectDescription: "10x Point gain",
            done() { return player[this.layer].points.gte(50) }
        },

        1: {
            requirementDescription: "200 Prestige Points",
            effectDescription: "3x Prestige Point gain",
            done() { return player[this.layer].points.gte(200) }
        },

        2: {
            requirementDescription: "5000 Prestige Points",
            effectDescription: "Unlock Rebirth",
            done() { return player[this.layer].points.gte(5000) }
        }
    },

    doReset(layer) {
       if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

       let keep = []
       if (hasMilestone('d', 4)) keep.push("upgrades")
       if (hasMilestone('o', 6)) keep.push("upgrades")

       layerDataReset(this.layer, keep)
    },

    passiveGeneration() {
        let p = new Decimal(0)
        if (hasMilestone('o', 1)) p = p.add(1)
        return p
    }
})

addLayer("r", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    branches: ["p"],

    color: "#cf13dc",                       // The color for this layer, which affects many elements.
    resource: "rebirth points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "prestige points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.p.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(10000),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        mult = new Decimal(1)
        if (hasUpgrade('r', 14)) mult = mult.times(3)
        if (hasMilestone('d', 0)) mult = mult.times(5)
        if (hasMilestone('d', 3)) mult = mult.times(5)
        if (hasMilestone('d', 6)) mult = mult.pow(1.25)
        if (hasMilestone('d', 8)) mult = mult.pow(2.5)
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        exp = new Decimal(1)
        if (hasMilestone('d', 2)) exp = exp.add(0.1)
        return exp
    },

    layerShown() { return hasMilestone('p', 2) || player.r.unlocked }, // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11: {
            title: "Rebirth Upgrade 1",
            description: "2x Points and PP",
            cost: new Decimal(1),
        },

        12: {
            title: "Rebirth Upgrade 2",
            description: "Rebirth points boost Points gain",
            cost: new Decimal(2),

            effect() {
              return player[this.layer].points.add(1).pow(0.8)
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        13: {
            title: "Rebirth Upgrade 3",
            description: "^1.3 Point gain",
            cost: new Decimal(10),
        },

        14: {
            title: "Rebirth Upgrade 4",
            description: "3x Rebirth Point gain",
            cost: new Decimal(25),
        },

        15: {
            title: "Rebirth Upgrade 5",
            description: "Points boost themselves",
            cost: new Decimal(100),

            effect() {
              return player.points.add(1).pow(0.2)
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },

        16: {
            title: "Rebirth Upgrade 6",
            description: "Unlock more PP upgrades",
            cost: new Decimal(1.5e10),
        },

        17: {
            title: "Rebirth Upgrade 7",
            description: "Unlock Rebirth Milestones",
            cost: new Decimal(2e15),
        }
    },

    milestones: {
        0: {
            requirementDescription: "1e16 Rebirth Points",
            effectDescription: "^1.5 Points lol",
            done() { return player[this.layer].points.gte(1e16) && hasUpgrade('r', 17) },
            unlocked() { return hasUpgrade('r', 17) },
        },
    },

    unlocked() { let Unlocked = false
        if (player.p.points.gte(5000)) Unlocked = true

        return Unlocked 

    }, // The layer is unlocked when the player reaches the 3rd milestone of the prestige layer.

    doReset(layer) {
       if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

       let keep = []
       if (hasUpgrade('d', 13)) keep.push("upgrades")
       if (hasMilestone('o', 6)) keep.push("upgrades")

       layerDataReset(this.layer, keep)
    },

    passiveGeneration() {
        let p = new Decimal(0)
        if (hasMilestone('o', 1)) p = p.add(1)
        return p
    }
}),

addLayer("d", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    doReset(layer) {
       if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;
       
       let keep = []
       let keepMilestones = []

       if (hasMilestone('o', 3)) keepMilestones.push(5)
       if (hasMilestone('o', 4)) keep.push("challenges")

       keep.push(keepMilestones) 

       layerDataReset(this.layer, keep)
    },

    branches: ["r"],

    color: "#ffffff",                       // The color for this layer, which affects many elements.
    resource: "divine points",            // The name of this layer's main prestige resource.
    row: 3,                                 // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal("1e1000"),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 15,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return player.points.gte("1e1000") || player.d.unlocked },  // Returns a bool for if this layer's node should be visible in the tree.
    
    milestones: {
        0: {
            requirementDescription: "1 Divine Point",
            effectDescription: "5x Everything before divine",
            done() { return player[this.layer].points.gte(1) }
        },

        1: {
            requirementDescription: "2 Divine Points",
            effectDescription: "^1.5 Point gain",
            done() { return player[this.layer].points.gte(2) }
        },

        2: {
            requirementDescription: "3 Divine Points",
            effectDescription: "+^0.1 to RP exponent",
            done() { return player[this.layer].points.gte(3) }
        },

        3: {
            requirementDescription: "5 Divine Points",
            effectDescription: "Unlock Challenges Tab and ^1.5 Points, also 5x Prestige and Rebirth",
            done() { return player[this.layer].points.gte(5) }
        },

        4: {
            requirementDescription: "8 Divine Points",
            effectDescription: "Keep Prestige Upgrades",
            done() { return player[this.layer].points.gte(8) },
            unlocked() { return hasMilestone('d', 3) },
        },

        5: {
            requirementDescription: "10 Divine Points",
            effectDescription: "^2 Points :)",
            done() { return player[this.layer].points.gte(10) },
            unlocked() { return hasMilestone('d', 4) },
        },

        6: {
            requirementDescription: "15 Divine Points",
            effectDescription: "^1.25 Prestige, Rebirth and ^1.3 Points",
            done() { return player[this.layer].points.gte(15) },
            unlocked() { return hasMilestone('d', 5) },
        },

        7: {
            requirementDescription: "25 Divine Points",
            effectDescription: "Ok, ^10 Points",
            done() { return player[this.layer].points.gte(25) },
            unlocked() { return hasMilestone('d', 6) },
        },

        8: {
            requirementDescription: "30 Divine Points",
            effectDescription: "^2.5 Rebirth and Prestige, ^3 Points",
            done() { return player[this.layer].points.gte(30) },
            unlocked() { return hasMilestone('d', 7) },
        },

        9: {
            requirementDescription: "100 Divine Points",
            effectDescription: "Unlock a new reset layer",
            done() { return player[this.layer].points.gte(100) && hasUpgrade('d', 14) },
            unlocked() { return hasUpgrade('d', 14) }
        }
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display","prestige-button","blank","milestones"]
        },

        "Upgrades": {
            content: ["main-display","blank","upgrades"],
            unlocked() {return hasChallenge('d', 11) },
        },

        "Challenges": {
            content: ["main-display","blank","challenges"],
            unlocked() { return hasMilestone('d', 3) },
        }
    },

    challenges: {
        11: {
            name: "Points are decaying",
            challengeDescription: "^0.01 Points",
            goalDescription: "e500000 Points",
            rewardDescription: "Unlock Upgrades Tab",
            completionLimit: 1,
            canComplete() { return player.points.gte("e500000") },
            unlocked() { return hasMilestone('d', 3) },
        },
    },

    upgrades: {
        11: {
            title: "Divine Upgrade 1",
            description: "^^1.1 Point gain",
            cost: new Decimal(30),
        },
        12: {
            title: "Divine Upgrade 2",
            description: "Divine points boost point gain",
            cost: new Decimal(60),

            effect() {
              return player[this.layer].points.add(1).pow(1e90)
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "Divine Upgrade 3",
            description: "Keep Rebirth Upgrades on divine reset",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('d', 12) },
        },
        14: {
            title: "Divine Upgrade 4",
            description: "Unlock last divine milestone",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('d', 13) },
        }
    },

    passiveGeneration() {
        let p = new Decimal(0)
        if (hasMilestone('o', 0)) p = p.add(1)
        if (hasMilestone('o', 1)) p = p.add(9)
        if (hasMilestone('o', 5)) p = p.add(10)
        return p
    },

    unlocked() { return player.points.gte("1e1000") }, // The layer is unlocked when the player reaches 1e1000 points.
})

addLayer("o", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    branches: ["d"],

    color: "#024eff",                       // The color for this layer, which affects many elements.
    resource: "omega points",            // The name of this layer's main prestige resource.
    row: 4,                                 // The row this layer is on (0 is the first row).

    baseResource: "divine points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.d.points },  // A function to return the current amount of baseResource.

    requires: new Decimal("100"),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)
        if (hasMilestone('o', 5)) mult = mult.times(1.1)
        if (hasMilestone('o', 6)) mult = mult.times(5)
        return mult                            // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasMilestone('d', 9) || player.o.unlocked },          // Returns a bool for if this layer's node should be visible in the tree.

    tabFormat: {
        "Milestones": {
            content: ["main-display","prestige-button","blank","milestones"]
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Omega Point",
            effectDescription: "Passively gain 100% of your divine points per second",
            done() { return player[this.layer].points.gte(1) }
        },

        1: {
            requirementDescription: "5 Omega Points",
            effectDescription: "Passively gain 100% of your Prestige and Rebirth points per second, also +900% divine point passive gain",
            done() { return player[this.layer].points.gte(5) }
        },

        2: {
            requirementDescription: "8 Omega Points",
            effectDescription: "^^1.5 Points",
            done() { return player[this.layer].points.gte(8) }
        },

        3: {
            requirementDescription: "10 Omega Points",
            effectDescription: "Keep 5 divine milestones on omega reset",
            done() { return player[this.layer].points.gte(10) },
            unlocked() { return hasMilestone('o', 2) },
        },

        4: {
            requirementDescription: "15 Omega Points",
            effectDescription: "Keep all divine challenges on omega reset",
            done() { return player[this.layer].points.gte(15) },
            unlocked() { return hasMilestone('o', 3) },
        },

        5: {
            requirementDescription: "25 Omega Points",
            effectDescription: "+1000% divine passive generation and ^100 Points also 1.1x Omega point gain",
            done() { return player[this.layer].points.gte(25) },
            unlocked() { return hasMilestone('o', 4) },
        },

        6: {
            requirementDescription: "50 Omega Points",
            effectDescription: "Keep Prestige and Rebirth Upgrades on omega reset, 5x Omega",
            done() { return player[this.layer].points.gte(50) },
            unlocked() { return hasMilestone('o', 5) },
        },

        7: {
            requirementDescription: "80 Omega Points",
            effectDescription: "x1e10000 Points",
            done() { return player[this.layer].points.gte(80) },
            unlocked() { return hasMilestone('o', 6) },
        }
    },

    unlocked() { return player.d.points.gte("100") && hasMilestone('d', 9) }, // The layer is unlocked when the player reaches 1F100 points.
})
