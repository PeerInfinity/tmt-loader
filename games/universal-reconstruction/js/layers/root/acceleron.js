const fib = [decimalOne, decimalOne]
const sqrt5 = Decimal.sqrt(5)
const phi = sqrt5.plus(1).dividedBy(2)

addLayer("acceleron", {
    name: "Acceleron",
    symbol: "A",
    row: 2,
    position: 0,
    branches: ['fome'],

    layerShown() { return temp.acceleron.paused ? false : ((player.acceleron.unlockOrder > 0 && !hasResearch('inflaton', 25)) ? "ghost" : player.acceleron.unlocked) },
    paused() { return player.universeTab !== "none" },
    increaseUnlockOrder: ['inflaton'],
    resource() { return player[this.layer].points.equals(1) ? "Acceleron" : "Accelerons" },
    color: "#0f52ba",
    type: "normal",
    baseResource: "Quantum Foam",
    baseAmount() { return player.fome.fome.quantum.points },
    requires() { return player.acceleron.unlockOrder > 0 ? new Decimal(1e80) : new Decimal(1e12) },
    exponent() { return player.acceleron.unlockOrder > 0 ? 0.05 : 0.1 },
    canReset() { return !hasUpgrade('acceleron', 24) && getBuyableAmount('fome', 54).gte(1) && Decimal.gte(temp.acceleron.resetGain, 1) },
    prestigeNotify() { return isLoopFinished(0) ? false : temp.acceleron.canReset },
    doReset(layer) {
        switch (layer) {
            case "entangled":
                let presetNames = Object.values(player.acceleron.presets).map(preset => preset.name)
                layerDataReset('acceleron', ['milestones', 'presets', 'presetNameZero', 'presetNameOne', 'presetNameTwo'])
                Object.values(player.acceleron.presets).forEach((preset, index) => preset.name = presetNames[index])
                break
            default:
        }
    },
    onPrestige() {
        if (!hasMilestone('entangled', 0) && player.acceleron.unlockOrder === 0 && player.inflaton.unlockOrder === 0)
            player.inflaton.unlockOrder = 1
    },
    gainMult() {
        return defaultUpgradeEffect('acceleron', 12).times(defaultUpgradeEffect('acceleron', 15)).times(defaultUpgradeEffect('acceleron', 143)).times(defaultUpgradeEffect('acceleron', 134)).times(defaultUpgradeEffect('acceleron', 114)).times(player.acceleron.acceleronBoost)
    },
    entropy() {
        let entropy = 0
        for (let id in temp.acceleron.loops) {
            if (typeof temp.acceleron.loops[id] !== 'object') continue

            let loop = temp.acceleron.loops[id]
            if (!loop.unlocked) continue
            if (isLoopFinished(id))
                entropy++
        }
        return Decimal.times(entropy, temp.acceleron.entropyMult)
    },
    entropyMult() {
        let mult = decimalOne
        if (hasUpgrade('timecube', 21)) mult = mult.times(upgradeEffect('timecube', 21))
        return mult
    },
    effect() {
        let effect = player.acceleron.best.max(0).plus(1)
        effect = effect.gte(1e12) ? effect.log10().times(5e5/6) : effect.sqrt()
        return effect.times(defaultUpgradeEffect('timecube', 12)).times(defaultUpgradeEffect('acceleron', 113)).times(buyableEffect('timecube', 'back')).times(defaultUpgradeEffect('timecube', 35)).div(getTimelineEffect('back')).times(getTimelineBonus('back').plus(1)).max(1).times(getClickableState('acceleron', 0))
    },
    effectDescription() {
        return `which ${player.acceleron.points.eq(1) ? `is` : `are`} causing time to go ${format(temp.acceleron.effect)}x faster<br>For every second in real time, ${formatSingleTime(temp.acceleron.effect)} passes`
    },

    update(delta) {
        delta = Decimal.times(delta, temp.acceleron.effect)

        player.acceleron.time = player.acceleron.time.plus(delta)

        for (let loop in temp.acceleron.loops) {
            let finished = isLoopFinished(loop)
            if (delta.lt(0)) {
                if (temp.acceleron.loops[loop].unlocked && !finished) {
                    let buildSpeed = delta.times(defaultUpgradeEffect('acceleron', 112)).times(defaultUpgradeEffect('timecube', 23)).times(buyableEffect('skyrmion', 144)).times(buyableEffect('timecube', 'right')).negate()
                    buildSpeed = buildSpeed.min(player.acceleron.points).min(temp.acceleron.loops[loop].max.minus(player.acceleron.loops[loop].progress))
                    player.acceleron.loops[loop].progress = player.acceleron.loops[loop].progress.plus(buildSpeed).min(temp.acceleron.loops[loop].max)
                    player.acceleron.points = player.acceleron.points.minus(buildSpeed.times(defaultUpgradeEffect('acceleron', 122)))
                    if (isLoopFinished(loop)) {
                        player.acceleron.entropy = player.acceleron.entropy.plus(temp.acceleron.entropyMult)
                        clickClickable('acceleron', 0)
                    }
                    break
                }
            }
            else if (finished) {
                updateLoopInterval(loop, delta)
            }
            else if (player.acceleron.loops[loop]) {
                let loss = player.acceleron.loops[loop].progress.times(0.001).max(temp.acceleron.loops[loop].max.times(0.0005))
                player.acceleron.loops[loop].progress = player.acceleron.loops[loop].progress.minus(loss).max(0)
            }
        }

        if (player.acceleron.fomeBoost.lte(1e6) && player.acceleron.fomeBoost.gt(1))
            player.acceleron.fomeBoost = player.acceleron.fomeBoost.times(0.92).max(1)
        if (player.acceleron.acceleronBoost.lte(1e3) && player.acceleron.acceleronBoost.gt(1))
            player.acceleron.acceleronBoost = player.acceleron.acceleronBoost.times(0.92).max(1)
        if (player.acceleron.skyrmionBoost.lte(1e9) && player.acceleron.skyrmionBoost.gt(1))
            player.acceleron.skyrmionBoost = player.acceleron.skyrmionBoost.times(0.92).max(1)
    },

    startData() {
        data = {
            unlocked: false,
            points: decimalZero,
            best: decimalZero,
            total: decimalZero,
            unlockOrder: 0,
            loops: {},
            time: decimalZero,
            fomeBoost: decimalOne,
            acceleronBoost: decimalOne,
            skyrmionBoost: decimalOne,
            entropy: decimalZero,
            enhancements: [0,0,0,0,0,0,0],
            clickables: [1],
            presets: [
                { name: "", upgrades: [] },
                { name: "", upgrades: [] },
                { name: "", upgrades: [] }
            ],
            presetNameZero: "",
            presetNameOne: "",
            presetNameTwo: ""
        }

        Object.keys(layers.acceleron.loops)
              .filter(id => typeof layers.acceleron.loops[id] === 'object')
              .forEach(id => data.loops[id] = {
                  progress: decimalZero,
                  interval: decimalZero
              })

        return data
    },

    numFinishedLoops() {
        let count = 0
        for (let loop in layers.acceleron.loops) {
            if (temp.acceleron.loops[loop].unlocked) {
                if(isLoopFinished(loop)) count++
                else break
            }
            else break
        }
        return new Decimal(count)
    },
    loops: {
        maxRadius: 150,
        0: {
            unlocked() { return hasUpgrade('acceleron', 14) || isLoopFinished(0) },
            max: new Decimal(60),
            duration: decimalOne,
            multi() { return Decimal.plus(0.001, defaultUpgradeEffect('acceleron', 123, 0)).div(getTimelineEffect('right')).times(getTimelineBonus('right').plus(1)) },
            intervalEffect(intervals = decimalOne) { addPoints('acceleron', new Decimal(temp.acceleron.resetGain).times(temp.acceleron.loops[0].multi).times(intervals).max(hasUpgrade('timecube', 44) ? 1 : 0)) },
            intervalDisplay() { return `Every second, gain ${formatSmall(temp.acceleron.loops[0].multi.times(100), 1)}% of your Acceleron prestige gain. Currently: ${format(new Decimal(temp.acceleron.resetGain).times(temp.acceleron.loops[0].multi).times(temp.acceleron.effect))} Accelerons/s` },
            stroke: '#ff0000',
            width: 10
        },
        1: {
            unlocked() { return isLoopFinished(0) || isLoopFinished(1) },
            max: new Decimal(360),
            duration: new Decimal(60),
            multi() { return Decimal.plus(1, defaultUpgradeEffect('acceleron', 111, 0)).div(getTimelineEffect('right')).times(getTimelineBonus('right').plus(1)) },
            intervalEffect(intervals = decimalOne) {
                let skyrmionEffect = temp.skyrmion.effect
                let fomeEffect = temp.fome.effect

                let time = temp.acceleron.loops[1].duration.times(temp.acceleron.loops[1].multi).times(intervals)

                player.skyrmion.pion.points = player.skyrmion.pion.points.plus(skyrmionEffect.pion.gen.times(time))
                player.skyrmion.spinor.points = player.skyrmion.spinor.points.plus(skyrmionEffect.spinor.gen.times(time))
                fomeTypes.forEach(fome => player.fome.fome[fome].points = player.fome.fome[fome].points.plus(fomeEffect.gain.total[fome].times(time)))
            },
            intervalDisplay() { return `Every minute, gain ${formatSmall(temp.acceleron.loops[1].multi)} minutes of Foam and Skyrmion production. Currently: ${format(temp.acceleron.loops[1].multi.times(temp.acceleron.effect))} minutes/s` },
            stroke: '#800080',
            width: 10
        },
        2: {
            unlocked() { return isLoopFinished(1) || isLoopFinished(2) },
            max: new Decimal(600),
            duration: new Decimal(3600),
            gain() { return defaultUpgradeEffect('timecube', 11).times(defaultUpgradeEffect('acceleron', 22)).times(defaultUpgradeEffect('acceleron', 141)).times(buyableEffect('timecube', 'front')).div(getTimelineEffect('right')).times(getTimelineBonus('right').plus(1)).div(getTimelineEffect('front')).times(getTimelineBonus('front').plus(1)) },
            intervalEffect(intervals = decimalOne) { addPoints('timecube', intervals.times(temp.acceleron.loops[2].gain)) },
            intervalDisplay() { return `Every hour, gain ${format(temp.acceleron.loops[2].gain)} Time Cubes. Currently: ${format(temp.acceleron.loops[2].gain.times(temp.acceleron.effect).div(3600))} Time Cubes/s` },
            stroke: '#0000FF',
            width: 10
        },
        3: {
            unlocked() { return hasUpgrade('timecube', 15) || isLoopFinished(3) },
            max: new Decimal(250000),
            duration: new Decimal(86400),
            intervalEffect(intervals = decimalOne) { player.acceleron.fomeBoost = Decimal.times(Decimal.div(1e6, getTimelineEffect('right').div(getTimelineBonus('right').plus(1))), intervals) },
            intervalDisplay() { return `Every day, gain a decaying boost to Foam production. Currently: ${format(player.acceleron.fomeBoost)}x` },
            stroke: '#008080',
            width: 10
        },
        4: {
            unlocked() { return hasUpgrade('acceleron', 24) || isLoopFinished(4) },
            max: new Decimal(1e11),
            duration: new Decimal(31536000),
            intervalEffect(intervals = decimalOne) { player.acceleron.acceleronBoost = Decimal.times(Decimal.div(1e3, getTimelineEffect('right').div(getTimelineBonus('right').plus(1))), intervals) },
            intervalDisplay() { return `Every year, gain a decaying boost to Acceleron production. Currently: ${format(player.acceleron.acceleronBoost)}x` },
            stroke: '#00FF00',
            width: 10
        },
        5: {
            unlocked() { return isLoopFinished(4) || isLoopFinished(5) },
            max: new Decimal(4e17),
            duration: new Decimal(315360000),
            intervalEffect(intervals = decimalOne) { player.acceleron.skyrmionBoost = Decimal.times(Decimal.div(1e9, getTimelineEffect('right').div(getTimelineBonus('right').plus(1))), intervals) },
            intervalDisplay() { return `Every decade, gain a decaying boost to Pion and Spinor production. Currently: ${format(player.acceleron.skyrmionBoost)}x` },
            stroke: '#808000',
            width: 10
        }
    },

    enhancements() {
        return [
            0,
            1 + defaultUpgradeEffect('timecube', 22, 0),
            1 + defaultUpgradeEffect('acceleron', 124, 0),
            1,
            1 + defaultUpgradeEffect('timecube', 24, 0)
        ]
    },

    milestones: {
        0: {
            requirementDescription: "1 Total Acceleron",
            effectDescription: "Unlock the Foam Buy All button<br>Protoversal Foam doesn't shrink on Acceleron reset",
            done() { return player.acceleron.total.gte(1) }
        },
        1: {
            requirementDescription: "2 Total Accelerons",
            effectDescription: "Infinitesimal Foam doesn't shrink on Acceleron reset",
            done() { return player.acceleron.total.gte(2) }
        },
        2: {
            requirementDescription: "3 Total Accelerons",
            effectDescription: "Subspatial Foam doesn't shrink on Acceleron reset",
            done() { return player.acceleron.total.gte(3) }
        },
        3: {
            requirementDescription: "5 Total Accelerons",
            effectDescription: "Start with 10 Skyrmions on Acceleron resets",
            done() { return player.acceleron.total.gte(5) }
        },
        4: {
            requirementDescription: "7 Total Accelerons",
            effectDescription: "Subplanck Foam doesn't shrink on Acceleron reset",
            done() { return player.acceleron.total.gte(7) }
        },
        5: {
            requirementDescription: "10 Total Accelerons",
            effectDescription: "Quantum Foam doesn't shrink on Acceleron reset",
            done() { return player.acceleron.total.gte(10) }
        }
    },

    upgrades: {
        rows: 5,
        cols: 5,
        11: {
            title: 'Minute Acceleration',
            description: 'Time speed massively multiplies Foam generation',
            cost: decimalOne,
            effect() { return temp.acceleron.effect.abs().sqrt().times(1000) },
            effectDisplay() { return `${format(upgradeEffect('acceleron', 11))}x` },
            unlocked() { return player.entangled.points.gte(1) || player.acceleron.total.gte(4) || hasUpgrade('acceleron', this.id) }
        },
        12: {
            title: 'Quantum Translation',
            description: 'Each Foam re-formation increases Acceleron gain by 100%',
            cost: new Decimal(5),
            effect() { return fomeTypes.map(type => player.fome.fome[type].expansion).reduce((a,b) => Decimal.plus(a,b)).minus(5).max(1) },
            effectDisplay() { return `${formatWhole(upgradeEffect('acceleron', 12))}x` },
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 11) || hasUpgrade('acceleron', this.id) }
        },
        13: {
            title: 'Superpositional Acceleration',
            description: 'Gain a new Pion and Spinor Upgrade',
            cost: new Decimal(25),
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 12) || hasUpgrade('acceleron', this.id) }
        },
        14: {
            title: 'Quasi-temporal Superstructures',
            description: 'Consume the past to build the future',
            cost: new Decimal(50),
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 13) || hasUpgrade('acceleron', this.id) }
        },
        15: {
            title: 'Temporal Fluctuation',
            description: 'Each Entropic Loop multiplies Acceleron gain',
            effect() { return temp.acceleron.numFinishedLoops.plus(1) },
            effectDisplay() { return `${formatWhole(upgradeEffect('acceleron', 15))}x`},
            cost: new Decimal(100),
            unlocked() { return player.entangled.points.gte(1) || isLoopFinished(0) || hasUpgrade('acceleron', this.id) },
        },
        21: {
            title: 'Unstable Expansion',
            description: 'Unlock Entropic Enhancements',
            cost: new Decimal(300),
            unlocked() { return player.entangled.points.gte(1) || isLoopFinished(1) || hasUpgrade('acceleron', this.id) }
        },
        22: {
            title: 'Stability Conversion',
            description: 'Each Entropic Loop multiplies Time Cube gain',
            cost: new Decimal(150000),
            effect() {
                let count = 1
                for (let loop in layers.acceleron.loops) {
                    if (temp.acceleron.loops[loop].unlocked) {
                        if (isLoopFinished(loop)) count++
                        else break
                    }
                    else break
                }
                return new Decimal(count)
            },
            effectDisplay() { return `${formatWhole(upgradeEffect('acceleron', 22))}x`},
            unlocked() { return player.entangled.points.gte(1) || isLoopFinished(2) || hasUpgrade('acceleron', this.id) }
        },
        23: {
            title: 'Subspatial Alacrity',
            description: `Increase Subspatial Foam gain by ${format(1e4)}x`,
            cost: new Decimal(2e6),
            effect: new Decimal(1e4),
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 22) || hasUpgrade('acceleron', this.id) }
        },
        24: {
            title: 'Cubic Tetration',
            description: 'Remove the ability to Acceleron reset and gain access to an additional two Entropic Loops',
            cost: new Decimal(1e8),
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 23) || hasUpgrade('acceleron', this.id) }
        },
        25: {
            title: 'Temporal Mastery',
            description: 'Unlock Inflatons',
            cost: new Decimal(1e19),
            unlocked() { return player.entangled.points.gte(1) || hasUpgrade('acceleron', 24) || hasUpgrade('acceleron', this.id) },
            onPurchase() { if (hasResearch('inflaton', 25)) player.entangled.unlocked = true }
        },


        // Enhancements
        111: createEnhancement(111, {
            title: 'Entropic Expansion',
            description: 'Increase the second Entropic Loop effect based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 0.9).times(defaultUpgradeEffect('timecube', 14)) },
            effectDisplay() { return `+${format(temp.acceleron.upgrades[111].effect)} minutes` }
        }),
        112: createEnhancement(112, {
            title: 'Entropic Construction',
            description: 'Entropic Loops build faster based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(10, Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 0.9)) }
        }),
        113: createEnhancement(113, {
            title: 'Entropic Dilation',
            description: `Increase time speed based on purchased Entropic Enhancements`,
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 0.8).plus(1) },
        }),
        121: createEnhancement(121, {
            title: 'Entropic Formation',
            description: 'Increase Foam gain based on best Accelerons',
            effect() { return Decimal.pow(fibonacciNumber(player.acceleron.best.max(0).plus(1).log10().floor()), 2.5).plus(1) },
        }),
        122: createEnhancement(122, {
            title: 'Entropic Development',
            description: 'Decrease Entropic Loop construction cost based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(0.7, fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom')))) },
        }),
        123: createEnhancement(123, {
            title: 'Entropic Acceleration',
            description: 'Increase the first Entropic Loop effect based on completed Entropic Loops',
            effect() { return Decimal.times(temp.acceleron.numFinishedLoops, 0.001) },
            effectDisplay() { return `+${format(temp.acceleron.upgrades[123].effect.times(100), 1)}% of your Acceleron prestige gain` }
        }),
        131: createEnhancement(131, {
            title: 'Entropic Extension',
            description: 'Increase Infinitesimal Foam gain based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 2).plus(1) }
        }),
        132: createEnhancement(132, {
            title: 'Entropic Configuration',
            description: 'Increase Subspatial Foam gain based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 1.75).plus(1) }
        }),
        133: createEnhancement(133, {
            title: 'Entropic Invention',
            description: 'Increase Subplanck Foam gain based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 1.5).plus(1) }
        }),
        141: createEnhancement(141, {
            title: 'Entropic Tesselation',
            description: 'Increase Time Cube gain based on best Accelerons',
            effect() { return player.acceleron.best.max(0).plus(1).log10().plus(1) }
        }),
        142: createEnhancement(142, {
            title: 'Entropic Amplification',
            description: 'Skyrmions are cheaper based on best Time Cubes',
            effect() { return Decimal.pow(0.9, fibonacciNumber(player.timecube.best.max(0).plus(1).log10().floor())) }
        }),
        143: createEnhancement(143, {
            title: 'Entropic Rotation',
            description: 'Increase Acceleron gain based on best Time Cubes',
            effect() { return player.timecube.best.max(0).plus(1).log10().plus(1) }
        }),

        114: createEnhancement(114, {
            title: 'Entropic Contraction',
            description: 'Increase Acceleron gain based on purchased Entropic Enhancements',
            effect() { return Decimal.pow(fibonacciNumber(Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))), 0.9) }
        }),
        124: createEnhancement(124, {
            title: 'Entropic Entrenchment',
            description: 'You may select an additional second row Entropic Enhancement',
            effect: 1
        }),
        134: createEnhancement(134, {
            title: 'Entropic Inversion',
            description: 'Increase Acceleron gain based on Quantum Foam',
            effect() { return player.fome.fome.quantum.points.max(0).plus(1).log10().plus(1) },
        }),
        144: createEnhancement(144, {
            title: 'Entropic Entitlement',
            description: 'Each purchased Entropic Enhancement gives 0.1 free levels to each Foam Boost',
            effect() { return Decimal.times(0.1, Decimal.add(player.acceleron.enhancements[0], buyableEffect('timecube', 'bottom'))) },
            effectDisplay() { return `${format(upgradeEffect('acceleron', 144), 1)} free levels`}
        })
    },

    clickables: {
        0: {
            display() { return getClickableState('acceleron', 0) == -1 ? "Halt Construction" : "Begin Construction" },
            canClick() {
                return Object.keys(temp.acceleron.loops).some(loop => temp.acceleron.loops[loop].unlocked && getLoopProgress(loop).lt(temp.acceleron.loops[loop].max))
                    ? true
                    : getClickableState('acceleron', this.id) < 0
            },
            onClick() {
                if (getClickableState('acceleron', 0) == -1)
                    setClickableState('acceleron', 0, 1)
                else setClickableState('acceleron', 0, -1)
            },
            style: {
                'min-height': "30px",
                width: "150px"
            }
        },
        1: {
            display: `Reset Enhancements`,
            canClick: true,
            onClick() {
                player.acceleron.upgrades = player.acceleron.upgrades.filter(id => id < 100)
                player.acceleron.enhancements = player.acceleron.enhancements.map(() => 0)
                player.acceleron.entropy = temp.acceleron.entropy
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        savePreset0: {
            display: `Save`,
            canClick: true,
            onClick() {
                player.acceleron.presets[0] = { name: player.acceleron.presetNameZero, upgrades: player.acceleron.upgrades.filter(id => id > 100) }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        savePreset1: {
            display: `Save`,
            canClick: true,
            onClick() {
                player.acceleron.presets[1] = { name: player.acceleron.presetNameOne, upgrades: player.acceleron.upgrades.filter(id => id > 100) }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        savePreset2: {
            display: `Save`,
            canClick: true,
            onClick() {
                player.acceleron.presets[2] = { name: player.acceleron.presetNameTwo, upgrades: player.acceleron.upgrades.filter(id => id > 100) }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        loadPreset0: {
            display: `Load`,
            canClick() { return player.acceleron.presets[0].upgrades.length > 0 },
            onClick() {
                clickClickable('acceleron', 1)
                for (key of player.acceleron.presets[0].upgrades) {
                    updateTemp()
                    buyUpgrade('acceleron', key)
                }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        loadPreset1: {
            display: `Load`,
            canClick() { return player.acceleron.presets[1].upgrades.length > 0 },
            onClick() {
                clickClickable('acceleron', 1)
                for (key of player.acceleron.presets[1].upgrades) {
                    updateTemp()
                    buyUpgrade('acceleron', key)
                }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        },
        loadPreset2: {
            display: `Load`,
            canClick() { return player.acceleron.presets[2].upgrades.length > 0 },
            onClick() {
                clickClickable('acceleron', 1)
                for (key of player.acceleron.presets[2].upgrades) {
                    updateTemp()
                    buyUpgrade('acceleron', key)
                }
            },
            style: {
                'min-height': "30px",
                width: "100px"
            }
        }
    },

    microtabs: {
        stuff: {
            "Milestones": {
                content: [
                    "blank",
                    "milestones"
                ]
            },
            "Entropic Loops": {
                unlocked() { return hasUpgrade('acceleron', 14) },
                content: [
                    "blank",
                    "loops",
                    "blank",
                    ["clickable", 0],
                    "blank",
                    ["display-text", () => {
                        for (let loop in temp.acceleron.loops) {
                            if (!temp.acceleron.loops[loop].unlocked) continue
                            if (isLoopFinished(loop)) continue
                            return `Construction Progress: ${formatWhole(player.acceleron.loops[loop].progress)} / ${formatWhole(temp.acceleron.loops[loop].max)}`
                        }
                        return `Construction Complete`
                    }],
                    () => {
                        for (let loop in temp.acceleron.loops) {
                            if (!temp.acceleron.loops[loop].unlocked) continue
                            if (isLoopFinished(loop)) continue
                            return ["display-text", `Construction will consume ${format(temp.acceleron.loops[loop].max.times(defaultUpgradeEffect('acceleron', 122)))} Accelerons`]
                        }
                    },
                    "blank",
                    ["display-text", () => isLoopFinished(0) ? temp.acceleron.loops[0].intervalDisplay : ''],
                    ["display-text", () => isLoopFinished(1) ? temp.acceleron.loops[1].intervalDisplay : ''],
                    ["display-text", () => isLoopFinished(2) ? temp.acceleron.loops[2].intervalDisplay : ''],
                    ["display-text", () => isLoopFinished(3) ? temp.acceleron.loops[3].intervalDisplay : ''],
                    ["display-text", () => isLoopFinished(4) ? temp.acceleron.loops[4].intervalDisplay : ''],
                    ["display-text", () => isLoopFinished(5) ? temp.acceleron.loops[5].intervalDisplay : ''],
                    "blank",
                    () => hasUpgrade('acceleron', 21) ? ["microtabs", "enhancements"] : '',
                    "blank"
                ]
            },
            "Upgrades": {
                content: [
                    "blank",
                    "upgrades"
                ]
            }
        },
        enhancements: {
            "Enhancements": {
                content: [
                    "blank",
                    ["clickable", 1],
                    "blank",
                    ["display-text", () => `You have ${formatWhole(player.acceleron.entropy)} Entropy`],
                    ["display-text", `Select one upgrade from each row. Certain upgrades may allow you to select more`],
                    ["display-text", `Each purchased Enhancement increases the cost of the others`],
                    "blank",
                    ["column", [
                        ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113], ["upgrade", 114]]],
                        ["row", [["upgrade", 121], ["upgrade", 122], ["upgrade", 123], ["upgrade", 124]]],
                        ["row", [["upgrade", 131], ["upgrade", 132], ["upgrade", 133], ["upgrade", 134]]],
                        ["row", [["upgrade", 141], ["upgrade", 142], ["upgrade", 143], ["upgrade", 144]]],
                    ]]
                ]
            },
            "Presets": {
                content: [
                    "blank",
                    ["component-table", [
                        [
                            ["column", [
                                ["strict-text-input", "presetNameZero"],
                                ["row", [["clickable", "savePreset0"], ["clickable", "loadPreset0"]]]
                            ]],
                            ["blank", ["30px", "8px"]],
                            ["column", [
                                ["strict-text-input", "presetNameOne"],
                                ["row", [["clickable", "savePreset1"], ["clickable", "loadPreset1"]]]
                            ]],
                            ["blank", ["30px", "8px"]],
                            ["column", [
                                ["strict-text-input", "presetNameTwo"],
                                ["row", [["clickable", "savePreset2"], ["clickable", "loadPreset2"]]]
                            ]]
                        ],
                        [
                            ["display-text", () => `Preset One: ${player.acceleron.presets[0].upgrades.length > 0 ? 'Saved' : 'Empty'}`], '',
                            ["display-text", () => `Preset Two: ${player.acceleron.presets[1].upgrades.length > 0 ? 'Saved' : 'Empty'}`], '',
                            ["display-text", () => `Preset Three: ${player.acceleron.presets[2].upgrades.length > 0 ? 'Saved' : 'Empty'}`],
                        ],
                        [
                            ["display-text", () => `<b>${player.acceleron.presets[0].name}</b>`], '',
                            ["display-text", () => `<b>${player.acceleron.presets[1].name}</b>`], '',
                            ["display-text", () => `<b>${player.acceleron.presets[2].name}</b>`]
                        ]
                    ]],
                    ["blank", "500px"],
                    "blank"
                ]
            }
        }
    },

    tabFormat: [
        "main-display",
        () => hasUpgrade('acceleron', 24) ? '' : "prestige-button",
        "resource-display",
        "blank",
        ["microtabs", "stuff"]
    ],

    hotkeys: [
        {
            key: "a",
            description() { if (!hasUpgrade('acceleron', 24)) return "A: Form your Quantum Foam into Accelerons" },
            onPress() { if (canReset('acceleron')) doReset('acceleron') }
        },
        {
            key: "ctrl+a",
            onPress() { if (temp.acceleron.layerShown === true) player.tab = 'acceleron' }
        }
    ]
})

function getLoopProgress(id) { return player.acceleron.loops[id].progress }

function isLoopFinished(id) { return player.acceleron.loops[id] ? player.acceleron.loops[id].progress.gte(temp.acceleron.loops[id].max) : false }

function updateLoopInterval(id, delta) {
	let loop = layers.acceleron.loops[id]
	let data = player.acceleron.loops[id]
	if (loop.intervalEffect) {
		data.interval = data.interval.plus(delta)
		let numIntervals = data.interval.dividedBy(loop.duration).floor()
        if (numIntervals.gte(1)) {
		    data.interval = data.interval.minus(numIntervals.times(loop.duration))
		    loop.intervalEffect(numIntervals)
        }
	}
}

function fibonacciNumber(index) {
    return phi.pow(index).minus(decimalOne.minus(phi).pow(index)).div(sqrt5)
}

function createEnhancement(id, data) {
    data.currencyDisplayName = 'Entropy',
    data.currencyInternalName = 'entropy',
    data.currencyLayer = 'acceleron'

    let row = ~~((id-100)/10)
    data.onPurchase = () => {
        player.acceleron.enhancements[0]++
        player.acceleron.enhancements[row]++
    }

    if (data.cost === undefined)
        data.cost = () => fibonacciNumber(player.acceleron.enhancements[0]).round()

    if (data.unlocked === undefined) {
        let upgrade = id%10 === 4 ? ['timecube', 25] : ['acceleron', 21]
        data.unlocked = () => player.tab === 'acceleron' && hasUpgrade(upgrade[0], upgrade[1]) && isLoopFinished(row-1) && (hasUpgrade('acceleron', id) || player.acceleron.enhancements[row] < temp.acceleron.enhancements[row])
    }

    if (data.effectDisplay === undefined)
        data.effectDisplay = () => `${format(temp.acceleron.upgrades[id].effect)}x`

    return data
}