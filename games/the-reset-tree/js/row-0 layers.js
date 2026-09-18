addLayer("r", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    color: "#8E8EA7",                       // The color for this layer, which affects many elements.
    resource: "Reset points", 
    symbol: "R",
    row: 0,
    style() {return  {'background-color': '#2A2A43'}}, 
    branches: [['a',1], ['p',1], ['rb',2],['ri',3],['tr',1]],                                // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone('r', 1)) mult = mult.times(upgradeEffect('r', 13))
        if (hasUpgrade('a', 11)) mult = mult.times(upgradeEffect('a', 11))
        if (hasMilestone('r', 2)) mult = mult.times(2)
        if (hasMilestone('r', 6)) mult = mult.times(3)
        if (hasUpgrade('a', 24)) mult = mult.times((player['rb'].points.add(1)).times(1.5))
        if (hasUpgrade('rb', 22)) mult = mult.times((upgradeEffect('a', 11).add(49))/50)
        if (inChallenge('a', 11)) mult = mult.times(1/(mult.times(100)))
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    passiveGeneration() {
        let generation = new Decimal(0)
        if (hasUpgrade('p', 11)) generation = generation.add(0.05)
        if (hasUpgrade('p', 12)) generation = generation.add(0.2)
        return generation
    },

    automate(){
        if (hasUpgrade('p', 22))
        if (hasMilestone('r', 4)) {
            for (let i = 0; i < (100) ; i++) {
                buyBuyable('r', i % 2 === 0 ? 11 : 11);
            }
        }
    },  // stole from SomeKindofGamer's ether tree code
    doReset(reset) {
        let keep = [];
        if ( hasMilestone("rb", 0) ) keep.push("upgrades")
        if ( hasMilestone("rb", 3) ) keep.push("milestones")
        if ( hasMilestone("t", 1) ) keep.push("buyables")
        if ( layers[reset].row > this.row) layerDataReset(this.layer, keep)
    }, // cant find way to stop from keeping everything. add activation later.

    layerShown() { return true },          // Returns a bool for if this layer's node should be visible in the tree.

    milestones: {
        0: {
            requirementDescription: "Get upgrade 4",
            effectDescription: "Point gain x3",
            done() { return hasUpgrade('r', 21) },
            unlocked() { return (hasUpgrade(this.layer, 21))},
        },
        1: {
            requirementDescription: "100 resets",
            effectDescription: "Points boost reset gain",
            done() { return player['r'].points.gte(100) & (hasUpgrade(this.layer, 22))},
            effect() {
                return player[this.layer].points.add(1).pow(0.002)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return (hasUpgrade(this.layer, 22))},
        },
        2: {
            requirementDescription: "1000 resets",
            effectDescription: "x2 reset point gain",
            done() { return player['r'].points.gte(1000) & (hasUpgrade(this.layer, 22)) },
            unlocked() { return (hasUpgrade(this.layer, 22))},
        },
        3: {
            requirementDescription: "100000 resets",
            effectDescription: "x5 point gain",
            done() { return player['r'].points.gte(100000) & (hasUpgrade(this.layer, 33)) },
            unlocked() { return (hasUpgrade(this.layer, 33))},
        },
        4: {
            requirementDescription: "1000000 resets",
            effectDescription: "x3 point gain",
            done() { return player['r'].points.gte(1000000) & (hasUpgrade(this.layer, 33)) },
            unlocked() { return (hasUpgrade(this.layer, 33))},
        },
        5: {
            requirementDescription: "Get 'but i need a few more upgrades'",
            effectDescription: "x3 point gain",
            done() { return (hasUpgrade(this.layer, 24)) },
            unlocked() { return (hasUpgrade(this.layer, 24))},
        },
        6: {
            requirementDescription: "1e9 resets",
            effectDescription: "x3 reset point gain",
            done() { return player['r'].points.gte(1e9) & (hasUpgrade(this.layer, 24)) },
            unlocked() { return (hasUpgrade(this.layer, 24))},
        },
        7: {
            requirementDescription: "1e10 resets",
            effectDescription: "x2.5 point gain",
            done() { return player['r'].points.gte(1e10) & (hasUpgrade(this.layer, 24)) },
            unlocked() { return (hasUpgrade(this.layer, 24))},
            
        },
    },

    milestonePopup() {return hasMilestone('rb', 0) == false},

    upgrades: {
            11: {
                title:"Reset power",
                description: "Point gain x5",
                cost: new Decimal(1),
            },
            12: {
                title:"Reset power again",
                description: "Point gain x2",
                cost: new Decimal(5),
                unlocked() { return (hasUpgrade(this.layer, 11))},
            },
            13: {
                title:"Reset to points",
                description: "Reset points boost point gain",
                cost: new Decimal(12),
                effect() {
                    return player[this.layer].points.add(1).pow(0.24)
                },
                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                unlocked() { return (hasUpgrade(this.layer, 11))},
            },
            14: {
                title:"I can help you with names",
                description: "Apply 'reset to points' to prestige points but /100",
                cost: new Decimal(100000000),
                unlocked() { return (hasUpgrade('p', 23))},
            },
            21: {
                title:"What",
                description: "Unlock reset milestones",
                cost: new Decimal(35),
                unlocked() { return (hasUpgrade(this.layer, 13))},
            },
            22: {
                title:"Why just one?",
                description: "Unlock more milestones",
                cost: new Decimal(55),
                unlocked() { return (hasUpgrade(this.layer, 21))},
            },
            23: {
                title:"tahW",
                description: "Unlock new layer and x10 point gain",
                cost: new Decimal(200),
                unlocked() { return (hasUpgrade(this.layer, 22))},
            },
            24: {
                title:"But i need a few more upgrades",
                description: "Unlock 3 more milestones",
                cost: new Decimal(1e9),
                unlocked() { return (hasUpgrade('p', 23))},
            },
            31: {
                title:"I cant come up with more dumb names",
                description: "Apply 'reset to points' boost again but /5",
                cost: new Decimal(20000),
                unlocked() { return (hasUpgrade('a', 14))},
            },
            32: {
                title:"Seriously i don't know",
                description: "Apply 'reset to points' boost ascenion points but /40",
                cost: new Decimal(100000),
                unlocked() { return (hasUpgrade('a', 14))},
            },
            33: {
                title:"Help me",
                description: "Unlock 2 more reset milestones",
                cost: new Decimal(500000),
                unlocked() { return (hasUpgrade('a', 14))},
            },
            34: {
                title:"Because 3 is way too few to name",
                description: "Unlock a new layer",
                cost: new Decimal(1e11),
                unlocked() { return (hasUpgrade('p', 23))},
            },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal(5).mul(new Decimal(x).mul(x))},
            display() { return "<h3>Reset Button</h3><br> " +"boosts point gain based on amount owned.<br>" + "amount:" + getBuyableAmount(this.layer, this.id) + "/" + format(this.purchaseLimit()) + "<br>cost:" + this.cost() + "<br>" + format(buyableEffect(this.layer, this.id))+"x" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            unlocked() { return hasUpgrade('a', 13)},
            effect() {
                return getBuyableAmount(this.layer, this.id).add(1).pow(0.5)
            },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, 
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasUpgrade('p', 13)) player[this.layer].points = player[this.layer].points.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit() {
                let limit = new Decimal(2024)
                if (hasChallenge('a', 11)) limit = limit.times(20)
                if (hasChallenge('a', 12)) limit = limit.times(buyableEffect('r',12))
                return limit
            },
        },
        12: {
            cost(x) { return new Decimal(4.5e24).mul(new Decimal(x).pow(1.7))},
            display() { return "<h3>Reset Switch</h3><br> " +"boosts limit of owned reset buttons<br>" + "amount:" + getBuyableAmount(this.layer, this.id) + "/" + this.purchaseLimit() + "<br>cost:" + format(this.cost()) + "<br>" + format(buyableEffect(this.layer, this.id))+"x" },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            unlocked() { return hasChallenge('a', 12)},
            effect() {
                return getBuyableAmount(this.layer, this.id).add(1).pow(0.5)
            },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, 
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit() {
                let limit = new Decimal(30)
                return limit
            },
        },
    },
    hotkeys: [
        {
            key: "r", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "R: reset your points for reset points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.r.unlocked) doReset("r") },
        },
    ],
    infoboxes: {
        lore: {
            title: "Reset",
            body() { return "Clearly just waiting to reach [absurdly large number that might as well be nonsense] is not happening. So time to start the first of [however many layers there are] layers." },
        },
    },
})
