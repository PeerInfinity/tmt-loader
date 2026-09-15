addLayer("k", {
    name: "Erasers",
    symbol: "🧼",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        setBuyableAmount: new Decimal(0)
    }},
    layerShown() { return player[this.layer].unlocked || hasUpgrade("p",35)},
    color: "#ffcada",
    requires: new Decimal(100000),
    branches: ["p"], 
    row: "1",
    resource: "Erasers",
    baseResource: "Pens",
    autoPrestige() { 
        if (hasUpgrade("y", 12) || hasMilestone("d", 1)) return true
        else return false     
    },
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []

            if(hasMilestone("d", 3)) keep.push("buyables")
            if(hasMilestone("d", 4)) keep.push("upgrades")
            if(hasUpgrade("d", 33)) keep.push("milestones")
            if (hasMilestone("y", 1)) {
                keep.push("upgrades")
                keep.push("milestones")
            }

            layerDataReset(this.layer, keep) 
    },
    resetsNothing() { return hasMilestone("d", 1)},
    baseAmount() {return player.p.points},
    type: "static",
    exponent() {
        exponent = 3
        if (hasUpgrade("k", 34)) exponent = 2.862
        if (hasUpgrade("y", 35)) exponent = new Decimal(2.862).pow(1/1.2)
        return exponent
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("w", 12))
        if (hasUpgrade("o", 11)) mult = mult.times(3)
        if (hasUpgrade("o", 15)) mult = mult.times(5)
        if (hasUpgrade("z", 22)) mult = mult.times(2.2)
        if (hasUpgrade("y", 11)) mult = mult.times(5)
        if (hasUpgrade("y", 24)) mult = mult.times(upgradeEffect("y", 24))
        return mult
    },
    canBuyMax() { return hasUpgrade("k", 13) || player.d.unlocked },
    automate() {
        if ((hasUpgrade("w", 14) || hasUpgrade("o", 15) || hasUpgrade("y", 12)) && canBuyBuyable(this.layer, 11)) {
            let canBuy = new Decimal(1)
            let limit = new Decimal(tmp[this.layer].buyables["11"].purchaseLimit)
            if (hasUpgrade("o", 22)) {
                canBuy = new Decimal(Math.floor(new Decimal(player.k.points).pow(0.5).sub(2)))
                if (canBuy.gte(limit)) setBuyableAmount(this.layer, 11, limit)
                else setBuyableAmount(this.layer, 11, canBuy) }
            else {
                if (hasUpgrade("y", 12) || hasUpgrade("o", 24))  {
                let canBuy = new Decimal(1)
                let limit = new Decimal(tmp[this.layer].buyables["11"].purchaseLimit)
                canBuy = new Decimal(Math.floor(new Decimal(player.k.points).sub(2)))
                if (canBuy.gte(1)) {
                    if (canBuy.gte(limit)) setBuyableAmount(this.layer, 11, limit);
                    else setBuyableAmount(this.layer, 11, canBuy) 
                }}  
                else addBuyables(this.layer, 11, canBuy)
            }
            updateBuyableTemp(this.layer);
        }
    },
    buyables: {
        11: {
            title: "Roblox",
            unlocked() {
                if (player.d.unlocked) return true
                else return hasUpgrade("k", 21)
            },
            cost(x) { 
                let pow = new Decimal(1)
                if (hasUpgrade("o", 22)) pow = new Decimal(2)
                return new Decimal(3).add(x).pow(pow) 
            },
            display() { return "Waste your IQ on roblox(roblox makes you more powerful)" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            purchaseLimit() {
                madd = new Decimal(0)
                let data2 = tmp["m"].buyables["13"]
                if (hasUpgrade("d", 34)) madd = new Decimal(100)
                if (hasUpgrade("o", 22)) madd = madd.plus(data2.effect)
                return new Decimal(10).plus(madd)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                let data2 = tmp["m"].buyables["13"]
                madd = new Decimal(0)
                if (hasUpgrade("d", 34)) madd = new Decimal(100)
                if (hasUpgrade("o", 22)) madd = madd.plus(data2.effect)
                if (hasUpgrade("w", 14)) return "Cost: " + format(data.cost) + " IQ\n\
                Amount: " + player[this.layer].buyables[this.id] + "/"+new Decimal(10).plus(madd)+"\n\
                Gain " + format(data.effect) + "x more points and " + format(data.effect) + "x to PP gain"
                else return "Cost: " + format(data.cost) + " IQ\n\
                Amount: " + player[this.layer].buyables[this.id] + "/"+ new Decimal(10).plus(madd)+"\n\
                Gain " + format(data.effect) + "x more points"
            },
            effect(x) { 
                eff = new Decimal("1e5")
                if (hasUpgrade("d", 34)) eff = new Decimal("1e100")
                if (hasUpgrade("o", 22)) eff = new Decimal("1e10000")
                eff = eff.pow(x)
                return eff
            }, 
            effectDisplay(x) { return format(buyableEffect(this.layer, this.id))+"x" },
        },
    },
    upgrades:{
        11: {
            title: "Again...",
            description: "x2 PP and points",
            cost: new Decimal(1),
        },
        12: {
            unlocked() {return hasUpgrade("k", 11)},
            title: "Again...Again...",
            description: "x2 PP and points",
            cost: new Decimal(1),
        },
        13: {
            unlocked() {return hasMilestone("k", 0)},
            title: "Powerful PP",
            description: "x100 to PP gain and you can get more than 1 IQ at once",
            cost: new Decimal(3),
        },
        14: {
            unlocked() {return hasUpgrade(this.layer, 13)},
            title: "needed IQ",
            description: "points boost based on IQ",
            cost: new Decimal(3),
            effect() {
                IQB = new Decimal("4")
                if (hasUpgrade(this.layer, 33)) IQB = 15
                return player[this.layer].points.add(1).pow(IQB)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            unlocked() {return hasUpgrade("k", 14)},
            title: "Really needed IQ",
            description: "boost PP based on IQ",
            cost: new Decimal(4),
            effect() {
                IQB = new Decimal("4")
                if (hasUpgrade(this.layer, 33)) IQB = 15
                return player[this.layer].points.add(1).pow(IQB)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            unlocked() {
                if (player.d.unlocked) return false
                if (hasUpgrade(this.layer, 21)) return false
                else return hasUpgrade(this.layer, 15)
            },
            title: "Something new",
            description: "Unlocks kirill buyable",
            cost: new Decimal(4),
        },
        22: {
            unlocked() {
                if (hasUpgrade(this.layer, 22)) return false
                else return hasMilestone(this.layer, 1)
            },
            title: "Something new v2",
            description: "Unlocks 2nd row of Kirill upgrades",
            cost: new Decimal(5),
        }, 
        31: {
            unlocked() {return hasUpgrade(this.layer, 22)},
            title: "Return",
            description: "2nd PP upgrade hardcap now 1e100, other hardcaps now 1e15",
            cost: new Decimal(5),
        },
        32: {
            unlocked() {return hasUpgrade(this.layer, 22)},
            title: "Stupid Formula",
            description: "Prestige formula better",
            tooltip: "С вашим IQ вы не можете понять престиж формулу, поэтому она теперь легче",
            cost: new Decimal(6),
        },
        33: {
            unlocked() {return hasUpgrade(this.layer, 22)},
            title: "Really Really needed IQ",
            description: "needed IQ and Really needed IQ better",
            cost: new Decimal(8),
        },
        34: {
            unlocked() {return hasUpgrade(this.layer, 22)},
            title: "Stupid formula 2",
            description: "IQ formula slightly better",
            tooltip: "У вас чуть больше IQ, но всё ещё недостаточно, чтобы понять IQ формулу, поэтому она теперь легче",
            cost: new Decimal(9),
        },
        35: {
            unlocked() {return hasUpgrade(this.layer, 22)},
            title: "Super Buyable",
            description: "Number of buyable purchases boosts PP",
            effect() {
                return new Decimal(getBuyableAmount(this.layer, 11)).plus(1).pow(37)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 35))+"x" },
            cost: new Decimal(10),
        },
        41: {
            unlocked() {
                if (hasUpgrade(this.layer, 41)) return false
                if (player.m.unlocked) return false
                else return hasUpgrade(this.layer, 35)
            },
            title: "Papa",
            description: "Unlocks money making",
            cost: new Decimal(11),
        },
        42: {
            unlocked() {
                if (hasUpgrade(this.layer, 42)) return false
                else return hasUpgrade("m", 13)
            },
            title: "3rd row",
            description: "Unlocks 3rd row of IQ upgrades",
            cost: new Decimal(12),
        },
        51: {
            unlocked() {
                return hasUpgrade(this.layer, 42)
            },
            title: "IQ is good",
            description: "IQ boosts mafia XP",
            tooltip: "Айкью действительно влияет на устройство мафии, чем вы умнее, тем больше мафия будет процветать!",
            cost: new Decimal(12),
            effect() {
                return new Decimal(player[this.layer].points).pow(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 51))+"x" },
        },
        52: {
            unlocked() {
                return hasUpgrade(this.layer, 42)
            },
            title: "Mafia buff",
            description: "Just x5 mafia XP",
            cost: new Decimal(15),
        },
        53: {
            unlocked() {
                return hasUpgrade(this.layer, 42)
            },
            title: "hardcap? what is this?",
            description: "Useful PP harcap 1e100 -> 1e300",
            cost: new Decimal(16),
        },
        54: {
            unlocked() {
                return hasUpgrade(this.layer, 42)
            },
            title: "hardcap? what is this? Again?",
            description: "Useful points and Useful points 2 harcap 1e15 -> 1e200 also money using harcap higher",
            cost: new Decimal(19),
        },
        55: {
            unlocked() {
                return hasUpgrade(this.layer, 42)
            },
            title: "Im tired of doing whis update so",
            description: "x1e30 PP",
            tooltip: "Я заебался делать обнову, поэтому просто закину ПП бафф, надеюсь обнова вам зашла, очень долго её делал, по сравнению с другими обновами",
            cost: new Decimal(20),
        },
    },
    milestones: {
        0: {
            unlocked() {return hasUpgrade("k", 12)},
            requirementDescription: "3 IQ",
            effectDescription: "save 1st row PP upgrades",
            done() { return player.k.points.gte(3) },
        },
        1: {
            unlocked() {return hasMilestone("k", 0)},
            requirementDescription: "5 IQ",
            effectDescription: "save 2nd row PP upgrades",
            done() { return player.k.points.gte(5) },
        },
        2: {
            unlocked() {return hasUpgrade(this.layer, 34)},
            requirementDescription: "10 IQ",
            effectDescription: "You gain 100% of your PP gain per second",
            done() { return player.k.points.gte(10) },
        },
    },
})