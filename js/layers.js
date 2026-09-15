addLayer("ap", {
    name: "Addition", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Addition points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(0.6)
        if (hasMilestone('sp', 1)) exp = exp.add(0.1)
        if (hasAchievement('ach', 62) && hasMilestone('sp', 1) && inChallenge('lp', 11)) exp = exp.add(0.4)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasMilestone('sp', 1)) mult = mult.mul(2)
        if (hasAchievement('ach', 62) && hasMilestone('sp', 1) && inChallenge('lp', 11)) mult = mult.mul(6)
        if (hasAchievement('ach', 22)) mult = mult.mul(1.5)
        if (hasUpgrade('mp', 12)) mult = mult.mul(2)
        if (player.dp.unlocked && player.dp.points.gte(1)) mult = mult.div(tmp.dp.effect)
        if (hasUpgrade('mp', 22)) mult = mult.mul(upgradeEffect('mp', 22))
        if (inChallenge('dp', 21) || inChallenge('dp', 22)) mult = mult.div(tmp.dp.challenges[21].effect)
        if (hasUpgrade('lp', 14)) mult = mult.mul(new Decimal(1.5).pow(player.ap.upgrades.length))
        if (mult.lte(1) && !hasUpgrade('ap', 11)) mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let eff = new Decimal(1)
        if (hasUpgrade('ep', 12)) eff = eff.mul(upgradeEffect('ep', 12))
        if (hasUpgrade('ep', 22)) eff = eff.mul(upgradeEffect('ep', 22))
        if (player.rp.unlocked) eff = eff.div(tmp.rp.effect)
        if (inChallenge('lp', 11)) eff = eff.div(2)
        return eff
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "a: Reset for Addition points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer){
        let keep = [];
        if (hasMilestone('ep', 0) && (resettingLayer=='mp' || resettingLayer=='dp')) keep.push('upgrades')
        if (hasMilestone('ep', 9) && (resettingLayer=='ep' || resettingLayer=='rp'))keep.push('upgrades')
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    passiveGeneration() {
        let eff = new Decimal(0)
        if (hasMilestone('ep', 2)) eff = eff.add(0.1)
        eff = eff.mul(tmp.mp.buyables[11].effect)
        if (inChallenge('dp', 31) || inChallenge('lp', 11)) eff = new Decimal (0)
        return eff
    },
    softcap() {
        let stp = new Decimal(1e35)
        return stp
    },
    softcapPower() {
        let stp = new Decimal(0.15)
        return stp
    },

    layerShown(){return true},

    // My upgrades

    upgrades: {
        11: {
            title: "Add by 1",
            effect(){
                let eff = new Decimal(1)
                if (hasUpgrade("ap", 31)) eff = eff.add(upgradeEffect('ap', 31))
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (hasMilestone('mp', 1)) eff = eff.mul(tmp.mp.milestones[1].effect)
                if (hasUpgrade('mp', 33)) eff = eff.mul(upgradeEffect('mp', 33))
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Increase point gain by " +format(tmp.ap.upgrades[11].effect)},
            cost: new Decimal(1),
        },
        12: {
            title: "Add by 2",
            effect(){
                let eff = new Decimal(2)
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (hasUpgrade('ep', 11)) eff = eff.pow(upgradeEffect('ep', 11))
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Increase point gain by " +format(tmp.ap.upgrades[12].effect)},
            cost: new Decimal(1),
            unlocked() {return hasUpgrade("ap", 11)},
        },
        13: {
            title: "Add by 3",
            effect(){
                let eff = new Decimal(3)
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (hasAchievement('ach', 62)) eff = eff.mul(2)
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Increase point gain by " +format(tmp.ap.upgrades[13].effect)},
            cost: new Decimal(3),
            unlocked() {return hasUpgrade("ap", 12)},
        },
        14: {
            title: "Inverse operation",
            description: "Unlock Subtraction points",
            cost() {
                let c = new Decimal(5)
                if (hasUpgrade('mp', 14)) c = new Decimal(0)
                    return c
            },
            unlocked() {return hasUpgrade("ap", 13)},
        },
        21: {
            title: "Add by 5",
            effect(){
                let eff = new Decimal(5)
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (inChallenge('dp', 21) || inChallenge('dp', 22)) eff = eff.div(tmp.dp.challenges[21].effect)
                if (hasUpgrade('mp', 33)) eff = eff.mul(upgradeEffect('mp', 33))
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Increase point gain by " +format(tmp.ap.upgrades[21].effect)},
            cost: new Decimal(10),
            unlocked() {return (hasMilestone("sp", 0) && hasUpgrade("ap", 14)) || hasUpgrade('ap', 21)},
        },
        22: {
            title: "Add by Points",
            description: "Increase point gain based on itself at a reduced rate",
            cost: new Decimal(15),
            effect() {
                let base = player.points.add(1)

                let power = new Decimal(0.15)
                if (hasMilestone('sp', 3)) power = power.add(0.05)

                let eff = base.pow(power).mul(5)
                if (hasUpgrade('ap', 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (hasMilestone('sp', 3)) eff = eff.mul(1.5)
                if (inChallenge('dp',21) || inChallenge('dp', 22)) eff = eff.div(tmp.dp.challenges[21].effect)
                if (eff.gte(100000)) {
                    eff = eff.sub(100000)
                    let logbase = new Decimal(6)
                    if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                    if (logbase.lte(2)) logbase = new Decimal(2)
                    eff = eff.log(logbase)
                    eff = eff.pow(6)
                    eff = eff.add(100000)
                }
                if (hasMilestone('ep', 4)) eff = eff.pow(tmp.ep.milestones[4].effect)
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            effectDisplay(){ return "+" +format(tmp.ap.upgrades[22].effect)},
            unlocked() {return hasUpgrade("ap", 21)},
        },
        23: {
            title: "Add by Addition Points",
            description: "Increase point gain based on Addition Points at a reduced rate",
            cost: new Decimal(20),
            effect() {

                let pow = new Decimal(0.4)
                if (hasUpgrade('ap', 33)) pow = pow.add(0.2)

                let eff = Decimal.pow(player.ap.points.mul(0.25).add(1), pow)
                if (hasUpgrade('ap', 33)) eff = eff.add(4).mul(1.4)
                eff = eff.mul(4)

                if (eff.gt(150)){
                    neff = new Decimal(150)
                    eff = eff.add(-150)
                    neff = neff.add(Decimal.pow(eff, 0.6))
                    eff = neff
                }
                if (hasUpgrade('ap', 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (inChallenge('dp',21) || inChallenge('dp', 22)) eff = eff.div(tmp.dp.challenges[21].effect)
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                
                //Actual
                if (hasUpgrade('lp', 41) && eff.lte(player.ap.points)) eff = player.ap.points
                return eff
            },
            effectDisplay(){ return "+" +format(tmp.ap.upgrades[23].effect)},
            unlocked() {return hasUpgrade("ap", 22)},
        },
        24: {
            title: "Add by 8",
            effect(){
                let eff = new Decimal(8)
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (inChallenge('dp',21) || inChallenge('dp', 22)) eff = eff.div(tmp.dp.challenges[21].effect)
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Increase point gain by " +format(tmp.ap.upgrades[24].effect)},
            cost: new Decimal(30),
            unlocked() {return hasUpgrade("ap", 23)},
        },
        31: {
            title: "Return to the first",
            effect() {
                let eff = new Decimal(9)
                if (hasUpgrade('mp', 33)) eff = eff.mul(upgradeEffect('mp', 33))
                if (hasUpgrade('lp', 14) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Upgrade 1's effect is increased by " +format(upgradeEffect('ap', 31))},
            cost: new Decimal(80),
            unlocked() {return (hasMilestone("sp", 1) && hasUpgrade('ap', 24)) || hasUpgrade('ap', 31)},
        },
        32: {
            title: "Add by Subtraction Points",
            description: "Increase point gain based on Subtraction points at an increased rate",
            cost: new Decimal(100),
            effect() {
                let eff = Decimal.pow(player.sp.points, 2).mul(2)
                if (hasUpgrade("ap", 34)) eff = eff.add(upgradeEffect('ap', 34))
                if (hasUpgrade('ep', 32) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            effectDisplay(){ return "+" +format(tmp.ap.upgrades[32].effect)},
            unlocked() {return hasUpgrade("ap", 31)},
        },
        33: {
            title: "Addition adds more",
            description: "Improve the seventh Addition upgrade formula",
            cost: new Decimal(120),
            unlocked() {return hasUpgrade('ap', 32)},
        },
        34: {
            title: "Super boost",
            effect() {
                let eff = new Decimal(12)
                if (hasMilestone('mp', 3)) eff = eff.mul(tmp.mp.milestones[3].effect)
                if (hasUpgrade('mp', 34)) eff = eff.mul(upgradeEffect('mp', 34))
                if (hasUpgrade('lp', 14) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('ep', 32))
                return eff
            },
            description() { return "Every previous 'Add by' upgrade has its effect increased by  " +format(tmp.ap.upgrades[34].effect)},
            cost: new Decimal(200),
            unlocked() {return hasUpgrade('ap', 33)},
        },
    },

})

addLayer("sp", {
    name: "Subtraction", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#f01e2c",
    requires: new Decimal(7), // Can be a function that takes requirement increases into account
    resource: "Subtraction points", // Name of prestige currency
    baseResource: "Addition points", // Name of resource prestige is based on
    baseAmount() {return player.ap.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    resetsNothing: true,
    branches: ["ap"],
    autoPrestige() {
        return hasMilestone('mp', 2) && player.sp.auto
    },
    unlocked() {
        return hasUpgrade('ap', 14)
    },
    doReset(resettingLayer){
        let keep = [];
        if (hasMilestone('ep', 1) && (resettingLayer=='mp' || resettingLayer=='dp')) keep.push('milestones')
        if (hasMilestone('ep', 9) && (resettingLayer=='ep' || resettingLayer=='rp'))keep.push('milestones')
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    canBuyMax() {return hasAchievement('ach', 43)},
    canReset() {
        let canMax = false
        let amt = player.sp.points.plus((canMax&&tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt))?tmp[this.layer].resetGain:0).div(tmp[this.layer].directMult)
		let extraCost = Decimal.pow(tmp[this.layer].base, amt.pow(tmp[this.layer].exponent).div(tmp[this.layer].gainExp)).times(tmp[this.layer].gainMult)
		let cost = extraCost.times(tmp[this.layer].requires).max(tmp[this.layer].requires)
        return hasUpgrade('ap', 14) && player.ap.points.gte(cost)
    },
    effect() {

        // Base
        let base = new Decimal (player.sp.points)

        // Power
        let power = new Decimal(3)

        let eff = 0
        if (base.lte(30)) {
            eff = base.pow(power)
        }
        else {
            eff = new Decimal(30).pow(power)
            base = base.sub(30)
            eff = eff.mul(base.pow(power.mul(2.75)))
            eff = eff.mul(5)
        }
        if (hasUpgrade('dp', 11)) eff = eff.div(upgradeEffect('dp', 11))
        if (hasUpgrade('mp', 24)) eff = eff.div(tmp.dp.effect)
        if (hasChallenge('dp', 31)) eff = eff.div(tmp.dp.challenges[31].rewardEffect)
        if (hasUpgrade('rp', 11)) eff = eff.root(upgradeEffect('rp', 11))
        if (hasUpgrade('lp', 21)) eff = eff.add(1).log(2).pow(2)
        return eff
    },
    effectDescription() {
        return "which are reducing point gain by " + colorText("h2", "red", format(tmp.sp.effect))
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(0.0075)
        if (hasChallenge('dp', 11)) mult = mult.div(tmp.dp.challenges[11].effect)
        return mult
    },
    directMult() {
        let dmult = new Decimal(1)
        return dmult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let eff = new Decimal(0.1)
        if (inChallenge('lp', 11) && !hasUpgrade('lp', 13)) eff = eff.div(2)
        return eff
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "s: Reset for Subtraction points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        let shown = hasUpgrade('ap', 14) || (player.sp.unlocked)
        return shown
    },

    // My milestones

    milestones: {
        0: {
            requirementDescription: "1 Subtraction point",
            effectDescription: "Unlock a new row of Addition upgrades",
            done() {return player.sp.points.gte(1)}
        },
        1: {
            requirementDescription: "2 Subtraction points",
            effectDescription: "Unlock a new row of Addition upgrades. Buff the Addition gain formula",
            done() {return player.sp.points.gte(2)},
            unlocked() {return hasMilestone('sp', 0)}
        },
        2: {
            requirementDescription: "3 Subtraction points",
            effectDescription: "Unlock the Multiplication Layer",
            done() {return player.sp.points.gte(3)},
            unlocked() {return hasMilestone('sp', 1)}
        },
        3: {
            requirementDescription: "4 Subtraction points",
            effect() {
                let base = player.sp.points
                let power = new Decimal(0.4)
                let eff = base.pow(power)
                eff = eff.sub(1)
                if (player.sp.points.gte(30)) {
                    nsp = player.sp.points.sub(29)
                    eff = eff.mul(nsp)
                }
                if (hasUpgrade('lp', 42) && player.sp.points.gt(eff)) eff = player.sp.points
                return eff
            },
            effectDescription() { return "Buff the sixth Addition upgrade. Subtraction points reduce division nerf by " +format(tmp.sp.milestones[3].effect)},
            done() {return player.sp.points.gte(4) && hasUpgrade('dp', 14)},
            unlocked() {return hasUpgrade('dp', 14) && hasMilestone('sp', 2)}
        },
    },
})

addLayer("mp", {
    name: "Multiplication",
    symbol: "M",
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "orange",
    requires: new Decimal(3), // Can be a function that takes requirement increases into account
    resource: "Multiplication points", // Name of prestige currency
    baseResource: "Subtraction points", // Name of resource prestige is based on
    baseAmount() {return player.sp.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    branches: ["sp"],
    unlocked() {
        return hasMilestone('sp', 2)
    },
    effect() {

        // Base
        let base = new Decimal(player.mp.points)
        if (hasUpgrade('mp', 32)) base = base.mul(1.5)
        // Power
        let power = new Decimal(0.3)
        if (hasUpgrade('mp', 32)) power = power.add(0.3)
        let eff = base.pow(power)
        if (hasUpgrade('mp', 32)) eff = eff.mul(upgradeEffect('mp', 32))
        eff = eff.add(1)

        return eff
    },
    effectDescription() {
        return "which are multiplying points by " + colorText("h2", "orange", format(tmp.mp.effect))
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasMilestone('mp', 0)) mult = mult.mul(1.2)
        if (hasAchievement('ach', 32)) mult = mult.mul(1.1)
        if (hasUpgrade('mp', 23)) mult = mult.mul(upgradeEffect('mp', 23))
        if (hasAchievement('ach', 64)) mult = mult.mul(new Decimal(1.25).pow(player.mp.upgrades.length))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(3)
        if (hasUpgrade('ep', 14)) exp = exp.mul(upgradeEffect('ep', 14))
        if (player.rp.unlocked) exp = exp.div(tmp.rp.effect)
        if (inChallenge('lp', 11)) exp = exp.div(hasMilestone('ep', 12)? 1.5:2)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer){
        let keep = [];
        keep.push('buyables')
        if (hasMilestone('rp', 0) && (resettingLayer=='ep' || resettingLayer=='rp')) keep.push('milestones')
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },

    layerShown(){return player.mp.unlocked || hasMilestone('sp', 2)},
    hotkeys: [
        {key: "m", description: "m: Reset for Multiplication points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    softcap() {
        let stp = new Decimal(1e14)
        return stp
    },
    softcapPower() {
        let stp = new Decimal(0.2)
        return stp
    },
    
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "milestones"
            ]
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "buyables"
            ],
            unlocked() {return hasMilestone('ep', 2)}
        },
    },


    milestones: {
        0: {
            requirementDescription: "1 total Multiplication point",
            effect(){
                let eff = new Decimal(1.2)
                if (hasUpgrade('ep', 11)) eff = eff.pow(upgradeEffect('ep', 11))
                if (hasMilestone('ep', 11)) eff = eff.pow(2)
                return eff
            },
            effectDescription() {return "Multiply Multiplication points by " + format(tmp.mp.milestones[0].effect)},
            done() {return player.mp.total.gte(1)}
        },
        1: {
            requirementDescription: "2 total Multiplication points",
            effect(){
                let eff = new Decimal(2)
                if (hasUpgrade('ep', 11)) eff = eff.pow(upgradeEffect('ep', 11))
                return eff
            },
            effectDescription() {return "Multiply Addition upgrade 1's effect by " + format(tmp.mp.milestones[1].effect)},
            done() {return player.mp.total.gte(2)},
            unlocked() {return hasMilestone('mp', 0)}
        },
        2: {
            requirementDescription: "5 total Multiplication points",
            effectDescription: "Automatically reset for subtraction points",
            toggles: [['sp', 'auto']],
            done() {return player.mp.total.gte(5)},
            unlocked() {return hasMilestone('mp', 1)}
        },
        3: {
            requirementDescription: "20 total Multiplication points",
            effect() {
                let eff = new Decimal(1.5)
                if (hasMilestone('ep', 11)) eff = eff.pow(2)
                return eff
            },
            effectDescription() {return "Multiply 'Super boost' effect by " + format(tmp.mp.milestones[3].effect)},
            done() {return player.mp.total.gte(20)},
            unlocked() {return hasMilestone('mp', 2)}
        },
        4: {
            requirementDescription: "75 total Multiplication points",
            effectDescription: "Buff the sixth Multiplication upgrade",
            done() {return player.mp.total.gte(75) && hasUpgrade('mp', 22)},
            unlocked() {return hasMilestone('mp', 3) && hasUpgrade('mp', 22)}
        },
        5: {
            requirementDescription: "5,000 total Multiplication points",
            effectDescription: "Unlock Exponentiation",
            done() {return player.mp.total.gte(5000)},
            unlocked() {return hasMilestone('mp', 4)}
        },
        6: {
            requirementDescription: "100,000,000 total Multiplication points",
            effect() {
                let base = upgradeEffect('mp', 23)
                let power = new Decimal(0.4)
                let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.div(1.75)
                eff = eff.add(1)
                return eff
            },
            effectDescription() {return "'Multiply by MP affects EP at a reduced rate. <br> Currently: x" + format(tmp.mp.milestones[6].effect)},
            done() {return player.mp.total.gte(1e8)},
            unlocked() {return hasMilestone('mp', 5) && hasUpgrade('ep', 24)}
        },

    },

    upgrades: {
        11: {
            title: "Multiply by 1",
            effect(){
                let eff = new Decimal(1)
                if (hasUpgrade('mp', 31)) eff = eff.mul(upgradeEffect('mp', 31))
                if (hasMilestone('ep', 8)) eff = eff.mul(tmp.ep.milestones[8].effect)
                if (hasMilestone('ep', 7)) eff = eff.pow(tmp.ep.milestones[7].effect)
                return eff
            },
            description() { return "Multiply point and Addition point (AP) gain by " +format(tmp.mp.upgrades[11].effect)},
            cost: new Decimal(1),
        },
        12: {
            title: "Multiply by 2",
            effect(){
                let eff = new Decimal(2)
                if (hasUpgrade('mp', 31)) eff = eff.mul(upgradeEffect('mp', 31))
                if (hasMilestone('ep', 4)) eff = eff.pow(tmp.ep.milestones[4].effect)
                if (hasUpgrade('ep', 31)) eff = eff.pow(upgradeEffect('ep', 31))
                return eff
            },
            description() { return "Multiply point and AP gain by " +format(tmp.mp.upgrades[12].effect)},
            cost: new Decimal(2),
            unlocked() {return hasUpgrade('mp', 11)}
        },
        13: {
            title: "Multiply by 3",
            effect(){
                let eff = new Decimal(3)
                if (hasUpgrade('mp', 31)) eff = eff.mul(upgradeEffect('mp', 31))
                if (hasUpgrade('ep', 13)) eff = eff.pow(upgradeEffect('ep', 13))
                return eff
            },
            description() { return "Multiply point gain by " +format(tmp.mp.upgrades[13].effect)},
            cost: new Decimal(3),
            unlocked() {return hasUpgrade('mp', 12)}
        },
        14: {
            title: "Inverse Operation+",
            description() { return "Unlock Division points. 'Inverse Operation' cost is 0"},
            cost: new Decimal(6),
            unlocked() {return hasUpgrade('mp', 13)}
        },
        21: {
            title: "Less of a nerf",
            description() { return "Division upgrade 2 is based on total division points"},
            cost: new Decimal(8),
            unlocked() {return hasUpgrade('dp', 14) && hasUpgrade('mp', 14)}
        },
        22: {
            title: "Multiply by Points",
            effect(){
                let base = player.points.add(1)

                let logbase = new Decimal(10)
                if (hasMilestone('mp', 4)) logbase = logbase.sub(2)
                if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let eff = base.log(logbase)
                eff = eff.div(3)
                if (hasUpgrade('mp', 31)) eff = eff.mul(upgradeEffect('mp', 31))
                eff = eff.add(1)
                return eff
            },
            description() { return "Unlock a Multiplication milestone and multiply AP gain based on points at a reduced rate"},
            effectDisplay() {return "x" +format(upgradeEffect('mp', 22))},
            cost: new Decimal(15),
            unlocked() {return hasUpgrade('mp', 21)}
        },
        23: {
            title: "Multiply by MP",
            effect(){
                let base = player.mp.points.add(1)

                let power = new Decimal(0.2)

                let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.div(5)
                if (hasUpgrade('mp', 31)) eff = eff.mul(upgradeEffect('mp', 31))
                eff = eff.add(1)
                if (eff.gte(10)) {
                    eff = eff.sub(9)
                    eff = eff.pow(0.5)
                    eff = eff.add(9)
                }

                return eff
            },
            description() { return "Multiply MP gain based on itself at a heavily reduced rate"},
            effectDisplay() {return "x" +format(upgradeEffect('mp', 23))},
            cost: new Decimal(20),
            unlocked() {return hasUpgrade('mp', 22)}
        },
        24: {
            title: "Inverse Operation+++",
            description() { return "Unlock Division challenges. The subtraction nerf is divided by the division nerf"},
            cost: new Decimal(30),
            unlocked() {return hasUpgrade('mp', 23)}
        },
        31: {
            title: "Super boost 2",
            effect() {
                let eff = new Decimal(3)
                if (inChallenge('lp', 11) && hasMilestone('ep', 13)) eff = eff.pow(3)
                return eff
            },
            description() { return "Every previous 'Multiply by' upgrade has its effect multiplied by " +format(upgradeEffect('mp', 31))},
            cost: new Decimal(50),
            unlocked() {return hasUpgrade('mp', 24) && hasChallenge('dp', 22)}
        },
        32: {
            title: "Multiply by MP more",
            effect() {
                let base = player.mp.total.add(1)
                let power = new Decimal(0.2)
                let eff = base.pow(power)
                eff = eff.mul(1.5)
                if (hasUpgrade('lp', 43) && eff.lte(player.mp.points)) eff = player.mp.points
                return eff
            },
            description() { return "MP effect formula is buffed and it is boosted based on total MP"},
            effectDisplay() { return "x" +format(upgradeEffect('mp', 32))},
            cost: new Decimal(500),
            unlocked() {return hasUpgrade('mp', 31)}
        },
        33: {
            title: "First column booster",
            effect() {
                let base = player.ap.points.add(1)
                let logbase = new Decimal(8)
                if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                logbase = logbase.div(base.log(100))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let eff = base.log(logbase)
                eff = eff.mul(1.5)
                eff = eff.add(1)
                if (hasMilestone('ep', 3)) eff = eff.pow(tmp.ep.milestones[3].effect)
                return eff
            },
            description() { return "First column of AP upgrades is multiplied based on AP"},
            effectDisplay() { return "x" +format(upgradeEffect('mp', 33))},
            cost: new Decimal(1000),
            unlocked() {return hasUpgrade('mp', 32)}
        },
        34: {
            title: "Super boost boost",
            effect() {
                let base = player.mp.points.add(1)
                let logbase = new Decimal(2)
                let eff = base.log(logbase)
                eff = eff.pow(1.75)
                eff = eff.mul(2)
                eff = eff.add(1)
                if (hasUpgrade('lp', 43)) eff = eff.mul(upgradeEffect('mp', 23))
                if (hasUpgrade('lp', 23) && inChallenge('lp', 11)) eff = eff.pow(upgradeEffect('lp', 23))
                return eff
            },
            description() { return "Multiply 'Super Boost' effect based on total MP"},
            effectDisplay() { return "x" +format(upgradeEffect('mp', 34))},
            cost: new Decimal(1500),
            unlocked() {return hasUpgrade('mp', 33)}
        },
    },


    buyables: {
        11: {
            title: "Multiply passive generation",
            cost(x) { 
                let start = new Decimal(10000)
                let base = new Decimal(10)
                if (hasUpgrade('rp', 13)) base = base.root(upgradeEffect('rp', 13))
                let cost = start.mul(base.pow(x))
                return cost
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(1.5)
                eff = eff.mul(base.pow(x))
                if (hasUpgrade('ep', 31)) eff = eff.pow(upgradeEffect('ep', 31))
                return eff
            },
            purchaseLimit() {
                return new Decimal(10)
            },
            display() {
                return "Multiply Passive AP generation by 1.5 per purchase.\nCost: " + format(tmp.mp.buyables[11].cost) + "\nEffect: x" +format(tmp.mp.buyables[11].effect) + "\nAmount: " +format(getBuyableAmount('mp', 11))+"/" +format(tmp.mp.buyables[11].purchaseLimit)
            },
        },
    },


})

addLayer("dp", {
    name: "Division", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#0E4C92",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "Division points", // Name of prestige currency
    baseResource: "Addition points", // Name of resource prestige is based on
    baseAmount() {return player.ap.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(0.25)
        return exp
    },
    resetsNothing: false,
    branches: ["ap", 'mp'],
    unlocked() {
        return hasUpgrade('mp', 14)
    },
    canReset() {
        return hasUpgrade('mp', 14) && player.ap.points.gte(1000)
    },
    effect() {

        // Base
        let base = new Decimal (player.dp.total)
        base = base.add(1)

        // Power
        let power = new Decimal(0.6)
        let pointy = player.points.add(1)
        if (hasUpgrade('dp', 13)) pointy = pointy.div(upgradeEffect('dp', 13))
        power = power.add((pointy.add(1)).pLog10().div(25))
        let eff = base.pow(power)
        if (player.points.lte(10000)){
            let divi = player.points
            divi = divi.sub(10000).mul(-1)
            eff = eff.sub(1)
            eff = eff.div(divi.log(10).div(2))
            eff = eff.add(1)
        }
        if (hasMilestone('sp', 3)) eff = eff.sub(tmp.sp.milestones[3].effect)
        if (hasChallenge('dp', 12)) eff = eff.div(tmp.dp.challenges[12].rewardEffect)
        if (hasUpgrade('rp', 11)) eff = eff.root(upgradeEffect('rp', 11))
        if (inChallenge('dp', 31)) eff = eff.mul(tmp.dp.challenges[31].effect)
        if (hasChallenge('dp', 31)) eff = eff.div(tmp.dp.challenges[31].rewardEffect)
        if (eff.lte(1)) eff = new Decimal(1)
        if (hasUpgrade('lp', 21)) eff = eff.log(2).pow(2)
        if (eff.lte(1)) eff = new Decimal(1)
        return eff
    },
    effectDescription() {
        return "which are dividing points and AP by " + colorText("h2", "#0E4C92", format(tmp.dp.effect)) + " (boosted by points)"
    },

    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.ep.unlocked && !false) {
            let help = new Decimal(4)
            if (hasAchievement('ach', 42)) help = help.div(1.5)
            help = help.add(((player.dp.points.sub(3200)).pow(2)).mul(-0.000001))
            if (help.gte(1)) mult = mult.mul(help)
            }
        if (hasAchievement('ach', 41)) mult = mult.mul(2)
        if (hasAchievement('ach', 42)) mult = mult.mul(2)
        if (hasMilestone('ep', 6)) mult = mult.mul(2)
        return mult
    },
    directMult() {
        let dmult = new Decimal(1)
        return dmult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let eff = new Decimal(1)
        if (hasUpgrade('ep', 12)) eff = eff.mul(upgradeEffect('ep', 12))
        if (hasMilestone('ep', 6)) eff = eff.mul(1.075)
        if (player.rp.unlocked) eff = eff.div(tmp.rp.effect)
        if (inChallenge('lp', 11)) eff = eff.div(2)
        return eff
    },
    doReset(resettingLayer){
        let keep = [];
        if (hasUpgrade('rp', 14) && (resettingLayer=='ep' || resettingLayer=='rp' || resettingLayer=='lp')) keep.push('challenges')
        if (hasMilestone('ep', 9) && (resettingLayer=='ep' || resettingLayer=='rp'))keep.push('upgrades')
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "d: Reset for Division points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    softcap() {
        let stp = new Decimal(1e13)
        return stp
    },
    softcapPower() {
        let stp = new Decimal(0.3)
        return stp
    },
    layerShown(){
        let shown = hasUpgrade('mp', 14) || (player.dp.unlocked)
        return shown
    },
    passiveGeneration() {
        let eff = new Decimal(0)
        let cap = new Decimal(10000)
        if (hasMilestone('rp', 1)) cap = cap.mul(100)
        if (hasMilestone('ep', 10)) cap = cap.mul(10)
        if (hasMilestone('ep', 11)) cap = cap.mul(1000)
        if (hasMilestone('ep', 12)) cap = cap.mul(1000)
        if (hasMilestone('ep', 13)) cap = cap.mul(1000)
        if (hasMilestone('ep', 14)) cap = cap.mul(1000)
        if (player.dp.points.lte(cap) && tmp.dp.canReset && !inChallenge('lp', 11)) {
            if (hasMilestone('ep', 0)) eff = eff.add(0.01)
            if (hasMilestone('rp', 2)) eff = eff.add(0.04)
            if (hasMilestone('ep', 10) && hasUpgrade('mp', 34)) eff = eff.add(0.95)
        }
        return eff
    },

    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "upgrades"
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "challenges"
            ],
            unlocked() {return hasUpgrade('mp', 24) || hasUpgrade('rp', 14)}
        },
    },

    upgrades: {
        11: {
            title: "Divide by 1.25",
            effect() {
                let eff = new Decimal(1.25)
                if (hasChallenge('dp', 21)) eff = eff.mul(tmp.dp.challenges[21].rewardEffect)
                return eff
            },
            description() { return "Divide Subtraction points nerf by " +format(tmp.dp.upgrades[11].effect)},
            cost: new Decimal(1),
        },
        12: {
            title: "Divide by division",
            effect() {
                let base = player.dp.points.add(1)
                if (hasUpgrade('mp', 21)) base = player.dp.total

                let power = new Decimal(0.2)

                let eff =  base.pow(power)
                if (hasChallenge('dp', 21)) eff = eff.mul(tmp.dp.challenges[21].rewardEffect)

                return eff
            },
            description() { return "Divide Subtraction points nerf by divison points at a reduced rate"},
            effectDisplay() {return '/' +format(tmp.dp.upgrades[12].effect)},
            cost: new Decimal(1),
            unlocked() {return hasUpgrade('dp', 11)}
        },
        13: {
            title: "Divide by division again",
            effect() {
                let base = new Decimal(player.dp.total).add(4)
                base = base.mul(player.dp.points.pow(0.5).add(1))
                let power = new Decimal(3)
                let eff = base.pow(power)
                eff = eff.mul(5)
                if (hasChallenge('dp', 21)) eff = eff.mul(tmp.dp.challenges[21].rewardEffect)
                if (hasUpgrade('ep', 13)) eff = eff.pow(upgradeEffect('ep', 13))
                return eff
                
            },
            description() {return "Divide effective points in division nerf based on division points"},
            effectDisplay() {return '/' +format(tmp.dp.upgrades[13].effect)},
            cost: new Decimal(3),
            unlocked() {return hasUpgrade('dp', 12)}
        },
        14: {
            title: "Inverse operation++",
            description: "Unlock a new row of Multiplication upgrades and a Subtraction milestone",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade('dp', 13)}
        }
    },

    challenges: {
        11: {
            name: "Divide by 50",
            challengeDescription: "Divide point gain by 50",
            requirement() {
                let req = new Decimal(300)
                if (hasUpgrade('rp', 12)) req = req.root(upgradeEffect('rp', 12))
                return req
            },
            canComplete() {
                return player.ap.points.gte(tmp.dp.challenges[11].requirement)
            },
            goalDescription() {return "Get "+format(tmp.dp.challenges[11].requirement)+" Addition points"},
            effect() {
                let eff = new Decimal(3)
                if (hasMilestone('ep', 1)) eff = eff.pow(tmp.ep.milestones[1].effect)
                return eff
            },
            rewardDescription() {return  "Divide Subtraction requirement by " + format(tmp.dp.challenges[11].effect)},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
            },
            unlocked() {return hasUpgrade('mp', 24) || hasChallenge('dp', 11)}
        },
        12: {
            name: "Divide by points",
            effect() {
                let base = player.points.add(1)
                let power = new Decimal(0.65)
                let eff = base.pow(power)
                return eff
            },
            requirement() {
                let req = new Decimal(4)
                if (hasUpgrade('rp', 12)) req = req.root(upgradeEffect('rp', 12))
                return req
            },
            challengeDescription() {return "Divide Point gain based on itself by /" +format(tmp.dp.challenges[12].effect)},
            canComplete() {
                return player.sp.points.gte(tmp.dp.challenges[12].requirement)
            },
            goalDescription() {return "Get "+format(tmp.dp.challenges[12].requirement)+" Subtraction points"},
            rewardEffect() {
                let base = player.mp.points.add(1)
                let power = new Decimal(0.25)
                let eff = base.pow(power)
                eff = eff.div(1.5)
                if (hasMilestone('ep', 1)) eff = eff.pow(tmp.ep.milestones[1].effect)
                return eff
            },
            rewardDescription: "Divide Division nerf based on Multiplication points",
            rewardDisplay() { return "/" + format(tmp.dp.challenges[12].rewardEffect)},
            unlocked() {return hasChallenge('dp', 11)},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
            },
        },
        21: {
            name: "Divide by AP",
            effect() {
                let base = player.ap.total.add(1)
                let power = new Decimal(0.4)
                let eff = base.pow(power)
                return eff
            },
            challengeDescription() {return "Divide AP gain and 2nd row of AP upgrades based on total AP by /" +format(tmp.dp.challenges[21].effect)},
            requirement() {
                let req = new Decimal(3)
                if (hasUpgrade('rp', 12)) req = req.root(upgradeEffect('rp', 12))
                return req
            },
            canComplete() {
                return player.sp.points.gte(tmp.dp.challenges[21].requirement)
            },
            goalDescription() {return "Get "+format(tmp.dp.challenges[21].requirement)+" Subtraction points"},
            rewardEffect() {
                let base = player.sp.points.add(1)
                let power = new Decimal(0.75)
                let eff = base.pow(power)
                if (hasUpgrade('ep', 23)) eff = eff.pow(upgradeEffect('ep', 23))
                return eff
            },
            rewardDescription: "Divide the first three Division upgrades' effects based on SP",
            rewardDisplay() { return "/" + format(tmp.dp.challenges[21].rewardEffect)},
            unlocked() {return hasChallenge('dp', 12)},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
            }
        },
        22: {
            name: "Divide by all",
            challengeDescription() {return "Trapped in all previous challenges"},
            requirement() {
                let req = new Decimal(50)
                if (hasUpgrade('rp', 12)) req = req.root(upgradeEffect('rp', 12))
                return req
            },
            canComplete() {
                return player.ap.total.gte(tmp.dp.challenges[22].requirement)
            },
            goalDescription() {return "Get "+format(tmp.dp.challenges[22].requirement)+" total Addition points"},
            rewardDescription: "Unlock a new row of Multiplication upgrades",
            unlocked() {return hasChallenge('dp', 21)},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
            }
        },
        31: {
            name: "Divide by MP",
            effect() {
                let base = player.mp.total.add(1)
                let power = new Decimal(0.8)
                let eff = base.pow(power)
                eff = eff.mul(4)
                return eff
            },
            requirement() {
                let req = new Decimal(1e13)
                if (hasUpgrade('rp', 12)) req = req.root(upgradeEffect('rp', 12))
                return req
            },
            challengeDescription() {return "Increase Division nerf by x" +format(tmp.dp.challenges[31].effect)+ " based on MP. Disable passive AP generation."},
            canComplete() {return player.ap.points.gte(tmp.dp.challenges[31].requirement)},
            goalDescription() {return "Get "+format(tmp.dp.challenges[31].requirement)+" Addition points"},
            rewardEffect() {
                let base = player.rp.points.add(1)
                base = base.mul(1.5)
                let power = new Decimal(0.5)
                let eff = base.pow(power)
                return eff
            },
            rewardDescription: "Divide Subtraction, Division, and Root nerfs by RP at a reduced rate",
            rewardDisplay() { return "/" + format(tmp.dp.challenges[31].rewardEffect)},
            unlocked() {return hasChallenge('dp', 22) && hasUpgrade('ep', 24)},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
            }
        },
    },
})

addLayer('ep', {
    name: "Exponentiation",
    symbol: "E",
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "green",
    requires: new Decimal(200), // Can be a function that takes requirement increases into account
    resource: "Exponent points", // Name of prestige currency
    baseResource: "Division points", // Name of resource prestige is based on
    baseAmount() {return player.dp.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    branches: ["dp"],
    unlocked() {
        return hasMilestone('mp', 5)
    },
    canReset() {
        return player.dp.points.gte(200) //&& (hasMilestone('mp', 5) || !player.tp.unlocked) Change this once Tetration added
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasAchievement('ach', 44)) mult = mult.mul(1.5)
        if (hasMilestone('mp', 6)) mult = mult.mul(tmp.mp.milestones[6].effect)
        if (hasMilestone('ep', 6)) mult = mult.mul(1.4)
        return mult
    },
    directMult() {
        let dmult = new Decimal(1)
        return dmult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let eff = new Decimal(1)
        if (hasMilestone('ep', 5)) eff = eff.mul(tmp.ep.milestones[5].effect)
        if (hasMilestone('ep', 6)) eff = eff.mul(1.1)
        return eff
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "e: Reset for Exponent points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    softcap() {
        let stp = new Decimal(1e9)
        return stp
    },
    softcapPower() {
        let stp = new Decimal(0.3)
        return stp
    },
    doReset(resettingLayer){
        let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    layerShown(){
        let shown = hasMilestone('mp', 5) || (player.ep.unlocked)
        return shown
    },

    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "milestones"
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "buyables"
            ],
            unlocked() {return hasUpgrade('ep', 34)}
        },
    },

    upgrades: {
        11: {
            title: "Squaring",
            effect() {
                let eff = new Decimal(2)
                if (hasMilestone('ep', 2)) eff = eff.mul(1.25)
                if (hasMilestone('rp', 2)) eff = eff.mul(tmp.rp.milestones[2].effect)
                return eff
            },
            description() {return "Raise the second addition upgrade and first two multiplication milestones by " +format(upgradeEffect('ep', 11))},
            cost: new Decimal(1),
            unlocked() {return true}
        },
        12: {
            title: "Power boost",
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(tmp.ep.buyables[11].effect)
                return eff
            },
            description() {return "Raise points, AP, and DP by " +format(upgradeEffect('ep', 12))},
            cost: new Decimal(2),
            unlocked() {return hasUpgrade('ep', 11)}
        },
        13: {
            title: "Cubing",
            effect() {
                let eff = new Decimal(3)
                return eff
            },
            description() {return "Raise 3rd Division and Multiplication upgrades by " +format(upgradeEffect('ep', 13))},
            cost: new Decimal(4),
            unlocked() {return hasUpgrade('ep', 12)}
        },
        14: {
            title: "Power by points",
            effect() {
                let base = player.points.add(1)
                let logbase = new Decimal(500)
                if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let eff = base.log(logbase)
                eff = eff.div(100)
                eff = eff.add(1)
                if (hasUpgrade('ep', 33)) eff = eff.pow(upgradeEffect('ep', 33))
                return eff
            },
            description() {return "MP gain is raised to a power based on points at a heavily reduced rate"},
            effectDisplay() {return "^" +format(upgradeEffect('ep', 14))},
            cost: new Decimal(6),
            unlocked() {return hasUpgrade('ep', 13)}
        },
        21: {
            title: "Power by SP",
            effect() {
                let base = player.sp.points
                let power = new Decimal(0.15)
                let eff = base.pow(power)
                if (eff.lte(1)) eff = new Decimal(1)
                eff = eff.sub(1)
                eff = eff.div(4)
                eff = eff.add(1)
                if (hasUpgrade('ep', 33)) eff = eff.pow(upgradeEffect('ep', 33))
                return eff
            },
            description() {return "Points gain is raised to a power based on SP at a reduced rate"},
            effectDisplay() {return "^" +format(upgradeEffect('ep', 21))},
            cost: new Decimal(10),
            unlocked() {return hasUpgrade('ep', 14)}
        },
        22: {
            title: "Power by DP",
            effect() {
                let base = player.dp.points
                base = base.div(10)
                base = base.add(1)
                let logbase = new Decimal(10)
                if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let base2 = base.log(logbase)
                let power = new Decimal(0.25)
                let eff = base2.pow(power)
                if (eff.lte(1)) eff = new Decimal(1)
                eff = eff.sub(1)
                eff = eff.div(6)
                eff = eff.add(1)
                if (hasUpgrade('ep', 33)) eff = eff.pow(upgradeEffect('ep', 33))
                return eff
            },
            description() {return "AP gain is raised to a power based on DP at a reduced rate"},
            effectDisplay() {return "^" +format(upgradeEffect('ep', 22))},
            cost: new Decimal(15),
            unlocked() {return hasUpgrade('ep', 21)}
        },
        23: {
            title: "Squaring 2",
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            description() {return "Raise the third Division challenge reward by " +format(upgradeEffect('ep', 23))},
            cost: new Decimal(20),
            unlocked() {return hasUpgrade('ep', 22)}
        },
        24: {
            title: "Inverse Operation++++",
            description() {return "Unlock Roots, a new Multiplication milestone, and a Division challenge."},
            cost: new Decimal(30),
            unlocked() {return hasUpgrade('ep', 23)}
        },
        31: {
            title: "Power by EP",
            effect() {
                let base = player.ep.total.add(1)
                let power = new Decimal(0.1)
                let eff = base.pow(power)
                if (eff.gte(2)) {
                    eff = eff.sub(2)
                    eff = eff.pow(0.35)
                    eff = eff.div(2)
                    eff = eff.add(2)
                }
                if (hasUpgrade('ep', 33)) eff = eff.pow(upgradeEffect('ep', 33))
                return eff
            },
            description() {return "Raise the Multiplication buyable effect and second Multiplication upgrade based on total EP"},
            effectDisplay() {return "^" + format(upgradeEffect('ep', 31))},
            cost: new Decimal(50000),
            unlocked() {return hasUpgrade('ep', 24) && hasUpgrade('rp', 14)}
        },
        32: {
            title: "Power by EP 2",
            effect() {
                let base = player.ep.points
                base = base.div(5)
                base = base.add(1)
                let logbase = new Decimal(20)
                if (hasUpgrade('lp', 11)) logbase = logbase.sub(upgradeEffect('lp', 11))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let eff = base.log(logbase)
                if (hasUpgrade('ep', 33)) eff = eff.pow(upgradeEffect('ep', 33))
                if (hasUpgrade('lp', 44) && inChallenge('lp', 11) && player.ep.points.gte(eff)) eff = player.ep.points
                return eff
            },
            description() {return "Raise all 'Add by' Addition upgrades based on EP when inside 'The Logarithm'"},
            effectDisplay() {return "^" + format(upgradeEffect('ep', 32))},
            cost: new Decimal(100000),
            unlocked() {return hasUpgrade('ep', 31)}
        },
        33: {
            title: "Super Boost 3",
            effect() {
                let eff = new Decimal(1.25)
                return eff
            },
            description() {return "Raise all 'Power by' uprades by "+ format(upgradeEffect('ep', 33))},
            cost: new Decimal(2e7),
            unlocked() {return hasUpgrade('ep', 32)}
        },
        34: {
            title: "Inverse Operation+6",
            description() {return "Unlock Actualization (in Logarithm) and an Exponentiation buyable"},
            cost: new Decimal(1e8),
            unlocked() {return hasUpgrade('ep', 33)}
        },
        
    },


    milestones: {
        0: {
            requirementDescription: "1 total Exponent point",
            effectDescription: "Keep Addition upgrades on Multiplication/Division resets. Gain 1% of DP every second when below 10,000 DP",
            done() {return player.ep.total.gte(1)}
        },
        1: {
            requirementDescription: "2 total Exponent points",
            effect() {return new Decimal(1.25)},
            effectDescription() {return "Keep Subtraction milestones on Multiplication/Division resets. Raise the 1st and 2nd Division challenge rewards by "+ format(tmp.ep.milestones[1].effect)},
            done() {return player.ep.total.gte(2)},
            unlocked() {return hasMilestone('ep', 0)}
        },
        2: {
            requirementDescription: "5 total Exponent points",
            effectDescription: "Gain 10% of AP per second. Improve the first Exponentiation upgrade. Unlock a multiplication buyable (kept on reset)",
            done() {return player.ep.total.gte(5)},
            unlocked() {return hasMilestone('ep', 1)}
        },
        3: {
            requirementDescription: "10 total Exponent points",
            effect() {return new Decimal(2)},
            effectDescription() {return "Raise 'First Column Boost' effect to "+ format(tmp.ep.milestones[3].effect)},
            done() {return player.ep.total.gte(10)},
            unlocked() {return hasMilestone('ep', 2)}
        },
        4: {
            requirementDescription: "15 total Exponent points",
            effect() {return new Decimal(2)},
            effectDescription() {return "Raise 'Add by Points' and 'Multiply by 2' effects to "+ format(tmp.ep.milestones[4].effect)},
            done() {return player.ep.total.gte(15)},
            unlocked() {return hasMilestone('ep', 3)}
        },
        5: {
            requirementDescription: "30 total Exponent points",
            effect() {
                let base = player.sp.points.sub(50).div(5)
                let scstart = new Decimal(25)
                if (base.gt(scstart)) {
                    base = base.sub(scstart)
                    base = base.pow(0.4)
                    base = base.add(scstart)
                }
                base = base.add(1)
                if (hasUpgrade('lp', 12)) base = base.mul(1.6)
                let power = new Decimal(0.25)
                if (hasUpgrade('lp', 12))power = power.add(0.1)
                 let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.mul(1.25)
                if (eff.lte(0)) eff = new Decimal(0)
                eff = eff.add(1)
                return eff
            },
            effectDescription() {return "Raise EP gain based on SP starting at 50 at a reduced rate. The effect is reduced after 75 SP <br> Currently: ^"+ format(tmp.ep.milestones[5].effect)},
            done() {return player.ep.total.gte(30)},
            unlocked() {return hasMilestone('ep', 4)}
        },
        6: {
            requirementDescription: "100 total Exponent points",
            effectDescription() {return "Improve DP and EP gain formulas"},
            done() {return player.ep.total.gte(100)},
            unlocked() {return hasMilestone('ep', 5)}
        },
        7: {
            requirementDescription: "1,000 total Exponent points",
            effect() {
                let eff = player.rp.points.add(1)
                if (eff.gte(3)) {
                    eff = eff.sub(3)
                    eff = eff.pow(0.75)
                    eff = eff.div(3)
                    eff = eff.add(3)
                }
                if (eff.gte(6)) {
                    eff = eff.sub(6)
                    eff = eff.pow(0.5)
                    eff = eff.add(6)
                }
                eff = eff.mul(1.5)
                return eff
            },
            effectDescription() {return "'Multiply by 1' effect is raised a power based on RP. <br> Currently: ^" +format(tmp.ep.milestones[7].effect)},
            done() {return player.ep.total.gte(1000)},
            unlocked() {return hasMilestone('ep', 6) && player.rp.unlocked}
        },
        8: {
            requirementDescription: "5,000 total Exponent points",
            effect() {
                let base = player.points.add(1)
                let logbase = new Decimal(100)
                let eff = base.log(logbase)
                let power = 0.2
                eff = eff.pow(power)
                eff = eff.sub(1)
                eff = eff.mul(1.25)
                eff = eff.add(1)
                if (eff.lte(1)) eff = new Decimal(1)
                return eff
            },
            effectDescription() {return "'Multiply by 1' effect is increased at an extremely reduced rate by points. <br> Currently: x" +format(tmp.ep.milestones[8].effect)},
            done() {return player.ep.total.gte(5000)},
            unlocked() {return hasMilestone('ep', 7)}
        },
        9: {
            requirementDescription: "100,000 total Exponent points",
            effectDescription() {return "Keep Addition and Division upgrades and Subtraction milestones on Exponentiation and Root resets."},
            done() {return player.ep.total.gte(100000)},
            unlocked() {return hasMilestone('ep', 8)}
        },
        10: {
            requirementDescription: "175,000 total Exponent points",
            effectDescription() {return "Passive DP gain is increased to 100% after 12th Multiplication upgrade is bought and increase cap to 10,000,000"},
            done() {return player.ep.total.gte(175000)},
            unlocked() {return hasMilestone('ep', 9)}
        },
        11: {
            requirementDescription: "30,000,000 total Exponent points",
            effectDescription() {return "Increase passive DP by x1,000 for every milestone after this. Square the effects of the first and fourth Multiplication milestones"},
            done() {return player.ep.total.gte(3e7)},
            unlocked() {return hasMilestone('ep', 10)}
        },
        12: {
            requirementDescription: "5e10 total Exponent points",
            effectDescription() {return "'The Logarithm's nerf to MP is reduced"},
            done() {return player.ep.total.gte(5e10)},
            unlocked() {return hasMilestone('ep', 11)}
        },
        13: {
            requirementDescription: "5e11 total Exponent points",
            effectDescription() {return "While inside 'The Logarithm' 'Super boost 2' effect is cubed"},
            done() {return player.ep.total.gte(5e11)},
            unlocked() {return hasMilestone('ep', 12)}
        },
        14: {
            requirementDescription: "2e12 total Exponent points",
            effect() {
                let base = player.mp.points.add(1)
                let logbase = new Decimal(5)
                let eff = base.log(logbase)
                eff = eff.pow(0.5)
                eff = eff.div(2)
                if (eff.lte(1)) eff = new Decimal(1)
                return eff
            },
            effectDescription() {return "MP boost LP at a reduced rate.<br> Currently: x" + format(tmp.ep.milestones[14].effect)},
            done() {return player.ep.total.gte(2e12)},
            unlocked() {return hasMilestone('ep', 13)}
        },
    },


    buyables: {
        11: {
            title: "Power boost boost",
            cost(x) { 
                let start = new Decimal(1000000)
                let base = new Decimal(7.5)
                let cost = start.mul(base.pow(x))
                return cost
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(0.25)
                eff = eff.add(base.mul(x))
                return eff
            },
            purchaseLimit() {
                return new Decimal(6)
            },
            display() {
                return "Raise 'Power boost' by 0.25 additive per purchase.\nCost: " + format(tmp.ep.buyables[11].cost) + "\nEffect: ^" +format(tmp.ep.buyables[11].effect) + "\nAmount: " +format(getBuyableAmount('ep', 11)) + "/" + format(tmp.ep.buyables[11].purchaseLimit)
            },
        },
    },



})

addLayer('rp', {
    name: "Roots",
    symbol: "R",
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "brown",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Root points", // Name of prestige currency
    baseResource: "Exponent points", // Name of resource prestige is based on
    baseAmount() {return player.ep.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: new Decimal(1.75),
    exponent: 0.2, // Prestige currency exponent
    branches: ["ep"],
    unlocked() {
        return hasUpgrade('ep', 24)
    },
    canReset() {
        let canMax = false
        let amt = player.rp.points.plus((canMax&&tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt))?tmp[this.layer].resetGain:0).div(tmp[this.layer].directMult)
		let extraCost = Decimal.pow(tmp[this.layer].base, amt.pow(tmp[this.layer].exponent).div(tmp[this.layer].gainExp)).times(tmp[this.layer].gainMult)
		let cost = extraCost.times(tmp[this.layer].requires).max(tmp[this.layer].requires)
        return hasUpgrade('ep', 24) && player.ep.points.gte(cost) && player.rp.points.lte(9)
    },
    resetsNothing() {return false},
    effect() {
        let base = player.rp.total
        let power = new Decimal(1.3)
        let exp = base.pow(power)
        let ebase = new Decimal(0.99)
        let eff = new Decimal(1).div(ebase.pow(exp))
        if (hasChallenge('dp', 31)) {
            eff = eff.sub(1)
            eff = eff.div(tmp.dp.challenges[31].rewardEffect)
            eff = eff.add(1)
        }
        if (hasMilestone('rp', 3)) eff = eff.root(tmp.rp.milestones[3].effect)
        if (hasMilestone('rp', 4) && inChallenge('lp', 11)) {
            let logbase = tmp.lp.challenges[11].effect.root(2)
            eff = eff.add(logbase)
            eff = eff.log(logbase)
            eff = eff.sub(1)
            eff = eff.div(3)
            eff = eff.add(1)
        }
        return eff
    },
    effectDescription() {return "which are rooting points, AP, MP, and DP gain by " +colorText("h2", "brown", format(tmp.rp.effect)) + "  (based on total) <br><br> Note: RP is hardcapped at 10"},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    directMult() {
        let dmult = new Decimal(1)
        return dmult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let eff = new Decimal(0.25)
        return eff
    },
    onPrestige() {
        if (!tmp.rp.canBuyMax) canMax = false
        let amt = player.rp.points.div(tmp.rp.directMult)
        let extraCost = Decimal.pow(tmp.rp.base, amt.pow(tmp.rp.exponent).div(tmp.rp.gainExp)).times(tmp.rp.gainMult)
        let cost = extraCost.times(tmp.rp.requires).max(tmp.rp.requires)
        if (tmp.rp.roundUpCost) cost = cost.ceil()
        player.ep.points = (player.ep.points).sub(cost)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "r: Reset for Root points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        let shown = hasUpgrade('ep', 24) || (player.rp.unlocked)
        return shown
    },

    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                "milestones"
            ],
        },
        
    },


    milestones: {
        0: {
            requirementDescription: "1 total Root points",
            effectDescription: "Keep Multiplication milestones on Exponentiation/Roots reset",
            done() {return player.rp.total.gte(1)},
            unlocked() {return true}
        },
        1: {
            requirementDescription: "3 total Root points",
            effectDescription: "Improve Division passive generation cap to 1,000,000",
            done() {return player.rp.total.gte(3)},
            unlocked() {return hasMilestone('rp', 0)}
        },
        2: {
            requirementDescription: "3 Root points",
            effect() {
                let base = player.dp.points.div(1000).add(1)
                let eff = base.log(10).add(1)
                let power = new Decimal(0.25)
                eff = eff.pow(power)
                eff = eff.sub(1)
                eff = eff.div(1.5)
                eff = eff.add(1)
                return eff
            },
            effectDescription() {return "Improve Division passive generation to 5%. The first Exponentiation upgrade is boosted by DP. <br> Currently: x" +format(tmp.rp.milestones[2].effect)},
            done() {return player.rp.points.gte(3)},
            unlocked() {return hasMilestone('rp', 1)}
        },
        3: {
            requirementDescription: "10 total Root points",
            effect() {
                let base = player.mp.points.add(1)
                let eff = base.log(20).add(1)
                eff = eff.mul(2)
                let power = new Decimal(0.25)
                eff = eff.pow(power)
                return eff
            },
            effectDescription() {return "Root the Root nerf based on MP <br> Currently: " +format(tmp.rp.milestones[3].effect)},
            done() {return player.rp.total.gte(10)},
            unlocked() {return hasMilestone('rp', 2)}
        },
        4: {
            requirementDescription: "10 Root points",
            effectDescription() {return "While in 'The Logarithm' the roots nerf is nerfed"},
            done() {return player.rp.points.gte(10)},
            unlocked() {return hasMilestone('rp', 3) && player.lp.unlocked}
        },
    },

    upgrades: {
        11: {
            title: "Root by 1.25",
            effect() {
                let eff = new Decimal(1.25)
                return eff
            },
            description() {return "Root Division and Subtraction nerfs by " +format(upgradeEffect('rp', 11))},
            cost: new Decimal(1),
            unlocked() {return true}
        },
        12: {
            title: "Root by EP",
            effect() {
                let base = player.ep.points.add(1)
                let power = new Decimal(0.2)
                let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.div(4)
                eff = eff.add(1)
                if (eff.gte(4)) {
                    eff = eff.sub(4)
                    eff = eff.pow(0.25)
                    eff = eff.add(4)
                }
                return eff
            },
            description() {return "Root first 5 Division challenge requirements based on EP at a reduced rate"},
            effectDisplay() {return format(upgradeEffect('rp', 12))},
            cost: new Decimal(1),
            unlocked() {return hasUpgrade('rp', 11)}
        },
        13: {
            title: "Root by RP",
            effect() {
                let base = player.rp.best.add(1)
                base = base.mul(2)
                let power = new Decimal(0.3)
                let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.div(3)
                eff = eff.add(1)
                return eff
            },
            description() {return "Root the first Multiplication buyable scaling based on best RP"},
            effectDisplay() {return format(upgradeEffect('rp', 13))},
            cost: new Decimal(2),
            unlocked() {return hasUpgrade('rp', 12)}
        },
        14: {
            title: "Inverse Operation+5",
            description() {return "Unlock Logarithim and a new row of Exponentiation Upgrades. Keep Division challenges on reset"},
            cost: new Decimal(4),
            unlocked() {return hasUpgrade('rp', 13)}
        },
    },


})


addLayer("lp", {
    name: "Logarithm",
    symbol: "L",
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#808588",
    resource: "Logarithm points",
    baseResource: "points",
    baseAmount() {return player.points},
    requires: new Decimal(0),
    base: new Decimal(1),
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["ep"],
    tooltipLocked() {return "0 Logarithm points"},
    unlocked() {
        return hasUpgrade('rp', 14)
    },
    prestigeNotify() {return false},
    row: 2,
    layerShown(){
        let shown = hasUpgrade('rp', 14) || (player.lp.unlocked)
        return shown
    },
    prestigeButtonText() {return "Unlock the Logarithm"},
    canReset() {return !player.lp.unlocked},
    gainMult: new Decimal(-1e308),

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "infoboxes",
                "blank",
                "challenges"
            ]
        },
        "Upgrades": {
            content: [
                "main-display",
                "blank",
                ["upgrades", [1, 2, 3]]
            ],
        },
        "Actualization": {
            content: [
                "main-display",
                "blank",
                ["upgrades", [4]]
            ],
            unlocked() {return hasUpgrade('ep', 34)}
        },
    },

    challenges: {
        11: {
            name: "The Logarithm",
            effect() {
                let eff = new Decimal(10)
                if (hasUpgrade('lp', 22)) eff = eff.sub(upgradeEffect('lp', 22))
                if (eff.lte(2)) eff = new Decimal(2)
                return eff
            },
            gain() {
                let base = player.points.add(1)
                let logbase = new Decimal(10)
                if (hasUpgrade('lp', 13)) logbase = logbase.sub(2)
                if (hasUpgrade('lp', 22)) logbase = logbase.sub(upgradeEffect('lp', 22))
                if (logbase.lte(2)) logbase = new Decimal(2)
                let eff = base.log(logbase)
                let power = new Decimal(2)
                if (hasUpgrade('lp', 13)) power = power.add(0.5)
                eff = eff.pow(power)
                eff = eff.mul(1.25)
                if (hasUpgrade('lp', 42)) eff = eff.mul(upgradeEffect('lp', 42))
                if (hasMilestone('ep', 14)) eff = eff.mul(tmp.ep.milestones[14].effect)
                if (hasUpgrade('lp', 24)) eff = eff.mul(upgradeEffect('lp', 24))
                return eff
            },
            requirement() {
                let req = new Decimal(1e30)
                return req
            },
            challengeDescription() {return "Point gain is set to log" +format(tmp.lp.challenges[11].effect)+ " of itself. All other currencies are square rooted. Disable passive AP and DP generation. Resets Addition-Division features on enter except buyables and challenges. <br> Exit early to set Logarithm points to "+format(tmp.lp.challenges[11].gain) + " based on points (cannot decrease)"},
            canComplete() {return player.points.gte(tmp.lp.challenges[11].requirement)},
            goalDescription() {return "Get "+format(tmp.lp.challenges[11].requirement)+" points"},
            rewardDescription: "Unlock Tetration (NYI)",
            unlocked() {return hasUpgrade('rp', 14) && player.lp.unlocked},
            onEnter() {
                player.ap.upgrades = []
                player.sp.milestones = []
                player.mp.milestones = []
            },
            onExit() {
                if (player.lp.points.lte(tmp.lp.challenges[11].gain)) player.lp.points = tmp.lp.challenges[11].gain
            }
        }
    },

    upgrades: {
        11: {
            title: "Better logs",
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            description() {return "All upgrades which use logarithms in formulas have their bases reduced by " +format(upgradeEffect('lp', 11))},
            cost: new Decimal(2),
            unlocked() {return player.lp.unlocked}
        },
        12: {
            title: "Better formula",
            description() {return "Improve the sixth Exponentiation milestone formula"},
            cost: new Decimal(7),
            unlocked() {return hasUpgrade('lp', 11)}
        },
        13: {
            title: "Better SP and LP",
            description() {return "SP is no longer nerfed inside 'The Logarithm'. LP gain formula is buffed"},
            cost: new Decimal(10),
            unlocked() {return hasUpgrade('lp', 12)}
        },
        14: {
            title: "Better Addition upgrades",
            description() {return "All Addition upgrades are now affected by the tenth Exponentiation upgrade. AP gets multiplied by 1.5 per Addition upgrade"},
            cost: new Decimal(25),
            unlocked() {return hasUpgrade('lp', 13) && hasUpgrade('ep', 32)}
        },
        21: {
            title: "Log by 2",
            description() {return "Division and Subtraction nerfs are log 2 of themselves, squared"},
            cost: new Decimal(50),
            unlocked() {return hasUpgrade('lp', 14)}
        },
        22: {
            title: "Log reducer",
            effect() {
                let base = player.ap.points.add(1)
                let logbase = new Decimal(10)
                let eff = base.log(logbase).add(1)
                let power = new Decimal(0.5)
                eff = eff.pow(power)
                eff = eff.mul(1.5)
                return eff
            },
            description() {return "AP reduces 'The Logarithm' nerf and LP gain log bases at a reduced rate"},
            effectDisplay() {return "-" + format(upgradeEffect('lp', 22))},
            cost: new Decimal(180),
            unlocked() {return hasUpgrade('lp', 21)}
        },
        23: {
            title: "Log Utility",
            effect() {
                let base = player.ep.points.add(1)
                let logbase = new Decimal(10)
                let eff = base.log(logbase)
                eff = eff.pow(2)
                if (eff.lte(1)) eff = new Decimal(1)
                return eff
            },
            description() {return "The log10 of EP squared raises Super boost boost while in 'The Logarithm'"},
            effectDisplay() {return "^" + format(upgradeEffect('lp', 23))},
            cost: new Decimal(850),
            unlocked() {return hasUpgrade('lp', 22)}
        },
        24: {
            title: "Log Log points to boost Log points",
            effect() {
                let base = player.lp.points.add(1)
                let logbase = new Decimal(10)
                let eff = base.log(logbase)
                if (eff.lte(1)) eff = new Decimal(1)
                return eff
            },
            description() {return "The log10 of LP boosts LP gain"},
            effectDisplay() {return "x" + format(upgradeEffect('lp', 24))},
            cost: new Decimal(2100),
            unlocked() {return hasUpgrade('lp', 23)}
        },
        41: {
            title: "Actualize Addition",
            description() {return "'Add by Addition points' actually uses AP unless the normal effect is bigger"},
            cost: new Decimal(75),
            unlocked() {return hasUpgrade('ep', 34)}
        },
        42: {
            title: "Actualize Subtraction",
            effect() {
                let base = player.sp.points.add(1)
                let power = new Decimal(0.4)
                let eff = base.pow(power)
                eff = eff.sub(1)
                eff = eff.div(2)
                eff = eff.add(1)
                return eff
            },
            description() {return "Subtraction milestone 4 actually uses SP unless the normal effect is bigger. SP boosts LP at a reduced rate"},
            effectDisplay() {return " x" + format(upgradeEffect('lp', 42))},
            cost: new Decimal(140),
            unlocked() {return hasUpgrade('lp', 41)}
        },
        43: {
            title: "Actualize Multiplication",
            description() {return "'Multiply by MP more' actually uses MP unless the normal effect is better. 'Super boost boost' is multiplied by 'Multiply by MP'"},
            cost: new Decimal(530),
            unlocked() {return hasUpgrade('lp', 42)}
        },
        44: {
            title: "Actualize Exponentiation",
            description() {return "'Power by EP 2' actually uses EP while inside 'The Logarithm' unless the normal effect is better"},
            cost: new Decimal(9000),
            unlocked() {return hasUpgrade('lp', 43)}

        },
    },



})

addLayer("ach", {
    startData(){ return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true},
    tooltip() {return ("Achievements")},
    name: "Achievements",
    symbol: "Ach",

    achievements: {
        rows: 10,
        cols: 4,
        11: {
            name: "The Start",
            done() {return player.ap.points.gt(0)},
            tooltip: "Get 1 Addition point.",
        },
        12: {
            name: "Nerfing Yourself",
            done() {return player.sp.points.gt(0)},
            tooltip: "Get 1 Subtraction point.",
        },
        13: {
            name: 'Actually, it doesn\'t "Add by Addition points"',
            done() {return hasUpgrade("ap", 22)},
            tooltip: "Buy the sixth addition upgrade.",
        },
        14: {
            name: "It's not all bad",
            done() {return hasMilestone('sp', 1)},
            tooltip: "Get the second Subtraction milestone",
        },
        21: {
            name: "Counteracting the nerf",
            done() {return hasUpgrade('ap', 32)},
            tooltip: "Buy the tenth addition upgrade. Reward: Increase point gain by 20%",
        },
        22: {
            name: "Thousandaire",
            done() {return player.points.gte(1000)},
            tooltip: "Get 1,000 points",
        },
        23:{
            name: "Why would you buy this",
            done() {return hasUpgrade('mp', 11)},
            tooltip: "Buy the first multiplication upgrade. Reward: Increase AP gain by 50%"
        },
        24: {
            name: "First Automation",
            done() {return hasMilestone('mp', 2)},
            tooltip: "Get the third Multiplication Milestone",
        },
        31: {
            name: "Not that useful",
            done() {return hasUpgrade('dp', 11)},
            tooltip: "Buy the first division upgrade",
        },
        32: {
            name: "A little more useful",
            done() {return hasUpgrade('dp', 13)},
            tooltip: "Buy the third division upgrade. Reward: Increase MP gain by 10%"
        },
        33: {
            name: "Not quite inflation",
            done() {return hasUpgrade('mp', 23)},
            tooltip: "Buy the seventh multiplication upgrade. Reward: Multiply point by 2"
        },
        34: {
            name: "I thought multiplication was supposed to multiply",
            done() {return hasChallenge('dp', 12)},
            tooltip: "Complete the second Division challenge."
        },
        41: {
            name: "A New Dawn",
            done() {return player.ep.unlocked},
            tooltip: "Unlock Exponentiation. Reward: Double Division point gain",
        },
        42: {
            name: "Where is my inverse operation++++?",
            done() {return hasUpgrade('ep', 14)},
            tooltip: "Buy the fourth exponentiation upgrade. Reward: Double point and DP gain"
        },
        43: {
            name: "The power of Subtraction (points)",
            done() {return hasMilestone('ep', 5)},
            tooltip: "Get the sixth exponentiation milestone. Reward: Buy max Subtraction points"
        },
        44: {
            name: "Where is my tree?",
            done() {return player.rp.unlocked},
            tooltip: "Unlock Roots. Increase EP gain by 50%"
        },
        51: {
            name: "Still not inflation",
            done() {return hasMilestone('mp', 6)},
            tooltip: "Get the seventh multiplication milestone"
        },
        52: {
            name: "My MP has betrayed me",
            done() {return hasChallenge('dp', 31)},
            tooltip: "Complete the fifth Division Challenge"
        },
        53: {
            name: "Now I know why you would buy this",
            done() {return hasMilestone('ep', 8)},
            tooltip: "Get the ninth Exponentiation milestone. Reward: Subtraction milestone 4 is better after 30 SP"
        },
        54: {
            name: "Too many woods",
            done() {return hasUpgrade('rp', 14)},
            tooltip: "Unlock Log... arithms"
        },
        61: {
            name: "A little repetitive",
            done() {return hasUpgrade('ep', 32)},
            tooltip: "Buy the tenth Exponentiation upgrade"
        },
        62: {
            name: "Too many points!",
            done() {return player.points.gte(1e40)},
            tooltip: "Have over 10 Duodecillion points. Reward: 2nd Subtraction Milestone is a lot better inside 'The Logarithm'"
        },
        63: {
            name: "Is that really necessary?",
            done() {return hasUpgrade('lp', 21)},
            tooltip: "Buy the 5th Logarithm upgrade."
        },
        64: {
            name: "What technology is this?",
            done() {return hasUpgrade('ep', 34)},
            tooltip: "Unlock Actualization. Every Multiplication upgrade multiplies MP gain by 1.25"
        },
        71: {
            name: "It does now",
            done() {return hasUpgrade('lp', 41)},
            tooltip: "Purchase the 1st Actualization upgrade"
        },
        72: {
            name: "Still useless",
            done() {return hasUpgrade('lp', 42)},
            tooltip: "Purchase the 2nd Actualization upgrade"
        },
        73: {
            name: "Inflation!... (softcapped)",
            done() {return hasUpgrade('lp', 43)},
            tooltip: "Purchase the 3rd Actualization upgrade"
        },
        74: {
            name: "Unlimited power",
            done() {return hasUpgrade('lp', 44)},
            tooltip: "Purchase the 4th Actualization upgrade"
        },
        81: {
            name: "A fantastic layer",
            done() {return false},
            tooltip: "Unlock Tetration"
        },

    }
})

