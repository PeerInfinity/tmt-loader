addLayer("numbercore", {
    name: "numbercore", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "NCR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#00e0c0",
    requires: new Decimal("1e1000"), // Can be a function that takes requirement increases into account
    resource: "Number Cores", // Name of prestige currency
    baseResource: "Numbers", // Name of resource prestige is based on
    baseAmount() {return player.primitive.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = new Decimal(0.01)
        if (hasUpgrade("subtraction", 21)) base = base.add(0.01)
        if (hasMilestone("pbooster", 4)) base = base.add(0.03)
        return base
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (getClickableState("addition", 14) != "Inactive" && !inChallenge("arithmetic", 12)) mult = mult.add(clickableEffect("addition", 14))
        //mul
        mult = mult.mul(buyableEffect("numbercore", 11))
        mult = mult.mul(player.polygon.squEffect)
        if (player.dimension.points.gte(4)) mult = mult.mul(100)
        if (hasMilestone("addition", 3)) mult = mult.mul(player.division.points.add(1).pow(0.3))
        if (hasUpgrade("polygon", 15)) mult = mult.mul(upgradeEffect("polygon", 15))
        if (hasUpgrade("subtraction", 17)) mult = mult.mul("1e10")
        if (hasChallenge("arithmetic", 22)) mult = mult.mul("1e10")
        if (hasMilestone("addition", 4)) mult = mult.mul(player.addition.points.add(1).pow(0.006))
        if (hasMilestone("addition", 3)) mult = mult.mul("1e100")
        if (hasUpgrade("primitive", 31)) mult = mult.mul("1e200")
    	if (hasMilestone("division", 9)) mult = mult.mul(player.multiplication.effect.add(1))
        mult = mult.mul(buyableEffect("numbercore", 31)[1])
        //exp
        if (hasAchievement("achievements", 53)) mult = mult.pow(1.2)
        if (hasMilestone("division", 6)) mult = mult.pow(1.1)
        if (hasUpgrade("multiplication", 93)) mult = mult.pow(1.25)
        if (maxedChallenge("polygon", 11)) mult = mult.pow(1.01)
        if (hasAchievement("planetary", 21)) mult = mult.pow(1.25)
        if (hasMilestone("pbooster", 1)) mult = mult.pow(1.3)
        if (hasUpgrade("fundamental", 54)) mult = mult.pow(1.01)
        if (hasUpgrade("multiplication", 121)) mult = mult.pow(1.1)
        if (hasChallenge("pbooster", 12)) mult = mult.pow(1.25)

        if (inChallenge("pbooster", 12)) mult = mult.log(10)
        //other hypers
        //final
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    directMult() {
        let dMult = new Decimal(1)
        
	    if (inChallenge("pbooster", 21)) dMult = dMult.div(player.planetary.planetPowerEffect.pow(0.75))

        return dMult
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "N", description: "SHIFT+C: Reset for Number Cores", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.numbercore.unlocked || player.dimension.points.gte(4)},
    passiveGeneration() {if (player.numbercore.unlocked) return 1},
    onPrestige() {player.numbercore.points = player.numbercore.points.sub(getResetGain("numbercore"))},
    resetsNothing() {return true},
    prestigeButtonText() {return "This button does absolutely nothing. Number Cores are gained passively, okay?"},

    softcap() {
        let base = new Decimal("1e10000")
        if (hasUpgrade("polygon", 23)) base = new Decimal("e1e6")
        return base
    },
    softcapPower() {return new Decimal(0.5)},

    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["buyables"];
        if (layers[resettingLayer].name == "planetary" && !hasMilestone("planetary", 7)) keep = []

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    buyables: {
        11: {
            cost(x) {
                let base = new Decimal("3")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 1)
                return final[0].pow(x.add(final[1])).mul("10")
            },
            title: "Core Condensation",
            display() { return "x2 Number Cores per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                if (inChallenge("polygon", 12)) return new Decimal(1)
                return new Decimal("2").pow(x)
            },
        },
        12: {
            cost(x) {
                let base = new Decimal("5")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 1)
                return final[0].pow(x.add(final[1])).mul("10")
            },
            title: "Numerical Overflow",
            display() { return "^1.01 to \"Recursion\"'s effect and Numbers after softcap per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                if (inChallenge("polygon", 12)) return new Decimal(1)
                return new Decimal("1.01").pow(x)
            },
        },
        13: {
            cost(x) {
                let base = new Decimal("10")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 1)
                return final[0].pow(x.add(final[1])).mul("10")
            },
            title: "Long Division Boost",
            display() { return "x1e10 Points per purchase. <i>This buyable only has effect in Long Division.</i>" + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                if (inChallenge("polygon", 12)) return new Decimal(1)
                return new Decimal("1e10").pow(x)
            },
        },
        21: {
            cost(x) {
                let base = new Decimal("35")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 1)
                return final[0].pow(x.add(final[1])).mul("1e10")
            },
            title: "Addition Booster Booster",
            display() { return "x100 to the effect of the first three Addition boosters per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
            effect(x) {
                if (inChallenge("polygon", 12)) return new Decimal(1)
                return new Decimal("100").pow(x)
            },
        },
        22: {
            cost(x) {
                let base = new Decimal("50")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 2)
                return final[0].pow(x.add(final[1])).mul("1e42")
            },
            title: "Improved Tools",
            display() { return "x1.5 to the effects of the straightedge and compass, and /1.2 to their costs per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()[0]) + ", /" + format(this.effect()[1]) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade("arithmetic", 31) || player.planetary.unlocked},
            effect(x) {
                if (inChallenge("polygon", 12)) return [new Decimal(1), new Decimal(1)]
                return [new Decimal("1.5").pow(x), new Decimal("1.2").pow(x)]
            },
        },
        23: {
            cost(x) {
                let base = new Decimal("1e1500000")
                let expscal = new Decimal("0")
                let final = tmp.numbercore.buyableScalings_NUMBERCORE(base, expscal, x, 3)
                return final[0].pow(x.add(final[1])).mul("e2700000")
            },
            title: "Fundamental Expansion",
            display() { return "Unlock another Fundamental upgrade per purchase. All of the extra upgrades are kept." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/7" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: +" + format(this.effect(), 0) + " upgrades" },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasAchievement("planetary", 31)},
            effect(x) {
                return x
            },
            purchaseLimit: 7
        },
        31: {
            cost(x) {
                return new Decimal("1e5e5").pow(x).mul("e6e6")
            },
            title: "Protest Against Scaling!",
            display() { return "Improve the second Multiplication buyable, x1e100,000 Number Cores, and x1e10 to the Shapes hardcap per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/150" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + format(this.effect()[0]) + ", x" + format(this.effect()[1]) + ", x" + format(this.effect()[2]) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade("planetary", 16)},
            effect(x) {
                let base = getBuyableAmount(this.layer, this.id)
                let e1 = base.add(1).pow(0.175)
                let e2 = new Decimal("1e100000").pow(base)
                let e3 = new Decimal("1e10").pow(base)
                return [e1, e2, e3]
            },
            purchaseLimit: 150
        },
        32: {
            cost(x) {
                return new Decimal("e1e6").pow(x).mul("e15e6")
            },
            title: "Planetary Superpowering",
            display() { return "^1.001 to the gain of Planet Power per purchase, and as a bonus, x1e25 to the Shape hardcap every third purchase (starts at 3)." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/150" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + format(this.effect()[0], 4) + ", x" + format(this.effect()[1]) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasMilestone("dimension", 6)},
            effect(x) {
                let base = getBuyableAmount(this.layer, this.id)
                base = new Decimal(1.001).pow(base)
                let e1 = base
                base = getBuyableAmount(this.layer, this.id)
                base = base.div(3).floor()
                let e2 = new Decimal("1e25").pow(base)
                return [e1, e2]
            },
            purchaseLimit: 150
        },
    },

    glowColor() {
        let layer = "numbercore"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12, 13, 21, 22, 23, 31, 32]) {
            if (canBuyBuyable(layer, id) && tmp[layer].buyables[id].unlocked) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "numbercore"
        for (const id of [11, 12, 13, 21, 22, 23, 31, 32]) {
            if (canBuyBuyable("numbercore", id) && tmp[layer].buyables[id].unlocked) {
                return true
            }
        }
        return false
    },

    automate() {
        let layer = "numbercore"
        for (const id of [11, 12, 13, 21, 22]) {
            if (canBuyBuyable(layer, id) && hasMilestone("planetary", 2) && player.numbercore.PM2NCT && tmp[layer].buyables[id].unlocked) {
                player[layer].points = player[layer].points.sub(tmp[layer].buyables[id].cost)
                setBuyableAmount(layer, id, getBuyableAmount(layer, id).add(1))
            }
        }
    },

    branches: [["corebooster", "#80e040", 5]],
    tooltip() {return format(player.numbercore.points) + " Number Cores (+" + format(getResetGain("numbercore")) + " Number Cores/sec)"},

    buyableScalings_NUMBERCORE(in1, in2, amt, type) {
        let b = in1
        let e = in2
        let a = amt
        switch(type){
            case 1:
                if (a.gte(10)) b = b.add("10")
                if (a.gte(20)) b = b.add("12")
                if (a.gte(30)) b = b.add("14")
                if (a.gte(40)) {b = b.add("16"); e = e.add(2.5)}
                if (a.gte(50)) {b = b.add("20"); e = e.add(5)}
                if (a.gte(60)) {b = b.mul("2"); e = e.add(5)}
                if (a.gte(70)) {b = b.mul("3"); e = e.add(10)}
                if (a.gte(80)) {b = b.mul("5"); e = e.add(25)}
                if (a.gte(90)) {b = b.mul("10"); e = e.add(50)}
                if (a.gte(100)) {b = b.pow("1.15"); e = e.mul(1.5)}

                if (a.gte(125)) {b = b.pow("1.1"); e = e.mul(1.55)}
                if (a.gte(150)) {b = b.pow("1.05"); e = e.mul(1.04)}
                if (a.gte(175)) {b = b.pow("1.2"); e = e.mul(2)}
                if (a.gte(200)) {b = b.pow("1.35"); e = e.mul(4)}
                if (a.gte(225)) {b = b.pow("1.6"); e = e.mul(1.5)}
                if (a.gte(250)) {b = b.pow("2"); e = e.mul(5)}
                if (a.gte(1000)) {b = b.pow("5"); e = e.mul(10)}
                if (a.gte(2000)) {b = b.pow("5"); e = e.mul(10)}
                if (a.gte(3000)) {b = b.pow("15"); e = e.mul(100)}
                break;
            case 2:
                if (a.gte(10)) b = b.add("25")
                if (a.gte(20)) b = b.add("50")
                if (a.gte(30)) b = b.add("75")
                if (a.gte(40)) b = b.add("150")
                if (a.gte(50)) b = b.add("200")
                if (a.gte(60)) b = b.mul("2")
                if (a.gte(70)) b = b.mul("3")
                if (a.gte(80)) b = b.mul("5")
                if (a.gte(90)) b = b.mul("100")
                if (a.gte(100)) {b = b.pow("1.5"); e = e.add(25)}

                if (a.gte(125)) {b = b.pow("1.7"); e = e.add(50)}
                if (a.gte(150)) {b = b.pow("2"); e = e.add(100)}
                if (a.gte(175)) {b = b.pow("1.43"); e = e.mul(1.01)}
                if (a.gte(200)) {b = b.pow("2"); e = e.mul(7.5)}
                if (a.gte(225)) {b = b.pow("2"); e = e.mul(2)}
                if (a.gte(1000)) {b = b.pow("5"); e = e.mul(10)}
                if (a.gte(2000)) {b = b.pow("5"); e = e.mul(10)}
                if (a.gte(3000)) {b = b.pow("15"); e = e.mul(100)}
                break;
            case 3:
                if (a.gte(10)) b = b.pow("1.1")
                break;
        }
        return [b, e, a]
    },
})

