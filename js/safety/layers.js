addLayer("C", {
    name: "Conviction", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(1.5), // Can be a function that takes requirement increases into account
    resource: "Conviction", // Name of prestige currency
    baseResource: "Faith", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = 0.5
        if (hasUpgrade("C",23)) base = 0.45
        return base
    }, // Prestige currency exponent
    canBuyMax: true,
    directMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("C", 33)) mult = mult.times(upgradeEffect("C",33))
        mult = mult.mul(layerEffect("G"))
        return mult
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
    resetsNothing() { if (hasAchievement("A",26)) return true},
    autoPrestige() { if (hasAchievement("A",26)) return true},
    upgrades: {
        11: {
            title: "Belief",
            description: "Double your Faith gain.",
            cost() {
                let cost = new Decimal(2)
                cost = cost.mul(upgradeEffect("C",15))
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
                cost = cost.mul(upgradeEffect("C",15))
                return cost
            },
            effectDisplay() {
                return "x^y+0.5"
            },
        },
        13: {
            title: "Zeal",
            description: "Multiply Faith gain by 1+ln(Best Conviction)",
            cost() {
                let cost = new Decimal(2)
                cost = cost.mul(upgradeEffect("C",15))
                return cost
            },
            effect() {
                let Eff  = new Decimal(0)
                Eff = Eff.add(player.C.best)
                Eff = Eff.ln()
                Eff = Eff.add(1)
                return Eff
            },
            effectDisplay() {
                return format(upgradeEffect("C",13)) + "x"
            },
        },
        15: {
            fullDisplay: "Each Increases Cost By 1.5x",
            canAfford: false,
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("C",11)) cost = cost.mul(2)
                if (hasUpgrade("C",12)) cost = cost.mul(2)
                if (hasUpgrade("C",13)) cost = cost.mul(2)
                cost = cost.floor()
                return cost
            },
        },
        21: {
            title: "Flagellation",
            description: "Halve your Faith lost to inaction",
            cost() {
                let cost = new Decimal(20)
                cost = cost.mul(upgradeEffect("C",25))
                return cost
            },
        },
        22: {
            title: "22",
            description: "Add 0.75 to your Faith Exponent",
            cost() {
                let cost = new Decimal(20)
                cost = cost.mul(upgradeEffect("C",25))
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
                cost = cost.mul(upgradeEffect("C",25))
                return cost
            },
            effectDisplay() {
                return "-0.05"
            }
        },
        25: {
            fullDisplay: "Each Increases Cost By 2x",
            canAfford: false,
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("C",21)) cost = cost.mul(2)
                if (hasUpgrade("C",22)) cost = cost.mul(2)
                if (hasUpgrade("C",23)) cost = cost.mul(2)
                return cost
            },
        },
        31: {
            title: "31",
            description: "Quarter your Faith lost to inaction",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("C",35))
                return cost
            },
        },
        32: {
            title: "32",
            description: "Add 1 to your Faith Exponent",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("C",35))
                return cost
            },
            effectDisplay() {
                return "x^y+1"
            }
        },
        33: {
            title: "33",
            description: "Faith increase Conviction gain",
            cost() {
                let cost = new Decimal(100)
                cost = cost.mul(upgradeEffect("C",35))
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
            effect() {
                let cost  = new Decimal(1)
                if (hasUpgrade("C",31)) cost = cost.mul(2)
                if (hasUpgrade("C",32)) cost = cost.mul(2)
                if (hasUpgrade("C",33)) cost = cost.mul(2)
                return cost
            },
        },
        41: {
            title: "Scarification",
            description: "Automate Conviction Gain, Forever",
            cost: new Decimal(1000),
            unlocked() {
                let unl = true
                if (hasAchievement("A",26)) unl = false
                return unl
            },
            canAfford() {
                let unl = true
                if (hasAchievement("A",26)) unl = false
                return unl
            },
        },
}}),
addLayer("A", {
    name: "Achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    tooltip() {
      return "Achievements"
    },
    color: "#FFFF00",
    nodeStyle() {return {
        "background": "radial-gradient(#FFFF00, #d5ad83)" ,
    }},
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "Achievement Points",
    resourceSingular: "Achievement Point", 
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown() { return true },
    effect(){
        let acheff = player[this.layer].points.add(1)
        acheff = acheff.log10()
        acheff = acheff.div(10)
        return acheff
    },
    effectDescription() {
        let dis = "<br> which boosts base Faith gain by " + format(tmp.A.effect)
        return dis
    },
    achievements: {
        rows: 23,
        cols: 6,
        11: {
            name: "That.. that's a nerf..",
            doneTooltip: "This is worth 10 points",
            unlocked() {if (hasAchievement("A",11)) return true
            },
            done() {
                if (hasUpgrade("C",12))
                return getPointGen()<1
            },
            onComplete() {
                addPoints("A",10)
            }
        },
        12: {
            name: "Softlocked",
            doneTooltip: "Should have been 20 points..",
            unlocked() {if (hasAchievement("A",12)) return true
            },
            done() {
                if (hasUpgrade("C",12))
                return player.points>=4.65
            },
            onComplete() {
                addPoints("A",10)
            }
        },
        21: {
            name: "Believe",
            tooltip: "Get your tenth point of Conviction",
            done() {
                return player.C.points.gte(10)
            },
            onComplete() {
                addPoints("A",1)
            },
        },
        22: {
            name: "Believe More",
            tooltip: "Get your 100th point of Conviction",
            done() {
                return player.C.points.gte(100)
            },
            onComplete() {
                addPoints("A",1)
            },
        },
        23: {
            name: "Believe Moar",
            tooltip: "Get your 500th point of Conviction",
            done() {
                return player.C.points.gte(500)
            },
            onComplete() {
                addPoints("A",1)
            },
        },
        24: {
            name: "Believe Most",
            tooltip: "Get your 1000th point of Conviction",
            done() {
                return player.C.points.gte(1000)
            },
            onComplete() {
                addPoints("A",1)
            },
        },
        25: {
            name: "Believe Mostester",
            tooltip: "Get your 10000th point of Conviction",
            done() {
                return player.C.points.gte(10000)
            },
            onComplete() {
                addPoints("A",1)
            },
        },
        26: {
            name: "Auto-Conviction Gain",
            doneTooltip: "Read the title",
            unlocked() {if (hasAchievement("A",26)) return true
            },
            done() {
                return hasUpgrade("C",41)
            },
            onComplete() {
                addPoints("A",1)
            }
        },
    }
}),

addLayer("G", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(100),             // "points" is the internal name for the main resource of the layer.
        rec: new Decimal(0),
    }},
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "Gold",                       // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
    position: 0,
    baseResource: "Conviction",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.C.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(600),               // The amount of the base needed to  gain 1 of the prestige currency. 
                                            // Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.9,                          // "normal" prestige gain is (currency^exponent).
    hotkeys: [
        {key: "h", description: "h: Reset for church gold", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    layerShown() {
        let shown = false
        if(player.C.total.gte(800)) shown = true
        if(player.G.unlocked) shown = true
        return shown
    },
    effect() {
        let eff = new Decimal(1)
        eff = eff.add(player.G.rec)
        eff = eff.log10()
        return eff
    },
    effectDescription() {
        return "<br>you have recruited "+format(player.G.rec)+" people into your cult,"+
                "<br>your cult increases Conviction gain by "+this.effect()+"%"
    },
    update(diff) {
            player.G.rec = player.G.rec.add((getBuyableAmount(this.layer, 11)).times(diff))
            player.G.buyables[11] = player.G.buyables[11].add(player.G.buyables[12].mul(diff))


    },
    buyables: {
        11: {
            cost(x) { return new Decimal(2).pow(x) },
            display() { return "Disciple"+
                                "<br>"+
                                "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Citizens/second"+
                                "<br>"+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                return eff
            },
        },
        12: {
            cost(x) { return new Decimal(3).pow(x).add(9) },
            display() { return "Acolyte"+
                                "<br>"+
                                "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Disciples/second"+
                                "<br>"+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                return eff
            },
        },
    }
})