addLayer("colin", {
    startData() {return {
        unlocked() {return player.universe.points.gte(81)},

        points: new Decimal(0),
        distance: new Decimal(0),
        speed: new Decimal(0),
        distanceMilestones: [
            new Decimal(0), // Glob Multiplier
            new Decimal(0), // Point Multiplier
            new Decimal(0), // Fidelity Multiplier
        ],

        upgradeText: ``,
        distanceText: ``,
        milestoneText: ``
    }},
    update() {
        if (player.colin.distance.gte(1000)) {
            let logBase = new Decimal(1).add(0.000001)
            let powBaseBase = new Decimal(1.001)
            if (hasUpgrade("colin", 13)) powBaseBase = powBaseBase.times(1.75)
            let powBase = new Decimal(player.colin.points.times(0.35)).pow(powBaseBase)
            let base = player.colin.distance.add(1).log(logBase).add(1).pow(powBase)

            if (base.gte("e25500")) base = new Decimal("e25500").add(base.sub("e25500").pow(0.2))

            player.colin.distanceMilestones[0] = base
        }

        if (player.colin.distance.gte(1000000)) {
            let powBaseA = new Decimal(3.33)
            let powBaseB = new Decimal(1.065)
            let base = player.colin.distance.pow(powBaseA.times(powBaseB.pow(player.colin.points)))

            if (base.gte("e3000000")) base = new Decimal("e3000000").add(base.sub("e3000000").pow(0.002))

            player.colin.distanceMilestones[1] = base
        }

        if (player.colin.distance.gte("e9")) {
            let powBase = new Decimal(2.5)
            let logBase = new Decimal(1.5)
            let base = player.colin.distance.pow(powBase).add(1).log(logBase).add(1)

            player.colin.distanceMilestones[2] = base
        }

        let txt = ``
        if (hasUpgrade("colin", 11)) txt += `Total effect from upgrade <text style="color:${temp.colin.color}">C(1-1)</text>: x${format(upgradeEffect("colin", 11))} Speed<br>`
        if (hasUpgrade("colin", 12)) txt += `Total effect from upgrade <text style="color:${temp.colin.color}">C(1-2)</text>: x${format(upgradeEffect("colin", 12))} Speed<br>`
        if (hasUpgrade("colin", 22)) txt += `Total effect from upgrade <text style="color:${temp.colin.color}">C(2-2)</text>: x${format(upgradeEffect("colin", 22))} Points<br>`
        if (hasUpgrade("colin", 34)) txt += `Total effect from upgrade <text style="color:${temp.colin.color}">C(3-4)</text>: x${format(upgradeEffect("colin", 34))} Speed<br>`
        player.colin.upgradeText = txt

        txt = ``
        if (player.colin.distance.gte(1000)) {txt += `1 Kilometer Milestone: x${format(player.colin.distanceMilestones[0])} Latex Globs<br>`} else {txt += `Milestone Unlocks at 1 Kilometer of Distance<br>`}
        if (player.colin.distance.gte(1000000)) {txt += `1 Megameter Milestone: x${format(player.colin.distanceMilestones[1])} Points<br>`} else {txt += `Milestone Unlocks at 1 Megameter of Distance<br>`}
        if (player.colin.distance.gte("e9")) {txt += `1 Gigameter Milestone: x${format(player.colin.distanceMilestones[2])} Fidelity<br>`} else {txt += `Milestone Unlocks at 1 Gigameter of Distance<br>`}


        player.colin.distanceText = txt

        txt = ``
        if (hasMilestone("colin", 16)) txt += `Total effect from milestone <text style="color:${temp.colin.color}">6 "Motivation"</text>: x${format(temp.colin.milestones[16].effect)} Latex Globs<br>`
        if (hasMilestone("colin", 17)) txt += `Total effect from milestone <text style="color:${temp.colin.color}">7 "Motivation"</text>: x${format(buyableEffect("LPrestige", 12).pow(0.2))} True Globs<br>`
        if (hasMilestone("colin", 23)) txt += `Total effect from milestone <text style="color:${temp.colin.color}">150 "Motivation"</text>: x${format(temp.colin.milestones[23].effect)} Speed<br>`
        player.colin.milestoneText = txt


        let mulBase = new Decimal(5)
        let base = player.colin.points.times(mulBase)
        if (hasUpgrade("colin", 11)) base = base.times(upgradeEffect("colin", 11))
        if (hasUpgrade("colin", 12)) base = base.times(upgradeEffect("colin", 12))
        if (hasUpgrade("colin", 14)) base = base.times(3)
        if (hasUpgrade("colin", 21)) base = base.times(2)
        if (hasUpgrade("colin", 24)) base = base.times(4)
        if (hasMilestone("colin", 23)) base = base.times(temp.colin.milestones[23].effect)
        if (hasUpgrade("colin", 33)) base = base.times(3)
        if (player.universe.points.gte(93) && player.colin.distance.gte("1.5e14")) base = base.div(25)
        if (hasUpgrade("colin", 34)) base = base.times(upgradeEffect("colin", 34))
        if (hasUpgrade("colin", 41)) base = base.times(5)

        player.colin.speed = base
    },
    symbol() {return `C<small><small><small><small><small><sub>${player.prestigeAmount[2]}</sub></small></small></small></small></small>`},
    color: "#A31",
    layerShown() {return player.universe.points.gte(81)},
    requires: new Decimal("e4000"),
    resource: "\"Motivation\"",
    baseResource: "Latex Globs",
    baseAmount() {return player.sorbet.points},
    type: "static",
    base: new Decimal("e450"),
    exponent: 1.05,
    tooltip: "Colin's Layer",
    row: 3,
    microtabs: {
        index: {
            "Upgrades": {
                content: ["blank", ["display-text", function() {return player.colin.upgradeText}], "blank", "upgrades"],
                unlocked() {return hasMilestone("universe", 38)}
            },

            "Speed": {
                content: ["blank", ["microtabs", "spd"]],
                unlocked() {return hasMilestone("universe", 38)}
            },

            "Milestones": {
                content: ["blank", ["display-text", function() {return player.colin.milestoneText}], "blank", "milestones"]
            },

            "Node Info": {
                content: ["blank", ["display-text", "Multiversal Branch Type: (Sorbet's Circle, 0, -1)"]]
            }
        },

        spd: {
            "Distance": {
                content: ["blank", ["display-text", function() {return `<b>He</b> has ran <h3 style="color:silver;text-shadow: 0 0 6px silver">${formatDistance(player.colin.distance)}</h3>, running at <h3 style="color:silver;text-shadow: 0 0 6px silver">${formatSpeed(player.colin.speed)}</h3>`}], "blank", ["display-text", function() {
                    let txt = ``

                    if (player.colin.distance.gte("1.50e14") && player.universe.points.gte(93)) txt += `<small><lightglow->Interstellar Winds</lightglow->: Speed is divided by 25 as you leave the solar system</small>`

                    return txt
                }]]
            },

            "Effects": {
                content: ["blank", ["display-text", function() {return player.colin.distanceText}]]
            }
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
        "milestone"() {return {"width":"600px"}},
        "upgrade"() {return {"width":"150px", "height":"150px"}}
    },
    milestones: {
        11: {
            requirementDescription: "1 \"Motivation\"",
            done() {return player.colin.points.gte(1)},
            effectDescription: "Quintiple the production of Pure Globs and triple the production of Dark Globs. x100,000 Latex Globs."
        },

        12: {
            requirementDescription: "2 \"Motivation\"",
            done() {return player.colin.points.gte(2)},
            effectDescription: "Triple colored globs limit and x1.5 the effects of Plant, Magma, Alien, and Inkfur globs.",
            unlocked() {return player.colin.points.gte(1)}
        },

        13: {
            requirementDescription: "3 \"Motivation\"",
            done() {return player.colin.points.gte(3)},
            effectDescription: "Point gain is multiplied by 1.00e9999 and you gain 33% more True and Red Crystal Globs.",
            unlocked() {return player.colin.points.gte(2)}
        },

        14: {
            requirementDescription: "4 \"Motivation\"",
            done() {return player.colin.points.gte(4)},
            effectDescription: "S(START REPLICATION)'s effect is raised to the power of 4.5 and S(3-2) scales 25% faster. x1,000,000 Latex Globs.",
            unlocked() {return player.colin.points.gte(3)}
        },

        15: {
            requirementDescription: "5 \"Motivation\"",
            done() {return player.colin.points.gte(5)},
            effectDescription: "Unlock another row of small Sorbet upgrades. x1.00e10 Latex Globs and x2.5 Prestige Essence gain.",
            unlocked() {return player.colin.points.gte(4)}
        },

        16: {
            requirementDescription: "6 \"Motivation\"",
            done() {return player.colin.points.gte(6)},
            effectDescription() {return `Every unlocked milestone in this layer boosts Latex Globs gain by ${format(this.power())} compounding.`},
            unlocked() {return player.colin.points.gte(5)},
            effect() {
                let amt = function() {
                    let x = new Decimal(0)

                    if (hasMilestone("colin", 11)) x = x.add(1)
                    if (hasMilestone("colin", 12)) x = x.add(1)
                    if (hasMilestone("colin", 13)) x = x.add(1)
                    if (hasMilestone("colin", 14)) x = x.add(1)
                    if (hasMilestone("colin", 15)) x = x.add(1)
                    if (hasMilestone("colin", 16)) x = x.add(1)
                    if (hasMilestone("colin", 17)) x = x.add(1)
                    if (hasMilestone("colin", 18)) x = x.add(1)
                    if (hasMilestone("colin", 19)) x = x.add(1)
                    if (hasMilestone("colin", 20)) x = x.add(1)
                    if (hasMilestone("colin", 21)) x = x.add(1)
                    if (hasMilestone("colin", 22)) x = x.add(1)

                    return x
                }
                let base = this.power().pow(amt())
                return base
            },
            power() {
                let base = new Decimal(152500)
                if (hasUpgrade("colin", 21)) base = base.times(3)
                if (hasUpgrade("colin", 32)) base = base.times(25)
                return base
            }
        },

        17: {
            requirementDescription: "7 \"Motivation\"",
            done() {return player.colin.points.gte(7)},
            effectDescription: "Prestiging Sorbet's Layer also affects True Glob gain at a severely reduced rate. x1.00e25 Latex Globs.",
            unlocked() {return hasMilestone("colin", 16) && hasMilestone("universe", 37)}
        },

        18: {
            requirementDescription: "8 \"Motivation\"",
            done() {return player.colin.points.gte(8)},
            effectDescription: "S(START REPLICATION), S(3-1), and S(4-1)'s effects are cubed. x1.00e30 Latex Globs.",
            unlocked() {return hasMilestone("colin", 17)}
        },

        19: {
            requirementDescription: "9 \"Motivation\"",
            done() {return player.colin.points.gte(9)},
            effectDescription: "x1.00e125 Latex Globs and x1e10,000 Points.",
            unlocked() {return hasMilestone("colin", 18)}
        },

        20: {
            requirementDescription: "11 \"Motivation\"",
            done() {return player.colin.points.gte(11)},
            effectDescription: "Unlock the 2nd row of Colin-infused Sorbet upgrades but Latex Glob gain is raised to the power of 0.9.",
            unlocked() {return hasMilestone("colin", 19)}
        },

        21: {
            requirementDescription: "75 \"Motivation\"",
            done() {return player.colin.points.gte(75)},
            effectDescription: "C(1-2) scales 10% faster and going relavitistic grants a x1e100,000 boost to points. x1.00e200 Latex Globs.",
            unlocked() {return hasMilestone("colin", 20) && hasUpgrade("colin", 24)}
        },

        22: {
            requirementDescription: "100 \"Motivation\"",
            done() {return player.colin.points.gte(100)},
            effectDescription: "C(2-2)'s effect is cubed and double True Globs gain. x1.00e350 Latex Globs.",
            unlocked() {return hasMilestone("colin", 21)}
        },

        23: {
            requirementDescription: "150 \"Motivation\"",
            done() {return player.colin.points.gte(150)},
            effectDescription: "Speed is faster based on current points. x1.00e400 Latex Globs and x1.5 True Globs.",
            unlocked() {return hasMilestone("colin", 22)},
            effect() {
                let logBase = new Decimal("e1000")
                let powBase = new Decimal(0.09)
                let base = new Decimal(1).add(player.sorbet.points.add(1).log(logBase).pow(powBase))
                return base
            }
        }
    },
    onPrestige() {
        player.sillyStats.prestigeTimes = player.sillyStats.prestigeTimes.add(1)
    },
    upgrades: {
        11: {
            fullDisplay: "<big><novamono>C(1-1)</novamono></big><br><br>Current \"Motivation\" boosts speed at a slightly exponential rate.<br><br>Cost: 5 Kilometers & 10% of current distance",
            canAfford() {return player.colin.distance.gte(5000)},
            pay() {player.colin.distance = player.colin.distance.sub(5000).div(1.1)},
            effect() {
                let powBase = new Decimal(0.01)
                if (hasUpgrade("colin", 14)) powBase = powBase.times(1.055)
                if (hasUpgrade("colin", 22)) powBase = powBase.times(1.085)
                if (hasUpgrade("colin", 33)) powBase = powBase.times(1.15)
                let base = player.colin.points.pow(new Decimal(1).add(powBase)).add(1)
                if (hasUpgrade("colin", 23)) base = base.times(2)
                return base
            }
        },

        12: {
            fullDisplay: "<big><novamono>C(1-2)</novamono></big><br><br>Current Latex Globs boosts speed at a logarithmic rate.<br><br><br>Cost: 25 Kilometers & 20% of current distance",
            canAfford() {return player.colin.distance.gte(25000)},
            pay() {player.colin.distance = player.colin.distance.sub(25000).div(1.2)},
            effect() {
                let logBase = new Decimal("e1000")
                if (hasUpgrade("colin", 14)) logBase = logBase.pow(0.945)
                if (hasMilestone("colin", 21)) logBase = logBase.pow(0.9)
                if (hasUpgrade("colin", 33)) logBase = logBase.pow(0.85)
                let base = player.sorbet.points.add(1).log(logBase).add(1)
                if (hasUpgrade("colin", 23)) base = base.times(2)
                if (hasUpgrade("colin", 31)) base = base.times(2)
                if (hasUpgrade("colin", 32)) base = base.times(2)
                return base
            },
            unlocked() {return hasUpgrade("colin", 11)}
        },

        13: {
            fullDisplay: "<big><novamono>C(1-3)</novamono></big><br><br>The first distance milestone scales 75% faster.<br><br><br>Cost: 500 Kilometers & 35% of current distance",
            canAfford() {return player.colin.distance.gte(500000)},
            pay() {player.colin.distance = player.colin.distance.sub(500000).times(0.65)},
            unlocked() {return hasUpgrade("colin", 12)}
        },

        14: {
            fullDisplay: "<big><novamono>C(1-4)</novamono></big><br><br>C(1-1) and C(1-2) scales 5.5% faster and multiply speed by 3.<br><br><br>Cost: 12 Megameters & 60% of current distance",
            canAfford() {return player.colin.distance.gte("12e6")},
            pay() {player.colin.distance = player.colin.distance.sub(12000000).times(0.4)},
            unlocked() {return hasUpgrade("colin", 13)}
        },

        21: {
            fullDisplay: "<big><novamono>C(2-1)</novamono></big><br><br>'6 \"Motivation\"' Milestone scales 3 times faster and multiply speed by 2.<br><br>Cost: 25 Megameters & 75% of current distance",
            canAfford() {return player.colin.distance.gte("25e6")},
            pay() {player.colin.distance = player.colin.distance.sub(25000000).times(0.25)},
            unlocked() {return hasUpgrade("colin", 14)}
        },

        22: {
            fullDisplay: "<big><novamono>C(2-2)</novamono></big><br><br>Motivation now boosts point gain and C(1-1) scales faster.<br><br><br>Cost: 100 Megameters & 99% of current distance",
            canAfford() {return player.colin.distance.gte("100e6")},
            pay() {player.colin.distance = player.colin.distance.sub(100000000).times(0.01)},
            unlocked() {return hasUpgrade("colin", 21)},
            effect() {
                let powBase = new Decimal(1765)
                if (hasUpgrade("colin", 23)) powBase = powBase.times(1.33)
                if (hasUpgrade("colin", 31)) powBase = powBase.times(1.22)
                let mulBase = new Decimal(333)
                if (hasUpgrade("colin", 23)) mulBase = mulBase.times(1.33)
                if (hasUpgrade("colin", 31)) mulBase = mulBase.times(1.22)
                let base = powBase.pow(player.colin.points.times(mulBase))
                if (hasMilestone("colin", 22)) base = base.pow(3)

                if (base.gte("e5000000")) base = new Decimal("e5000000").times(base.sub("e5000000").add(1).tetrate(1.008).log(1.01).add(1))
                return base
            },
            tooltip: "Slows down significantly after e5,000,000 Multiplier"
        },

        23: {
            fullDisplay: "<big><novamono>C(2-3)</novamono></big><br><br>C(2-2) scales much faster and C(1-1) and C(1-2)'s effects are doubled.<br><br>Cost: 225 Megameters & x<sup>0.8</sup> of current distance",
            canAfford() {return player.colin.distance.gte(225000000)},
            pay() {player.colin.distance = player.colin.distance.sub(225000000).pow(0.8)},
            unlocked() {return hasUpgrade("colin", 22)}
        },

        24: {
            fullDisplay: "<big><novamono>C(2-4)</novamono></big><br><br>You can now buy max \"Motivation\" and unlock 3 more milestones. x4 Speed.<br><br>Cost: 1.5 Gigameters & x<sup>0.7</sup> of current distance",
            canAfford() {return player.colin.distance.gte("1.5e9")},
            pay() {player.colin.distance = player.colin.distance.sub("1.5e9").pow(0.7)},
            unlocked() {return hasUpgrade("colin", 23)}
        },

        31: {
            fullDisplay: "<big><novamono>C(3-1)</novamono></big><br><br>C(2-2) scales even faster and C(1-2)'s effect is doubled.<br><br><br>Cost: 4.34 AU + x<sup>0.6</sup> of current distance",
            canAfford() {return player.colin.distance.gte("6.5e11")},
            pay() {player.colin.distance = player.colin.distance.sub("6.5e11").pow(0.6)},
            unlocked() {return hasUpgrade("colin", 24)}
        },

        32: {
            fullDisplay: "<big><novamono>C(3-2)</novamono></big><br><br>'6 \"Motivation\"' Milestone scales 25 times faster and C(1-2) is twice as strong.<br><br>Cost: 26.74 AU + x<sup>0.5</sup> of current distance",
            canAfford() {return player.colin.distance.gte("4e12")},
            pay() {player.colin.distance = player.colin.distance.sub("4e12").pow(0.5)},
            unlocked() {return hasUpgrade("colin", 31)}
        },

        33: {
            fullDisplay: "<big><novamono>C(3-3)</novamono></big><br><br>C(1-1) and C(1-2) scales 15% faster and triple speed.<br><br><br>Cost: 66.85 AU + x<sup>0.4</sup> of current distance",
            canAfford() {return player.colin.distance.gte("e13")},
            pay() {player.colin.distance = player.colin.distance.sub("e13").pow(0.4)},
            unlocked() {return hasUpgrade("colin", 32) && player.universe.points.gte(93)}
        },

        34: {
            fullDisplay: "<big><novamono>C(3-4)</novamono></big><br><br>Time since the last universal destruction boosts speed.<br><br><br>Cost: 334.23 AU + x<sup>0.3</sup> of current distance",
            canAfford() {return player.colin.distance.gte("5e13")},
            pay() {player.colin.distance = player.colin.distance.sub("5e13").pow(0.3)},
            unlocked() {return hasUpgrade("colin", 33)},
            effect() {
                let time = player.universe.resetTime
                let powBase = new Decimal(1.65)
                let logBase = new Decimal(1.08)
                let base = new Decimal(time).pow(powBase).add(1).log(logBase).add(1)
                return base
            }
        },

        41: {
            fullDisplay: "<big><nocamono>C(4-1)</novamono></big><br><br>Unlock the 3rd row of Colin-infused Sorbet Upgrades. x5 speed.<br><br>Cost: 1,377 AU + x<sup>0.2</sup> of current distance",
            canAfford() {return player.colin.distance.gte("2e14")},
            pay() {player.colin.distance = player.colin.distance.sub("2e14").pow(0.2)},
            unlocked() {return hasUpgrade("colin", 34)}
        }
    },
    canBuyMax() {return hasUpgrade("colin", 24)}
})