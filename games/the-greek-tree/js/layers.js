addLayer("A", {
    name: "alpha", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "α", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: decimalZero,
        total: decimalZero,
        buyableTime: decimalZero,
    }},
    color: "#ff0000",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "alpha points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    branches: ["B","G"],
     gainMult() { // Calculate the multiplier for main currency from bonuses
        let b22 = getBuyableAmount("A", 22)
        let b23 = getBuyableAmount("A",23)
        let boost22 = new Decimal(1.42).pow(b22).max(1)
        let boost23 = new Decimal(1.8).pow(b23).max(1)

        mult = new Decimal(1)
        if (hasUpgrade('A',13)) mult = mult.times(1.5)
        if (hasUpgrade('A',14)) mult = mult.times(upgradeEffect('A',14))
        if (hasUpgrade('A',22)) mult = mult.times(upgradeEffect('A',22))
        if (hasUpgrade('A',24)) mult = mult.times(upgradeEffect('A',24))
        if (hasBuyable('A',12)) mult = mult.times(buyableEffect('A',12)).times(boost22)
        if (hasBuyable('A',13)) mult = mult.times(buyableEffect('A',13)).times(boost23)
        if (hasUpgrade('A',51)) mult = mult.times(buyableEffect('A',23).pow(3))

        if (hasUpgrade('B',14)) mult = mult.times(upgradeEffect('B',14))
        if (hasUpgrade('B',15)) mult = mult.times(upgradeEffect('B',15))
        if (hasUpgrade('B',23)) mult = mult.times(25)
        if (hasUpgrade('B',41)) mult = mult.times(upgradeEffect('B',41))
        if (hasUpgrade('B',43)) mult = mult.times(1e25)
        if (hasUpgrade('B',44)) mult = mult.times(upgradeEffect('B',44))
        if (hasUpgrade('B',45)) mult = mult.times(upgradeEffect('B',45))
        if(hasMilestone('B',4)) mult = mult.times("1e15")

        if (hasAchievement('ach',24)) mult = mult.times(11)

        if (hasUpgrade('G',11)) mult = mult.times(3)
        if (hasUpgrade('G',12)) mult = mult.times("1e7")
        if (hasUpgrade('G',22)) mult = mult.times(upgradeEffect('G',22))
        if (hasMilestone('G',5)) mult = mult.times(milestoneEffect('G',5))

        if (hasUpgrade('D', 112)) mult = mult.times(upgradeEffect('D',112))
        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        try {
            if (hasUpgrade('A',35)) exp = exp.add(new Decimal(0.025))
            if (hasUpgrade('A',41)) exp = exp.add(new Decimal(0.125))
            if (hasUpgrade('G',23)) exp = exp.add(new Decimal(upgradeEffect('G',23)))
            if (hasUpgrade('G',42)) exp = exp.add(upgradeEffect('G',42))
        } catch (e) {}
        return exp
    },
    passiveGeneration(){
        if (hasMilestone('G',4)) return 100
        if (player.D.resets >= 1) return 2.5
        if (hasMilestone('B',3)) return 0.5
        if (hasMilestone('B',2)) return 0.05 //condition ? yes : no | 5%/s
    },
    update(diff) {
        let data = player.A

        if (hasMilestone('B',1)) generalizedBuyableLogic(diff, this.layer, hasMilestone('G',0))  

        if (data.total.gt(0)) data.unlocked = true
    },
    keeAutoBuy(){
        if (hasMilestone('G',4) || hasMilestone('D',0)) {player.B.autobuyA11_13 = true}
        if (hasMilestone('D',0)) {player.B.autobuyA21_23 = true} 
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for alpha points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){
        if (layers[resettingLayer].row <= this.row) return

        let keep = []
        if (hasMilestone('B', 0) || hasMilestone('G', 1) || hasMilestone('D', 0)) keep.push(...["11","12","13","14","15"])
        if (hasMilestone('B', 3) || hasMilestone('G', 2) || hasMilestone('D', 1)) keep.push(...["21","22","23","24","25"])
        if (hasMilestone('B', 5) || hasMilestone('G', 3) || hasMilestone('D', 2)) keep.push(...["31","32","33","34","35"])
        if (hasMilestone('B', 5) || hasMilestone('G', 4) || hasMilestone('D', 3)) keep.push(...["41","42","43","44","45"])
        if (hasMilestone('G', 5) || hasMilestone('D', 4)) keep.push(...["51","52","53","54","55"])

        let upgrades = player.A.upgrades.filter(id => keep.includes(String(id)))

        layerDataReset("A", ["upgrades"])
        player.A.upgrades = upgrades
    },
    layerShown(){return true},
    tabFormat: {
        "Upgrades": {
            content: ['main-display', 'prestige-button','upgrades'],
        },
        "Buyables": {
            content: ['main-display','buyables'],
            unlocked(){return (hasUpgrade("A",15))}
        },
    },
    upgrades: {
        rows: 5,
        cols: 5,
        11: {
        title: "Boost",
        description: "x2 points gain",
        cost: new Decimal("5"),
        
        },
        12: {
        title: "'Re'Boost",
        description: "x2 points gain again",
        cost: new Decimal("15"),
        unlocked() {return hasUpgrade('A',11)},
        },
        13: {
        title: "More Alpha",
        description: "Multiply alpha gain by 1.5",
        cost: new Decimal("30"),
        unlocked() {return hasUpgrade('A',12)},
        effect(){return new Decimal(1.5)}
        },
        14: {
        title: "You want more ?",
        description: "alpha multiply themselves",
        cost: new Decimal("50"),
        unlocked() {return hasUpgrade('A',13)},
        effect() {
            let power = new Decimal(1.25)
            let boost = new Decimal(1)
            if (hasUpgrade('A',21)) power = 2.5
            if (hasUpgrade('A',43)) boost = boost.mul(upgradeEffect('A',43))
            return player.A.points.add(1).log10().add(1).cbrt().pow(power).mul(boost)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
        title: "Something new ?",
        description: "Unlock a new Tab",
        cost: new Decimal("100"),
        unlocked() {return hasUpgrade('A',14)},
        },
        21: {
        title: "Finally a new row",
        description: "Double alpha upgrade 4 power effect to be better: 1.25 -> 2.5",
        cost: new Decimal("5e3"),
        unlocked() {return hasUpgrade('A',15) && (getBuyableAmount('A',12).gte(5) || hasMilestone('G',2) || hasMilestone('B',3) || hasMilestone('D',1))},
        },
        22: {
        title: "Oh that's cool",
        description: "Boost alpha gain again",
        cost: new Decimal("1e4"),
        effect() {
            return new Decimal(5)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {return hasUpgrade('A',21)},
        },
        23: {
        title: "Oh, look who is back",
        description: "alpha point multiply points gain and unlock a new Layer",
        cost: new Decimal("5e4"),
        effect() {
            power = 1.25
            return player.A.points.max(1).add(1).log10().max(1).pow(power)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {return hasUpgrade('A',22)},
        },
        24: {
        title: "Boost boost?",
        description: "points boost themselves",
        cost: new Decimal("5e6"),
        effect() {
            return player.points.max(1).log10().add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {return hasUpgrade('A',23)},
        },
        25: {
        title: "We are so back",
        description: "alpha upgrade boost alpha point gain",
        cost: new Decimal("5e7"),
        effect() {
            let bUpgradeCount = new Decimal(player.A.upgrades.length).max(1)

            if (hasUpgrade('A', 32))
                bUpgradeCount = bUpgradeCount.pow(2)

            if (hasUpgrade('A', 33))
                bUpgradeCount = bUpgradeCount.pow(2)

            return bUpgradeCount
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {return hasUpgrade('A',24)},
        },
        31: {
        title: "Boost boost boost (seriously...)?",
        description: "points boost themselves based on alpha point",
        cost: new Decimal("5e12"),
        effect() {
            return player.points.max(1).log10().add(player.A.points.max(1).log10().sqrt(2))
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {return (hasUpgrade('B',11) || hasMilestone('D',2)) && hasUpgrade('A',25)},
        },
        32: {
        title: "Expensive boost",
        description: "square effect of alpha upgrade 10",
        cost: new Decimal("7.89e21"),
        effect() {
            return upgradeEffect('A',24).pow(2)
        },
        unlocked() {return hasUpgrade('A',31)},
        },
        33: {
        title: "Expensive boost 2",
        description: "square effect of alpha upgrade 10 again",
        cost: new Decimal("4.21e35"),
        effect() {
            return upgradeEffect('A',24).pow(2)
        },
        unlocked() {return hasUpgrade('A',32)},
        },
        34: {
        title: "34",
        description: "x34 point",
        cost: new Decimal("3.4e50"),
        unlocked() {return hasUpgrade('A',33)},
        },
        35: {
        title: "Another exp",
        description: "Add +0.025 to alpha exp gain",
        cost: new Decimal("8e80"),
        unlocked() {return hasUpgrade('A',34)},
        },
        41: {
        title: "Exp everywhere just for you",
        description: "Add +0.125 to alpha exp gain",
        cost: new Decimal("1e96"),
        unlocked() {return (hasUpgrade('B',42) || hasMilestone('D',3)) && hasUpgrade('A',35)},
        },
        42: {
        title: "Somewhere we go..",
        description: "Add +0.33 to alpha buyable 3 original effect",
        cost: new Decimal("1e160"),
        unlocked() {return hasUpgrade('A',41)},
        },
        43: {
        title: "Ok ?",
        description: "Beta Boost 2 amount exponent 2 boost alpha upgrade 4 effect",
        cost: new Decimal("1e207"),
        unlocked() {return hasUpgrade('A',42)},
        effect() {
            let eff = getBuyableAmount('B',12).pow(2).max(1)
            if (hasUpgrade('A',44)) eff = eff.mul(upgradeEffect('A',44))
            return eff
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        44: {
        title: "Mooooooooore",
        description: "Bpg² effect boost the previous upgrade effect",
        cost: new Decimal("1e211"),
        unlocked() {return hasUpgrade('A',43)},
        effect() {
            return buyableEffect('A',21)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        45: {
        title: "The last one... goodbye",
        description: "Bap2 exponent is now 1.38",
        cost: new Decimal("2.81e281"),
        unlocked() {return hasUpgrade('A',44)},
        },
        51: {
        title: "Or was it ?",
        description: "Bapg2² effect ^3 boost alpha and Bap2 add to Bap",
        cost: new Decimal("1e445"),
        unlocked() {return hasUpgrade('A',45) && hasUpgrade('G',11)},
        effect() {
            return buyableEffect('A',23).pow(3)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        52: {
        title: "Gamma power !",
        description: "Gamma upgrade^52 boost beta",
        cost: new Decimal("1e560"),
        unlocked() {return hasUpgrade('A',51)},
        effect() {
            return getUpgradeCount('G').pow(52).max(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        53: {
        title: "Expo-gone",
        description: "Bap exponent is now 1.25",
        cost: new Decimal("1e568"),
        unlocked() {return hasUpgrade('A',52)},
        },
        54: {
        title: "From buyable to... buyable",
        description: "Bapg2² add to Bapg2",
        cost: new Decimal("1e1150"),
        unlocked() {return hasUpgrade('A',53)},
        },
        55: {
        title: "Everything as an end",
        description: "Bapg2² exp is 2.25",
        cost: new Decimal("1e1750"),
        unlocked() {return hasUpgrade('A',54)},
        },
    },
    buyables: {
        rows: 2,
        cols: 3,
        11: {
        title: "Boost points gain <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)
        

            const base = new Decimal(100)
            return base.mul(new Decimal(1.015).pow(x.pow(1.5))) // base*1.015^(x^1.5)
        },
        display() {
            let oeff = new Decimal(100)
            if (hasUpgrade('B',35)) oeff = oeff.add(1e5)
            if (hasUpgrade('B',22)) oeff = oeff.mul(player.B.upgrades.length)
            
            //TEXT//
            let desc = '+'+format(oeff)+'% points.<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n'  
            return desc + cost + buyableArrangement(this.layer, this.id, 10)//if not null, null, x --> option : condition|bonusAmount|sign
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            oeff = new Decimal(1)
            if (hasUpgrade('B',35)) oeff = oeff.add(1000)
            if (hasUpgrade('B',22)) oeff = oeff.mul(player.B.upgrades.length)
            if (hasBuyable('A',21)) return oeff.mul(x).mul(buyableEffect('A',21))
            return oeff.mul(x).add(1)
        },
        },
        12: {
        title: "Boost alpha points <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(500)
            let power = new Decimal(1.5)
            if (hasUpgrade('A',53)) power = new Decimal(1.25)
            return base.mul(new Decimal(1.25).pow(x.pow(power)))//1.25^(x^1.5)
        },
        display() {
            let oeff = new Decimal(1.2)
            if (hasMilestone('G',6)) oeff  = oeff .add(0.1)
            if (hasUpgrade('B',34)) oeff  = oeff  = oeff .add(0.02)
            if (hasBuyable('B',13)) oeff = oeff .add(buyableEffect('B',13))
            
            //TEXT//
            let desc = 'x'+format(oeff)+' alpha points.<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n'
            let bonus = hasUpgrade('A', 51) ? getBuyableAmount('A', 13) : null
            return desc + cost + buyableArrangement(this.layer, this.id, 10, {bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,11).gte(new Decimal(10))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('A', 51)) y = getBuyableAmount('A', 13)

            let oeff = new Decimal(1.2)
            if (hasUpgrade('B', 34)) oeff = oeff.add(0.02)
            if (hasBuyable('B', 13)) oeff = oeff.add(buyableEffect('B', 13))
            if (hasMilestone('G', 6)) oeff = oeff.add(0.1)

            x = x.add(y) //Add the 2 ammount to effect

            if (hasBuyable('A', 22)) return oeff.pow(x).mul(buyableEffect('A', 22))
            return oeff.pow(x)
        },
        },
        13: {
        title: "Boost alpha points 2 <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            let base = new Decimal(5e5)
            let power = new Decimal(1.5)
            if (hasUpgrade('A',45)) power = new Decimal(1.38)
            return base.mul(new Decimal(2).pow(x.pow(power)))//1.25^(x^1.5)
        },
        display() {
            let oeff = new Decimal(1.67) 
            if (hasMilestone('D',0)) oeff = oeff.add(0.05)
            if (hasUpgrade('A',42)) oeff =  oeff.add(0.33)

            //TEXT//
            let desc = 'x'+format(oeff)+' alpha points.<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n' 
            let show = 'yes'
            if (hasUpgrade('B',11)) show = null
            return desc + cost + buyableArrangement(this.layer, this.id, 15, {condition: show})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,12).gte(new Decimal(10))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            oeff = new Decimal(1.67)
            if (hasMilestone('D',0)) oeff = oeff.add(milestoneEffect('D',0))
            if (hasUpgrade('A',42)) oeff =  oeff.add(0.33)
            if (hasBuyable('A',23)) return oeff.pow(x).mul(buyableEffect('A',23))
            return oeff.pow(x)
        },
        },
        21: {
        title: "Boost point gain ² <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(1e25)

            return base.mul(new Decimal(1.1).pow(x.pow(2))) // base*1.1^(x^2)
        },
        display() {
            //TEXT//
            let desc = 'x1.25 to buyable 1 boost.<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n' 
            return desc + cost + buyableArrangement(this.layer, this.id, 20)
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,13).gte(new Decimal(15)) && hasUpgrade('B',11)},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {return new Decimal(1.25).pow(x)},
        },
        22: {
        title: "Boost alpha points gain ² <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(1e45)
            return base.mul(new Decimal(1.25).pow(x.pow(2))) // base*1.25^(x^2))
        },
        display() {
            let oeff = new Decimal(1.42)
            if (hasBuyable('B',21)) oeff = format(oeff.add(buyableEffect('B',21)))

            //TEXT//
            let desc = 'x'+oeff+' alpha points<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n'
            let bonus = hasUpgrade('A', 54) ? getBuyableAmount('A', 23) : null 
            return desc + cost + buyableArrangement(this.layer, this.id, 30, {bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,21).gte(new Decimal(20))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let oeff = new Decimal(1.42)
            if (hasBuyable('B',21)) oeff = oeff.add(buyableEffect('B',21))
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('A', 54)) y = getBuyableAmount('A', 23)
            x = x.add(y)
            return oeff.pow(x)
        },
        },
        23: {
        title: "Boost alpha points gain 2² <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            let base = new Decimal(1e145)
            let power = new Decimal(2.5)
            if (hasUpgrade('A',55)) power = new Decimal(2.25)
            return base.mul(new Decimal(1.45).pow(x.pow(power)))
        },
        display() {
            let oeff = new Decimal(1.8)
            if (hasUpgrade('G',44)) oeff = oeff.add(0.025)

            //TEXT//
            let desc = 'x'+oeff+' alpha points<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' alpha points \n'
            let bonus = hasUpgrade('B', 53) ? getBuyableAmount('B', 12) : null
            return desc + cost + buyableArrangement(this.layer, this.id, 0, {bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,22).gte(new Decimal(30))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            oeff = new Decimal(1.8)
            if (hasUpgrade('A',42)) oeff = oeff.add(0.2)
            if (hasUpgrade('G',44)) oeff = oeff.add(0.025)
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('B', 53)) y = getBuyableAmount('B', 12)
            x = x.add(y)
            return oeff.pow(x)},
        },
    },
})

addLayer("B", {
    name: "beta", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "β", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        	points: new Decimal(0),
            total: new Decimal(0),
            buyableTime: decimalZero,
    }},
    // Prevent the layer from being permanently unlocked by a prestige
    color: "#1663f1",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "beta points", // Name of prestige currency
    baseResource: "alpha points", // Name of resource prestige is based on
    baseAmount() {return player.A.points.floor()}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.15, // Prestige currency exponent
    branches: ["G"],
     gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('A',52)) mult = mult.times(upgradeEffect('A',52))

        if (hasUpgrade('B',21)) mult = mult.times(2)
        if (hasUpgrade('B',23)) mult = mult.times(5)
        if (hasMilestone('B',1)) mult = mult.times(25)
        if (hasUpgrade('B',32)) mult = mult.times(upgradeEffect('B',32))
        if (hasUpgrade('B',33)) mult = mult.times(5)
        if (hasBuyable('B',11)) mult = mult.times(buyableEffect('B',11))
        if (hasBuyable('B',12)) mult = mult.times(buyableEffect('B',12))
        if (hasUpgrade('B',43)) mult = mult.times(2.5e4)
        if (hasMilestone('B',5)) mult = mult.times(player.G.total.pow(2))
        if (hasUpgrade('B',54)) mult = mult.times(upgradeEffect('B',54))

        if (hasUpgrade('G',11)) mult = mult.times(2)
        if (hasUpgrade('G',12)) mult = mult.times(1e3)
        if (hasMilestone('G',4)) mult = mult.times(milestoneEffect('G',4))

        if (hasMilestone('D',1)) mult = mult.times(milestoneEffect('D',1).betaExp)
        if (hasMilestone('D',5)) mult = mult.times(player.D.duplicates.pow(11)).max(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        try {
            if (hasUpgrade('B',55)) exp = exp.add(1)
            if (hasUpgrade('G',43)) exp = exp.add(0.05)
            if (hasMilestone('G',6)) exp = exp.add(0.1)
        } catch (e) {}
        return exp
    },
    passiveGeneration(){
        if (hasMilestone('D',2)) return 2.5
        if (hasMilestone('G',4)) return 2 //200%
        if (hasMilestone('G',0)) return 0.075 //7.5%
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row < this.row || resettingLayer == this.layer) {return}

        // Save B
        let keepB = []
        if (hasMilestone('D', 2) || hasMilestone('G', 1)) keepB.push(...["11","12","13","14","15"])
        if (hasMilestone('D', 3) || hasMilestone('G', 2)) keepB.push(...["21","22","23","24","25"])
        if (hasMilestone('G', 3) || hasMilestone('D', 4)) keepB.push(...["31","32","33","34","35"])
        if (hasMilestone('G', 4) || hasMilestone('D', 5)) keepB.push(...["41","42","43","44","45"])
        if (hasMilestone('G', 5) || hasMilestone('D', 6)) keepB.push(...["51","52","53","54","55"])

        let keepB2 = []
        if (hasMilestone('G', 3) || hasMilestone('D', 7)) keepB2.push("0")
        if (hasMilestone('G', 4) || hasMilestone('D', 7)) keepB2.push("1")
        if (hasMilestone('G', 5) || hasMilestone('D', 7)) keepB2.push("2")
        if (hasMilestone('G', 6) || hasMilestone('D', 7)) keepB2.push("3")

        let bUpgrades = player.B.upgrades.filter(id => keepB.includes(String(id)))
        let bMilestones = player.B.milestones.filter(id => keepB2.includes(String(id)))

        layerDataReset('B')

        // Restore
        player.B.upgrades = bUpgrades
        player.B.milestones = bMilestones
    },
    update(diff){
        let data = player.B

        if (hasMilestone('G',3)) {generalizedBuyableLogic(diff, this.layer, hasMilestone('D',2))}

        if (player.G.layerShown) data.unlocked = true
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for Beta points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return hasUpgrade('A',23) || player.B.unlocked},
    tabFormat: {
        "Upgrades": {
            content: ['main-display','prestige-button','upgrades'],
        },
        Milestones: {
            content: ['maindisplay', 'milestones'],
        },
        Buyables: {
            content: ['main-display','prestige-button','buyables'],
            unlocked(){return (hasMilestone("B",3))}
        },
    },
    upgrades: {
        rows: 5,
        cols: 5,
        11: {
        title: "And it's beta !",
        description: "x2 point gain and Unlock more alpha upgrades & buyables",
        cost: new Decimal(1),
        effect() {
            let eff = new Decimal(2)

            if (hasUpgrade('B', 14))
                eff = eff.mul(upgradeEffect('B', 14))

            if (hasUpgrade('B', 24))
                eff = eff.pow(3)

            return eff
        },

        effectDisplay() {
            return format(this.effect()) + "x"
        },
        },
        12: {
        title: "Woohoo !",
        description: "x5 points gain",
        cost: new Decimal("1"),
        unlocked() {return hasUpgrade('B',11)},
        },
        13: {
        title: "And yes it's not the end :)",
        description: "x10 points",
        cost: new Decimal("3"),
        unlocked() {return hasUpgrade('B',12)},
        effect(){
            return new Decimal(10)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
        title: "2",
        description: "Each upgrade in this row double beta upgrade 1 effect",
        cost: new Decimal("15"),
        unlocked() {return hasUpgrade('B',13)},
        effect() {
            // Count owned upgrades in the first row (11..15)
            let count = 0
            for (let id = 11; id <= 15; id++) if (hasUpgrade('B', id)) count++
            // Base effect is B11's effect if owned, otherwise 1
            let base = hasUpgrade('B',11) ? new Decimal(1) : new Decimal(1)
            // For each owned upgrade in the row, multiply the base effect by 2
            // Result = base * (2^count)
            if (hasUpgrade('B',25)) return  base.times(new Decimal(2).pow(count)).pow(2)
            return base.times(new Decimal(2).pow(count))
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
        title: "10 + Log boost ?",
        description: "Log10() + 10 of point boost itself and alpha",
        cost: new Decimal("50"),
        unlocked() {return hasUpgrade('B',14)},
        effect() {
            return player.points.max(1).log10().add(11)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
        title: "Finally a beta boost upgrade",
        description: "boost beta gain by 2",
        cost: new Decimal("150"),
        unlocked() {return hasUpgrade('B',15)},
        effect(){return new Decimal(2)}
        },
        22: {
        title: "Buyable points boost boost",
        description: "total beta upgrade boost alpha buyable 1 original effect",
        cost: new Decimal("350"),
        unlocked() {return hasUpgrade('B',21)},
        effect(){
            return player.B.upgrades.length
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        23: {
        title: "Another boost for you",
        description: "boost beta gain by 5 and alpha by 25",
        cost: new Decimal("750"),
        unlocked() {return hasUpgrade('B',22)},
        effect(){return {
            a:new Decimal(25),
            b:new Decimal(5)}
        }
        },
        24: {
        title: "Exponent",
        description: "^3 to beta upgrade 1 effect",
        cost: new Decimal("3e3"),
        unlocked() {return hasUpgrade('B',23)},
        },
        25: {
        title: "More exponent",
        description: "^2 to beta upgrade 4 effect",
        cost: new Decimal("2.5e5"),
        unlocked() {return hasUpgrade('B',24)},
        },
        31: {
        title: "Point exponent",
        description: "Add +0.15 to point exp gain",
        cost: new Decimal("1.5e8"),
        unlocked() {return hasUpgrade('B',25)},
        },
        32: {
        title: "Achievement boost",
        description: "Achievements boost beta gain",
        cost: new Decimal("2.5e9"),
        unlocked() {return hasUpgrade('B',31)},
        effect() {
            return player.ach.achievements.length
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        33: {
        title: "More Autobuy",
        description: "Double buyable autobuy speed and x5 beta gain",
        cost: new Decimal("1e11"),
        unlocked() {return hasUpgrade('B',32)},
        effect(){return new Decimal(5)}
        },
        34: {
        title: "Hmmm",
        description: "alpha buyable 2 is stronger by +0.02",
        cost: new Decimal("5e14"),
        unlocked() {return hasUpgrade('B',33)},
        },
        35: {
        title: "Interesting",
        description: "add +100000% to alpha buyable 1 base",
        cost: new Decimal("1e15"),
        unlocked() {return hasUpgrade('B',34)},
        },
        41: {
        title: "Here is the help you ordered sir",
        description: "Beta Boost amount^10 boost alpha gain",
        cost: new Decimal("2e16"),
        unlocked() {return getBuyableAmount('B',11) >= 5 && hasUpgrade('B',35)},
        effect(){
            return getBuyableAmount('B',11).pow(10).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        42: {
        title: "More upgrade sir ?",
        description: "Unlock more alpha upgrade",
        cost: new Decimal("2.5e22"),
        unlocked() {return hasUpgrade('B',41)},
        },
        43: {
        title: "Betalpha test",
        description: "x25000 beta points et 1e25 alpha points",
        cost: new Decimal("3e27"),
        unlocked() {return hasUpgrade('B',42)},
        effect(){
            return {a:new Decimal(1e25), b:new Decimal(2.5e4)}
        }
        },
        44: {
        title: "From Buyable",
        description: "alpha Buyable 1 amount^4 boost point gain",
        cost: new Decimal("1e48"),
        unlocked() {return hasUpgrade('B',43)},
        effect(){
            return getBuyableAmount('A',11).pow(4).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        45: {
        title: "From Buyable but better",
        description: "alpha Buyable 3 amount^12 boost alpha gain",
        cost: new Decimal("2e59"),
        unlocked() {return hasUpgrade('B',44)},
        effect(){
            return getBuyableAmount('A',13).pow(12).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        51: {
        title: "Pointable",
        description: "Beta Boost effect boost points",
        cost: new Decimal("1e122"),
        unlocked() {return hasUpgrade('B',45) && hasUpgrade('G',11)},
        effect(){
            let val = buyableEffect('B',11)
            if (hasUpgrade('B',52)) val = val.mul(upgradeEffect('B',52))
            return val
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        52: {
        title: "Beta Milestone",
        description: "Beta milestone boost^10 boost previous upgrade effect",
        cost: new Decimal("5e315"),
        unlocked() {return hasUpgrade('B',51)},
        effect(){
            return getMilestoneCount('B').pow(10)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        53: {
        title: "Betaphable",
        description: "BB2 add to bapg2²",
        cost: new Decimal("1e335"),
        unlocked() {return hasUpgrade('B',52)},
        },
        54: {
        title: "G^54",
        description: "Gamma upgrade^54 boost beta",
        cost: new Decimal("1e470"),
        unlocked() {return hasUpgrade('B',53)},
        effect(){
            return getUpgradeCount('G').pow("54")
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        55: {
        title: "Beta_givingExp.exe",
        description: "Give beta gain +1 exp",
        cost: new Decimal("1e535"),
        unlocked() {return hasUpgrade('B',54)},
        },
    },
    milestones: {
        0: {
            requirementDescription: "Require : 10 Beta points (1)",
            done() { return player.B.points.gte(10) },
            effectDescription(){
                return "Reward: Keep the first row of alpha upgrade on reset<br>"
            },
            style: {'width': '750px'},
        },
        1: {
            requirementDescription: "Require : 5e3 Beta points (2)",
            done() { return player.B.points.gte(5e3) },
            unlocked() {return hasMilestone('B',0)},
            effect(){return new Decimal(25)},
            effectDescription(){
                return "Reward: Autobuy alpha buyables (1/s), and x25 beta gain <br>"
            },
            style: {'width': '750px'},
        },
        2: {
            requirementDescription: "Require : 1e6 Beta points (3)",
            done() { return player.B.points.gte(1e6) },
            unlocked() {return hasMilestone('B',1)},
            effectDescription(){
                return "Reward: Generate 5% of alpha points per second<br>"
            },
            style: {'width': '750px'},
        },
        3: {
            requirementDescription: "Require : 2.5e11 Beta points (4)",
            done() { return player.B.points.gte(2.5e11) },
            unlocked() {return hasMilestone('B',2)},
            effectDescription(){
                return "Reward: Generate 50% of alpha points per second, keep second alpha row on reset, x1e10 points and unlock a new tab in beta<br>"
            },
            style: {'width': '750px'},
        },
        4: {
            requirementDescription: "Require : 1e65 Beta points (5)",
            done() { return player.B.points.gte("1e65") },
            unlocked() {return hasMilestone('B',3)},
            effect(){return new Decimal(4e15)},
            effectDescription(){
                return "Reward: x10 bulkA, generate 500% of alpha per second, x4e15 alpha points and unlock a new Layer<br>"
            },
            style: {'width': '750px'},
        },
        5: {
            requirementDescription: "Require : 1e260 Beta points (6)",
            done() { return player.B.points.gte("1e260") },
            unlocked() {return hasMilestone('B',4) && player.G.upgrades.length >= 1},
            effect(){
                let eff = player.G.total.pow(2).max(1)

                if (eff.gte("1e200")) eff = new Decimal("1e200").mul(player.G.total.pow(0.1))
                return eff
            },
            effectDescription(){
                let cap = ""
                let a = "Reward: Keep third and fourth alpha row on reset, x3 bulkA and total gamma^2 boost beta<br>"
                if (milestoneEffect('B',5).gte("1e200")) cap = " (Capped)"
                return a + "Currently: x" + format(milestoneEffect('B',5))+cap
            },
            style: {'width': '750px'},
        },
    },
    buyables: {
        rows: 2,
        cols: 3,
        11: {
        title: "Beta Boost <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(1e13) //Basecose
            let multi = new Decimal(1.2)
            if (hasUpgrade('D',16)) multi = new Decimal(1.05)
            return base.mul(new Decimal(multi).pow(x.pow(1.5))) // base*1.2^(x^1.5)
        },
        display() {
            let oeff = new Decimal(1.5)
            if (hasUpgrade('G',43)) oeff = oeff.add(0.25)
            if (hasUpgrade('G',21)) oeff = oeff.add(upgradeEffect('G',21))

            //TEXT//
            let desc = 'x'+format(oeff)+' beta points<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n' 
            return desc + cost + buyableArrangement(this.layer, this.id, 20)
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return hasMilestone(this.layer, 3)},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) { 
            let oeff = new Decimal(1.5)
            if (hasUpgrade('G',21)) oeff = oeff.add(upgradeEffect('G',21))
            if (hasUpgrade('G',43)) oeff = oeff.add(0.25)
            return oeff.pow(x)},
        },
        12: {
        title: "Beta Boost 2 <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(1e20) //Basecose
            let power = new Decimal(2)
            let multi = new Decimal(1.75)
            if (hasMilestone('G',2)) power = power.sub(milestoneEffect('G',2))
            if (hasUpgrade('G',35)) multi = new Decimal(1.5)
            return base.mul(multi.pow(x.pow(power))) // base*1.75^(x^2)
        },
        display() {
            let oeff = new Decimal(3)
            if (hasMilestone('G',1)) oeff = oeff.add(milestoneEffect('G',1))

            //TEXT//
            let desc = 'x'+format(oeff)+' beta points<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n' 
            return desc + cost + buyableArrangement(this.layer, this.id, 25)
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,11).gte(new Decimal(20))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let oeff = new Decimal(3)
            if (hasMilestone('G',1)) oeff = oeff.add(milestoneEffect('G',1))
            return oeff.pow(x)},
        },
        13: {
        title: "Alpha buyable base <br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal(1e179) //Basecose

            return base.mul(new Decimal(1.025).mul(1e5).pow(x.pow(2))) // base*1.025*1e5^(x^2)
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let cap = new Decimal("0.025")
            let capt = ""
            if (buyableEffect('B',13) >= 3){ cap = new Decimal("0.0005") ; capt = " (Capped) ";}
            if (buyableEffect('B',13) >= 3.5){cap = new Decimal("0.000005") ; capt = " (SuperCapped) "}
            
            //TEXT//
            let desc = '+'+cap+' Bap original effect<br>' + capt
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n'
            let bonus = hasUpgrade('G', 32) ? getBuyableAmount('B', 22).div(2.5) : null
            return desc + cost + buyableArrangement(this.layer, this.id, 25, {sign: '+', bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,12).gte(new Decimal(25))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)

            const cap1 = new Decimal(120)   // effect = 2
            const cap2 = new Decimal(1120)  // effect = 2.5
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('G', 32)) y = getBuyableAmount('B', 22).div(2.5)
            x = x.add(y)

            if (x.lte(cap1))
                return x.mul(0.025)

            if (x.lte(cap2))
                return new Decimal(3).add(
                    x.sub(cap1).mul(0.0005)
                )

            return new Decimal(3.5).add(
                x.sub(cap2).mul(0.000005)
            )},
        },
        21: {
        title: "Alpha buyable base 2 <br>",
         cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e3265") //Basecose

            return base.mul(new Decimal(1.035).mul(1e12).pow(x.pow(1.5))) // base*1.035*1e12^(x^1.5)
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let cap = new Decimal("0.05")
            let capt = ""
            if (buyableEffect('B',21) >= 1.2){ cap = new Decimal("0.001") ; capt = " (Capped) ";}
            if (buyableEffect('B',21) >= 2.5){cap = new Decimal("0.00001") ; capt = " (SuperCapped) "}
            
            //TEXT//
            let desc = '+'+cap+' Bapg² original effect<br>' + capt
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n' 
            return desc + cost + buyableArrangement(this.layer, this.id, 35, {sign: '+'})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,13).gte(new Decimal(25))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)

            const cap1 = new Decimal(24)   // effect = 1.2
            const cap2 = new Decimal(1324)  // effect = 2.5

            if (x.lte(cap1))
                return x.mul(0.05)

            if (x.lte(cap2))
                return new Decimal(1.2).add(
                    x.sub(cap1).mul(0.001)
                )

            return new Decimal(2.5).add(
                x.sub(cap2).mul(0.00001)
            )},
        },
        22: {
        title: "Pointxponent <br>",
         cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e5800") //Basecose 
            let multi = new Decimal(1e25)
            if (hasUpgrade("G",34)) multi = new Decimal(1e22)
            return base.mul(new Decimal(1.055).mul(multi).pow(x.pow(2))) //base*1.055*1e25^(x^2)
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let cap = new Decimal("0.006")
            let capt = ""
            if (buyableEffect('B',22) >= 0.27){ cap = new Decimal("0.0000075") ; capt = " (Capped) ";}
            //TEXT//
            let desc = '+'+cap+' to point exp gain<br>' + capt
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n'
            let bonus = hasUpgrade('G', 51) ? getBuyableAmount('B', 23) : null
            return desc + cost + buyableArrangement(this.layer, this.id, 70, {sign: '+', bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,21).gte(new Decimal(35))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            const capPoint = new Decimal(45) // 50 * 0.006 = 0.25
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('G', 51)) y = getBuyableAmount('B', 23)
            x = x.add(y)
            if (x.lte(capPoint))return x.mul(0.006)
            return new Decimal(0.27).add(x.sub(capPoint).mul(0.0000075))},
        },
        23: {
        title: "Pointxponent 2<br>",
         cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e110000") //Basecose

            let multi = new Decimal(1e30)
            return base.mul(new Decimal(1.075).mul(multi).pow(x.pow(1.7)))//base*1.075*1e30^(x^1.7)
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let cap = new Decimal("0.0001")
            let capt = ""
            if (buyableEffect('B',23) >= 0.25){ cap = new Decimal("0.000005") ; capt = " (Capped)";}
            //TEXT//
            let desc = '+'+cap+' to point exp gain<br>' + capt
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' beta points \n'
            let bonus = hasUpgrade('D', 25) ? getBuyableAmount('D', 11) : null
            return desc + cost + buyableArrangement(this.layer, this.id, 0, {sign: '+', bonusAmount: bonus})
        },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        unlocked() {return getBuyableAmount(this.layer,22).gte(new Decimal(70))},
        buy() {
            if (!safeBuy(this.layer, this.cost())) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            const capPoint = new Decimal(2500) // 2500 * 0.0001 = 0.25
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('D', 25)) y = getBuyableAmount('D', 11)
            x = x.add(y)
            if (x.lte(capPoint))return x.mul(0.0001)
            return new Decimal(0.25).add(x.sub(capPoint).mul(0.000005))},
        },
    },
}),

addLayer("G", {
    name: "gamma", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "γ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0),
    }},
    // Prevent the layer from being permanently unlocked by a prestige
    color: "#fc8600",
    requires: new Decimal("1e308"),
    resource: "gamma points", //Current layer currency
    baseResource: "alpha points", //Currency to buy the layer
    baseAmount() {
        return player.A.points
    },
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.009, // Prestige currency exponent
    branches: ["D"],
     gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('G',14)) mult = mult.times(upgradeEffect('G',14))
        if (hasMilestone('G',3)) mult = mult.times(milestoneEffect('G',3))
        if (hasUpgrade('G',31)) mult = mult.times(upgradeEffect('G',31))
        if (hasUpgrade('G',33)) mult = mult.times(upgradeEffect('G',33))
        if (hasUpgrade('G',41)) mult = mult.times(upgradeEffect('G',41))
        if (hasUpgrade('G',45)) mult = mult.times(1e100)
        if (hasUpgrade('G',53)) mult = mult.times(upgradeEffect(this.layer,53))
        if (hasMilestone('D',1)) mult = mult.times(milestoneEffect('D',1).gammaBoost)
        if (hasMilestone('D',2)) mult = mult.times(milestoneEffect('D',2))

        let power = new Decimal(1.1)
        if (hasUpgrade('D',23)) power = new Decimal(2.5)
        if (hasMilestone('D',3)) mult = mult.times(player.D.duplicates.pow(power)).max(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        try{
            if(hasUpgrade(this.layer,15)) exp = exp.add(upgradeEffect(this.layer,15))
            if (hasUpgrade('D',221)) exp = exp.add(0.1)
        }catch (e) {}
        return exp
    },
    passiveGeneration(){
        if (hasMilestone('D',3)) return 1
        if (hasMilestone('G',5)) return 0.0005 //0.05%/s
    },
    update(diff) {
        const data = player.G
        if (player.G.layerShown) data.unlocked = true
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for Gamma points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('B',4) || player.G.unlocked},
    tabFormat: {
        "Upgrades": {
            content: ['main-display','prestige-button','upgrades'],
        },
        "Milestone":{
            content: ['main-display','milestones']
        }
    },
    upgrades: {
        rows: 5,
        cols: 5,
        11: {
        title: "Here to get a bit faster",
        description: "x4 points, x3 alpha, x2 beta + new upgrades/milestones + x10 autobuy speed",
        cost: new Decimal(1),
        effect(){
            return{
                a: new Decimal(3),
                b: new Decimal(2)
            }
        },
        },
        12: {
        title: "Maybe way faster is better",
        description: "x1e15 points, x1e7 alpha points, x1e3 beta points",
        cost: new Decimal(1),
        unlocked(){return hasUpgrade(this.layer,11)},
        effect(){
            return{
                a: new Decimal(1e7),
                b: new Decimal(1e3)
            }
        }
        },
        13: {
        title: "Gamma Gift",
        description: "Total gamma boost point (max at e250)",
        cost: new Decimal(10),
        unlocked(){return hasUpgrade(this.layer,12)},
        effect() {
            let val = player.G.total.pow(32)
            return val.min(new Decimal("1e250")).max(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
        title: "_Self_",
        description: "Gamma boost gamma",
        cost: new Decimal("1e5"),
        unlocked(){return hasUpgrade(this.layer,13)},
        effect() {
            return player.G.points.max(1).log10().pow(1.5).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
        title: "GammaExp",
        description: "Total Gamma affect gamma exp gain very very slightly (start at 1e7)",
        cost: new Decimal("1e9"),
        unlocked(){return hasUpgrade(this.layer,14)},
        effect() {
            let t = player.G.total.max(1).log10()
            if (t.lt(7)) return new Decimal(0)
            let ratio = t.div(7)
            // count = floor(log2(ratio)) + 1
            let count = ratio.log(2).floor().add(1)
            let eff = new Decimal("0.0001").mul(count)
            return eff
        },
        effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
        title: "Gamma Beta Boost",
        description: "add +0.0005 to Beta Boost original effect for each log10(total gamma)",
        cost: new Decimal("1e11"),
        unlocked(){return hasUpgrade(this.layer,15)},
        effect() {
            let t = player.G.total.max(1).log10()
            let eff = new Decimal(0)
            eff = eff.add(0.0005).mul(t)
            return eff.min(18.5)
        },
        effectDisplay() { 
            let text = ""
            if (upgradeEffect(this.layer, this.id) == 20) text = "maxed"
            return "+"+format(upgradeEffect(this.layer, this.id))+text},
        },
        22: {
        title: "Galph^2",
        description: "Gamma upgrade^gamma upgrade^(gamma upgrade/2) boost alpha",
        cost: new Decimal("2e13"),
        unlocked(){return hasUpgrade(this.layer,21)},
        effect() {
            let gucount = new Decimal(player.G.upgrades.length)
            return gucount.pow(gucount).pow(gucount.div(2))
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x"},
        },
        23: {
        title: "Betamount Buyable",
        description: "Abb amount add to alpha exp gain (Capped at +0.15)",
        cost: new Decimal("1e15"),
        unlocked(){return hasUpgrade(this.layer,22)},
        effect() {
            let amt = getBuyableAmount('B', 13)
            let cap = new Decimal(375) // 375 / 2500 = 0.15

            if (amt.lte(cap))
                return amt.div(2500).max(0)

            return new Decimal(0.15).add(
                amt.sub(cap).div(5e10).max(0)
            )
        },
        effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
        title: "Lauched into space",
        description: "Gamma milestone 4 boost is ^1.19 stronger",
        cost: new Decimal("2e57"),
        unlocked(){return hasUpgrade(this.layer,23)},
        },
        25: {
        title: "So you have a purpose...",
        description: "Achievements points^25 boost point",
        cost: new Decimal("1e93"),
        unlocked(){return hasUpgrade(this.layer,24)},
        effect(){
            return player.ach.points.pow(25)
        },
        effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"}
        },
        31: {
        title: "Yet again...",
        description: "Abb*achievement points^3 boost gamma",
        cost: new Decimal("1e107"),
        unlocked(){return hasUpgrade(this.layer,25)},
        effect(){
            return getBuyableAmount('B',13).mul(player.ach.points.pow(3)).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"}
        },
        32: {
        title: "",
        description: "Pointxponent/2.5 add to Abb",
        cost: new Decimal("1e139"),
        unlocked(){return hasUpgrade(this.layer,31)},
        },
        33: {
        title: "_Self_v2",
        description: "Total gamma boost itself",
        cost: new Decimal("1e185"),
        unlocked(){return hasUpgrade(this.layer,32)},
        effect(){
            let calc = player.G.total.pow(0.0237)
            return calc
        },
        effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"}
        },
        34: {
        title: "pointxdivided",
        description: "pointxponent multiplicative is reduced (1e25 --> 1e22)",
        cost: new Decimal("1e286"),
        unlocked(){return hasUpgrade(this.layer,33)},
        },
        35: {
        title: "Beta_divided.exe",
        description: "Beta Boost 2 multi boost 1.75 -> 1.5",
        cost: new Decimal("1e350"),
        unlocked(){return hasUpgrade(this.layer,34)},
        },
        41: {
        title: "BetaGammaBoost",
        description: "Beta Boost 2 effect boost gamma",
        cost: new Decimal("1e444"),
        unlocked(){return hasUpgrade(this.layer,35)},
        effect(){
            return buyableEffect('B',12).pow(0.008)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        42: {
        title: "AlphEXPoints",
        description: "Each upgrade in this row add to alpha gain exp",
        cost: new Decimal("1e1597"),
        unlocked(){return hasUpgrade(this.layer,41)},
        effect(){
             // Count owned upgrades in the first row (11..15)
            let count = 0
            let start = new Decimal(0)
            for (let id = 41; id <= 45; id++) if (hasUpgrade('G', id)) count++
            // For each owned upgrade in the row, multiply the base effect by 2
            // Result = base * (2^count)
            return new Decimal(0.001).mul(count)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        43: {
        title: "Gemmata Boost",
        description: "Add +0.05 to Beta Boost effect",
        cost: new Decimal("1e1623"),
        unlocked(){return hasUpgrade(this.layer,42)},
        },
        44: {
        title: "Addition to something existant",
        description: "Add +0.025 to Bapg2² effect",
        cost: new Decimal("1e1723"),
        unlocked(){return hasUpgrade(this.layer,43)},
        },
        45: {
        title: "I thought it will never come",
        description: "Unlock a new Layer and boost gamma by 1e100",
        cost: new Decimal("1e1758"),
        unlocked(){return hasUpgrade(this.layer,44)},
        },
        51: {
        title: "Self Point X Ponent",
        description: "Pointxponent 2 add to Pointxponent",
        cost: new Decimal("1e4830"),
        unlocked(){return hasUpgrade(this.layer,45) && hasUpgrade('D', 22)},
        },
        52: {
        title: "Directed to there",
        description: "Total gamma boost Duplicates",
        cost: new Decimal("1e4905"),
        unlocked(){return hasUpgrade(this.layer,51)},
        effect(){
            return player.G.total.log10().log(5)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        53: {
        title: "Give it to me NOW",
        description: "Total gamma^0.01 boost gamma",
        cost: new Decimal("1e6020"),
        unlocked(){return hasUpgrade(this.layer,52)},
        effect(){
            return player.G.total.pow(0.01)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        54: {
        title: "Gammaplications",
        description: "log(10) of Total gamma^0.05 boost Duplicates",
        cost: new Decimal("1e6545"),
        unlocked(){return hasUpgrade(this.layer,53)},
        effect(){
            return player.G.total.pow(0.05).log(10)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        55: {
        title: "From somewhere else",
        description: "Point/1e410k.pow(0.01) boost itself",
        cost: new Decimal("1e6900"),
        unlocked(){return hasUpgrade(this.layer,54)},
        effect(){
            return player.points.div("1e410000").pow(0.01).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
    },
    milestones: {
        0: {
            requirementDescription: "Require : 1e10 Gamma points (1)",
            done() { return player.G.points.gte("1e10") },
            effect(){
                let val = new Decimal(0)
                return val.add(0.0065).mul(getMilestoneCount(this.layer))
            },
            effectDescription(){
                let a = "Reward: Generate 7.5% of beta points per second, buy all alpha buyable at the same time and each gamma milestone add +0.0065 to point gain exp<br> \n"
                return a + "Currently: +" + format(milestoneEffect('G',0))
            },
            style: {'width': '750px'},
        },
        1: {
            requirementDescription: "Require : 1.5e14 Gamma points (2)",
            done() { return player.G.points.gte("1.5e14") },
            unlocked(){return hasMilestone(this.layer,0)},
            effect(){
                let val = new Decimal(0).add(new Decimal(0.2)).mul(getMilestoneCount(this.layer).sub(1))
                if (milestoneEffect('G',1) >= 0.7) val = new Decimal(0.7).add(new Decimal(0.02).mul(getMilestoneCount(this.layer).sub(4)))
                return val
            },
            effectDescription(){
                let cap = ""
                let eff = new Decimal(0.2)
                if (milestoneEffect('G',1) >= 0.7) {cap = " (Capped)"; eff = eff.div(10)}
                let a = "Reward: For each gamma milestone-1 keep beta & alpha upgrade row and add +"+format(eff)+" original effect to Beta Boost 2<br> \n"
                return a + "Currently: +" + format(milestoneEffect('G',1).max(0))+cap
            },
            style: {'width': '750px'},
        },
        2: {
            requirementDescription: "Require : 2e16 Gamma points (3)",
            done() { return player.G.points.gte("2e16") },
            unlocked(){return hasMilestone(this.layer,1)},
            effect(){
                return player.G.total.max(1).div(1e16).log("1ee4").max(0).min(0.25)
            },
            effectDescription(){
                let a = "Reward: x3 to BulkA & alpha autobuy speed and total gamma reduce Beta Boost 2 exponent <br> \n"
                let text = ""
                if (milestoneEffect('G',2) >= 0.25) text = " (Maxed)"
                return a + "Currently: -" + format(milestoneEffect('G',2).min(0.25))+ text
            },
            style: {'width': '750px'},
        },
        3: {
            requirementDescription: "Require : 1e32 Gamma points (4)",
            done() { return player.G.points.gte("1e32") },
            unlocked(){return hasMilestone(this.layer,2)},
            effect(){
                let val = new Decimal(player.G.upgrades.length)
                if (hasUpgrade('G',24)) val = val.pow(1.19)
                return val.mul(val.pow(val)).max(1)
            },
            effectDescription(){
                let a = "Reward: Each gamma milestone-2 will keep a beta milestone, total gamma upgrade boost gamma and buy beta buyables <br> \n"
                let text = "x"
                return a + "Currently: " + format(milestoneEffect('G',3))+ text
            },
            style: {'width': '750px'},
        },
        4: {
            requirementDescription: "Require : 1e86 Gamma points (5)",
            done() { return player.G.points.gte("1e86") },
            unlocked(){return hasMilestone(this.layer,3)},
            effect(){
            let val = new Decimal(getBuyableAmount('A',21)).max(1)
            return val.max(1).pow(55.55)
            },
            effectDescription(){
                let a = "Reward: Generate 200% of beta/s, 10000% of alpha/s, keep automation on unlocked milestones and Bpg² amount^55.55 boost beta<br> \n"
                let text = "x"
                return a + "Currently: " + format(milestoneEffect('G',4))+ text
            },
            style: {'width': '750px'},
        },
        5: {
            requirementDescription: "Require : 1e199 Gamma points (6)",
            done() { return player.G.points.gte("1e199") },
            unlocked(){return hasMilestone(this.layer,4)},
            effect(){return new Decimal("1e199")},
            effectDescription(){
                let a = "Reward: x10 to all bulk and x5 to all speed, boost alpha point by 1e199 and Generate 0.05% of gamma <br> \n"
                let text = "x"
                return a + "Currently: " + format(milestoneEffect('G',5))+ text
            },
            style: {'width': '750px'},
        },
        6: {
            requirementDescription: "Require : 5e610 Gamma points (7)",
            done() { return player.G.points.gte("5e610") },
            unlocked(){return hasMilestone(this.layer,5)},
            effectDescription(){
                let a = "Reward: Add +0.1 to beta points exponent <br> \n"
                return a
            },
            style: {'width': '750px'},
        },
    }
}),

addLayer("D", {
    name: "delta", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "δ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0),
        resets: new Decimal(0),
        duplicates: new Decimal(0),
        dupliGen: new Decimal(0),
        totalDuplicates : new Decimal(0),
        demoplex: new Decimal(0),
        demoGen: new Decimal(0),
        totalDemoplex: new Decimal(0),
        dSeed: decimalZero,
    }},
    // Prevent the layer from being permanently unlocked by a prestige
    color: "#ac00fc",
    requires: new Decimal("1e2248"),
    resource: "delta points", //Current layer currency
    baseResource: "gamma points", //Currency to buy the layer
    baseAmount() {
        return player.G.points.floor()
    },
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 6, // Prestige currency exponent
    exponent() {
        let data = player.D
        let exp = 6
        if (data.resets == 3) exp = 5.25
        if (data.resets == 4) exp = 6.415
        if (data.resets >= 6) exp = 6.0605
        if (data.resets >= 8) exp = 6.1 
        return exp
    },
    onPrestige(gain) {
        player[this.layer].resets = player[this.layer].resets.add(1) //count Delta reset
    },
    doReset(resettingLayer){
        layerDataReset('G')
    },
    normalizeDuplicateData() {
        let data = player.D
        if (!data) return
        data.duplicates = new Decimal(data.duplicates || 0)
        data.dupliGen = new Decimal(data.dupliGen || 0)
        data.totalDuplicates = new Decimal(data.totalDuplicates || 0)
        //Demoplex
        data.demoplex = new Decimal(data.demoplex || 0)
        data.demoGen = new Decimal(data.demoGen || 0)
        data.totalDemoplex = new Decimal(data.totalDemoplex || 0)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        try{
        }catch (e) {}
        return exp
    },
    // onLoad() {
    //     // Force-convert custom Decimal fields back after save load
    //     this.normalizeDuplicateData()
    // },
    update(diff){
        this.normalizeDuplicateData()
        let data = player.D

        if (data.layerShown) data.unlocked = true

        let powerd = new Decimal(3.5)
        if (hasUpgrade('D',121)) powerd = new Decimal("1e6")
        if (hasUpgrade('D',124)) powerd = new Decimal(1.75) 

        const duplicateConfig = {
            condition: () => hasMilestone('D', 3),
            upgrades:  [11, 13, 14, 15, 22, 25, 31, 33, 35, 41, 45],
            dualUpgrades: [[43, 'A'], [125,'dupli']],
            buyables:  [11, 12, 13, 14],
            milestones: [4, 6],
            externalUpgrades: [['G', 52], ['G', 54]],
            otherCurrencys: [['D', 'demoplex', powerd, ["*",124]],['D','dSeed', new Decimal(15), "^"]],
        }

        const demoplexConfig = {
            condition: () => hasUpgrade('D', 36),
            upgrades:  [111,113,114,115,116,42,122,44],
            dualUpgrades: [[43, 'B'], [125,'demo']],               
            buyables:  [],
            milestones: [7],
            externalUpgrades: [],
            otherCurrencys: [['D','dSeed', new Decimal(2), "^"]],
        }

        let gen = getCurrencyGen('D', duplicateConfig)
        let demoGen = getCurrencyGen('D', demoplexConfig)

        data.dupliGen = gen
        let gained = gen.mul(diff)
        data.duplicates = data.duplicates.add(gained)
        data.totalDuplicates = (data.totalDuplicates || decimalZero).add(gained)
        //Demoplex
        data.demoGen = demoGen
        let demogained = demoGen.mul(diff)
        data.demoplex = data.demoplex.add(demogained)
        data.totalDemoplex = (data.totalDemoplex || decimalZero).add(demogained)

        if (hasMilestone('D',8)) {generalizedBuyableLogic(diff, this.layer, null)}

    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for Gamma points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('G',45) || player.D.unlocked},
    tabFormat: {
        "Main": {
            content: [
                function() { if (player.tab == "D") return "main-display" },
                function() { if (player.tab == "D") return "prestige-button" },
                ["raw-html", function() {
                    if (player.tab == "D") return "<br>You have made " + player.D.resets + " Delta resets"
                }],
                ["raw-html", function() {
                    let power = new Decimal(1.1)
                    let powerb = new Decimal(11)
                    let powerd = new Decimal(3.5)
                    let sign = "*"

                    if (hasUpgrade('D', 121)) powerd = new Decimal("1e6")
                    if (hasUpgrade('D', 124)) { powerd = new Decimal('1.75'); sign = "^" }

                    let demoBoost = sign == "^" 
                        ? player.D.demoplex.pow(powerd) 
                        : player.D.demoplex.mul(powerd)
                    let demoText = sign + powerd
                    let textbonus = ""
                    if (hasUpgrade('D', 23)) power = new Decimal(2.5)
                    //________TEXT________
                    let text = shiftDown
                        ? colorText("h2", "#ac00fc", "Duplicates^" + power)
                        : colorText("h2", "#ac00fc", format(player.D.duplicates.pow(power)))
                    let textdemo = shiftDown
                        ? colorText("h2", "#c979ee", "Demoplex" + demoText)
                        : colorText("h2", "#c979ee", format(demoBoost))
                    if (hasMilestone(this.layer,5)) {
                        textbonus = shiftDown
                        ? " and beta by " + colorText("h2", '#ac00fc', "Duplicates^" + powerb)
                        : " and beta by " + colorText("h2", '#ac00fc', format(player.D.duplicates.pow(powerb)))
                    }
                    if (player.D.resets >= 4){
                        let result = "You have " + colorText("h2", "#ac00fc", format(player.D.duplicates)) +
                            " Duplicates and generate " + format(player.D.dupliGen) +
                            " Duplicates/s which boost gamma gain by " + text + textbonus
                        if (hasUpgrade('D', 36)) {
                            result += "<br>You have " + colorText("h2", "#c979ee", format(player.D.demoplex)) +
                                " Demoplex and generate " + format(player.D.demoGen) +
                                " Demoplex/s which boost Duplicates gain by " + textdemo
                        }
                        return result;
                    }
                }],
                ["microtabs", "Duplicates",],
            ],
        },
        "Milestone": {
            content: ['main-display', 'milestones']
        },
        "Upgrade-Tree": {
            content: [
                ["raw-html", function() {
                    let seed = player.D.dSeed
                    
                    let boosts = [
                        { name: "points",     color: "#ffffff", exp: 5e4 },
                        { name: "alpha",      color: "#ff0000", exp: 3e4 },
                        { name: "beta",       color: "#1663f1", exp: 1e4 },
                        { name: "gamma",      color: "#fc8600", exp: 200   },
                        { name: "Duplicates", color: "#ac00fc", exp: 15    },
                        { name: "Demoplex",   color: "#c979ee", exp: 2     },
                    ]
                    
                    let text = "You have " + seed + colorText("h2", "#4c0e86", " DSeed") + " and it boost the following:<br>"
                    for (let b of boosts) {
                        let val = shiftDown ? "DSeed^" + b.exp : format(seed.add(1).pow(format(b.exp)))
                        text += colorText("h2", b.color, b.name) + " by " + colorText("h2", b.color, val) + "x<br>"
                    }

                    text += "<br>_______UPGRADE TREE_______<br><br>"
                    return text
                }],
                ['upgrade-tree', [[201], [211,212],[221]]],
            ],
            unlocked() { return hasUpgrade('D',46)}
        }
    },

    microtabs: {
        Duplicates: {
            "Upgrades": {
                content: ['upgrades'],
                unlocked() {
                    return hasMilestone('D', 4)
                }
            },
            "Buyables": {
                content: ['buyables'],
                unlocked() {
                    return (hasUpgrade('D', 24))
                }
            },
            "Upgrades 2": {
                unlocked() { return hasUpgrade('D', 36) },
                content: ["raw-html", function() {if (hasUpgrade('D', 36)) return ["upgrades",[11,12,13,14]]}],
                buttonStyle: {"border-color": "#c979ee"},
            },
        },
    },
    upgrades: {
        rows: 6,
        cols: 6,
        11: {
        title: "Welcome to the new journey !",
        description: "Duplicates multiply themselves",
        cost: new Decimal(150),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasMilestone(this.layer,3)},
        effect(){
            let val = player.D.duplicates.pow(0.1)
            if (hasUpgrade('D',21)) val = val.mul(upgradeEffect('D',21))
            return val.max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        12: {
        title: "Duplicates points",
        description: "Duplicates multiply points",
        cost: new Decimal(300),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,11)},
        effect(){
            return player.D.duplicates.pow(100)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        13: {
        title: "Gammaplates",
        description: "Gamma Upgrade boost Duplicates",
        cost: new Decimal(700),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,12)},
        effect(){
            return getUpgradeCount('G').max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        14: {
        title: "Duplicates+",
        description: "Duplicates Upgrade boost Duplicates",
        cost: new Decimal(2e4),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,13)},
        effect(){
            return getUpgradeCount('D')
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        15: {
        title: "Delta doubleplicates",
        description: "Delta Reset*Delta Reset boost Duplicates",
        cost: new Decimal(5e4),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,14)},
        effect(){
            return player.D.resets.mul(player.D.resets)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        16: {
        title: "Base reduction",
        description: "Reduce Beta Boost multi to 1.05",
        cost: new Decimal(5e5),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,15)},
        },
        21: {
        title: "Duplicates.duplicates",
        description: "Duplicates upgrades boost Duplicates upgrade 1 effect",
        cost: new Decimal(1e9),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,16)},
        effect(){
            return getUpgradeCount('D')
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        22: {
        title: "We will never stop",
        description: "Gamma upgrade 4 effect boost Duplicates + new upgrades",
        cost: new Decimal(2e10),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,21)},
        effect(){
            return upgradeEffect('G',14)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        23: {
        title: "Upgrade Effect",
        description: "Duplicates boost on gamma is now ^2.5",
        cost: new Decimal(2.5e16),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,22)},
        },
        24: {
        title: "These have some too",
        description: "Unlock Buyables",
        cost: new Decimal(2e17),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,23)},
        },
        25: {
        title: "Duplicatations Amount",
        description: "Duplications Amount boost Duplicates",
        cost: new Decimal(1e25),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,24)},
        effect(){
            return getBuyableAmount(this.layer,11).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        26: {
        title: "Duplixpoint",
        description: "Duplications add to Pointxponent 2",
        cost: new Decimal(1e30),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,25)},
        },
        31: {
        title: "Duplicative Boost",
        description: "(Total Duplicates/1e50)^0.3 boost itself",
        cost: new Decimal(1e500),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,31)},
        effect(){
            return player.D.totalDuplicates.div("1e50").pow(0.3).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        32: {
        title: "Duplicanatations",
        description: "Duplicanations add to Duplications",
        cost: new Decimal(5e57),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,31)},
        },
        33: {
        title: "GammOOM",
        description: "Each OOM of gamma boost duplicates",
        cost: new Decimal(2e98),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,32)},
        effect() {
            let gammaOOM = player.G.points.max(1).log10().floor()
            return gammaOOM.max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        34: {
        title: "More Buyables adding",
        description: "Duplifications add to Duplicanations & Duplications",
        cost: new Decimal(2e118),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,33)},
        },
        35: {
        title: "% of something",
        description: "250% of the OOM of alpha boost Duplicates",
        cost: new Decimal(2e142),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,34)},
        effect() {
            let alphaOOM = player.A.points.max(1).log10().floor()
            return alphaOOM.mul(2.5).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        36: {
        title: "Oh ?",
        description: "Unlock a new Currency",
        cost: new Decimal(2e202),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,35)},
        },
        41: {
        title: "Duplicates beta power",
        description: "Duplicates boost to beta^0.005 boost Duplicates",
        cost: new Decimal(1e252),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,36) && hasUpgrade(this.layer,121)},
        effect() {
            let betaPower = player.D.duplicates.pow(11)
            return betaPower.pow(0.005).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        42: {
        title: "You need this I already know it",
        description: "Previous upgrade effect^0.1 boost Demoplex",
        cost: new Decimal(2.91e291),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,41)},
        effect() {
            return upgradeEffect('D',41).pow(0.1).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        43: {
        title: "log10(A) & log10(B)",
        description: "log10(Alpha amount) boost Duplicates & log10(Beta amount) boost Demoplex",
        cost: new Decimal("3.1e301"),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,42)},
        effect() {
            let A = player.A.points.max(1).log10()
            let B = player.B.points.max(1).log10()
            return {A, B}
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id).A)+"x | "+format(upgradeEffect(this.layer,this.id).B)+"x"}
        },
        44: {
        title: "Helping his friend",
        description: "Duplicates boost Demoplex to a very small rate",
        cost: new Decimal("2e400"),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,43)},
        effect() {
            return player.D.duplicates.pow(0.0075)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        45: {
        title: "esrever Upgrades",
        description: "Each Demoplex upgrade boost Duplicates by x10",
        cost: new Decimal("1e579"),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,44)},
        effect() {
            return new Decimal(10).pow(getUpgradeCount('D', { minId: 111 }))
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        46: {
        title: "Inception ?",
        description: "Unlock a new Main Tab",
        cost: new Decimal("1e683"),
        currencyInternalName: "duplicates",
        currencyLayer: "D",
        currencyDisplayName: "Duplicates", 
        unlocked(){return hasUpgrade(this.layer,45)},
        },
        //Demoplex Upgrades
        111: {
        title: "New New Adventure",
        description: "Demoplex boost themselves",
        cost: new Decimal(200),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade(this.layer,36)},
        effect() {
            let val = player.D.demoplex.pow(0.065)
            return val.max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        112: {
        title: "Demoplex'OOM",
        description: "OOM of Demoplex boost alpha^1e5",
        cost: new Decimal(300),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",111)},
        effect() {
            let demoOOM = player.D.demoplex.max(1).log10().floor()
            return demoOOM.pow(1e5).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        113: {
        title: "Bet'OOM",
        description: "OOM of beta/5e5 boost Demoplex",
        cost: new Decimal(500),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",112)},
        effect() {
            let demoOOM = player.B.points.max(1).log10().floor().div(5e5)
            return demoOOM.max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        114: {
        title: "Duplification.div",
        description: "Duplification/3 boost Demoplex",
        cost: new Decimal(1e3),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",113)},
        effect() {
            return getBuyableAmount('D',13).div(3).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        115: {
        title: "Delta Milestone",
        description: "Delta Milestone amount boost Demoplex",
        cost: new Decimal(5e3),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",114)},
        effect() {
            return getMilestoneCount('D').max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        116: {
        title: "Duplicate's",
        description: "Duplicates^0.003 boost Demoplex",
        cost: new Decimal(2.5e4),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",115)},
        effect() {
            return player.D.duplicates.pow(0.003).max(1)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        121: {
        title: "Demoplex to Duplicates",
        description: "Demoplex*1e6 boost Duplicates + new upgrades",
        cost: new Decimal(2e5),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",116)},
        },
        122: {
        title: "Upgrade ID",
        description: "This upgrade id boost Demoplex",
        cost: new Decimal(2.5e7),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",121)},
        effect() {
            let val = new Decimal(this.id)
            if (hasUpgrade('D',123)) val = val.mul(upgradeEffect('D',123))
            return val
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        123: {
        title: "Boost ID",
        description: "Duplifications boost previous upgrade^2",
        cost: new Decimal(5e16),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",122)},
        effect() {
            return getBuyableAmount('D',13).pow(2)
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        124: {
        title: "Changes for Boost",
        description: "Demoplex boost Duplicates^1.75",
        cost: new Decimal(1.9e19),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",123)},
        },
        125: {
        title: "Pointable's",
        description: "B51 effect^0.000125 boost Duplicates & this effect^0.125 boost Demoplex",
        cost: new Decimal(2.5e23),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",124)},
        effect(){
            let dupli = decimalOne
            let demo = decimalOne
            return {
                dupli: dupli = upgradeEffect('B',51).pow(0.000125),
                demo: dupli.pow(0.125)
            }
        },
        effectDisplay(){return format(upgradeEffect(this.layer, this.id).dupli)+"x | "+format(upgradeEffect(this.layer, this.id).demo)+"x"}
        },
        126: {
        title: "Duplificatanatations",
        description: "Duplificatanation add to all the previous buyables",
        cost: new Decimal(1e33),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",125)},
        },
        131: {
        title: "_",
        description: "_",
        cost: new Decimal(1e45),
        currencyInternalName: "demoplex",
        currencyLayer: "D",
        currencyDisplayName: "Demoplexes", 
        unlocked(){return hasUpgrade("D",221)},
        },
        //__________UpgradeTree__________
        201: {
            title: "D{0}",
            description: "x1e500k beta",
            unlocked() { return hasUpgrade("D", 46) },
            branches() { return [211,212] },
            cost() { return{
                    c1:new Decimal("1e700"), //Duplicates
                    c2:new Decimal("1e35") //Demoplex
                }
            },
            canAfford() {
                return !hasUpgrade(this.layer, this.id) &&  // ← not already bought
                player.D.duplicates.gte(this.cost().c1) && player.D.demoplex.gte(this.cost().c2) },
            onPurchase() { player.D.dSeed = player.D.dSeed.add(1) },
            effect() { return new Decimal("1e500000") },
            fullDisplay() {
                if (hasUpgrade(this.layer, this.id)) 
                    return "<b>" + this.title + "</b><br>" + this.description + "<br><br><i>Purchased!</i>"
                let canDup = player.D.duplicates.gte(this.cost().c1)
                let canDemo = player.D.demoplex.gte(this.cost().c2)
                return "<b>" + this.title + "</b><br>" + this.description + "<br><br>" +
                    colorText("h4", canDup ? "#68ff88" : "#ffffff", format(this.cost().c1)) + " Duplicates<br>&&<br>" +
                    colorText("h4", canDemo ? "#68ff88" : "#ffffff", format(this.cost().c2)) + " Demoplex" +
                    "<br><br>This upgrade will give you 1 dSeed"
            },
        },
        211: {
            title: "D{1;1}",
            description: "For each Delta milestone, x1e50 gamma",
            unlocked() { return hasUpgrade("D", 201) },
            branches() { return [221] },
            cost() { 
                let c1 = new Decimal("1e770")
                let c2 = new Decimal("1e39")
                if(hasUpgrade('D',212)) {
                c1 = new Decimal("1e828")
                c2 = new Decimal("1e41")}
                return{
                    c1: c1, //Duplicates
                    c2: c2 //Demoplex
                }
            },
            canAfford() {
                return !hasUpgrade(this.layer, this.id) &&  // ← not already bought
                player.D.duplicates.gte(this.cost().c1) && player.D.demoplex.gte(this.cost().c2) },
            onPurchase() { player.D.dSeed = player.D.dSeed.add(1) },
            effect() {let val = decimalOne
                for (i = 0; i <= getMilestoneCount('D'); i++){
                    val = val.mul(1e50).max(1)
                }
                return val
            },
            fullDisplay() {
                if (hasUpgrade(this.layer, this.id)) 
                    return "<b>" + this.title + "</b><br>" + this.description + "<br><br><i>Purchased!</i>"
                let canDup = player.D.duplicates.gte(this.cost().c1)
                let canDemo = player.D.demoplex.gte(this.cost().c2)
                return "<b>" + this.title + "</b><br>" + this.description + "<br><br>" +
                    colorText("h4", canDup ? "#68ff88" : "#ffffff", format(this.cost().c1)) + " Duplicates<br>&&<br>" +
                    colorText("h4", canDemo ? "#68ff88" : "#ffffff", format(this.cost().c2)) + " Demoplex<br> Currently: " +
                    format(upgradeEffect(this.layer, this.id))+"<br><br>This upgrade will give you 1 dSeed"
            },
        },
        212: {
            title: "D{1;2}",
            description: "Duplification cost formula is now base*2.5^x^2.1",
            unlocked() { return hasUpgrade("D", 201) },
            branches() { return [221] },
            cost() { 
                let c1 = new Decimal("1e770")
                let c2 = new Decimal("1e39")
                if(hasUpgrade('D',211)) {
                c1 = new Decimal("1e798")
                c2 = new Decimal("2e40")}
                return{
                    c1: c1, //Duplicates
                    c2: c2 //Demoplex
                }
            },
            canAfford() {
                return !hasUpgrade(this.layer, this.id) &&  // ← not already bought
                player.D.duplicates.gte(this.cost().c1) && player.D.demoplex.gte(this.cost().c2) },
            onPurchase() { player.D.dSeed = player.D.dSeed.add(1) },
            fullDisplay() {
                if (hasUpgrade(this.layer, this.id)) 
                    return "<b>" + this.title + "</b><br>" + this.description + "<br><br><i>Purchased!</i>"
                let canDup = player.D.duplicates.gte(this.cost().c1)
                let canDemo = player.D.demoplex.gte(this.cost().c2)
                return "<b>" + this.title + "</b><br>" + this.description + "<br><br>" +
                    colorText("h4", canDup ? "#68ff88" : "#ffffff", format(this.cost().c1)) + " Duplicates<br>&&<br>" +
                    colorText("h4", canDemo ? "#68ff88" : "#ffffff", format(this.cost().c2)) + " Demoplex" +
                    "<br><br>This upgrade will give you 1 dSeed"
            },
        },
        221: {
            title: "D{2}",
            description: "New Upgrades and +0.1 to gamma exp gain",
            unlocked() { return hasUpgrade("D", 211) && hasUpgrade('D',212)},
            branches() { return [] },
            cost() { 
                let c1 = new Decimal("1e850")
                let c2 = new Decimal("2e42")
                return{
                    c1: c1, //Duplicates
                    c2: c2 //Demoplex
                }
            },
            canAfford() {
                return !hasUpgrade(this.layer, this.id) &&  // ← not already bought
                player.D.duplicates.gte(this.cost().c1) && player.D.demoplex.gte(this.cost().c2) },
            onPurchase() { player.D.dSeed = player.D.dSeed.add(2) },
            effect() { return new Decimal("1e500000") },
            fullDisplay() {
                if (hasUpgrade(this.layer, this.id)) 
                    return "<b>" + this.title + "</b><br>" + this.description + "<br><br><i>Purchased!</i>"
                let canDup = player.D.duplicates.gte(this.cost().c1)
                let canDemo = player.D.demoplex.gte(this.cost().c2)
                return "<b>" + this.title + "</b><br>" + this.description + "<br><br>" +
                    colorText("h4", canDup ? "#68ff88" : "#ffffff", format(this.cost().c1)) + " Duplicates<br>&&<br>" +
                    colorText("h4", canDemo ? "#68ff88" : "#ffffff", format(this.cost().c2)) + " Demoplex" +
                    "<br><br>This upgrade will give you 2 dSeed"
            },
        }
    },
    milestones: {
        0: {
            requirementDescription: "Require : 1 Delta Reset (1)",
            done() { return player.D.resets.gte(1) },
            effect(){
                return {base: 0.05, ABspeed: player.D.resets.add(1)}
            },
            effectDescription(){
                let eff = milestoneEffect('D',0)
                let a = "Reward: Keep alpha generation at 250%, per milestone keep alpha row upgrade + autobuy, delta reset+1 add to A buyables speed, x5 B buyables speed and add 0.05 to Boost alpha points 2 base effect<br> \n"
                return a + "Currently: +" +
                format(eff.base) + " Bap2 base | " +
                format(eff.ABspeed) + "x ABspeed"
            },
            style: {'width': '750px'},
        },
        1: {
            requirementDescription: "Require : 2 Delta Reset (2)",
            done() { return player.D.resets.gte(2) },
            unlocked(){return hasMilestone(this.layer,0)},
            effect(){
                return {
                    gammaBoost: player.D.resets.mul(3),
                    betaExp: getBuyableAmount('A',21).max(1).pow(2)
                }
            },
            effectDescription() {
                let eff = milestoneEffect("D", 1)

                return "Reward: Delta resets boost Gamma by 3x and each Boost point gain ² boost Beta gain by ^2<br>" +
                    "Currently: " +
                    format(eff.gammaBoost) + "x Gamma | " +
                    format(eff.betaExp) + "x Beta"
            },
            style: {'width': '750px'},
        },
        2: {
            requirementDescription: "Require : 3 Delta Reset (3)",
            done() { return player.D.resets.gte(3) },
            unlocked(){return hasMilestone(this.layer,1)},
            effect(){
                return player.D.resets.mul(1e20)
            },
            effectDescription() {
                return "Reward: Keep beta generation at 250%, per milestone keep beta row upgrade, buy all delta buyables at once, delta reset*1e20 multiply gamma <br>" +
                    "Currently: " +
                    format(milestoneEffect("D", 2))+"x"
            },
            style: {'width': '750px'},
        },
        3: {
            requirementDescription: "Require : 4 Delta Reset (4)",
            done() { return player.D.resets.gte(4) },
            unlocked(){return hasMilestone(this.layer,2)},
            effectDescription() {
                return "Reward: Unlock Duplicates and Generate 100% gamma/s<br>"
            },
            style: {'width': '750px'},
        },
        4: {
            requirementDescription: "Require : 5 Delta Reset (5)",
            done() { return player.D.resets.gte(5) },
            unlocked(){return hasMilestone(this.layer,3)},
            effect() {
                let DR = new Decimal(player.D.resets)
                let val = decimalOne
                for (let i = 0; i < DR; i++) {
                    val = val.mul(3) 
                }
                return val 
            },
            effectDescription() {
                return "Reward: Each new delta reset boost Duplicates by x3 <br>" +"Currently: "+ format(milestoneEffect(this.layer, this.id))+"x"
            },
            style: {'width': '750px'},
        },
        5: {
            requirementDescription: "Require : 1e42 Duplicates (6)",
            done() { return new Decimal(player.D.duplicates || 0).gte("1e42")},
            unlocked(){return hasMilestone(this.layer,4)},
            effectDescription() {
                return "Reward: Add a new boost to Duplicates<br>"
            },
            style: {'width': '750px'},
            effect(){
                return player.D.duplicates.pow(11).max(1)
            }
        },
        6: {
            requirementDescription: "Require : 2e166 Duplicates (7)",
            done() { return new Decimal(player.D.duplicates || 0).gte("2e166")},
            unlocked(){return hasMilestone(this.layer,6)},
            effect() {
                let A = getUpgradeCount('A')
                let B = getUpgradeCount('B')
                let G = getUpgradeCount('G')
                let D = getUpgradeCount('D')
                let val = A.add(B).add(G).add(D).pow(player.D.resets)
                return val 
            },
            effectDescription() {
                return "Reward: Duplicates gain is boosted by the amount of total upgrades (from A to D layer)^total D Resets<br>"+
                "Currently: "+ format(milestoneEffect(this.layer, this.id))+"x"
            },
            style: {'width': '750px'},
        },
        7: {
            requirementDescription: "Require : 1e615 Duplicates (8)",
            done() { return new Decimal(player.D.duplicates || 0).gte("1e615")},
            unlocked(){return hasMilestone(this.layer,6)},
            effect() {
                let DR = new Decimal(player.D.resets)
                let val = decimalOne
                for (let i = 5; i < DR; i++) {
                    val = val.mul(2) 
                }
                return val
            },
            effectDescription() {
                return "Reward: Keep Beta Milestone on reset now, x5 Bbulk and each milestone-5 boost Demoplex by x2<br>"+
                "Currently: "+ format(milestoneEffect(this.layer, this.id))+"x"
            },
            style: {'width': '750px'},
        },
        8: {
            requirementDescription: "Require : 1e1150 Duplicates (9)",
            done() { return new Decimal(player.D.duplicates || 0).gte("1e9000")},
            unlocked(){return hasMilestone(this.layer,7)},
            effectDescription() {
                return "Reward: Buy Duplicates buyables (1/s) <br>"
            },
            style: {'width': '750px'},
        },
    },
    buyables:{
        rows: 2,
        cols: 4,
        11: {
        title: "Duplications<br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e17") //Basecose
            return base.mul(new Decimal(1.01).pow(x.pow(2)))//base*1.01^x²
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let val = new Decimal(1.5)
            //TEXT//
            let desc = 'x'+val+' to Duplicates gain<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' Duplicates \n'
            let bonus = hasUpgrade('D', 32) ? getBuyableAmount('D', 12) : decimalZero
            bonus = bonus.add(hasUpgrade('D', 34) ? getBuyableAmount('D', 13) : decimalZero)
            bonus = bonus.add(hasUpgrade('D',126) ? getBuyableAmount('D',14) : decimalZero)
            return desc + cost + buyableArrangement(this.layer, this.id, 55,  {bonusAmount: bonus})
        },
        canAfford() {
            let data = player[this.layer]
            if (!data) return false
            data.duplicates = new Decimal(data.duplicates || 0)
            return data.duplicates.gte(this.cost())
        },
        unlocked() {return hasUpgrade('D',24)},
        buy() {
            if (!safeBuy(this.layer, this.cost(), "duplicates")) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            let oeff = new Decimal(1.5)
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('D', 32)) y = getBuyableAmount('D', 12)
            if (hasUpgrade('D', 34)) y = y.add(getBuyableAmount('D', 13))
            if (hasUpgrade('D',126)) y = y.add(getBuyableAmount('D',14))
            x = x.add(y)
            return oeff.pow(x)},
        },
        12: {
        title: "Duplicanations<br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("2.5e30") //Basecose
            return base.mul(new Decimal(1.12).pow(x.pow(2)))//base*1.12^x²
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let val = new Decimal(2.75)
            //TEXT//
            let desc = 'x'+val+' to Duplicates gain<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' Duplicates \n'
            let bonus = hasUpgrade('D', 34) ? getBuyableAmount('D', 13) : decimalZero
            bonus = bonus.add(hasUpgrade('D',126) ? getBuyableAmount('D',14) : decimalZero)
            return desc + cost + buyableArrangement(this.layer, this.id, 32, {bonusAmount: bonus})
        },
        canAfford() {
            let data = player[this.layer]
            if (!data) return false
            data.duplicates = new Decimal(data.duplicates || 0)
            return data.duplicates.gte(this.cost())
        },
        unlocked() {return getBuyableAmount(this.layer,11).gte(new Decimal(55))},
        buy() {
            if (!safeBuy(this.layer, this.cost(), "duplicates")) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            let oeff = new Decimal(2.75)
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('D', 34)) y = getBuyableAmount('D', 13)
            if (hasUpgrade('D',126)) y = y.add(getBuyableAmount('D',14))
            x = x.add(y)
            return oeff.pow(x)},
        },
        13: {
        title: "Duplifications<br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e80") //Basecose
            let power = 2.25
            if (hasUpgrade('D',212)) power = new Decimal(2.1)
            return base.mul(new Decimal(2.5).pow(x.pow(power)))//base*2.5^x^2.25
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let val = new Decimal(6)
            //TEXT//
            let desc = 'x'+val+' to Duplicates gain<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' Duplicates \n'
            let bonus = hasUpgrade('D',126) ? getBuyableAmount('D',14) : decimalZero
            return desc + cost + buyableArrangement(this.layer, this.id, 19, {bonusAmount: bonus})
        },
        canAfford() {
            let data = player[this.layer]
            if (!data) return false
            data.duplicates = new Decimal(data.duplicates || 0)
            return data.duplicates.gte(this.cost())
        },
        unlocked() {return getBuyableAmount(this.layer,12).gte(new Decimal(32))},
        buy() {
            if (!safeBuy(this.layer, this.cost(), "duplicates")) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            let oeff = new Decimal(6)
            //Y
            let y = new Decimal(0)
            if (hasUpgrade('D',126)) y = getBuyableAmount('D',14)
            x = x.add(y)
            return oeff.pow(x)},
        },
        14: {
        title: "Duplificatanations<br>",
        cost(x) {
            if (x === undefined) x = getBuyableAmount(this.layer, this.id)
            x = new Decimal(x)

            const base = new Decimal("1e375") //Basecose
            return base.mul(new Decimal(5).pow(x.pow(2.25)))//base*5^x^2.25
        },
        display() {
            let amt = getBuyableAmount(this.layer, this.id)
            let val = new Decimal(35)
            //TEXT//
            let desc = 'x'+val+' to Duplicates gain<br>'
            let cost = '<b>Cost:</b>'+ format(this.cost()) + ' Duplicates \n'
            return desc + cost + buyableArrangement(this.layer, this.id, null)
        },
        canAfford() {
            let data = player[this.layer]
            if (!data) return false
            data.duplicates = new Decimal(data.duplicates || 0)
            return data.duplicates.gte(this.cost())
        },
        unlocked() {return getBuyableAmount(this.layer,13).gte(new Decimal(19))},
        buy() {
            if (!safeBuy(this.layer, this.cost(), "duplicates")) return
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            x = new Decimal(x)
            let oeff = new Decimal(35)
            return oeff.pow(x)},
        },
    },
})