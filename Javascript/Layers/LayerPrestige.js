addLayer("LPrestige", {
    startData() {return {
        unlocked() {return hasMilestone("universe", 18)},
        points: new Decimal(0),
        selfNerf() {
            let logBase = new Decimal("e3000")
            if (player.LPrestige.points.gte(1000000)) logBase = logBase.pow(10)
            let powBase = player.LPrestige.points.add(1)
            if (hasMilestone("universe", 19)) powBase = powBase.pow(1.2)
            let base = logBase.pow(powBase)
            return base
        },
        prod() {
            let logBase = player.LPrestige.selfNerf()
            let base = player.points.add(1).log(logBase)
            if (hasMilestone("LPrestige", 11)) base = base.times(2)
            if (hasMilestone("LPrestige", 12)) base = base.times(2)
            if (hasMilestone("LPrestige", 13)) base = base.times(2)
            if (hasMilestone("LPrestige", 14)) base = base.times(3)
            if (hasMilestone("LPrestige", 15)) base = base.times(2)
            if (hasMilestone("LPrestige", 16)) base = base.times(2)
            if (hasMilestone("LPrestige", 21)) base = base.times(2)
            if (hasMilestone("LPrestige", 22)) base = base.times(2)
            if (hasMilestone("LPrestige", 23)) base = base.times(2)
            if (hasMilestone("LPrestige", 24)) base = base.times(2)
            if (player.universe.points.gte(35) && player.points.gte("e5500")) base = base.times(22.5)
            if (hasUpgrade("universe", 41)) base = base.times(5)
            if (hasMilestone("universe", 30)) base = base.times(player.sorbet.colors.greenEffect())
            if (hasMilestone("universe", 34)) base = base.div(25)
            if (hasMilestone("colin", 15)) base = base.times(2.5)
            if (player.universe.points.gte(93)) base = base.div(20)

            base = base.div(new Decimal(1.001).pow(player.LPrestige.prestigeTimes()))
            return base
        },
        prestigeTimes() {
            let amt = new Decimal(0)
            for (let i = 0; i < player.prestigeAmount.length; i++) {
                amt = amt.add(player.prestigeAmount[i])
            }
            return amt
        },
    }},
    symbol: "<small>LP</small>",
    color: "#EE82ED",
    layerShown() {return player.LPrestige.unlocked()},
    type: "none",
    resource: "Prestige Essence",
    row: "side",
    tooltip: "Layer Prestiges",
    microtabs: {
        index: {
            "Prestige": {
                content: ["blank", ["display-text", function() {return `<small>Each layer prestige divides future essence gain by 1.001, compounding.</small><br>Total Effect: /<big>${format(new Decimal(1.001).pow(player.LPrestige.prestigeTimes()), 5)}</big> Prestige Essence gain`}], "blank",  "buyables"]
            },

            "Automation": {
                content: ["blank", ["display-text", "Each milestone doubles Prestige Essence Gain<br><br>"], ["microtabs", "milestoneTabs"]]
            }
        },

        milestoneTabs: {
            "Money": {
                content: ["blank", ["milestones", [11,12,13,14,15,16,17]]],
                unlocked() {return player.LPrestige.unlocked()}
            },

            "Sorbet": {
                content: ["blank", ["milestones", [21,22,23,24]]],
                unlocked() {return player.universe.points.gte(80)}
            }
        }
    },
    effectDescription() {return `reducing its own gain by log<sub>${format(player.LPrestige.selfNerf())}</sub>`},
    tabFormat: [
        "main-display",
        ["display-text", function() {return `(${format(player.LPrestige.prod(), 3)}/sec)`}],
        "blank",
        ["display-text", "<small>Prestiging a layer resets all of its data and resets your points in exchange for a permanent minor bonus once you aquire all of its upgrades.</small>"],
        "blank",
        ["microtabs", "index"]
    ],
    componentStyles: {
        "buyable"() {return {"width":"575px", "border-radius":"50px", "height":"125px"}},
        "microtabs"() {return {"border-color":"transparent"}}
    },
    buyables: {
        11: {
            title() {return `Prestige Money Layer (Prestige ${formatWhole(getBuyableAmount("LPrestige", 11))})`},
            display() {return `<br>Reset all Money and its upgrades and buyables for a x${format(this.effectPower())} boost to Money Gain that compounds.<br>Cost scales faster at Prestige 30, 60, 100, and 200<br><br>Cost: ${format(this.cost())} Prestige Essence<br>Effect: x${format(this.effect())} Money`},
            cost() {
                let addBase = new Decimal(0.5)
                if (getBuyableAmount("LPrestige", 11).gte(30)) addBase = addBase.add(0.6)
                if (getBuyableAmount("LPrestige", 11).gte(60)) addBase = addBase.add(0.8)
                if (getBuyableAmount("LPrestige", 11).gte(100)) addBase = addBase.add(1.5)
                let powBase = new Decimal(1.5)
                if (getBuyableAmount("LPrestige", 11).gte(30)) powBase = powBase.add(0.3)
                if (getBuyableAmount("LPrestige", 11).gte(60)) powBase = powBase.add(0.35)
                if (getBuyableAmount("LPrestige", 11).gte(100)) powBase = powBase.add(0.45)
                let base = new Decimal(1).add(new Decimal(addBase).times(getBuyableAmount("LPrestige", 11).pow(powBase)))
                return base
            },
            effectPower() {
                let base = new Decimal(1.32)
                if (hasMilestone("universe", 20)) base = base.sub(0.04)
                if (hasUpgrade("sorbet", 23)) base = base.times(1.12)
                return base
            },
            effect() {
                let mulBase = this.effectPower()
                let base = mulBase.pow(getBuyableAmount("LPrestige", 11))
                return base
            },
            canAfford() {return hasUpgrade("money", 55) && player.LPrestige.points.gte(this.cost())},
            buy() {
                player.LPrestige.points = player.LPrestige.points.sub(this.cost())
                layerDataReset("money")
                player.points = new Decimal(0)
                setBuyableAmount("LPrestige", 11, getBuyableAmount("LPrestige", 11).add(1))
                player.prestigeAmount[0] = player.prestigeAmount[0].add(1)
            }
        },

        12: {
            title() {return `Prestige Sorbet's Layer (Prestige ${formatWhole(getBuyableAmount("LPrestige", 12))})`},
            display() {return `<br>Reset all Globs and its upgrades and colors for a x${format(this.effectPower())} boost to most Colored Glob Gain that compounds.<br>Cost scales faster at Prestige 30, 60, 100, and 200<br><br>Cost: ${format(this.cost())} Prestige Essence<br>Effect: x${format(this.effect())} Colored Glob Gain`},
            cost() {
                let addBase = new Decimal(10000)
                if (getBuyableAmount("LPrestige", 12).gte(30)) addBase = addBase.add(5000)
                if (getBuyableAmount("LPrestige", 12).gte(60)) addBase = addBase.add(10000)
                if (getBuyableAmount("LPrestige", 12).gte(100)) addBase = addBase.add(17500)
                let powBase = new Decimal(1.4)
                if (getBuyableAmount("LPrestige", 12).gte(30)) powBase = powBase.add(0.2)
                if (getBuyableAmount("LPrestige", 12).gte(60)) powBase = powBase.add(0.25)
                if (getBuyableAmount("LPrestige", 12).gte(100)) powBase = powBase.add(0.35)
                let base = new Decimal(5000).add(new Decimal(addBase).times(getBuyableAmount("LPrestige", 12).pow(powBase)))
                return base
            },
            effectPower() {
                let base = new Decimal(1.1)
                return base
            },
            effect() {
                let mulBase = this.effectPower()
                let base = mulBase.pow(getBuyableAmount("LPrestige", 12))
                return base
            },
            canAfford() {return hasUpgrade("sorbet", 92) && player.LPrestige.points.gte(this.cost())},
            buy() {
                player.LPrestige.points = player.LPrestige.points.sub(this.cost())
                layerDataReset("sorbet")
                layerDataReset("money")
                player.points = new Decimal(0)
                setBuyableAmount("LPrestige", 12, getBuyableAmount("LPrestige", 12).add(1))
                player.prestigeAmount[1] = player.prestigeAmount[1].add(1)
            }
        }
    },
    milestones: {
        11: {
            done() {return getBuyableAmount("LPrestige", 11).gte(5)},
            requirementDescription: "Money Layer Prestige 5",
            effectDescription: "Passively gain 1% of money gained on reset every second along with automatically buying upgrades in the layer."
        },

        12: {
            done() {return getBuyableAmount("LPrestige", 11).gte(7)},
            requirementDescription: "Money Layer Prestige 7",
            effectDescription: "Passive gain is raised to 15% and you can now autobuy buyables in the layer.",
            unlocked() {return hasMilestone("LPrestige", 11)}
        },

        13: {
            done() {return getBuyableAmount("LPrestige", 11).gte(20)},
            requirementDescription: "Money Layer Prestige 20",
            effectDescription: "Passive gain is increased by 1% for every prestige performed on this layer, additively stacking.",
            unlocked() {return hasMilestone("LPrestige", 12)}
        },

        14: {
            done() {return getBuyableAmount("LPrestige", 11).gte(33)},
            requirementDescription: "Money Layer Prestige 33",
            effectDescription: "Double the percentage of money gained from reset every second. This milestone also triples Prestige Essence gain instead of doubling.",
            unlocked() {return hasMilestone("LPrestige", 13)}
        },

        15: {
            done() {return getBuyableAmount("LPrestige", 11).gte(50)},
            requirementDescription: "Money Layer Prestige 50",
            effectDescription: "Triple the percentage of money gained from reset every second.",
            unlocked() {return hasMilestone("LPrestige", 14)}
        },

        16: {
            done() {return getBuyableAmount("LPrestige", 11).gte(100)},
            requirementDescription: "Money Layer Prestige 100",
            effectDescription: "Quintiple the percentage of money gained from reset every second.",
            unlocked() {return hasMilestone("LPrestige", 15)}
        },

        17: {
            done() {return getBuyableAmount("LPrestige", 11).gte(150)},
            requirementDescription: "Money Layer Prestige 150",
            effectDescription: "Quindecuple passive generation and then raise passive generation to the power of 1.1.",
            unlocked() {return hasMilestone("LPrestige", 16)}
        },

        21: {
            done() {return getBuyableAmount("LPrestige", 12).gte(3)},
            requirementDescription: "Sorbet's Layer Prestige 3",
            effectDescription: "S(5-2)'s effect is always active and passively gain 1% of Globs gained on reset every second.",
            unlocked() {return player.universe.points.gte(80)}
        },

        22: {
            done() {return getBuyableAmount("LPrestige", 12).gte(6)},
            requirementDescription: "Sorbet's Layer Prestige 6",
            effectDescription: "Getting altered boosters no longer resets anything and also quintiple passive generation of Globs.",
            unlocked() {return player.universe.points.gte(80)}
        },

        23: {
            done() {return getBuyableAmount("LPrestige", 12).gte(11)},
            requirementDescription: "Sorbet's Layer Prestige 11",
            effectDescription: "Automatically buy upgrades and duodecuple passive generation.",
            unlocked() {return hasMilestone("LPrestige", 22)}
        },

        24: {
            done() {return getBuyableAmount("LPrestige", 12).gte(30)},
            requirementDescription: "Sorbet's Layer Prestige 30",
            effectDescription: "Automatically buy booster upgrades and nondecuple passive generation.",
            unlocked() {return hasMilestone("LPrestige", 23)}
        }
    }
})