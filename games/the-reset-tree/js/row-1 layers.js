addLayer("a", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked() { return (this.isUnlocked)},                  // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    color: "#FF6872",                       // The color for this layer, which affects many elements.
    resource: "Ascenion points",            // The name of this layer's main prestige resource.
    row: 1,
    symbol: "A",      
    branches: [['rb',1], ['t',2], ['p',3]],


    baseResource: "reset points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['r'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(500),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.43,                          // "normal" prestige gain is (currency^exponent).
    softcap: new Decimal(1e16),
    softcappower: 0.6,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('a', 15)) mult = mult.times(3)
        if (hasUpgrade('r', 32)) mult = mult.times(upgradeEffect('r', 13).add(39)/40)
        if (hasUpgrade('a', 25)) mult = mult.times(3)
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    
    passiveGeneration() {
        let generation = new Decimal(0)
        if (hasUpgrade('p', 21)) generation = generation.add(0.01)
        if (hasMilestone('rb', 4)) generation = generation.add(0.49)
        return generation
    },

     doReset(reset) {
        let keep = [];
        if ( hasMilestone("t", 0) ) keep.push("challenges")
        if ( hasMilestone("t", 2) ) keep.push("upgrades")
        if ( layers[reset].row > this.row) layerDataReset("a", keep)
    }, 

    layerShown() { return hasUpgrade('r', 23) || this.layer.points > 0 || hasUpgrade(this.layer, 11)},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11: {
            title:"Ascension power",
            description: "Boost reset point gain based on ascension points.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title:"Ascension power?",
            description: "Apply ascension power boost to points but the boost is reduced (/4).", 
            cost: new Decimal(2),
            unlocked() { return (hasUpgrade('a', 11))},
        },
        13: {
            title:"Another reset component",
            description: "Unlock the first reset buyable 'reset button'.", 
            cost: new Decimal(3),
            unlocked() { return (hasUpgrade('a', 12))},
        },
        14: {
            title:"Can i go back to resets?",
            description: "Unlock 3 more reset upgrades.", 
            cost: new Decimal(7),
            unlocked() { return (hasUpgrade('a', 13))},
        },
        15: {
            title:"Ok resets got boring again",
            description: "Unlock a new layer and x3 ascendion point gain.", 
            cost: new Decimal(75),
            unlocked() { return (hasUpgrade('a', 14))},
        },

        21: {
            title:"I've just been waiting for resets to go up",
            description: "Get a x20 boost to reset points.", 
            cost: new Decimal(500),
            unlocked() { return (hasMilestone('rb', 2))},
        },
        22: {
            title:"Thats what 'i can help you with names' was for",
            description: "Boost point gain based on prestige points.", 
            cost: new Decimal(5000),
            unlocked() { return (hasMilestone('rb', 2))},
            effect() {
                return player['p'].points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title:"Rebirth points should do more",
            description: "Point gain is boosted (hover over upgrade for formula).",
            tooltip: "x(4 x rebirth points)", 
            cost: new Decimal(30000),
            unlocked() { return (hasMilestone('rb', 2))},
        },
        24: {
            title:"Rebirth points NEED to do more",
            description: "Reset point gain is boosted (hover over upgrade for formula).", 
            tooltip: "x(1.5 x rebirth points)", 
            cost: new Decimal(70000),
            unlocked() { return (hasMilestone('rb', 2))},
        },
        25: {
            title:"Ok they do enough now",
            description: "Boost ascension point gain by x3.", 
            cost: new Decimal(250000),
            unlocked() { return (hasMilestone('rb', 5))},
        },
        31: {
            title:"Transcendence power",
            description: "Unlock a new layer.", 
            cost: new Decimal(1e15),
            unlocked() { return (hasUpgrade('rb', 33))},
        },
    },
    challenges: {
        11: {
            name: "<h2>Can resets be reasonable</h2>",
            style() {return "border-radius: 10% / 10%"},
            challengeDescription: "Set reset multiplier to 0.01.",
            goalDescription: "200000 reset points",
            rewardDescription: "The limit on 'reset button' is 20x higher.",
            canComplete: function() {return player['r'].points.gte(200000)},
            unlocked() {return hasMilestone('t', 0)},
            onEnter() {
                player['r'].points = new Decimal(0)
                player['a'].points = new Decimal(0)
                player['p'].points = new Decimal(0)
                player['r'].upgrades = [],
                player['r'].milestones = []
            },
        },
        12: {
            name: "<h2>I didn't like them anyways</h2>",
            style() {return "border-radius: 10% / 10%"},
            challengeDescription: "Buyables will no longer boost production.",
            goalDescription: "1e25 reset points",
            rewardDescription: "Unlock the second reset buyable.",
            canComplete: function() {return player['r'].points.gte(1e25)},
            unlocked() {return hasChallenge('a', 11)},
            onEnter() {
                player['r'].points = new Decimal(0)
                player['a'].points = new Decimal(0)
                player['p'].points = new Decimal(0)
                player['r'].upgrades = [],
                player['r'].milestones = []
            },
        },
        13: {
            name: "<h2>no more prestige</h2>",
            style() {return "border-radius: 10% / 10%"},
            challengeDescription: "You cant access the prestige layer.",
            goalDescription: "1e17 ascenion points",
            rewardDescription: "Unlock a 4th upgrade to the first 2 pretige upgrade rows",
            canComplete: function() {return player['a'].points.gte(1e17)},
            unlocked() {return hasMilestone('t', 2)},
            onEnter() {
                player['r'].points = new Decimal(0)
                player['a'].points = new Decimal(0)
                player['p'].points = new Decimal(0)
                player['r'].upgrades = [],
                player['p'].upgrades = [],
                player['r'].milestones = []
            },
        },
        14: {
            name: "<h2>they didn't do much anyways</h2>",
            style() {return "border-radius: 10% / 10%"},
            challengeDescription: "none of the constant multipliers are not applied",
            goalDescription: "10000000 prestige points",
            rewardDescription: "The first rebirth milestone effect is reapplied",
            canComplete: function() {return player['p'].points.gte(10000000)},
            unlocked() {return hasMilestone('t', 2)},
            onEnter() {
                player['r'].points = new Decimal(0)
                player['a'].points = new Decimal(0)
                player['p'].points = new Decimal(0)
                player['r'].upgrades = [],
                player['r'].milestones = []
            },
        },
    },
    hotkeys: [
        {
            key: "a", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "A: reset your reset points for ascension points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.a.unlocked) doReset("a") },
        },
    ],
    infoboxes: {
        lore: {
            title: "Ascension",
            body() { return "Time to reset resets, or ascend i guess. At least ascenion is a better name than super-reset.<br> (A soft cap is applied after 1e16 ascension points.)"},
        },
    },
}),

addLayer("p", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked() { return (hasUpgrade('a', 15))},                    // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    color: "#FBFF9F",                       // The color for this layer, which affects many elements.
    resource: "Prestige points",            // The name of this layer's main prestige resource.
    row: 1,
    symbol: "P",      
    branches: [['rb',1], ['rw',2]],


    baseResource: "reset points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['r'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(500000),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.3,                         // "normal" prestige gain is (currency^exponent).


    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('r', 14)) mult = mult.times(upgradeEffect('a', 11).add(100)/100)
        if (hasMilestone('t', 1)) mult = mult.times(buyableEffect('r', 11))
        if (hasUpgrade('rw', 65)) mult = mult.times(upgradeEffect('rw', 65))
        return mult
    },                           // Returns your multiplier to your gain of the prestige resource.
        
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    passiveGeneration() {
        let generation = new Decimal(0)
        if (hasUpgrade('rb', 21)) generation = generation.add(0.05)
        return generation
    },

    doReset(reset) {
        let keep = [];
        if ( hasMilestone("rb", 1)) keep.push("upgrades")
        if ( layers[reset].row > this.row) layerDataReset("p", keep)
        (isUnlocked == true)
    }, 

    layerShown() { return (hasUpgrade('a', 15) || this.layer.points > 0 || hasUpgrade(this.layer, 11)) &! inChallenge('a', 13)},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11: {
            title:"No need to hold down r",
            description: "Generate 5% of your reset on reset.",
            cost: new Decimal(1),
        },
        12: {
            title:"Ok so you clearly sill needed to hold r",
            description: "Generate 25% of your reset on reset.",
            unlocked() { return hasUpgrade('p', 11)},
            cost: new Decimal(2),
        },
        13: {
            title:"Stop wasting my resets",
            description: "Reset buttons will no longer spend reset points.",
            unlocked() { return hasUpgrade('p', 12)},
            cost: new Decimal(8),
        },
        14: {
            title:"Can i have more useless rebirths?",
            description: "Prestige points slightly boost rebirth point gain.",
            unlocked() { return hasChallenge('a', 13)},
            cost: new Decimal(1e10),
            effect() {
                return player['p'].points.add(1).pow(0.05)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title:"Too slow to be useful",
            description: "Gain 1% of ascendion points on reset.",
            unlocked() { return hasUpgrade('p', 13)},
            cost: new Decimal(12),
        },
        22: {
            title:"Stop wasting my time",
            description: "Automatically buy reset buttons if you have '1000000 resets'.",
            unlocked() { return hasUpgrade('p', 13)},
            cost: new Decimal(12),
        },
        23: {
            title:"3 per row is too low",
            description: "Add a 4th upgrade to each row of reset upgrades.",
            unlocked() { return hasUpgrade('p', 21) & hasUpgrade('p', 22)},
            cost: new Decimal(8),
        },
        24: {
            title:"Maybe it will be useful.",
            description: "Gain 10% of your transcendence points on reset per second.",
            unlocked() { return hasChallenge('a', 13)},
            cost: new Decimal(1e12),
        },
        31: {
            title:"Rewind power",
            description: "Unlock a new layer.", 
            cost: new Decimal(1e12),
            unlocked() { return (hasUpgrade('rb', 31))},
        },
    },
    hotkeys: [
        {
            key: "p", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "P: reset your reset points for prestige points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.p.unlocked) doReset("p") },
        },
    ],
    infoboxes: {
        lore: {
            title: "Prestige",
            body() { return "Weird that a prestige tree mod doesn't start with prestige."  },
        },
    },
})

