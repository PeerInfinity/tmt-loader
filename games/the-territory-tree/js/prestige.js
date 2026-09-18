addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#EFD50A",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 12)) mult = mult.times(2)
        if (hasMilestone('e',0)) mult = mult.times(upgradeEffect('e',10))
        if (hasChallenge('e', 11)) mult = mult.times(challengeEffect('e', 11))
        mult = mult.times(buyableEffect('p', 11))
        if (hasUpgrade('p', 23)) mult = mult.times(4)
        if (inChallenge('e',12)) mult = mult.div(100)
        if (hasUpgrade('p', 32)) mult = mult.times(10)
        if (hasUpgrade('p', 33)) mult = mult.times(3.3)
        if (hasMilestone('se',0)) mult = mult.times(upgradeEffect('se',10))
        if (hasUpgrade('se', 11)) mult = mult.times(10)
        mult = mult.times(buyableEffect('se', 11))
        if (inChallenge('se',11)) mult = mult.div(buyableEffect('p', 11))
        if (hasUpgrade('se', 12)) mult = mult.times(100)
        if (inChallenge('se',13)) mult = mult.pow(0.33333)
        if (hasChallenge('e',21)) mult = mult.pow(0.5)
        if (hasUpgrade('a', 12))  mult = mult.times(upgradeEffect('a',12))
        if (hasUpgrade('a',13)) mult = mult.times(new Decimal(1.1).pow(getBuyableAmount('p',12)))
        if (hasUpgrade('a',22)) mult = mult.pow(1.05)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    	clickables: {
		11: {
			title: "Reset",
			display: "Hold to reset",
			canClick() {
				return tmp[this.layer].canReset
			},
			onHold() {
				doReset(this.layer)
			},
		}
	},
    passiveGeneration() {
        x=new Decimal(1)
        if (inChallenge('e', 11)) x = x.times(-100)
        if (inChallenge('e', 12)) x = x.times(100)
        if (hasUpgrade('se',11)) x = x.times(10)
        if (hasMilestone('e',3)) return x.div(10)
        if (hasMilestone('p', 2)) return x.div(100)
        return 0
    },
    milestones: {
        0: {
            requirementDescription: "2 prestige points",
            effectDescription: "Double territory gain",
            done() { return player.p.points.gte(2) }
        }, 
        1: {
            requirementDescription: "5 prestige points",
            effectDescription: "Unlock some upgrades",
            done() { return player.p.points.gte(5) }
        },
        2: {
            requirementDescription: "200 prestige points",
            effectDescription: "Gain 1% of prestige gain every second",
            done() { return player.p.points.gte(200) },
            unlocked() {
                return hasUpgrade('p',21)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "clickables",
                "milestones",
                "upgrades",

            ],},
            "Buyables": {
                content: [
                    "main-display",
                    "prestige-button",
                    "clickables",
                    "buyables",
                ],
                unlocked() {
                    return hasMilestone('e',2)
                }
        },},
        ontimeupdate() {
            if (hasChallenge('se',12)) {
                buyUpg('p',11)
                buyUpg('p',12)
                buyUpg('p',13)
                buyUpg('p',21)
                buyUpg('p',22)
                buyUpg('p',23)
                buyUpg('p',31)
                buyUpg('p',32)
                buyUpg('p',33)
            }
        },
    upgrades: {
            11: {
            title: "Faster growth!",
            description: "Triple your territory gain",
            cost: new Decimal(5),
            unlocked() {return hasMilestone('p',1) && !inChallenge('se',12)}
        },
            12: {
            title: "More prestige!",
            description: "Double your prestige point gain",
            cost: new Decimal(10),
            unlocked() {return hasUpgrade('p',11)}
        },
            13: {
            title: "Prestige-based growth!",
            description: "Increase territory gain based on prestige points",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade('p',12)},
                effect() {
            return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
            21: {
            title: "Self-Growth",
            description: "Territory boosts itself",
            cost: new Decimal(100),
            unlocked() {return hasUpgrade('p',13) && (player.p.points.gte(50) || hasUpgrade('p',21))},
            effect() {
                    return player.points.add(1).pow(0.3)
                },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
            22: {
            title: "New cool layer",
            description: "Unlock expansions.",
            cost: new Decimal(300),
            unlocked() {return hasUpgrade('p',21)}
        },
            23: {
            title: "New lands",
            description: "Quadruple prestige gain BUT divide territory gain by 1.5",
            cost: new Decimal(1e15),
            unlocked() {return hasUpgrade('p',22) && hasMilestone('e',3)}
        },
            31: {
            title: "Power-up",
            description: "Territory gain ^1.1",
            cost: new Decimal(1e19),
            unlocked() {return hasUpgrade('p',23) && hasChallenge('e',12)}
        },
            32: {
            title: "Almost there",
            description: "x10 prestige",
            cost: new Decimal(1e21),
            unlocked() {return hasUpgrade('p',31) && hasChallenge('e',12)}
        },
            33: {
            title: "The Square",
            description: "x3.3 prestige and territory gain + unlock new expansion milestone",
            cost: new Decimal(1e25),
            unlocked() {return hasUpgrade('p',32) && hasChallenge('e',12)}
        },
    },
    buyables: {
        11: {
            title: "Booster v2",
            cost(x) {
                if(hasChallenge('se',11)) return new Decimal(1.5).pow(x.pow(1.9)).mul(10000000000) 
                return new Decimal(1.5).pow(x.pow(2)).mul(10000000000)},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(2).pow(x)
            },
            display() {return `Double prestige gain every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: ${format(this.effect())}x prestige points`},
            unlocked() {return hasMilestone('e',2)}
        },
        12: {
            title: "Divider",
            cost(x) {
                 if(hasChallenge('se',11)) return new Decimal(2).pow(x.pow(1.25)).mul(new Decimal(1e35))
                 return new Decimal(2).pow(x.pow(1.3)).mul(new Decimal(1e35)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(3).pow(x)
            },
            display() {return `Divide semi-expansion requirement by 3 every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: /${format(this.effect())} semi-expansion requirement`},
            unlocked() {return hasMilestone('e',6)}
        },
        21: {
            title: "Ascension booster",
            cost(x) {
                 return new Decimal(3).pow(x.pow(1.35)).mul(new Decimal(1e60)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(1.5).pow(x)
            },
            display() {return `Multiply ascension gain by 1.5 every time you buy this!\nTimes Bought: ${format(getBuyableAmount(this.layer, this.id))}\nCost: ${format(this.cost())}\nEffect: ${format(this.effect())}x ascension gain`},
            unlocked() {return hasUpgrade('a',21)}
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})
