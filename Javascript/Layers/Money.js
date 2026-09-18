addLayer("money", {
    startData() {return {
        unlocked: true,

        points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        
        resetTime: 0,

        effectText: ``
    }},
    update() {
        let txt = ``

        if (hasUpgrade("money", 11)) txt += `Total effect from upgrade <text style="color: ${temp.money.color}">M(1-1)</text>: x${format(upgradeEffect("money", 11))} Points <br>`
        if (hasUpgrade("money", 13)) txt += `Total effect from upgrade <text style="color: ${temp.money.color}">M(1-3)</text>: x${format(upgradeEffect("money", 13))} Money`
        if (hasUpgrade("money", 14)) txt += ` & <text style="color: ${temp.money.color}">M(1-1)</text> Effect`
        if (hasUpgrade("money", 13)) txt += `<br>`
        if (hasUpgrade("money", 23)) txt += `Total effect from upgrade <text style="color: ${temp.money.color}">M(2-3)</text>: x${format(upgradeEffect("money", 23))} <text style="color: ${temp.money.color}">M(1-1)</text> Effect <br>`
        if (hasUpgrade("money", 32)) txt += `Total effect from upgrade <text style="color: ${temp.money.color}">M(3-2)</text>: x${format(upgradeEffect("money", 32))} <text style="color: ${temp.money.color}">M(2-3)</text> Effect`

        player.money.effectText = txt
        
    },
    symbol() {return `M<sub><small><small><small><small><small>${formatWhole(player.prestigeAmount[0])}</small></small></small></small></small></sub>`},
    color: "#118C4F",
    layerShown: true,
    requires: new Decimal(10),
    resource: "Money",
    baseResource: "Points",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.6,
    row: 1,
    tooltip: "Money",
    microtabs: {
        index: {
            Upgrades: {
                content: ["blank", ["display-text", function() {return player.money.effectText}], "blank", "upgrades"]
            },

            Buyables: {
                content: ["blank", "buyables", "blank", "clickables"],
                unlocked() {return hasMilestone("universe", 15)}
            },

            "Node Info": {
                content: ["blank", ["display-text", "Multiversal Branch Type: (Index, 0, 0)"], "blank", ["display-text", function() {return `Total Money Multiplier: x<big>${format(temp.money.gainMult)}</big>`}]]
            }
        }
    },
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}},
        "buyable"() {return {"padding":"10px"}}
    },
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "blank",
        ["display-text", function() {if (temp.money.passiveGeneration.gte(0)) {return (`You are gaining <big style="color: ${temp.money.color}; text-shadow: 0 0 8px ${temp.money.color}">${format(temp.money.resetGain.times(temp.money.passiveGeneration))}</big> Money/sec (${formatWhole(temp.money.passiveGeneration.times(100))}% potency)`)}}],
        "blank",
        ["microtabs", "index"]
    ],
    upgrades: {
        11: {
            title: "<novamono>M(1-1)</novamono>",
            description: "Total Money boosts point gain.<br><br><br>",
            cost: new Decimal(2),
            effect() {
                let powBase = new Decimal(0.6)
                if (hasUpgrade("money", 12)) powBase = powBase.times(1.2)
                if (hasMilestone("universe", 13)) powBase = powBase.times(0.99)
                if (hasUpgrade("money", 52)) powBase = powBase.times(1.1)
                if (hasMilestone("universe", 16)) powBase = powBase.times(0.99)
                let base = player.money.total.pow(powBase.min(0.99))
                if (hasUpgrade("money", 14)) base = base.times(upgradeEffect("money", 13))
                if (hasUpgrade("money", 15)) base = base.pow(1.5)
                if (hasUpgrade("money", 23)) base = base.times(upgradeEffect("money", 23))
                if (hasUpgrade("money", 25)) base = base.times(22.22)
                if (hasUpgrade("money", 35)) base = base.pow(1.1)
                if (hasUpgrade("money", 55)) base = base.pow(1.1)
                if (base.gte("e450000")) base = new Decimal("e450000").add(base.div("e450000").pow(0.5))
                if (base.gte("e1000000")) base = new Decimal("e1000000").add(base.div("e1000000").tetrate(0.1))
                return base
            },
            tooltip: "Slows down past xe450,000 and xe1,000,000"
        },

        12: {
            title: "<novamono>M(1-2)</novamono>",
            description: "The previous upgrade's formula is improved and also double point gain.",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade("money", 11)}
        },

        13: {
            title: "<novamono>M(1-3)</novamono>",
            description: "Money gain is boosted based on upgrade M(1-1)'s effect.<br>",
            cost: new Decimal(500),
            unlocked() {return hasUpgrade("money", 12)},
            effect() {
                let logBase = new Decimal(10)
                if (hasUpgrade("money", 21)) logBase = logBase.sub(1.5)
                if (hasUpgrade("money", 51)) logBase = logBase.sub(1.5)
                if (hasMilestone("universe", 16)) logBase = logBase.times(1.01)
                if (hasUpgrade("sorbet", 102)) logBase = logBase.sub(4)
                let base = upgradeEffect("money", 11).add(1).log(logBase)
                if (hasUpgrade("money", 22)) base = base.pow(1.5)
                if (hasMilestone("universe", 14)) base = base.div(2)
                if (hasUpgrade("money", 51)) base = base.times(5)
                if (hasUpgrade("money", 55)) base = base.pow(1.1)
                if (hasUpgrade("sorbet", 102)) base = base.pow(3)

                if (hasMilestone("universe", 14) && base.lt(1)) {
                    return new Decimal(1)
                } else {
                    return base
                }
            }
        },

        14: {
            title: "<novamono>M(1-4)</novamono>",
            description: "The previous upgrade's effect also affects upgrade M(1-1).<br>",
            cost: new Decimal(1150),
            unlocked() {return hasUpgrade("money", 13)}
        },

        15: {
            title: "<novamono>M(1-5)</novamono>",
            description: "Raise upgrade M(1-1)'s effect to the power of 1.5.<br><br>",
            cost: new Decimal(5000),
            unlocked() {return hasUpgrade("money", 14)}
        },

        21: {
            title: "<novamono>M(2-1)</novamono>",
            description: "Upgrade M(1-3) scales faster.<br><br>",
            cost: new Decimal(50000000),
            unlocked() {return hasUpgrade("money", 15) && hasMilestone("universe", 11)}
        },

        22: {
            title: "<novamono>M(2-2)</novamono>",
            description: "Raise upgrade M(1-3)'s effect to the power of 1.5.<br>",
            cost: new Decimal(300000000),
            unlocked() {return hasUpgrade("money", 21)}
        },

        23: {
            title: "<novamono>M(2-3)</novamono>",
            description: "Upgrade M(1-1) is stronger based on upgrades bought in this layer.",
            cost: new Decimal("5e12"),
            unlocked() {return hasUpgrade("money", 22)},
            effect() {
                let amt = function() {
                    let base = new Decimal(0)

                    if (hasUpgrade("money", 11)) base = base.add(1)
                    if (hasUpgrade("money", 12)) base = base.add(1)
                    if (hasUpgrade("money", 13)) base = base.add(1)
                    if (hasUpgrade("money", 14)) base = base.add(1)
                    if (hasUpgrade("money", 15)) base = base.add(1)
                    if (hasUpgrade("money", 21)) base = base.add(1)
                    if (hasUpgrade("money", 22)) base = base.add(1)
                    if (hasUpgrade("money", 23)) base = base.add(1)
                    if (hasUpgrade("money", 24)) base = base.add(1)
                    if (hasUpgrade("money", 25)) base = base.add(1)
                    if (hasUpgrade("money", 31)) base = base.add(1)
                    if (hasUpgrade("money", 32)) base = base.add(1)
                    if (hasUpgrade("money", 33)) base = base.add(1)
                    if (hasUpgrade("money", 34)) base = base.add(1)
                    if (hasUpgrade("money", 35)) base = base.add(1)
                    if (hasUpgrade("money", 41)) base = base.add(1)
                    if (hasUpgrade("money", 42)) base = base.add(1)
                    if (hasUpgrade("money", 43)) base = base.add(1)
                    if (hasUpgrade("money", 44)) base = base.add(1)
                    if (hasUpgrade("money", 45)) base = base.add(1)
                    if (hasUpgrade("money", 51)) base = base.add(1)
                    if (hasUpgrade("money", 52)) base = base.add(1)
                    if (hasUpgrade("money", 53)) base = base.add(1)
                    if (hasUpgrade("money", 54)) base = base.add(1)
                    if (hasUpgrade("money", 55)) base = base.add(1)

                    let multiplier = new Decimal(1)

                    if (hasUpgrade("money", 42)) multiplier = new Decimal(2)
                    if (hasUpgrade("money", 45)) multiplier = new Decimal(3.5)

                    return base.times(multiplier)
                }

                let mulBase = new Decimal(1.525)
                if (hasUpgrade("money", 24)) mulBase = mulBase.times(1.2)
                if (hasMilestone("universe", 16)) mulBase = mulBase.times(0.99)

                let base = mulBase.pow(amt())
                if (hasUpgrade("money", 31)) base = base.pow(1.5)
                if (hasUpgrade("money", 55)) base = base.pow(1.1)

                return base
            }
        },

        24: {
            title: "<novamono>M(2-4)</novamono>",
            description: "The previous upgrade's effect scales 20% faster.<br>",
            cost: new Decimal("e16"),
            unlocked() {return hasUpgrade("money", 23)}
        },

        25: {
            title: "<novamono>M(2-5)</novamono>",
            description: "Upgrade M(1-1)'s effect is 2222% stronger.<br>",
            cost: new Decimal("2e18"),
            unlocked() {return hasUpgrade("money", 24)}
        },

        31: {
            title: "<novamono>M(3-1)</novamono>",
            description: "Upgrade M(2-3)'s effect is raised to the power of 1.5.",
            cost: new Decimal("e20"),
            unlocked() {return hasUpgrade("money", 25) && hasMilestone("universe", 12)}
        },

        32: {
            title: "<novamono>M(3-2)</novamono>",
            description: "Time since last universal destruction boosts upgrade M(2-3).",
            cost: new Decimal("e23"),
            unlocked() {return hasUpgrade("money", 31)},
            effect() {
                let time = new Decimal(player.universe.resetTime)
                if (hasUpgrade("money", 33)) time = time.add(player.timePlayed)
                if (hasUpgrade("money", 54)) time = new Decimal(player.universe.resetTime).times(player.timePlayed)
                let powBase = new Decimal(0.25)
                if (hasUpgrade("money", 41)) powBase = powBase.times(1.2)
                if (hasMilestone("universe", 16)) powBase = powBase.times(0.99)
                let base = time.add(1).pow(powBase).pow(2)
                if (hasUpgrade("money", 43)) base = base.pow(1.4)
                if (hasUpgrade("money", 53)) base = base.pow(2)
                if (hasUpgrade("money", 55)) base = base.pow(1.1)
                return base
            }
        },

        33: {
            title: "<novamono>M(3-3)</novamono>",
            description: "The previous upgrade also counts total playtime.",
            cost: new Decimal("e26"),
            unlocked() {return hasUpgrade("money", 32)}
        },

        34: {
            title: "<novamono>M(3-4)</novamono>",
            description: "Gain 1111% more points and 333% more Money.<br>",
            cost: new Decimal("e27"),
            unlocked() {return hasUpgrade("money", 33)}
        },

        35: {
            title: "<novamono>M(3-5)</novamono>",
            description: "Raise upgrade M(1-1)'s effect to the power of 1.1.",
            cost: new Decimal("e30"),
            unlocked() {return hasUpgrade("money", 34)}
        },

        41: {
            title: "<novamono>M(4-1)</novamono>",
            description: "Upgrade M(3-2) scales 20% faster.<br><br>",
            cost: new Decimal("e40"),
            unlocked() {return hasMilestone("universe", 13) && hasUpgrade("money", 35)}
        },

        42: {
            title: "<novamono>M(4-2)</novamono>",
            description: "Upgrade M(2-3)'s effect acts as if each upgrade is two.",
            cost: new Decimal("e42"),
            unlocked() {return hasUpgrade("money", 41)}
        },

        43: {
            title: "<novamono>M(4-3)</novamono>",
            description: "Raise upgrade M(3-2)'s effect to the power of 1.4.<br>",
            cost: new Decimal("e58"),
            unlocked() {return hasUpgrade("money", 42)}
        },

        44: {
            title: "<novamono>M(4-4)</novamono>",
            description: "Upgrade M(3-4) is applied again.<br><br>",
            cost: new Decimal("e61"),
            unlocked() {return hasUpgrade("money", 43)}
        },

        45: {
            title: "<novamono>M(4-5)</novamono>",
            description: "Upgrade M(2-3)'s effect acts as if each upgrade is 3.5 upgrades.",
            cost: new Decimal("e67"),
            unlocked() {return hasUpgrade("money", 44)}
        },

        51: {
            title: "<novamono>M(5-1)</novamono>",
            description: "Quintiple upgrade M(1-3)'s effect while making it scale faster.",
            cost: new Decimal("e95"),
            unlocked() {return hasMilestone("universe", 14) && hasUpgrade("money", 45)}
        },

        52: {
            title: "<novamono>M(5-2)</novamono>",
            description: "Upgrade M(1-1) scales slightly faster.<br>",
            cost: new Decimal("e102"),
            unlocked() {return hasUpgrade("money", 51)}
        },

        53: {
            title: "<novamono>M(5-3)</novamono>",
            description: "Upgrade M(3-2)'s effect is squared.<br><br>",
            cost: new Decimal("e141"),
            unlocked() {return hasUpgrade("money", 52)}
        },

        54: {
            title: "<novamono>M(5-4)</novamono>",
            description: "Time in upgrade M(3-2) scales much faster.<br>",
            cost: new Decimal("e144"),
            unlocked() {return hasUpgrade("money", 53)}
        },

        55: {
            title() {return `<novamono>${jarbler("M(5-5)")}</novamono>`},
            description: "This layer's upgrade effects are raised to the power of 1.1.",
            cost: new Decimal("e150"),
            unlocked() {return hasUpgrade("money", 54)}
        }
    },
    buyables: {
        11: {
            title: "<novamono><small>Artificial Stock Market</small></novamono>",
            display() {return `Current Level: ${formatWhole(getBuyableAmount("money", 11))}/${formatWhole(this.purchaseLimit())}<br><br>Establish a stock market purely controlled by a passive AI that simulates real-world stocks. Each level increases resource gain by <big>${format(this.effectPower())}</big>x, compounding.<br><br>Cost: ${format(this.cost())} Money<br>Effect: x${format(this.effect())} Money`},
            effectPower() {
                let base = new Decimal(1.1)
                if (hasMilestone("universe", 17)) base = base.times(buyableEffect("money", 13))
                return base
            },
            cost() {
                let initial = new Decimal("e200")
                let scale = new Decimal(10).add(new Decimal(0.1).times(getBuyableAmount("money", 11)))
                let base = initial.times(scale.pow(getBuyableAmount("money", 11)))
                return base
            },
            effect() {
                let pow = temp.money.buyables[11].effectPower
                let base = pow.pow(getBuyableAmount("money", 11))
                return base
            },
            canAfford() {return player.money.points.gte(this.cost())},
            buy() {
                player.money.points = player.money.points.sub(this.cost())
                setBuyableAmount("money", 11, getBuyableAmount("money", 11).add(1))
            },
            purchaseLimit() {
                let base = 260
                if (hasUpgrade("booster", 41)) base += 50
                if (hasUpgrade("booster", 44)) base += 25
                if (hasUpgrade("sorbet", 71)) base += Number(player.sorbet.colors.redEffect())
                return base
            }
        },

        12: {
            title: "<novamono><small>Point Resource Buffer</small></novamono>",
            display() {return `Current Level: ${formatWhole(getBuyableAmount("money", 12))}/${formatWhole(this.purchaseLimit())}<br><br>Expansions in the Articical Stock Market allow the passive AI to also improve point production at a larger factor. Each level increases point gain by <big>${format(this.effectPower())}</big>x, compounding.<br><br>Cost: ${format(this.cost())} Money<br>Effect: x${format(this.effect())} Points`},
            effectPower() {
                let base = new Decimal(1.3)
                if (hasMilestone("universe", 17)) base = base.times(buyableEffect("money", 13))
                return base
            },
            cost() {
                let initial = new Decimal("e200")
                let scale = new Decimal(9).add(new Decimal(0.1).times(getBuyableAmount("money", 12)))
                let base = initial.times(scale.pow(getBuyableAmount("money", 12)))
                return base
            },
            effect() {
                let pow = temp.money.buyables[12].effectPower
                let base = pow.pow(getBuyableAmount("money", 12))
                return base
            },
            canAfford() {return player.money.points.gte(this.cost())},
            buy() {
                player.money.points = player.money.points.sub(this.cost())
                setBuyableAmount("money", 12, getBuyableAmount("money", 12).add(1))
            },
            purchaseLimit() {
                let base = 260
                if (hasUpgrade("booster", 41)) base += 50
                if (hasUpgrade("booster", 44)) base += 25
                if (hasUpgrade("sorbet", 71)) base += Number(player.sorbet.colors.redEffect())
                return base
            }
        },

        13: {
            title: "<novamono><small>Room Expansions</small></novamono>",
            display() {return `Current Level: ${formatWhole(getBuyableAmount("money", 13))}/${formatWhole(this.purchaseLimit())}<br><br>The AI needs more room to improve itself, so you expand its quarters, providing a <big>${formatSmall(this.effectPower(), 4)}</big>x boost to the previous two effects' scaling, compounding.<br><br>Cost: ${format(this.cost())} Money<br>Effect: x${formatSmall(this.effect(), 4)} Buyable 1 & 2`},
            effectPower() {
                let base = new Decimal(1.0015)
                if (player.universe.points.gte(45)) base = base.sub(new Decimal(0.0015).times(0.05))
                if (hasUpgrade("sorbet", 21)) base = base.sub(1).times(1.1).add(1)
                return base
            },
            cost(x) {
                let initial = new Decimal("e300")
                let scale = new Decimal(1500).add(new Decimal(200).times(x))
                let base = initial.times(scale.pow(x))
                return base
            },
            effect() {
                let pow = temp.money.buyables[13].effectPower
                let base = pow.pow(getBuyableAmount("money", 13))
                return base
            },
            canAfford() {return player.money.points.gte(this.cost(getBuyableAmount("money", 13)))},
            buy() {
                player.money.points = player.money.points.sub(this.cost(getBuyableAmount("money", 13)))
                setBuyableAmount("money", 13, getBuyableAmount("money", 13).add(1))
            },
            purchaseLimit() {
                let base = 75
                if (hasUpgrade("booster", 43)) base += 35
                if (hasUpgrade("booster", 44)) base += 25
                if (hasUpgrade("sorbet", 24)) base += 55
                if (hasUpgrade("sorbet", 51)) base += 75
                if (hasUpgrade("sorbet", 71)) base += Number(player.sorbet.colors.redEffect())
                return base
            }
        }
    },
    clickables: {
    },
    gainMult() {
        let base = new Decimal(1)
        if (hasUpgrade("money", 13)) base = base.times(upgradeEffect("money", 13))
        if (hasMilestone("universe", 12)) base = base.div(1.2)
        if (hasUpgrade("money", 34)) base = base.times(4.33)
        if (hasUpgrade("money", 44)) base = base.times(4.33)
        if (hasMilestone("universe", 15)) base = base.times(buyableEffect("money", 11))
        if (hasUpgrade("universe", 21)) base = base.times(upgradeEffect("universe", 21))
        if (hasMilestone("universe", 18)) base = base.times(buyableEffect("LPrestige", 11))
        if (player.universe.points.gte(35) && player.points.gte("e5500")) base = base.times(1500000)
        if (hasUpgrade("booster", 32)) base = base.times(player.booster.effects[1])
        if (hasUpgrade("sorbet", 11)) base = base.times(2000000)
        if (hasUpgrade("sorbet", 32)) base = base.times(upgradeEffect("sorbet", 32))
        if (hasUpgrade("sorbet", 62)) base = base.times(player.sorbet.colors.darkEffect("pos"))
        return base
    },
    passiveGeneration() {
        let base = new Decimal(0)
        if (hasMilestone("LPrestige", 11)) base = base.add(0.01)
        if (hasMilestone("LPrestige", 12)) base = base.add(0.14)
        if (hasMilestone("LPrestige", 13)) base = base.add(new Decimal(0.01).times(getBuyableAmount("LPrestige", 11)))
        if (hasMilestone("LPrestige", 14)) base = base.times(2)
        if (hasMilestone("LPrestige", 15)) base = base.times(3)
        if (hasMilestone("LPrestige", 16)) base = base.times(5)
        if (hasMilestone("LPrestige", 17)) base = base.times(15).pow(1.1)
        return base
    },
    autoUpgrade() {return hasMilestone("LPrestige", 11)},
    hotkeys: [
        {
            key: "m",
            description: "M: Reset points for Money",
            onPress() {if (player.money.unlocked) doReset("money")}
        }
    ],
    automate() {
        if (hasMilestone("LPrestige", 12)) {
            if (temp.money.buyables[11].canAfford && getBuyableAmount("money", 11).lt(temp.money.buyables[11].purchaseLimit)) {
                player.money.points = player.money.points.sub(temp.money.buyables[11].cost)
                setBuyableAmount("money", 11, getBuyableAmount("money", 11).add(1))
            }
            if (temp.money.buyables[12].canAfford && getBuyableAmount("money", 12).lt(temp.money.buyables[12].purchaseLimit)) {
                player.money.points = player.money.points.sub(temp.money.buyables[12].cost)
                setBuyableAmount("money", 12, getBuyableAmount("money", 12).add(1))
            }
            if (temp.money.buyables[13].canAfford && getBuyableAmount("money", 13).lt(temp.money.buyables[13].purchaseLimit)) {
                player.money.points = player.money.points.sub(temp.money.buyables[13].cost)
                setBuyableAmount("money", 13, getBuyableAmount("money", 13).add(1))
            }
        }
    },
    branches: [["booster", 3], ["sorbet", 3]],
    onPrestige() {
        player.sillyStats.prestigeTimes = player.sillyStats.prestigeTimes.add(1)
    }
})