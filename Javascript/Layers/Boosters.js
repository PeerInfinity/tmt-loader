addLayer("booster", {
    startData() {return {
        unlocked() {return hasMilestone("universe", 19)},

        points: new Decimal(0),
        total: new Decimal(0),

        resetTime: 0,

        effectTextBoost: ``,
        effectTextUpgrade: ``,

        effects: [new Decimal(1), new Decimal(1), new Decimal(1)],

        altered: {
            golden: new Decimal(0),
            heavy: new Decimal(0),
        }
    }},
    update() {
        player.booster.effectTextBoost = ``
        player.booster.effectTextUpgrade = ``

        if (player.booster.unlocked) {
            let powBase = new Decimal(100000)
            if (hasUpgrade("booster", 12)) powBase = powBase.times(upgradeEffect("booster", 12))
            if (hasUpgrade("booster", 31)) powBase = powBase.times(3)
            if (player.universe.points.gte(35)) powBase = powBase.times(temp.booster.buyables[11].effectScale)
            let amt = player.booster.points
            let base = powBase.pow(amt)

            if (hasUpgrade("booster", 11)) base = base.times(upgradeEffect("booster", 11))

            player.booster.effects[0] = base

            let sL = new Decimal("e500")
            if (hasMilestone("universe", 23)) sL = sL.div("e15")
            if (hasUpgrade("booster", 42)) sL = sL.times(player.booster.effects[1])
            if (player.universe.points.gte(35)) sL = sL.times(new Decimal(10).pow(temp.booster.buyables[11].effectOOM)).div(10).add(1)
            let sP = new Decimal(0.3)

            if (player.booster.effects[0].gte(sL)) {
                player.booster.effects[0] = new Decimal(sL).add(player.booster.effects[0].sub(sL).pow(sP))
            }

            let hc = new Decimal("e4000000")

            if (player.booster.effects[0].gte(hc)) player.booster.effects[0] = hc

            player.booster.effectTextBoost += `<h2><novamono>x${format(player.booster.effects[0])} <text style="color: #43A">Points</text></novamono></h2> (Softcaps at ${format(sL)} Multiplier)<br><small><gray>Softcap Power: ${format(sL)} + (x - ${format(sL)})<sup>${format(sP)}</sup></gray></small><br><gray><small>Boost Power: ${format(powBase)}</small></gray><br><angerRed><small>Hardcap: ${format(hc)}</small></angerRed><br><br>`  
        }

        if (hasUpgrade("booster", 32)) {
            let powBase = new Decimal(3.8)
            if (hasUpgrade("booster", 33)) powBase = powBase.times(2)
            if (hasUpgrade("booster", 44)) powBase = powBase.times(1.75)
            if (player.universe.points.gte(35)) powBase = powBase.times(temp.booster.buyables[12].effectScale)
            let amt = player.booster.points
            let base = powBase.pow(amt)
            
            if (hasUpgrade("booster", 34)) base = base.times(upgradeEffect("booster", 34))

            player.booster.effects[1] = base

            let sL = new Decimal("e100")
            if (player.universe.points.gte(35)) sL = sL.times(new Decimal(10).pow(temp.booster.buyables[12].effectOOM)).div(10).add(1)

            let sP = new Decimal(0.8)
            if (player.universe.points.gte(67)) sP = sP.sub(0.02)

            if (player.booster.effects[1].gte(sL)) {
                player.booster.effects[1] = new Decimal(sL).add(player.booster.effects[1].sub(sL).pow(sP))
            }

            let hc = new Decimal("e2250000")

            if (player.booster.effects[1].gte(hc)) player.booster.effects[1] = hc

            player.booster.effectTextBoost += `<h2><novamono>x${format(player.booster.effects[1])} <text style="color: #43A">Money</text></novamono></h2> (Softcaps at ${format(sL)} Multiplier)<br><small><gray>Softcap Power: ${format(sL)} + (x - ${format(sL)})<sup>${format(sP)}</sup></gray></small><br><gray><small>Boost Power: ${format(powBase)}</small></gray><br><angerRed><small>Hardcap: ${format(hc)}</small></angerRed><br><br>`  
        }

        if (hasMilestone("universe", 31)) {
            let powBase = new Decimal(1.11)
            if (hasUpgrade("booster", 51)) powBase = powBase.times(3)
            let amt = player.booster.points
            let base = powBase.pow(amt)
            

            player.booster.effects[2] = base

            let sL = new Decimal("e10000")

            let sP = new Decimal(0.25)

            if (player.booster.effects[2].gte(sL)) {
                player.booster.effects[2] = new Decimal(sL).add(player.booster.effects[2].sub(sL).pow(sP))
            }

            player.booster.effectTextBoost += `<h2><novamono>x${format(player.booster.effects[2])} <text style="color: #43A">${temp.sorbet.resource}</text></novamono></h2> (Softcaps at ${format(sL)} Multiplier)<br><small><gray>Softcap Power: ${format(sL)} + (x - ${format(sL)})<sup>${format(sP)}</sup></gray></small><br><gray><small>Boost Power: ${format(powBase)}</small></gray>`  
        }

        if (hasUpgrade("booster", 11)) player.booster.effectTextUpgrade += `Total effect from upgrade <text style="color: ${temp.booster.color}">B(1-1)</text>: x${format(upgradeEffect("booster", 11))} Point Boost<br>`
        if (hasUpgrade("booster", 12)) player.booster.effectTextUpgrade += `Total effect from upgrade <text style="color: ${temp.booster.color}">B(1-2)</text>: x${format(upgradeEffect("booster", 12))} Point Boost Scaling<br>`
        if (hasUpgrade("booster", 21)) player.booster.effectTextUpgrade += `Total effect from upgrade <text style="color: ${temp.booster.color}">B(2-1)</text>: x${format(upgradeEffect("booster", 21))} <text style="color: ${temp.booster.color}">B(1-2)</text> Effect<br>`
        if (hasUpgrade("booster", 34)) player.booster.effectTextUpgrade += `Total effect from upgrade <text style="color: ${temp.booster.color}">B(3-4)</text>: x${format(upgradeEffect("booster", 34))} Money Boost<br>`
    },
    symbol: "BST",
    color: "#4433AA",
    layerShown() {return hasMilestone("universe", 19)},
    requires: new Decimal("e500"),
    resource: "Boosters",
    baseResource: "Money",
    baseAmount() {return player.money.points},
    type: "static",
    exponent: 1.059,
    base: 1.0e+50,
    row: 2,
    tooltip: "Boosters",
    microtabs: {
        index: {
            "Upgrades": {
                content: ["blank", ["display-text", function() {return player.booster.effectTextUpgrade}], "blank", "upgrades"]
            },

            "Boosts": {
                content: ["blank", ["display-text", function() {return player.booster.effectTextBoost}]]
            },

            "Alteration": {
                content: [
                    "blank", 
                    ["display-text", "<small>Getting an altered booster resets points and the money layer while also deducting the boosters needed for it. The buyable cost scales faster after 10, 25, 50, 100, and 1000.</small>"],
                    "blank",
                    ["display-text", function() {return `<small><text style="color:gold; text-shadow: 0 0 6px gold"><big>${formatWhole(player.booster.altered.golden)}</big></text> Golden Boosters, <text style="color:dimgray; text-shadow: 0 0 6px dimgray"><big>${formatWhole(player.booster.altered.heavy)}</big></text> Heavy Boosters</small>`}],
                    "blank",
                    "buyables",
                    "blank",
                    ["display-text", function() {if (player.booster.altered.heavy.gte(1)) return (`Total Effect from <rubik><text style="text-shadow: 0 0 6px ${temp.booster.color}; color: ${temp.booster.color}">Heavy Boosters</text></rubik>:<br>Point boost softcaps starts <text style="color: ${temp.booster.color}; text-shadow: 0 0 6px ${temp.booster.color}">${format(temp.booster.buyables[11].effectOOM.sub(1))}</text> OoMs later<br>Point boost scales <text style="color: ${temp.booster.color}; text-shadow: 0 0 6px ${temp.booster.color}">${format(temp.booster.buyables[11].effectScale)}</text> times faster`)}],
                    "blank",
                    ["display-text", function() {if (player.booster.altered.golden.gte(1)) return (`Total Effect from <rubik><text style="text-shadow: 0 0 6px ${temp.booster.color}; color: ${temp.booster.color}">Golden Boosters</text></rubik>:<br>Money boost softcaps starts <text style="color: ${temp.booster.color}; text-shadow: 0 0 6px ${temp.booster.color}">${format(temp.booster.buyables[12].effectOOM.sub(1))}</text> OoMs later<br>Money boost scales <text style="color: ${temp.booster.color}; text-shadow: 0 0 6px ${temp.booster.color}">${format(temp.booster.buyables[12].effectScale)}</text> times faster`)}]
                ],
                    unlocked() {return hasMilestone("universe", 24)}
            },

            "Node Info": {
                content: ["blank", ["display-text", "Multiversal Branch Type: (Index -> Classic, 0, 0)<br>Transition Node"], "blank", ["display-text", function() {return `Total Booster Cost Divider: /<big>${format(new Decimal(1).div(temp.booster.gainMult))}</big>`}]]
            },
        }
    },
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "blank",
        ["microtabs", "index"]
    ],
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}},
        "upgrade"() {return {"width":"150px", "height":"125px"}}
    },
    upgrades: {
        11: {
            title: "<novamono>B(1-1)</novamono>",
            description: "The point boost from boosters boost themselves.<br><br>",
            cost: new Decimal(4),
            unlocked() {return hasMilestone("universe", 20)},
            effect() {
                let powBase = new Decimal(0.3)
                if (hasUpgrade("booster", 13)) powBase = powBase.times(1.2)
                if (hasUpgrade("booster", 14)) powBase = powBase.times(1.05)
                let base = player.booster.effects[0].pow(powBase)
                if (hasUpgrade("booster", 13)) base = base.pow(1.2)
                return base
            }
        },

        12: {
            title: "<novamono>B(1-2)</novamono>",
            description: "The point boost from boosters scales twice as fast for every upgrade in this row.<br>",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("booster", 11)},
            effect() {
                let amt = new Decimal(0)
                if (hasUpgrade("booster", 11)) amt = amt.add(1)
                if (hasUpgrade("booster", 12)) amt = amt.add(1)
                if (hasUpgrade("booster", 13)) amt = amt.add(1)
                if (hasUpgrade("booster", 14)) amt = amt.add(1)
                let base = new Decimal(2).pow(amt)
                if (hasUpgrade("booster", 14)) base = base.pow(1.5)
                if (hasUpgrade("booster", 21)) base = base.times(upgradeEffect("booster", 21))
                return base
            }
        },

        13: {
            title: "<novamono>B(1-3)</novamono>",
            description: "B(1-1)'s boost is raised to the power of 1.2 and scales 20% faster.<br>",
            cost: new Decimal(6),
            unlocked() {return hasUpgrade("booster", 12)}
        },

        14: {
            title: "<novamono>B(1-4)</novamono>",
            description: "B(1-2)'s boost is raised to the power of 1.5.<br><br>",
            cost: new Decimal(7),
            unlocked() {return hasUpgrade("booster", 13)}
        },

        21: {
            title: "<novamono>B(2-1)</novamono>",
            description: "Time since the last booster boosts upgrade B(1-2)'s effect.<br><br>",
            cost: new Decimal(8),
            unlocked() {return hasMilestone("universe", 21) && hasUpgrade("booster", 14)},
            effect() {
                let logBase = new Decimal(5)
                if (hasUpgrade("booster", 22)) logBase = logBase.sub(1)
                let time = new Decimal(player.booster.resetTime)
                if (hasUpgrade("booster", 23)) time = time.add(new Decimal(player.universe.resetTime))
                if (hasUpgrade("booster", 24)) time = time.pow(1.5)
                let base = time.add(1).log(logBase).add(1)
                if (hasUpgrade("booster", 22)) base = base.pow(2)
                return base
            }
        },

        22: {
            title: "<novamono>B(2-2)</novamono>",
            description: "Square the previous upgrade's effect and make it scale faster.<br><br>",
            cost: new Decimal(9),
            unlocked() {return hasUpgrade("booster", 21)}
        },

        23: {
            title: "<novamono>B(2-3)</novamono>",
            description: "B(2-1)'s effect also counts time since the last destroyed universe.<br>",
            cost: new Decimal(11),
            unlocked() {return hasUpgrade("booster", 22)}
        },

        24: {
            title: "<novamono>B(2-4)</novamono>",
            description: "Time in B(2-1)'s effect is raised to the power of 1.5. B(1-1)'s effect scales 5% faster.<br>",
            cost: new Decimal(14),
            unlocked() {return hasUpgrade("booster", 23)}
        },

        31: {
            title: "<novamono>B(3-1)</novamono>",
            description: "Point boost scaling is 200% better and you can buy max Boosters.<br><br>",
            cost: new Decimal(22),
            unlocked() {return hasMilestone("universe", 22) && hasUpgrade("booster", 24)}
        },

        32: {
            title: "<novamono>B(3-2)</novamono>",
            description: "Unlock another boost that improves money gain, though at a significantly harsher rate.",
            cost: new Decimal(29),
            unlocked() {return hasUpgrade("booster", 31)}
        },

        33: {
            title: "<novamono>B(3-3)</novamono>",
            description: "The money boost from boosters scales twice as fast.<br><br>",
            cost: new Decimal(31),
            unlocked() {return hasUpgrade("booster", 32)}
        },

        34: {
            title: "<novamono>B(3-4)</novamono>",
            description: "The logarithmic from the booster's first boost affects the second boost.<br>",
            cost: new Decimal(35),
            unlocked() {return hasUpgrade("booster", 33)},
            effect() {
                let logBase = new Decimal(1.0005)
                let ref = player.booster.effects[0]
                let base = ref.add(1).log(logBase).add(1)
                return base
            }
        },

        41: {
            title: "<novamono>B(4-1)</novamono>",
            description: "The first two buyables in the M Node have 50 more max levels.<br><br>",
            cost: new Decimal(36),
            unlocked() {return hasMilestone("universe", 23) && hasUpgrade("booster", 34)}
        },

        42: {
            title: "<novamono>B(4-2)</novamono>",
            description: "The money boost effect makes the first effect's softcap start later.<br>",
            cost: new Decimal(37),
            unlocked() {return hasUpgrade("booster", 41)}
        },

        43: {
            title: "<novamono>B(4-3)</novamono>",
            description: "The third buyable in the M Node has 35 more max levels. <br><br>",
            cost: new Decimal(40),
            unlocked() {return hasUpgrade("booster", 42)}
        },

        44: {
            title: "<novamono>B(4-4)</novamono>",
            description: "All M Node buyables have 25 more max levels and the money boost scales 75% faster.<br>",
            cost: new Decimal(41),
            unlocked() {return hasUpgrade("booster", 43)}
        },

        51: {
            title: "<novamono>B<sub>S</sub>(1-1)</novamono>",
            description: "The third booster effect scales 3x as fast.<br>",
            cost: new Decimal(60000),
            unlocked() {return hasUpgrade("sorbet", 121) && hasUpgrade("booster", 44)},
            style() {return {"margin-top":"20px"}}
        }
    },
    canBuyMax() {return hasUpgrade("booster", 31)},
    onPrestige() {
        player.sillyStats.prestigeTimes = player.sillyStats.prestigeTimes.add(1)
    },
    hotkeys: [
        {
            key: "b",
            description: "B: Reset Money for Boosters",
            onPress() {if (player.booster.unlocked()) doReset("booster")}
        }
    ],
    buyables: {
        11: {
            title: "<novamono><small>Compression Chamber</small></novamono>",
            display() {return `Putting a dying neutron star in this god-forsaken mothership was probably not the best idea ever concieved. Each level increases the point boost's softcap by <big>${format(this.oomEffectBase(), 1)}</big> OoMs and make its effect scaling <big>${format(this.effectScaleBase())}</big>x better.<br><br>Cost: ${formatWhole(this.cost())} Boosters`},
            oomEffectBase() {
                let base = new Decimal(75)
                if (hasUpgrade("sorbet", 22)) base = base.times(1.05)
                if (hasUpgrade("sorbet", 53)) base = base.times(1.175)
                return base
            },
            effectScaleBase() {
                let base = new Decimal(1.1)
                return base
            },
            effectOOM() {
                let base = this.oomEffectBase()
                let scale = player.booster.altered.heavy
                return base.times(scale).add(1)
            },
            effectScale() {
                let base = this.effectScaleBase()
                let scale = player.booster.altered.heavy
                return base.pow(scale)
            },
            cost() {
                let initial = new Decimal(44)
                let scalePow = new Decimal(1.1)
                if (player.booster.altered.heavy.gte(11)) scalePow = scalePow.add(0.07)
                if (player.booster.altered.heavy.gte(26)) scalePow = scalePow.add(0.15)
                if (player.booster.altered.heavy.gte(51)) scalePow = scalePow.add(0.33)
                if (player.booster.altered.heavy.gte(101)) scalePow = scalePow.add(1.14)

                let scale = new Decimal(5).times(player.booster.altered.heavy.pow(scalePow))
                let base = initial.add(scale)
                return base
            },
            canAfford() {return player.booster.points.gte(this.cost().round())},
            buy() {
                player.booster.points = player.booster.points.sub(this.cost().round())
                if (!hasMilestone("LPrestige", 22)) {
                    layerDataReset("money")
                    player.points = new Decimal(0)
                }
                player.booster.altered.heavy = player.booster.altered.heavy.add(1)
            }
        },

        12: {
            title: "<novamono><small>Alchemic Drive</small></novamono>",
            display() {return `Far into the future, we can reliably turn any able-bodied metal into precious gold. Each level increases the money boost's softcap by <big>${format(this.oomEffectBase(), 1)}</big> OoMs and make its effect scaling <big>${format(this.effectScaleBase(), 2)}</big>x better. <br><br> Cost: ${formatWhole(this.cost().round())} Boosters`},
            oomEffectBase() {
                let base = new Decimal(25)
                if (hasUpgrade("sorbet", 25)) base = base.times(1.1)
                if (hasUpgrade("sorbet", 53)) base = base.times(1.175)
                return base
            },
            effectScaleBase() {
                let base = new Decimal(1.33)
                if (hasMilestone("universe", 26)) base = base.times(0.98)
                if (hasMilestone("universe", 27)) base = base.times(0.98)
                if (hasUpgrade("sorbet", 101)) base = base.times(1.05)
                return base
            },
            effectOOM() {
                let base = this.oomEffectBase()
                let scale = player.booster.altered.golden
                return base.times(scale).add(1)
            },
            effectScale() {
                let base = this.effectScaleBase()
                let scale = player.booster.altered.golden
                return base.pow(scale)
            },
            cost() {
                let initial = new Decimal(55)
                let scalePow = new Decimal(1.1)
                if (player.booster.altered.golden.gte(11)) scalePow = scalePow.add(0.07)
                if (player.booster.altered.golden.gte(26)) scalePow = scalePow.add(0.11)
                if (player.booster.altered.golden.gte(51)) scalePow = scalePow.add(0.36)
                if (player.booster.altered.golden.gte(101)) scalePow = scalePow.add(1.14)

                let scale = new Decimal(6).times(player.booster.altered.golden.pow(scalePow))
                let base = initial.add(scale)
                return base
            },
            canAfford() {return player.booster.points.gte(this.cost().round())},
            buy() {
                player.booster.points = player.booster.points.sub(this.cost().round())
                if (!hasMilestone("LPrestige", 22)) {
                    layerDataReset("money")
                    player.points = new Decimal(0)
                }
                player.booster.altered.golden = player.booster.altered.golden.add(1)
            }

        }
    },
    autoPrestige() {return (hasUpgrade("sorbet", 52) || hasMilestone("LPrestige", 21))},
    resetsNothing() {return (hasUpgrade("sorbet", 52) || hasMilestone("LPrestige", 21))},
    gainMult() {
        let base = new Decimal(1)
        if (hasUpgrade("sorbet", 82)) base = base.div(player.sorbet.colors.trueEffect())
        if (hasUpgrade("sorbet", 113)) base = base.div(upgradeEffect("sorbet", 113))

        return base
    },
    autoUpgrade() {return hasMilestone("LPrestige", 24)}
})