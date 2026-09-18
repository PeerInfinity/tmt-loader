addLayer("sorbet", {
    startData() {return {
        unlocked() {return player.universe.points.gte(45)},

        points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),

        resetTime: 0,

        effectText: ``,

        colors: {
            globLimit() {
                let base = new Decimal(15000000)
                base = base.add(player.sorbet.colors.inkEffect())
                if (player.universe.points.gte(80) && player.sorbet.colors.magma.gt(0)) base = base.div(2)
                if (hasMilestone("colin", 12)) base = base.times(3)
                return base
            },
            pure: new Decimal(0),
            pureProd() {
                let base = player.sorbet.points.add(1).log(10).add(1)
                if (hasUpgrade("sorbet", 62)) base = base.div(player.sorbet.colors.darkEffect("neg"))
                if (hasMilestone("universe", 30)) base = base.times(0.85)
                if (hasUpgrade("sorbet", 72)) base = base.times(player.sorbet.colors.sharkEffect())
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (hasMilestone("colin", 11)) base = base.times(5)
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasMilestone("universe", 29) && hasUpgrade("sorbet", 61) && player.sorbet.colors.pure.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            pureEffect() {
                let powBaseA = new Decimal(0.49)
                let powBaseB = new Decimal(1.29)
                let base = new Decimal(10).pow(player.sorbet.colors.pure.pow(powBaseA)).pow(powBaseB)
                if (hasUpgrade("sorbet", 81)) base = base.pow(player.sorbet.colors.mimicEffect())
                if (base.gte("e1375000")) base = new Decimal("e1375000").add(base.div("e1375000").tetrate(0.005))
                return base
            },

            dark: new Decimal(0),
            darkProd() {
                let base = player.sorbet.points.add(1).log(500000).add(1)
                if (hasMilestone("universe", 30)) base = base.times(0.85)
                if (hasUpgrade("sorbet", 72)) base = base.times(player.sorbet.colors.sharkEffect())
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (hasMilestone("colin", 11)) base = base.times(3)
                
                if (hasMilestone("universe", 29) && hasUpgrade("sorbet", 62) && player.sorbet.colors.dark.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            darkEffect(id) {
                if (id == "pos") {
                    let powBaseA = new Decimal(0.44)
                    let powBaseB = new Decimal(1.19)
                    let base = new Decimal(10).pow(player.sorbet.colors.dark.pow(powBaseA)).pow(powBaseB)
                    if (hasUpgrade("sorbet", 81)) base = base.pow(player.sorbet.colors.mimicEffect())
                    if (base.gte("e1500000")) base = new Decimal("e1500000").add(base.div("e1500000").tetrate(0.009))
                    return base
                } else {
                    if (id == "neg") {
                        let logBase = new Decimal(175)
                        if (hasMilestone("universe", 37)) logBase = logBase.div(2.5)
                        if (inChallenge("universe", 11)) logBase = logBase.div(3)
                        let powBase = new Decimal(0.7)
                        let base = player.sorbet.colors.dark.add(1).log(logBase).add(1).pow(powBase)
                        return base
                    }
                }
            },

            greenCrystal: new Decimal(0),
            greenProd() {
                let base = player.sorbet.points.add(1).log(15).add(1).log(1.5).add(1)
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasMilestone("universe", 30) && hasUpgrade("sorbet", 63) && player.sorbet.colors.greenCrystal.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            greenEffect() {
                let powBaseA = new Decimal(0.11)
                if (hasUpgrade("sorbet", 103)) powBaseA = powBaseA.add(0.03)
                let powBaseB = new Decimal(1.08)
                if (hasUpgrade("sorbet", 103)) powBaseB = powBaseB.add(0.03)
                let base = new Decimal(2).pow(player.sorbet.colors.greenCrystal.pow(powBaseA)).pow(powBaseB)
                if (base.gte(5000)) base = new Decimal(5000).add(base.div(10000).pow(0.03))
                return base
            },

            redCrystal: new Decimal(0),
            redProd() {
                let base = player.sorbet.points.add(1).log(2).add(1).log(2).add(1).pow(2)
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (hasMilestone("colin", 13)) base = base.times(1.33)
                if (inChallenge("universe", 11)) base = base.pow(0.8)


                if (hasMilestone("universe", 30) && hasUpgrade("sorbet", 71) && player.sorbet.colors.redCrystal.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            redEffect() {
                let powBaseA = new Decimal(0.45)
                if (hasUpgrade("sorbet", 104)) powBaseA = powBaseA.add(0.02)
                let powBaseB = new Decimal(1.71)
                if (hasUpgrade("sorbet", 104)) powBaseB = powBaseB.add(0.15)
                let base = new Decimal(4.5).pow(player.sorbet.colors.redCrystal.pow(powBaseA)).pow(powBaseB).log(10).floor()
                if (base.gte(12000)) base = new Decimal(12000).add(base.sub(12000).pow(0.05))
                return base
            },

            shark: new Decimal(0),
            sharkProd() {
                let base = player.sorbet.points.add(1).log(1000).add(1)
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasMilestone("universe", 31) && hasUpgrade("sorbet", 72) && player.sorbet.colors.shark.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            sharkEffect() {
                let powBaseA = new Decimal(0.25)
                let powBaseB = new Decimal(1.19)
                let base = new Decimal(6).pow(player.sorbet.colors.shark.pow(powBaseA)).pow(powBaseB).log(10).add(1)
                if (hasUpgrade("sorbet", 111)) base = base.times(3)
                if (base.gte(1500)) base = new Decimal(1500).add(base.div(1500).pow(0.03))
                return base
            },

            ink: new Decimal(0),
            inkProd() {
                let base = player.sorbet.points.add(1).log(10).add(1).pow(0.8).div(player.sorbet.colors.ink.add(1).log(10000).add(1))
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (hasUpgrade("sorbet", 112)) base = base.pow(0.7)
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasMilestone("universe", 31) && hasUpgrade("sorbet", 73) && player.sorbet.colors.ink.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            inkEffect() {
                let base = player.sorbet.colors.ink.pow(1.05).times(player.sorbet.colors.ink.add(1).log(9).add(2))
                if (hasUpgrade("sorbet", 91)) base = base.times(player.sorbet.colors.magmaEffect())
                if (hasMilestone("colin", 12)) base = base.times(1.5)
                return base
            },

            mimic: new Decimal(0),
            mimicProd() {
                let base = player.sorbet.points.add(1).log(100).log(2).add(1)
                if (hasMilestone("universe", 34)) base = base.times(player.sorbet.colors.plantEffect())
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasMilestone("universe", 32) && hasUpgrade("sorbet", 81) && player.sorbet.colors.mimic.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            mimicEffect() {
                let logBase = new Decimal(100)
                if (hasUpgrade("sorbet", 103)) logBase = logBase.sub(50)
                let powBase = new Decimal(1.3)
                if (hasUpgrade("sorbet", 103)) powBase = powBase.add(0.5)
                let base = new Decimal(1).add(player.sorbet.colors.mimic.pow(powBase).add(1).log(logBase).add(1).div(50))
                return base
            },

            true: new Decimal(0),
            trueProd() {
                let base = player.sorbet.points.add(1).log(10).add(1).pow(0.1)
                if (hasMilestone("colin", 13)) base = base.times(1.33)
                if (hasMilestone("universe", 37)) base = base.times(1.1)
                if (hasMilestone("colin", 17)) base = base.times(buyableEffect("LPrestige", 12).pow(0.2))
                if (hasUpgrade("sorbet", 112)) base = base.pow(1.2)
                if (inChallenge("universe", 11)) base = base.pow(0.8)
                if (hasChallenge("universe", 11)) base = base.times(1.2)
                if (hasMilestone("colin", 22)) base = base.times(2)
                if (hasMilestone("colin", 23)) base = base.times(1.5)

                if (hasMilestone("universe", 33) && hasUpgrade("sorbet", 82) && player.sorbet.colors.true.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            trueEffect() {
                let powBaseA = new Decimal(1.21)
                if (hasUpgrade("sorbet", 105)) powBaseA = powBaseA.add(0.03)
                if (hasChallenge("universe", 11)) powBaseA = powBaseA.add(0.02)
                let powBaseB = new Decimal(1.12)
                if (hasUpgrade("sorbet", 105)) powBaseB = powBaseB.add(0.02)
                if (hasChallenge("universe", 11)) powBaseB = powBaseB.add(0.01)
                let base = powBaseB.pow(player.sorbet.colors.true.pow(powBaseA).times(2)).pow(0.99)
                return base
            },

            plant: new Decimal(0),
            plantProd() {
                let base = player.sorbet.points.add(1).log(10).add(1).pow(0.3)
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasUpgrade("sorbet", 83) && hasMilestone("universe", 34) && player.sorbet.colors.plant.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            plantEffect() {
                let powBaseA = new Decimal(0.11)
                if (hasUpgrade("sorbet", 104)) powBaseA = powBaseA.add(0.02)
                let powBaseB = new Decimal(1.08)
                if (hasUpgrade("sorbet", 104)) powBaseB = powBaseB.add(0.07)
                let base = new Decimal(1.9).pow(player.sorbet.colors.plant.pow(powBaseA)).pow(powBaseB)
                if (hasMilestone("colin", 12)) base = base.times(1.5)
                if (base.gte(11500)) base = new Decimal(11500).add(base.div(11500).pow(0.04))
                return base
            },

            magma: new Decimal(0),
            magmaProd() {
                let base = player.sorbet.points.pow(1.05).add(1).log(1000).add(1)
                if (hasUpgrade("sorbet", 92)) base = base.times(player.sorbet.colors.alienEffect())
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (hasMilestone("universe", 36)) base = base.times(0.95)
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasUpgrade("sorbet", 91) && player.sorbet.colors.magma.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            magmaEffect() {
                let powBaseA = new Decimal(0.11)
                let powBaseB = new Decimal(1.08)
                let base = new Decimal(1.6).pow(player.sorbet.colors.magma.pow(powBaseA)).pow(powBaseB)
                if (hasMilestone("universe", 36)) base = new Decimal(1.57).pow(player.sorbet.colors.magma.pow(powBaseA)).pow(powBaseB)
                if (hasMilestone("colin", 12)) base = base.times(1.5)
                return base
            },

            alien: new Decimal(0),
            alienProd() {
                let base = player.sorbet.points.pow(0.9).add(1).log(100).add(1).pow(0.9)
                if (player.universe.points.gte(80)) base = base.times(buyableEffect("LPrestige", 12))
                if (inChallenge("universe", 11)) base = base.pow(0.8)

                if (hasUpgrade("sorbet", 92) && player.sorbet.colors.alien.lt(player.sorbet.colors.globLimit())) {
                    return base
                } else {
                    return new Decimal(0)
                }
            },
            alienEffect() {
                let powBaseA = new Decimal(0.14)
                if (hasUpgrade("sorbet", 104)) powBaseA = powBaseA.add(0.04)
                let powBaseB = new Decimal(1.04)
                if (hasUpgrade("sorbet", 104)) powBaseB = powBaseB.add(0.06)
                let base = new Decimal(1.2).pow(player.sorbet.colors.alien.pow(powBaseA)).pow(powBaseB)
                if (hasMilestone("colin", 12)) base = base.times(1.5)
                if (hasUpgrade("sorbet", 111)) base = base.times(3)
                if (base.gte(1500)) base = new Decimal(1500).add(base.div(1500).pow(0.07))
                return base
            }
        },

        colorText: ``,
        fidelity() {
            let base = player.sorbet.colors.pure.add(1).times(player.sorbet.colors.dark.add(1).times(player.sorbet.colors.redCrystal.add(1).times(player.sorbet.colors.greenCrystal.add(1).times(player.sorbet.colors.shark.add(1).times(player.sorbet.colors.ink.add(1).times(player.sorbet.colors.mimic.add(1).times(player.sorbet.colors.plant.add(1).times(player.sorbet.colors.magma.add(1).times(player.sorbet.colors.alien.add(1))))))))))
            base = base.times(base.add(1).log(10).add(1))

            if (player.colin.distance.gte("e9")) base = base.times(player.colin.distanceMilestones[2])

            return base
        }
    }},
    update() {
        let txt = ``
        if (hasUpgrade("sorbet", 11)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S(START REPLICATION)</text>: x${format(upgradeEffect("sorbet", 11))} Points <br><br>`
        if (hasUpgrade("sorbet", 31)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S(3-1)</text>: x${format(upgradeEffect("sorbet", 31))} Globs <br>`
        if (hasUpgrade("sorbet", 32)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S(3-2)</text>: x${format(upgradeEffect("sorbet", 32))} Money <br>`
        if (hasUpgrade("sorbet", 41)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S(4-1)</text>: x${format(upgradeEffect("sorbet", 41))} Globs <br>`
        if (hasUpgrade("sorbet", 45)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S(4-5)</text>: x${format(upgradeEffect("sorbet", 45))} S(3-2) Effect<br>`
        if (hasUpgrade("sorbet", 113)) txt += `Total effect from upgrade <text style="color: ${temp.sorbet.color}">S<sub>C</sub>(2-3)</text>: /${format(upgradeEffect("sorbet", 113))} Booster Cost<br>`
        
        player.sorbet.effectText = txt

        txt = ``

        if (hasMilestone("universe", 29) && player.sorbet.colors.pure.gt(0)) txt += `Total Effect from <text style="text-shadow: 0 0 10px white">Pure Globs</text>: x${format(player.sorbet.colors.pureEffect())} Points`
        if (player.sorbet.colors.pureEffect().gte("e1375000")) txt += `<nerfRed>*</nerfRed>`
        txt += "<br>"
        if (hasMilestone("universe", 29) && player.sorbet.colors.dark.gt(0)) txt += `Total Effect from <text style="color:black; text-shadow: 0 0  10px white">Dark Globs</text>: x${format(player.sorbet.colors.darkEffect("pos"))} Money, /${format(player.sorbet.colors.darkEffect("neg"))} <text style="text-shadow: 0 0 10px white">Pure Globs</text> gain`
        if (player.sorbet.colors.darkEffect("pos").gte("e1500000")) txt += `<nerfRed>*</nerfRed>`
        txt += "<br>"
        if (hasMilestone("universe", 30) && player.sorbet.colors.greenCrystal.gt(0)) txt += `Total Effect from <text style="color: #007600; text-shadow: 0 0 10px #DDDDDD40">Green Crystal Globs</text>: x${format(player.sorbet.colors.greenEffect())} Prestige Essence Gain`
        if (player.sorbet.colors.greenEffect().gte(5000)) txt += `<nerfRed>*</nerfRed>`,
        txt += "<br>"
        if (hasMilestone("universe", 30) && player.sorbet.colors.redCrystal.gt(0)) txt += `Total Effect from <text style="color: #760000; text-shadow: 0 0 10px #DDDDDD40">Red Crystal Globs</text>: +${formatWhole(player.sorbet.colors.redEffect())} Max Levels`
        if (player.sorbet.colors.redEffect().gte("12000")) txt += `<nerfRed>*</nerfRed>`
        txt += "<br>"
        if (hasMilestone("universe", 31) && player.sorbet.colors.shark.gt(0)) txt += `Total Effect from <text style="color: #766576; text-shadow: 0 0 10px #EEEEEE60">Sharkskin Globs</text>: x${format(player.sorbet.colors.sharkEffect())} <text style="text-shadow: 0 0 10px white">Pure</text> & <text style="color:black; text-shadow: 0 0 10px white">Dark</text> gain`
        if (player.sorbet.colors.sharkEffect().gte(1500)) txt += `<nerfRed>*</nerfRed>`
        txt += "<br>"
        if (hasMilestone("universe", 31) && player.sorbet.colors.ink.gt(0)) txt += `Total Effect from <text style="text-shadow: 0 0 10px #333">Inkfur Globs</text>: +${formatWhole(player.sorbet.colors.inkEffect())} Max Globs<br>`
        if (hasMilestone("universe", 32) && player.sorbet.colors.mimic.gt(0)) txt += `Total Effect from <text style="text-shadow: 0 0 10px #FFFFFF66">Mimic Globs</text>: x<sup>${format(player.sorbet.colors.mimicEffect())}</sup> <text style="text-shadow: 0 0 10px white">Pure</text> & <text style="color:black; text-shadow: 0 0 10px white">Dark</text> Effect<br>`
        if (hasMilestone("universe", 33) && player.sorbet.colors.true.gt(0)) txt += `Total Effect from <text style="text-shadow: 0 0 5px #870000">True Globs</text>: /${format(player.sorbet.colors.trueEffect())} Booster Cost<br>`
        if (hasMilestone("universe", 34) && player.sorbet.colors.plant.gt(0)) txt += `Total Effect from <text style="color: #88FF88; text-shadow: 0 0 10px #66FF66AA">Plant Globs</text>: x${format(player.sorbet.colors.plantEffect())} <text style="text-shadow: 0 0 10px #FFFFFF66">Mimic Globs</text> Gain`
        if (player.sorbet.colors.plantEffect().gte(11500)) txt += `<nerfRed>*</nerfRed>`
        txt += "<br>"
        if (hasMilestone("universe", 34) && player.sorbet.colors.magma.gt(0)) txt += `Total Effect from <text style="color: #CC9900; text-shadow: 0 0 10px #BB8800">Magma Globs</text>: x${format(player.sorbet.colors.magmaEffect())} <text style="text-shadow: 0 0 10px #333">Inkfur Globs</text> Effect<br>`
        if (hasMilestone("universe", 34) && player.sorbet.colors.alien.gt(0)) txt += `Total Effect from <text style="color: #3333AA; text-shadow: 0 0 10px #222277">Alien Globs</text>: x${format(player.sorbet.colors.alienEffect())} Others without <text style="text-shadow: 0 0 5px #870000">True</text> gain`
        if (player.sorbet.colors.alienEffect().gte(1500)) txt += `<nerfRed>*</nerfRed>`

        player.sorbet.colorText = txt
    },
    symbol() {return `<text style="color:dimgray">S<sub><small><small><small><small><small>${formatWhole(player.prestigeAmount[1])}</small></small></small></small</small></text>`},
    color: "#EEEEEE",
    layerShown() {return player.sorbet.unlocked()},
    requires: new Decimal("e8350"),
    resource() {
        if (player.universe.points.gte(75)) {
            return `Latex Globs`
        } else {
            return `[REDACTED] Globs`
        }
    },
    baseResource: "Money",
    baseAmount() {return player.money.points},
    type: "normal",
    exponent: 0.016,
    row: 2,
    tooltip: "Sorbet's Layer",
    microtabs: {
        index: {
            Upgrades: {
                content: ["blank", ["display-text", function() {return player.sorbet.effectText}], "blank", "upgrades"]
            },

            "GCA": {
                content: ["blank", ["display-text", "Glob Coloration Assignment"], "blank", ["microtabs", "assign"]],
                unlocked() {return hasMilestone("universe", 29)}
            },

            "Node Info": {
                content: ["blank", ["display-text", function() {return "Multiversal Branch Type: (Index -> Sorbet's Circle, 0, 0)<br>Transition Node"}], "blank", ["display-text", function() {return `Total Globs Multiplier: x<big>${formatSmall(temp.sorbet.gainMult)}</big>`}], "blank", ["display-text", function() {if (player.sorbet.points.gte("e10000")) return `<nerfRed style="color: white; text-shadow: 0 0 10px white">Future gain is raised to the power of 0.78 and then divided by 1.00e1000</nerfRed>`}]]
            }


        },

        assign: {
            Types: {
                content: ["blank", ["display-text", function() {return `Glob limit: <big>${format(player.sorbet.colors.globLimit())}</big>`}], "blank", ["display-text", function() {
                    txt = ``

                    if (hasMilestone("universe", 29)) txt += `<big><text style="text-shadow: 0 0 10px white">${format(player.sorbet.colors.pure)}</text></big> Pure Globs (${format(player.sorbet.colors.pureProd())}/sec)<br> <big><text style="color: black; text-shadow: 0 0 10px white">${format(player.sorbet.colors.dark)}</text></big> Dark Globs (${format(player.sorbet.colors.darkProd())}/sec)<br>`
                    if (hasMilestone("universe", 30)) txt += `<big><text style="color: #007600; text-shadow: 0 0 10px #DDDDDD40">${format(player.sorbet.colors.greenCrystal)}</text></big> Green Crystal Globs (${format(player.sorbet.colors.greenProd())}/sec)<br>`
                    if (hasMilestone("universe", 30)) txt += `<big><text style="color: #760000; text-shadow: 0 0 10px #DDDDDD40">${format(player.sorbet.colors.redCrystal)}</text></big> Red Crystal Globs (${format(player.sorbet.colors.redProd())}/sec)<br>`
                    if (hasMilestone("universe", 31)) txt += `<big><text style="color: #766576; text-shadow: 0 0 10px #EEEEEE60">${format(player.sorbet.colors.shark)}</text></big> Sharkskin Globs (${format(player.sorbet.colors.sharkProd())}/sec)<br>`
                    if (hasMilestone("universe", 31)) txt += `<big><text style="text-shadow: 0 0 15px #333">${format(player.sorbet.colors.ink)}</text></big> Inkfur Globs (${format(player.sorbet.colors.inkProd())}/sec)<br>`
                    if (hasMilestone("universe", 32)) txt += `<big><text style="text-shadow: 0 0 10px #FFFFFF66">${format(player.sorbet.colors.mimic)}</text></big> Mimic Globs (${format(player.sorbet.colors.mimicProd())}/sec)<br>`
                    if (hasMilestone("universe", 33)) txt += `<big><text style="text-shadow: 0 0 5px #870000">${format(player.sorbet.colors.true)}</text></big> True Globs (${format(player.sorbet.colors.trueProd())}/sec)<br>`
                    if (hasMilestone("universe", 34)) txt += `<big><text style="color: #88FF88; text-shadow: 0 0 10px #66FF66AA">${format(player.sorbet.colors.plant)}</text></big> Plant Globs (${format(player.sorbet.colors.plantProd())}/sec)<br>`
                    if (hasMilestone("universe", 34)) txt += `<big><text style="color: #CC9900; text-shadow: 0 0 10px #BB8800">${format(player.sorbet.colors.magma)}</text></big> Magma Globs (${format(player.sorbet.colors.magmaProd())}/sec)<br>`
                    if (hasMilestone("universe", 34)) txt += `<big><text style="color: #3333AA; text-shadow: 0 0 10px #222277">${format(player.sorbet.colors.alien)}</text></big> Alien Globs (${format(player.sorbet.colors.alienProd())}/sec)<br><br>`

                    if (hasMilestone("universe", 34)) txt += `${format(player.sorbet.fidelity())} <small>Fidelity</small>`

                    return txt
                }]]
            },

            Effects: {
                content: ["blank", ["display-text", function() {return player.sorbet.colorText}]]
            }
        }
    },
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}}
    },
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "blank",
        ["display-text", function() {if (temp.sorbet.passiveGeneration.gte(0)) {return (`You are gaining <big style="color: ${temp.sorbet.color}; text-shadow: 0 0 8px ${temp.sorbet.color}">${format(temp.sorbet.resetGain.times(temp.sorbet.passiveGeneration))}</big> Globs/sec (${formatWhole(temp.sorbet.passiveGeneration.times(100))}% potency)`)}}],
        "blank",
        ["microtabs", "index"]
    ],
    upgrades: {
        11: {
            title: "<novamono>S(START REPLICATION)</novamono>",
            description() {return `Every small upgrade bought in this layer increases point gain by <big>${format(this.effectBase())}</big>x, compounding. The base multiplier increases for every upgrade bought. This upgrade provides a static 2,000,000 multiplier to money and points.`},
            effectBase() {
                let base = new Decimal(88)
                let amt = function() {
                    let base = new Decimal(0)
                    if (hasUpgrade("sorbet", 21)) base = base.add(1)
                    if (hasUpgrade("sorbet", 22)) base = base.add(1)
                    if (hasUpgrade("sorbet", 23)) base = base.add(1)
                    if (hasUpgrade("sorbet", 24)) base = base.add(1)
                    if (hasUpgrade("sorbet", 25)) base = base.add(1)
                    if (hasUpgrade("sorbet", 31)) base = base.add(1)
                    if (hasUpgrade("sorbet", 32)) base = base.add(1)
                    if (hasUpgrade("sorbet", 33)) base = base.add(1)
                    if (hasUpgrade("sorbet", 34)) base = base.add(1)
                    if (hasUpgrade("sorbet", 35)) base = base.add(1)
                    if (hasUpgrade("sorbet", 41)) base = base.add(1)
                    if (hasUpgrade("sorbet", 42)) base = base.add(1)
                    if (hasUpgrade("sorbet", 43)) base = base.add(1)
                    if (hasUpgrade("sorbet", 44)) base = base.add(1)
                    if (hasUpgrade("sorbet", 45)) base = base.add(1)
                    if (hasUpgrade("sorbet", 51)) base = base.add(1)
                    if (hasUpgrade("sorbet", 52)) base = base.add(1)
                    if (hasUpgrade("sorbet", 53)) base = base.add(1)
                    if (hasUpgrade("sorbet", 54)) base = base.add(1)
                    if (hasUpgrade("sorbet", 55)) base = base.add(1)
                    if (hasUpgrade("sorbet", 101)) base = base.add(1)
                    if (hasUpgrade("sorbet", 102)) base = base.add(1)
                    if (hasUpgrade("sorbet", 103)) base = base.add(1)
                    if (hasUpgrade("sorbet", 104)) base = base.add(1)
                    if (hasUpgrade("sorbet", 105)) base = base.add(1)
                    if (hasUpgrade("sorbet", 111)) base = base.add(1)
                    if (hasUpgrade("sorbet", 112)) base = base.add(1)
                    if (hasUpgrade("sorbet", 113)) base = base.add(1)
                    if (hasUpgrade("sorbet", 114)) base = base.add(1)
                    if (hasUpgrade("sorbet", 121)) base = base.add(1)

                    if (hasUpgrade("sorbet", 44)) base = base.times(2)
                    if (hasUpgrade("sorbet", 55)) base = base.times(2)
                    
                    return base
                }
                let amtScale = new Decimal(1.3)
                if (hasUpgrade("sorbet", 33)) amtScale = amtScale.times(1.75)
                if (hasUpgrade("sorbet", 35)) amtScale = amtScale.times(1.55)
                if (hasUpgrade("sorbet", 43)) amtScale = amtScale.times(1.99)

                let calcBase = base.add(amt().times(amtScale).pow(1.2))

                if (hasUpgrade("sorbet", 54)) calcBase = calcBase.pow(3)

                return calcBase
            },
            effect() {
                let amt = function() {
                    let base = new Decimal(0)
                    if (hasUpgrade("sorbet", 21)) base = base.add(1)
                    if (hasUpgrade("sorbet", 22)) base = base.add(1)
                    if (hasUpgrade("sorbet", 23)) base = base.add(1)
                    if (hasUpgrade("sorbet", 24)) base = base.add(1)
                    if (hasUpgrade("sorbet", 25)) base = base.add(1)
                    if (hasUpgrade("sorbet", 31)) base = base.add(1)
                    if (hasUpgrade("sorbet", 32)) base = base.add(1)
                    if (hasUpgrade("sorbet", 33)) base = base.add(1)
                    if (hasUpgrade("sorbet", 34)) base = base.add(1)
                    if (hasUpgrade("sorbet", 35)) base = base.add(1)
                    if (hasUpgrade("sorbet", 41)) base = base.add(1)
                    if (hasUpgrade("sorbet", 42)) base = base.add(1)
                    if (hasUpgrade("sorbet", 43)) base = base.add(1)
                    if (hasUpgrade("sorbet", 44)) base = base.add(1)
                    if (hasUpgrade("sorbet", 45)) base = base.add(1)
                    if (hasUpgrade("sorbet", 51)) base = base.add(1)
                    if (hasUpgrade("sorbet", 52)) base = base.add(1)
                    if (hasUpgrade("sorbet", 53)) base = base.add(1)
                    if (hasUpgrade("sorbet", 54)) base = base.add(1)
                    if (hasUpgrade("sorbet", 55)) base = base.add(1)
                    if (hasUpgrade("sorbet", 101)) base = base.add(1)
                    if (hasUpgrade("sorbet", 102)) base = base.add(1)
                    if (hasUpgrade("sorbet", 103)) base = base.add(1)
                    if (hasUpgrade("sorbet", 104)) base = base.add(1)
                    if (hasUpgrade("sorbet", 105)) base = base.add(1)
                    if (hasUpgrade("sorbet", 111)) base = base.add(1)
                    if (hasUpgrade("sorbet", 112)) base = base.add(1)
                    if (hasUpgrade("sorbet", 113)) base = base.add(1)
                    if (hasUpgrade("sorbet", 114)) base = base.add(1)
                    if (hasUpgrade("sorbet", 121)) base = base.add(1)

                    if (hasUpgrade("sorbet", 44)) base = base.times(2)
                    if (hasUpgrade("sorbet", 55)) base = base.times(2)

                    return base
                }

                let base = this.effectBase().pow(amt())
                if (hasUpgrade("sorbet", 35)) base = base.pow(3)
                if (hasMilestone("colin", 14)) base = base.pow(4.5)
                if (hasMilestone("colin", 18)) base = base.pow(3)
                return base
            },
            cost: new Decimal(5),
            style() {return {"width":"250px", "border-radius":"25px", "margin-bottom":"50px"}}
        },

        21: {
            title: "<novamono>S(2-1)",
            description: "The third money buyable is 10% stronger.<br>",
            cost: new Decimal(100),
            unlocked() {return hasUpgrade("sorbet", 11)}
        },

        22: {
            title: "<novamono>S(2-2)</novamono>",
            description: "Heavy booster's softcap raise is 5% stronger.<br>",
            cost: new Decimal(350),
            unlocked() {return hasUpgrade("sorbet", 21)}
        },

        23: {
            title: "<novamono>S(2-3)</novamono>",
            description: "Prestiging the money layer is 12% more powerful.<br>",
            cost: new Decimal("5e28"),
            unlocked() {return hasUpgrade("sorbet", 22)}
        },

        24: {
            title: "<novamono>S(2-4)</novamono>",
            description: "The 3rd money buyable has 55 more max levels.<br>",
            cost: new Decimal("e29"),
            unlocked() {return hasUpgrade("sorbet", 23)}
        },

        25: {
            title: "<novamono>S(2-5)</novamono>",
            description: "Golden booster's softcap raise is 10% stronger.<br>",
            cost: new Decimal("3e30"),
            unlocked() {return hasUpgrade("sorbet", 24)}
        },

        31: {
            title: "<novamono>S(3-1)</novamono>",
            description: "S(START REPLICATION) also affects glob gain at a reduced rate.",
            cost: new Decimal("5e41"),
            unlocked() {return hasUpgrade("sorbet", 25)},
            effect() {
                let logBase = new Decimal(2)
                let powBase = new Decimal(1.5)
                if (hasUpgrade("sorbet", 34)) powBase = powBase.times(1.5)
                if (hasUpgrade("sorbet", 42)) powBase = powBase.times(1.1)
                let base = upgradeEffect("sorbet", 11).log(logBase).add(1).pow(powBase)
                if (hasMilestone("colin", 18)) base = base.pow(3)
                return base
            }
        },

        32: {
            title: "<novamono>S(3-2)</novamono>",
            description: "Total globs boost money gain at an increased rate.<br>",
            cost: new Decimal("5e44"),
            unlocked() {return hasUpgrade("sorbet", 31)},
            effect() {
                let powBase = new Decimal(1.2)
                if (hasMilestone("colin", 14)) powBase = powBase.times(1.15)
                let base = player.sorbet.points.add(1).pow(powBase)
                if (base.gte("e77")) base = new Decimal("1e77").times(base.div("1e77").pow(0.01))
                if (hasUpgrade("sorbet", 45)) base = base.times(upgradeEffect("sorbet", 45))
                return base
            },
            tooltip: "Scales significantly slower past xe77 money...",
            trueEffect() {
                let powBase = new Decimal(1.2)
                if (hasMilestone("colin", 14)) powBase = powBase.times(1.25)
                let base = player.sorbet.points.add(1).pow(powBase)
                if (hasUpgrade("sorbet", 45)) base = base.times(upgradeEffect("sorbet", 45))
                return base
            }
        },

        33: {
            title: "<novamono>S(3-3)</novamono>",
            description: "S(START REPLICATION)'s multiplier scales 75% faster.",
            cost: new Decimal("e83"),
            unlocked() {return hasUpgrade("sorbet", 32)},
        },

        34: {
            title: "<novamono>S(3-4)</novamono>",
            description: "S(3-1)'s exponent is 50% stronger.<br><br>",
            cost: new Decimal("e84"),
            unlocked() {return hasUpgrade("sorbet", 33)}
        },

        35: {
            title: "<novamono>S(3-5)</novamono>",
            description: "S(START REPLICATION)'s effect is cubed and scales faster.",
            cost: new Decimal("e85"),
            unlocked() {return hasUpgrade("sorbet", 34)}

        },

        41: {
            title: "<novamono>S(4-1)</novamono>",
            description: "Total globs boost itself at a logarithmic rate.<br>",
            cost: new Decimal("e98"),
            unlocked() {return hasUpgrade("sorbet", 35) && player.universe.points.gte(51)},
            effect() {
                let logBase = new Decimal(10)
                let powBase = new Decimal(1.25)
                if (hasUpgrade("sorbet", 42)) powBase = powBase.times(1.1)
                let base = player.sorbet.total.add(1).log(logBase).add(1).pow(powBase)
                if (hasMilestone("colin", 18)) base = base.pow(3)
                return base
            }
        },

        42: {
            title: "<novamono>S(4-2)</novamono>",
            description: "S(3-1) and S(4-1) scales 10% faster.<br><br>",
            cost: new Decimal("3e101"),
            unlocked() {return hasUpgrade("sorbet", 41)}
        },

        43: {
            title: "<novamono>S(4-3)</novamono>",
            description: "S(START REPLICATION)'s multiplier scales 99% faster.",
            cost: new Decimal("e111"),
            unlocked() {return hasUpgrade("sorbet", 42)}
        },

        44: {
            title: "<novamono>S(4-4)</novamono>",
            description: "Upgrades are counted as two on S(START REPLICATION).",
            cost: new Decimal("e112"),
            unlocked() {return hasUpgrade("sorbet", 43)}
        },

        45: {
            title: "<novamono>S(4-5)</novamono>",
            description: "S(3-2) is boosted based on its uncapped self.<br>",
            cost: new Decimal("e138"),
            unlocked() {return hasUpgrade("sorbet", 44)},
            effect() {
                let logBase = new Decimal(10)
                let powBase = new Decimal(5)
                let base = temp.sorbet.upgrades[32].trueEffect.add(1).log(logBase).add(1).pow(powBase)
                return base
            }
        },

        51: {
            title: "<novamono>S(5-1)</novamono>",
            description: "The third money buyable has 75 more max levels.<br>",
            cost: new Decimal("e148"),
            unlocked() {return hasUpgrade("sorbet", 45) && player.universe.points.gte(53)}
        },

        52: {
            title: "<novamono>S(5-2)</novamono>",
            description: "Automate booster gain and they dont reset anything.<br>",
            cost: new Decimal("e162"),
            unlocked() {return hasUpgrade("sorbet", 51)}
        },

        53: {
            title: "<novamono>S(5-3)</novamono>",
            description: "Heavy and Golden Booster's softcap raise is 17.5% stronger.",
            cost: new Decimal("e163"),
            unlocked() {return hasUpgrade("sorbet", 52)}
        },

        54: {
            title: "<novamono>S(5-4)</novamono>",
            description: "S(START REPLICATION)'s base multiplier is cubed.",
            cost: new Decimal("e224"),
            unlocked() {return hasUpgrade("sorbet", 53)}
        },
        
        55: {
            title: "<novamono>S(5-5)</novamono>",
            description: "S(START REPLICATION) counts each upgrade as 4.",
            cost: new Decimal("e272"),
            unlocked() {return hasUpgrade("sorbet", 54)}
        },

        61: {
            title: "<novamono>S(C1)</novamono>",
            description: "Start producing Pure Globs, which provide a bonus to point generation.<br><br>",
            cost: new Decimal("e400"),
            unlocked() {return hasMilestone("universe", 29)},
            style() {return {"margin-top":"20px", "width":"175px", "border-radius":"25px"}}
        },

        62: {
            title: "<novamono>S(C2)</novamono>",
            description: "Start producing Dark Globs that provide a bonus to money but reduce Pure Glob gain.<br>",
            cost: new Decimal("e500"),
            unlocked() {return hasUpgrade("sorbet", 61)},
            style() {return {"margin-top":"20px", "width":"175px", "border-radius":"25px"}}
        },

        63: {
            title: "<novamono>S(C3)</novamono>",
            description: "Start producing Crystal Green Globs that boost Prestige Essence gain.<br><br>",
            cost: new Decimal("e1000"),
            unlocked() {return hasUpgrade("sorbet", 62) && hasMilestone("universe", 30)},
            style() {return {"margin-top":"20px", "width":"175px", "border-radius":"25px"}}
        },

        71: {
            title: "<novamono>S(C4)</novamono>",
            description: "Start producing Crystal Red Globs that increase the max levels of all Money buyables.<br>",
            cost: new Decimal("e1050"),
            unlocked() {return hasUpgrade("sorbet", 63)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        72: {
            title: "<novamono>S(C5)</novamono>",
            description: "Start producing Sharkskin Globs that increases the production of Pure and Dark globs.<br>",
            cost: new Decimal("e1200"),
            unlocked() {return hasUpgrade("sorbet", 71) && player.universe.points.gte(70)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        73: {
            title: "<novamono>S(C6)</novamono>",
            description: "Start producing Inkfur GLobs which increase the limit on how much of a color you can have.<br>",
            cost: new Decimal("e1500"),
            unlocked() {return hasUpgrade("sorbet", 72)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        81: {
            title: "<novamono>S(C7)</novamono>",
            description: "Start producing Mimic Globs that improves the effects of Pure and Dark Globs.<br><br>",
            cost: new Decimal("e1700"),
            unlocked() {return hasUpgrade("sorbet", 73) && player.universe.points.gte(73)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        82: {
            title: "<novamono>S(C8)</novamono>",
            description: "Start producing True Globs that divide the cost of boosters.<br><br>",
            cost: new Decimal("e1900"),
            unlocked() {return hasUpgrade("sorbet", 81) && hasMilestone("universe", 33)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        83: {
            title: "<novamono>S(C9)</novamono>",
            description: "Start producing Plant Globs that boost the production of Mimic Globs.<br><br>",
            cost: new Decimal("e2300"),
            unlocked() {return hasUpgrade("sorbet", 82) && hasMilestone("universe", 34)},
            style() {return {"width":"175px", "border-radius":"25px"}}
        },

        91: {
            title: "<novamono>S(C10)</novamono>",
            description: "Start producing Magma Globs that boost the effect of Inkfur Globs.<br><br>",
            cost: new Decimal("e2500"),
            unlocked() {return hasUpgrade("sorbet", 83)},
            style() {return temp.sorbet.upgrades[83].style}
        },

        92: {
            title: "<novamono>S(C11)</novamono>",
            description: "Start producing Alien Globs that boost the production of all other colored Globs except True.<br>",
            cost: new Decimal("e2700"),
            unlocked() {return hasUpgrade("sorbet", 91)},
            style() {return temp.sorbet.upgrades[83].style}
        },

        101: {
            title: "<novamono>S<sub>C</sub>(1-1)</novamono>",
            description: "Golden Booster's base scaling effect is 5% stronger.",
            cost: new Decimal("e5500"),
            unlocked() {return hasMilestone("colin", 15) && hasUpgrade("sorbet", 55)},
            style() {return {"margin-top":"20px"}}
        },

        102: {
            title: "<novamono>S<sub>C</sub>(1-2)</novamono>",
            description: "M(1-3)'s effect is cubed and scales faster.<br>",
            cost: new Decimal("e6000"),
            unlocked() {return hasUpgrade("sorbet", 101)},
            style() {return {"margin-top":"20px"}}
        },

        103: {
            title: "<novamono>S<sub>C</sub>(1-3)</novamono>",
            description: "Mimic and Green Crystal Glob's effect scales faster.",
            cost: new Decimal("e6500"),
            unlocked() {return hasUpgrade("sorbet", 102)},
            style() {return {"margin-top":"20px"}}
        },

        104: {
            title: "<novamono>S<sub>C</sub>(1-4)</novamono>",
            description: "Plant, Alien, and Red Crystal Glob's effect scales faster.",
            cost: new Decimal("e7000"),
            unlocked() {return hasUpgrade("sorbet", 103)},
            style() {return {"margin-top":"20px"}}
        },

        105: {
            title: "<novamono>S<sub>C</sub>(1-5)</novamono>",
            description: "True Glob's effect scales slightly faster.<br>",
            cost: new Decimal("e8000"),
            unlocked() {return hasUpgrade("sorbet", 104)},
            style() {return {"margin-top":"20px"}}
        },

        111: {
            title: "<novamono>S<sub>C</sub>(2-1)</novamono>",
            description: "Sharkskin and Alien Glob's effect is tripled.<br>",
            cost: new Decimal("e11000"),
            unlocked() {return hasMilestone("colin", 20) && hasUpgrade("sorbet", 105)}
        },

        112: {
            title: "<novamono>S<sub>C</sub>(2-2)</novamono>",
            description: "^1.2 True Globs gain but ^0.7 Inkfur Globs gain aswell.",
            cost: new Decimal("e20000"),
            unlocked() {return hasUpgrade("sorbet", 111)}
        },

        113: {
            title: "<novamono>S<sub>C</sub>(2-3)</novamono>",
            description: "Current Latex Globs divide booster costs.<br>",
            cost: new Decimal("e32000"),
            unlocked() {return hasUpgrade("sorbet", 112)},
            effect() {
                let logBase = new Decimal(12)
                if (hasUpgrade("sorbet", 114)) logBase = logBase.sub(1)
                let base = new Decimal(10).pow(player.sorbet.points.add(1).log(logBase).add(1))
                if (hasUpgrade("sorbet", 114)) base = base.pow(3)
                return base
            }
        },

        114: {
            title: "<novamono>S<sub>C</sub>(2-4)</novamono>",
            description: "The previous upgrade's effect scales faster after its cubed.",
            cost: new Decimal("e40000"),
            unlocked() {return hasUpgrade("sorbet", 113)}
        },

        121: {
            title: "<novamono>S<sub>C</sub>(3-1)</novamono>",
            description: "Unlock another row of Booster upgrades.<br>",
            cost: new Decimal("e80000"),
            unlocked() {return hasUpgrade("colin", 41) && hasUpgrade("sorbet", 114)}
        }
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("sorbet", 31)) mult = mult.times(upgradeEffect("sorbet", 31))
        if (hasUpgrade("sorbet", 41)) mult = mult.times(upgradeEffect("sorbet", 41))
        if (player.universe.points.gte(70)) mult = mult.times(player.booster.effects[2])
        if (hasMilestone("colin", 11)) mult = mult.times(100000)
        if (hasMilestone("colin", 14)) mult = mult.times(1000000)
        if (hasMilestone("colin", 15)) mult = mult.times("e10")
        if (hasMilestone("colin", 16)) mult = mult.times(temp.colin.milestones[16].effect)
        if (hasMilestone("colin", 17)) mult = mult.times("e25")
        if (hasMilestone("colin", 18)) mult = mult.times("e30")
        if (hasMilestone("colin", 19)) mult = mult.times("e125")
        if (player.sorbet.points.gte("e10000")) mult = mult.pow(0.78).div("e1000")
        if (hasMilestone("colin", 20)) mult = mult.pow(0.9)
        if (hasMilestone("universe", 38)) mult = mult.times(player.colin.distanceMilestones[0])
        if (hasMilestone("colin", 21)) mult = mult.times("e200")
        if (hasMilestone("colin", 22)) mult = mult.times("e350")
        if (hasMilestone("colin", 23)) mult = mult.times("e400")
        if (player.universe.points.gte(93)) mult = mult.pow(0.825)
            
        if (mult.eq(0)) return new Decimal(1)
        else return mult
    },
    onPrestige() {
        player.sillyStats.prestigeTimes = player.sillyStats.prestigeTimes.add(1)
    },
    hotkeys: [
        {
            key: "s",
            description: "S: Assimilate Money into Globs",
            onPress() {if (canReset(this.layer)) doReset(this.layer)}}
    ],
    passiveGeneration() {
        let base = new Decimal(0)
        if (hasMilestone("LPrestige", 21)) base = base.add(0.01)
        if (hasMilestone("LPrestige", 22)) base = base.times(5)
        if (hasMilestone("LPrestige", 23)) base = base.times(12)
        if (hasMilestone("LPrestige", 24)) base = base.times(19)
        return base
    },
    branches: [["colin", 3]],
    autoUpgrade() {return hasMilestone("LPrestige", 23)}
})