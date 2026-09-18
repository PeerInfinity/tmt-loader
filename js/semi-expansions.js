addLayer("se", {
    name: "semi-expansions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: ['p'],
    color: "#09f123",
    requires() {
        if (inChallenge('e',21)) return new Decimal(1e10)
        return new Decimal(1e20)}, // Can be a function that takes requirement increases into account
    resource: "semi-expansions", // Name of prestige currency
    baseResource: "m^2", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    base: 1.5,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.div(buyableEffect('p',12))
        mult = mult.div(buyableEffect('se', 12))
        return mult
    },
    canBuyMax() {
        if (hasMilestone('e',8)) return true
        return false
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "1 semi-expansion.",
            effectDescription: "Multiply territory and prestige gain by 1.5 every semi-expansion.",
            done() { return player.se.points.gte(1) }
        },
        1: {
            requirementDescription: "6 semi-expansions.",
            effectDescription: "Divide expansion requirement by 3 each semi-expansion.",
            done() { return player.se.points.gte(6) }
        },
        2: {
            requirementDescription: "12 semi-expansions.",
            effectDescription: "Unlock challenges.",
            done() { return player.se.points.gte(12) },
            unlocked() {return hasMilestone('e',7)}
        },
        3: {
            requirementDescription: "16 semi-expansions.",
            effectDescription: "Unlock a new layer.",
            done() { return player.se.points.gte(16) },
            unlocked() {return hasChallenge('e',21)}
        },
        4: {
            requirementDescription: "20 semi-expansions.",
            effectDescription: "Boost ascension point gain by log_10(ascension points+10)^2",
            done() { return player.se.points.gte(20) },
            unlocked() {return hasMilestone('se',3)}
        },
},
    upgrades: {
        10: {
            cost: new Decimal(10^9999999999),
            effect() {
                return new Decimal(1.5).pow(player.se.points)
            }
        },
        11: {
            title: "Additional growth",
            description: "Multiply prestige gain by 10 and passive gain increased to 100%",
            cost: new Decimal(8),
        },
        12: {
            title: "Additional growth II",
            description: "Multiply prestige gain by 100",
            cost: new Decimal(9),
            unlocked() {
                return inChallenge('e',21)
            }
        },
        20: {
            cost: new Decimal(10^9999999999),
            effect() {
                return new Decimal(3).pow(player.se.points)
            }
        },
    },
    challenges: {
        11: {
            name: "Challenge I",
            challengeDescription: "Booster v2's effect is always x1",
            goalDescription: "1e37 prestige points",
            rewardDescription: "Prestige buyables scale slower <br> + Unlock Challenge II</br>",
            canComplete: function() {
                if (inChallenge('e',21) || hasChallenge('e',21)) return player.p.points.gte(new Decimal(1e31))
                return player.p.points.gte(new Decimal(1e37))},

            onEnter() {
                player.points=new Decimal(0)
                player.p.points=new Decimal(0)
            },
            unlocked() {
                return hasMilestone('e',7)
            } 
        },
        12: {
            name: "Challenge II",
            challengeDescription: "You can only buy prestige buyables.",
            goalDescription: "1e24 prestige points",
            rewardDescription: "Automate prestige upgrades <br> + Unlock Challenge III + Territory gain *expansions</br>",
            canComplete: function() {
                if (hasChallenge('e',21)) return player.p.points.gte(new Decimal(5e12))
                return player.p.points.gte(new Decimal(1e24))},
            onEnter() {
                player.points=new Decimal(0)
                player.p.points=new Decimal(0)
            },
            unlocked() {
                return hasChallenge('se',11)
            } 
        },
        13: {
            name: "Challenge III",
            challengeDescription: "Territory and prestige gain is cube rooted.",
            goalDescription: "200,000,000 prestige points",
            rewardDescription: "Expansion requirement /100 <br> + Unlock Challenge IV (in expansions if you have more than 14 cuz big unlock)</br>",
            canComplete: function() {return player.p.points.gte(new Decimal(2e8))},
            onEnter() {
                player.points=new Decimal(0)
                player.p.points=new Decimal(0)
            },
            unlocked() {
                return hasChallenge('se',12)
            } 
        },
    },
    buyables: {
        11: {
            title: "Booster v3",
            cost(x) { return new Decimal(2).pow(getBuyableAmount('se', 11).add(getBuyableAmount('se', 12)).add(getBuyableAmount('se', 13))) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(2).pow(x)
            },
            display() {return `Double prestige gain AND territory every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: ${format(this.effect())}x prestige points and territory`},
            unlocked() {return hasMilestone('e',7)},
        },
        12: {
            title: "Divider v2",
            cost(x) { return new Decimal(2).pow(getBuyableAmount('se', 11).add(getBuyableAmount('se', 12)).add(getBuyableAmount('se', 13))) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(10).pow(x)
            },
            display() {return `Divide semi-expansion requirement by 10 every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: /${format(this.effect())} semi-expansion point requirement`},
            unlocked() {return hasMilestone('e',7)}
        },
        13: {
            title: "Expansion Divider",
            cost(x) { return new Decimal(2).pow(getBuyableAmount('se', 11).add(getBuyableAmount('se', 12)).add(getBuyableAmount('se', 13))) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(10).pow(x)
            },
            display() {return `Divide expansion requirement by 10 every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: /${format(this.effect())} expansion point requirement`},
            unlocked() {return hasMilestone('e',7)}
        },
    },
    tabFormat: {
        "Semi-Expansion": {
            content: [
                "main-display",
                "prestige-button",
                "milestones",
                "upgrades"
            ],},
        "Challenges": {
            content: [
                "challenges",
                ],
            unlocked() {
                return hasMilestone('se',2)
                }
            },
        "Buyables": {
                content: [
                    "buyables",
                    ],
                unlocked() {
                    return hasMilestone('e',7)
                    }
                },
        },
    row: 3, // Hehe
    hotkeys: [
        {key: "s", description: "S: Reset for semi-expansions.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('e',12) || hasMilestone('se',0)},    
})
