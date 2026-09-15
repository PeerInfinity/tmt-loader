addLayer("m", {
    name: "Mafia",
    symbol: "m",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        mafiaBarXP: new Decimal(0),
        mafiaBarLevel: new Decimal(0),
    }},
    layerShown() { return player[this.layer].unlocked || hasUpgrade("k", 41) },
    color: "#FFFAEE",
    requires: new Decimal(11),
    row: "1",
    resource: "Money",
    baseResource: "IQ",
    baseAmount() {return player.k.points},
    type: "static",
    autoPrestige() { 
        if (hasMilestone("y", 2) || hasMilestone("d", 2)) return true
        else return false
    },
    resetsNothing() { return hasMilestone("d", 2) || hasMilestone("y", 2)},
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []
            let mafiaLevel = new Decimal(player[this.layer].mafiaBarLevel)

            if(hasMilestone("d", 5) || hasMilestone("y", 2)) keep.push("upgrades")

            layerDataReset(this.layer, keep) 

            if(hasMilestone("d", 5)) {
                if (hasMilestone("y", 2)) player[this.layer].mafiaBarLevel = new Decimal(0)
                else player[this.layer].mafiaBarLevel = new Decimal(mafiaLevel)
            }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "upgrades",
        "blank",
        "milestones",
        "blank",
        ["display-text", function() {
            let data = player[this.layer]
            return "Mafia level: "+data.mafiaBarLevel}],
        "blank",
        ["bar", "11"],
        "blank",
        "buyables",
        "blank",
    ],
    roundUpCost: "true",
    exponent() {
         if (player[this.layer].points.gte(1e4)) return 0.25
         else return 0.38
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        if (hasUpgrade("m", 14)) mult = mult.times(upgradeEffect("m", 14))
        if (hasUpgrade("d", 31)) mult = mult.times(300)
        if (hasUpgrade("o", 11)) milt = mult.times(10)
        if (hasUpgrade("y", 11)) milt = mult.times(100)
        return mult
    },
    canBuyMax() {return true},
    upgrades: {
        11: {
            unlocked() {return true},
            title: "Hire worker",
            description: "You now have mafia worker",
            tooltip: "Вы наняли первого работника! Поздравляю!",
            cost: new Decimal(1),
        },
        12: {
            unlocked() {return player[this.layer].mafiaBarLevel.gte(2)},
            title: "nice level bro",
            description: "Mafia level boost points",
            cost: new Decimal(1),
            effect() {
                return new Decimal(player[this.layer].mafiaBarLevel).pow_base(1e7)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 12))+'x'},
        },
        13: {
            unlocked() {return player[this.layer].mafiaBarLevel.gte(3)},
            title: "nice level bro v2",
            description: "Mafia level boost PP",
            cost: new Decimal(1),
            effect() {
                return new Decimal(player[this.layer].mafiaBarLevel).pow_base(1e14)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 13))+'x'},
        },
        14: {
            unlocked() {return player[this.layer].mafiaBarLevel.gte(5)},
            title: "Money producing",
            description: "buff to money gain based on Mafia level",
            tooltip: "Чем больше уровень мафии, тем больше денег вы получаете всё логично!",
            cost: new Decimal(1),
            effect() {
                return new Decimal(player[this.layer].mafiaBarLevel).pow_base(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 14))+'x'},
        },
        15: {
            unlocked() {return hasUpgrade("m", 14)},
            title: "Money using",
            description: "buff to PP gain based on money",
            cost: new Decimal(2),
            effect() {
                hardcap = new Decimal(1e100)
                if (hasUpgrade("k", 54)) hardcap = new Decimal(1e150)
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                if (hasUpgrade("z", 14)) hardcap = hardcap.times("1e5000000")
                return new Decimal(player[this.layer].points).pow_base(1e15).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 15))+'x'},
        },
        21: {
            unlocked() {
                if (hasUpgrade(this.layer, 21)) return false
                else return hasUpgrade("m", 15)
            },
            title: "2nd row",
            description: "Unlocks 2nd row of money upgrades",
            cost: new Decimal(5),
        },
        31: {
            unlocked() { return hasUpgrade(this.layer, 21) },
            title: "If you want good mafia you need money",
            description: "buffs mafia XP based on money",
            tooltip: "Чем больше денег, тем больше возможностей у мафии, всё снова логично!",
            cost: new Decimal(6),
            effect() {
                hardcap = new Decimal(1e12)
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return new Decimal(player.m.points).pow(3).plus(1).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 31))+"x" }
        },
        32: {
            unlocked() { return hasUpgrade("m", 21)},
            title: "Hire manager",
            tooltip: "Поздравляю вас с вашим новым менеджером, ваша мафия начинает достигать новых высот!",
            description: "Every mafia needs control",
            cost: new Decimal(3670),
        },
        33: {
            unlocked() { return hasUpgrade("m", 21)},
            title: "Buy nuts",
            description: "more nuts gives you x20 mafia XP",
            tooltip: "Ваши рабочие начали делать резьбу на гайках, и вы стали получать больше уровня мафии.",
            cost: new Decimal(191740),
        },
        34: {
            unlocked() { return hasUpgrade("m", 21)},
            title: "Finally points buff",
            description: "buff points gain based on money",
            cost: new Decimal(575218),
            effect(){
                hardcap = new Decimal(1e200)
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return new Decimal(player.m.points).plus(1).pow(4).min(hardcap)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, 34)) + "x"
            },
        },
        35: {
            unlocked() { return hasUpgrade("m", 21)},
            title: "Hire BOSS(Sashka)",
            description: "Every mafia needs control v2",
            tooltip: "Ну, конечно мы все знаем, что за мафией стоит Сашка, и та йно всем управляет, с ним вы можете ещё сильнее улучшить работника и менеджера",
            cost: new Decimal(1e11),
        },
        41: {
            unlocked() { 
                if (hasUpgrade("m", 41)) return false
                if (player.d.unlocked) return false
                else return new Decimal(player.m.mafiaBarLevel).gte(43)},
            title: "Dima",
            description: "Unlocks Dimitron",
            tooltip: "Димитрон?",
            cost: new Decimal(1e20),
        },
    },
    buyables: {
        11: {
            title: "Worker level",
            unlocked() {return hasUpgrade("m", 11)},
            cost(x) { return new Decimal(1e197).times(new Decimal(1e15).pow(x)) },
            display() { return "x200 to mafia XP gain" },
            canAfford() { return player.points.gte(this.cost()) },
            purchaseLimit() {
                return new Decimal(15).plus(buyableEffect("m", 13))
            },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                let data2 = tmp[this.layer].buyables[13]
                return "Cost: " + format(data.cost) + " points\n\
                Worker level: " + player[this.layer].buyables[this.id] + "/"+new Decimal(15).plus(data2.effect) +"\n\
                Gain " + format(data.effect) + "x more mafia XP" 
            },
            effect(x) { 
                eff = new Decimal(200).pow(x)
                return eff
            }, 
            displayEffect() { return format(buyableEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Manager level",
            unlocked() {return hasUpgrade("m", 32)},
            cost(x) { return new Decimal("1e546").times(new Decimal(new Decimal(1e30).pow(x))) },
            display() { return "x20 to mafia XP gain" },
            canAfford() { return player.p.points.gte(this.cost()) },
            purchaseLimit() {
                return new Decimal(15).plus(buyableEffect("m", 13))
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                let data2 = tmp[this.layer].buyables[13]
                return "Cost: " + format(data.cost) + " prestige points\n\
                Manager level: " + player[this.layer].buyables[this.id] + "/"+new Decimal(15).plus(data2.effect) +"\n\
                Gain " + format(data.effect) + "x more mafia XP" 
            },
            effect(x) { 
                eff = new Decimal(20).pow(x)
                return eff
            }, 
            displayEffect() { return format(buyableEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "BOSS level",
            unlocked() {return hasUpgrade("m", 35)},
            cost(x) { 
                add = new Decimal(2).times(x) 
                if (new Decimal(getBuyableAmount("m", 13)).eq(2)) add = add.sub(1)
                cost = new Decimal(18).plus(add)
                return cost
            },
            display() { return "+5 max mafia buyables except boss buyable" },
            canAfford() { return player.k.points.gte(this.cost()) },
            purchaseLimit() {
                blplus = new Decimal(0)
                if (hasUpgrade("d", 15)) blplus = new Decimal(2)
                if (hasUpgrade("d", 35)) blplus = new Decimal(12)
                return new Decimal(3).plus(blplus).plus(upgradeEffect("w", 22))
            },
            buy() {
                player.k.points = player.k.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                blplus = new Decimal(0)
                if (hasUpgrade("d", 15)) blplus = new Decimal(2)
                if (hasUpgrade("d", 35)) blplus = new Decimal(12)
                return "Cost: " + format(data.cost) + " IQ\n\
                BOSS level: " + player[this.layer].buyables[this.id] + "/"+new Decimal(3).plus(blplus).plus(upgradeEffect("w", 22)) +"\n\
                Gain " + format(data.effect) + " more buyables" 
            },
            effect(x) { 
                eff = new Decimal(5).times(x)
                return eff
            }, 
            displayEffect() { return format(buyableEffect(this.layer, this.id))+"x" },
        },
    },
    automate() {
        if ((hasUpgrade("w", 22) || hasUpgrade("o", 15) || hasUpgrade("y", 13)) && canBuyBuyable(this.layer, 11)) {
            let canBuy = new Decimal(1)
            let limit = new Decimal(tmp[this.layer].buyables["11"].purchaseLimit)
            if (hasUpgrade("o", 24) || hasUpgrade("y", 13)) {
                canBuy = new Decimal(Math.floor((new Decimal(player.points).div(1e197)).log(1e15).add(1)))
                if (canBuy.gte(1)) {
                    if (canBuy.gte(limit)) setBuyableAmount(this.layer, 11, limit);
                    else setBuyableAmount(this.layer, 11, canBuy) 
                }
            }  
            else addBuyables(this.layer, 11, canBuy)
            updateBuyableTemp(this.layer);
        }
        if ((hasUpgrade("w", 22) || hasUpgrade("o", 15) || hasUpgrade("y", 13)) && canBuyBuyable(this.layer, 12)) {
            let canBuy = new Decimal(1)
            let limit = new Decimal(tmp[this.layer].buyables["12"].purchaseLimit)
            if (hasUpgrade("o", 24)|| hasUpgrade("y", 13)) {
                canBuy = new Decimal(Math.floor(new Decimal(player.p.points).div("1e526").log(1e30).add(1)))
                if (canBuy.gte(1)) {
                    if (canBuy.gte(limit)) setBuyableAmount(this.layer, 12, limit);
                    else setBuyableAmount(this.layer, 12, canBuy) 
                }
            }  
            else addBuyables(this.layer, 12, canBuy)
            updateBuyableTemp(this.layer);
        }
        if ((hasUpgrade("w", 22) || hasUpgrade("o", 15) || hasUpgrade("y", 13)) && canBuyBuyable(this.layer, 13)) {
            let canBuy = new Decimal(1)
            let limit = new Decimal(tmp[this.layer].buyables["13"].purchaseLimit)
            if (hasUpgrade("o", 24)|| hasUpgrade("y", 13) ) {
                canBuy = new Decimal(Math.floor(new Decimal(player.k.points).sub(18).div(2)))
                if (canBuy.gte(1)) {
                    if (canBuy.gte(limit)) setBuyableAmount(this.layer, 13, limit);
                    else setBuyableAmount(this.layer, 13, canBuy) 
                }
            }  
            else addBuyables(this.layer, 13, canBuy)
            updateBuyableTemp(this.layer);
        }
    },
    update() {
        let mafiaBar = tmp[this.layer].bars[11]
        if (mafiaBar.unlocked) {
            let data = player[this.layer]
            if (mafiaBar.progress.gte(1)) {
            let hardness = new Decimal(1000)
            if (hasUpgrade("w", 24)) hardness = new Decimal(700)
            if (hasUpgrade("o", 13)) hardness = new Decimal(400)
            if (hasUpgrade("o", 23)) hardness = new Decimal(100)
            let lplus = Math.floor(new Decimal(mafiaBar.progress).log(hardness).plus(1))
            data.mafiaBarXP = new Decimal(0)
            data.mafiaBarLevel = data.mafiaBarLevel.plus(lplus)
            }   
            else {
            data.mafiaBarXPgain = new Decimal(0.01)
            data.mafiaBarXPgain = data.mafiaBarXPgain.times(buyableEffect(this.layer, 11))
            data.mafiaBarXPgain = data.mafiaBarXPgain.times(buyableEffect(this.layer, 12))
            if (hasUpgrade("k", 51)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(upgradeEffect("k", 51))
            if (hasUpgrade("r", 14)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(upgradeEffect("r", 14))
            if (hasUpgrade("k", 52)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(5)
            if (hasUpgrade("o", 11)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(10)
            if (hasUpgrade("m", 33)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(20)
            if (hasUpgrade("d", 13)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(upgradeEffect("d", 13))
            if (hasUpgrade(this.layer, 31)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(upgradeEffect(this.layer, 31))
            if (new Decimal(data.mafiaBarLevel).eq(2)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(3)
            if (new Decimal(data.mafiaBarLevel).eq(4)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(6)
            if (new Decimal(data.mafiaBarLevel).eq(8)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(4)
            if (hasUpgrade("d", 11)) data.mafiaBarXPgain = data.mafiaBarXPgain.times(5)
            data.mafiaBarXP = data.mafiaBarXP.plus(data.mafiaBarXPgain)
            }
        }
    },
    bars: {
        11: {
            unlocked() { return hasUpgrade("m", 11) },
        direction: RIGHT,
        width: 600,
        height: 50,
        progress() {
            let data = player[this.layer]
            let hardness = new Decimal(1000)
            if (hasUpgrade("w", 24)) hardness = new Decimal(700)
            if (hasUpgrade("o", 13)) hardness = new Decimal(400)
            if (hasUpgrade("o", 23)) hardness = new Decimal(100)
            return new Decimal(data.mafiaBarXP).div(new Decimal(data.mafiaBarLevel).pow_base(hardness))
        },
        },
    },
})