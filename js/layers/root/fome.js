const q1Scale = Decimal.ln(2).recip().times(4)

addLayer("fome", {
    name: "Quantum Fome",
    symbol: "F",
    row: 1,
    position: 0,
    branches: ['skyrmion'],

    layerShown() { return temp.fome.paused ? false : player.fome.unlocked },
    paused() { return player.universeTab !== "none" },
    resource() {
        if (player.fome.fome.quantum.expansion.gte(1)) return "Quantum Foam"
        if (player.fome.fome.subplanck.expansion.gte(1)) return "Subplanck Foam"
        if (player.fome.fome.subspatial.expansion.gte(1)) return "Subspatial Foam"
        if (player.fome.fome.infinitesimal.expansion.gte(1)) return "Infinitesimal Foam"
        return "Protoversal Foam"
    },
    effectDescription() {
        if (player.fome.fome.quantum.expansion.gte(1)) return (player.fome.fome.quantum.expansion.gt(1) ? "<sup>" + formatWhole(player.fome.fome.quantum.expansion) + "</sup>" : "")
        if (player.fome.fome.subplanck.expansion.gte(1)) return (player.fome.fome.subplanck.expansion.gt(1) ? "<sup>" + formatWhole(player.fome.fome.subplanck.expansion) + "</sup>" : "")
        if (player.fome.fome.subspatial.expansion.gte(1)) return (player.fome.fome.subspatial.expansion.gt(1) ? "<sup>" + formatWhole(player.fome.fome.subspatial.expansion) + "</sup>" : "")
        if (player.fome.fome.infinitesimal.expansion.gte(1)) return (player.fome.fome.infinitesimal.expansion.gt(1) ? "<sup>" + formatWhole(player.fome.fome.infinitesimal.expansion) + "</sup>" : "")
        return (player.fome.fome.protoversal.expansion.gt(1) ? "<sup>" + formatWhole(player.fome.fome.protoversal.expansion) + "</sup>" : "")
    },
    tooltip() {
        let lines = []
        for (let fome in fomeTypes)
            if (player.fome.fome[fomeTypes[fome]].expansion.gte(1))
                lines.unshift(`${format(player.fome.fome[fomeTypes[fome]].points)} ${fomeNames[fome]} Foam${player.fome.fome[fomeTypes[fome]].expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome[fomeTypes[fome]].expansion)}</sup>`: ``}`)
        return lines.join('<br>')
    },
    color: "#ffffff",
    doReset(layer) {
        switch (layer) {
            case "acceleron":
                let indices = {}
                let boosts = {}
                let buyables = {}

                if (hasMilestone('acceleron', 0)) {
                    indices.protoversal = player.fome.boosts.protoversal.index
                    boosts.protoversal = []
                    for(let i = 0; i < 5; i++)
                        boosts.protoversal[i] = player.fome.boosts.protoversal.boosts[i]
                    for (let i = 11; i <= 13; i++)
                        buyables[i] = getBuyableAmount('fome', i)
                }
                if (hasMilestone('acceleron', 1)) {
                    indices.infinitesimal = player.fome.boosts.infinitesimal.index
                    boosts.infinitesimal = []
                    for(let i = 0; i < 5; i++)
                        boosts.infinitesimal[i] = player.fome.boosts.infinitesimal.boosts[i]
                    for (let i = 21; i <= 23; i++)
                        buyables[i] = getBuyableAmount('fome', i)
                }
                if (hasMilestone('acceleron', 2)) {
                    indices.subspatial = player.fome.boosts.subspatial.index
                    boosts.subspatial = []
                    for(let i = 0; i < 5; i++)
                        boosts.subspatial[i] = player.fome.boosts.subspatial.boosts[i]
                    for (let i = 31; i <= 33; i++)
                        buyables[i] = getBuyableAmount('fome', i)
                }
                if (hasMilestone('acceleron', 4)) {
                    indices.subplanck = player.fome.boosts.subplanck.index
                    boosts.subplanck = []
                    for(let i = 0; i < 5; i++)
                        boosts.subplanck[i] = player.fome.boosts.subplanck.boosts[i]
                    for (let i = 41; i <= 43; i++)
                        buyables[i] = getBuyableAmount('fome', i)
                }
                if (hasMilestone('acceleron', 5)) {
                    indices.quantum = player.fome.boosts.quantum.index
                    boosts.quantum = []
                    for(let i = 0; i < 5; i++)
                        boosts.quantum[i] = player.fome.boosts.quantum.boosts[i]
                    for (let i = 51; i <= 53; i++)
                        buyables[i] = getBuyableAmount('fome', i)
                }

                layerDataReset('fome', ['milestones'])

                for (let id in buyables)
                    setBuyableAmount('fome', id, buyables[id])
                for (let fome in indices)
                    player.fome.boosts[fome].index = indices[fome]
                for (let fome in boosts)
                    for(let i = 0; i < 5; i++)
                        player.fome.boosts[fome].boosts[i] = boosts[fome][i]
                break
            case "entangled":
                let keep = []
                if (hasMilestone('entangled', 1)) keep.push("milestones")
                layerDataReset('fome', keep)
                layerDataReset('fome', keep)
                if (!hasMilestone('entangled', 1)) {
                    player.fome.autoProtoversal = false
                    player.fome.autoInfinitesimal = false
                    player.fome.autoSubspatial = false
                    player.fome.autoSubplanck = false
                    player.fome.autoQuantum = false
                    player.fome.autoReform = false
                }
                break
            default:
                break
        }
    },

    effect() {
        totalBoosts = {}
        bonusBoosts = {}

        baseGain = {}
        boostGain = {}
        enlargeGain = {}
        expansionGain = {}
        totalGain = {}

        let skyrmions = Decimal.plus(player.skyrmion.points, fomeEffect('subspatial', 3))
        let inflatonBonus = decimalOne
        if (!player.inflaton.inflating) {
            if (hasResearch('inflaton', 4)) inflatonBonus = inflatonBonus.times(researchEffect('inflaton', 4))
            if (hasResearch('inflaton', 11)) inflatonBonus = inflatonBonus.times(researchEffect('inflaton', 11))
            if (hasResearch('inflaton', 18)) inflatonBonus = inflatonBonus.times(researchEffect('inflaton', 18))
            inflatonBonus = inflatonBonus.times(repeatableEffect('inflaton', 115))
        }
        inflatonBonus = inflatonBonus.min(temp.inflaton.nerf)

        let universalBoost = skyrmions.dividedBy(1e2).times(buyableEffect('skyrmion', 224)).times(player.acceleron.fomeBoost).times(defaultUpgradeEffect('acceleron', 121)).times(inflatonBonus).times(defaultUpgradeEffect('inflaton', 21))

        baseGain.protoversal = player.fome.fome.protoversal.expansion.gte(1) ? universalBoost.times(buyableEffect('skyrmion', 121)).times(buyableEffect('skyrmion', 122)).times(buyableEffect('skyrmion', 131)).times(defaultUpgradeEffect('acceleron', 11)) : decimalZero
        baseGain.infinitesimal = player.fome.fome.infinitesimal.expansion.gte(1) ? universalBoost.times(buyableEffect('skyrmion', 222)).times(buyableEffect('skyrmion', 132)).times(buyableEffect('skyrmion', 232)).times(defaultUpgradeEffect('acceleron', 11)).times(defaultUpgradeEffect('acceleron', 131)) : decimalZero,
        baseGain.subspatial = player.fome.fome.subspatial.expansion.gte(1) ? universalBoost.times(buyableEffect('skyrmion', 123)).times(buyableEffect('skyrmion', 231)).times(defaultUpgradeEffect('acceleron', 11)).times(defaultUpgradeEffect('acceleron', 23)).times(defaultUpgradeEffect('acceleron', 132)) : decimalZero,
        baseGain.subplanck = player.fome.fome.subplanck.expansion.gte(1) ? universalBoost.times(defaultUpgradeEffect('acceleron', 133)) : decimalZero,
        baseGain.quantum = player.fome.fome.quantum.expansion.gte(1) ? universalBoost : decimalZero

        fomeTypes.forEach(fome => boostGain[fome] = fomeEffect(fome, 0))
        boostGain.quantum2 = fomeEffect('quantum', 2)

        enlargeGain.protoversal = buyableEffect('fome', 11).times(buyableEffect('fome', 12)).times(buyableEffect('fome', 13))
        enlargeGain.infinitesimal = buyableEffect('fome', 21).times(buyableEffect('fome', 22)).times(buyableEffect('fome', 23))
        enlargeGain.subspatial = buyableEffect('fome', 31).times(buyableEffect('fome', 32)).times(buyableEffect('fome', 33))
        enlargeGain.subplanck = buyableEffect('fome', 41).times(buyableEffect('fome', 42)).times(buyableEffect('fome', 43))
        enlargeGain.quantum = buyableEffect('fome', 51).times(buyableEffect('fome', 52)).times(buyableEffect('fome', 53))
        
        let left = getTimelineEffect('left').div(getTimelineBonus('left').plus(1))

        fomeTypes.forEach(fome => expansionGain[fome] = player.fome.fome[fome].expansion.cbrt())
        fomeTypes.forEach(fome => totalGain[fome] = baseGain[fome].times(boostGain[fome]).times(boostGain.quantum).times(boostGain.quantum2).times(enlargeGain[fome]).pow(expansionGain[fome]).div(left))
        if (hasUpgrade('timecube', 45))
            fomeTypes.forEach(fome => totalGain[fome] = totalGain[fome].times(upgradeEffect('timecube', 45)[fome]))

        return {
            inflaton: inflatonBonus,
            boosts: {
                bonus: bonusBoosts,
                total: totalBoosts
            },
            gain: {
                base: baseGain,
                boost: boostGain,
                total: totalGain
            }
        }
    },
    
    startData() {
        let data = {
            unlocked: false,
            points: decimalZero,
            fome: {},
            boosts: {}
        }

        fomeTypes.forEach(fome => data.fome[fome] = { points: decimalZero, expansion: decimalZero })
        fomeTypes.forEach(fome => data.boosts[fome] = { index: 0, boosts: [decimalZero, decimalZero, decimalZero, decimalZero, decimalZero] })
        data.fome.protoversal.expansion = decimalOne
        return data
    },

    update(delta) {
        if (!temp.fome.layerShown) return

        delta = Decimal.times(delta, temp.acceleron.effect)
        
        let gain = temp.fome.effect.gain.total

        for (let fome of fomeTypes)
            player.fome.fome[fome].points = player.fome.fome[fome].points.plus(gain[fome].times(delta)).max(0)

        if (player.fome.fome.quantum.expansion.gte(1)) player.fome.points = player.fome.fome.quantum.points
        else if (player.fome.fome.subplanck.expansion.gte(1)) player.fome.points = player.fome.fome.subplanck.points
        else if (player.fome.fome.subspatial.expansion.gte(1)) player.fome.points = player.fome.fome.subspatial.points
        else if (player.fome.fome.infinitesimal.expansion.gte(1)) player.fome.points = player.fome.fome.infinitesimal.points
        else player.fome.points = player.fome.fome.protoversal.points
    },

    automate() {
        if (player.fome.autoProtoversal) {
            buyBuyable('fome', 11)
            buyBuyable('fome', 12)
            buyBuyable('fome', 13)
        }
        if (player.fome.autoInfinitesimal) {
            buyBuyable('fome', 21)
            buyBuyable('fome', 22)
            buyBuyable('fome', 23)
        }
        if (player.fome.autoSubspatial) {
            buyBuyable('fome', 31)
            buyBuyable('fome', 32)
            buyBuyable('fome', 33)
        }
        if (player.fome.autoSubplanck) {
            buyBuyable('fome', 41)
            buyBuyable('fome', 42)
            buyBuyable('fome', 43)
        }
        if (player.fome.autoQuantum) {
            buyBuyable('fome', 51)
            buyBuyable('fome', 52)
            buyBuyable('fome', 53)
        }
        if (player.fome.autoReform) {
            buyBuyable('fome', 14)
            buyBuyable('fome', 24)
            buyBuyable('fome', 34)
            buyBuyable('fome', 44)
            buyBuyable('fome', 54)
        }
    },

    boosts: {
        protoversal: {
            0: createFomeBoost('protoversal', 0,
                (effect) => `Multiply the generation of Protoversal Foam by ${format(effect)}x`,
                (total) => total.times(buyableEffect('skyrmion', 221)).plus(1),
                () => fomeEffect('protoversal', 4).plus(fomeEffect('subspatial', 2)).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            1: createFomeBoost('protoversal', 1,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade α levels`,
                (total) => total,
                () => fomeEffect('protoversal', 4).plus(fomeEffect('subspatial', 2)).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            2: createFomeBoost('protoversal', 2,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade β levels`,
                (total) => total.sqrt(),
                () => fomeEffect('protoversal', 4).plus(fomeEffect('subspatial', 2)).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            3: createFomeBoost('protoversal', 3,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade γ levels`,
                (total) => total,
                () => fomeEffect('protoversal', 4).plus(fomeEffect('subspatial', 2)).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            4: createFomeBoost('protoversal', 4,
                (effect) => `Add ${format(effect)} levels to all above boosts`,
                (total) => total.times(0.1),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            )
        },
        infinitesimal: {
            0: createFomeBoost('infinitesimal', 0,
                (effect) => `Multiply the generation of Infinitesimal Foam by ${format(effect)}x`,
                (total) => total.times(buyableEffect('skyrmion', 133)).times(buyableEffect('skyrmion', 134)).plus(1),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            1: createFomeBoost('infinitesimal', 1,
                (effect) => `Increase Pion and Spinor gain by ${format(effect.minus(1).times(100))}%`,
                (total) => total.times(0.5).plus(1),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            2: createFomeBoost('infinitesimal', 2,
                (effect) => `Reduce Pion and Spinor Upgrade α costs by ${format(Decimal.sub(1, effect).times(100))}%`,
                (total) => Decimal.pow(0.8, total),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            3: createFomeBoost('infinitesimal', 3,
                (effect) => `Increase Skyrmion gain by ${format(effect.minus(1).times(100))}%`,
                (total) => total.times(0.5).plus(1),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            4: createFomeBoost('infinitesimal', 4,
                (effect) => `Reduce Pion and Spinor Upgrade γ costs by ${format(Decimal.sub(1, effect).times(100))}%`,
                (total) => Decimal.pow(0.8, total),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            )
        },
        subspatial: {
            0: createFomeBoost('subspatial', 0,
                (effect) => `Multiply the generation of Subspatial Foam by ${format(effect)}x`,
                (total) => total.times(buyableEffect('skyrmion', 133)).plus(1),
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            1: createFomeBoost('subspatial', 1,
                (effect) => `The Pion and Spinor nerfs act as if you had ${format(effect)} fewer upgrades`,
                (total) => total,
                () => fomeEffect('subspatial', 2).plus(fomeEffect('quantum', 4)).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            2: createFomeBoost('subspatial', 2,
                (effect) => `Add ${format(effect)} levels to all above boosts`,
                (total) => total.times(0.1),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            3: createFomeBoost('subspatial', 3,
                (effect) => `Increase effective Skyrmion count by ${format(effect)}`,
                (total) => total,
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            4: createFomeBoost('subspatial', 4,
                (effect) => `Pion and Spinor upgrades cost as if you had ${format(effect)} fewer`,
                (total) => total.times(0.25),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            )
        },
        subplanck: {
            0: createFomeBoost('subplanck', 0,
                (effect) => `Multiply the generation of Subplanck Foam by ${format(effect)}x`,
                (total) => total.times(buyableEffect('skyrmion', 233)).times(buyableEffect('skyrmion', 133)).plus(1),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            1: createFomeBoost('subplanck', 1,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade δ levels`,
                (total) => total.times(0.5),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            2: createFomeBoost('subplanck', 2,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade ε levels`,
                (total) => total.times(0.5),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            3: createFomeBoost('subplanck', 3,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade ζ levels`,
                (total) => total.times(0.5),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            4: createFomeBoost('subplanck', 4,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade η levels`,
                (total) => total.times(0.5),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
        },
        quantum: {
            0: createFomeBoost('quantum', 0,
                (effect) => `Multiply the generation of all Foam types by ${format(effect)}x`,
                (total) => total.times(buyableEffect('skyrmion', 133)).plus(1),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            1: createFomeBoost('quantum', 1,
                (effect) => `Reduce the Pion and Spinor cost nerf exponent by ${format(Decimal.sub(1, effect).times(100))}%`,
                (total) => Decimal.pow(0.975, total.gt(16) ? total.ln().times(q1Scale) : total),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            2: createFomeBoost('quantum', 2,
                (effect) => `Multiply the generation of all Foam types again by ${format(effect)}x`,
                (total) => (total.gt(16) ? total.sqrt().times(4) : total).times(boostGain.quantum.dividedBy(10)).plus(1),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            3: createFomeBoost('quantum', 3,
                (effect) => `Gain ${format(effect)} bonus Pion and Spinor Upgrade θ, ι, and κ levels`,
                (total) => total.times(0.25),
                () => fomeEffect('quantum', 4).plus(defaultUpgradeEffect('timecube', 13, 0)).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
            4: createFomeBoost('quantum', 4,
                (effect) => `Add ${format(effect)} levels to all above boosts`,
                (total) => total.times(0.1),
                () => defaultUpgradeEffect('timecube', 13, decimalZero).plus(defaultUpgradeEffect('acceleron', 144, 0))
            ),
        }
    },

    buyables: {
        rows: 4,
        cols: 5,
        11: {
            cost() { return new Decimal(2).times(Decimal.pow(4, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            canAfford() { return player.fome.fome.protoversal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 0)) }
        },
        12: {
            cost() { return new Decimal(5).times(Decimal.pow(6, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            canAfford() { return player.fome.fome.protoversal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 0)) }
        },
        13: {
            cost() { return new Decimal(20).times(Decimal.pow(8, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            canAfford() { return player.fome.fome.protoversal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 0)) }
        },
        14: {
            cost() {
                let amount = getBuyableAmount('fome', this.id)
                amount = amount.lte(5) ? amount.sqr() : amount.pow(amount.minus(3))
                return Decimal.pow(10, amount.plus(1).times(4))
            },
            display() { return `<h3>${player.fome.fome.infinitesimal.points.eq(0) ? `Condense` : `Re-form`} your Protoversal Foam</h3><br/><br/><b>Cost:</b> ${format(temp.fome.buyables[this.id].cost)} Protoversal Foam` },
            canAfford() { return player.fome.fome.protoversal.points.gte(temp.fome.buyables[this.id].cost) },
            buy() {
                player.fome.fome.protoversal.points = player.fome.fome.protoversal.points.minus(temp.fome.buyables[this.id].cost)
                if (player.fome.fome.infinitesimal.expansion.eq(0)) player.fome.fome.infinitesimal.expansion = player.fome.fome.infinitesimal.expansion.plus(1)
                else player.fome.fome.protoversal.expansion = player.fome.fome.protoversal.expansion.plus(1)
                setBuyableAmount('fome', this.id, getBuyableAmount('fome', this.id).plus(1))
            }
        },
        21: {
            cost() { return new Decimal(6).times(Decimal.pow(5, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.infinitesimal.expansion.gte(1) },
            canAfford() { return player.fome.fome.infinitesimal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 1)) }
        },
        22: {
            cost() { return new Decimal(10).times(Decimal.pow(7, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.infinitesimal.expansion.gte(1) },
            canAfford() { return player.fome.fome.infinitesimal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 1)) }
        },
        23: {
            cost() { return new Decimal(25).times(Decimal.pow(9, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.infinitesimal.expansion.gte(1) },
            canAfford() { return player.fome.fome.infinitesimal.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 1)) }
        },
        24: {
            cost() {
                let amount = getBuyableAmount('fome', this.id)
                amount = amount.lte(4) ? amount.sqr() : amount.pow(amount.minus(2))
                return Decimal.pow(10, amount.plus(1).times(5)).dividedBy(5)
            },
            display() {
                let type = player.fome.fome.subspatial.expansion.eq(0)
                return `<h3>${type ? `Condense` : `Re-form`} your Infinitesimal Foam</h3><br/><br/><b>Cost:</b> ${format(temp.fome.buyables[this.id].cost)} Infinitesimal Foam${type ? ``: `<br/><br/><b>Requires:</b> Protoversal Foam<sup>${getBuyableAmount('fome', this.id).plus(2)}</sup>`}`
            },
            unlocked() { return player.fome.fome.infinitesimal.expansion.gte(1) },
            canAfford() { return (player.fome.fome.subspatial.expansion.eq(0) || player.fome.fome.protoversal.expansion.gt(getBuyableAmount('fome', this.id).plus(1))) && player.fome.fome.infinitesimal.points.gte(temp.fome.buyables[this.id].cost) },
            buy() {
                player.fome.fome.infinitesimal.points = player.fome.fome.infinitesimal.points.minus(temp.fome.buyables[this.id].cost)
                if (player.fome.fome.subspatial.expansion.eq(0)) player.fome.fome.subspatial.expansion = player.fome.fome.subspatial.expansion.plus(1)
                else player.fome.fome.infinitesimal.expansion = player.fome.fome.infinitesimal.expansion.plus(1)
                setBuyableAmount('fome', this.id, getBuyableAmount('fome', this.id).plus(1))
            }
        },
        31: {
            cost() { return new Decimal(10).times(Decimal.pow(6, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subspatial.expansion.gte(1) },
            canAfford() { return player.fome.fome.subspatial.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 2)) }
        },
        32: {
            cost() { return new Decimal(18).times(Decimal.pow(8, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subspatial.expansion.gte(1) },
            canAfford() { return player.fome.fome.subspatial.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 2)) }
        },
        33: {
            cost() { return new Decimal(60).times(Decimal.pow(10, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subspatial.expansion.gte(1) },
            canAfford() { return player.fome.fome.subspatial.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 2)) }
        },
        34: {
            cost() {
                let amount = getBuyableAmount('fome', this.id)
                amount = amount.lte(3) ? amount.sqr() : amount.pow(amount.minus(1))
                return Decimal.pow(10, amount.plus(1).times(6)).dividedBy(2.5)
            },
            display() {
                let type = player.fome.fome.subplanck.expansion.eq(0)
                return `<h3>${type ? `Condense` : `Re-form`} your Subspatial Foam</h3><br/><br/><b>Cost:</b> ${format(temp.fome.buyables[this.id].cost)} Subspatial Foam${type ? ``: `<br/><br/><b>Requires:</b> Infinitesimal Foam<sup>${getBuyableAmount('fome', this.id).plus(2)}</sup>`}`
            },
            unlocked() { return player.fome.fome.subspatial.expansion.gte(1) },
            canAfford() { return (player.fome.fome.subplanck.expansion.eq(0) || player.fome.fome.infinitesimal.expansion.gt(getBuyableAmount('fome', this.id).plus(1))) && player.fome.fome.subspatial.points.gte(temp.fome.buyables[this.id].cost) },
            buy() {
                player.fome.fome.subspatial.points = player.fome.fome.subspatial.points.minus(temp.fome.buyables[this.id].cost)
                if (player.fome.fome.subplanck.expansion.eq(0)) player.fome.fome.subplanck.expansion = player.fome.fome.subplanck.expansion.plus(1)
                else player.fome.fome.subspatial.expansion = player.fome.fome.subspatial.expansion.plus(1)
                setBuyableAmount('fome', this.id, getBuyableAmount('fome', this.id).plus(1))
            }
        },
        41: {
            cost() { return new Decimal(15).times(Decimal.pow(7, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subplanck.expansion.gte(1) },
            canAfford() { return player.fome.fome.subplanck.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 4)) }
        },
        42: {
            cost() { return new Decimal(25).times(Decimal.pow(9, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subplanck.expansion.gte(1) },
            canAfford() { return player.fome.fome.subplanck.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 4)) }
        },
        43: {
            cost() { return new Decimal(90).times(Decimal.pow(11, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.subplanck.expansion.gte(1) },
            canAfford() { return player.fome.fome.subplanck.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 4)) }
        },
        44: {
            cost() {
                let amount = getBuyableAmount('fome', this.id)
                amount = amount.lte(2) ? amount.sqr() : amount.pow(amount)
                return Decimal.pow(10, amount.plus(1).times(7)).dividedBy(1)
            },
            display() {
                let type = player.fome.fome.quantum.expansion.eq(0)
                return `<h3>${type ? `Condense` : `Re-form`} your Subplanck Foam</h3><br/><br/><b>Cost:</b> ${format(temp.fome.buyables[this.id].cost)} Subplanck Foam${type ? `` : `<br/><br/><b>Requires:</b> Subspatial Foam<sup>${getBuyableAmount('fome', this.id).plus(2)}</sup>`}`
            },
            unlocked() { return player.fome.fome.subplanck.expansion.gte(1) },
            canAfford() { return (player.fome.fome.quantum.expansion.eq(0) || player.fome.fome.subspatial.expansion.gt(getBuyableAmount('fome', this.id).plus(1))) && player.fome.fome.subplanck.points.gte(temp.fome.buyables[this.id].cost) },
            buy() {
                player.fome.fome.subplanck.points = player.fome.fome.subplanck.points.minus(temp.fome.buyables[this.id].cost)
                if (player.fome.fome.quantum.expansion.eq(0)) player.fome.fome.quantum.expansion = player.fome.fome.quantum.expansion.plus(1)
                else player.fome.fome.subplanck.expansion = player.fome.fome.subplanck.expansion.plus(1)
                setBuyableAmount('fome', this.id, getBuyableAmount('fome', this.id).plus(1))
            }
        },
        51: {
            cost() { return new Decimal(20).times(Decimal.pow(8, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.quantum.expansion.gte(1) },
            canAfford() { return player.fome.fome.quantum.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 5)) }
        },
        52: {
            cost() { return new Decimal(30).times(Decimal.pow(10, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.quantum.expansion.gte(1) },
            canAfford() { return player.fome.fome.quantum.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 5)) }
        },
        53: {
            cost() { return new Decimal(100).times(Decimal.pow(12, getBuyableAmount('fome', this.id).pow(1.15))) },
            display() { return displayFomeBuyable(this.id) },
            unlocked() { return player.fome.fome.quantum.expansion.gte(1) },
            canAfford() { return player.fome.fome.quantum.points.gte(temp.fome.buyables[this.id].cost) },
            effect() { return getBuyableAmount('fome', this.id).plus(1) },
            buy() { buyFomeBuyable(this.id, hasMilestone('acceleron', 5)) }
        },
        54: {
            cost() {
                let amount = getBuyableAmount('fome', this.id)
                amount = amount.lte(1) ? amount.sqr() : amount.pow(amount.plus(1))
                return Decimal.pow(10, amount.plus(1).times(7)).times(1e2)
            },
            display() {
                let type = getBuyableAmount('fome', this.id).eq(0)
                return `<h3>${type ? `Condense` : `Re-form`} your Quantum Foam</h3><br/><br/><b>Cost:</b> ${format(temp.fome.buyables[this.id].cost)} Quantum Foam${type ? `` : `<br/><br/><b>Requires:</b> Subplanck Foam<sup>${getBuyableAmount('fome', this.id).plus(2)}</sup>`}`
            },
            unlocked() { return player.fome.fome.quantum.expansion.gte(1) },
            canAfford() { return (getBuyableAmount('fome', this.id).eq(0) || player.fome.fome.subplanck.expansion.gt(getBuyableAmount('fome', this.id).plus(1))) && player.fome.fome.quantum.points.gte(temp.fome.buyables[this.id].cost) },
            buy() {
                player.fome.fome.quantum.points = player.fome.fome.quantum.points.minus(temp.fome.buyables[this.id].cost)
                if (getBuyableAmount('fome', this.id).eq(0)) {
                    if (!player.inflaton.unlocked && !player.acceleron.unlocked) {
                        player.inflaton.unlocked = true
                        player.acceleron.unlocked = true
                    }
                }
                else player.fome.fome.quantum.expansion = player.fome.fome.quantum.expansion.plus(1)
                setBuyableAmount('fome', this.id, getBuyableAmount('fome', this.id).plus(1))
            }
        }
    },

    milestones: {
        0: {
            requirementDescription: "Re-form your Protovesral Foam",
            effectDescription: "Unlock the Pion and Spinor Buy All button<br>Automatically enlarge your Protoversal Foam",
            done() { return player.fome.fome.protoversal.expansion.gte(2) },
            toggles: [['fome', 'autoProtoversal']]
        },
        1: {
            requirementDescription: "Obtain Protoversal Foam<sup>3</sup>",
            effectDescription: "Automatically enlarge your Infinitesimal Foam",
            done() { return player.fome.fome.protoversal.expansion.gte(3) },
            toggles: [['fome', 'autoInfinitesimal']]
        },
        2: {
            requirementDescription: "Obtain Protoversal Foam<sup>4</sup>",
            effectDescription: "Automatically enlarge your Subspatial Foam",
            done() { return player.fome.fome.protoversal.expansion.gte(4) },
            toggles: [['fome', 'autoSubspatial']]
        },
        3: {
            requirementDescription: "Obtain Protoversal Foam<sup>5</sup>",
            effectDescription: "Automatically enlarge your Subplanck Foam",
            done() { return player.fome.fome.protoversal.expansion.gte(5) },
            toggles: [['fome', 'autoSubplanck']]
        },
        4: {
            requirementDescription: "Obtain Protoversal Foam<sup>6</sup>",
            effectDescription: "Automatically enlarge your Quantum Foam",
            done() { return player.fome.fome.protoversal.expansion.gte(6) },
            toggles: [['fome', 'autoQuantum']]
        },
        5: {
            requirementDescription: "Obtain Quantum Foam<sup>2</sup>",
            effectDescription: "Automatically re-form your Foam",
            done() { return player.fome.fome.quantum.expansion.gte(2) },
            toggles: [['fome', 'autoReform']]
        }
    },

    clickables: {
        11: {
            title: "Buy All",
            unlocked() { return hasMilestone('inflaton', 1) || hasMilestone('acceleron', 0) },
            canClick: true,
            onClick() {
                for (let row = 10; row <= 50; row += 10)
                    for (let col = 1; col <= 4; col++)
                        while (temp.fome.buyables[row+col].canAfford) buyBuyable('fome', row+col)
            },
            onHold() { layers.fome.clickables[11].onClick() },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        }
    },

    microtabs: {
        stuff: {
            "Foam": {
                shouldNotify() {
                    if (player.tab == "fome" && player.subtabs.fome.stuff == "Foam")
                        return false
                    return Object.values(temp.fome.buyables).some(buyable => buyable.unlocked && buyable.canAfford)
                },
                content: [
                    "blank",
                    ["clickable", 0],
                    () => hasMilestone('inflaton', 1) || hasMilestone('acceleron', 0) ? "blank" : "",
                    ["component-table", [
                        () => player.fome.fome.quantum.expansion.gte(1) ? [
                            ["column", [
                                ["display-text", `You have ${format(player.fome.fome.quantum.points)} Quantum Foam${player.fome.fome.quantum.expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome.quantum.expansion)}</sup>` : ``}`],
                                ["display-text", `(${format(temp.fome.effect.gain.total.quantum)}/sec)`]
                            ]],
                            "blank", ["buyable", 51], ["buyable", 52], ["buyable", 53], ["buyable", 54]
                        ] : ``,
                        () => player.fome.fome.subplanck.expansion.gte(1) ? [
                            ["column", [
                                ["display-text", `You have ${format(player.fome.fome.subplanck.points)} Subplanck Foam${player.fome.fome.subplanck.expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome.subplanck.expansion)}</sup>` : ``}`],
                                ["display-text", `(${format(temp.fome.effect.gain.total.subplanck)}/sec)`]
                            ]],
                            "blank", ["buyable", 41], ["buyable", 42], ["buyable", 43], ["buyable", 44]
                        ] : ``,
                        () => player.fome.fome.subspatial.expansion.gte(1) ? [
                            ["column", [
                                ["display-text", `You have ${format(player.fome.fome.subspatial.points)} Subspatial Foam${player.fome.fome.subspatial.expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome.subspatial.expansion)}</sup>` : ``}`],
                                ["display-text", `(${format(temp.fome.effect.gain.total.subspatial)}/sec)`]
                            ]],
                            "blank", ["buyable", 31], ["buyable", 32], ["buyable", 33], ["buyable", 34]
                        ] : ``,
                        () => player.fome.fome.infinitesimal.expansion.gte(1) ? [
                            ["column", [
                                ["display-text", `You have ${format(player.fome.fome.infinitesimal.points)} Infinitesimal Foam${player.fome.fome.infinitesimal.expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome.infinitesimal.expansion)}</sup>` : ``}`],
                                ["display-text", `(${format(temp.fome.effect.gain.total.infinitesimal)}/sec)`]
                            ]],
                            "blank", ["buyable", 21], ["buyable", 22], ["buyable", 23], ["buyable", 24]
                        ] : ``,
                        () => player.fome.fome.protoversal.expansion.gte(1) ? [
                            ["column", [
                                ["display-text", `You have ${format(player.fome.fome.protoversal.points)} Protoversal Foam${player.fome.fome.protoversal.expansion.gt(1) ? `<sup>${formatWhole(player.fome.fome.protoversal.expansion)}</sup>` : ``}`],
                                ["display-text", `(${format(temp.fome.effect.gain.total.protoversal)}/sec)`]
                            ]],
                            "blank",["buyable", 11], ["buyable", 12], ["buyable", 13], ["buyable", 14]
                        ] : ``
                    ]]
                ]
            },
            "Boosts": {
                unlocked() { return player.fome.boosts.protoversal.boosts[0].gte(1) },
                content() { return temp.fome ? [
                    "blank",
                    ["display-text", layers.fome.boosts.protoversal[0].display()],
                    ["display-text", layers.fome.boosts.protoversal[1].display()],
                    ["display-text", layers.fome.boosts.protoversal[2].display()],
                    ["display-text", layers.fome.boosts.protoversal[3].display()],
                    ["display-text", layers.fome.boosts.protoversal[4].display()],
                    "blank",
                    ["display-text", layers.fome.boosts.infinitesimal[0].display()],
                    ["display-text", layers.fome.boosts.infinitesimal[1].display()],
                    ["display-text", layers.fome.boosts.infinitesimal[2].display()],
                    ["display-text", layers.fome.boosts.infinitesimal[3].display()],
                    ["display-text", layers.fome.boosts.infinitesimal[4].display()],
                    "blank",
                    ["display-text", layers.fome.boosts.subspatial[0].display()],
                    ["display-text", layers.fome.boosts.subspatial[1].display()],
                    ["display-text", layers.fome.boosts.subspatial[2].display()],
                    ["display-text", layers.fome.boosts.subspatial[3].display()],
                    ["display-text", layers.fome.boosts.subspatial[4].display()],
                    "blank",
                    ["display-text", layers.fome.boosts.subplanck[0].display()],
                    ["display-text", layers.fome.boosts.subplanck[1].display()],
                    ["display-text", layers.fome.boosts.subplanck[2].display()],
                    ["display-text", layers.fome.boosts.subplanck[3].display()],
                    ["display-text", layers.fome.boosts.subplanck[4].display()],
                    "blank",
                    ["display-text", layers.fome.boosts.quantum[0].display()],
                    ["display-text", layers.fome.boosts.quantum[1].display()],
                    ["display-text", layers.fome.boosts.quantum[2].display()],
                    ["display-text", layers.fome.boosts.quantum[3].display()],
                    ["display-text", layers.fome.boosts.quantum[4].display()]
                ] : [] }
            },
            "Milestones": {
                content: [
                    "blank",
                    "milestones"
                ]
            }
        }
    },

    tabFormat: [
        ["display-text", () => {
            let points
            if (player.fome.fome.quantum.expansion.gte(1)) points = player.fome.fome.quantum.points
            else if (player.fome.fome.subplanck.expansion.gte(1)) points = player.fome.fome.subplanck.points
            else if (player.fome.fome.subspatial.expansion.gte(1)) points = player.fome.fome.subspatial.points
            else if (player.fome.fome.infinitesimal.expansion.gte(1)) points = player.fome.fome.infinitesimal.points
            else points = player.fome.fome.protoversal.points
            return `You have ${colored('fome', formatWhole(points))} ${temp.fome.resource}${layers.fome.effectDescription()}`
        }],
        "blank",
        ["microtabs", "stuff"]
    ],

    componentStyles: {
        "buyable"() { return { "height": "100px", "width": "150px" } }
    },

    hotkeys: [
        {
            key: "F",
            onPress() { if (temp.fome.clickables[11].unlocked) clickClickable('fome', 11) }
        },
        {
            key: "ctrl+f",
            onPress() { if (temp.fome.layerShown === true) player.tab = 'fome' }
        }
    ]
})

const fomeTypes = ['protoversal', 'infinitesimal', 'subspatial', 'subplanck', 'quantum']
const fomeNames = ['Protoversal', 'Infinitesimal', 'Subspatial', 'Subplanck', 'Quantum']
const fomeDims = ['height', 'width', 'depth']
const fomeDimNames = ['Height', 'Width', 'Depth']

function displayFomeBuyable(id) {
	let fomeName = fomeNames[~~(id/10)-1]
	let dimName = fomeDimNames[~~(id%10)-1]
	return `<h3>Enlarge ${fomeName} Foam ${dimName} by 1m</h3><br/><br/><b>Current ${dimName}:</b> ${formatWhole(getBuyableAmount('fome', id))}m<br/><br/><b>Cost:</b> ${format(temp.fome.buyables[id].cost)}`
}

function displayFomeBoost(fomeTypeIndex, boostIndex, effect) {
	let fomeType = fomeTypes[fomeTypeIndex]
	let fomeName = fomeNames[fomeTypeIndex]
	let boost = player.fome.boosts[fomeType].boosts[boostIndex]
	let bonus = temp.fome.boosts[fomeType][boostIndex].bonus
	return (boost > 0 || bonus > 0) ? `${fomeName} Boost ${boostIndex+1} [${(boost > 0 ? formatWhole(boost) : `0`) + (bonus > 0 ? ` + ${formatWhole(bonus)}` : ``)}]: ${effect}` : ``
}

function buyFomeBuyable(id, free=false) {
	let fome = fomeTypes[~~(id/10)-1]
	if (!free) player.fome.fome[fome].points = player.fome.fome[fome].points.minus(temp.fome.buyables[id].cost)
	setBuyableAmount('fome', id, getBuyableAmount('fome', id).plus(1))
	player.fome.boosts[fome].boosts[player.fome.boosts[fome].index] = player.fome.boosts[fome].boosts[player.fome.boosts[fome].index++].plus(1)
	if (player.fome.boosts[fome].index >= 5)
		player.fome.boosts[fome].index %= 5
}

function createFomeBoost(fome, index, displayFunc, effectFunc, bonusFunc = () => decimalZero) {
    let fomeIndex
    switch (fome) {
        case 'protoversal': fomeIndex = 0; break
        case 'infinitesimal': fomeIndex = 1; break
        case 'subspatial': fomeIndex = 2; break
        case 'subplanck': fomeIndex = 3; break
        case 'quantum': fomeIndex = 4; break
    }
    return {
        display() { return displayFomeBoost(fomeIndex, index, displayFunc(temp.fome.boosts[fome][index].effect)) },
        effect() { return effectFunc(temp.fome.boosts[fome][index].total) },
        bonus: bonusFunc,
        total() { return Decimal.plus(player.fome.boosts[fome].boosts[index], temp.fome.boosts[fome][index].bonus) }
    }
}

function fomeEffect(fome, index) { return temp.fome.boosts[fome][index].effect }