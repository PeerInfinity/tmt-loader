addLayer("c", {
    name: "Conviction", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "c", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "#740707",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Conviction", // Name of prestige currency
    baseResource: "Faith", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = 0.5
        if (hasUpgrade("c",23)) base = 0.45
        return base
    }, // Prestige currency exponent
    canBuyMax: true,
    directMult() {
        let mult = new Decimal(1)
        let pow = new Decimal(1)
        if (hasUpgrade("c", 33)) mult = mult.times(upgradeEffect("c",33))
        mult = mult.mul(tmp.g.effect)
        if (hasMilestone("k",1)) pow = pow.add(0.1)
        if (hasMilestone("k",2)) pow = pow.add(0.2)
        if (hasMilestone("k",3)) pow = pow.add(0.2)
        if (hasMilestone("k",4)) pow = pow.add(0.25)
        if (hasMilestone("k",5)) pow = pow.add(0.25)
        if (hasMilestone("k",6)) pow = pow.add(0.5)
        if (hasMilestone("k",7)) pow = pow.add(0.5)
        return mult.pow(pow)
    },
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "c: Reset for conviction", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    update(diff) {
        player.points = player.points.minus(player.points.mul(getDegen()).mul(diff))
    },
    resetsNothing() { return hasAchievement("a",26) }, //Works Fine
    autoPrestige() { return hasAchievement("a",26) }, //Works Fine
    autoUpgrade() { return hasAchievement("a",36) }, //Works now that I changed line 317 in game.js, Gotta keep an eye on this.
    tabFormat: [
        "main-display",
        "prestige-button",
        ["infobox", "conviction"],
        ["display-text", function() { return "Your best Conviction is "+format(player.c.best) }],
        "blank",
        "upgrades",
    ],
    infoboxes: {
        conviction: {
            title: "conviction",
            body() { 
                let dis = "You can focus your Conviction into self improvement..<br>"+
                "<br>"+
                "Conviction is a 'static' resource, and thus you have to gain more faith than previously in order to increase it.<br>"+
                "<br>"+
                "Each upgrade sharing the same ROW doubles the cost of the upgrades in that ROW.<br>"+
                "<br>"+
                "The automation upgrades do not increase in cost."
                return dis
             },
        },
    },
    upgrades: {
        11: {
            title: "Belief",
            description: "Double your Faith gain.",
            cost() {
                let cost = new Decimal(2)
                cost = cost.mul(upgradeEffect("c",15))
                return cost
            },
            effectDisplay() {
                return "2x"
            },
        },
        12: {
            title: "Prayer",
            description: "Add 0.5 to your Faith Exponent",
            cost() {
                let cost = new Decimal(2)
                cost = cost.mul(upgradeEffect("c",15))
                return cost
            },
            effectDisplay() {
                return "x^y+0.5"
            },
        },
        13: {
            title: "Zeal",
            description: "Multiply Faith gain by 1+log2(Best Conviction)",
            cost() {
                let cost = new Decimal(2)
                cost = cost.mul(upgradeEffect("c",15))
                return cost
            },
            effect() {
                let Eff  = new Decimal(1)
                Eff = Eff.add(player.c.best)
                Eff = Eff.log2()
                Eff = Eff.max(1)
                return Eff
            },
            effectDisplay() {
                return format(upgradeEffect("c",13)) + "x"
            },
        },
        15: {
            fullDisplay: "Each Increases Cost By 2x",
            canAfford: false,
            unlocked: false,
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("c",11)) cost = cost.mul(2)
                if (hasUpgrade("c",12)) cost = cost.mul(2)
                if (hasUpgrade("c",13)) cost = cost.mul(2)
                cost = cost.floor()
                return cost
            },
        },
        21: {
            title: "Flagellation",
            description: "Halve your Faith lost to inaction",
            cost() {
                let cost = new Decimal(20)
                cost = cost.mul(upgradeEffect("c",25))
                return cost
            },
        },
        22: {
            title: "22",
            description: "Add 0.75 to your Faith Exponent",
            cost() {
                let cost = new Decimal(20)
                cost = cost.mul(upgradeEffect("c",25))
                return cost
            },
            effectDisplay() {
                return "x^y+0.75"
            }
        },
        23: {
            title: "23",
            description: "Reduce Base Exponent Cost of Conviction",
            cost() {
                let cost = new Decimal(20)
                cost = cost.mul(upgradeEffect("c",25))
                return cost
            },
            effectDisplay() {
                return "-0.05"
            }
        },
        25: {
            fullDisplay: "Each Increases Cost By 2x",
            canAfford: false,
            unlocked: false,
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("c",21)) cost = cost.mul(2)
                if (hasUpgrade("c",22)) cost = cost.mul(2)
                if (hasUpgrade("c",23)) cost = cost.mul(2)
                return cost
            },
        },
        31: {
            title: "31",
            description: "Double your base Faith gain",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("c",35))
                return cost
            },
        },
        32: {
            title: "32",
            description: "Add 1 to your Faith Exponent",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("c",35))
                return cost
            },
            effectDisplay() {
                return "x^y+1"
            }
        },
        33: {
            title: "33",
            description: "Faith increases Conviction gain",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("c",35))
                return cost
            },
            effect() {
                return player.points.add(1).pow(0.05)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id))+"x" 
            },
        },
        35: {
            fullDisplay: "Each Increases Cost By 2x",
            canAfford: false,
            unlocked: false,
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("c",31)) cost = cost.mul(2)
                if (hasUpgrade("c",32)) cost = cost.mul(2)
                if (hasUpgrade("c",33)) cost = cost.mul(2)
                return cost
            },
        },
        41: {
            title: "Scarification",
            description: "Automate Conviction Gain, Forever",
            cost: new Decimal(2500),
            unlocked() {
                let unl = true
                if (hasAchievement("a",26)) unl = false
                return unl
            },
            canAfford() {
                let unl = true
                if (hasAchievement("a",26)) unl = false
                return unl
            },
        },
        42: {
            title: "Burnt Offering",
            description: "Automate buying Conviction upgrades, Forever",
            cost: new Decimal(1000),
            currencyDisplayName: "Gold",
            currencyInternalName: "points",
            currencyLayer: "g",
            unlocked() {
                let unl = true
                if (hasAchievement("a",36)) unl = false
                return unl
            },
        },
}})