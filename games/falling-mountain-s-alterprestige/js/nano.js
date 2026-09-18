addLayer("Nanoprestige", {
    name: "Nanoprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        hiddenRows: 0,
        corruptionTick:new Decimal(0),
        corruption:0,
        pageNumber:new Decimal(1),
    }},
    color: "#5BCEFA",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Nanoprestiges", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    effect() {
        var eff = player.Nanoprestige.points.plus(1)
        if (hasUpgrade("Microprestige", 21)) eff = eff.pow(2)
        if (hasUpgrade("Nanoprestige", 42)) eff = eff.pow(2)
        if (challengeCompletions("Nanoprestige", 11) >= 1) eff = eff.pow(2)
        if (challengeCompletions("Nanoprestige", 11) >= 2) eff = eff.pow(2)
        if (challengeCompletions("Nanoprestige", 11) >= 5) eff = eff.pow(2)
        if (hasUpgrade("Nanoprestige", 62)) eff = eff.pow(3)
        if (inChallenge("Nanoprestige", 21)) eff = new Decimal(1)
        return eff
    },
    effectDescription() {
        var desc;
        desc = "which are multiplying Point gain by "
        desc += format(tmp.Nanoprestige.effect) + "x"
        if (hasUpgrade("Microprestige", 41) && !hasUpgrade("Microprestige", 42)) return "IT'S GETTING WORSE"
        if (hasUpgrade("Microprestige", 34) && !hasUpgrade("Microprestige", 42)) return "what have you done"
        return desc
    },
    base() {
        base = 1.5
        if (hasUpgrade("Nanoprestige", 35)) base = 1.46
        return base
    } ,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("Microprestige", 12)) mult = mult.div(3)
        if (hasUpgrade("Microprestige", 13)) mult = mult.div(upgradeEffect("Microprestige", 13))
        if (hasUpgrade("Microprestige", 44)) mult = mult.div("1e5000")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        if (hasChallenge("Nanoprestige", 21)) mult = mult.times(1.3)
        if (hasUpgrade("Nanoprestige", 51)) mult = mult.times(1.1)
        if (hasUpgrade("Nanoprestige", 55)) mult = mult.times(1.2)
        if (hasUpgrade("Microprestige",14)) mult = mult.times(buyableEffect("Microprestige", 11))
        
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        if (hasUpgrade("Microprestige",14)) mult = mult.times(buyableEffect("Microprestige", 11))
        if(hasUpgrade("Nanoprestige", 16)) mult = mult.times(upgradeEffect("Nanoprestige", 16))
        if(hasUpgrade("Nanoprestige", 26)) mult = mult.times(upgradeEffect("Nanoprestige", 26))
        if(hasUpgrade("BrokenNano", 11)) mult = mult.times(buyableEffect("BrokenNano", 11))
        if (hasUpgrade("Nanoprestige", 64)) mult = mult.times(upgradeEffect("Nanoprestige", 64))
        if (hasUpgrade("Microprestige", 44)) mult = mult.times(upgradeEffect("Microprestige", 44))
        if (hasUpgrade("Nanoprestige", 71)) mult = mult.times(upgradeEffect("Nanoprestige", 71))
        if (hasUpgrade("BrokenNano", 21)) mult = mult.times(buyableEffect("BrokenNano", 21))
        if (hasChallenge("Microprestige", 11)) mult = mult.pow(1.2)
        if (hasUpgrade("Miniprestige", 22)) mult = mult.pow(upgradeEffect("Miniprestige", 22))
        if (hasUpgrade("Nanoprestige", 84)) mult = mult.pow(upgradeEffect("Nanoprestige", 84))
        if (hasUpgrade("Nanoprestige", 91)) mult = mult.pow(upgradeEffect("Nanoprestige", 91))
        mult = mult.pow(buyableEffect("BrokenMicro", 21))
        if (hasMilestone("Nanoprestige", 4)) mult = mult.pow(Decimal.pow(player.Unlockers.achievements.length - 22, player.Nanoprestige.milestones.length))
        if (hasUpgrade("Smallprestige", 11)) mult = mult.pow(tmp.Smallprestige.smallForcePow)
        if (hasUpgrade("Microprestige", 55)) mult = mult.pow(upgradeEffect("Microprestige", 55))
        if (inChallenge("Microprestige", 11)) mult = mult.pow(0.1)
        return mult

    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Reset for Nanoprestiges", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tickCorruption() {
        if (player.Nanoprestige.corruptionTick.lte(5)) player.Nanoprestige.corruptionTick = player.Nanoprestige.corruptionTick.plus(1)
        else {
            player.Nanoprestige.corruption = Math.random()
            player.Nanoprestige.corruptionTick = new Decimal(0)
        }
        if (hasUpgrade("Microprestige", 42)) player.Nanoprestige.corruption = 0;

    },
    buyables: {
        11: {
            cost(x) {
                var cost
                var base2 = new Decimal(1.12)
                var expo = new Decimal(1.2)
                if (hasUpgrade("Nanoprestige", 41)) expo = 1.1
                if (hasUpgrade("Nanoprestige", 35)) base2 = 1.1
                if (!hasUpgrade("Nanoprestige", 91)) cost = new Decimal("35").plus(x.pow(1/2).mul(Decimal.pow(base2, x.pow(expo))))
                else cost = new Decimal("35").plus(Decimal.pow(base2, x.pow(expo)))
                if (hasUpgrade("Nanoprestige", 14)) cost = cost.div(2)
                if (hasUpgrade("Nanoprestige", 34) && !inChallenge("Nanoprestige", 12)) cost = cost.div(buyableEffect("Nanoprestige", 13))
                if (challengeCompletions("Nanoprestige", 11) >= 4) cost = cost.div(Decimal.pow(1.25, challengeCompletions("Nanoprestige", 11)))
                if (player.Nanoprestige.buyables[11].gte(5000) && !hasUpgrade("Nanoprestige", 91)) cost = Decimal.dInf
                return Decimal.ceil(cost)
            },
            title() { return "Nanobuff"},
            display() {
                var base = new Decimal(3)
                var base2 = new Decimal(1.12)
                var expo = new Decimal(1.2)
                if (hasUpgrade("Nanoprestige", 41)) expo = 1.1
                if (hasUpgrade("Nanoprestige", 35)) base2 = 1.1
                if (hasUpgrade("Microprestige", 22)) base = base.plus(0.5)
                base = base.plus(buyableEffect("Nanoprestige", 22))
                if (hasUpgrade("Nanoprestige", 55)) base = base.plus(buyableEffect("Nanoprestige", 22))
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(1)
                if (hasUpgrade("Nanoprestige", 25)) base = base.times(player.points.plus(10).log10().log10().plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 3 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 1).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 1).plus(1))
                if (challengeCompletions("Nanoprestige", 21) >= 3) base = base.times(buyableEffect("Nanoprestige", 22).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                var display;
                display = "Multiply Point gain by " + format(this.effect())+"x<br>"
                display += "Formula: "+ format(base) + "^x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "Cost formula: 35 + √(x)*" + format(base2) +"^(x^" + format(expo) + ")<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() { 
                if (!hasUpgrade("Nanoprestige", 91)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[11].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost(player.Nanoprestige.buyables[11]))
                if (!hasUpgrade("Nanoprestige", 91)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = Decimal.ceil(Decimal.log(player.Nanoprestige.points.times(buyableEffect("Nanoprestige", 13)).minus(35).div(7), 1.1).pow(new Decimal(1).div(1.1)))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)


                }
            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",13)) {
                    return true
                } else return false

            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("Nanoprestige", 91)) amount = amount.pow(buyableEffect("Nanoprestige", 31))
                return amount
            },
            effect() {
                var base = new Decimal(3)
                if (hasUpgrade("Microprestige", 22)) base = base.plus(0.5)
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(1)
                base = base.plus(buyableEffect("Nanoprestige", 22))
                if (hasUpgrade("Nanoprestige", 25)) base = base.times(player.points.plus(10).log10().log10().plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 3 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 1).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 1).plus(1))
                if (challengeCompletions("Nanoprestige", 21) >= 3) base = base.times(buyableEffect("Nanoprestige", 22).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                var eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff
            },
            
        },
        12: {
            cost(x) {
                var cost;
                cost = new Decimal("70").plus(Decimal.mul(10, Decimal.pow(1.25, x.pow(1.1))))
                if (hasUpgrade("Nanoprestige", 14)) cost = cost.div(2)
                if (hasUpgrade("Nanoprestige", 34) && !inChallenge("Nanoprestige", 12)) cost = cost.div(buyableEffect("Nanoprestige", 13))
                if (challengeCompletions("Nanoprestige", 11) >= 4) cost = cost.div(Decimal.pow(1.25, challengeCompletions("Nanoprestige", 11)))
                if (player.Nanoprestige.buyables[12].gte(5000) && !hasUpgrade("Nanoprestige", 91)) cost = Decimal.dInf
                return Decimal.ceil(cost)
            
            },
            title() { return "Nanogains"},
            display() {
                var display;
                var base = Decimal.mul(player.Nanoprestige.upgrades.length, 1/2.5).plus(1)
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(Decimal.mul(player.Nanoprestige.upgrades.length, 1/5))
                if (hasUpgrade("Nanoprestige", 55)) base = base.plus(buyableEffect("Nanoprestige", 22))
                if (challengeCompletions("Nanoprestige", 12) >= 2 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 0.5).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 0.5).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                display = "Multiply Point gain by " + format(this.effect())+"x<br>"
                display += "Formula: " + format(base) +"^x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "Cost formula:"
                display += " 70 + 15*1.25^(x^1.1)<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() {
                if (!hasUpgrade("Nanoprestige", 91)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[12].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (!hasUpgrade("Nanoprestige", 91)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = new Decimal(Decimal.ceil(Decimal.log(player.Nanoprestige.points.minus(70).times(buyableEffect("Nanoprestige", 13)).div(7), 1.25).pow(new Decimal(1).div(1.1))))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)
                }

            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",33)) {
                    return true
                } else return false

            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("Nanoprestige", 91)) amount = amount.pow(buyableEffect("Nanoprestige", 31))
                return amount
            },
            effect() {
                var base = Decimal.mul(player.Nanoprestige.upgrades.length, 1/2.5).plus(1)
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(Decimal.mul(player.Nanoprestige.upgrades.length, 1/5))
                if (hasUpgrade("Nanoprestige", 55)) base = base.plus(buyableEffect("Nanoprestige", 22).times(2))
                if (challengeCompletions("Nanoprestige", 12) >= 2 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 0.5).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 0.5).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                var eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff
            }
        },
        13: {
            title() {
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.9) return "ampqYXNkb2xhaXdqZHc"
                else return "Nanomuscle"
            
            },
            cost(x) {
                var cost = new Decimal("150").times(Decimal.pow(1.5, x.pow(1.1)))
                if (challengeCompletions("Nanoprestige", 11) >= 4) cost = cost.div(Decimal.pow(1.25, challengeCompletions("Nanoprestige", 11)))
                if (player.Nanoprestige.buyables[13].gte(5000) && (!hasUpgrade("Nanoprestige", 91))) cost = Decimal.dInf
                return cost
            
            },
            display() {
            var display;
                display = "Divide buyable and Microprestige requirements by " + format(this.effect()) +"<br>"
                display += "Formula: "
                base = new Decimal(1.2)
                base = base.plus(buyableEffect("Nanoprestige", 21))
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(new Decimal(1))
                if (challengeCompletions("Nanoprestige", 12) >= 4 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 0.25).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 1).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                if (hasUpgrade("BrokenNano", 11)) base = base.times(buyableEffect("BrokenNano", 12))
                display += format(base) + "^x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "Cost formula: 1.5^(x^1.1)<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.7) display = "RGl2aWRlIGJ1eWFibGUgYW5kIE1pY3JvcHJlc3R<br>pZ2UgcmVxdWlyZW1lbnRzIGJ5"
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.9) display = "ZmZvZWFpc0JTTFdIZmU"
                return display;
            },
            canAfford() {
                if (!hasUpgrade("Nanoprestige", 91)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[13].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (!hasUpgrade("Nanoprestige", 91)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = new Decimal(Decimal.ceil(Decimal.log(player.Nanoprestige.points.div(150).div(7), 1.5).pow(new Decimal(1).div(1.1))))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)
                }
            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",34)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("BrokenNano", 21)) amount = amount.plus(buyableEffect("BrokenNano", 22))
                if (hasUpgrade("Nanoprestige", 91)) amount = amount.pow(buyableEffect("Nanoprestige", 31))
                return amount
            },
            effect() {
                var base = new Decimal(1.2)
                base = base.plus(buyableEffect("Nanoprestige", 21))
                if (challengeCompletions("Nanoprestige", 12) >= 1) base = base.plus(new Decimal(1))
                if (challengeCompletions("Nanoprestige", 12) >= 4 && !(challengeCompletions("Nanoprestige", 12) >= 5)) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12), 0.25).plus(1))
                if (challengeCompletions("Nanoprestige", 12) >= 5) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 12)+challengeCompletions("Nanoprestige", 11)+challengeCompletions("Nanoprestige", 21)+challengeCompletions("Nanoprestige", 22), 0.25).plus(1))
                if (hasUpgrade("Microprestige", 43)) base = base.times(buyableEffect("Microprestige", 12))
                if (hasUpgrade("BrokenNano", 11)) base = base.times(buyableEffect("BrokenNano", 12))
                var eff = new Decimal(base).pow(tmp.Nanoprestige.buyables[13].totalAmount)
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff;
            }
        },
        21: {
            title() {return "Nanopierce"},
            cost(x) {
                var cost;
                cost = new Decimal("650").plus(Decimal.pow("1.5", Decimal.pow(x, 1.3)))
                if (hasUpgrade("Nanoprestige", 34) && !inChallenge("Nanoprestige", 11)) cost = cost.div(buyableEffect("Nanoprestige", 13))
                if (challengeCompletions("Nanoprestige", 11) >= 4) cost = cost.div(Decimal.pow(1.25, challengeCompletions("Nanoprestige", 11)))
                if (!hasUpgrade("Nanoprestige", 93) && player.Nanoprestige.buyables[21].gte(5000)) cost = Decimal.dInf
                return Decimal.ceil(cost)
                
            },
            display() {
                var display;
                var base = new Decimal(0.1)
                if (hasUpgrade("Nanoprestige", 45)) base = base.plus(0.02)
                if (hasChallenge("Nanoprestige", 21)) base = base.plus(0.02)
                if (challengeCompletions("Nanoprestige", 21) >= 2) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 21), 0.10).plus(1))
                var costBase = "650 + 1.5^(x^1.3)"
                display = "Increase the effect of Nanomuscle by " + format(this.effect()) +"<br>"
                display += "Effect: +" + format(base) + "<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "Cost formula: " + costBase
                display += "<br>Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() {
                if (!hasUpgrade("Nanoprestige", 93)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[21].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (!hasUpgrade("Nanoprestige", 93)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = new Decimal(Decimal.ceil(Decimal.log(player.Nanoprestige.points.times(3.5).times(buyableEffect("Nanoprestige", 13)).minus(650), 1.5).pow(new Decimal(1).div(1.3))))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)
                }
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("Nanoprestige", 93)) amount = amount.pow(buyableEffect("Nanoprestige", 32))
                return amount
            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",43)) {
                    return true
                } else return false
            },
            effect() {
                var base = new Decimal(0.1)
                if (hasUpgrade("Nanoprestige", 45)) base = base.plus(0.02)
                if (hasChallenge("Nanoprestige", 21)) base = base.plus(0.02)
                if (challengeCompletions("Nanoprestige", 21) >= 2) base = base.times(Decimal.mul(challengeCompletions("Nanoprestige", 21), 0.20).plus(1))
                var eff = base.times((tmp[this.layer].buyables[this.id].totalAmount))
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(0)
                return eff;
            }
        },
        22: {
            title() {return "Nanophase"},
            cost(x) {
                var cost;
                cost = new Decimal("3.5e7").plus(new Decimal("1e6").times(Decimal.pow(1.25, x.pow(1.2))))
                if (hasUpgrade("Nanoprestige", 34) && !inChallenge("Nanoprestige", 11)) cost = cost.div(buyableEffect("Nanoprestige", 13))
                if (challengeCompletions("Nanoprestige", 11) >= 4) cost = cost.div(Decimal.pow(1.25, challengeCompletions("Nanoprestige", 11)))
                if (!hasUpgrade("Nanoprestige", 93) && player.Nanoprestige.buyables[22].gte(5000)) cost = Decimal.dInf
                return cost
            },
            display() {
                var display;
                display = "Increase power of Nanobuff by +" + format(this.effect()) +"<br>"
                display += "Effect: +0.25x <br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "Cost scaling: 3.5e7 + 1e6*1.25^(x^1.2)"
                display += "<br>Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() {
                if (!hasUpgrade("Nanoprestige", 93)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[22].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (!hasUpgrade("Nanoprestige", 93)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = new Decimal(Decimal.ceil(Decimal.log(player.Nanoprestige.points.times(3.5).times(buyableEffect("Nanoprestige", 13)).minus(3.5e7).div(1e6), 1.25).pow(new Decimal(1).div(1.2))))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)
                }
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("Nanoprestige", 93)) amount = amount.pow(buyableEffect("Nanoprestige", 32))
                return amount
            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",52)) {
                    return true
                } else return false
            },
            effect() {
                var base = new Decimal(0.25)
                if (hasChallenge("Nanoprestige", 21)) base = base.plus(0.05)
                var eff = new Decimal(base).times(tmp[this.layer].buyables[this.id].totalAmount)
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(0)
                return eff;
            }
        },
        23: {
            title() {return "Nanofracture"},
            cost(x) {
                var cost;
                cost = new Decimal("1e40").plus(new Decimal("1e40").times(Decimal.pow(3, x.pow(1.5))))
                if (hasUpgrade("Nanoprestige", 34) && !inChallenge("Nanoprestige", 11)) cost = cost.div(buyableEffect("Nanoprestige", 13))
                if (!hasUpgrade("Nanoprestige", 93) && player.Nanoprestige.buyables[23].gte(5000)) cost = Decimal.dInf
                return cost
            },
            display() {
                var base = new Decimal(1.25)
                if (hasUpgrade("Nanoprestige", 63)) base = base.plus(0.25)
                var display;
                display = "Increase Nanoprestige Fragment gain by " + format(this.effect()) +"x.<br><br>"
                display += "Effect: " + format(base) + "<br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges."
                display += "Cost scaling: 1e40+1e40*3^(x^1.5)"
                display += "<br>Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() {
                if (!hasUpgrade("Nanoprestige", 93)) return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[23].lt(5000))
                else return player[this.layer].points.gte(this.cost())
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("Nanoprestige", 93)) amount = amount.pow(buyableEffect("Nanoprestige", 32))
                return amount
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (!hasUpgrade("Nanoprestige", 93)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                else {
                    var buyableMax = new Decimal(Decimal.ceil(Decimal.log(player.Nanoprestige.points.times(3.5).times(buyableEffect("Nanoprestige", 13)).minus("1e40").div("1e40"), 3).pow(new Decimal(1).div(1.5))))
                    if (buyableMax.gte("1e100")) buyableMax = new Decimal("1e100")
                    setBuyableAmount(this.layer, this.id, buyableMax)
                }   
            },
            unlocked() {
                if (hasUpgrade("Nanoprestige",61)) {
                    return true
                } else return false
            },
            effect() {
                var base = new Decimal(1.25)
                if (hasUpgrade("Nanoprestige", 63)) base = base.plus(0.25)
                var eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff;
            }

        },
        31: {
            title() {return "Nano Enlarge I"},
            cost(x) {
                var cost;
                cost = new Decimal("e6e13").pow(new Decimal("1.25").pow(x.pow(x.plus(5).log(5))))
                if (hasUpgrade("Nanoprestige", 95)) cost = new Decimal("e6e13").pow(new Decimal("1.25").pow(x.pow(x.plus(6).log(6))))
                if (player.Nanoprestige.buyables[31].gte(5000)) cost = Decimal.dInf
                return cost
            },
            display() {
                var base = new Decimal(1.05)
                var cascadeBase = new Decimal(0.75)
                base = base.plus(Decimal.mul(0.01, player.Nanoprestige.upgrades.length-40))
                cascadeBase = cascadeBase.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var cascadeEffect = Decimal.pow(tmp[this.layer].buyables[this.id].totalAmount, cascadeBase)
                
                var display;
                display = "Raise the effective level of row 1 Nano buyables by ^" + format(this.effect()) +", increase CASCADE 11 cap by +" + format(cascadeEffect) + ","
                display += "and decrease its cooldown by -" + format(cascadeEffect/8) + "s.<br>"
                display += "Effects increase per upgrade bought.<br>"
                display += "Effect: " + format(base) + "^x <br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "This cost is not affected by Nanomuscle.<br>"
                display += "Cost scaling: 1e6e13^(1.25^(x^log5(x+5)))<br>"
                display += "Levels: " + format(player.Nanoprestige.buyables[31]) + " + " + format(tmp.Nanoprestige.buyables[31].totalAmount.minus(player.Nanoprestige.buyables[31]))
                return display;
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[31].lt(5000))},
            totalAmount() {
                amount = player[this.layer].buyables[this.id]
                if (hasMilestone("Nanoprestige", 2)) amount = amount.pow(1.1)
                if (hasMilestone("Nanoprestige", 5)) amount = amount.pow(1.1)
                return amount
            
            },
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade("Nanoprestige", 91)
            },
            effect() {
                var base = new Decimal(1.05)
                base = base.plus(Decimal.mul(0.01, player.Nanoprestige.upgrades.length-40))
                var eff = new Decimal(base).pow(player[this.layer].buyables[this.id])
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff;
            }
        },
        32: {
            title() {return "Nano Enlarge II"},
            cost(x) {
                var cost;
                cost = new Decimal("ee26").pow(new Decimal("1.3").pow(x.pow(Decimal.log(x, 4))))
                if (player.Nanoprestige.buyables[32].gte(5000)) cost = Decimal.dInf
                return cost
            },
            display() {
                var base = new Decimal(1.05)
                base = base.plus(Decimal.mul(0.01, player.Nanoprestige.upgrades.length-40))
                var cascadeBase = new Decimal(0.75)
                cascadeBase = cascadeBase.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var cascadeEffect = Decimal.pow(tmp[this.layer].buyables[this.id].totalAmount, 0.75)
                var display;
                display = "Raise the effective level of row 2 Nano buyables by ^" + format(this.effect()) +", increase CASCADE 21 cap by +" + format(cascadeEffect) + ","
                display += "and decrease CASCADE 11 cooldown by -" + format(cascadeEffect/5) + "s.<br>"
                display += "Effect: " + format(base) + "^x <br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "This cost is not affected by Nanomuscle.<br>"
                display += "Cost scaling: 1e1.5e26^(1.3^(x^log4(x+4)))<br>"
                display += "Levels: " + format(player.Nanoprestige.buyables[32]) + " + " + format(tmp.Nanoprestige.buyables[32].totalAmount.minus(player.Nanoprestige.buyables[32]))
                return display;
            },
            totalAmount() {
                amount = player[this.layer].buyables[this.id]
                if (hasMilestone("Nanoprestige", 3)) amount = amount.pow(1.1)
                return amount
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[31].lt(5000))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade("Nanoprestige", 93)
            },
            effect() {
                var base = new Decimal(1.05)
                base = base.plus(Decimal.mul(0.01, player.Nanoprestige.upgrades.length-40))
                var eff = new Decimal(base).pow(player[this.layer].buyables[this.id])
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff;
            }
        },
        33: {
            title() {return "Nanodilate"},
            cost(x) {
                var cost;
                cost = new Decimal("ee200").pow(new Decimal("2").pow(x.pow(Decimal.log(x.plus(3), 3))))
                if (player.Nanoprestige.buyables[32].gte(5000)) cost = Decimal.dInf
                return cost
            },
            display() {
                var base = new Decimal(1.1)
                var display;
                display = "Dilate Point gain and raise Nano XVI ^" + format(this.effect())
                display += "<br>Effect: " + format(base) + "^x <br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestiges.<br>"
                display += "This cost is not affected by Nanomuscle.<br>"
                display += "Cost scaling: ee200^(2^(x^log3(x+3)))<br>"
                display += "Levels: " + format(player.Nanoprestige.buyables[33]) + " + " + format(tmp.Nanoprestige.buyables[33].totalAmount.minus(player.Nanoprestige.buyables[33]))
                return display;
            },
            totalAmount() {
                amount = player[this.layer].buyables[this.id]
                return amount
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.Nanoprestige.buyables[31].lt(5000))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasAchievement("Unlockers", 54)
            },
            effect() {
                var base = new Decimal(1.1)
                var eff = new Decimal(base).pow(player[this.layer].buyables[this.id])
                if (inChallenge("Nanoprestige", 12)) eff = new Decimal(1)
                return eff;
            }
        },
    },
    clickables: {
        11: {
            display() {return "Previous page"},
            onClick() {
                player.Nanoprestige.pageNumber = player.Nanoprestige.pageNumber.minus(1)
            },
            canClick(){return player.Nanoprestige.pageNumber.gte(2)},
            unlocked() {return hasAchievement("Unlockers", 33)}

        },
        12: {
            display() {return "Next page"},
            onClick() {
                player.Nanoprestige.pageNumber = player.Nanoprestige.pageNumber.plus(1)
            },
            canClick(){return player.Nanoprestige.pageNumber.lte(1)},
            unlocked() {return hasAchievement("Unlockers", 33)}

        },
    },
    upgrades: {
        11: {
            name: "Nanopoint",
            title: "Nanopoint",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(13),
            effect() {
                return player[this.layer].points.add(1);

            },
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
            
        },
        12: {
            name: "Nanopush",
            title: "Nanopush",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(18),
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
        },
        13: {
            name: "Nanobuy",
            title: "Nanobuy",
            description: "Unlock a Nanoprestige buyable, and you can buy max Nanoprestiges.",
            cost: new Decimal(42),
            unlocked() {return hasAchievement("Unlockers", 12) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},

        },
        14: {
            name: "Nanorecharge",
            title: "Nanorecharge",
            description: "Divide buyable requirement by 2, and buyables no longer reset on Microprestige",
            cost: new Decimal(168),
            unlocked() {return hasAchievement("Unlockers", 14) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        
        },
        15: {
            name: "Nanohelp",
            title: "Nanohelp",
            description: "Divide Microprestige requirement based on Miniprestiges.",
            cost: new Decimal(1728),
            unlocked() {return hasAchievement("Unlockers", 21) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
            effect() {return player.Miniprestige.points.pow(2).plus(1)},
            effectDisplay() {return format(player.Miniprestige.points.pow(2).plus(1))}
        },
        21: {
            name: "Nanoclick",
            title: "Nanoclick",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(24),
            unlocked() {
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.9) return false
                else return hasAchievement("Unlockers", 11) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")
            
            },
        },
        22: {
            name: "Nanoshove",
            title: "Nanoshove",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(30),
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},

        },
        23: {
            name: "Nanosell",
            title: "Nanosell",
            description: "Automatically buy Nanoprestiges.",
            cost: new Decimal(48),
            unlocked() {
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.6) return false
                else return hasAchievement("Unlockers", 12) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")
            },

        },
        24: {
            name: "Nanodecharge",
            title: "Nanodecharge",
            description: "Divide Microprestige requirement by 2, and multiply point gain by 7.",
            cost: new Decimal(200),
            unlocked() {return hasAchievement("Unlockers", 14) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        
        },
        25: {
            name: "Nanoretain",
            title: "Nanoretain",
            description: "Increase power of Nanobuff by log(log(points))/3.",
            cost: new Decimal(1820),
            unlocked() {return hasAchievement("Unlockers", 21) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
        },
        31: {
            name: "Nanolove",
            title: "Nanolove",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(90),
            unlocked() {
                var corruption = Math.random()
                if (hasUpgrade("Microprestige", 34) && player.Nanoprestige.corruption >= 0.9) return false
                else return hasAchievement("Unlockers", 13) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")
            }

        },
        32: {
            name: "Nanohate",
            title: "Nanohate",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(97),
            unlocked() {
                return hasAchievement("Unlockers", 13) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")
            }

        },
        33: {
            name: "Nanonull",
            title: "Nanonull",
            description: "Unlock another Nanoprestige buyable.",
            cost: new Decimal(103),
            unlocked() {
                return hasAchievement("Unlockers", 13) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")
            }

        },
        34: {
            name: "Nanocharge",
            title: "Nanocharge",
            description: "Buyables no longer cost anything, and unlock a new one",
            cost: new Decimal(209),
            unlocked() {return hasAchievement("Unlockers", 14) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        
        },
        35: {
            name: "Nanoupward",
            title: "Nanoupward",
            description: "Change the 1.12 in Nanobuff's cost formula to a 1.1.",
            cost: new Decimal(2121),
            unlocked() {return hasAchievement("Unlockers", 21) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
        },
        41: {
            name: "NanoI",
            title: "NanoI",
            description: "Reduce the ^1.2 in Nanobuff's cost formula to a ^1.1.",
            cost: new Decimal(323),
            unlocked() {return hasAchievement("Unlockers", 16) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        42: {
            name: "NanoII",
            title: "NanoII",
            description: "Square the Nanoprestige formula again.",
            cost: new Decimal(350),
            unlocked() {return hasAchievement("Unlockers", 16) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        43: {
            name: "NanoIII",
            title: "NanoIII",
            description: "Unlock another Nanoprestige buyable.",
            cost: new Decimal(432),
            unlocked() {return hasAchievement("Unlockers", 16) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}

        },
        44: {
            name: "NanoIV",
            title: "NanoIV",
            description: "Unlock 2 Nanoprestige challenges",
            cost: new Decimal(500),
            unlocked() {return hasAchievement("Unlockers", 16) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        45: {
            name: "NanoV",
            title: "NanoV",
            description: "Slightly increase power of Nanopierce.",
            cost: new Decimal(2422),
            unlocked() {return hasAchievement("Unlockers", 21) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")},
        },
        51: {
            name: "Nanoscale",
            title: "Nanoscale",
            description: "Slightly reduce Nanoprestige cost scaling.",
            cost: new Decimal(3878),
            unlocked() {return hasAchievement("Unlockers", 23) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        52: {
            name: "Nanobalance",
            title: "Nanobalance",
            description: "Unlock a new Nanoprestige buyable.",
            cost: new Decimal(4298),
            unlocked() {return hasAchievement("Unlockers", 23) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}

        },
        53: {
            name: "Nanomass",
            title: "Nanomass",
            description: "Slightly reduce Microprestige cost scaling.",
            cost: new Decimal(4540),
            unlocked() {return hasAchievement("Unlockers", 23) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}

        },
        54: {
            name: "Nanoweight",
            title: "Nanoweight",
            description: "Unlock 2 new Nanoprestige challenges.",
            cost: new Decimal(5087),
            unlocked() {return hasAchievement("Unlockers", 23) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        55: {
            name: "Nanofinale",
            title: "Nanofinale",
            description: "Makes Nanophase work on Nanogains, and double its power. Also reduce Nano cost scaling.",
            cost: new Decimal(7050),
            unlocked() {return hasChallenge("Nanoprestige", 22) && (player.Nanoprestige.pageNumber.equals(1) || player.tab != "Nanoprestige")}
        },
        61: {
            name: "Nanofracture",
            title: "Nanofracture",
            description: "Unlock a new buyable.",
            cost: new Decimal(3e6),
            unlocked() {return hasAchievement("Unlockers", 33) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")}
        },
        62: {
            name: "Nanostrawman",
            title: "Nanostrawman",
            description: "Cube the Nanoprestige effect.",
            cost: new Decimal(1.5e7),
            unlocked() {return (hasAchievement("Unlockers", 33) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige"))}
        },
        63: {
            name: "Nanoagain",
            title: "Nanoagain",
            description: "The buyable Nanofracture has an increased effect.",
            cost: new Decimal(2.5e7),
            unlocked() {return (hasAchievement("Unlockers", 33) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige"))}
        },
        64: {
            name: "Nanowrimo",
            title: "Nanowrimo",
            description: "Multiply Nanoprestige Gain by log(log(points)).",
            cost: new Decimal(5e12),
            unlocked() {return (hasAchievement("Unlockers", 33) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige"))},
            effect() {
                if (hasUpgrade("Miniprestige", 13)) return player.points.plus(10).log2().log2().plus(1);
                else return player.points.plus(10).log10().log10().plus(1);

            },
            effectDisplay() {return format(upgradeEffect("Nanoprestige", 64))+"x"}
        },
        65: {
            name: "Nanofinale2",
            title: "Nanofinale 2",
            description: "Multiply Microprestige gain by 7.",
            cost: new Decimal(2e14),
            unlocked() {return (hasAchievement("Unlockers", 33) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige"))},
        },
        71: {
            name: "NanoVI",
            title: "NanoVI",
            description: "Multiply Nanoprestige gain by Microprestige's effect, and increase said effect to the power of 2.",
            cost: new Decimal("1.5e617"),
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            effect() {
                return tmp.Microprestige.effect
            },
            effectDisplay() {return format(tmp.Microprestige.effect) + "x"}
        },
        72: {
            name: "NanoVII",
            title: "NanoVII",
            description: "Increase the power of Microbuff.",
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("5e1969"),
        },
        73: {
            name: "NanoVIII",
            title: "NanoVIII",
            description: "Significantly reduce the scaling of Microbuff.",
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("9e2120"),
        },
        74: {
            name: "NanoIX",
            title: "NanoIX",
            description: "Reduce the cost scaling of Boost II.",
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("1e2581"),
        },
        75: {
            name:"NanoX",
            title: "NanoX",
            description: "Unlock Nanoprestige milestones, and raise Point gain to ^1.15",
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("1e10000")
        },
        81: {
            name:"NanoXI",
            title: "NanoXI",
            description: "Nanoprestiges boost Nanoprestige fragment gain more.",
            effect() {
                return player.BrokenNano.points.plus(1e10).log10().log10().pow(1/2).div(10).plus(1)
            },
            effectDisplay() {
                return "^"+format(upgradeEffect("Nanoprestige", 81))
            },
            unlocked() {return hasAchievement("Unlockers", 41) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("1e33e6")
        },
        82: {
            name:"NanoXII",
            title: "NanoXII",
            description: "Break Constant divides Capital price.",
            effect() {
                return tmp.BrokenNano.effect.plus(10).log10().plus(1)
            },
            effectDisplay() {
                return "/"+format(upgradeEffect("Nanoprestige", 82))
            },
            unlocked() {return hasAchievement("Unlockers", 41) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("1e66e6")
        },
        83: {
            name:"NanoXIII",
            title: "NanoXIII",
            description: "Capital effect multiplies rather than adds.",
            unlocked() {return hasAchievement("Unlockers", 41) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e500000000")
        },
        84: {
            name:"NanoXIV",
            title: "NanoXIV",
            description: "Nanoprestige Fragments boost Nanoprestige gain exponent.",
            unlocked() {return hasAchievement("Unlockers", 41) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e1.66e9"),
            effect() {
                return player.BrokenNano.points.plus(1e10).log10().log10().pow(2/3).div(5).plus(1)
            },
            effectDisplay() {return "^"+format(upgradeEffect("Nanoprestige", 84))}
        },
        85: {
            name:"NanoXV",
            title: "NanoXV",
            description: "Capital effect is 1.03^x rather than 1+0.11x.",
            unlocked() {return hasAchievement("Unlockers", 41) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e3.75e9")
        },
        91: {
            name:"NanoXVI",
            title: "NanoXVI",
            description: "Raise the cap of the first row of Nano buyables, make log10(log10(Points)) ^0.5 exponentiate Nano gain, and unlock a new buyable.",
            effect() {
                if (!hasAchievement("Unlockers", 54)) return player.points.plus("1e10").log10().log10().div(5).plus(1).pow(0.5)
                else return player.points.plus("1e10").log10().log10().div(5).plus(1).pow(0.5).pow(buyableEffect("Nanoprestige", 33))
            },
            effectDisplay() {return "^"+format(upgradeEffect("Nanoprestige", 91))},
            unlocked() {return hasAchievement("Unlockers", 46) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e6e13"),

        },
        92: {
            name: "NanoXVII",
            title: "NanoXVII",
            description: "Remove Communals, and every effective CASCADE 11 buyable multiplies BN caps by 1.25.",
            unlocked() {return hasAchievement("Unlockers", 46) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e7.5e23"),
            effect() {
                return Decimal.pow(1.25, tmp.BrokenMicro.buyables[11].totalAmount)
            },
            effectDisplay() {return "*"+format(upgradeEffect("Nanoprestige", 92))}
        },
        93: {
            name: "NanoXVIII",
            title: "NanoXVIII",
            description: "Unlock a new buyable, and CASCADE 21 also boosts Nanoprestige Fragment gain.",
            unlocked() {return hasAchievement("Unlockers", 46) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("e7.5e25"),
        },
        
        94: {
            name: "NanoXIX",
            title: "NanoXIX",
            description: "Exponentiate Point gain based on Nanoprestiges.",
            unlocked() {return hasAchievement("Unlockers", 46) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("ee45"),
            effect() {
                return player.Nanoprestige.points.plus("1e10").log10().log10()
            },
            effectDisplay() {return "^"+format(upgradeEffect("Nanoprestige", 94))}
        },
        95: {
            name: "NanoXX",
            title: "NanoXX",
            description: "Nano Enlarge I's log5 is now a log6",
            unlocked() {return hasAchievement("Unlockers", 46) && (player.Nanoprestige.pageNumber.equals(2) || player.tab != "Nanoprestige")},
            cost: new Decimal("ee51"),

            
        },
        /*
        101: {
            name: "NanoXXI",
            title: "NanoXXI",
            description: "Multiply Nanoprestige gain by log2(Microprestiges)",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(7.4e27),
            effect() {
                return player.Microprestige.points.plus(2).log2().plus(1)
            },
            effectDisplay() {return format(upgradeEffect("Nanoprestige", 16))+"x"}
        },
        102: {
            name: "NanoXXII",
            title: "NanoXXII",
            description: "Multiply Nanoprestige gain by log10(Points)^1/2",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(5e29),
            effect() {
                return player.points.plus(2).log10().plus(1).pow(1/2)
            },
            effectDisplay() {return format(upgradeEffect("Nanoprestige", 26))+"x"}
        },
        103: {
            name: "NanoXXIII",
            title: "NanoXXIII",
            description: "Nanoprestige points boost their own effect again, but more this time.",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(6.16e33),
            effect() {
                return player.BrokenNano.points.plus(1).log2().log2().div(20)
            },
            effectDisplay() {return "+"+format(upgradeEffect("Nanoprestige", 36))}
        },
        104: {
            name: "NanoXXIV",
            title: "NanoXXIV",
            description: "Nanoprestige points boost their own gain again, but more this time.",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(4.3e36),
            effect() {
                return player.BrokenNano.points.plus(2).log2().log2().div(15).plus(1).pow(1.15)
            },
            effectDisplay() {return "^"+format(upgradeEffect("Nanoprestige", 46))}
        },
        105: {
            name: "NanoXXV",
            title: "NanoXXV",
            description: "Reduce Miniprestige cost scaling.",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(2.39e39),
        },
        111: {
            name: "NanoXXVI",
            title: "NanoXXVI",
            description: "Multiply Nanoprestige Point gain by 1e100",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(8.17e39)
        },
        112: {
            name: "NanoXXVII",
            title: "NanoXXVII",
            description: "Multiply Nanoprestige Point gain based on Microprestiges. Hardcaps at 1e250x",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(4.74e40),
            effect() {
                return Decimal.min("1e250", Decimal.pow(1.005, player.Microprestige.points.plus(1)))
            },
            effectDisplay() {return format(upgradeEffect("Nanoprestige", 76))+"x"}
        },
        113: {
            name: "NanoXXVII",
            title: "NanoXXVII",
            description: "Slightly reduce Microprestige cost scaling",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(7.88e40)
        },
        114: {
            name: "Nanofinale 3",
            title: "Nanofinale 3",
            description: "Multiply Nanoprestige Point gain by 1e50",
            unlocked() {return hasUpgrade("Microprestige", 52)},
            cost: new Decimal(6.96e41)
        },
        */
    },
    challenges: {
        11: {
            name: "Nanoblock",
            challengeDescription: "Point gain is raised to ^0.1.",
            goalDescription() {
                var goal;
                if (challengeCompletions("Nanoprestige", 11) == 0) goal = new Decimal(1e10)
                if (challengeCompletions("Nanoprestige", 11) == 1) goal = new Decimal(1e20)
                if (challengeCompletions("Nanoprestige", 11) == 2) goal = new Decimal(1.8e39)
                if (challengeCompletions("Nanoprestige", 11) == 3) goal = new Decimal(3e83)
                if (challengeCompletions("Nanoprestige", 11) == 4) goal = new Decimal(7e188)
                return format(goal) + " points (" + challengeCompletions("Nanoprestige", 11) + "/5)"
            },
            canComplete() {
                if (challengeCompletions("Nanoprestige", 11) == 0) return player.points.gte(new Decimal(1e10))
                if (challengeCompletions("Nanoprestige", 11) == 1) return player.points.gte(new Decimal(1e20))
                if (challengeCompletions("Nanoprestige", 11) == 2) return player.points.gte(new Decimal(1.8e39))
                if (challengeCompletions("Nanoprestige", 11) == 3) return player.points.gte(new Decimal(3e83))
                if (challengeCompletions("Nanoprestige", 11) == 4) return player.points.gte(new Decimal(7e188))
            },
            rewardDescription() {
                if (challengeCompletions("Nanoprestige", 11) == 0) return "Raises Point gain to ^1.1, and increases the power of Nanoprestiges."
                if (challengeCompletions("Nanoprestige", 11) == 1) return "Increases the power of Nanoprestiges again."
                if (challengeCompletions("Nanoprestige", 11) == 2) return "Reduce Microprestige cost scaling by a small amount."
                if (challengeCompletions("Nanoprestige", 11) == 3) return "Reduce buyable costs based on completions of this challenge."
                if (challengeCompletions("Nanoprestige", 11) == 4) return "Increase the power of Nanoprestige yet again."
            },
            unlocked() {return hasUpgrade("Nanoprestige", 44)},
            completionLimit: 5
        },
        12: {
            name: "Muckraking",
            challengeDescription: "Buyables do not do anything.",
            goalDescription() {
                var goal = new Decimal(1e57).pow(Decimal.pow(2, challengeCompletions("Nanoprestige", 12)))
                if (challengeCompletions("Nanoprestige", 12) == 0) goal = new Decimal(1e57)
                if (challengeCompletions("Nanoprestige", 12) == 1) goal = new Decimal(1.8e127)
                if (challengeCompletions("Nanoprestige", 12) == 2) goal = new Decimal(1.5e232)
                if (challengeCompletions("Nanoprestige", 12) == 3) goal = new Decimal("2.10e479")
                if (challengeCompletions("Nanoprestige", 12) == 4) goal = new Decimal("3e701")
                return format(goal) + " points (" + challengeCompletions("Nanoprestige", 12) + "/5)"
            },
            canComplete() {
                if (challengeCompletions("Nanoprestige", 12) == 0) return player.points.gte(new Decimal(1e57))
                if (challengeCompletions("Nanoprestige", 12) == 1) return player.points.gte(new Decimal(1.8e127))
                if (challengeCompletions("Nanoprestige", 12) == 2) return player.points.gte(new Decimal(1.5e232))
                if (challengeCompletions("Nanoprestige", 12) == 3) return player.points.gte(new Decimal("2.10e479"))
                if (challengeCompletions("Nanoprestige", 12) == 4) return player.points.gte(new Decimal("3e701"))
            },
            rewardDescription() {
                if (challengeCompletions("Nanoprestige", 12) == 0) return "The first row of buyables has increased power. You keep Challenges on Micro resets."
                if (challengeCompletions("Nanoprestige", 12) == 1) return "Multiply the power of Nanogains based on this challenge's completions."
                if (challengeCompletions("Nanoprestige", 12) == 2) return "Multiply the power of Nanobuff based on this challenge's completions."
                if (challengeCompletions("Nanoprestige", 12) == 3) return "Multiply the power of Nanomuscle based on this challenge's completions."
                if (challengeCompletions("Nanoprestige", 12) == 4) return "All previous rewards are based on total challenge completions."
            },
            unlocked() {return hasUpgrade("Nanoprestige", 44)},
            completionLimit: 5
        },
        21: {
            name: "Nanocore",
            challengeDescription: "Nanoblock, but Nanoprestige points have no effect.",
            goalDescription() {
                var goal = new Decimal(1e63).pow(Decimal.pow(2, challengeCompletions("Nanoprestige", 21)))
                if (challengeCompletions("Nanoprestige", 21) == 0) goal = new Decimal(1e63)
                if (challengeCompletions("Nanoprestige", 21) == 1) goal = new Decimal(5.4e165)
                if (challengeCompletions("Nanoprestige", 21) == 2) goal = new Decimal(1.4e264)
                return format(goal) + " points (" + challengeCompletions("Nanoprestige", 21) + "/3)"
            },
            canComplete() {
                if (challengeCompletions("Nanoprestige", 21) == 0) return player.points.gte(new Decimal(1e63))
                if (challengeCompletions("Nanoprestige", 21) == 1) return player.points.gte(new Decimal(5.4e165))
                if (challengeCompletions("Nanoprestige", 21) == 2) return player.points.gte(new Decimal(1.4e264))

            },
            rewardDescription() {
                if (challengeCompletions("Nanoprestige", 21) == 0) return "Increase the power of the second row of Nano buyables."
                if (challengeCompletions("Nanoprestige", 21) == 1) return "Multiply the power of Nanopierce based on this challenge's completions."
                if (challengeCompletions("Nanoprestige", 21) == 2) return "Nanophase multiplies the power of Nanobuff as well as adding to it."
            },
            unlocked() {return hasUpgrade("Nanoprestige", 54)},
            countsAs: [11],
            completionLimit: 3
        },
        22: {
            name: "Nanofuse",
            challengeDescription: "All previous challenges at once.",
            goalDescription: "5e26 points",
            canComplete: function() {return player.points.gte("5e26")},
            rewardDescription: "Unlock the final Nanoprestige upgrade (before Small Prestige resets).",
            unlocked() {return hasUpgrade("Nanoprestige", 54)},
            countsAs: [11, 12, 21],
            completionLimit: 1
        },

    },
/*
    clickables: {
        11: {
            title: "Hide the top row",
            unlocked() {return hasAchievement("Smallprestige", 11)},
            canClick() {return true},
            onclick() {
                player.Nanoprestige.hiddenRows ++;
            }
        },
        12: {
            title: "Show one row above",
            unlocked() {return hasAchievement("Smallprestige", 11)},
            canClick() {return true},
            onclick() {
                player.Nanoprestige.hiddenRows --;
            }
        }

    },
    */
    completedRows() {
        var row1 = hasUpgrade("Nanoprestige", 11) * hasUpgrade("Nanoprestige", 12) * hasUpgrade("Nanoprestige", 13) * hasUpgrade("Nanoprestige", 14) * hasUpgrade("Nanoprestige", 15)
        var row2 = hasUpgrade("Nanoprestige", 21) * hasUpgrade("Nanoprestige", 22) * hasUpgrade("Nanoprestige", 23) * hasUpgrade("Nanoprestige", 24) * hasUpgrade("Nanoprestige", 25)
        var row3 = hasUpgrade("Nanoprestige", 31) * hasUpgrade("Nanoprestige", 32) * hasUpgrade("Nanoprestige", 33) * hasUpgrade("Nanoprestige", 34) * hasUpgrade("Nanoprestige", 35)
        var row4 = hasUpgrade("Nanoprestige", 41) * hasUpgrade("Nanoprestige", 42) * hasUpgrade("Nanoprestige", 43) * hasUpgrade("Nanoprestige", 44) * hasUpgrade("Nanoprestige", 45)
        var row5 = hasUpgrade("Nanoprestige", 51) * hasUpgrade("Nanoprestige", 52) * hasUpgrade("Nanoprestige", 53) * hasUpgrade("Nanoprestige", 54) * hasUpgrade("Nanoprestige", 55)
        var row6 = hasUpgrade("Nanoprestige", 61) * hasUpgrade("Nanoprestige", 62) * hasUpgrade("Nanoprestige", 63) * hasUpgrade("Nanoprestige", 64) * hasUpgrade("Nanoprestige", 65)
        var row7 = hasUpgrade("Nanoprestige", 71) * hasUpgrade("Nanoprestige", 72) * hasUpgrade("Nanoprestige", 73) * hasUpgrade("Nanoprestige", 74) * hasUpgrade("Nanoprestige", 75)
        var row8 = hasUpgrade("Nanoprestige", 81) * hasUpgrade("Nanoprestige", 82) * hasUpgrade("Nanoprestige", 83) * hasUpgrade("Nanoprestige", 84) * hasUpgrade("Nanoprestige", 85)
        var row9 = hasUpgrade("Nanoprestige", 91) * hasUpgrade("Nanoprestige", 92) * hasUpgrade("Nanoprestige", 93) * hasUpgrade("Nanoprestige", 94) * hasUpgrade("Nanoprestige", 95)
        return Math.round(row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9)
    },
    milestones: {
        0: {
            requirementDescription: "7 rows of Nanoprestige upgrades",
            done() {
                return tmp.Nanoprestige.completedRows >= 7
            },
            effect() {
                return (Decimal.pow(2, tmp.Nanoprestige.completedRows))

            },
            effectDescription: "Multiply Microprestige gain by 1.2 for each row completed. Nanoprestige upgrades never reset on any reset."
        },
        1: {
            requirementDescription: "8 rows of Nanoprestige upgrades",
            done() {return tmp.Nanoprestige.completedRows >= 8},
            effectDescription: "Nanoprestige challenges are never reset. Exponentiate Nanoprestige Fragment gain and Capital scaling based on rows complete."

        },
        2: {
            requirementDescription: "10 Nano Enlarge I",
            unlocked() {return hasAchievement("Unlockers", 46)},
            done() {return player.Nanoprestige.buyables[31].gte(10)},
            effectDescription: "Raise effective level of Nano Enlarge I ^1.1."
        },
        3: {
            requirementDescription: "10 Nano Enlarge II",
            unlocked() {return hasAchievement("Unlockers", 46)},
            done() {return player.Nanoprestige.buyables[32].gte(10)},
            effectDescription: "Raise effective level of Nano Enlarge II ^1.1."
        },
        5: {
            requirementDescription: "25 Nano Enlarge I",
            unlocked() {return hasAchievement("Unlockers", 46)},
            done() {return player.Nanoprestige.buyables[31].gte(25)},
            effectDescription: "Raise effective level of Nano Enlarge I ^1.1."
        },
        4: {
            requirementDescription: "9 rows of Nanoprestige upgrades",
            unlocked() {return hasAchievement("Unlockers", 46)},
            done() {return tmp.Nanoprestige.completedRows >= 9},
            effectDescription: "Per Unlocker per Milestone exponentiate Nanoprestige gain (u^m), and Nanoprestige buyables are not reset on any reset."

        },
        
    },
    autoPrestige() {
        return hasUpgrade("Nanoprestige", 23)
    },
    automate() {
        if (hasUpgrade("Miniprestige",11)) buyBuyable("Nanoprestige", 11)
        if (hasUpgrade("Miniprestige",11)) buyBuyable("Nanoprestige", 12)
        if (hasUpgrade("Miniprestige",11)) buyBuyable("Nanoprestige", 13)
        if (hasUpgrade("Miniprestige",11)) buyBuyable("Nanoprestige", 21)
        if (hasUpgrade("Miniprestige",11)) buyBuyable("Nanoprestige", 22)
        if (hasUpgrade("Miniprestige",11) && hasUpgrade("Nanoprestige", 61)) buyBuyable("Nanoprestige", 23)
    },
    doReset(layer) {
        let keep = [];
        keep.push("milestones")
        keep.push("pageNumber")
        if (hasMilestone("Nanoprestige", 0)) keep.push("upgrades")
        if (hasMilestone("Nanoprestige", 1)) keep.push("challenges")
        if (hasMilestone("Nanoprestige", 2)) keep.push("buyables")
        if (layer.row == this.row) return
        else if (layer == "Microprestige" || layer == "BrokenNano" || layer == "BNCapital" || layer == "BNCommunal") {
            if (hasAchievement("Miniprestige", 12)) keep.push("upgrades")
            if (hasAchievement("Miniprestige", 12)) keep.push("hiddenRows")
            if (hasUpgrade("Nanoprestige", 14) || hasUpgrade("Nanoprestige", 41)) keep.push("buyables")
            if (hasChallenge("Nanoprestige", 12)) keep.push ("challenges")
            if (hasMilestone("BrokenNano", 1)) keep.push("points")
            keep.push("milestones")
            layerDataReset(this.layer, keep)
        } else if (layer == "Miniprestige") {
            if (hasUpgrade("Nanoprestige", 41) || (hasUpgrade("Miniprestige", 11))) {
                keep.push("upgrades")
                keep.push("buyables")
                keep.push("hiddenRows")
                keep.push("milestones")
            }
                if (hasMilestone("BrokenNano", 0)) keep.push("challenges")

            if (hasAchievement("Smallprestige", 21)) keep.push("upgrades")
            layerDataReset(this.layer, keep)

        } else if (layer == "Smallprestige") {
            if (hasUpgrade("Miniprestige", 11)) keep.push("upgrades")
            if (hasAchievement("Smallprestige", 21)) keep.push("upgrades")
            if (hasMilestone("Nanoprestige", 0)) keep.push("upgrades")
        if (hasMilestone("Nanoprestige", 1)) keep.push("challenges")
            layerDataReset(this.layer, keep)


        } else if (layer != "Nanoprestige") {
            if (hasMilestone("Nanoprestige", 0)) keep.push("upgrades")
            if (hasMilestone("Nanoprestige", 1)) keep.push("challenges")
            layerDataReset(this.layer, keep)            
        }
    },
    canBuyMax() {
        return hasUpgrade("Nanoprestige", 13) || player.Smallprestige.best.gte(1)
    },
    bars: {
        break: {
            direction: RIGHT,
            width:200,
            height:10,
            progress() {
                var prog = 0
                if (hasUpgrade("Microprestige",34)) prog += 0.33
                if (hasUpgrade("Microprestige",41)) prog += 0.33
                if (hasUpgrade("Microprestige",42)) prog += 0.34
                return prog;
            },
            unlocked() {return hasUpgrade("Microprestige", 34)}
        }
    },
    resetsNothing() {return hasUpgrade("Microprestige", 34)},
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "resource-display", "prestige-button", ["bar", "break"], "clickables", "upgrades"],
            unlocked() {return hasAchievement("Unlockers", 11)}
        },
        "Buyables": {
            content: ["main-display", "resource-display", "prestige-button", "buyables"],
            unlocked() {return hasAchievement("Unlockers", 42)}          
        },
        "Challenges": {
            content: ["main-display", "resource-display", "prestige-button", "challenges"],
            unlocked() {
                if (hasUpgrade("Microprestige", 41) && player.Nanoprestige.corruption >= 0.3 && player.Nanoprestige.corruption <= 0.4) return false
                else return hasAchievement("Unlockers", 43)
            }

        },
        "Milestones": {
            content: ["main-display", "resource-display", "prestige-button", "milestones"],
            unlocked() {return hasUpgrade("Nanoprestige", 75)}
        }

    },
    layerShown(){return true}
})
addLayer("BrokenNano", {
    name: "BrokenNano", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BN", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points: new Decimal(0),
    }},
    color: "#4D489C",
    requires: new Decimal(700000), // Can be a function that takes requirement increases into account
    resource: "Nanoprestige Fragments", // Name of prestige currency
    baseResource: "Nanoprestiges", // Name of resource prestige is based on
    baseAmount() {return player.Nanoprestige.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    passiveGeneration() {
        return 1  
    },
    effect() {
        var pow = new Decimal(3)
        if (!hasUpgrade("Nanoprestige", 83)) pow = pow.plus(tmp.BNCapital.effect)
        if (hasUpgrade("Microprestige", 15)) pow = pow.plus(0.5)
        if (hasMilestone("BrokenNano", 5)) pow = pow.plus(0.02)
        if (hasUpgrade("BrokenNano", 25)) pow = pow.plus(0.3)
        if (hasUpgrade("Nanoprestige", 83)) pow = pow.mul(tmp.BNCapital.effect)
        if (hasUpgrade("Microprestige", 45)) pow = pow.times(1.25)
        if (hasUpgrade("Microprestige", 63)) pow = pow.times(upgradeEffect("Microprestige", 63).plus(1))
        var constant = new Decimal(1).plus(Decimal.mul(0.02, player.BrokenNano.points.plus(1).ln().pow(pow)))
        if (hasUpgrade("Miniprestige", 23)) constant = constant.times(upgradeEffect("Miniprestige", 23))
        return constant
    },
    effectDescription() {
        var desc;
        desc = "which is giving a Break Constant of "
        desc += format(tmp.BrokenNano.effect)
        desc += ". <br>This serves as the basis for all of this layer's buyables.<br>"
        desc += "You generate Fragments when you have over 700,000 Nanoprestiges."
        return desc
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!hasUpgrade("Microprestige", 42)) mult = new Decimal(0)
        if (hasUpgrade("Nanoprestige", 61)) mult = mult.times(buyableEffect("Nanoprestige", 23))
        if (hasUpgrade("BrokenNano", 11)) mult = mult.times(buyableEffect("BrokenNano", 13))
        if (hasAchievement("Smallprestige", 21)) mult = mult.times(achievementEffect("Smallprestige", 21))
        if (hasUpgrade("Microprestige", 25)) mult = mult.times(new Decimal("1e6").pow(player.Miniprestige.points))
        
        if (hasUpgrade("BrokenNano", 21)) mult = mult.times(buyableEffect("BrokenNano", 23))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        if (hasAchievement("Smallprestige", 41)) mult = mult.times(Decimal.min(new Decimal(1).plus(new Decimal(0.01).times(player.Smallprestige.points)), 1.2))
        if (hasUpgrade("Nanoprestige", 81)) mult = mult.times(upgradeEffect("Nanoprestige", 81))
        if (hasMilestone("Nanoprestige", 1)) mult = mult.times(new Decimal(1).plus(Decimal.mul(0.05, tmp.Nanoprestige.completedRows)))
        if (hasUpgrade("Nanoprestige", 93)) mult = mult.times(buyableEffect("BrokenMicro", 21))
        return new Decimal(mult)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    buyables: {
        11: {
            title() {return "BREAK I"},
            cost(x) {
                var cost;
                cost = new Decimal("1e10").pow(x.pow(new Decimal(2).pow(1/2)))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(tmp.BrokenNano.effect)
                display = "Increase Nanoprestige gain by " + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Effect: " + format(base) +"x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[11].lt(tmp.BrokenNano.buyables[11].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano", 11)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("BrokenNano", 12)) amount = amount.plus(tmp.BrokenNano.buyables[12].totalAmount)
                if (hasUpgrade("BrokenNano", 14)) amount = amount.plus(tmp.BrokenNano.buyables[13].totalAmount)
                if (hasUpgrade("BrokenNano", 22)) amount = amount.plus(tmp.BrokenNano.buyables[21].totalAmount)
                if (hasUpgrade("BrokenNano", 23)) amount = amount.plus(tmp.BrokenNano.buyables[22].totalAmount)
                if (hasUpgrade("BrokenNano", 24)) amount = amount.plus(tmp.BrokenNano.buyables[23].totalAmount)
                if (hasMilestone("BNCapital", 1)) amount = amount.plus(Decimal.min("1e10", player.BNCapital.points))
                if (hasUpgrade("BrokenNano", 15)) amount = amount.plus(1)
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                return amount
            },
            effect() {
                var base = new Decimal(tmp.BrokenNano.effect)
                var eff = new Decimal(base).pow(tmp.BrokenNano.buyables[11].totalAmount)
                return eff;
            }

        },
        12: {
            title() {return "BREAK II"},
            cost(x) {
                var cost;
                cost = Decimal.max(new Decimal("2500"), new Decimal("1e20").pow(x.pow(2)))
                if (hasUpgrade("Nanoprestige", 74)) cost = Decimal.max(new Decimal("2500"), new Decimal("1e20").pow(x.pow(1.5)))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(tmp.BrokenNano.effect).log10().plus(1)
                display = "Increase Nanomuscle power by " + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Effect: " + format(base) +"x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[12].lt(tmp.BrokenNano.buyables[12].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano", 11)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("BrokenNano", 13)) amount = amount.plus(tmp.BrokenNano.buyables[13].totalAmount)
                if (hasMilestone("BNCapital", 2)) amount = amount.plus(Decimal.min("1e10", player.BNCapital.points))
                if (hasUpgrade("BrokenNano", 23)) amount = amount.plus(tmp.BrokenNano.buyables[22].totalAmount)
                if (hasUpgrade("BrokenNano", 24)) amount = amount.plus(tmp.BrokenNano.buyables[23].totalAmount)
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                return amount
            },
            effect() {
                var base = new Decimal(tmp.BrokenNano.effect).log10().plus(1)
                var eff = new Decimal(base).pow(tmp.BrokenNano.buyables[12].totalAmount)
                return eff;
            }

        },
        13: {
            title() {return "BREAK III"},
            cost(x) {
                var cost;
                cost = Decimal.max(new Decimal("1e6"), new Decimal("1e30").pow(x.pow(new Decimal(2).pow(1/2))))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(tmp.BrokenNano.effect)
                display = "Increase Nanoprestige Fragment gain by " + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Effect: " + format(base) +"x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[13].lt(tmp.BrokenNano.buyables[13].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano", 11)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasMilestone("BNCapital", 3)) amount = amount.plus(Decimal.min("1e10", player.BNCapital.points))
                if (hasUpgrade("BrokenNano", 24)) amount = amount.plus(tmp.BrokenNano.buyables[23].totalAmount)
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                return amount
            },
            effect() {
                var base = new Decimal(tmp.BrokenNano.effect)
                var amount = new Decimal(player[this.layer].buyables[this.id])
                var eff = new Decimal(base).pow(tmp.BrokenNano.buyables[13].totalAmount)
                return eff;
            }

        },

        21: {
            title() {return "BREAK IV"},
            cost(x) {
                var cost;
                cost = new Decimal("1e14500").times(new Decimal("1e50").pow(x.pow(new Decimal(2).pow(1/2))))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(Decimal.ln(tmp.BrokenNano.effect))
                display = "Increase Nanoprestige gain by " + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Formula: (" + format(base) +"^Capitals)^x)<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[21].lt(tmp.BrokenNano.buyables[21].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano", 21)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("BrokenNano", 23)) amount = amount.plus(tmp.BrokenNano.buyables[22].totalAmount)
                if (hasUpgrade("BrokenNano", 24)) amount = amount.plus(tmp.BrokenNano.buyables[23].totalAmount)
                if (hasMilestone("BNCommunal", 1)) amount = amount.plus(Decimal.mul(500, player.BNCommunal.points))
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                return amount
            },
            effect() {
                var base = new Decimal(Decimal.ln(tmp.BrokenNano.effect))
                var eff = new Decimal(base).pow(player.BNCapital.points).pow(tmp.BrokenNano.buyables[21].totalAmount).plus(1)
                if (eff.lte(1)) eff = new Decimal(1)
                if (player.BrokenNano.buyables[21].lte(0)) eff = new Decimal(1)
                return eff;
            }

        },
        22: {
            title() {return "BREAK V"},
            cost(x) {
                var cost;
                cost = new Decimal("1e16000").times(new Decimal("1e50").pow(x.pow(new Decimal(2).pow(1/2))))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(Decimal.log2(tmp.BrokenNano.effect).pow(2))
                display = "Give " + format(this.effect()) +" free levels to Nanomuscle.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Formula: (" + format(base) +"*Capitals*x)<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[22].lt(tmp.BrokenNano.buyables[22].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano", 21)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("BrokenNano", 24)) amount = amount.plus(tmp.BrokenNano.buyables[23].totalAmount)
                if (hasMilestone("BNCommunal", 2)) amount = amount.plus(Decimal.mul(500, player.BNCommunal.points))
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                
                return amount
            },
            effect() {
                var base = new Decimal(Decimal.log2(tmp.BrokenNano.effect).pow(2))
                var eff = new Decimal(base).times(player.BNCapital.points).times(tmp.BrokenNano.buyables[22].totalAmount).plus(1)
                if (player.BrokenNano.buyables[21].lte(0)) eff = new Decimal(1)
                return eff;
            }

        },
        23: {
            title() {return "BREAK VI"},
            cost(x) {
                var cost;
                cost = new Decimal("1e20000").times(new Decimal("1e50").pow(x.pow(new Decimal(2).pow(1/2))))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(Decimal.log2(tmp.BrokenNano.effect))
                display = "Increase Nanoprestige Fragment gain by " + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Effect: " + format(base) +"x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[23].lt(tmp.BrokenNano.buyables[23].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (hasAchievement("Partialprestige", 12)) player[this.layer].buyables[this.id] = tmp[this.layer].buyables[this.id].cap
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasUpgrade("BrokenNano",21)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasMilestone("BNCommunal", 3)) amount = amount.plus(Decimal.mul(500, player.BNCommunal.points))
                if (hasUpgrade("CMEnlarge", 51)) amount = amount.pow(buyableEffect("BrokenNano", 31))
                return amount
            },
            effect() {
                var base = new Decimal(Decimal.log2(tmp.BrokenNano.effect))
                var eff = new Decimal(base).pow(player.BNCapital.points).pow(tmp.BrokenNano.buyables[23].totalAmount).plus(1)
                return eff;
            }

        },
        31: {
            title() {return "BREAK VII"},
            cost(x) {
                var cost;
                cost = new Decimal("1e1e1700").pow(new Decimal(1.5).pow(x.pow(new Decimal(4.9))))
                return cost
            },
            display() {
                var display;
                var base = new Decimal(1.1)
                display = "Raise all previous buyable's levels ^" + format(this.effect()) +"x.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                display += "<br>Effect: " + format(base) +"x<br><br>"
                display += "Cost: "+format(this.cost()) + " Nanoprestige Fragments."
                return display;
            },
            cap() {
                var cap = new Decimal(5000)
                cap = cap.plus(tmp.BNCommunal.effect)
                if (hasUpgrade("Nanoprestige", 92)) cap = cap.times(upgradeEffect("Nanoprestige", 92))
                return cap
            },
            canAfford() {return (player[this.layer].points.gte(this.cost()) && player.BrokenNano.buyables[31].lt(tmp.BrokenNano.buyables[23].cap))},
            buy() {
                if (!hasUpgrade("Nanoprestige", 34)) player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                if (hasAchievement("Unlockers", 54)) {
                    return true
                } else return false
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                return amount
            },
            effect() {
                var base = new Decimal(1.1)
                var eff = new Decimal(base).pow(tmp.BrokenNano.buyables[31].totalAmount)
                return eff;
            }

        },
    },
    automate() {
        
        if (hasMilestone("BNCapital", 4)) buyBuyable("BrokenNano", 11)
        if (hasMilestone("BNCapital", 4)) buyBuyable("BrokenNano", 12)
        if (hasMilestone("BNCapital", 4)) buyBuyable("BrokenNano", 13)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 11)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 12)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 13)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 21)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 22)
        if (hasMilestone("BrokenNano", 5)) buyBuyable("BrokenNano", 23)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 11)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 12)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 13)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 21)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 22)
        if (hasMilestone("BrokenNano", 6)) buyBuyable("BrokenNano", 23)
        if (hasMilestone("BNCommunal", 0)) {
            for(var i = 0; i < 5; i ++){
                buyBuyable("BrokenNano", 11)
                buyBuyable("BrokenNano", 12)
                buyBuyable("BrokenNano", 13)
                buyBuyable("BrokenNano", 21)
                buyBuyable("BrokenNano", 22)
                buyBuyable("BrokenNano", 23)
            }
        }
    },
    upgrades: {
        11: {
            name: "broken1",
            title: "Purchase I",
            cost: new Decimal(10),
            description: "Unlock the first set of Broken Nanoprestige buyables.",
            unlocked() {return hasAchievement("Unlockers", 32)}
        },
        12: {
            name: "broken2",
            title: "Stack I",
            cost: new Decimal("1e45"),
            description: "Levels of Boost II provide levels to Boost I",
            unlocked() {return hasAchievement("Unlockers", 34)}
        },
        13: {
            name: "broken3",
            title: "Stack II",
            cost: new Decimal("5e107"),
            description: "Levels of Boost III provide levels to Boost II",
            unlocked() {return hasAchievement("Unlockers", 34)}
        },
        14: {
            name: "broken4",
            title: "Stack III",
            cost: new Decimal("1e252"),
            description: "Levels of Boost III provide levels to Boost I",
            unlocked() {return hasAchievement("Unlockers", 34)}
        },
        15: {
            name: "broken5",
            title: "Layer I",
            cost: new Decimal("1e547"),
            description: "Unlock Nano Capital, and add a level to Boost I",
            unlocked() {return hasAchievement("Unlockers", 34)}
        },
        21: {
            name: "broken6",
            title: "Purchase II",
            cost: new Decimal("1e15250"),
            description: "Unlock the second set of Broken Nanoprestige buyables.",
            unlocked() {return hasAchievement("Unlockers", 36)}
        },
        22: {
            name: "broken7",
            title: "Stack IV",
            cost: new Decimal("1e24890"),
            description: "Levels of Boost IV provide free levels to all upgrades above and to the left of it.",
            unlocked() {return hasAchievement("Unlockers", 36)}
        },
        23: {
            name: "broken8",
            title: "Stack V",
            cost: new Decimal("1e49880"),
            description: "Levels of Boost V provide free levels to all upgrades above and to the left of it.",
            unlocked() {return hasAchievement("Unlockers", 36)}
        },
        24: {
            name: "broken9",
            title: "Stack VI",
            cost: new Decimal("1e1652000"),
            description: "Levels of Boost VI provide free levels to all upgrades above and to the left of it.",
            unlocked() {return hasAchievement("Unlockers", 36)}
        },
        25: {
            name: "broken9",
            title: "Layer II",
            cost: new Decimal("1e9.673e6"),
            description: "Unlock Nano Communals, and increase Break Constant exponent by 0.3",
            unlocked() {return hasAchievement("Unlockers", 36)}
        },
    },
    milestones:{
        0: {
            requirementDescription: "10 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte(10)},
            effectDescription: "Keep Broken Nanoprestige milestones and Nano challenges on Mini resets."
        },
        1: {
            requirementDescription: "1e10 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte(1e10)},
            effectDescription: "Microprestige no longer resets Nanoprestiges."
        },
        2: {
            requirementDescription: "1e100 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte(1e100)},
            effectDescription: "Microprestige no longer resets anything."
        },
        3: {
            requirementDescription: "1e1,000 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte("1e1000")},
            effectDescription: "Buyables are no longer reset on Miniprestige."
        },
        4: {
            requirementDescription: "1e10,000 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte("1e10000")},
            effectDescription: "Capital is no longer reset on Miniprestige."
        },
        5: {
            requirementDescription: "1e100,000 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte("1e100000")},
            effectDescription: "Automate buying the second row of buyables; increase Break Constant power by 0.02"
        },
        6: {
            requirementDescription: "1e1,000,000 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte("1e1000000")},
            effectDescription: "All autobuyers bulk +1"
        },
        7: {
            requirementDescription: "1e10,000,000 Nanoprestige Fragments",
            done() {return player.BrokenNano.points.gte("1e10000000")},
            effectDescription: "You automatically get Capital."
        }
    },
    achievements: {

    },
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "resource-display", "upgrades"],
            unlocked() {return true}
        },
        "Buyables": {
            content: ["main-display", "resource-display", "buyables"],
            unlocked() {return true}
        },
        "Milestones": {
            content: ["main-display", "resource-display", "milestones"],
            unlocked() {return true}
        },
    },
    doReset(layer) {
        let keep = [];
        if (layer.row == this.row) return
        else if (layer == "Microprestige") {
            keep.push("milestones")
            keep.push("points")
            keep.push("upgrades")
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Miniprestige") {
            if (hasMilestone("BrokenNano", 0)) keep.push("milestones")
            if (hasMilestone("BrokenNano", 0)) keep.push("upgrades")
            if (hasMilestone("BrokenNano", 3)) keep.push("buyables")
            layerDataReset(this.layer, keep)

        } else if (layer == "Smallprestige") {
            if (hasAchievement("Partialprestige", 11)) keep.push("milestones")
            layerDataReset(this.layer, keep)
            
                var brokenNanoKeep = 0
                if (hasMilestone("Smallprestige", 1)) brokenNanoKeep += player.Smallprestige.milestones.length
                if (hasUpgrade("Miniprestige", 32)) brokenNanoKeep += player.Miniprestige.upgrades.length - 6
                if (hasUpgrade("Microprestige", 63)) brokenNanoKeep += player.Microprestige.upgrades.length - 24
                if (brokenNanoKeep > 0) player[this.layer].upgrades.push(11)
                if (brokenNanoKeep > 1) player[this.layer].upgrades.push(12)
                if (brokenNanoKeep > 2) player[this.layer].upgrades.push(13)
                if (brokenNanoKeep > 3) player[this.layer].upgrades.push(14)
                if (brokenNanoKeep > 4) player[this.layer].upgrades.push(15)
                if (brokenNanoKeep > 5) player[this.layer].upgrades.push(21)
                if (brokenNanoKeep > 6) player[this.layer].upgrades.push(22)
                if (brokenNanoKeep > 7) player[this.layer].upgrades.push(23)
                if (brokenNanoKeep > 8) player[this.layer].upgrades.push(24)
                if (brokenNanoKeep > 9) player[this.layer].upgrades.push(25)

        } 
    },
    layerShown(){
        return hasUpgrade("Microprestige", 42)}
})
addLayer("BNCapital", {
    name: "BrokenNanoCapitals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BNc", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points: new Decimal(0),
    }},
    color: "#2372A1",
    requires: new Decimal("32"), // Can be a function that takes requirement increases into account
    resource: "Capital", // Name of prestige currency
    baseResource: "Broken Nano Buyables", // Name of resource prestige is based on
    baseAmount() {
        var base = new Decimal(0);
        base = base.plus(player.BrokenNano.buyables[11])
        base = base.plus(player.BrokenNano.buyables[12])
        base = base.plus(player.BrokenNano.buyables[13])
        base = base.plus(player.BrokenNano.buyables[21])
        base = base.plus(player.BrokenNano.buyables[22])
        base = base.plus(player.BrokenNano.buyables[23])
        return base
    
    }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1), // Prestige currency exponent
    base: new Decimal(1.25),
    effect() {
        if (!hasUpgrade("Nanoprestige", 85)) return new Decimal(0.11).times(player.BNCapital.points)
        if (hasUpgrade("Nanoprestige", 85)) return new Decimal(1.03).pow(player.BNCapital.points)
    },
    effectDescription() {
        var desc;
        desc = "which is increasing Break Constant exponent by " + format(tmp.BNCapital.effect)
        return desc
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasAchievement("Smallprestige", 31)) mult = mult.div(1.2)
        if (hasMilestone("BNCommunal", 0)) mult = mult.div(Decimal.pow(1.1, player.BNCommunal.points))
        if (hasUpgrade("Nanoprestige", 82)) mult = mult.div(upgradeEffect("Nanoprestige", 82))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("Nanoprestige", 1)) mult = mult.times(new Decimal(1).plus(Decimal.mul(0.073, tmp.Nanoprestige.completedRows)))
        return new Decimal(mult)
    },
    directMult() {
        mult= new Decimal(1)
        if (hasMilestone("Microprestige", 1)) mult = mult.times(new Decimal(1.2).pow(player.Microprestige.buyables.length))
        return mult


    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    buyables: {

    },
    upgrades: {

    },
    canBuyMax() {

        return hasUpgrade("CMEnlarge", 51)
    },
    milestones:{
        0: {
            requirementDescription: "1 Capital",
            done() {return player.BNCapital.points.gte(1)},
            effectDescription: "Multiply Miniprestige gain by 1.22x per Capital (capped at 2x)"
        },
        1: {
            requirementDescription: "2 Capital",
            done() {return player.BNCapital.points.gte(2)},
            effectDescription: "Add a free level to Boost I for every Capital."
        },
        2: {
            requirementDescription: "3 Capital",
            done() {return player.BNCapital.points.gte(3)},
            effectDescription: "Add a free level to Boost II for every Capital."
        },
        3: {
            requirementDescription: "4 Capital",
            done() {return player.BNCapital.points.gte(4)},
            effectDescription: "Add a free level to Boost III for every Capital."
        },
        4: {
            requirementDescription: "15 Capital",
            done() {return player.BNCapital.points.gte(15)},
            effectDescription: "Autobuy the first 3 Broken Nano buyables."
        }
    },
    achievements: {

    },

    doReset(layer) {
        let keep = [];
        if (hasUpgrade("Nanoprestige", 92)) {
            keep.push("milestones")
                keep.push("points")
                keep.push("upgrades")
                keep.push("buyables")   
            }
        if (layer.row == this.row) return
        else if (layer == "Microprestige") {
            keep.push("milestones")
            keep.push("points")
            keep.push("upgrades")
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Miniprestige") {
            if (hasMilestone("BrokenNano", 0)) keep.push("milestones")
            if (hasMilestone("BrokenNano", 0)) keep.push("upgrades")
            if (hasMilestone("BrokenNano", 4)) keep.push("points")
            layerDataReset(this.layer, keep)

        } else if (layer == "Smallprestige") {
            layerDataReset(this.layer, keep)


        }
    },
    autoPrestige() {
        return hasMilestone("BrokenNano", 7)
    },
    layerShown(){
        return hasUpgrade("BrokenNano", 15)}
})
addLayer("BNCommunal", {
    name: "BrokenNanoCommunals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BNm", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points: new Decimal(0),
    }},
    color: "#A9D2D5",
    requires: new Decimal("1e10000000"), // Can be a function that takes requirement increases into account
    resource: "Communal", // Name of prestige currency
    baseResource: "Nanoprestige Fragments", // Name of resource prestige is based on
    baseAmount() {
        return player.BrokenNano.points
    
    }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.25), // Prestige currency exponent
    base: new Decimal("1e1000000"),
    effect() {
        return new Decimal(1000).times(Decimal.pow(player.BNCommunal.points, 0.5))
    },
    effectDescription() {
        var desc;
        desc = "which is increasing buyable caps by " + format(tmp.BNCommunal.effect)
        return desc
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.BNCommunal.points.gte(270)) mult = mult.times(Decimal.dInf)
        if (hasUpgrade("Nanoprestige", 92)) mult = mult.times(Decimal.dInf)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        if (!hasUpgrade("Nanoprestige", 92)) {
        if (player.BNCommunal.points.gte(40)) mult = mult.times(0.95)
        if (player.BNCommunal.points.gte(50)) mult = mult.times(0.9)
        if (player.BNCommunal.points.gte(60)) mult = mult.times(0.85)
        if (player.BNCommunal.points.gte(70)) mult = mult.times(0.8)
        if (player.BNCommunal.points.gte(80)) mult = mult.times(0.75)
        if (player.BNCommunal.points.gte(90)) mult = mult.times(0.7)
        if (player.BNCommunal.points.gte(100)) mult = mult.times(0.65)
        if (player.BNCommunal.points.gte(110)) mult = mult.times(0.6)
        if (player.BNCommunal.points.gte(120)) mult = mult.times(0.55)
        if (player.BNCommunal.points.gte(130)) mult = mult.times(0.5)
        if (player.BNCommunal.points.gte(140)) mult = mult.times(0.45)
        if (player.BNCommunal.points.gte(150)) mult = mult.times(0.4)
        if (player.BNCommunal.points.gte(160)) mult = mult.times(0.35)
        if (player.BNCommunal.points.gte(170)) mult = mult.times(0.30)
        if (player.BNCommunal.points.gte(180)) mult = mult.times(0.25)
        if (player.BNCommunal.points.gte(190)) mult = mult.times(0.20)
        if (player.BNCommunal.points.gte(200)) mult = mult.times(0.15)
        if (player.BNCommunal.points.gte(210)) mult = mult.times(0.10)
        if (player.BNCommunal.points.gte(220)) mult = mult.times(0.05)
        if (player.BNCommunal.points.gte(230)) mult = mult.times(0.00000001)
        if (player.BNCommunal.points.gte(240)) mult = mult.times(1e-10)
        if (player.BNCommunal.points.gte(250)) mult = mult.times("1e-20")
        }
        
        return new Decimal(mult)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    buyables: {

    },
    canBuyMax() {return hasUpgrade("Nanoprestige", 92)},
    upgrades: {

    },
    update() {
        if (hasUpgrade("Nanoprestige", 92)) player.BNCommunal.points = new Decimal(270)

    },
    milestones:{
        0: {
            requirementDescription: "1 Communal",
            done() {return player.BNCommunal.points.gte(1)},
            effectDescription: "Increase bulk buy by +5. Each Communal divides Capital requirements."
        },
        1: {
            requirementDescription: "2 Communal",
            done() {return player.BNCommunal.points.gte(2)},
            effectDescription: "Add 500 free levels to Boost IV for every Communal."
        },
        2: {
            requirementDescription: "3 Communal",
            done() {return player.BNCommunal.points.gte(3)},
            effectDescription: "Add 500 free levels to Boost V for every Communal."
        },
        3: {
            requirementDescription: "4 Communal",
            done() {return player.BNCommunal.points.gte(4)},
            effectDescription: "Add 500 free levels to Boost VI for every Communal."
        },
        4: {
            requirementDescription: "9 Communal",
            done() {return player.BNCommunal.points.gte(9)},
            effectDescription: "Unlock some new Nanoprestige upgrades."
        }
    },
    achievements: {

    },

    doReset(layer) {
        let keep = [];
        if (layer.row == this.row) return
        if (hasUpgrade("Nanoprestige", 92)) keep.push("milestones")
        else if (layer == "Microprestige") {
            keep.push("milestones")
            keep.push("points")
            keep.push("upgrades")
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Miniprestige") {
            if (hasMilestone("BrokenNano", 0)) keep.push("milestones")
            if (hasMilestone("BrokenNano", 0)) keep.push("upgrades")
            if (hasMilestone("BrokenNano", 7)) keep.push("points")
            layerDataReset(this.layer, keep)

        } else if (layer == "Smallprestige" || layer == "CMEnlarge") {
            layerDataReset(this.layer, keep)


        }
    },
    layerShown(){
        return hasUpgrade("BrokenNano", 25) && !hasUpgrade("Nanoprestige", 92)}
})
