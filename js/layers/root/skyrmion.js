addLayer("skyrmion", {
    name: "Skyrmion",
    symbol: "S",
    row: 0,
    position: 0,

    layerShown() { return !temp.skyrmion.paused },
    paused() { return player.universeTab !== "none" },
    resource() { return Decimal.equals(player.skyrmion.points, 1) ? "Skyrmion" : "Skyrmions" },
    resetDescription: 'Condense ',
    color: "#37d7ff",
    type: "static",
    baseResource: "Pions and Spinors",
    baseAmount() { return Decimal.min(player.skyrmion.pion.points, player.skyrmion.spinor.points) },
    requires: decimalOne,
    canBuyMax() { return true },
    base: 10,
    exponent: 1,
    gainMult() {
        return buyableEffect('skyrmion', 211).times(fomeEffect('infinitesimal', 3)).recip().times(defaultUpgradeEffect('acceleron', 144))
    },
    doReset(layer) {
        let costs = {}
        switch (layer) {
            case "acceleron":
                player.skyrmion.pion.points = decimalZero
                player.skyrmion.spinor.points = decimalZero
                costs = {
                    14: player.skyrmion.upgradeCosts[14],
                    15: player.skyrmion.upgradeCosts[15],
                    16: player.skyrmion.upgradeCosts[16],
                    17: player.skyrmion.upgradeCosts[17]
                }
                layerDataReset("skyrmion", ["upgrades"])
                player.skyrmion.upgradeCosts = {
                    14: costs[14],
                    15: costs[15],
                    16: costs[16],
                    17: costs[17]
                }
                player.skyrmion.points = hasMilestone('acceleron', 3) ? new Decimal(10) : decimalOne
                break;
            case "skyrmion":
                if (!hasUpgrade('skyrmion', 1)) {
                    player.skyrmion.pion.points = player.skyrmion.pion.points.minus(temp.skyrmion.nextAt)
                    player.skyrmion.spinor.points = player.skyrmion.spinor.points.minus(temp.skyrmion.nextAt)
                }
                break;
            case "entangled":
                let keep = []
                costs = {
                    14: player.skyrmion.upgradeCosts[14],
                    15: player.skyrmion.upgradeCosts[15],
                    16: player.skyrmion.upgradeCosts[16],
                    17: player.skyrmion.upgradeCosts[17]
                }
                if (hasMilestone('entangled', 1)) keep.push("upgrades", "autobuyPion", "autobuySpinor", "challenges")
                layerDataReset('skyrmion', keep)
                layerDataReset('skyrmion', keep)
                player.skyrmion.upgradeCosts = {
                    14: costs[14],
                    15: costs[15],
                    16: costs[16],
                    17: costs[17]
                }
                player.skyrmion.points = hasMilestone('acceleron', 3) ? new Decimal(10) : decimalOne
                break
            default:
                break;
        }
    },
    autoPrestige() { return hasUpgrade('skyrmion', 1) },

    effect() {
        let skyrmions = player.skyrmion.points.plus(fomeEffect('subspatial', 3))
        let pion = {
            alpha: buyableEffect('skyrmion', 111),
            beta: buyableEffect('skyrmion', 112),
            gamma: buyableEffect('skyrmion', 113),
            mu: buyableEffect('skyrmion', 114)
        }
        let spinor = {
            beta: buyableEffect('skyrmion', 212),
            gamma: buyableEffect('skyrmion', 213),
            zeta: buyableEffect('skyrmion', 223),
            lambda: buyableEffect('skyrmion', 234),
            mu: buyableEffect('skyrmion', 224),
            pi: buyableEffect('skyrmion', 244)
        }

        let fomeBoost = fomeEffect('infinitesimal', 1)
        let fomeCount = fomeEffect('subspatial', 1)
        
        let nerfBase = new Decimal(0.2)
        let nerfExp = Decimal.times(0.25, fomeEffect('quantum', 1))

        let universalBoost = pion.alpha.times(fomeBoost).times(spinor.zeta).times(spinor.lambda).times(player.acceleron.skyrmionBoost)

        let pionCount = player.skyrmion.pion.upgrades.minus(fomeCount)
        let spinorCount = player.skyrmion.spinor.upgrades.minus(fomeCount)
        if (inChallenge('abyss', 11))
            [pionCount, spinorCount] = [pionCount.plus(spinorCount).times(0.75), spinorCount.plus(pionCount).times(0.75)]

        let bottom = getTimelineEffect('bottom').div(getTimelineBonus('bottom').plus(1))
        let eff = {
            pion: {
                gen: skyrmions.times(0.01).times(universalBoost).times(spinor.gamma).times(spinor.mu).times(spinor.pi).div(bottom),
                costNerf: Decimal.pow(spinorCount.times(nerfBase).times(spinor.beta).plus(1), spinorCount.times(nerfExp))
            },
            spinor: {
                gen: skyrmions.times(0.01).times(universalBoost).times(pion.gamma).times(pion.mu).times(spinor.pi).div(bottom),
                costNerf: Decimal.pow(pionCount.times(nerfBase).times(pion.beta).plus(1), pionCount.times(nerfExp))
            }
        }
        return eff
    },
    effectDescription() {
        let eff = temp.skyrmion.effect
        return `which ${player.skyrmion.points.equals(1) ? "is" : "are"} producing <h3 style='color:${layers.skyrmion.color};text-shadow:${layers.skyrmion.color} 0px 0px 10px;'>${format(eff.pion.gen)}</h3> Pions/s and <h3 style='color:${layers.skyrmion.color};text-shadow:${layers.skyrmion.color} 0px 0px 10px;'>${format(eff.spinor.gen)}</h3> Spinors/s`
    },
    tooltip() {
        return [
            `${formatWhole(player.skyrmion.points)} Skyrmions`,
            `${format(player.skyrmion.pion.points)} Pions`,
            `${format(player.skyrmion.spinor.points)} Spinors`
        ].join('<br>')
    },
    
    startData() { return {
        unlocked: true,
		points: decimalOne,
        pion: {
            points: decimalZero,
            upgrades: decimalZero
        },
        spinor: {
            points: decimalZero,
            upgrades: decimalZero
        },
        upgradeCosts: {
            14: 1,
            15: 1,
            16: 1,
            17: 1
        }
    }},

    update(delta) {
        delta = Decimal.times(delta, temp.acceleron.effect)

        let eff = temp.skyrmion.effect
        player.skyrmion.pion.points = player.skyrmion.pion.points.plus(eff.pion.gen.times(delta)).max(0)
        player.skyrmion.spinor.points = player.skyrmion.spinor.points.plus(eff.spinor.gen.times(delta)).max(0)
    },

    automate() {
        if (inChallenge('abyss', 11)) return
        if (player.skyrmion.autobuyPion) {
            if (hasUpgrade('skyrmion', 2)) buyBuyable('skyrmion', 111)
            if (hasUpgrade('skyrmion', 3)) buyBuyable('skyrmion', 112)
            if (hasUpgrade('skyrmion', 4)) buyBuyable('skyrmion', 113)
            if (hasUpgrade('skyrmion', 5)) buyBuyable('skyrmion', 121)
            if (hasUpgrade('skyrmion', 6)) buyBuyable('skyrmion', 122)
            if (hasUpgrade('skyrmion', 7)) buyBuyable('skyrmion', 123)
            if (hasUpgrade('skyrmion', 8)) buyBuyable('skyrmion', 124)
            if (hasUpgrade('skyrmion', 9)) buyBuyable('skyrmion', 131)
            if (hasUpgrade('skyrmion', 10)) buyBuyable('skyrmion', 132)
            if (hasUpgrade('skyrmion', 11)) buyBuyable('skyrmion', 133)
            if (hasUpgrade('skyrmion', 12)) buyBuyable('skyrmion', 134)
            if (hasUpgrade('skyrmion', 13)) buyBuyable('skyrmion', 114)
            if (hasUpgrade('skyrmion', 14)) buyBuyable('skyrmion', 141)
            if (hasUpgrade('skyrmion', 15)) buyBuyable('skyrmion', 142)
            if (hasUpgrade('skyrmion', 16)) buyBuyable('skyrmion', 143)
            if (hasUpgrade('skyrmion', 17)) buyBuyable('skyrmion', 144)
        }
        if (player.skyrmion.autobuySpinor) {
            if (hasUpgrade('skyrmion', 2)) buyBuyable('skyrmion', 211)
            if (hasUpgrade('skyrmion', 3)) buyBuyable('skyrmion', 212)
            if (hasUpgrade('skyrmion', 4)) buyBuyable('skyrmion', 213)
            if (hasUpgrade('skyrmion', 5)) buyBuyable('skyrmion', 221)
            if (hasUpgrade('skyrmion', 6)) buyBuyable('skyrmion', 222)
            if (hasUpgrade('skyrmion', 7)) buyBuyable('skyrmion', 223)
            if (hasUpgrade('skyrmion', 8)) buyBuyable('skyrmion', 224)
            if (hasUpgrade('skyrmion', 9)) buyBuyable('skyrmion', 231)
            if (hasUpgrade('skyrmion', 10)) buyBuyable('skyrmion', 232)
            if (hasUpgrade('skyrmion', 11)) buyBuyable('skyrmion', 233)
            if (hasUpgrade('skyrmion', 12)) buyBuyable('skyrmion', 234)
            if (hasUpgrade('skyrmion', 13)) buyBuyable('skyrmion', 214)
            if (hasUpgrade('skyrmion', 14)) buyBuyable('skyrmion', 241)
            if (hasUpgrade('skyrmion', 15)) buyBuyable('skyrmion', 242)
            if (hasUpgrade('skyrmion', 16)) buyBuyable('skyrmion', 243)
            if (hasUpgrade('skyrmion', 17)) buyBuyable('skyrmion', 244)
        }
    },

    upgrades: {
        0: {
            title: 'Condensation',
            description: 'Begin Foam generation',
            cost: new Decimal(10),
            onPurchase() { player.fome.unlocked = true },
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        1: {
            unlocked() { return player.skyrmion.points.gte(12) || hasUpgrade('skyrmion', 1) },
            title: 'Reformation',
            description: `Automatically gain Skyrmions; they don't cost Pions or Spinors`,
            cost: new Decimal(16),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        2: {
            unlocked() { return player.skyrmion.points.gte(20) || hasUpgrade('skyrmion', 2) },
            title: 'Alteration',
            description: `Unlock the Pion and Spinor Upgrade autobuyers and let them autobuy <b>α</b> upgrades. <b>α</b> upgrades no longer consume Pions or Spinors`,
            cost: new Decimal(24),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        3: {
            unlocked() { return player.skyrmion.points.gte(25) || hasUpgrade('skyrmion', 3) },
            title: 'Benediction',
            description: `Allow the autobuyers to buy <b>β</b> upgrades. <b>β</b> upgrades no longer consume Pions or Spinors`,
            cost: new Decimal(28),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        4: {
            unlocked() { return player.skyrmion.points.gte(30) || hasUpgrade('skyrmion', 4) },
            title: 'Consolidation',
            description: `Allow the autobuyers to buy <b>γ</b> upgrades. <b>γ</b> upgrades no longer consume Pions or Spinors`,
            cost: new Decimal(32),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        5: {
            unlocked() { return player.skyrmion.points.gte(35) || hasUpgrade('skyrmion', 5) },
            title: 'Diversification',
            description: `Allow the autobuyers to buy <b>δ</b> upgrades. <b>δ</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(36),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        6: {
            unlocked() { return player.skyrmion.points.gte(40) || hasUpgrade('skyrmion', 6) },
            title: 'Encapsulation',
            description: `Allow the autobuyers to buy <b>ε</b> upgrades. <b>ε</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(42),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        7: {
            unlocked() { return player.skyrmion.points.gte(45) || hasUpgrade('skyrmion', 7) },
            title: 'Fabrication',
            description: `Allow the autobuyers to buy <b>ζ</b> upgrades. <b>ζ</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(48),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        8: {
            unlocked() { return player.skyrmion.points.gte(50) || hasUpgrade('skyrmion', 8) },
            title: 'Germination',
            description: `Allow the autobuyers to buy <b>η</b> upgrades. <b>η</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(52),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        9: {
            unlocked() { return player.skyrmion.points.gte(55) || hasUpgrade('skyrmion', 9) },
            title: 'Hesitation',
            description: `Allow the autobuyers to buy <b>θ</b> upgrades. <b>θ</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(56),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        10: {
            unlocked() { return player.skyrmion.points.gte(60) || hasUpgrade('skyrmion', 10) },
            title: 'Immitation',
            description: `Allow the autobuyers to buy <b>ι</b> upgrades. <b>ι</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(64),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        11: {
            unlocked() { return player.skyrmion.points.gte(65) || hasUpgrade('skyrmion', 11) },
            title: 'Juxtaposition',
            description: `Allow the autobuyers to buy <b>κ</b> upgrades. <b>κ</b> ugprades no longer consume Pions or Spinors`,
            cost: new Decimal(69),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        12: {
            unlocked() { return (player.skyrmion.points.gte(70) && hasUpgrade('acceleron', 13)) || hasUpgrade('skyrmion', 12) },
            title: 'Lateralization',
            description: `Allow the autobuyers to buy <b>λ</b> upgrades. <b>λ</b> upgrades no longer consume Pions or Spinors`,
            cost: new Decimal(72),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        13: {
            unlocked() { return (player.skyrmion.points.gte(90) && hasUpgrade('inflaton', 22)) || hasUpgrade('skyrmion', 13) },
            title: 'Materialization',
            description: `Allow the autobuyers to buy <b>μ</b> upgrades. <b>μ</b> upgrades no longer consume Pions or Spinors`,
            cost: new Decimal(92),
            canAfford() { return player.skyrmion.points.gte(temp.skyrmion.upgrades[this.id].cost) },
            pay() {}
        },
        14: {
            unlocked() { return inChallenge('abyss', 11) || hasUpgrade('skyrmion', 14) },
            title: 'Neutralization',
            description: `Allow the autobuyers to buy <b>ν</b> upgrades. <b>ν</b> upgrades no longer consume Pions or Spinors`,
            cost: decimalZero,
            currencyDisplayName() { return `${fomeNames[player.skyrmion.upgradeCosts[14]]} Foam<sup>2</sup>` },
            canAfford() { return player.fome.fome[fomeTypes[player.skyrmion.upgradeCosts[14]]].expansion.gt(1) },
            pay() {
                player.abyss.challenges[11]++
                if (!hasUpgrade('skyrmion', 15)) player.skyrmion.upgradeCosts[15]++
                if (!hasUpgrade('skyrmion', 16)) player.skyrmion.upgradeCosts[16]++
                if (!hasUpgrade('skyrmion', 17)) player.skyrmion.upgradeCosts[17]++
            }
        },
        15: {
            unlocked() { return inChallenge('abyss', 11) || hasUpgrade('skyrmion', 15) },
            title: 'Externalization',
            description: `Allow the autobuyers to buy <b>ξ</b> upgrades. <b>ξ</b> upgrades no longer consume Pions or Spinors`,
            cost: decimalZero,
            currencyDisplayName() { return `${fomeNames[player.skyrmion.upgradeCosts[15]]} Foam<sup>2</sup>` },
            canAfford() { return player.fome.fome[fomeTypes[player.skyrmion.upgradeCosts[15]]].expansion.gt(1) },
            pay() {
                player.abyss.challenges[11]++
                if (!hasUpgrade('skyrmion', 14)) player.skyrmion.upgradeCosts[14]++
                if (!hasUpgrade('skyrmion', 16)) player.skyrmion.upgradeCosts[16]++
                if (!hasUpgrade('skyrmion', 17)) player.skyrmion.upgradeCosts[17]++
            }
        },
        16: {
            unlocked() { return inChallenge('abyss', 11) || hasUpgrade('skyrmion', 16) },
            title: 'Obfuscation',
            description: `Allow the autobuyers to buy <b>ο</b> upgrades. <b>ο</b> upgrades no longer consume Pions or Spinors`,
            cost: decimalZero,
            currencyDisplayName() { return `${fomeNames[player.skyrmion.upgradeCosts[16]]} Foam<sup>2</sup>` },
            canAfford() { return player.fome.fome[fomeTypes[player.skyrmion.upgradeCosts[16]]].expansion.gt(1) },
            pay() {
                player.abyss.challenges[11]++
                if (!hasUpgrade('skyrmion', 14)) player.skyrmion.upgradeCosts[14]++
                if (!hasUpgrade('skyrmion', 15)) player.skyrmion.upgradeCosts[15]++
                if (!hasUpgrade('skyrmion', 17)) player.skyrmion.upgradeCosts[17]++
            }
        },
        17: {
            unlocked() { return inChallenge('abyss', 11) || hasUpgrade('skyrmion', 17) },
            title: 'Prioritization',
            description: `Allow the autobuyers to buy <b>π</b> upgrades. <b>π</b> upgrades no longer consume Pions or Spinors`,
            cost: decimalZero,
            currencyDisplayName() { return `${fomeNames[player.skyrmion.upgradeCosts[17]]} Foam<sup>2</sup>` },
            canAfford() { return player.fome.fome[fomeTypes[player.skyrmion.upgradeCosts[17]]].expansion.gt(1) },
            pay() {
                player.abyss.challenges[11]++
                if (!hasUpgrade('skyrmion', 14)) player.skyrmion.upgradeCosts[14]++
                if (!hasUpgrade('skyrmion', 15)) player.skyrmion.upgradeCosts[15]++
                if (!hasUpgrade('skyrmion', 16)) player.skyrmion.upgradeCosts[16]++
            }
        }
    },

    milestonePopups: false,
    milestones: {
        0: {
            requirementDescription: 'Autobuy Pion Upgrades',
            effectDescription: '',
            unlocked() { return this.done() },
            done() { return hasUpgrade('skyrmion', 2) },
            toggles: [['skyrmion', 'autobuyPion']]
        },
        1: {
            requirementDescription: 'Autobuy Spinor Upgrades',
            effectDescription: '',
            unlocked() { return this.done() },
            done() { return hasUpgrade('skyrmion', 2) },
            toggles: [['skyrmion', 'autobuySpinor']]
        }
    },

    buyables: {
        rows: 5,
        cols: 4,
        111: createSkyrmionBuyable('α', 111, {
            cost: [[0.1, 1.2],
                   [9.5, 7.5, 25],
                   [2.65e77, 187.5, 90]],
            costModifier: (cost) => cost.times(fomeEffect('infinitesimal', 2)),
            display: `Gain 50% more Pions and Spinors`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.5, amount),
            bonus: () => fomeEffect('protoversal', 1),
            free: () => hasUpgrade('skyrmion', 2)
        }),
        112: createSkyrmionBuyable('β', 112, {
            cost: [[0.1, 1.3],
                   [6, 10, 15],
                   [3.01e39, 292.5, 45]],
            costModifier: (cost) => cost.plus(0.9),
            display: `Reduce the nerf to Spinor upgrade cost by 10%`,
            effectDisplay: (effect) => `Spinor upgrade cost nerf reduced to ${formatSmall(effect.times(100))}%`,
            effect: (amount) => Decimal.pow(0.9, amount),
            bonus: () => fomeEffect('protoversal', 2),
            free: () => hasUpgrade('skyrmion', 3)
        }),
        113: createSkyrmionBuyable('γ', 113, {
            cost: [[0.1, 1.7],
                   [25, 12.5, 10],
                   [1.97e71, 367.5, 60]],
            costModifier: (cost) => cost.plus(4.9).times(fomeEffect('infinitesimal', 4)),
            display: `Gain 75% more Spinors`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.75, amount),
            bonus: () => fomeEffect('protoversal', 3),
            free: () => hasUpgrade('skyrmion', 4)
        }),
        121: createSkyrmionBuyable('δ', 121, {
            cost: [[30, 6],
                   [1.1e72, 225, 60]],
            display: `Gain 70% more Protoversal Foam from Skyrmions`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.7, amount),
            bonus: () => fomeEffect('subplanck', 1),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.boosts.protoversal.boosts[0].gte(1),
            free: () => hasUpgrade('skyrmion', 5)
        }),
        122: createSkyrmionBuyable('ε', 122, {
            cost: [[50, 5],
                   [2.82e66, 144, 60]],
            display: `Increase Protoversal Foam gain by 50% per order of magnitude of Infinitesimal Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.infinitesimal.points.max(0).plus(1).log10().times(amount).times(0.5).plus(1),
            bonus: () => fomeEffect('subplanck', 2),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.infinitesimal.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 6)
        }),
        123: createSkyrmionBuyable('ζ', 123, {
            cost: [[5e3, 5.5],
                   [1.71e73, 196, 60]],
            display: `Increase Subspatial Foam gain by 5% per Skyrmion`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.skyrmion.points.plus(fomeEffect('subspatial', 3)).times(amount).times(0.05).plus(1),
            bonus: () => fomeEffect('subplanck', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.subspatial.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 7)
        }),
        124: createSkyrmionBuyable('η', 124, {
            cost: [[3e5, 5],
                   [1.69e71, 144, 60]],
            display: `Gain a free level of <b>Spinor Upgrade ε</b>`,
            effectDisplay: (effect) => `${format(effect)} free levels`,
            effect: (amount) => amount,
            bonus: () => fomeEffect('subplanck', 4),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.protoversal.expansion.gte(2),
            free: () => hasUpgrade('skyrmion', 8)
        }),
        131: createSkyrmionBuyable('θ', 131, {
            cost: [[7e5, 6.5],
                   [6.86e72, 169, 60]],
            display: `Increase Protoversal Foam gain by 100% per order of magnitude of Subspatial Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.subspatial.points.max(0).plus(1).log10().times(amount).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.subplanck.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 9)
        }),
        132: createSkyrmionBuyable('ι', 132, {
            cost: [[4e8, 7.5],
                   [1.68e67, 225, 45]],
            display: `Your Spinors increase Infinitesimal Foam generation by 2% per order of magnitude`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.skyrmion.spinor.points.max(0).plus(1).log10().times(amount).times(0.02).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.protoversal.expansion.gte(3),
            free: () => hasUpgrade('skyrmion', 10)
        }),
        133: createSkyrmionBuyable('κ', 133, {
            cost: [[5e9, 7],
                   [3.66e68, 182, 45]],
            display: `Protoversal Boost 1 levels increase other Foam Boost 1 effects by 30%`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => amount.times(temp.fome.boosts.protoversal[0].total).times(0.3).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.infinitesimal.expansion.gte(2),
            free: () => hasUpgrade('skyrmion', 11)
        }),
        134: createSkyrmionBuyable('λ', 134, {
            cost: [[7e2, 5, 0, 1.1],
                   [4.92e76, 100, 45, 1.1]],
            display: `Double the Infinitesimal Foam Boost 1 effect`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(2, amount),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || hasUpgrade('acceleron', 13),
            free: () => hasUpgrade('skyrmion', 12)
        }),
        114: createSkyrmionBuyable('μ', 114, {
            cost: [[7e10, 5],
                   [7e65, 100, 45]],
            display: `Gain 2% more Spinors per order of magnitude<sup>2</sup> of stored Inflatons`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) =>  player.inflaton.points.clamp(1, temp.inflaton.storage).plus(9).log10().log10().times(0.02).plus(1).pow(amount),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || hasUpgrade('inflaton', 22),
            free: () => hasUpgrade('skyrmion', 13)
        }),
        141: createSkyrmionBuyable('ν', 141, {
            cost: [[1e50, 150]],
            display: `Increase research speed by 2.5e-4x per order of magnitude of Pions`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.skyrmion.pion.points.max(0).plus(1).log10().times(amount).times(0.00025).plus(1),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 14)
        }),
        142: createSkyrmionBuyable('ξ', 142, {
            cost: [[1e50, 135]],
            display: `Decrease the Entangled String Acceleron requirement by 5%`,
            effectDisplay: (effect) => `${formatSmall(effect)}x`,
            effect: (amount) => Decimal.pow(0.95, amount),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 15)
        }),
        143: createSkyrmionBuyable('ο', 143, {
            cost: [[1e50, 175]],
            display: `Decrease Subspace building cost scaling by 1.1x`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.1, amount),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 16)
        }),
        144: createSkyrmionBuyable('π', 144, {
            cost: [[1e50, 160]],
            display: `Increase Entropic Loop construction speed by 5% per completed Entropic Loop`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => amount.times(0.05).times(temp.acceleron.numFinishedLoops).plus(1),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 17)
        }),
        211: createSkyrmionBuyable('α', 211, {
            cost: [[0.1, 1.2],
                   [9.5, 7.5, 25],
                   [2.65e77, 187.5, 90]],
            costModifier: (cost) => cost.times(fomeEffect('infinitesimal', 2)),
            display: `Gain 50% more Skyrmions`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.5, amount),
            bonus: () => fomeEffect('protoversal', 1),
            free: () => hasUpgrade('skyrmion', 2)
        }),
        212: createSkyrmionBuyable('β', 212, {
            cost: [[0.1, 1.3],
                   [6, 10, 15],
                   [3.01e39, 292.5, 45]],
            costModifier: (cost) => cost.plus(0.9),
            display: `Reduce the nerf to Pion upgrade cost by 10%`,
            effectDisplay: (effect) => `Pion upgrade cost nerf reduced to ${formatSmall(effect.times(100))}%`,
            effect: (amount) => Decimal.pow(0.9, amount),
            bonus: () => fomeEffect('protoversal', 2),
            free: () => hasUpgrade('skyrmion', 3)
        }),
        213: createSkyrmionBuyable('γ', 213, {
            cost: [[0.1, 1.7],
                   [25, 12.5, 10],
                   [1.97e71, 367.5, 60]],
            costModifier: (cost) => cost.plus(4.9).times(fomeEffect('infinitesimal', 4)),
            display: `Gain 75% more Pions`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.75, amount),
            bonus: () => fomeEffect('protoversal', 3),
            free: () => hasUpgrade('skyrmion', 4)
        }),
        221: createSkyrmionBuyable('δ', 221, {
            cost: [[30, 6],
                   [1.1e72, 225, 60]],
            display: `Gain 70% more Protoversal Boost 1 effect`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => Decimal.pow(1.7, amount),
            bonus: () => fomeEffect('subplanck', 1),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.boosts.protoversal.boosts[0].gte(1),
            free: () => hasUpgrade('skyrmion', 5)
        }),
        222: createSkyrmionBuyable('ε', 222, {
            cost: [[50, 5],
                   [2.82e66, 144, 60]],
            display: `Increase Infinitesimal Foam gain by 50% per order of magnitude of Protoversal Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.protoversal.points.max(0).plus(1).log10().times(amount).plus(1),
            bonus: () => fomeEffect('subplanck', 2).plus(buyableEffect('skyrmion', 124)),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.infinitesimal.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 6)
        }),
        223: createSkyrmionBuyable('ζ', 223, {
            cost: [[5e3, 5.5],
                   [1.71e73, 196, 60]],
            display: `Increase Pion and Spinor gain by 30% per order of magnitude of Subspatial Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.subspatial.points.max(0).plus(1).log10().times(amount).times(0.3).plus(1),
            bonus: () => fomeEffect('subplanck', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.subspatial.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 7)
        }),
        224: createSkyrmionBuyable('η', 224, {
            cost: [[3e5, 5],
                   [1.69e71, 144, 60]],
            display: `Gain 120% increased Foam generation`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => amount.times(1.2).plus(1),
            bonus: () => fomeEffect('subplanck', 4),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.protoversal.expansion.gte(2),
            free: () => hasUpgrade('skyrmion', 8)
        }),
        231: createSkyrmionBuyable('θ', 231, {
            cost: [[7e5, 6.5],
                   [6.86e72, 169, 60]],
            display: `Increase Subspatial Foam gain by 30% per order of magnitude of Protoversal and Infinitesimal Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.protoversal.points.max(0).plus(1).log10().plus(player.fome.fome.infinitesimal.points.max(0).plus(1).log10()).times(amount).times(0.3).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.subplanck.expansion.gte(1),
            free: () => hasUpgrade('skyrmion', 9)
        }),
        232: createSkyrmionBuyable('ι', 232, {
            cost: [[4e8, 7.5],
                   [1.68e67, 225, 45]],
            display: `Your Pions increase Infinitesimal Foam generation by 2% per order of magnitude`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.skyrmion.pion.points.max(0).plus(1).log10().times(amount).times(0.02).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.protoversal.expansion.gte(3),
            free: () => hasUpgrade('skyrmion', 10)
        }),
        233: createSkyrmionBuyable('κ', 233, {
            cost: [[5e9, 7],
                   [3.66e68, 182, 45]],
            display: `Increase Subplanck Boost 1 effect by 40% per order of magnitude of Subplanck Foam`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.fome.fome.subplanck.points.max(0).plus(1).log10().times(amount).times(0.4).plus(1),
            bonus: () => fomeEffect('quantum', 3),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || player.fome.fome.infinitesimal.expansion.gte(2),
            free: () => hasUpgrade('skyrmion', 11)
        }),
        234: createSkyrmionBuyable('λ', 234, {
            cost: [[7e10, 5],
                   [7e65, 100, 45]],
            display: `ln(Best Accelerons) increases Pion and Spinor gain`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => amount.times(player.acceleron.best.max(0).plus(1).ln()).plus(1),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || hasUpgrade('acceleron', 13),
            free: () => hasUpgrade('skyrmion', 12)
        }),
        214: createSkyrmionBuyable('μ', 214, {
            cost: [[7e10, 5],
                   [7e65, 100, 45]],
            display: `Gain 2% more Pions per order of magnitude<sup>2</sup> of stored Inflatons`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => player.inflaton.points.clamp(1, temp.inflaton.storage).plus(9).log10().log10().times(0.02).plus(1).pow(amount),
            unlocked: () => inChallenge('abyss', 11) || hasMilestone('entangled', 1) || hasUpgrade('inflaton', 22),
            free: () => hasUpgrade('skyrmion', 13)
        }),
        241: createSkyrmionBuyable('ν', 241, {
            cost: [[1e50, 150]],
            display: `Add 2.5e-4 to the repeatable research cost divider per order of magnitude of Spinors`,
            effectDisplay: (effect) => `/${format(effect)}x`,
            effect: (amount) => player.skyrmion.spinor.points.max(0).plus(1).log10().times(0.00025).times(amount).plus(1),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 14)
        }),
        242: createSkyrmionBuyable('ξ', 242, {
            cost: [[1e50, 135]],
            display: `Decrease the Entangled String Inflaton requirement's order of magnitude by 5%`,
            effectDisplay: (effect) => `${formatSmall(effect)}x`,
            effect: (amount) => Decimal.pow(0.95, amount),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 15)
        }),
        243: createSkyrmionBuyable('ο', 243, {
            cost: [[1e50, 175]],
            display: `Increase effective Subspace building count by 0.1%`,
            effectDisplay: (effect) => `${format(effect.times(100), 1)}%`,
            effect: (amount) => amount.times(0.001),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 16)
        }),
        244: createSkyrmionBuyable('π', 244, {
            cost: [[1e50, 160]],
            display: `Increase Pion and Spinor gain by 0.25% per total Entropy`,
            effectDisplay: (effect) => `${format(effect)}x`,
            effect: (amount) => amount.times(0.0025).times(temp.acceleron.entropy).plus(1),
            unlocked: () => hasUpgrade('inflaton', 13),
            free: () => hasUpgrade('skyrmion', 17)
        })
    },

    clickables: {
        11: {
            title: "Buy All",
            unlocked() { return inChallenge('abyss', 11) || hasMilestone('entangled', 1) || hasMilestone('fome', 0) || hasMilestone('entangled', 0) },
            canClick: true,
            onClick() {
                for (let type = 100; type <= 200; type += 100)
                    for (let row = 10; row <= 40; row += 10)
                        for (let col = 1; col <= 4; col++)
                            if (temp.skyrmion.buyables[type+row+col] && temp.skyrmion.buyables[type+row+col].canAfford) buyBuyable('skyrmion', type+row+col)
            },
            onHold() { layers.skyrmion.clickables[11].onClick() }
        },
        12: {
            title: "Sell All",
            unlocked() { return inChallenge('abyss', 11) },
            canClick: true,
            onClick() {
                for (let type = 100; type <= 200; type += 100)
                    for (let row = 10; row <= 40; row += 10)
                        for (let col = 1; col <= 4; col++)
                            player.skyrmion.buyables[type+row+col] = decimalZero
                player.skyrmion.pion.upgrades = decimalZero
                player.skyrmion.spinor.upgrades = decimalZero
            }
        }
    },

    componentStyles: {
        clickable: {
            'min-height': "30px",
            width: "100px"
        }
    },

    microtabs: {
        stuff: {
            "Skyrmions": {
                shouldNotify() {
                    if (player.tab == "skyrmion" && player.subtabs.skyrmion.stuff == "Skyrmions")
                        return false
                    return Object.values(temp.skyrmion.upgrades).some(upgrade =>
                        upgrade.unlocked && upgrade.canAfford && !hasUpgrade('skyrmion', upgrade.id))
                },
                content: [
                    "blank",
                    ["row", [["milestone", 0], ["milestone", 1]]],
                    () => hasMilestone('skyrmion', 0) ? "blank" : ``,
                    "clickables",
                    () => Object.keys(player.skyrmion.clickables).map(id => temp.skyrmion.clickables[id].unlocked).some(Boolean) ? "blank" : "",
                    ["layer-proxy", ["abyss", ["challenges"]]],
                    () => hasUpgrade('inflaton', 13) ? "blank" : "",
                    ["row", [
                        ["upgrade", 0], ["upgrade", 1]
                    ]],
                    ["row", [
                        ["upgrade", 2], ["upgrade", 3], ["upgrade", 4]
                    ]],
                    ["row", [
                        ["upgrade", 5], ["upgrade", 6], ["upgrade", 7], ["upgrade", 8]
                    ]],
                    ["row", [
                        ["upgrade", 14], ["upgrade", 9], ["upgrade", 10], ["upgrade", 11], ["upgrade", 17]
                    ]],
                    ["row", [
                        ["upgrade", 15], ["upgrade", 12], ["upgrade", 13], ["upgrade", 16]
                    ]],
                    "blank"
                ]
            },
            "Pions": {
                shouldNotify() {
                    if (player.tab == "skyrmion" && player.subtabs.skyrmion.stuff == "Pions")
                        return false
                    return Object.values(temp.skyrmion.buyables).some(buyable =>
                        buyable.id < 200 && buyable.unlocked && buyable.canAfford)
                },
                content: [
                    "blank",
                    ["display-text", () => `Your Spinor upgrades are increasing Pion upgrade cost by ${formatSmall(temp.skyrmion.effect.pion.costNerf.minus(1).times(100))}%`],
                    "blank",
                    "clickables",
                    () => Object.keys(player.skyrmion.clickables).map(id => temp.skyrmion.clickables[id].unlocked).some(Boolean) ? "blank" : "",
                    ["row", [["buyable", 111], ["buyable", 112], ["buyable", 113], ["buyable", 114]]],
                    ["row", [["buyable", 121], ["buyable", 122], ["buyable", 123], ["buyable", 124]]],
                    ["row", [["buyable", 131], ["buyable", 132], ["buyable", 133], ["buyable", 134]]],
                    ["row", [["buyable", 141], ["buyable", 142], ["buyable", 143], ["buyable", 144]]],
                    "blank"
                ]
            },
            "Spinors": {
                shouldNotify() {
                    if (player.tab == "skyrmion" && player.subtabs.skyrmion.stuff == "Spinors")
                        return false
                    return Object.values(temp.skyrmion.buyables).some(buyable =>
                        buyable.id >= 200 && buyable.unlocked && buyable.canAfford)
                },
                content: [
                    "blank",
                    ["display-text", () => `Your Pion upgrades are increasing Spinor upgrade cost by ${formatSmall(temp.skyrmion.effect.spinor.costNerf.minus(1).times(100))}%`],
                    "blank",
                    "clickables",
                    () => Object.keys(player.skyrmion.clickables).map(id => temp.skyrmion.clickables[id].unlocked).some(Boolean) ? "blank" : "",
                    ["row", [["buyable", 211], ["buyable", 212], ["buyable", 213], ["buyable", 214]]],
                    ["row", [["buyable", 221], ["buyable", 222], ["buyable", 223], ["buyable", 224]]],
                    ["row", [["buyable", 231], ["buyable", 232], ["buyable", 233], ["buyable", 234]]],
                    ["row", [["buyable", 241], ["buyable", 242], ["buyable", 243], ["buyable", 244]]],
                    "blank"
                ]
            }
        }
    },

    tabFormat: [
        "main-display",
        () => fomeEffect('subspatial', 3).gte(1) ? ["display-text", `Your Subspatial Foam is granting an additional ${colored('skyrmion', format(fomeEffect('subspatial', 3)))} Skyrmions`] : ``,
        "prestige-button",
        "blank",
        ["display-text", () => `You have ${colored('skyrmion', format(player.skyrmion.pion.points))} Pions`],
        "blank",
        ["display-text", () => `You have ${colored('skyrmion', format(player.skyrmion.spinor.points))} Spinors`],
        "blank",
        ["microtabs", "stuff"],
    ],

    hotkeys: [
        {
            key: "S",
            description: "Shift+[Layer Symbol]: Click the given layer's Buy All button, if it is unlocked.",
            onPress() { if (temp.skyrmion.clickables[11].unlocked) clickClickable('skyrmion', 11) }
        },
        {
            key: "ctrl+s",
            description() {
                let description = "Ctrl+[Layer Symbol]: Switch to the given layer"
                let exceptions = []

                if (temp.timecube.layerShown === true)
                    exceptions.push("Time Cubes: ctrl+c")
                
                if (exceptions.length > 0) {
                    description += "<br>Exceptions:"
                    for (let exception of exceptions)
                        description += `</br>${exception}`
                }
                description += "<br>"
                return description
            },
            onPress() { if (temp.skyrmion.layerShown === true) player.tab = 'skyrmion' }
        },
        {
            key: "p",
            description: "P: Pause the game",
            onPress() { if (player.paused) { delete player.paused } else { player.paused = true } }
        },
        {
            key: "s",
            description() {
                if (inChallenge('abyss', 11)) return "S: Sell all Pion and Spinor upgrades"
                else return "S: Condense some Pions and Spinors for another Skyrmion"
            },
            onPress() {
                if (inChallenge('abyss', 11)) clickClickable('skyrmion', 12)
                else if (canReset('skyrmion')) doReset('skyrmion')
            },
            unlocked() { return inChallenge('abyss', 11) || !hasUpgrade('skyrmion', 1) }
        }
    ]
})

// initial * base ^ (amount - softcap) -> [initial, base, softcap]
function createCostFunc(costLists) {
    if (!costLists[0][2]) costLists[0][2] = 0
    costLists = costLists.map(list => list.map(value => new Decimal(value)))

    return (amount) => {
        let costList = costLists[floorSearch(costLists, amount)]
        return costList[0].times(Decimal.pow(costList[1], Decimal.pow(amount, costList[3] ? costList[3] : decimalOne).minus(costList[2])))
    }
}

function floorSearch(costLists, x, low = 0, high = costLists.length-1) {
    if (x.lt(0)) return 0
    if (low > high) return -1
    if (x.gte(costLists[high][2])) return high
    
    let mid = ~~((low + high) / 2)
    if (costLists[mid][2].eq(x)) return mid
    if (mid > 0 && costLists[mid-1][2].lte(x) && x.lt(costLists[mid][2])) return mid-1
    if (x.lt(costLists[mid][2])) return floorSearch(costLists, x, low, mid-1)
    return floorSearch(costLists, x, mid+1, high)
}

function createSkyrmionBuyable(symbol, id, data) {
    let type = id >= 200 ? 'spinor' : 'pion'
    let upperType = id >= 200 ? 'Spinor' : 'Pion'
    let costFunc = createCostFunc(data.cost)

    return {
        unlocked: data.unlocked,
        bonus: data.bonus,
        cost() {
            let amount = getBuyableAmount('skyrmion', id).minus(fomeEffect('subspatial', 4))
            let cost = data.costModifier ? data.costModifier(costFunc(amount)) : costFunc(amount)
            return cost.times(temp.skyrmion.effect[type].costNerf)
        },
        title: `${upperType} Upgrade ${symbol}`,
        display() {
            let amount = getBuyableAmount('skyrmion', id)
            let bonus = temp.skyrmion.buyables[id].bonus ? data.bonus() : decimalZero
            return `<br>${data.display}<br><br><b>Amount:</b> ${formatWhole(amount)}${Decimal.gt(bonus, 0) ? ` + ${formatWhole(bonus)}` : ``}<br><br><b>Current Effect:</b> ${data.effectDisplay(temp.skyrmion.buyables[id].effect)}<br><br><b>Cost:</b> ${format(temp.skyrmion.buyables[id].cost)} ${upperType}s`
        },
        effect() { return data.effect(getBuyableAmount('skyrmion', id).plus(data.bonus ? data.bonus() : decimalZero))},
        canAfford() { return player.skyrmion[type].points.gte(temp.skyrmion.buyables[id].cost) },
        free: data.free,
        buy() {
            if (temp.skyrmion.buyables[id].free === undefined || temp.skyrmion.buyables[id].free === false) player.skyrmion[type].points = player.skyrmion[type].points.minus(temp.skyrmion.buyables[id].cost)
            player.skyrmion[type].upgrades = player.skyrmion[type].upgrades.plus(1)
            addBuyables('skyrmion', id, 1)
        }
    }
}