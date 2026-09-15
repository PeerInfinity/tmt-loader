addLayer("P", {
    name: "Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        buyablepower: new Decimal(1),
    }},
    layerShown(){
        let visible = false
        if (inChallenge("L",11)) visible = true
        if (!inChallenge("L",11)) visible = false
        return visible
     },
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Prestige points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('P', 11)) mult = mult.times(2)
        if (hasUpgrade('P', 12)) mult = mult.times(1.5)
        if (hasUpgrade('P', 13)) mult = mult.times(3)
        if (hasUpgrade('P', 14)) mult = mult.times(upgradeEffect('P', 14))
        if (hasUpgrade('P', 15)) mult = mult.times(upgradeEffect('P', 15))
        if (hasUpgrade('P', 16)) mult = mult.times(upgradeEffect('P', 16))
        if (hasUpgrade('P', 21)) mult = mult.times(1.5)
        if (hasUpgrade('P', 22)) mult = mult.times(1.5)
        if (hasUpgrade('P', 23)) mult = mult.times(upgradeEffect('P', 23)) 
        if (hasUpgrade('P', 24)) mult = mult.times(upgradeEffect('P', 24))
        if (hasUpgrade('P', 25)) mult = mult.times(upgradeEffect('P', 25))
        if (hasUpgrade('P', 26)) mult = mult.times(1.5)   
        if (getBuyableAmount("P",11).gte(0)) mult = mult.times(buyableEffect("P",11))
	 
        return mult

    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade('P', 34)) exp = exp.times(upgradeEffect('P', 34))
        if (hasUpgrade('P', 35)) exp = exp.times(upgradeEffect('P', 35))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: { 
        11: {
            title: "The first upgrade?",
            description: "2x prestige points AND 10x points, you will see why later",
            cost: new Decimal(1),
        },
        12: {
            title: "The second upgrade?",
            description: "1.5x prestige points",
            cost: new Decimal(10),
            unlocked() {return hasUpgrade("P",11)}
        },
        13: {
            title: "Prestige upgrade 3",
            description: "3x prestige points",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade("P",12)}
        },
        14: {
            title: "Self-synergy",
            description: "Boost prestige points based on prestige points, capped at 10",
            cost: new Decimal(60),
            effect() {
                if (player[this.layer].total.add(1).pow(0.1).lt(10)) return player[this.layer].total.add(1).pow(0.1)
                else return new Decimal(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",13)}
        },
        15: {
            title: "Self-synergy 2",
            description: "Boost prestige points based on prestige points, capped at 100",
            cost: new Decimal(200),
            effect() {
                if (player[this.layer].total.add(1).pow(0.1).lt(100)) return player[this.layer].total.add(1).pow(0.1)
                else return new Decimal(100)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",14)}
        },
        16: {
            title: "Self-synergy 3",
            description: "Boost prestige points based on TOTAL prestige points, capped at 25",
            cost: new Decimal(500),
            effect() {
                if (player[this.layer].total.add(1).pow(0.1).lt(25)) return player[this.layer].total.add(1).pow(0.1)
                else return new Decimal(25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",15)}
        },
        21: {
            title: "Do you see the pattern in this layer now?",
            description: "1.5x PP",
            cost: new Decimal(2000),
            unlocked() {return hasUpgrade("P",16)}
        },
        22: {
            title: "This layer has no point boosts",
            description: "1.5x PP",
            cost: new Decimal(4000),
            unlocked() {return hasUpgrade("P",21)}
        },
        23: {
            title: "And quite a few self boosing upgrades",
            description: "Boost prestige points based on TOTAL prestige points, capped at 1e10",
            cost: new Decimal(8000),
            effect() {
                if (player[this.layer].total.add(1).pow(0.1).lt(1e10)) return player[this.layer].total.add(1).pow(0.1)
                else return new Decimal(1e10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",22)}
        },
        24: {
            title: "Please stop with the self boosting",
            description: "Boost prestige points based on prestige points, capped at 1e50",
            cost: new Decimal(25000),
            effect() {
                if (player[this.layer].total.add(1).log(5).lt(1e50)) return player[this.layer].total.add(1).log(5)
                else return new Decimal(1e50)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",23)}
        },
        25: {
            title: "no",
            description: "Boost prestige points based on prestige points, capped at 1e100",
            cost: new Decimal(3e5),
            effect() {
                if (player[this.layer].total.add(1).log(5).lt(1e100)) return player[this.layer].total.add(1).log(5)
                else return new Decimal(1e100)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",24)}
        },
        26: {
            title: "yes",
            description: "2x PP ",
            cost: new Decimal(1e7),
            unlocked() {return hasUpgrade("P",25)}
        },
        31: {
            title: "Unlock a buyable",
            description: "This totally isnt switched",
            cost: new Decimal(1e8),
            unlocked() {return hasUpgrade("P",26)}
        },
        32: {
            title: "Better Buyable",
            description: "buyable effect is squared",
            cost: new Decimal(1e20),
            unlocked() {return hasUpgrade("P",31)},
            onPurchase() {
                return player.P.buyablepower = new Decimal(2)
            }
        },
        33: {
            title: "Better Buyable 2",
            description: "Buyable effect is ^1.25",
            cost: new Decimal(1e50),
            unlocked() {return hasUpgrade("P",32)},
            onPurchase() {
                return player.P.buyablepower = player.P.buyablepower.times(1.5)
            }
        },
        34: {
            title: "Why so much cost???",
            description: "Boost prestige points based on prestige points, capped at 1.13",
            cost: new Decimal(1e100),
            effect() {
                if (player[this.layer].total.add(1).pow(0.01).lt(1.13)) return player[this.layer].total.add(1).pow(0.01)
                else return new Decimal(1.13)
            },
            effectDisplay() { return "^"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",33)}
        },
        35: {
            title: "Half way there!, well not really",
            description: "Boost prestige points based on prestige points, capeed at 1.65",
            cost: new Decimal(2).pow(1024).pow(0.5),
            effect() {
                if (player[this.layer].total.add(1).pow(0.001).lt(1.65)) return player[this.layer].total.add(1).pow(0.001)
                else return new Decimal(1.65)
            },
            effectDisplay() { return "^"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
            unlocked() {return hasUpgrade("P",34)}
        },
    },
    buyables: {
        11: {
            title: "<br>Prestige booster<br>",
            purchaseLimit: 1400,
            cost(x) { return new Decimal(1e6).pow(getBuyableAmount(this.layer, this.id).div(270)) },
            display() { return "Boosts prestige point gain<br>" + "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "<br>Currently: " + format(tmp[this.layer].buyables[this.id].effect)+"x<br>" + getBuyableAmount("P",11) +"/"+this.purchaseLimit},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {return new Decimal(2).pow(getBuyableAmount(this.layer, this.id).pow(0.70)).pow(player.P.buyablepower)},
            unlocked() {return hasUpgrade('P',31)},
        },
    },
})