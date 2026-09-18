addLayer("inflaton", {
    name: "Inflaton",
    symbol: "I",
    row: 2,
    position: 2,
    branches: ['fome'],

    layerShown() { return temp.inflaton.paused ? false : ((player.inflaton.unlockOrder > 0 && !hasUpgrade('acceleron', 25)) ? "ghost" : player.inflaton.unlocked) },
    paused() { return player.universeTab !== "none" },
    resource() { return player[this.layer].points.equals(1) ? "Inflaton" : "Inflatons" },
    color: "#ff5e13",
    type: "static",
    baseResource: "Quantum Foam",
    baseAmount() { return player.fome.fome.quantum.points },
    requires() { return player.inflaton.unlockOrder > 0 ? new Decimal(1e50) : new Decimal(1e12) },
    canBuyMax() { return false },
    base: 1e308,
    exponent: 1e308,
    doReset(layer) {
        switch (layer) {
            case "entangled":
                let upgradeKeep = []
                for (id of [13,23,31,32,33])
                    if (hasUpgrade('inflaton', id))
                        upgradeKeep.push(id)
                let researchKeep = []
                if (hasMilestone('entangled', 2))
                    for (id of [12,23])
                        if (hasResearch('inflaton', id))
                            researchKeep.push(id)

                layerDataReset('inflaton')
                player.inflaton.inflating = false
                player.inflaton.size = decimalZero
                player.inflaton.maxSize = decimalZero
                player.inflaton.researchProgress = decimalZero
                player.inflaton.researchQueue = []
                player.inflaton.research = []
                player.inflaton.repeatables = {}
                player.inflaton.autoBuild = false
                player.inflaton.autoResearch = false
                player.subtabs.inflaton.stuff = "Upgrades"

                player.inflaton.points = decimalOne
                player.inflaton.unlocked = true

                upgradeKeep.forEach(id => buyUpgrade('inflaton', id))
                researchKeep.forEach(id => player.inflaton.research.push(id))
                break
            default:
        }

        if (!player.inflaton.inflating && !inChallenge('inflaton', 11)) {
            if (!hasMilestone('entangled', 0) && player.acceleron.unlockOrder === 0 && player.inflaton.unlockOrder === 0)
                player.acceleron.unlockOrder = 1
        }
    },

    startData() { return {
        unlocked: false,
        points: decimalZero,
        best: decimalZero,
        unlockOrder: 0,

        inflating: false,
        size: decimalZero,
        maxSize: decimalZero,

        researchProgress: decimalZero,
        researchQueue: [],
        research: [],
        repeatables: {},
        upgradeCosts: {
            13: new Decimal(2),
            23: new Decimal(2),
            31: new Decimal(2),
            32: new Decimal(2),
            33: new Decimal(2)
        },

        autoBuild: false,
        autoResearch: false
    }},

    automate() {
        if (player.inflaton.autoBuild && hasResearch('inflaton', 24))
            Object.keys(player.inflaton.buyables).forEach(id => buyBuyable('inflaton', id))
        if (player.inflaton.autoResearch && Object.keys(player.inflaton.repeatables).length > 0) {
            if (temp.inflaton.research[113].canResearch && player.inflaton.researchQueue.length < temp.inflaton.queueSize && !player.inflaton.researchQueue.includes('113') && (player.inflaton.researchQueue.length === 0 || temp.inflaton.research[player.inflaton.researchQueue[0]].repeatable)) {
                if (Object.keys(player.inflaton.repeatables).map(key => [key, layers.inflaton.research[key].cost(researchLevel('inflaton', key))]).reduce((a,b) => a[1].lt(b[1]) ? a : b)[0] == '113') {
                    player.inflaton.researchQueue.unshift('113')
                }
            }
            if (player.inflaton.researchQueue.length == 0) {
                let availableResearch = Object.keys(player.inflaton.repeatables)
                                            .filter(id => temp.inflaton.research[id].canResearch === undefined || temp.inflaton.research[id].canResearch)
                                            .filter(id => layers.inflaton.research[id].cost(researchLevel('inflaton', id)).lt(Decimal.dInf))
                if (availableResearch.length > 0)
                    player.inflaton.researchQueue.push(
                        availableResearch.map(id => [id, layers.inflaton.research[id].cost(researchLevel('inflaton', id))])
                                        .reduce((a,b) => a[1].gt(b[1]) ? b : a)[0]
                    )
            }
        }
        if (player.inflaton.researchQueue[0] === '113' && !temp.inflaton.clickables[3].canClick) {
            player.inflaton.researchQueue.shift()
            player.inflaton.researchProgress = decimalZero
        }
    },

    nerf() {
        let log = player.inflaton.points.max(1).log10()
        if (player.inflaton.inflating || !hasResearch('inflaton', 20)) log = log.times(buyableEffect('inflaton', 11))
        return Decimal.pow(2, log)
    },
    gain() {
        let exp = player.inflaton.points.max(1).log10().plus(1).dividedBy(10)
        let gain = player.inflaton.points.times(Decimal.pow(2, exp))
        return gain.layer >= 3
            ? Decimal.fromComponents(gain.sign, gain.layer, gain.mag * 1.000000000000001)
            : gain
    },
    researchGain() {
        let researchGain = buyableEffect('inflaton', 12)
        if (hasResearch('inflaton', 5)) researchGain = researchGain.times(researchEffect('inflaton', 5))
        researchGain = researchGain.times(buyableEffect('skyrmion', 141))
        return researchGain
    },
    effect() {
        if (player.inflaton.inflating || (hasResearch('inflaton', 17) && player.inflaton.points.lt(temp.inflaton.storage))) {
            return {
                gain: temp.inflaton.gain,
                nerf: temp.inflaton.nerf
            }
        }
        return {
            gain: decimalZero,
            nerf: decimalOne
        }
    },
    effectDescription() {
        if (!player.inflaton.inflating && hasResearch('inflaton', 4))
            return `<br>which ${player.inflaton.points.eq(1) ? `is` : `are`} increasing Foam generation by <span style='color:${layers.inflaton.color};text-shadow:${layers.inflaton.color} 0px 0px 10px;'>${formatWhole(temp.fome.effect.inflaton)}x</span>`
        else if (temp.inflaton.nerf.lt(1.5))
            return `<br>which ${player.inflaton.points.eq(1) ? `is` : `are`} dividing all other resources by <span style='color:${layers.inflaton.color};text-shadow:${layers.inflaton.color} 0px 0px 10px;'>${formatWhole(temp.inflaton.effect.nerf)}x</span> (currently <span style='color:${layers.inflaton.color};text-shadow:${layers.inflaton.color} 0px 0px 10px;'>${formatSmall(player.inflaton.points.max(1).log10().times(buyableEffect('inflaton', 11)))}x</span>)`
        return `<br>which ${player.inflaton.points.eq(1) ? `is` : `are`} dividing all other resources by <span style='color:${layers.inflaton.color};text-shadow:${layers.inflaton.color} 0px 0px 10px;'>${formatWhole(temp.inflaton.effect.nerf)}x</span>`
    },
    size() {
        if (player.inflaton.points.lt(1)) return decimalZero

        let size = player.inflaton.points.max(2).log2().log2()
        if (hasResearch('inflaton', 2)) size = size.times(2)
        if (hasResearch('inflaton', 8)) size = size.times(2)
        size = size.times(repeatableEffect('inflaton', 111))
        size = softcap(size, new Decimal(6.187e10), 0.1)

        size = size.times(buyableEffect('timecube', 'top'))

        size = size.div(getTimelineEffect('top')).times(getTimelineBonus('top').plus(1))
        return size
    },
    storage() {
        let base = decimalOne
        if (hasResearch('inflaton', 4)) base = base.times(buyableEffect('inflaton', 13))
        return base
    },

    update(delta) {
        let max = new Decimal('10^^1e308')

        let effect = temp.inflaton.effect
        
        if (effect.gain.lt(max)) player.inflaton.points = player.inflaton.points.plus(effect.gain.times(delta))
        else player.inflaton.points = max

        if (player.inflaton.points.gt(player.inflaton.best)) player.inflaton.best = player.inflaton.points

        if (inChallenge('inflaton', 11)) {
            let individualNerfs = { pion: defaultUpgradeEffect('timecube', 42, decimalOne).reciprocate(), spinor: defaultUpgradeEffect('timecube', 42, decimalOne).reciprocate() }
            for (fomeType of fomeTypes) individualNerfs[fomeType] = decimalOne
            if (hasResearch('inflaton', 7)) individualNerfs.quantum = individualNerfs.quantum.times(researchEffect('inflaton', 7))
            if (hasResearch('inflaton', 14)) individualNerfs.quantum = individualNerfs.quantum.times(researchEffect('inflaton', 14))
    
            let fomeNerf = effect.nerf
            if (hasResearch('inflaton', 4)) fomeNerf = fomeNerf.dividedBy(researchEffect('inflaton', 4)).max(1)
            if (hasResearch('inflaton', 11)) fomeNerf = fomeNerf.dividedBy(researchEffect('inflaton', 11)).max(1)
            if (hasResearch('inflaton', 18)) fomeNerf = fomeNerf.dividedBy(researchEffect('inflaton', 18)).max(1)
            fomeNerf = fomeNerf.dividedBy(repeatableEffect('inflaton', 115))
            for (fomeType of fomeTypes) {
                player.fome.fome[fomeType].points = player.fome.fome[fomeType].points.dividedBy(fomeNerf.times(individualNerfs[fomeType]).max(1))
            }
            player.skyrmion.pion.points = player.skyrmion.pion.points.dividedBy(effect.nerf.times(individualNerfs.pion).max(1))
            player.skyrmion.spinor.points = player.skyrmion.spinor.points.dividedBy(effect.nerf.times(individualNerfs.spinor).max(1))
            if (player.inflaton.unlockOrder > 0) {
                player.acceleron.points = player.acceleron.points.dividedBy(effect.nerf)
                player.timecube.points = player.timecube.points.dividedBy(effect.nerf)
            }
    
            temp.inflaton.size = layers.inflaton.size()
            if (temp.inflaton.size.gt(player.inflaton.maxSize))
                player.inflaton.maxSize = temp.inflaton.size;
            
            for (fomeType of fomeTypes)
                if (player.fome.fome[fomeType].points.lt(1)) {
                    startChallenge('inflaton', 11)
                    return
                }
            if (player.skyrmion.pion.points.lt(1)) {
                startChallenge('inflaton', 11)
                return
            }
            if (player.skyrmion.spinor.points.lt(1)) {
                startChallenge('inflaton', 11)
                return
            }
        }
        else {
            if (player.inflaton.points.gt(temp.inflaton.storage))
                player.inflaton.points = temp.inflaton.storage
        }

        if (player.inflaton.researchQueue.length > 0) {
            player.inflaton.researchProgress = player.inflaton.researchProgress.plus(temp.inflaton.researchGain.minus(buyableEffect('inflaton', 14).cost).times(delta))
            let id = player.inflaton.researchQueue[0]
            let cost = temp.inflaton.research[id].repeatable ? layers.inflaton.research[id].cost(researchLevel('inflaton', id)) : temp.inflaton.research[id].cost
            if (player.inflaton.researchProgress.gte(cost)) {
                player.inflaton.researchQueue.shift()
                if (temp.inflaton.research[id].repeatable && temp.inflaton.research[id].canResearch)
                    player.inflaton.repeatables[id] = Decimal.add(player.inflaton.repeatables[id], 1)
                else player.inflaton.research.push(id)
                player.inflaton.researchProgress = decimalZero
                run(temp.inflaton.research[id].onComplete, temp.inflaton.research[id])
            }
        }
    },

    challenges: {
        rows: 1,
        cols: 1,
        11: {
            name: "INFLATE",
            challengeDescription: "<i>Survive</i><br/>",
            goalDescription: `Surpass the heat death of the universe`,
            canComplete() { return false },
            rewardDescription: `Begin anew`,
            unlocked() { return player.inflaton.points.lte(temp.inflaton.storage) || inChallenge('inflaton', this.id) },
            onEnter() {
                player.inflaton.inflating = true
                if (hasResearch('inflaton', 21)) player.inflaton.points = buyableEffect('inflaton', 11).recip().div(10).pow10()
                else player.inflaton.points = player.inflaton.points.plus(1)
            },
            onExit() {
                player.inflaton.inflating = false
                player.inflaton.points = temp.inflaton.storage.min(player.inflaton.points)
            },
            onComplete() {
                this.onExit()
            },
            style: {
                width: "300px",
                height: "225px"
            }
        }
    },

    upgrades: {
        11: {
            title: 'Subspatial Field Stabilizers',
            description: 'Allow the creation of Subspatial Structures',
            cost() { return player.inflaton.unlockOrder > 0 ? new Decimal(5e46) : new Decimal(5e13) },
            currencyDisplayName: 'Quantum Foam',
            currencyInternalName: 'points',
            currencyLocation() { return player.fome.fome.quantum },
            unlocked() { return  hasMilestone('entangled', 1) || hasUpgrade('inflaton', 11) || !player.inflaton.inflating }
        },
        12: {
            title: 'Quantum Field Investigations',
            description: `Stabilization isn't enough. Maybe the constant bubbling of the quantum field may hold the secret to sustaining inflation`,
            cost() { return player.inflaton.unlockOrder > 0 ? new Decimal(1e47) : new Decimal(1e14) },
            currencyDisplayName: 'Quantum Foam',
            currencyInternalName: 'points',
            currencyLocation() { return player.fome.fome.quantum },
            unlocked() { return hasMilestone('entangled', 1) || hasUpgrade('inflaton', 12) || (!player.inflaton.inflating && player.inflaton.maxSize.gt(player.inflaton.unlockOrder > 0 ? 9 : 7.01) && hasUpgrade('inflaton', 11)) }
        },
        21: {
            title: 'Dynamic Inflational Formation',
            description: `Generate more Foam based on the size of your universe`,
            cost() { return player.inflaton.unlockOrder > 0 ? new Decimal(1e58) : new Decimal(1e25) },
            effect() { return player.inflaton.maxSize.max(1) },
            effectDisplay() { return `${format(upgradeEffect('inflaton', 21))}x` },
            currencyDisplayName: 'Quantum Foam',
            currencyInternalName: 'points',
            currencyLocation() { return player.fome.fome.quantum },
            unlocked() { return hasMilestone('entangled', 1) || hasUpgrade('inflaton', 21) || (!player.inflaton.inflating && hasResearch('inflaton', 9)) }
        },
        22: {
            title: 'Micro-inflational Subsystems',
            description: `Gain a new Pion and Spinor Upgrade`,
            cost() { return player.inflaton.unlockOrder > 0 ? new Decimal(1e60) : new Decimal(1e27) },
            currencyDisplayName: 'Quantum Foam',
            currencyInternalName: 'points',
            currencyLocation() { return player.fome.fome.quantum },
            unlocked() { return hasMilestone('entangled', 1) || hasUpgrade('inflaton', 22) || (!player.inflaton.inflating && hasResearch('inflaton', 9)) }
        },

        31: {
            title: 'Technological Ascendency (tbd)',
            description: 'You have shown mastery over space and time, at least individually. Together though, there are more secrets to unlock',
            cost() { return player.inflaton.upgradeCosts[31] },
            currencyDisplayName: 'Entangled Strings',
            currencyInternalName: 'points',
            currencyLayer: 'entangled',
            unlocked() { return hasUpgrade('inflaton', 31) || hasMilestone('entangled', 1) },
            canAfford() { return false },//player.entangled.points.gte(temp.inflaton.upgrades[this.id].cost) },
            pay() {
                if (!hasUpgrade('inflaton', 32)) player.inflaton.upgradeCosts[32] = player.inflaton.upgradeCosts[32].plus(1)
                if (!hasUpgrade('inflaton', 33)) player.inflaton.upgradeCosts[33] = player.inflaton.upgradeCosts[33].plus(1)
                if (!hasUpgrade('inflaton', 23)) player.inflaton.upgradeCosts[23] = player.inflaton.upgradeCosts[23].plus(1)
                if (!hasUpgrade('inflaton', 13)) player.inflaton.upgradeCosts[13] = player.inflaton.upgradeCosts[13].plus(1)
            }
        },
        32: {
            title: 'Tetradimensional Engineering (tbd)',
            description: 'Application of structural ideas gained from Entropic Loops may give rise to a powerful new sector of exploration and progress',
            cost() { return player.inflaton.upgradeCosts[32] },
            currencyDisplayName: 'Entangled Strings',
            currencyInternalName: 'points',
            currencyLayer: 'entangled',
            unlocked() { return hasUpgrade('inflaton', 32) || hasMilestone('entangled', 1) },
            canAfford() { return false },//player.entangled.points.gte(temp.inflaton.upgrades[this.id].cost) },
            pay() {
                if (!hasUpgrade('inflaton', 31)) player.inflaton.upgradeCosts[31] = player.inflaton.upgradeCosts[31].plus(1)
                if (!hasUpgrade('inflaton', 33)) player.inflaton.upgradeCosts[33] = player.inflaton.upgradeCosts[33].plus(1)
                if (!hasUpgrade('inflaton', 23)) player.inflaton.upgradeCosts[23] = player.inflaton.upgradeCosts[23].plus(1)
                if (!hasUpgrade('inflaton', 13)) player.inflaton.upgradeCosts[13] = player.inflaton.upgradeCosts[13].plus(1)
            }
        },
        33: {
            title: 'Architectural Renaissance (tbd)',
            description: 'Look to the past, and see what glories the future may hold',
            cost() { return player.inflaton.upgradeCosts[33] },
            currencyDisplayName: 'Entangled Strings',
            currencyInternalName: 'points',
            currencyLayer: 'entangled',
            unlocked() { return hasUpgrade('inflaton', 33) || hasMilestone('entangled', 1) },
            canAfford() { return false },//player.entangled.points.gte(temp.inflaton.upgrades[this.id].cost) },
            pay() {
                if (!hasUpgrade('inflaton', 31)) player.inflaton.upgradeCosts[31] = player.inflaton.upgradeCosts[31].plus(1)
                if (!hasUpgrade('inflaton', 32)) player.inflaton.upgradeCosts[32] = player.inflaton.upgradeCosts[32].plus(1)
                if (!hasUpgrade('inflaton', 23)) player.inflaton.upgradeCosts[23] = player.inflaton.upgradeCosts[23].plus(1)
                if (!hasUpgrade('inflaton', 13)) player.inflaton.upgradeCosts[13] = player.inflaton.upgradeCosts[13].plus(1)
            }
        },
        23: {
            title: 'Enigmatic Engineering',
            description: 'Time Cubes seem helpful, but limited in power. Maybe your newfound mastery over space and time can reveal more of their secrets',
            cost() { return player.inflaton.upgradeCosts[23] },
            currencyDisplayName: 'Entangled Strings',
            currencyInternalName: 'points',
            currencyLayer: 'entangled',
            unlocked() { return hasUpgrade('inflaton', 23) || hasMilestone('entangled', 1) },
            canAfford() { return player.entangled.points.gte(temp.inflaton.upgrades[this.id].cost) },
            pay() {
                if (!hasUpgrade('inflaton', 31)) player.inflaton.upgradeCosts[31] = player.inflaton.upgradeCosts[31].plus(1)
                if (!hasUpgrade('inflaton', 32)) player.inflaton.upgradeCosts[32] = player.inflaton.upgradeCosts[32].plus(1)
                if (!hasUpgrade('inflaton', 33)) player.inflaton.upgradeCosts[33] = player.inflaton.upgradeCosts[33].plus(1)
                if (!hasUpgrade('inflaton', 13)) player.inflaton.upgradeCosts[13] = player.inflaton.upgradeCosts[13].plus(1)
            }
        },
        13: {
            title: 'Grasp the Void',
            description: 'You have long since extracted all you can from your Skyrmions, but new insights show there may be more yet to gain',
            cost() { return player.inflaton.upgradeCosts[13] },
            currencyDisplayName: 'Entangled Strings',
            currencyInternalName: 'points',
            currencyLayer: 'entangled',
            unlocked() { return hasUpgrade('inflaton', 13) || hasMilestone('entangled', 1) },
            canAfford() { return player.entangled.points.gte(temp.inflaton.upgrades[this.id].cost) },
            pay() {
                if (!hasUpgrade('inflaton', 31)) player.inflaton.upgradeCosts[31] = player.inflaton.upgradeCosts[31].plus(1)
                if (!hasUpgrade('inflaton', 32)) player.inflaton.upgradeCosts[32] = player.inflaton.upgradeCosts[32].plus(1)
                if (!hasUpgrade('inflaton', 33)) player.inflaton.upgradeCosts[33] = player.inflaton.upgradeCosts[33].plus(1)
                if (!hasUpgrade('inflaton', 23)) player.inflaton.upgradeCosts[23] = player.inflaton.upgradeCosts[23].plus(1)
            }
        }
    },

    buyables: {
        respec() {
            Object.keys(player.inflaton.buyables).forEach(id => player.inflaton.buyables[id] = decimalZero)
            player.inflaton.size = decimalZero
        },
        respecConfirm: false,
        11: createInflatonBuilding(11, {
            title: 'M-field Condenser',
            description: 'Slightly reduce the loss of resources to Inflation',
            effect(amount) {
                if (hasResearch('inflaton', 1)) amount = amount.times(researchEffect('inflaton', 1))
                if (hasResearch('inflaton', 19)) amount = amount.times(researchEffect('inflaton', 19).gain)
                amount = amount.times(buyableEffect('inflaton', 14).gain)
                return Decimal.pow(0.975, amount)
            },
            effectDisplay(effect) { return `${formatSmall(effect)}x` },
            cost() { return [player.inflaton.unlockOrder > 0 ? 1e82 : 1e30, 1.1] },
            currencyDisplayName: 'Subspatial Foam',
            currencyLocation() { return player.fome.fome.subspatial },
            size() {
                let size = decimalOne
                if (hasResearch('inflaton', 19)) size = size.times(researchEffect('inflaton', 19).size)
                size = size.times(repeatableEffect('inflaton', 113).size)
                return size
            },
            unlocked() { return hasUpgrade('inflaton', 11) }
        }),
        12: createInflatonBuilding(12, {
            title: 'Quantum Flux Analyzer',
            description: 'Study fluctuations in the quantum field',
            effect(amount) {
                if (hasResearch('inflaton', 19)) amount = amount.times(researchEffect('inflaton', 19).gain)
                return amount
            },
            effectDisplay() { return `+${formatWhole(temp.inflaton.researchGain)} research points/s` },
            cost() { return [player.inflaton.unlockOrder > 0 ? 1e82 : 1e30, hasResearch('inflaton', 3) ? 1.5 : 15] },
            currencyDisplayName: 'Subspatial Foam',
            currencyLocation() { return player.fome.fome.subspatial },
            size() {
                let size = decimalOne
                if (hasResearch('inflaton', 19)) size = size.times(researchEffect('inflaton', 19).size)
                size = size.times(repeatableEffect('inflaton', 113).size)
                return size
            },
            unlocked() { return hasUpgrade('inflaton', 12) }
        }),
        13: createInflatonBuilding(13, {
            title: 'Inflaton Containment Unit',
            description: 'Specialized storage facilities designed to keep Inflatons separated and inert',
            effect(amount) {
                if (hasResearch('inflaton', 19)) amount = amount.times(researchEffect('inflaton', 19).gain)
                return Decimal.pow(500, amount.dividedBy(3))
            },
            effectDisplay(effect) { return `Store ${formatWhole(effect)}x more Inflatons`},
            cost() { return [player.inflaton.unlockOrder > 0 ? 1e48 : 1e15, 1.2] },
            currencyDisplayName: 'Quantum Foam',
            currencyLocation() { return player.fome.fome.quantum },
            size() {
                let size = new Decimal(3)
                if (hasResearch('inflaton', 19)) size = size.times(researchEffect('inflaton', 19).size)
                size = size.times(repeatableEffect('inflaton', 113).size)
                return size
            },
            unlocked() { return hasResearch('inflaton', 6) }
        }),
        14: createInflatonBuilding(14, {
            title: 'Active Redistribution Center',
            description: 'Tune your M-field Condensers with continuous analysis of inflation patterns',
            effect(amount) {
                let gain = amount.times(0.01).plus(1)
                let cost = amount

                let capacity = temp.inflaton.researchGain
                if (cost.gt(capacity)) {
                    gain = gain.times(capacity).dividedBy(cost)
                    cost = capacity
                }
                return { gain: gain, cost: cost }
            },
            effectDisplay(effect) { return `${format(effect.gain)}x<br><b>Consumes:</b> ${format(effect.cost)} Research/sec` },
            cost() { return [player.inflaton.unlockOrder > 0 ? 1e92 : 1e40, 1.5] },
            currencyDisplayName: 'Subspatial Foam',
            currencyLocation() { return player.fome.fome.subspatial },
            size() {
                let size = new Decimal(1)
                if (hasResearch('inflaton', 19)) size = size.times(researchEffect('inflaton', 19).size)
                size = size.times(repeatableEffect('inflaton', 113).size)
                return size
            },
            unlocked() { return hasResearch('inflaton', 16)}
        })
    },

    queueSize() {
        let size = 1
        if (hasResearch('inflaton', 12)) size += researchEffect('inflaton', 12)
        if (hasResearch('inflaton', 23)) size += researchEffect('inflaton', 23)
        return size
    },
    research: {
        1: {
            title: 'Branon Induction Phases',
            description: 'Quintuple the effect of M-field Condensers',
            cost: new Decimal(75),
            effect: new Decimal(5),
            row: 1,
            pos: 1
        },
        2: {
            title: 'Banach-Tarski Point Manipulation',
            description: 'You can stabilize the universe at double the size',
            cost: new Decimal(100),
            effect: new Decimal(2),
            requires: [1],
            row: 2,
            pos: 1
        },
        3: {
            title: 'Subspatial Binding Constants',
            description: 'Reduce the cost scaling of Quantum Flux Analyzers',
            cost: new Decimal(100),
            requires: [1],
            row: 2,
            pos: 2
        },
        4: {
            title: 'Counter-Inflational Cycles',
            description: 'Gain up to 1e6x more Foam, based on your current Inflatons',
            cost: new Decimal(500),
            effect: new Decimal(1e6),
            requires: [2],
            row: 3,
            pos: 1
        },
        5: {
            title: 'Distributed Analysis Framework',
            description: () => `Increase Research Point gain by 10% per ℓ<sub>P</sub> of Quantum Flux Analyzers, up to a cap of ${format(temp.inflaton.research[5].limit)}x`,
            cost: new Decimal(1500),
            effect() { return Decimal.pow(1.1, getBuyableAmount('inflaton', 12)).min(temp.inflaton.research[5].limit) },
            limit() { return repeatableEffect('inflaton', 112).times(1.8) },
            requires: [2, 3],
            row: 3,
            pos: 2
        },
        6: {
            title: 'Inflaton Containment Strategies',
            description: 'Allow construction of Inflaton Containment Units',
            cost: new Decimal(500),
            requires: [3],
            row: 3,
            pos: 3
        },
        7: {
            title: 'Quantum Phasor Coherence',
            description: 'Halve the effect of inflation on Quantum Foam',
            cost: new Decimal(750),
            effect: new Decimal(0.5),
            requires: [4],
            row: 4,
            pos: 1
        },
        8: {
            title: 'Von Neumann Transformation',
            description: 'Double the size of the universe, again',
            cost: new Decimal(750),
            requires: [4],
            row: 4,
            pos: 2
        },
        9: {
            title: 'Quantum Inflationo-dynamics',
            description: 'Unlock two Inflaton upgrades',
            cost: new Decimal(750),
            requires: [6],
            row: 4,
            pos: 3
        },
        10: {
            title: 'Superstructural Stability Patterns',
            description: 'Enable individual building respecs',
            cost: new Decimal(750),
            requires: [6],
            row: 4,
            pos: 4
        },
        11: {
            title: 'Scatter-field Repulsion',
            description: 'Retain an additional 1e12x more Foam, based on your current Inflatons',
            cost: new Decimal(1500),
            effect: new Decimal(1e12),
            requires: [7, 9],
            row: 5,
            pos: 1
        },
        12: {
            title: 'Scheduled Itemization',
            description: 'You can queue up to 2 additional researches',
            cost: new Decimal(10000),
            effect: 2,
            requires: [5],
            row: 5,
            pos: 2
        },
        13: {
            title: 'Enhanced Isolation Protocols',
            description: 'Improve the Inflaton Containment Unit storage capabilities',
            cost: new Decimal(1500),
            requires: [10],
            row: 5,
            pos: 3
        },
        14: {
            title: 'Aggressive Flow Diffusion',
            description: 'Halve the effect of inflaton on Quantum Foam, again',
            cost: new Decimal(6000),
            effect: new Decimal(0.5),
            requires: [7, 11],
            row: 6,
            pos: 1
        },
        15: {
            title: 'Infinite Expansion Theories',
            description: 'Unlock two repeatable researches',
            cost: new Decimal(6000),
            requires: [8],
            row: 6,
            pos: 2
        },
        16: {
            title: 'Active Restoration Protocols',
            description: 'Allow the construction of Active Redistribution Centers',
            cost: new Decimal(15000),
            requires: [12, 13],
            row: 6,
            pos: 3
        },
        17: {
            title: 'Inflationary Tolerances',
            description: 'Allow stored Inflatons to inflate to fill your storage',
            cost: new Decimal(6000),
            requires: [10, 13],
            row: 6,
            pos: 4
        },
        18: {
            title: 'Scalar Flux Reduction',
            description: 'Retain yet another 1e12 Foam, based on your current Inflatons',
            cost: new Decimal(9000),
            effect: new Decimal(1e12),
            requires: [14, 15],
            row: 7,
            pos: 1  
        },
        19: {
            title: 'Macroscale Synergies',
            description: 'Increase subspace building size tenfold, and increase their effects by twice as much',
            onComplete() { layers.inflaton.buyables.respec() },
            cost: new Decimal(25000),
            effect() { return { size: new Decimal(10), gain: new Decimal(2) } },
            requires: [14, 15, 16],
            row: 7,
            pos: 2
        },
        20: {
            title: 'Secondary Isolation Standards',
            description: 'M-field Condensers no longer reduce the effect of stored Inflatons',
            cost: new Decimal(25000),
            requires: [16],
            row: 7,
            pos: 3
        },
        21: {
            title: 'Instantaneous Limit Testing',
            description: `Beginning to Inflate places you at the limit of your M-field Condenser's safe operation`,
            cost: new Decimal(25000),
            requires: [16, 17],
            row: 7,
            pos: 4
        },
        22: {
            title: 'Sustainable Expansion Hypotheses',
            description: 'Unlock three more repeatable research projects',
            cost: new Decimal(100000),
            requires: [18, 19],
            row: 8,
            pos: 1
        },
        23: {
            title: 'Static Proposal Induction',
            description: 'Increase the research queue size by another 2',
            cost: new Decimal(100000),
            effect: 2,
            requires: [12, 15],
            row: 8,
            pos: 2
        },
        24: {
            title: 'Mechanized Superscale Subsystems',
            description: 'Automatically build subspace buildings, and building them no longer consumes Foam',
            cost: new Decimal(100000),
            requires: [20, 21],
            row: 8,
            pos: 3
        },
        25: {
            title: 'Spatial Mastery',
            description: 'Unlock Accelerons',
            cost: new Decimal(750000),
            onComplete() { if (hasUpgrade('acceleron', 25)) player.entangled.unlocked = true },
            requires: [22, 23, 24],
            row: 9,
            pos: 1
        },

        111: {
            title: 'Repeatable: Eternal Inflation',
            description: 'Double the size of your universe',
            cost(amount) { return Decimal.gte(amount, 3998) ? Decimal.dInf : Decimal.pow(4, amount).times(12000).div(buyableEffect('skyrmion', 241)) },
            effect(amount) { return Decimal.pow(2, amount) },
            effectDisplay(effect) { return `${formatWhole(effect)}x` },
            unlocked() { return hasResearch('inflaton', 15) },
            canResearch: true,
            repeatable: true,
            row: 0,
            pos: 1
        },
        112: {
            title: 'Repeatable: Perpetual Testing',
            description: "Increase Distributed Analysis Framework's maximum Analyzer limit by 80%",
            cost(amount) { return Decimal.gte(amount, 3998) ? Decimal.dInf : Decimal.pow(8, amount).times(15000).div(buyableEffect('skyrmion', 241)) },
            effect(amount) { return Decimal.pow(1.8, amount) },
            effectDisplay(effect) { return `*${formatLength(effect)}` },
            unlocked() { return hasResearch('inflaton', 15) },
            canResearch: true,
            repeatable: true,
            row: 0,
            pos: 2
        },
        113: {
            title: 'Repeatable: Subspacial Construction',
            description: 'Increase subspace building size tenfold, and increase their effects by twice as much',
            cost(amount) { return Decimal.gte(amount, 3998) ? Decimal.dInf : Decimal.pow(200, amount).times(150000).div(buyableEffect('skyrmion', 241)).div(buyableEffect('timecube', 'left')) },
            effect(amount) { return { size: Decimal.pow(10, amount), gain: Decimal.pow(2, amount) } },
            effectDisplay(effect) { return `${formatWhole(effect.size)}x, ${formatWhole(effect.gain.times(effect.size))}x` },
            onComplete() { layers.inflaton.buyables.respec() },
            canResearch() { return Object.keys(player.inflaton.buyables).map(id => player.inflaton.buyables[id].div(temp.inflaton.buyables[id].size).gte(10)).reduce((a,b) => a && b) },
            unlocked() { return hasResearch('inflaton', 22) },
            repeatable: true,
            row: 0,
            pos: 3
        },
        114: {
            title: 'Repeatable: Efficient Design',
            description: 'Decrease Subspace building cost scaling by 1.5x',
            cost(amount) { return Decimal.gte(amount, 3998) ? Decimal.dInf : Decimal.pow(3, amount).times(120000).div(buyableEffect('skyrmion', 241)) },
            effect(amount) { return Decimal.pow(1.5, amount) },
            effectDisplay(effect) { return `1/${format(effect)}x` },
            unlocked() { return hasResearch('inflaton', 22) },
            canResearch: true,
            repeatable: true,
            row: 0,
            pos: 4
        },
        115: {
            title: 'Repeatable: Inflational Dynamics',
            description: 'Retain up to 1e6x more Foam',
            cost(amount) { return Decimal.gte(amount, 3998) ? Decimal.dInf : Decimal.pow(5, amount).times(160000).div(buyableEffect('skyrmion', 241)) },
            effect(amount) { return Decimal.pow(1e6, amount) },
            effectDisplay(effect) { return `${formatWhole(effect)}x` },
            unlocked() { return hasResearch('inflaton', 22) },
            canResearch: true,
            repeatable: true,
            row: 0,
            pos: 5
        }
    },

    clickables: {
        "-1": {
            display() { if (player.inflaton.researchQueue.length > 1) {
                    let id = player.inflaton.researchQueue[1]
                    let title = temp.inflaton.research[id].title
                    return title
                }
                return `Research Slot 1`
            },
            canClick() { return player.inflaton.researchQueue.length > 1 },
            onClick() { player.inflaton.researchQueue.splice(1, 1) },
            unlocked() { return temp.inflaton.queueSize >= 2 },
            style() {
                let width = temp.inflaton.queueSize > 1 ? 500 / (temp.inflaton.queueSize - 1) : 500
                return {
                "min-height": "50px",
                "width": `${width}px`
            }}
        },
        "-2": {
            display() { if (player.inflaton.researchQueue.length > 2) {
                    let id = player.inflaton.researchQueue[2]
                    let title = temp.inflaton.research[id].title
                    return title
                }
                return `Research Slot 2`
            },
            canClick() { return player.inflaton.researchQueue.length > 2 },
            onClick() { player.inflaton.researchQueue.splice(2, 1) },
            unlocked() { return temp.inflaton.queueSize >= 3 },
            style() {
                let width = temp.inflaton.queueSize > 1 ? 500 / (temp.inflaton.queueSize - 1) : 500
                return {
                "min-height": "50px",
                "width": `${width}px`
            }}
        },
        "-3": {
            display() { if (player.inflaton.researchQueue.length > 3) {
                    let id = player.inflaton.researchQueue[3]
                    let title = temp.inflaton.research[id].title
                    return title
                }
                return `Research Slot 3`
            },
            canClick() { return player.inflaton.researchQueue.length > 3 },
            onClick() { player.inflaton.researchQueue.splice(3, 1) },
            unlocked() { return temp.inflaton.queueSize >= 4 },
            style() {
                let width = temp.inflaton.queueSize > 1 ? 500 / (temp.inflaton.queueSize - 1) : 500
                return {
                "min-height": "50px",
                "width": `${width}px`
            }}
        },
        "-4": {
            display() { if (player.inflaton.researchQueue.length > 4) {
                    let id = player.inflaton.researchQueue[4]
                    let title = temp.inflaton.research[id].title
                    return title
                }
                return `Research Slot 5`
            },
            canClick() { return player.inflaton.researchQueue.length > 4 },
            onClick() { player.inflaton.researchQueue.splice(4, 1) },
            unlocked() { return temp.inflaton.queueSize >= 5 },
            style() {
                let width = temp.inflaton.queueSize > 1 ? 500 / (temp.inflaton.queueSize - 1) : 500
                return {
                "min-height": "50px",
                "width": `${width}px`
            }}
        },

        "sell11": {
            display: `Sell One`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[11].unlocked },
            canClick() { return getBuyableAmount('inflaton', 11).gt(0) },
            onClick() {
                setBuyableAmount('inflaton', 11, getBuyableAmount('inflaton', 11).minus(temp.inflaton.buyables[11].size).max(0))
                player.inflaton.size = player.inflaton.size.minus(temp.inflaton.buyables[11].size)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sellAll11": {
            display: `Sell All`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[11].unlocked },
            canClick() { return getBuyableAmount('inflaton', 11).gt(0) },
            onClick() {
                player.inflaton.size = player.inflaton.size.minus(getBuyableAmount('inflaton', 11))
                setBuyableAmount('inflaton', 11, decimalZero)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sell12": {
            display: `Sell One`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[12].unlocked },
            canClick() { return getBuyableAmount('inflaton', 12).gt(0) },
            onClick() {
                setBuyableAmount('inflaton', 12, getBuyableAmount('inflaton', 12).minus(temp.inflaton.buyables[12].size).max(0))
                player.inflaton.size = player.inflaton.size.minus(temp.inflaton.buyables[12].size)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sellAll12": {
            display: `Sell All`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[12].unlocked },
            canClick() { return getBuyableAmount('inflaton', 12).gt(0) },
            onClick() {
                player.inflaton.size = player.inflaton.size.minus(getBuyableAmount('inflaton', 12))
                setBuyableAmount('inflaton', 12, decimalZero)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sell13": {
            display: `Sell One`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[13].unlocked },
            canClick() { return getBuyableAmount('inflaton', 13).gt(0) },
            onClick() {
                setBuyableAmount('inflaton', 13, getBuyableAmount('inflaton', 13).minus(temp.inflaton.buyables[13].size).max(0))
                player.inflaton.size = player.inflaton.size.minus(temp.inflaton.buyables[13].size)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sellAll13": {
            display: `Sell All`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[13].unlocked },
            canClick() { return getBuyableAmount('inflaton', 13).gt(0) },
            onClick() {
                player.inflaton.size = player.inflaton.size.minus(getBuyableAmount('inflaton', 13))
                setBuyableAmount('inflaton', 13, decimalZero)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sell14": {
            display: `Sell One`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[14].unlocked },
            canClick() { return getBuyableAmount('inflaton', 14).gt(0) },
            onClick() {
                setBuyableAmount('inflaton', 14, getBuyableAmount('inflaton', 14).minus(temp.inflaton.buyables[14].size).max(0))
                player.inflaton.size = player.inflaton.size.minus(temp.inflaton.buyables[14].size)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        },
        "sellAll14": {
            display: `Sell All`,
            unlocked() { return hasResearch('inflaton', 10) && temp.inflaton.buyables[14].unlocked },
            canClick() { return getBuyableAmount('inflaton', 14).gt(0) },
            onClick() {
                player.inflaton.size = player.inflaton.size.minus(getBuyableAmount('inflaton', 14))
                setBuyableAmount('inflaton', 14, decimalZero)
            },
            style: { "min-height": "25px", "width": "125px", "margin-top": "50px" }
        }
    },
    bars: {
        research: {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                if (player.inflaton.researchQueue.length > 0) {
                    let id = player.inflaton.researchQueue[0]
                    let cost = temp.inflaton.research[id].repeatable ? layers.inflaton.research[id].cost(researchLevel('inflaton', id)) : temp.inflaton.research[id].cost
                    return Decimal.div(player.inflaton.researchProgress, cost)
                }
                return decimalZero
            },
            display() {
                if (player.inflaton.researchQueue.length > 0) {
                    let id = player.inflaton.researchQueue[0]
                    let title = temp.inflaton.research[id].title
                    let progress = player.inflaton.researchProgress
                    let max = typeof layers.inflaton.research[id].cost === 'function' ? layers.inflaton.research[id].cost(researchLevel('inflaton', id)) : temp.inflaton.research[id].cost
                    return `Current Research: ${title}<br>Progress: ${formatWhole(progress)} / ${formatWhole(max)}`
                }
                return `Current Research: None`
            },
            fillStyle() { return { "backgroundColor": temp.inflaton.color } },
            onClick() {
                player.inflaton.researchQueue.shift()
                player.inflaton.researchProgress = decimalZero
            }
        }
    },

    microtabs: {
        stuff: {
            "Upgrades": {
                unlocked() { return hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0) },
                content: [
                    "blank",
                    "challenges",
                    "blank",
                    "upgrades"
                ]
            },
            "Subspace": {
                unlocked() { return hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0) },
                content: [
                    "blank",
                    () => hasResearch('inflaton', 24) ? ["row", [["display-text", "Enable Auto-Build"], "blank", ["toggle", ["inflaton", "autoBuild"]]]] : '',
                    () => hasResearch('inflaton', 24) ? "blank" : '',
                    "respec-button",
                    "blank",
                    ["row", [
                        ["column", [["buyable", 11], ["row", [["clickable", "sell11"], ["clickable", "sellAll11"]]]]],
                        ["column", [["buyable", 12], ["row", [["clickable", "sell12"], ["clickable", "sellAll12"]]]]],
                        ["column", [["buyable", 13], ["row", [["clickable", "sell13"], ["clickable", "sellAll13"]]]]]
                    ]],
                    "blank",
                    ["row", [
                        ["column", [["buyable", 14], ["row", [["clickable", "sell14"], ["clickable", "sellAll14"]]]]],
                        ["column", [["buyable", 15], ["row", [["clickable", "sell15"], ["clickable", "sellAll15"]]]]],
                        ["column", [["buyable", 16], ["row", [["clickable", "sell16"], ["clickable", "sellAll16"]]]]]
                    ]]
                ]
            },
            "Research": {
                unlocked() { return hasUpgrade('inflaton', 12) || hasMilestone('entangled', 0) },
                content: [
                    "blank",
                    ["display-text", () => `You are producing <h3 style='color:${temp.inflaton.color};text-shadow:${temp.inflaton.color} 0px 0px 10px;'>${formatWhole(temp.inflaton.researchGain.minus(buyableEffect('inflaton', 14).cost))}</h3> research points per second`],
                    "blank",
                    ["bar", "research"],
                    ["row", [["clickable", "-1"], ["clickable", "-2"], ["clickable", "-3"], ["clickable", "-4"]]],
                    "blank",
                    ["row", [["clickable", 1], ["clickable", 2], ["clickable", 3], ["clickable", 4], ["clickable", 5]]],
                    () => hasResearch('inflaton', 15) ? ["row", [["display-text", "Enable Auto-Repeatable Research"], "blank", ["toggle", ["inflaton", "autoResearch"]]]] : '',
                    () => hasResearch('inflaton', 15) ? "blank" : '',
                    "clickables"
                ],
                shouldNotify() {
                    return temp.inflaton.clickables[3].canClick && !player.inflaton.researchQueue.includes('113') && Object.keys(player.inflaton.repeatables).map(key => [key, layers.inflaton.research[key].cost(researchLevel('inflaton', key))]).reduce((a,b) => a[1].lt(b[1]) ? a : b, [0, Decimal.dInf])[0] == '113'
                }
            }
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", () => `You have managed to stabilize the universe at a diameter of ${formatLength(player.inflaton.maxSize)}`],
        ["display-text", () => `Construction Space Used: ${formatLength(player.inflaton.size)} / ${formatLength(player.inflaton.maxSize)}`],
        "blank",
        () => !(hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0)) ? "challenges" : '',
        () => !(hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0)) ? "blank" : '',
        () => !(hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0)) ? "upgrades" : '',
        () => hasUpgrade('inflaton', 11) || hasMilestone('entangled', 0) ? ["microtabs", "stuff"] : ''
    ],

    componentStyles: {
        "buyable"() { return { "height": "100px", "width": "300px" } },
        "upgrade"() { return { "min-height": "150px", "width": "150px" } }
    },

    hotkeys: [
        {
            key: "ctrl+i",
            onPress() { if (temp.inflaton.layerShown === true) player.tab = 'inflaton' }
        }
    ]
})

function createInflatonBuilding(id, data) {
    let currencyLocation = data.currencyLocation ? data.currencyLocation : () => player.inflaton
    let currencyInternalName = data.currencyInternalName ? data.currencyInternalName : 'points'
    
    return {
        title: data.title,
        cost() {
            let mult, base
            if (typeof data.cost === 'function')
                [mult, base] = data.cost()
            else if (typeof data.cost === 'object')
                [mult, base] = data.cost
            mult = new Decimal(mult)
            base = new Decimal(base)
            let amount = getBuyableAmount('inflaton', id).dividedBy(repeatableEffect('inflaton', 114)).dividedBy(buyableEffect('skyrmion', 143))
            let size = temp.inflaton.buyables[id].size
            if (hasResearch('inflaton', 24))
                return mult.times(base.pow(amount))
            return mult.times(base.pow(size).minus(1)).times(base.pow(amount)).dividedBy(base.minus(1))
        },
        bonus() { return getBuyableAmount('inflaton', id).times(buyableEffect('skyrmion', 243)).floor() },
        effect() { return data.effect(getBuyableAmount('inflaton', id).plus(temp.inflaton.buyables[id].bonus)) },
        display() { return `<br>${data.description}<br><b>Size: </b>${formatLength(temp.inflaton.buyables[id].size)}<br><b>Area:</b> ${formatLength(getBuyableAmount('inflaton', id))}${temp.inflaton.buyables[id].bonus.gt(0) ? ` + ${formatLength(temp.inflaton.buyables[id].bonus)}` : ''}<br><b>Current Effect: </b>${data.effectDisplay(temp.inflaton.buyables[id].effect)}<br><b>Cost:</b> ${format(temp.inflaton.buyables[id].cost)} ${data.currencyDisplayName}` },
        canAfford() { return player.inflaton.size.plus(temp.inflaton.buyables[id].size).lte(player.inflaton.maxSize) && currencyLocation()[currencyInternalName].gte(temp.inflaton.buyables[id].cost) },
        buy() {
            setBuyableAmount('inflaton', id, getBuyableAmount('inflaton', id).plus(temp.inflaton.buyables[id].size))
            if (!hasResearch('inflaton', 24)) currencyLocation()[currencyInternalName] = currencyLocation()[currencyInternalName].minus(temp.inflaton.buyables[id].cost)
            player.inflaton.size = player.inflaton.size.plus(temp.inflaton.buyables[id].size)
        },
        size: data.size,
        unlocked: data.unlocked,

        style() {
            let style = data.style ? data.style : {}
            style["height"] = "150px"
            style["width"] = "250px"
            style["padding-top"] = "6px"
            style["padding-bottom"] = "6px"
            return style
        },
        purchaseLimit: data.purchaseLimit
    }
}

function createResearchClickables(clickables) {
    for(let id in layers.inflaton.research) {
        let research = layers.inflaton.research[id]
        clickables[research.row*10 + research.pos] = createResearchClickable(id, research, research.row*10 + research.pos)
    }
}

function createResearchClickable(id, research, index) {
    let clickable = {
        unlocked() {
            if (hasResearch('inflaton', id)) return true
            if (research.requires) {
                for (let requirement of research.requires) {
                    let researchReq = temp.inflaton.research[requirement]
                    let reqIndex = researchReq.row*10 + researchReq.pos
                    if (!temp.inflaton.clickables[reqIndex].canClick)
                        return false
                }
            }
            return temp.inflaton.research[id].unlocked === undefined ? true : temp.inflaton.research[id].unlocked
        },
        research: id
    }

    if (research.repeatable) {
        clickable.display = () => `<h3>${research.title} ${formatRoman(researchLevel('inflaton', id).plus(1))}</h3><br>${research.description}<br><b>Effect: </b>${temp.inflaton.clickables[id-110].effectDisplay()}<br><b>Cost:</b> ${formatWhole(temp.inflaton.clickables[id-110].cost)} Research Points`
        clickable.onClick = () => {
            if (player.inflaton.researchQueue.length >= temp.inflaton.queueSize) return
            if (player.inflaton.researchQueue.includes(id)) return
            player.inflaton.researchQueue.push(id)
        }
        clickable.cost = () => research.cost(researchLevel('inflaton', id))
        clickable.effect = () => research.effect(researchLevel('inflaton', id))
        clickable.effectDisplay = () => research.effectDisplay(temp.inflaton.clickables[id-110].effect)
        clickable.canClick = () => {
            if (research.canResearch !== undefined)
                if (!temp.inflaton.research[id].canResearch)
                    return false
            if (research.requires) {
                for (let requirement of research.requires) {
                    if (!hasResearch('inflaton', requirement))
                        return false
                }
            }
            return temp.inflaton.clickables[index].cost.lt(Decimal.dInf)
        }
        if (id == '113') {
            clickable.style = () => {
                if (temp.inflaton.clickables[3].canClick && !player.inflaton.researchQueue.includes('113') && Object.keys(player.inflaton.repeatables).map(key => [key, layers.inflaton.research[key].cost(researchLevel('inflaton', key))]).reduce((a,b) => a[1].lt(b[1]) ? a : b, [0, Decimal.dInf])[0] == '113') {
                    return {'box-shadow': `var(--hqProperty2a), 0 0 20px ${temp.inflaton.trueGlowColor}`}
                }
            }
            clickable.tooltip = "Requires 10 of each Subspace Building to be researched"
        }
    }
    else {
        clickable.style = () => {
            let style = { "margin": "10px" }
            if (hasResearch('inflaton', id)) style["background-color"] = "#77bf5f"
            return style
        }
        clickable.display = () => `<h3>${research.title}</h3><br>${run(research.description)}<br><b>Cost:</b> ${formatWhole(research.cost)} Research Points`
        clickable.onClick = () => {
            if (player.inflaton.researchQueue.length >= temp.inflaton.queueSize) return
            if (player.inflaton.researchQueue.includes(id)) return
            if (hasResearch('inflaton', id)) return
            player.inflaton.researchQueue.push(id)
        }
        clickable.canClick = () => {
            if (research.canResearch !== undefined)
                if (!temp.inflaton.research[id].canResearch)
                    return false
            if (research.requires) {
                for (let requirement of research.requires) {
                    if (!hasResearch('inflaton', requirement))
                        return false
                }
            }
            return true
        }
    }

    return clickable
}

function hasResearch(layer, id) {
    return player[layer].research.includes(toNumber(id)) || player[layer].research.includes(String(id))
}

function researchLevel(layer, id) {
    if (temp[layer].research[id].repeatable)
        return player[layer].repeatables[id] === undefined ? decimalZero : player[layer].repeatables[id]
    else return hasResearch(layer, id) ? decimalOne : decimalZero
}

function researchEffect(layer, id) {
    return temp[layer].research[id].effect
}

function repeatableEffect(layer, id) {
    return layers[layer].research[id].effect(researchLevel(layer, id))
}

function fixRepeatables() {
    Object.keys(player.inflaton.repeatables).forEach(id => player.inflaton.repeatables[id] = new Decimal(player.inflaton.repeatables[id]))
}