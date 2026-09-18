addLayer("e", {
    name: "expansions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: ['p'],
    color: "#920089",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    resource: "expansions", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasMilestone('se',1)) mult = mult.div(upgradeEffect('se',20))
        mult = mult.div(buyableEffect('se', 13))
    if(hasChallenge('se',13)) mult = mult.div(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    tabFormat: {
        "Expansion": {
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
                return hasUpgrade('e',11)
                }
            },
        },
        milestones: {
            0: {
                requirementDescription: "1 expansion.",
                effectDescription: "Double territory and prestige gain every expansion.",
                done() { return player.e.points.gte(1) }
            },
            1: {
                requirementDescription: "3 expansions.",
                effectDescription: "Triple territory.",
                done() { return player.e.points.gte(3) }
            },
            2: {
                requirementDescription: "6 expansions.",
                effectDescription: "Unlock a prestige buyable.",
                done() { return player.e.points.gte(6) }
            },
            3: {
                requirementDescription: "7 expansions.",
                effectDescription: "Unlock a prestige upgrade and passive gain increased to 10%.",
                done() { return player.e.points.gte(7) }
            },
            4: {
                requirementDescription: "8 expansions.",
                effectDescription: "Unlock a challenge!",
                done() { return player.e.points.gte(8) }
            },
            5: {
                requirementDescription: "10 expansions.",
                effectDescription: "Unlock an upgrade.",
                done() { return player.e.points.gte(10) },
                unlocked() {return hasUpgrade('p',33) || hasMilestone('e',5)}
            },
            6: {
                requirementDescription: "12 expansions.",
                effectDescription: "Unlock another prestige buyable.",
                done() { return player.e.points.gte(12) },
                unlocked() {return hasUpgrade('p',33) || hasMilestone('e',5)}
            },
            7: {
                requirementDescription: "13 expansions.",
                effectDescription: "Unlock more semi-expansions content.",
                done() { return player.e.points.gte(13) },
                unlocked() {return hasMilestone('se',0) || hasMilestone('e',7)}
            },
            8: {
                requirementDescription: "14 expansions.",
                effectDescription: "You can buy max semi-expansions.",
                done() { return player.e.points.gte(13) },
                unlocked() {return hasMilestone('se',0) || hasMilestone('e',8)}
            },
            9: {
                requirementDescription: "15 expansions.",
                effectDescription: "Unlock challenge IV.",
                done() { return player.e.points.gte(13) },
                unlocked() {return hasChallenge('se',13) || hasMilestone('e',9)}
            },
            10: {
                requirementDescription: "16 expansions.",
                effectDescription: "Unlock more ascension upgrades.",
                done() { return player.e.points.gte(13) },
                unlocked() {return hasMilestone('se',3) || hasMilestone('e',10)}
            },
         },
            challenges: {
                11: {
                    name: "Anti-prestige",
                    challengeDescription: "Passive prestige point gain is multiplied by -100.",
                    goalDescription: "1000 prestige points",
                    rewardDescription: "Prestige points boost themselves.",
                    rewardEffect() {
                        return player.p.points.add(1).pow(0.3)
                    },
                    rewardDisplay() {
                        return format(challengeEffect(this.layer, this.id))+"x" 
                    },
                    canComplete: function() {return player.p.points.gte(1000)},
                    onEnter() {
                        player.points=new Decimal(0)
                        player.p.points=new Decimal(0)
                    }
                },
                12: {
                    name: "Reduced growth",
                    challengeDescription: "Territory gain is divided by 1000 + almost all prestige is passive.",
                    goalDescription: "10,000,000 prestige points",
                    rewardDescription: "Unlock more prestige upgrades",
                    canComplete: function() {return player.p.points.gte(10000000)},
                    onEnter() {
                        player.points=new Decimal(0)
                        player.p.points=new Decimal(0)
                    },
                    unlocked() {
                        return hasMilestone('e',4)
                    }
                },
                21: {
                    name: "CHALLENGE IV",
                    challengeDescription: "POINT GAIN IS ALWAYS SQUARE ROOT OF PRESTIGE POINTS. SEMI EXPANSION INITIAL COST IS 1E10. ENTERING THIS WILL CAUSE AN EXPANSION RESET.",
                    goalDescription: "1E40 PRESTIGE POINTS",
                    rewardDescription: "UNLOCK NEW SEMI-EXPANSION MILESTONE + TERRITORY PENALTY IS LIFTED BUT SQRT PRESTIGE GAIN",
                    canComplete: function() {return player.p.points.gte(1e40)},
                    onEnter() {
                        player.points=new Decimal(0)
                        player.p.points=new Decimal(0)
                    },
                    unlocked() {
                        return (hasMilestone('e',9))
                    },
                },
            },
        upgrades: {
            10: {
                cost: new Decimal(10^9999999999),
                effect() {
                    return new Decimal(2).pow(player.e.points)
                }
            },
            11: {
                title: "New feature yay",
                description: "Unlock a challenge",
                cost: new Decimal(3),
            },
            12: {
                title: "Layered",
                description: "Unlock a new layer...",
                cost: new Decimal(10),
                unlocked() {return hasMilestone('e',5)}
            }
        },
    row: 5, // Hehe
    hotkeys: [
        {key: "e", description: "E: Reset for expansions.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('p',22) || hasMilestone('e',0)}
})
