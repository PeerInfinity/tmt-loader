function MSInitialize(buyableStatus) {
	buyableStatus.scaleStart = [new Decimal(10), new Decimal(50), new Decimal(80)]
	buyableStatus.scaledFactor = [new Decimal(15), new Decimal(7500), new Decimal(7500)]
	buyableStatus.largeScale = [false,false,true]
	buyableStatus.large = false
	buyableStatus.points = player.points
	buyableStatus.base = tmp.w.buyables[11].baseCost
	buyableStatus.constant = tmp.w.buyables[11].baseCost
    buyableStatus.factor = new Decimal(5)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.accel = new Decimal(1.6)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",11).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function WSInitialize(buyableStatus) {
	buyableStatus.scaleStart = [new Decimal(12), new Decimal(24), new Decimal(81), new Decimal(160)]
	buyableStatus.scaledFactor = [new Decimal(6), new Decimal(12), new Decimal(2400), new Decimal(2400)]
	buyableStatus.largeScale = [false,false,false,true]
	buyableStatus.large = false
	buyableStatus.points = player.w.points
	buyableStatus.base = tmp.w.buyables[12].baseCost
	buyableStatus.constant = tmp.w.buyables[12].baseCost
    buyableStatus.factor = new Decimal(3)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.accel = new Decimal(1.5)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",12).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function DSInitialize(buyableStatus) {
	buyableStatus.scaleStart = [new Decimal(20)]
	buyableStatus.scaledFactor = [new Decimal(16)]
	buyableStatus.largeScale = [false]
	buyableStatus.large = false
	buyableStatus.points = player.de
	buyableStatus.base = tmp.w.buyables[14].baseCost
	buyableStatus.constant = tmp.w.buyables[14].baseCost
    buyableStatus.factor = new Decimal(4)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.accel = new Decimal(1)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",14).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function upg43WEffect() {
    let effects = []
    let ae = player.ae
    // Mentality
    effects.push(ae.max(1).pow(0.5).mul(2.7))
    // Weakling Dust
    effects.push(ae.max(1).pow(2.75).mul(3.25))
    return effects
}

addLayer("w", {
    tabFormat: {
        Main: {
            content: [
                ["infobox","introBox"],
                "blank",
                "buyables",
                "blank",
                "blank",
                "main-display",
                "resource-display",
                ["display-text", function() {
                    if(inChallenge("dm",22)&&!tmp.w.upgrades[61].unlocked) 
                        return colorText("h1","rgba(211, 13, 13, 0.8)",`Upgrades are nowhere to be seen...<br>
                        The complete darkness blinds your eyes...<br>
                        Gain the power of the Demon... and adapt to the darkness...`)
                    return ""
                }],
                //"prestige-button",
                "upgrades",
                "clickables", "blank"
            ]
        },
        Offering: {
            unlocked() {return hasUpgrade("w",45)},
            buttonStyle: {'border':'rgb(252, 244, 132) 2px solid'},
            embedLayer: "off"
        }
    },
    name: "Weaklings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        timer: 0,
        slowGain: false, // for signifying whether WD had uncapped and therefore MTL can regain its own multiplier
        MSStatus: { // Stats for Mentality Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(10),
            constant: new Decimal(10),
            factor: new Decimal(5),
            offset: new Decimal(0),
            scaleStart: [new Decimal(10), new Decimal(50), new Decimal(80)],
            scaledFactor: [new Decimal(15), new Decimal(7500), new Decimal(7500)],
            largeScale: [false,false,true],
            large: false,
            accel: new Decimal(1.6),
            buyCount: new Decimal(0),
            injected: false, // filter to the totalBuysWithScaling so that it doesn't mess up the calc with set buyCount value
            bought: new Decimal(0),
            boughtCost: new Decimal(0)
        },
        WSStatus: { // Stats for Weakling Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(5),
            constant: new Decimal(5),
            factor: new Decimal(3),
            offset: new Decimal(0),
            scaleStart: [new Decimal(12), new Decimal(24), new Decimal(81), new Decimal(160)],
            scaledFactor: [new Decimal(6), new Decimal(12), new Decimal(2400), new Decimal(2400)],
            largeScale: [false,false,false,true],
            large: false,
            accel: new Decimal(1.5),
            buyCount: new Decimal(0),
            injected: false, // filter to the totalBuysWithScaling so that it doesn't mess up the calc with set buyCount value
            bought: new Decimal(0),
            boughtCost: new Decimal(0)
        },
        DSStatus: { // Stats for Demonic Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(50),
            constant: new Decimal(50),
            factor: new Decimal(4),
            offset: new Decimal(0),
            scaleStart: [new Decimal(20)],
            scaledFactor: [new Decimal(16)],
            largeScale: [false],
            large: false,
            accel: new Decimal(1),
            buyCount: new Decimal(0),
            injected: false, // filter to the totalBuysWithScaling so that it doesn't mess up the calc with set buyCount value
            bought: new Decimal(0),
            boughtCost: new Decimal(0)
        }
    }},
    MSCostDifference() {
        player.w.MSStatus = MSInitialize(player.w.MSStatus)
        player.w.MSStatus.buyCount = player.w.MSStatus.bought
        player.w.MSStatus.injected = true
        player.w.MSStatus = totalBuysWithScaling(player.w.MSStatus)
        let cost2 = totalCost(player.w.MSStatus)
        player.w.MSStatus = MSInitialize(player.w.MSStatus)
        player.w.MSStatus.boughtCost = cost2
        player.w.MSStatus = totalBuysWithScaling(player.w.MSStatus)
        let totalBuy = player.w.MSStatus.buyCount
        let cost1 = totalCost(player.w.MSStatus)
        player.w.MSStatus.buyCount = totalBuy
        return cost1.sub(cost2)
    },
    WSCostDifference() {
        player.w.WSStatus = WSInitialize(player.w.WSStatus)
        player.w.WSStatus.buyCount = player.w.WSStatus.bought
        player.w.WSStatus.injected = true
        player.w.WSStatus = totalBuysWithScaling(player.w.WSStatus)
        let cost2 = totalCost(player.w.WSStatus)
        player.w.WSStatus = WSInitialize(player.w.WSStatus)
        player.w.WSStatus.boughtCost = cost2
        player.w.WSStatus = totalBuysWithScaling(player.w.WSStatus)
        let totalBuy = player.w.WSStatus.buyCount
        let cost1 = totalCost(player.w.WSStatus)
        player.w.WSStatus.buyCount = totalBuy
        return cost1.sub(cost2)
    },
    infoboxes: {
        introBox: {
            title() {
                if(inChallenge("dm",22)) return "..."
                if(inChallenge("a",22)) return "The Angels"
                return "Welcome!"},
            body() {
                if(inChallenge("dm",22)) 
                    return `<i style='color:gray'>No more Mentality left... We're going insane...<br>
                    The demon... he trapped us here!<br>
                    Here in the endless wasteland where no light can be seen...</i>`
                if(inChallenge("a",22)) 
                    return `<i>Greetings, challenger. We are the companions of the God,<br>
                    and you may call us...</i> <b style='color:rgb(220, 228, 153)'>Angels</b>.<br><br>
                    <i>The God has seen the potentials in you. He witnessed how you went through the struggle of the Weaklings,
                    how you struggled between choosing Virtuous and Evil...
                    But eventually, you had carved yourself a path, overcame the difficulties you faced 
                    and turned them into building blocks for your incremental empire.<br><br>
                    God has taken an interest in you, therefore he decided to present you with some challenges
                    to test whether you have the ability to overcome the different types of hardship.<br><br>
                    <i style='text-shadow: 0px 0px 10px'>Overcome these challenges and prove your worth.</i><br>
                    We will bear witness to your fortitude.</i>`
                return `Welcome to the Weakling Tree! In here, you start off very weak but 
                eventually becomes stronger as you get more upgrades!<br><br>
                Now, you'll have to wait until you get 1 Mentality, which will enable you to gain
                <b>Weakling Dust</b> automatically, and you can start from there.<br><br>
                <i style='color:gray'>Tip: You can hold down both Strengthens (buyables) to quickly purchase multiple of them!
                Also, the same applies to every other repeatable buttons (mostly clickables)!</i>`
            }
        },
    },
    color: "#7a7a79ff",
    requires() {
        if (player.w.points.gt(0)||(inChallenge("dm",22)&&hasUpgrade(this.layer,61))) return new Decimal(0)
        else return new Decimal(1)
    }, // Can be a function that takes requirement increases into account
    resource: "Weakling Dust", // Name of prestige currency
    baseResource: "Mentality", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    passiveGeneration() {
        let gain = new Decimal(0.1)
        if(inChallenge("a",11)) gain = new Decimal(0)
        if((inChallenge("a",21)||inChallenge("a",22)||inChallenge("dm",21))&&(player.a.inChTime < 0.5&&player.dm.inChTime < 0.5)) gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if((!inChallenge("dm",22)&&!inChallenge("a",22))||(inChallenge("dm",22)&&!hasMilestone("c",22))) mult = mult.div(player.c.ude)
        mult = mult.mul(tmp.w.buyables[12].effect)
        mult = mult.times(hasUpgrade(this.layer,11)?3:1)
        mult = mult.times(hasUpgrade(this.layer,12)?4:1)
        mult = mult.times(hasUpgrade(this.layer,21)?upgradeEffect(this.layer,21):1)
        mult = mult.times(hasUpgrade(this.layer,24)?upgradeEffect(this.layer,24):1)
        mult = mult.times((hasMilestone("c",0)&&!inChallenge("dm",22))?3:1)
        mult = mult.times((hasMilestone("c",2)&&!inChallenge("dm",22))?tmp.c.mwConvert:1)
        mult = mult.times((hasMilestone("c",4)&&!inChallenge("dm",22))?tmp.c.crystalsToWeakling:1)
        mult = mult.times((hasMilestone("c",5)&&!inChallenge("dm",22))?3:1)
        mult = mult.times(hasMilestone("c",44)?tmp.c.vcToWeakling:1)
        if(hasUpgrade(this.layer,31)) mult = mult.pow(1.2)
        if(hasUpgrade("c",55)) mult = mult.mul(tmp.c.effect)
        if(inChallenge("a",21)) mult = mult.pow(0.1)
        if(inChallenge("dm",21)) mult = mult.pow(2)
        if(hasUpgrade("c",62)) mult = mult.mul(tmp.c.csToWeakling)
        if((hasMilestone("dm",1)&&(inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)))||
            (hasMilestone("dm",3)&&!inAnyChallenge()))
            mult = mult.mul(2e10)

        // DC4 exclusive
        if(inChallenge("dm",22)) {
            if(hasMilestone("c",52)) mult = mult.div(aeDivWD())
            if(hasUpgrade(this.layer,62)) mult = mult.mul(upgradeEffect(this.layer,62))
            if(hasMilestone("c",4)) mult = mult.mul(tmp.c.crystalsToWeaklingDC22)
            if(hasMilestone("c",22)) mult = mult.mul(player.c.ude)
            if(hasMilestone("c",84)) mult = mult.mul(tmp.c.ecToWeakling)
        }

        // AC4 exclusive
        if(inChallenge("a",22)) {
            if(hasUpgrade(this.layer,41)) mult = mult.mul(upgradeEffect(this.layer,41))
            if(hasUpgrade(this.layer,43)) mult = mult.mul(upg43WEffect()[1])
            if(hasMilestone("off",1)) mult = mult.mul(tmp.off.offAEToWD)
            mult = mult.pow(0.1)
            mult = mult.mul(tmp.a.vppEffect.add(1)).mul(tmp.dm.eppEffect.add(1))
            mult = mult.div(player.c.ude)
        }

        if(hasMilestone("c",27)) { // fix the progression spike caused by UD when exiting challenges
            let tempCap = new Decimal("1e400")
            let gainBase = new Decimal(1e100)
            tempCap = tempCap.mul(Decimal.pow(gainBase,player.a.outChTime-0.5))
            if(tempCap.gt(mult)) player.w.slowGain = false
            else player.w.slowGain = true
            mult = mult.min(tempCap)
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        //{key: "w", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer) {
        let keep = []
        if(hasMilestone("c",41) && resettingLayer=="c") keep.push("upgrades")
        if(hasMilestone("a",0) && resettingLayer=="a") keep.push("upgrades")
        if(hasMilestone("dm",0) && resettingLayer=="dm") keep.push("upgrades")
        if(layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },

    canReset: false,

    instantUnlockLayer() {
        if(player.points.gte(1)) player.w.unlocked = true
        return
    },

    deReq() {
        let req = new Decimal(3e10)
        let reqBase = req
        let factor = new Decimal(1.6)
        if(player.c.resetCount.gte(1)) req = req.mul(player.c.resetCount.add(1).pow(1.25))
        if(player.c.resetCount.gte(5)) {
            reqBase = reqBase.mul(Decimal.pow(5,1.25))
            req = reqBase.mul(factor.pow(player.c.resetCount.sub(4).max(0)))
        }
        if(hasMilestone("c",5)) req = req.div(tmp.c.resetsToDEReq)
        return req
    },

    effect() {
        let eff = new Decimal(1)
        let exponent = 0.5
        let weakling = player[this.layer].points
        if(hasUpgrade(this.layer,13)) exponent = 0.4
        if(hasUpgrade(this.layer,33)) exponent = 0.25
        if(inChallenge("dm",11)) exponent = 2
        eff = Decimal.max(weakling.pow(exponent).add(1),1)
        if(hasMilestone("c",20)&&!inChallenge("dm",22)) eff = eff.div(tmp.c.udNerfWeaklingEffect)
        if(hasMilestone("c",72)) eff = eff.mul(tmp.c.ecToWeaklingEffect)
        return eff
    },
    effectDescription() {
        let effText = "which are dividing Mentality gain by "+layerText("h2","w",format(this.effect()))+"."
        if(inChallenge("a",21)||inChallenge("a",22)) effText = "which are multiplying Mentality gain by "+layerText("h2","w",format(this.effect()))+"."
        return effText
    },

    automate() {
       if(player.c.autoStrengthen) {
            layers.w.buyables[11].buyMax()
            layers.w.buyables[12].buyMax()
       }
    },

    update(diff) {
        if(!player.w.unlocked) tmp.w.instantUnlockLayer
        
        if(hasMilestone("c",80)&&tmp.c.bulkBuyCount < 25) {
            player.w.timer = player.w.timer + diff
            if(player.w.timer > 1/tmp.c.bulkBuyCount) {
                player.w.timer = 0
                layers.w.buyables[14].buy()
            }
        }
        if(tmp.c.bulkBuyCount >=25) layers.w.buyables[14].buy()
        tmp.w.restartWD
    },

    buyables: {
        11: {
            title: "Mentality Strengthen",
            baseCost() {
                let cost = new Decimal(10)
                if(hasUpgrade(this.layer,22)) cost = cost.div(upgradeEffect(this.layer,22))
                if(hasUpgrade(this.layer,42)) cost = cost.div(upgradeEffect(this.layer,42))
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(5), new Decimal(15), new Decimal(7500)]
                let accel = new Decimal(1.6)
                let addedPow = x.sub(79).mul(x.sub(79).add(1)).div(2)
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(9)).mul(scale[1].pow(x.sub(9))),
                    base.mul(scale[0].pow(9)).mul(scale[1].pow(40)).mul(scale[2].pow(x.sub(49)))
                ]
                let consume = scaledCost[0]
                if(x.gte(10)&&x.lt(50)) consume = scaledCost[1]
                if(x.gte(50)&&x.lt(80)) consume = scaledCost[2]
                if(x.gte(80)) consume = scaledCost[2].mul(accel.pow(addedPow))
                return consume
            },
            addedBuys() {
                let buys = new Decimal(0)
                if(hasUpgrade("w",44)) buys = buys.add(upgradeEffect("w",44))
                return buys
            },
            addedBase() {
                let base = new Decimal(0)
                if(hasUpgrade("c",14)) base = base.add(upgradeEffect("c",14))
                return base
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                x = x.add(tmp.w.buyables[11].addedBuys)
                base = base.add(tmp.w.buyables[11].addedBase)
                if(x.gte(0)) eff = Decimal.pow(base,x)
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!this.canAfford()) return
                if(!hasUpgrade("c",14)) player.points = player.points.sub(tmp.w.MSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.MSStatus.buyCount).sub(player.w.MSStatus.bought))
            },
            display() {
                let baseGain = new Decimal(2)
                let gainDesc = "Double the Mentality gain!\n"
                let effText = "Currently: ×"+format(this.effect())+"<br>"
                let boughtText = "("+formatWhole(getBuyableAmount("w",11))+" purchased)<br><br>"
                let costText = "Cost: "+format(this.cost())+" Mentality"
                if (tmp.w.buyables[11].addedBuys.gt(0)) boughtText = "("+formatWhole(getBuyableAmount("w",11))+"+"+formatWhole(tmp.w.buyables[11].addedBuys)+" purchased)<br><br>"
                if (tmp.w.buyables[11].addedBase.gt(0)) gainDesc = "×"+format(baseGain.add(tmp.w.buyables[11].addedBase))+" Mentality gain!<br>"
                return gainDesc+effText+boughtText+costText
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return !inChallenge("dm",22)}
        },
        12: {
            title: "Weakling Strengthen",
            baseCost() {
                let cost = new Decimal(5)
                if((hasMilestone("c",21)&&!inChallenge("dm",22))) cost = cost.div(tmp.c.udNerfWSCost)
                if((hasMilestone("c",20)&&inChallenge("dm",22))) cost = cost.div(tmp.c.udNerfWSCost)
                if(hasUpgrade(this.layer,65)) cost = cost.div(upgradeEffect(this.layer,65))
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(3), new Decimal(6), new Decimal(12), new Decimal(2400)]
                let accel = new Decimal(1.5)
                let addedPow = x.sub(159).mul(x.sub(159).add(1)).div(2)
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(x.sub(11))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(x.sub(23))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(57)).mul(scale[3].pow(x.sub(80)))
                ]
                let consume = scaledCost[0]
                if(x.gte(12)&&x.lt(24)) consume = scaledCost[1]
                if(x.gte(24)&&x.lt(81)) consume = scaledCost[2]
                if(x.gte(81)&&x.lt(160)) consume = scaledCost[3]
                if(x.gte(160)) consume = scaledCost[3].mul(accel.pow(addedPow))
                return consume
            },
            addedBuys() {
                let buys = new Decimal(0)
                if(hasUpgrade("w",72)) buys = buys.add(upgradeEffect("w",72))
                if(hasUpgrade("w",44)) buys = buys.add(upgradeEffect("w",44))
                if(hasMilestone("c",2)&&inChallenge("dm",22)) buys = buys.add(tmp.c.resetsToWSCount)
                return buys
            },
            addedBase() {
                let base = new Decimal(0)
                if(hasUpgrade("c",34)) base = base.add(upgradeEffect("c",34))
                if(hasUpgrade("w",73)) base = base.add(upgradeEffect("w",73))
                if(hasMilestone("c",87)) base = base.add(tmp.c.ecToWSBaseMult)
                return base
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                x = x.add(tmp.w.buyables[12].addedBuys)
                base = base.add(tmp.w.buyables[12].addedBase)
                if(x.gte(0)) eff = Decimal.pow(base,x).round()
                return eff
            },
            canAfford() {return player[this.layer].points.gte(this.cost())},
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!this.canAfford()) return;
                if(!(hasMilestone("c",1)&&inChallenge("dm",22))&&!hasUpgrade("c",34)) player.w.points = player.w.points.sub(tmp.w.WSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.WSStatus.buyCount).sub(player.w.WSStatus.bought))
            },
            display() {
                let baseGain = new Decimal(2)
                let gainDesc = "Double the Weakling Dust gain!\n"
                let effText = "Currently: ×"+format(this.effect())+"<br>"
                let boughtText = "("+formatWhole(getBuyableAmount("w",12))+" purchased)<br><br>"
                let costText = "Cost: "+format(this.cost())+" Weakling Dust"
                if (tmp.w.buyables[12].addedBuys.gt(0)) boughtText = "("+formatWhole(getBuyableAmount("w",12))+"+"+formatWhole(tmp.w.buyables[12].addedBuys)+" purchased)<br><br>"
                if (tmp.w.buyables[12].addedBase.gt(0)) gainDesc = "×"+format(baseGain.add(tmp.w.buyables[12].addedBase))+" Weakling Dust gain!<br>"
                return gainDesc+effText+boughtText+costText
            },
            style: {'touch-action':'manipulation'}
        },
        14: {
            title: "Demonic Strengthen",
            baseCost() {
                let cost = new Decimal(50)
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(4), new Decimal(16)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(19)).mul(scale[1].pow(x.sub(19))),
                ]
                let consume = scaledCost[0]
                if(x.gte(20)) consume = scaledCost[1]
                return consume
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                if(x.gte(0)) eff = Decimal.pow(base,x)
                return eff
            },
            canAfford() {return player.de.gte(this.cost())},
            buy() {
                if(!this.canAfford()) return
                player.de = player.de.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let gainDesc = "Double the Demonic Essence gain!\n"
                let effText = "Currently: ×"+format(this.effect())+"<br>"
                let boughtText = "("+formatWhole(getBuyableAmount("w",14))+" purchased)<br><br>"
                let costText = "Cost: "+format(this.cost())+" Demonic Essence"
                return gainDesc+effText+boughtText+costText
            },
            style: {'background'() {
                let colors = colorPalette("dc22")
                let color = colors[1]
	            if(tmp["w"].buyables[14].canAfford) color = colors[0]
                return color
            },'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)}
        },
    },

    upgrades: {
        11: {
            title: "Weakling UP",
            description: "Triple Weakling Dust gain.",
            cost: new Decimal(20),
            style: {'touch-action':'manipulation'},
            unlocked() {
                if(inChallenge("dm",11)) return (player.c.ud.gt(0))
                if(inChallenge("dm",22)||inChallenge("a",22)) return false
                if(hasMilestone("c",41)) return true
                return (player[this.layer].buyables[12].gte(2))
            }
        },
        12: {
            title: "Weakling UP II",
            description: "Quadruple Weakling Dust gain.",
            cost: new Decimal(200),
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,11))}
        },
        13: {
            title: "Alleviate",
            description: "Decrease the base division exponent of Weakling Dust effect.<br>(^0.5 → ^0.4)",
            cost: new Decimal(1000),
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,12))}
        },
        14: {
            title: "Mega Buff",
            description: "Quintuples (5x) Mentality gain.",
            cost: new Decimal(2500),
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,13))}
        },
        15: {
            title: "Contradiction",
            description: "Boosts Mentality based on Weakling Dust.",
            cost: new Decimal(10000),
            tooltip: "Wait something doesn't seem right-",
            effect() {
                let eff = new Decimal(1)
                if (player[this.layer].points.gte(1)) eff = Decimal.log10(player[this.layer].points).mul(3).add(1)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,14))}
        },
        21: {
            title: "Weakling UP III",
            description: "Boosts Weakling Dust based on Mentality.",
            cost: new Decimal(25000),
            base() {
                let base = player.points.add(1).sqrt()
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[21].base
                let sftcap = new Decimal(1000)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.6).mul(sftcap)
                return eff
            },
            effectDisplay() {
                if (tmp.w.upgrades[21].effect.gte(1000)) return format(this.effect())+"× (softcapped)"
                return format(this.effect())+"×"
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,15))}
        },
        22: {
            title: "Total Reduction",
            description: "Divide the cost of <b>Mentality Strengthen</b> based on Weakling Dust.",
            cost: new Decimal(100000),
            effect() {
                return player[this.layer].points.pow(0.2).div(3.3).add(1)
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,21))}
        },
        23: {
            title: "Self-Synergy",
            description: "Mentality boost itself.",
            cost: new Decimal(500000),
            base() {
                let base = player.points.add(1).pow(0.6).div(4).add(1)
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[23].base
                let sftcap = new Decimal(100)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.6).mul(sftcap)
                return eff
            },
            effectDisplay() {
                if (tmp.w.upgrades[23].effect.gte(100)) return format(this.effect())+"× (softcapped)"
                return format(this.effect())+"×"
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,22))}
        },
        24: {
            title: "Powerful Weakling",
            description: "Weakling Dust boosts itself.",
            cost: new Decimal(1000000),
            base() {
                let base = player[this.layer].points.pow(0.4).div(8).add(1)
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[24].base
                let sftcap = new Decimal(10000)
                let sftcap2 = new Decimal(1e69)
                if (hasUpgrade("w",34)) sftcap = new Decimal(1e9)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.5).mul(sftcap)
                if (eff.gte(sftcap2)) eff = eff.div(sftcap2).pow(0.2).mul(sftcap2)
                return eff
            },
            effectDisplay() {
                let eff = tmp.w.upgrades[24].effect
                let sftcap = new Decimal(10000)
                let sftcap2 = new Decimal(1e69)
                if (hasUpgrade("w",34)) sftcap = new Decimal(1e9)
                if (eff.gte(sftcap) && eff.lt(sftcap2)) return format(this.effect())+"× (softcapped)"
                if (eff.gte(sftcap2)) return format(this.effect())+"× (softcapped^2)"
                return format(this.effect())+"×"
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,23))}
        },
        25: {
            title: "Crystalize",
            description() {
                if(hasUpgrade("c",53)) {
                    return "Weakling Dust boosts the gain of Crystals at a greatly reduced rate.<br>"+
                    "Currently: "+format(this.effect())+"×"
                }
                return "Unlocks the next layer."
            },
            effect() {
                let eff = new Decimal(1)
                if(hasUpgrade("c",53)) eff = player.w.points.pow(0.05).div(1.2).max(1)
                return eff
            },
            cost: new Decimal(3e9),
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade(this.layer,24))}
        },
        31: {
            title: "Weakling Up IV",
            description: "Weakling Dust gain ^1.2.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e24)
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasMilestone("c",25)||inChallenge("dm",21))&&!inChallenge("dm",22)&&!inChallenge("a",22)}
        },
        32: {
            title: "Real Weakening",
            description: "Weakling Dust divides the Unstable Dust effect.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e30)
            },
            effect() {
                let eff = player.w.points.pow(0.125).div(1.5).max(1)
                return eff
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade("w",31)||inChallenge("dm",21))}
        },
        33: {
            title: "Alleviate II",
            description: "Decrease the base division exponent of Weakling Dust effect.<br>(^0.4 → ^0.25)",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e40)
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade("w",32)||inChallenge("dm",21))}
        },
        34: {
            title: "Powerful Weakling II",
            description: "Delays the softcap of <b>Powerful Weakling</b>.<br>(softcap start: "+format(1e4)+" -> "+format(1e9)+")",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e51)
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade("w",33)||inChallenge("dm",21))}
        },
        35: {
            title: "Duality",
            description: "Enhances the effect of <b>Benediction</b> and <b>Imprecation</b> to twice of their original amount.",
            tooltip: "You can rest for a while after this upgrade~",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e57)
            },
            style: {'touch-action':'manipulation'},
            unlocked() {return (hasUpgrade("w",34)||inChallenge("dm",21))}
        },
        41: {
            title: "Fusion",
            description: "Boosts Weakling Dust based on Mentality.",
            tooltip: "Don't be deceived by the large number! the effect of this upgrade is still affected by the restriction of the challenge.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(1e6),
            effect() {
                let eff = player.points.pow(0.95).mul(20).max(1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",41)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("a",22)}
        },
        42: {
            title: "Resemblence",
            description: "Divides the cost of <b>Mentality Strengthen</b> based on Weakling Dust.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(6.5e6),
            effect() {
                let eff = player.w.points.pow(0.6).div(3.6).max(1)
                return eff
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",42)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,41)}
        },
        43: {
            fullDisplay() {
                let eff = upg43WEffect()
                let title = "<h3>Growth</h3>"
                let description = "Angelic Essence boosts both Mentality and Weakling Dust."
                let effText = "Currently: ×"+format(eff[0])+" to Mentality, ×"+format(eff[1])+" to Weakling Dust"
                let cost = "Cost: "+formatWhole(tmp.w.upgrades[43].cost)+" Angelic Essence"
                return title+"<br>"+description+"<br>"+effText+"<br><br>"+cost
            },
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(1e7),
            style: {'background'() {return upgradeButtonStyle("ac22","w",43)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,42)}
        },
        44: {
            title: "Lift",
            description: "From this upgrade on, gain 3 free purchases for both Strengthens.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(1.5e7),
            effect() {
                let eff = new Decimal(3)
                eff = eff.mul(getUpgCount("w",44,56))
                return eff
            },
            effectDisplay() {
                return "+"+formatWhole(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",44)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,43)}
        },
        45: {
            title: "Embrace",
            description: "Boosts Angelic Essence based on the sum of purchases on both Strengthens. Unlocks Offering.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(2e7),
            effect() {
                let addedBuy11 = tmp.w.buyables[11].addedBuys
                let addedBuy12 = tmp.w.buyables[12].addedBuys
                let buy11 = getBuyableAmount(this.layer,11).add(addedBuy11)
                let buy12 = getBuyableAmount(this.layer,12).add(addedBuy12)
                let eff = buy11.add(buy12).pow(0.5).max(1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",45)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,44)}
        },
        51: {
            fullDisplay() {
                let eff = this.effect()
                let title = "<h3>Virtue Strengthen</h3><br>"
                let description = "Enhances the effect of Virtuous Purification Power based on <b>Mentality Strengthen</b>.<br>"
                let effText = "Currently: ×"+format(eff)+"<br><br>"
                let cost = "Cost: "+formatWhole(tmp.w.upgrades[51].cost)+" Angelic Essence"
                if(player.off.offeredAE.lt(1e9)) {
                    title = "<h3>Locked</h3><br>"
                    description = "Offer a total of 1e9 Angelic Essence to unlock this upgrade."
                    effText = ""; cost = ""
                }
                return title+description+effText+cost
            },
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost() {
                if(player.off.offeredAE.lt(1e9)) return new Decimal("9.99e9,999")
                return new Decimal(1e9)
            },
            effect() {
                let addedBuy11 = tmp.w.buyables[11].addedBuys
                let buy11 = getBuyableAmount(this.layer,11).add(addedBuy11)
                let eff = Decimal.pow(1.05,buy11)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",51)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,45)}
        },
        52: {
            fullDisplay() {
                let eff = this.effect()
                let title = "<h3>Why Evil?</h3><br>"
                let description = "Enhances the effect of Evil Purification Power based on <b>Weakling Strengthen</b>.<br>"
                let effText = "Currently: ×"+format(eff)+"<br><br>"
                let cost = "Cost: "+formatWhole(tmp.w.upgrades[52].cost)+" Angelic Essence"
                if(player.off.offeredAE.lt(5e9)) {
                    title = "<h3>Locked</h3><br>"
                    description = "Offer a total of 5e9 Angelic Essence to unlock this upgrade."
                    effText = ""; cost = ""
                }
                return title+description+effText+cost
            },
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost() {
                if(player.off.offeredAE.lt(5e9)) return new Decimal("9.99e9,999")
                return new Decimal(1.5e9)
            },
            effect() {
                let addedBuy12 = tmp.w.buyables[12].addedBuys
                let buy12 = getBuyableAmount(this.layer,12).add(addedBuy12)
                let eff = Decimal.pow(1.075,buy12)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",52)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,51)}
        },
        53: {
            fullDisplay() {
                let eff = this.effect()
                let title = "<h3>When you</h3><br>"
                let description = "Improve the Angelic Essence gain formula from Weakling Dust."
                let effText = "Currently: <br>^2.4 → ^"+format(eff,1)+"<br><br>"
                let cost = "Cost: "+formatWhole(tmp.w.upgrades[53].cost)+" Angelic Essence"
                if(player.off.offeredAE.lt(1e10)) {
                    title = "<h3>Locked</h3><br>"
                    description = "Offer a total of 1e10 Angelic Essence to unlock this upgrade."
                    effText = ""; cost = ""
                }
                return title+description+effText+cost
            },
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost() {
                if(player.off.offeredAE.lt(1e10)) return new Decimal("9.99e9,999")
                return new Decimal(2.25e9)
            },
            effect() {
                let eff = new Decimal(2.6)
                return eff
            },
            effectDisplay() {
                return "<br>^2.4 → ^"+format(this.effect(),1)
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",53)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,52)}
        },
        54: {
            title: "can be",
            description: "Improve the Angelic Essence gain formula from Mentality.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(4.5e9),
            effect() {
                let eff = new Decimal(1.75)
                return eff
            },
            effectDisplay() {
                return "<br>^1.6 → ^"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",54)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade("w",53)}
        },
        55: {
            title: "something greater?",
            description: "Unstable Dust also increases Angelic Essence gain.",
            currencyDisplayName: "Angelic Essence",
            currencyInternalName: "ae",
            cost: new Decimal(1e10),
            effect() {
                let eff = player.c.ud.max(1).log(5).pow(2.2)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("ac22","w",55)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade("w",54)}
        },
        61: {
            title: "Awakening Call",
            description: "Reclaim the generation of Weakling Dust.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(400),
            style: {'background'() {return upgradeButtonStyle("dc22","w",61)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(2)||player.c.resetCount.gt(0)||hasMilestone("c",81))}
        },
        62: {
            title: "Sigma Resonance",
            description: "Demonic Essence boosts Weakling Dust directly.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(450),
            effect() {
                return player.de.add(1)
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",62)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,61)||hasMilestone("c",81)}
        },
        63: {
            title: "A Weak Respond",
            description: "Weakling Dust slightly boosts Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(500),
            effect() {
                let eff = player.w.points.max(1).log10().pow(0.2).max(1)
                if(hasUpgrade("w",71)) eff = eff.mul(3)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",63)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,62)||hasMilestone("c",81)}
        },
        64: {
            title: "Instability Demon",
            description: "Boosts Demonic Essence based on Unstable Dust.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(1200),
            effect() {
                return player.c.ud.max(1).log10().pow(0.75).max(1)
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",64)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(3)||hasMilestone("c",81))}
        },
        65: {
            title: "Bargaining",
            description: "Decrease the price of <i>Weakling Strengthen</i> based on Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(20000),
            effect() {
                return player.de.max(1).pow(0.5).max(1)
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",65)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(5)||hasMilestone("c",81))}
        },
        66: {
            title: "Wealth",
            description: "Each purchase of <i>Weakling Strengthen</i> provides a boost for Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(20000),
            effect() {
                let WScount = getBuyableAmount("w",12)
                if(hasUpgrade(this.layer,72)) WScount = WScount.add(upgradeEffect(this.layer,72))
                let eff = WScount.pow(0.5).max(1)
                if(hasUpgrade(this.layer,74)) eff = Decimal.pow(1.0625,WScount)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",66)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,65)||hasMilestone("c",81)}
        },
        71: {
            title: "OP of Weak",
            description: "Significantly increase the effect of <i>A Weak Respond</i>.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            tooltip: "OP = opposite :)",
            effect() {
                let eff = new Decimal(3)
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            cost: new Decimal(2000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",71)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(player.ae.gt(0)||hasMilestone("c",81))}
        },
        72: {
            title: "Decay",
            description() {
                let desc = "For every upgrade purchased after this, 2 free <i>Weakling Strengthen</i> will be added."
                if(hasUpgrade(this.layer,76)) desc = "For every upgrade purchased after this, 4 free <i>Weakling Strengthen</i> will be added."
                return desc
            },
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            effect() {
                let eff = new Decimal(2)
                eff = eff.mul(getUpgCount("w",72,76))
                if(hasUpgrade(this.layer,76)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+formatWhole(this.effect())
            },
            cost: new Decimal(12000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",72)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(10)||hasMilestone("c",81))}
        },
        73: {
            title: "Gray Shift",
            description() {
                let desc = "For every upgrade purchased in this tab, The effect of <i>Weakling Strengthen</i> is increased by 0.02 per level."
                if(hasUpgrade(this.layer,76)) desc = "For every upgrade purchased in this tab, The effect of <i>Weakling Strengthen</i> is increased by 0.04 per level."
                return desc
            },
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            effect() {
                let eff = new Decimal(0.02)
                eff = eff.mul(getUpgCount("w",61,76))
                if(hasUpgrade(this.layer,76)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+formatWhole(this.effect())
            },
            cost: new Decimal(14000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",73)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,72)||hasMilestone("c",81)}
        },
        74: {
            title: "Enrichment",
            description: "Change the formula for <i>Wealth</i>.<br>(x^0.5 → 1.0625^x)",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(16000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",74)},'touch-action':'manipulation'},
            unlocked() {return hasUpgrade(this.layer,73)||hasMilestone("c",81)}
        },
        75: {
            title: "Ground Zero",
            description: "Drastically improve the effect of the first Unstable Dust milestone.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(1e8),
            effect() {
                let eff = new Decimal(4)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",75)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(11)||hasMilestone("c",81))}
        },
        76: {
            title: "Stereo",
            description: "The effects of <i>Decay</i> and <i>Gray Shift</i> are doubled.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(3.5e8),
            style: {'background'() {return upgradeButtonStyle("dc22","w",76)},'touch-action':'manipulation'},
            unlocked() {return inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(12)||hasMilestone("c",81))}
        },
    },
    clickables: {
        11: {
            title() {
                let csBaseGain = (player.w.points.gte(tmp.c.requires)?player.w.points.div(tmp.c.requires).pow(tmp.c.exponent):new Decimal(0))
                let csTotalGain = csBaseGain.mul(tmp.c.gainMult).floor()
                return "<h2>Sacrifice everything for +"+formatWhole(csTotalGain)+" Crystal Shard"+(csTotalGain.eq(1)?"":"s")+"</h2>"
            },
            display() {
                let displayText = "<h3>Requires "+format(tmp.w.deReq)+" Demonic Essence</h3><br>More infos in the prestige button of Crystal Shards"
                if(hasMilestone("c",7)) displayText = ""
                if(hasMilestone("c",81)) displayText = "<br><h3>You have "+formatWhole(player.c.points)+"/"+formatWhole(tmp.c.crystalCost)+" Crystal Shards.</h3>"
                return displayText
            },
            onClick() {
                let csBaseGain = (player.w.points.gte(tmp.c.requires)?player.w.points.div(tmp.c.requires).pow(tmp.c.exponent):new Decimal(0))
                let csTotalGain = csBaseGain.mul(tmp.c.gainMult).floor()
                let keep = []
                player.c.points = player.c.points.add(csTotalGain)
                player.c.total = player.c.total.add(csTotalGain)
                player.c.resetCount = player.c.resetCount.add(1)
                if(hasMilestone("c",81)) keep.push("upgrades")
                layerDataReset("w",keep)
                player.de = new Decimal(0)
                player.ae = new Decimal(0)
            },
            canClick() {
                if(hasUpgrade("c",91)) return false
                if(hasMilestone("c",7)) return player.w.points.gte(tmp.c.requires)
                return (player.w.points.gte(tmp.c.requires)&&player.de.gte(tmp.w.deReq))
            },
            unlocked() {return ((player.w.points.gte(1e45)&&challengeCompletions("dm",22) > 0)||hasMilestone("c",81))&&inChallenge("dm",22)},
            style: {'width': '500px', 'height': '150px','touch-action':'manipulation','background'() {
                let colors = colorPalette("dc22")
                let color = colors[1]
	            if(tmp["w"].clickables[11].canClick) color = colors[0]
                return color
            }},
        },
    }
}) // Weakling

function offEffBlockFormat(id, unlocked=true) {
    let bgColor = colorPalette("ac22")[id]
    let blockStyle = {'width':'400px','height':'50px','display':'block','align-content':'center','background':bgColor,'color':'black'}
    if(!unlocked) blockStyle = {'visibility':'hidden'}
    return blockStyle
}

function olDescBlockFormat(unlocked=true) {
    let blockStyle = {'width':'280px','display':'block','align-content':'center'}
    if(!unlocked) blockStyle = {'visibility':'hidden'}
    return blockStyle
}

addLayer("off", {
    name: "Offering",
    row: 0,
    position: 1,
    startData() {return {
        unlocked: true,
        offeredAE: new Decimal(0),
        ol: new Decimal(0) // Offering Level
    }},
    color: "rgb(252, 244, 132)",
    layerShown: false,
    tabFormat: [
        ["infobox","offering"],
        ["display-text", function() {
            let aeText = "<br>You have "+colorText("h3",tmp.a.color,formatWhole(player.ae))+" Angelic Essence. (+"+format(aeGain())+"/s)"
            return aeText
        }],"blank",
        "clickables", "blank",
        ["display-text", function() {
            let offerText = "<br>You have offered <h2>"+formatWhole(player.off.offeredAE)+"</h2> Angelic Essence to God,<br>"+
            "in which transferred to <h2>"+formatWhole(player.off.ol)+"</h2> Offering Level.<br>"
            let nextText = "(Next at "+format(tmp.off.olReq)+" total AE offered)"
            return offerText+nextText
        }],"blank","blank",
        ["row", [
            ["display-text", function() {
                let offerText = "Your Offering Level is <h2>"+formatWhole(player.off.ol)+"</h2>,<br>which has the following perks:<br>(based on resources offered)"
                if(!hasMilestone("off",0)) offerText = ""
                return offerText
            }, function() {return olDescBlockFormat(hasMilestone("off",0))}],
            ["column", [
                ["display-text", function() {
                let effText = "×<h2>"+format(tmp.off.offAEToAE)+"</h2> Angelic Essence gain."
                if(!hasMilestone("off",0)) effText = ""
                return effText
                },function() {return offEffBlockFormat(0,hasMilestone("off",0))}],
                ["display-text", function() {
                let effText = "×<h2>"+format(tmp.off.offAEToWD)+"</h2> Weakling Dust gain."
                if(!hasMilestone("off",1)) effText = "<i>Next unlocks at Offering Level 2.</i>"
                if(!hasMilestone("off",0)) effText = ""
                return effText
                },function() {return offEffBlockFormat(1,hasMilestone("off",0))}],
                ["display-text", function() {
                let effText = "×<h2>"+format(tmp.off.offAEToMentality)+"</h2> Mentality gain."
                if(!hasMilestone("off",2)) effText = "<i>Next unlocks at Offering Level 3.</i>"
                if(!hasMilestone("off",1)) effText = ""
                return effText
                },function() {return offEffBlockFormat(0,hasMilestone("off",1))}],
                ["display-text", function() {
                let effText = "/<h2>"+format(1)+"</h2> Demonic Essence gain."
                if(!hasMilestone("off",3)) effText = "<i>Next unlocks at Offering Level 4.</i>"
                if(!hasMilestone("off",2)||challengeCompletions("a",22) == 0) effText = ""
                return effText
                },function() {return offEffBlockFormat(1,hasMilestone("off",2)&&(challengeCompletions("a",22) > 0))}],
            ], {'width':'420px'}]
        ]]
    ],
    infoboxes: {
        offering: {
            title: "Offering",
            body() {
                return `Looks like you had gained back some of the prosperities you once had! That's great! Now to actually continue,
                we may have to take- borrow some power from you.<br><br>
                <div style='color:rgb(252, 244, 132);text-shadow:0px 0px 10px'>Give us all your Angelic Essence and we'll make you a greater influence.</div>`
            }
        }
    },

    offAEToAE() {
        let mult = player.off.offeredAE.pow(0.1).div(2).max(1)
        return mult
    },

    offAEToWD() {
        let mult = player.off.offeredAE.pow(2.25).mul(6).max(1)
        return mult
    },

    offAEToMentality() {
        let mult = player.off.offeredAE.pow(0.32).div(1.2).max(1)
        return mult
    },

    olReq() {
        let req = new Decimal(1e8), ol = player.off.ol
        if(ol.gt(0)) {
            for(let exp = new Decimal(2); exp.lte(ol.add(1)); exp = exp.add(1))
                req = req.mul(Decimal.pow(10,exp))
        }
        return req
    },

    clickables: {
        11: {
            display() {
                return "Offer all "+formatWhole(player.ae)+" Angelic Essence to the angels.<br>(You need at least "+format(1e8)+" Angelic Essence to offer)"
            },
            onClick() {
                let offerCount = player.ae
                player.ae = new Decimal(0)
                player.off.offeredAE = player.off.offeredAE.add(offerCount)
                if(player.off.offeredAE.gte(tmp.off.olReq)) player.off.ol = player.off.ol.add(1)
            },
            canClick() {return player.ae.gte(1e8)},
            style: {'touch-action':'manipulation','background'() {
                let colors = colorPalette("c")
                let color = colors[1]
                colors = colorPalette("ac22")
	            if(tmp["off"].clickables[11].canClick) color = colors[0]
                return color
            }},
        }
    },

    milestones: {
        0: {
            requirementDescription: "Offering Level 1",
            done() {return player.off.ol.gte(1)},
        },
        1: {
            requirementDescription: "Offering Level 2",
            done() {return player.off.ol.gte(2)},
        },
        2: {
            requirementDescription: "Offering Level 3",
            done() {return player.off.ol.gte(3)},
        },
        3: {
            requirementDescription: "Offering Level 4",
            done() {return player.off.ol.gte(4)},
        },
    }
}) // Offering
