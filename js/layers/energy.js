addLayer("energy", {
    name: "Energy",
    symbol: "Nrg",
    position: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            resetTime: 0,
            timeBonus: new Decimal(0),
            firstGen: new Decimal(0),
            secondGen: new Decimal(0),
            thirdGen: new Decimal(0),
            fourthGen: new Decimal(0),
            fifthGen: new Decimal(0),
            sixthGen: new Decimal(0),

            justReset: false,
        }
    },
    tooltip() {
        return ("Energy")
    },
    color: "#FFFF00",
    requires: new Decimal(0),
    resource: "energy",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "none",
    exponent: 0.5,
    gainMult() {
        return new Decimal(1)
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 0,
    layerShown() { return true },
    doReset(resettingLayer) {
        justReset = false

        if (layers[resettingLayer].row > this.row) {
            let extraUpgrades = [];
            /*for (var i = 0; i < player[this.layer].upgrades.length; i++) {
                var upgradeVal = player[this.layer].upgrades[i]
                var purchased = false
                if (hasMilestone("b", 1) && (upgradeVal == 11 || upgradeVal == 12)) purchased = true;
                if (hasMilestone("b", 3) && (upgradeVal == 13 || upgradeVal == 14 || upgradeVal == 15)) purchased = true;
                if (hasMilestone("b", 5) && (upgradeVal == 21 || upgradeVal == 22 || upgradeVal == 23 || upgradeVal == 24 || upgradeVal == 25)) purchased = true;
                if (hasMilestone("b", 7) && (upgradeVal == 31 || upgradeVal == 32 || upgradeVal == 33 || upgradeVal == 34 || upgradeVal == 35)) purchased = true;

                if (purchased) extraUpgrades.push(upgradeVal)
            }*/

            layerDataReset(this.layer, [])

            player[this.layer].upgrades = extraUpgrades
        }
    },

    tabFormat: {
        "Generators": {
            content: [
                ["display-text",
                    function () {
                        if (new Decimal(energyCap()).gt(1e300) && player.points.gte(new Decimal(1e280))) {
                            var purchaseScalingStart = new Decimal(10).pow(308)
                            if (challengeCompletions("surge", 31) > 3) {
                                var delayExp = new Decimal(3).mul(player.energybank.points)
                                purchaseScalingStart = purchaseScalingStart.mul(new Decimal(10).pow(delayExp))
                            }

                            if (hasAchievement("ach", 33)) {
                                var chargerScalingStart = new Decimal(100)

                                return "Energy Generator cost scaling increases faster past " + format(purchaseScalingStart) + " energy.<br>"
                            }
                            return "Cost scaling increases faster past " + format(purchaseScalingStart) + " energy.<br>"
                        }
                        /*if (new Decimal(energyCap()).gt(1e100) && player.points.gte(new Decimal(1e250))) {
                            var purchaseScalingStart = 100

                            return "Cost scaling increases faster after " + format(purchaseScalingStart) + " purchases.<br>"
                        }*/

                        return ""
                    },
                ],
                ["display-text",
                    function () {
                        return ""

                        var purchaseScalingStart = 1000

                        return "Cost scaling increases even faster after " + format(purchaseScalingStart) + " purchases.<br>"
                    },
                ],
                ["display-text",
                    function () {
                        if (hasAchievement("ach", 33)) {
                            var chargerScalingStart = new Decimal(100)

                            return "Energy Charger cost scaling increases faster past the first " + format(chargerScalingStart) + " purchases.<br>"
                        }

                        return ""
                    },
                ],
                "blank",
                "buyables"
            ]
        },
        "Upgrades": {
            content: [
                "upgrades"
            ],
            unlocked() {
                return hasAchievement("ach", 13)
            }
        },
        "Upgrade Changes": {
            content: [
                ["display-text",
                    function () {
                        var challengeBuffs = ""
                        var challengeNerfs = ""

                        if (challengeCompletions("surge", 22) > 0) {
                            challengeBuffs += "'Better Time Boost' effect 10x minutes -> 1x seconds.<br>"
                        }
                        if (challengeCompletions("surge", 22) > 1) {
                            challengeBuffs += "'Surge Progress' effect 1x progress -> 2x progress.<br>"
                        }
                        if (challengeCompletions("surge", 22) > 2) {
                            challengeBuffs += "'Slight Time Bonus' logx(logx(Energy)) -> logx2(Energy).<br>"
                        }
                        if (challengeCompletions("surge", 22) > 3) {
                            challengeBuffs += "'Self Benefit' higher Energy Generators bonus +1% -> +2%.<br>"
                        }
                        if (challengeCompletions("surge", 22) > 4) {
                            challengeBuffs += "'Double Generation' effect 2x -> 3x.<br>"
                        }

                        if (inChallenge("surge", 22)) {
                            var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5)

                            challengeNerfs += "'Charged Boost' exponent 0.3 -> " + format(new Decimal(0.3).sub(completions.mul(0.04))) + " (-0.04 per tier)<br>"
                            challengeNerfs += "'Bonus Set' caps at +" + format(new Decimal(6).sub(completions).mul(10)) + "% (-10% per tier)<br>"
                            challengeNerfs += "'Upgrade Boost' multiplier 1.5x -> " + format(new Decimal(1.5).sub(completions.mul(0.06))) + "x (-0.06x per tier)<br>"
                            challengeNerfs += "'Charged Generators' exponent 0.2 -> " + format(new Decimal(0.2).sub(completions.mul(0.03))) + " (-0.03 per tier)<br>"
                            challengeNerfs += "'Surged Energy' multiplier 2x -> " + format(new Decimal(2).sub(completions.mul(0.1))) + "x (-0.1x per tier)<br>"
                            challengeNerfs += "'Charged Exponent' boost +0.05 -> +" + format(new Decimal(0.05).sub(completions.mul(0.008))) + " (-0.008x per tier)<br>"
                        }

                        if (challengeBuffs != "") {
                            challengeBuffs = "Buffs From Surge Challenge #4 Completions:<br>" + challengeBuffs
                        }
                        if (challengeNerfs != "") {
                            challengeNerfs = "Nerfs due to Surge Challenge #4:<br>" + challengeNerfs
                        }

                        return challengeBuffs + "<br><br>" + challengeNerfs
                    },
                ],
            ],
            unlocked() {
                return inChallenge("surge", 22) || challengeCompletions("surge", 22) > 0
            }
        },
    },
    componentStyles: {
        "buyable"() { return { "height": "125px", "width": "225px" } }
    },

    milestones: {

    },
    upgrades: {
        11: {
            title() {
                if (challengeCompletions("surge", 22) > 4) {
                    return "<span style='color:#00C800'>Triple Generation</span>"
                }
                return "Double Generation"
            },
            cost() {
                var price = new Decimal(1e7)

                return price
            },
            effect() {
                var multiplierBoost = new Decimal(2)

                if (challengeCompletions("surge", 22) > 4) {
                    multiplierBoost = multiplierBoost.mul(1.5)
                }
                if (hasAchievement("ach", 23)) {
                    multiplierBoost = multiplierBoost.mul(achievementEffect("ach", 23))
                }

                return multiplierBoost
            },
            description() {
                if (hasAchievement("ach", 23)) {
                    return "Generator production x" + format(upgradeEffect(this.layer, this.id))
                }

                return "Generator production is doubled."
            },
            currencyInternalName: "points",
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        12: {
            title() {
                if (inChallenge("surge", 22)) {
                    return "<span style='color:#C80000'>Charged Boost</span>"
                }
                return "Charged Boost"
            },
            cost() {
                var price = new Decimal(1e10)

                return price
            },
            effect() {
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.3)
                var energyCount = getEffectiveEnergy()
                if (hasUpgrade("energy", 25)) {
                    productionPow = productionPow.add(upgradeEffect(this.layer, 25))
                }
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.05)
                }
                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.04)

                    productionPow = productionPow.sub(completions)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                return new Decimal(1).add(energyCount).log(productionLog).pow(productionPow).add(1)
            },
            description() {
                return "Energy production is boosted by itself.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyInternalName: "points",
            tooltip() {
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.3)
                if (hasUpgrade("energy", 25)) {
                    productionPow = productionPow.add(upgradeEffect(this.layer, 25))
                }
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.05)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.04)
                    productionPow = productionPow.sub(completions)

                    return "1 + log" + format(productionLog) + "(Energy + 1)^<span style='color:#C80000'>" + format(productionPow) + "</span>"
                }
                return "1 + log" + format(productionLog) + "(Energy + 1)^" + format(productionPow)
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        13: {
            title() {
                if (challengeCompletions("surge", 22) > 3) {
                    return "<span style='color:#00C800'>Self Benefit</span>"
                }
                return "Self Benefit"
            },
            cost() {
                var price = new Decimal(1e14)

                return price
            },
            effect() {
                var productionPercent = new Decimal(0.01)

                var lowBoost = getBuyableAmount(this.layer, 11).add(getBuyableAmount(this.layer, 12)).add(getBuyableAmount(this.layer, 13))
                var highBoost = getBuyableAmount(this.layer, 21).add(getBuyableAmount(this.layer, 22)).add(getBuyableAmount(this.layer, 23))

                if (challengeCompletions("surge", 22) > 3) {
                    highBoost = highBoost.mul(2)
                }

                var genBoost = lowBoost.add(highBoost)

                if (hasUpgrade("surge", 16)) {
                    genBoost = genBoost.mul(upgradeEffect("surge", 16))
                }

                return genBoost.mul(productionPercent).add(1)
            },
            description() {
                if (challengeCompletions("surge", 22) > 3) {
                    return "Any purchased Energy Generator applies a small additive boost to energy gain depending on tier.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
                }
                return "Any purchased Energy Generator applies an additive +1% boost to energy gain.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            tooltip() {
                if (challengeCompletions("surge", 22) > 3) {
                    return "Lower Gens: +1%<br/>Higher Gens: +2%"
                }
            },
            currencyInternalName: "points",
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        14: {
            title() {
                if (inChallenge("surge", 22)) {
                    return "<span style='color:#C80000'>Bonus Set</span>"
                }
                return "Bonus Set"
            },
            cost() {
                var price = new Decimal(1e17)

                return price
            },
            description() {
                var descriptionText = "Generators provide an additive +10% bonus production per 5 purchases."
                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(10)
                    completions = new Decimal(60).sub(completions)

                    descriptionText += "<br><span style='color:#C80000'>Caps at +" + format(completions) + "%</span>"
                }

                return descriptionText
            },
            currencyInternalName: "points",
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        15: {
            title() {
                if (player.surge.points.gte(1)) {
                    if (inChallenge("surge", 22)) {
                        return "<span style='color:#C80000'>Upgrade Boost</span>"
                    }
                    return "Upgrade Boost"
                }
                return "Energy Surge"
            },
            effect() {
                if (player.surge.points.lt(1)) {
                    return new Decimal(0)
                }

                var productionMult = new Decimal(1.5).add(challengeEffect("surge", 32))
                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.06)
                    productionMult = productionMult.sub(completions)
                }
                var upgradeCount = player[this.layer].upgrades.length
                if (hasUpgrade("surge", 22)) {
                    upgradeCount += player["surge"].upgrades.length
                }

                return productionMult.pow(upgradeCount)
            },
            cost() {
                var price = new Decimal(1e20)

                return price
            },
            description() {
                if (player.surge.points.gte(1)) {
                    var productionMult = new Decimal(1.5).add(challengeEffect("surge", 32))
                    if (inChallenge("surge", 22)) {
                        var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.06)
                        productionMult = new Decimal(1.5).sub(completions)

                        return "Gain a <span style='color:#C80000'>" + format(productionMult) + "x</span> multiplier to all Energy Generators per upgrade purchased\.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
                    }
                    return "Gain a " + format(productionMult) + "x multiplier to all Energy Generators per upgrade purchased\.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
                }
                return "Unlock the ability to Energy Surge."
            },
            currencyInternalName: "points",
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        21: {
            title() {
                if (challengeCompletions("surge", 22) > 2) {
                    return "<span style='color:#00C800'>Slight Time Bonus</span>"
                }
                return "Slight Time Bonus"
            },
            cost() {
                var price = new Decimal(1e25)

                return price
            },
            effect() {
                //var totalTime = player[this.layer].resetTime / 60
                var totalTime = player.timePlayed / 60

                var timeBonus = new Decimal(1)
                var innerLog = new Decimal(10)
                var outerLog = new Decimal(10)
                var timePow = new Decimal(1)
                var innerPow = new Decimal(1)
                var outerPow = new Decimal(1)

                if (hasUpgrade(this.layer, 31)) {
                    timeBonus = timeBonus.mul(10)
                    if (challengeCompletions("surge", 22) > 0) {
                        timeBonus = timeBonus.mul(6)
                    }
                }
                if (hasAchievement("ach", 32)) {
                    timeBonus = timeBonus.mul(player.energybank.points.max(1))
                }

                if (challengeCompletions("surge", 21) > 0) {
                    innerLog = challengeEffect("surge", 21)
                    outerLog = challengeEffect("surge", 21)
                }
                else if (challengeCompletions("surge", 22) > 2) {
                    innerLog = innerLog.mul(2)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    innerLog = innerLog.sub(player.energybank.points.max(0).min(10).div(2))
                    outerLog = outerLog.sub(player.energybank.points.max(0).min(10).div(2))
                }
                if (hasUpgrade("surge", 25)) {
                    outerPow = outerPow.mul(2)
                }

                if (challengeCompletions("surge", 22) > 2) {
                    return new Decimal(totalTime).mul(timeBonus).add(1).pow(timePow).log(innerLog).add(1).pow(innerPow.add(outerPow).sub(1))
                }
                return new Decimal(totalTime).mul(timeBonus).add(1).pow(timePow).log(innerLog).add(1).pow(innerPow).log(outerLog).add(1).pow(outerPow)
            },
            description() {
                return "Generators are slightly more effective based on total time played."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(1)
            },
            tooltip() {
                var timeBonus = new Decimal(1)
                var innerLog = new Decimal(10)
                var outerLog = new Decimal(10)

                if (hasUpgrade(this.layer, 31)) {
                    timeBonus = timeBonus.mul(10)
                    if (challengeCompletions("surge", 22) > 0) {
                        timeBonus = timeBonus.div(10)
                    }
                }
                if (hasAchievement("ach", 32)) {
                    timeBonus = timeBonus.mul(player.energybank.points.max(1))
                }

                if (challengeCompletions("surge", 21) > 0) {
                    innerLog = challengeEffect("surge", 21)
                    outerLog = challengeEffect("surge", 21)
                }
                else if (challengeCompletions("surge", 22) > 2) {
                    innerLog = innerLog.mul(2)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    innerLog = innerLog.sub(player.energybank.points.max(0).min(10).div(2))
                    outerLog = outerLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                if (challengeCompletions("surge", 22) > 2) {
                    if (hasUpgrade(this.layer, 31)) {
                        return "1 + log" + format(innerLog) + "( Seconds * " + format(timeBonus) + " + 1)"
                    }
                    return "1 + log" + format(innerLog) + "( Minutes * " + format(timeBonus) + " + 1)"
                }
                if (hasUpgrade(this.layer, 31) && challengeCompletions("surge", 22) > 0) {
                    return "1 + log" + format(outerLog) + "( log" + format(innerLog) + "( Seconds * " + format(timeBonus) + " + 1) + 1)"
                }
                return "1 + log" + format(outerLog) + "( log" + format(innerLog) + "( Minutes * " + format(timeBonus) + " + 1) + 1)"
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        22: {
            title() {
                if (inChallenge("surge", 22)) {
                    return "<span style='color:#C80000'>Charged Generators</span>"
                }
                return "Charged Generators"
            },
            cost() {
                var price = new Decimal(1e28)

                return price
            },
            effect() {
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.2)
                var energyCount = getEffectiveEnergy()
                if (hasUpgrade("energy", 25)) {
                    productionPow = productionPow.add(upgradeEffect(this.layer, 25))
                }
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.15)
                }
                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.03)

                    productionPow = productionPow.sub(completions)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                return new Decimal(1).add(energyCount).log(productionLog).pow(productionPow).add(1)
            },
            description() {
                if (hasUpgrade("surge", 26)) {
                    return "'Charged Boost' upgrade applies to Generators."
                }
                return "'Charged Boost' upgrade applies to Generators at a slightly weaker scale.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(1)
            },
            tooltip() {
                if (hasUpgrade("surge", 26)) {
                    return ""
                }
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.2)
                if (hasUpgrade("energy", 25)) {
                    productionPow = productionPow.add(upgradeEffect(this.layer, 25))
                }
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.15)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.03)
                    productionPow = productionPow.sub(completions)

                    return "1 + log" + format(productionLog) + "(Energy + 1)^<span style='color:#C80000'>" + format(productionPow) + "</span>"
                }
                return "1 + log" + format(productionLog) + "(Energy + 1)^" + format(productionPow)
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        23: {
            title() {
                if (challengeCompletions("surge", 22) > 1) {
                    return "<span style='color:#00C800'>Surge Progress</span>"
                }
                return "Surge Progress"
            },
            cost() {
                var price = new Decimal(1e31)

                return price
            },
            effect() {
                var boostDiv = new Decimal(energyCap()).min(1e100)
                if (challengeCompletions("surge", 22) > 1) {
                    boostDiv = boostDiv.pow(0.5)
                }

                var prodLog = new Decimal(1).add(getEffectiveEnergy()).log(10)
                var capLog = new Decimal(1).add(boostDiv).log(10)

                var effect = prodLog.div(capLog).add(1)

                if (hasUpgrade(this.layer, 32)) {
                    effect = effect.pow(2)
                }

                return effect
            },
            description() {
                return "Energy production boosted slightly based on progress to the next surge.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(1)
            },
            tooltip() {
                var boostDiv = new Decimal(energyCap()).min(1e100)
                if (challengeCompletions("surge", 22) > 1) {
                    boostDiv = boostDiv.pow(0.5)
                }

                return "log10(Energy + 1)/log10(" + format(boostDiv) + " + 1)"
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        24: {
            title() {
                if (player.surge.points.gte(2)) {
                    if (inChallenge("surge", 22)) {
                        return "<span style='color:#C80000'>Surged Energy</span>"
                    }
                    return "Surged Energy"
                }
                return "Energy Surge"
            },
            effect() {
                var multiplierBoost = new Decimal(1)

                if (player.surge.points.gte(2)) {
                    multiplierBoost = new Decimal(2)

                    if (inChallenge("surge", 22)) {
                        var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.1)
                        multiplierBoost = multiplierBoost.sub(completions)
                    }

                    multiplierBoost = multiplierBoost.pow(new Decimal(getEffectiveSurgeResets()))

                    return multiplierBoost
                }

                return multiplierBoost
            },
            cost() {
                var price = new Decimal(1e40)

                return price
            },
            description() {
                if (player.surge.points.gte(2)) {
                    return "Surge resets multiply energy gain.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
                }
                return "Unlock the ability to Energy Surge."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(1)
            },
            tooltip() {
                if (player.surge.points.gte(2)) {
                    var multiplierBoost = new Decimal(2)

                    if (inChallenge("surge", 22)) {
                        var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.1)
                        multiplierBoost = multiplierBoost.sub(completions)

                        return "<span style='color:#C80000'>" + format(multiplierBoost) + "</span> ^ surge"
                    }

                    return format(multiplierBoost) + " ^ surge"
                }

                return ""
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        25: {
            title() {
                if (inChallenge("surge", 22)) {
                    return "<span style='color:#C80000'>Charged Exponent</span>"
                }
                return "Charged Exponent"
            },
            effect() {
                var productionPow = new Decimal(0.05)
                if (inChallenge("surge", 22)) {
                    var completions = new Decimal(challengeCompletions("surge", 22)).add(1).min(5).mul(0.008)

                    productionPow = productionPow.sub(completions)
                }

                return productionPow
            },
            cost() {
                var price = new Decimal(1e45)

                return price
            },
            description() {
                if (inChallenge("surge", 22)) {
                    return "'Charged Boost' and 'Charged Generators' exponents increased by <span style='color:#C80000'>" + format(upgradeEffect(this.layer, this.id)) + "</span>."
                }
                return "'Charged Boost' and 'Charged Generators' exponents increased by " + format(upgradeEffect(this.layer, this.id)) + "."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(2)
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        31: {
            title() {
                if (player.surge.points.gte(3)) {
                    if (challengeCompletions("surge", 22) > 0) {
                        return "<span style='color:#00C800'>Better Time Boost</span>"
                    }
                    return "Better Time Boost"
                }
                return "Energy Surge"
            },
            effect() {
                if (player.surge.points.lt(3)) {
                    return new Decimal(0)
                }

                return new Decimal(0)
            },
            cost() {
                var price = new Decimal(1e60)

                return price
            },
            description() {
                if (player.surge.points.gte(3)) {
                    if (challengeCompletions("surge", 22) > 0) {
                        return "'Slight Time Boost' tracks seconds instead of minutes."
                    }
                    return "'Slight Time Boost' multiplier inside the log improved to x10."
                }
                return "Unlock the ability to Energy Surge."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(2)
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        32: {
            title() {
                if (player.surge.points.gte(4)) {
                    return "Squared Surge"
                }
                return "Energy Surge"
            },
            effect() {
                if (player.surge.points.lt(4)) {
                    return new Decimal(0)
                }

                return new Decimal(0)
            },
            cost() {
                var price = new Decimal(1e80)

                return price
            },
            description() {
                if (player.surge.points.gte(4)) {
                    return "'Surge Progress' effect is squared and applies to Energy Generators."
                }
                return "Unlock the ability to Energy Surge."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(3)
            },
            canAfford() {
                return !inChallenge("surge", 32)
            },
        },
        33: {
            title() {
                return "Energy Surge"
            },
            cost() {
                var price = new Decimal(1e100)

                return price
            },
            description() {
                return "Unlock the ability to Energy Surge."
            },
            currencyInternalName: "points",
            unlocked() {
                return player.surge.points.gte(4)
            },
            canAfford() {
                return true
            },
        },
    },
    passiveGeneration() {

    },
    buyables: {
        11: {
            title() { return "Energy Generator #1" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1), new Decimal(1e1))
            },
            effect() {
                var generation = new Decimal(2)

                generation = getGeneratorMults(this.id, generation)
                generation = generation.mul(player.energy.fourthGen.add(new Decimal(1)))

                if (hasMilestone("surge", 0)) {
                    generation = generation.mul(2)
                }

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(11, player.energy.firstGen, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    var generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
        },
        12: {
            title() { return "Energy Generator #2" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1e3), new Decimal(1e2))
            },
            effect() {
                var generation = new Decimal(2)

                generation = getGeneratorMults(this.id, generation)
                generation = generation.mul(player.energy.fifthGen.add(new Decimal(1)))

                if (hasMilestone("surge", 1)) {
                    generation = generation.mul(2)
                }

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(12, player.energy.secondGen, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    var generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
        },
        13: {
            title() { return "Energy Generator #3" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1e5), new Decimal(1e3))
            },
            effect() {
                var generation = new Decimal(2)

                generation = getGeneratorMults(this.id, generation)
                generation = generation.mul(player.energy.sixthGen.add(new Decimal(1)))

                if (hasMilestone("surge", 2)) {
                    generation = generation.mul(2)
                }

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(13, player.energy.thirdGen, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    var generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
        },
        21: {
            title() { return "Energy Generator #4" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1e10), new Decimal(1e4))
            },
            effect() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))

                generation = getGeneratorMults(this.id, generation)
                //generation = generation.mul(player.energy.fourthGen.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(21, player.energy.fourthGen, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost()) && !inChallenge("surge", 32)
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    var generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return hasMilestone("surge", 0)
            },
        },
        22: {
            title() { return "Energy Generator #5" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1e17), new Decimal(1e5))
            },
            effect() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))

                generation = getGeneratorMults(this.id, generation)
                //generation = generation.mul(player.energy.fourthGen.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(22, player.energy.fifthGen, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost()) && !inChallenge("surge", 32)
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    var generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return hasMilestone("surge", 1)
            },
        },
        23: {
            title() { return "Energy Generator #6" },
            cost() {
                return getGeneratorCostScaling(this.id, new Decimal(1e25), new Decimal(1e6))
            },
            effect() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))

                generation = getGeneratorMults(this.id, generation)
                //generation = generation.mul(player.energy.fourthGen.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return 0;
                return generation
            },
            display() {
                return getGeneratorDescription(23, player.energy.sixthGen, this.purchaseLimit(), this.cost())

                /*var count = getBuyableAmount(this.layer, this.id)

                var generationText = "Generates a slowly increasing production multiplier for Energy Generator #3."
                if (inChallenge("surge", 12)) {
                    generationText = "Generates a slowly increasing production multiplier."
                }

                generationText += "<br>Amount: " + format(count)
                if (inChallenge("surge", 12)) {
                    generationText += "<br>Effect: " + format(player.energy.sixthGen.add(1))
                }
                else {
                    generationText += "<br>Effect: " + format(this.effect()) + "/s (" + format(player.energy.sixthGen.add(1)) + "x)"
                }
                if (new Decimal(getBuyableAmount(this.layer, this.id)).gte(this.purchaseLimit())) {
                    generationText += "<br>Maxed due to Generator limit."
                }
                else if (new Decimal(energyCap()).gte(this.cost())) {
                    generationText += "<br>Cost: " + format(this.cost()) + " Energy"
                }
                else {
                    generationText += "<br>Maxed due to Energy limit."
                }

                return generationText*/
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost()) && !inChallenge("surge", 32)
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(2500)
            },
            tooltip() {
                var generation = new Decimal(1.5).add(challengeEffect("surge", 32))
                var baseMultiplier = new Decimal(0.1)
                if (challengeCompletions("surge", 31) > 0) {
                    baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
                }

                if (inChallenge("surge", 11)) {
                    var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
                    var boost = new Decimal(1).sub(completions)

                    generation = generation.sub(1).mul(boost).add(1)
                }
                else {
                    generation = generation.mul(challengeEffect("surge", 11))
                }

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return hasMilestone("surge", 2)
            },
        },
        41: {
            title() { return "Energy Charger" },
            cost() {
                var basePrice = new Decimal(1e250)
                var baseScaling = new Decimal (1e5)

                var softcapScaling = new Decimal(10)

                var softcap = 100

                var totalPrice = basePrice.mul(baseScaling.pow(getBuyableAmount(this.layer, this.id)))

                if (getBuyableAmount(this.layer, this.id).gte(softcap)) {
                    var softcapSum = getBuyableAmount(this.layer, this.id).sub(softcap - 2).max(0)
                    var softcapCost = softcapSum.pow(2)
            
                    softcapSum = softcapScaling.pow(softcapSum)
                    softcapCost = softcapScaling.pow(softcapCost)
            
                    var softcapModifier = softcapCost.div(softcapSum).pow(0.5)
            
                    totalPrice = totalPrice.mul(softcapModifier)
                }

                if (hasUpgrade("surge", 15)) {
                    totalPrice = totalPrice.div(upgradeEffect("surge", 15))
                }

                return totalPrice
            },
            effect() {
                var generation = new Decimal(1.1)
                if (hasMilestone("surge", 9)) {
                    generation = generation.add(player.energybank.points.div(25).max(0))
                }

                generation = generation.pow(getBuyableAmount(this.layer, this.id) - 1)

                if (getBuyableAmount(this.layer, this.id) < 1) return new Decimal(1);
                return generation
            },
            display() {
                var count = getBuyableAmount(this.layer, this.id)

                var generationText = "Provides a static multiplier for all Energy Generators and Energy production."

                generationText += "<br>Amount: " + format(count) + "<br>Effect: " + format(this.effect()) + "x"
                if (new Decimal(getBuyableAmount(this.layer, this.id)).gte(this.purchaseLimit())) {
                    generationText += "<br>Maxed due to Charger limit."
                }
                else if (new Decimal(energyCap()).gte(this.cost())) {
                    generationText += "<br>Cost: " + format(this.cost()) + " Energy"
                }
                else {
                    generationText += "<br>Maxed due to Energy limit."
                }

                return generationText
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(1000)
            },
            tooltip() {
                var generation = new Decimal(1.1)
                if (hasMilestone("surge", 9)) {
                    generation = generation.add(player.energybank.points.div(25).max(0))
                }

                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return hasAchievement("ach", 34)
            },
        },
    },
    update(diff) {
        var firstGenProd = new Decimal(diff).mul(buyableEffect("energy", 11))
        var secondGenProd = new Decimal(diff).mul(buyableEffect("energy", 12))
        var thirdGenProd = new Decimal(diff).mul(buyableEffect("energy", 13))
        var fourthGenProd = new Decimal(diff).mul(buyableEffect("energy", 21))
        var fifthGenProd = new Decimal(diff).mul(buyableEffect("energy", 22))
        var sixthGenProd = new Decimal(diff).mul(buyableEffect("energy", 23))

        if (inChallenge("surge", 12)) {
            var completions = new Decimal(challengeCompletions("surge", 12)).add(1).min(5)

            var boost = new Decimal(20)
            if (completions.gte(2)) {
                boost = new Decimal(18)
            }
            if (completions.gte(3)) {
                boost = new Decimal(15)
            }
            if (completions.gte(4)) {
                boost = new Decimal(12)
            }
            if (completions.gte(5)) {
                boost = new Decimal(8)
            }

            player.energy.firstGen = boost.mul(buyableEffect("energy", 11))
            player.energy.secondGen = boost.mul(buyableEffect("energy", 12))
            player.energy.thirdGen = boost.mul(buyableEffect("energy", 13))
            player.energy.fourthGen = boost.mul(buyableEffect("energy", 21))
            player.energy.fifthGen = boost.mul(buyableEffect("energy", 22))
            player.energy.sixthGen = boost.mul(buyableEffect("energy", 23))
        }
        else {
            player.energy.firstGen = player.energy.firstGen.add(firstGenProd)
            player.energy.secondGen = player.energy.secondGen.add(secondGenProd)
            player.energy.thirdGen = player.energy.thirdGen.add(thirdGenProd)
            player.energy.fourthGen = player.energy.fourthGen.add(fourthGenProd)
            player.energy.fifthGen = player.energy.fifthGen.add(fifthGenProd)
            player.energy.sixthGen = player.energy.sixthGen.add(sixthGenProd)

            if (player.energy.firstGen.lte(new Decimal(buyableEffect("energy", 11)).mul(challengeEffect("surge", 12)))) {
                player.energy.firstGen = new Decimal(buyableEffect("energy", 11)).mul(challengeEffect("surge", 12))
            }
            if (player.energy.secondGen.lte(new Decimal(buyableEffect("energy", 12)).mul(challengeEffect("surge", 12)))) {
                player.energy.secondGen = new Decimal(buyableEffect("energy", 12)).mul(challengeEffect("surge", 12))
            }
            if (player.energy.thirdGen.lte(new Decimal(buyableEffect("energy", 13)).mul(challengeEffect("surge", 12)))) {
                player.energy.thirdGen = new Decimal(buyableEffect("energy", 13)).mul(challengeEffect("surge", 12))
            }
            if (player.energy.fourthGen.lte(new Decimal(buyableEffect("energy", 21)).mul(challengeEffect("surge", 12)))) {
                player.energy.fourthGen = new Decimal(buyableEffect("energy", 21)).mul(challengeEffect("surge", 12))
            }
            if (player.energy.fifthGen.lte(new Decimal(buyableEffect("energy", 22)).mul(challengeEffect("surge", 12)))) {
                player.energy.fifthGen = new Decimal(buyableEffect("energy", 22)).mul(challengeEffect("surge", 12))
            }
            if (player.energy.sixthGen.lte(new Decimal(buyableEffect("energy", 23)).mul(challengeEffect("surge", 12)))) {
                player.energy.sixthGen = new Decimal(buyableEffect("energy", 23)).mul(challengeEffect("surge", 12))
            }
        }
    },
    automate() {
        var buyableID = 11
        if (player.auto.autoEnGen1) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 12
        if (player.auto.autoEnGen2) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 13
        if (player.auto.autoEnGen3) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 21
        if (player.auto.autoEnGen4) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 22
        if (player.auto.autoEnGen5) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 23
        if (player.auto.autoEnGen6) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                if (hasMilestone("energybank", 2)) {
                    while (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit()) && player.points.gte(layers.energy.buyables[buyableID].cost()) && layers.energy.buyables[buyableID].canAfford()) {
                        layers.energy.buyables[buyableID].buy()
                    }
                }
                else {
                    layers.energy.buyables[buyableID].buy()
                }
            }
        }
        var buyableID = 41
        if (player.auto.autoEnChar1) {
            if (new Decimal(getBuyableAmount("energy", buyableID)).lt(layers.energy.buyables[buyableID].purchaseLimit())) {
                layers.energy.buyables[buyableID].buy()
            }
        }

        if (hasMilestone("surge", 5) && !player.energy.justReset) {
            let extraUpgrades = [];

            if (!(inChallenge("surge", 11) || inChallenge("surge", 12) || inChallenge("surge", 21) || inChallenge("surge", 22) || inChallenge("surge", 31) || inChallenge("surge", 32))) {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32)).sub(7).max(0).min(13)

                var upgradeVal = 10

                for (var i = 0; i < 13; i++) {
                    if (completions.lte(i)) {
                        break
                    }
                    upgradeVal += 1
                    if (upgradeVal % 10 == 6) {
                        upgradeVal += 5
                    }
                    player[this.layer].upgrades.push(upgradeVal)
                }
            }

            player.energy.justReset = true
        }
    }
})

function getGeneratorMults(genID, generation) {
    if (inChallenge("surge", 11)) {
        var completions = new Decimal(challengeCompletions("surge", 11)).add(1).min(5).mul(0.04)
        var boost = new Decimal(1).sub(completions)

        var generation = generation.sub(1).mul(boost).add(1)
    }
    else if (challengeCompletions("surge", 11) > 0) {
        generation = generation.mul(challengeEffect("surge", 11))
    }

    var baseMultiplier = new Decimal(0.1)
    if (challengeCompletions("surge", 31) > 0) {
        baseMultiplier = baseMultiplier.mul(player.energybank.points.max(1))
    }

    generation = generation.pow(getBuyableAmount("energy", genID).sub(1)).mul(baseMultiplier)
    if (hasUpgrade("energy", 11)) {
        generation = generation.mul(upgradeEffect("energy", 11))
    }
    if (hasUpgrade("energy", 14)) {
        var purchaseMult = new Decimal(0.2).mul(getBuyableAmount("energy", genID)).floor().mul(0.1).add(1)

        if (hasUpgrade("surge", 21)) {
            purchaseMult = new Decimal(1.1).pow(new Decimal(0.2).mul(getBuyableAmount("energy", genID)).floor().add(1))
        }
        if (inChallenge("surge", 22)) {
            var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5).mul(0.1)
            completions = new Decimal(1.6).sub(completions)

            if (purchaseMult.gte(completions)) {
                purchaseMult = completions
            }
        }

        generation = generation.mul(purchaseMult)
    }
    if (hasUpgrade("energy", 15)) {
        generation = generation.mul(upgradeEffect("energy", 15))
    }
    if (hasUpgrade("energy", 21)) {
        generation = generation.mul(upgradeEffect("energy", 21))
    }
    if (hasUpgrade("energy", 22)) {
        generation = generation.mul(upgradeEffect("energy", 22))
    }
    if (hasUpgrade("energy", 23) && hasUpgrade("energy", 32)) {
        generation = generation.mul(upgradeEffect("energy", 23))
    }
    if (hasUpgrade("surge", 12)) {
        generation = generation.mul(upgradeEffect("surge", 12))
    }
    if (hasUpgrade("surge", 13)) {
        generation = generation.mul(getEffectiveSurgeResets())
    }
    if (hasUpgrade("surge", 23)) {
        generation = generation.mul(upgradeEffect("surge", 23))
    }
    if (challengeCompletions("surge", 31) > 0) {
        generation = generation.mul(player.energybank.points.max(1))
    }

    generation = generation.mul(buyableEffect("energy", 41))

    generation = generation.mul(player.surge.firstBooster.add(new Decimal(1)))

    if (inChallenge("surge", 21)) {
        var completions = new Decimal(challengeCompletions("surge", 21)).add(1).min(5)
        var timeMod = new Decimal(5).sub(completions).mul(0.5).add(3).mul(30)

        var bonus = new Decimal(timeMod).mul(10).sub(player.surge.resetTime).div(timeMod)
        bonus = new Decimal(bonus).pow(2).div(100)
        if (new Decimal(player.surge.resetTime).gte(timeMod.mul(10))) {
            bonus = new Decimal(0)
        }

        generation = generation.mul(bonus)
    }

    return generation
}

function getGeneratorCostScaling(genID, basePrice, baseScaling) {
    var softcap1Scaling = new Decimal(10)
    if (challengeCompletions("surge", 31) > 4) {
        softcap1Scaling = softcap1Scaling.sub(player.energybank.points.min(10).div(2))
    }
    var softcap2Scaling = new Decimal(0.02)

    var softcap1 = new Decimal(10).pow(308)
    if (challengeCompletions("surge", 31) > 3) {
        var delayExp = new Decimal(3).mul(player.energybank.points)
        softcap1 = softcap1.mul(new Decimal(10).pow(delayExp))
    }

    //var softcap1 = 100
    var softcap2 = 1000

    var totalPrice = basePrice.mul(baseScaling.pow(getBuyableAmount("energy", genID)))

    if (totalPrice.gte(softcap1)) {
        var basePriceLog = basePrice.log(10)
        var baseScalingLog = baseScaling.log(10)

        var softcap1Trigger = softcap1.log(10).sub(basePriceLog).div(baseScalingLog).ceil()

        var softcap1Sum = getBuyableAmount("energy", genID).sub(softcap1Trigger.sub(2)).max(0)
        var softcap1Cost = softcap1Sum.pow(2)

        softcap1Sum = softcap1Scaling.pow(softcap1Sum)
        softcap1Cost = softcap1Scaling.pow(softcap1Cost)

        var softcap1Modifier = softcap1Cost.div(softcap1Sum).pow(0.5)

        totalPrice = totalPrice.mul(softcap1Modifier)
    }
    /*if (getBuyableAmount("energy", genID).gte(softcap1)) {
        var softcap1Sum = getBuyableAmount("energy", genID).sub(softcap1 - 2).max(0)
        var softcap1Cost = softcap1Sum.pow(2)

        softcap1Sum = softcap1Scaling.pow(softcap1Sum)
        softcap1Cost = softcap1Scaling.pow(softcap1Cost)

        var softcap1Modifier = softcap1Cost.div(softcap1Sum).pow(0.5)

        totalPrice = totalPrice.mul(softcap1Modifier)
    }*/
    if (getBuyableAmount("energy", genID).gte(softcap2)) {
        var softcap2Sum = getBuyableAmount("energy", genID).sub(softcap2 - 1).max(0)
        var softcap2Modifier = new Decimal(softcap2Scaling).mul(softcap2Sum).add(1)

        totalPrice = totalPrice.pow(softcap2Modifier)
    }

    return totalPrice
}

function getGeneratorDescription(genID, genCount, purchaseLimit, cost) {
    var staticProd = inChallenge("surge", 12)

    var count = getBuyableAmount("energy", genID)

    var generationText = "Generates a slowly increasing energy per second effect."
    if (genID == 12 || genID == 13) {
        generationText = "Generates a slowly increasing energy per second multiplier."
    }
    if (genID == 21) {
        generationText = "Generates a slowly increasing production multiplier for Energy Generator #1."
    }
    if (genID == 22) {
        generationText = "Generates a slowly increasing production multiplier for Energy Generator #2."
    }
    if (genID == 23) {
        generationText = "Generates a slowly increasing production multiplier for Energy Generator #3."
    }
    if (staticProd) {
        generationText = "Provides a static energy per second effect."
        if (genID == 12 || genID == 13) {
            generationText = "Provides a static production multiplier."
        }
        if (genID == 21) {
            generationText = "Provides a static production multiplier for Energy Generator #1."
        }
        if (genID == 22) {
            generationText = "Provides a static production multiplier for Energy Generator #2."
        }
        if (genID == 23) {
            generationText = "Provides a static production multiplier for Energy Generator #3."
        }
    }

    generationText += "<br>Amount: " + format(count)
    if (!inChallenge("surge", 12)) {
        generationText += "<br>Production: " + format(buyableEffect("energy", genID)) + "/s"
    }
    if (genID == 11) {
        generationText += "<br>Effect: " + format(genCount) + " energy/s"
    }
    else {
        generationText += "<br>Effect: " + format(genCount.add(1))
    }
    if (genID == 12 || genID == 13) {
        generationText += "x energy/s"
    }
    if (genID == 21) {
        if (staticProd) {
            generationText += "x EG1 effect"
        }
        else {
            generationText += "x EG1 production/s"
        }
    }
    if (genID == 22) {
        if (staticProd) {
            generationText += "x EG2 effect"
        }
        else {
            generationText += "x EG2 production/s"
        }
    }
    if (genID == 23) {
        if (staticProd) {
            generationText += "x EG2 effect"
        }
        else {
            generationText += "x EG2 production/s"
        }
    }
    if (new Decimal(getBuyableAmount("energy", genID)).gte(purchaseLimit)) {
        generationText += "<br>Maxed due to Generator limit."
    }
    else if (new Decimal(energyCap()).gt(cost)) {
        generationText += "<br>Cost: " + format(cost) + " Energy"
    }
    else {
        generationText += "<br>Maxed due to Energy limit."
    }

    return generationText
}