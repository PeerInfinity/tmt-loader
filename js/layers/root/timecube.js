let timelineLeftStyle = {
    'padding-right': '8px',
    'text-align': 'right',
    'border-right': 'solid white 2px'
}
let timelineMiddleStyle = {
    'padding-left': '8px',
    'padding-right': '8px',
    'border-right': 'solid white 2px'
}
let timelineRightStyle = {
    'padding-left': '8px'
}
let offset45 = Math.E/Math.PI

addLayer("timecube", {
    name: "Time Cubes",
    symbol: "T",
    row: 2,
    position: 1,
    branches: ['acceleron'],

    layerShown() { return temp.timecube.paused ? false : (hasMilestone('entangled', 0) || isLoopFinished(2)) },
    paused() { return player.universeTab !== "none" },
    resource() { return player[this.layer].points.equals(1) ? "Time Cube" : "Time Cubes" },
    color: "#f037ea",
    darker: "#bd04b7",
    type: "none",

    startData() {
        let data = {
            unlocked: true,
            points: decimalZero,
            best: decimalZero,
            buySquareAmount: decimalOne,
            timelines: { front: 0, left: 0, top: 0, back: 0, right: 0, bottom: 0 },
            scores: {
                11: decimalZero,
                12: decimalZero,
                13: decimalZero,
                14: decimalZero,
                21: decimalZero,
                22: decimalZero,
                23: decimalZero,
                24: decimalZero,
                31: decimalZero,
                32: decimalZero,
                33: decimalZero,
                34: decimalZero
            },
            enteredTimeline: false
        }
        data.activeTimelines = {...data.timelines}
        data.nextScores = {...data.scores}
        data.activeSelectors = Object.fromEntries(Object.keys(data.scores).map(k => [k, false]))

        return data
    },

    update(diff) {
        if (player.timecube.buySquareAmount.lte(0)) {
            let element = document.getElementById('input-timecube-buySquareAmount')
            if (element) element.value = '1'
            player.timecube.buySquareAmount = decimalOne
        }

        let score = temp.timecube.timelineScore
        Object.keys(player.timecube.activeSelectors).filter(id => player.timecube.activeSelectors[id]).forEach(id => {
            if (score.gt(player.timecube.nextScores[id]))
                player.timecube.nextScores[id] = score
        })
    },

    upgrades: {
        11: {
            title: 'Tile',
            description: 'log10(Accelerons) increases Time Cube gain',
            cost: decimalOne,
            effect() { return player.acceleron.points.max(0).plus(1).log10() },
            effectDisplay() { return `${format(upgradeEffect('timecube', 11))}x` }
        },
        12: {
            title: 'Time',
            description: 'log10(Best Time Cubes) increases Acceleron effect',
            cost: new Decimal(2),
            effect() { return player.timecube.best.max(0).plus(1).log10().plus(1) },
            effectDisplay() { return `${format(upgradeEffect('timecube', 12))}x` },
            unlocked() { return hasUpgrade('timecube', 11) || hasUpgrade('timecube', this.id) }
        },
        13: {
            title: 'Tier',
            description: 'Each upgrade in this row gives a free level of every Foam Boost',
            cost: new Decimal(3),
            effect() { return [11,12,13,14,15].map(id => hasUpgrade('timecube', id) ? 1 : 0).reduce(Decimal.plus) },
            effectDisplay() { return `+${formatWhole(upgradeEffect('timecube', 13))} free levels` },
            unlocked() { return hasUpgrade('timecube', 12) || hasUpgrade('timecube', this.id) }
        },
        14: {
            title: 'Tilt',
            description: 'Entropic Expansion is 50% stronger',
            cost: new Decimal(10),
            effect: new Decimal(1.5),
            unlocked() { return hasUpgrade('timecube', 13) || hasUpgrade('timecube', this.id) }
        },
        15: {
            title: 'Tiny',
            description: 'Unlock another Entropic Loop',
            cost: new Decimal(25),
            unlocked() { return hasUpgrade('timecube', 14) || hasUpgrade('timecube', this.id) }
        },
        21: {
            title: 'Twice',
            description() { return hasUpgrade('timecube', 32) ? 'Triple maximum entropy' : 'Double maximum entropy' },
            cost: new Decimal(2500),
            effect() { return new Decimal(hasUpgrade('timecube', 32) ? 3 : 2) },
            onPurchase() {
                player.acceleron.entropy = player.acceleron.entropy.plus(temp.acceleron.entropy)
            },
            unlocked() { return hasUpgrade('timecube', 15) || hasUpgrade('timecube', this.id) }
        },
        22: {
            title: 'Twist',
            description: 'You may select an additional first row Entropic Enhancement',
            effect: 1,
            cost: new Decimal(4e8),
            unlocked() { return hasUpgrade('timecube', 21) || hasUpgrade('timecube', this.id) }
        },
        23: {
            title: 'Ten',
            description: 'Increase Entropic Loop build speed by 10,000x',
            effect: new Decimal(10000),
            cost: new Decimal(5e8),
            unlocked() { return hasUpgrade('timecube', 22) || hasUpgrade('timecube', this.id) }
        },
        24: {
            title: 'Twirl',
            description: 'You may select an additional fourth row Entropic Enhancement',
            effect: 1,
            cost: new Decimal(1.25e9),
            unlocked() { return hasUpgrade('timecube', 23) || hasUpgrade('timecube', this.id) }
        },
        25: {
            title: 'Tetrate',
            description: 'Unlock the fourth column of Entropic Enhancements',
            cost: new Decimal(5e9),
            unlocked() { return hasUpgrade('timecube', 24) || hasUpgrade('timecube', this.id) }
        },
        31: {
            title: 'Tesselate',
            description: 'Unlock Time Squares',
            cost: new Decimal(1e6),
            unlocked() { return (hasUpgrade('inflaton', 23) && hasUpgrade('timecube', 21)) || hasUpgrade('timecube', this.id) }
        },
        32: {
            title: 'Triple',
            description: 'Change <b>Twice</b> from double to triple',
            cost: new Decimal(1e11),
            onPurchase() {
                player.acceleron.entropy = player.acceleron.entropy.plus(temp.acceleron.entropy.div(2))
            },
            unlocked() { return (hasUpgrade('inflaton', 23) && hasUpgrade('timecube', 31)) || hasUpgrade('timecube', this.id) }
        },
        33: {
            title: 'Turn',
            description: 'Front squares are 50% stronger',
            effect: new Decimal(1.5),
            cost: new Decimal(1e12),
            unlocked() { return (hasUpgrade('inflaton', 23) && hasUpgrade('timecube', 31)) || hasUpgrade('timecube', this.id) }
        },
        34: {
            title: 'Tall',
            description: 'Bottom squares are 50% stronger',
            cost: new Decimal(2e12),
            effect: new Decimal(1.5),
            unlocked() { return (hasUpgrade('inflaton', 23) && hasUpgrade('timecube', 33)) || hasUpgrade('timecube', this.id) }
        },
        35: {
            title: 'Tour',
            description: 'Double the Acceleron effect',
            cost: new Decimal(5e12),
            effect: new Decimal(2),
            unlocked() { return (hasUpgrade('inflaton', 23) && hasUpgrade('timecube', 33)) || hasUpgrade('timecube', this.id) }
        },
        41: {
            title: 'Tactics',
            description: 'Unlock Timelines',
            cost: new Decimal(1e13),
            unlocked() { return hasUpgrade('timecube', 35) || hasUpgrade('timecube', this.id) }
        },
        42: {
            title: 'Tower',
            description: 'While in at least one Top timeline, Foam retainment applies to Pions and Spinors as well',
            cost: new Decimal(1e16),
            effect() { return player.timecube.activeTimelines.top ? repeatableEffect('inflaton', 115) : decimalOne },
            unlocked() { return hasUpgrade('timecube', 35) || hasUpgrade('timecube', this.id) }
        },
        43: {
            title: 'Title',
            description: 'Best timeline scores also increase their corresponding Time Square gain',
            cost: new Decimal(1e17),
            unlocked() { return hasUpgrade('timecube', 35) || hasUpgrade('timecube', this.id) }
        },
        44: {
            title: 'Tempo',
            description: 'The first entropic loop always gives at least one Acceleron',
            cost: new Decimal(1e18),
            unlocked() { return hasUpgrade('timecube', 35) || hasUpgrade('timecube', this.id) }
        },
        45: {
            title: 'Toil',
            description: 'While in at least one Left timeline, Foam gain is massively increased based on how little Foam you have',
            cost: new Decimal(1e19),
            effect() {
                if (player.timecube.activeTimelines.left) {
                    let limits = {
                        quantum: 1e16,
                        subplanck: 3e23,
                        subspatial: 1e31,
                        infinitesimal: 3e38,
                        protoversal: 1e46
                    }
                    return Object.fromEntries(fomeTypes.map(type => [type, Decimal.minus(offset45, player.fome.fome[type].points.div(limits[type])).pow10().times(15).plus(1)]))
                }
                return Object.fromEntries(fomeTypes.map(type => [type, 1]))
            },
            unlocked() { return hasUpgrade('timecube', 35) || hasUpgrade('timecube', this.id) }
        },
        51: {
            title: '',
            description: '',
            cost: new Decimal(1e10000),
            unlocked() { return hasUpgrade('timecube', 45) || hasUpgrade('timecube', this.id) }
        },
        52: {
            title: '',
            description: '',
            cost: new Decimal(1e10000),
            unlocked() { return hasUpgrade('timecube', 45) || hasUpgrade('timecube', this.id) }
        },
        53: {
            title: '',
            description: '',
            cost: new Decimal(1e10000),
            unlocked() { return hasUpgrade('timecube', 45) || hasUpgrade('timecube', this.id) }
        },
        54: {
            title: '',
            description: '',
            cost: new Decimal(1e10000),
            unlocked() { return hasUpgrade('timecube', 45) || hasUpgrade('timecube', this.id) }
        },
        55: {
            title: '',
            description: '',
            cost: new Decimal(1e10000),
            unlocked() { return hasUpgrade('timecube', 45) || hasUpgrade('timecube', this.id) }
        }
    },

    clickables: {
        timesTen: {
            canClick: true,
            display: `x10`,
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.times(10)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        plusTen: {
            canClick: true,
            scale() { return player.timecube.buySquareAmount.max(1).log10().floor().max(1).pow10() },
            display() { return `+${temp.timecube.clickables.plusTen.scale.gte(1e4) ? exponentialFormat(temp.timecube.clickables.plusTen.scale, 0) : format(temp.timecube.clickables.plusTen.scale, 0)}` },
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.plus(temp.timecube.clickables.plusTen.scale)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        plusOne: {
            canClick: true,
            scale() { return player.timecube.buySquareAmount.max(1).log10().floor().minus(1).pow10() },
            display() { return `+${temp.timecube.clickables.plusOne.scale.gte(1e4) ? exponentialFormat(temp.timecube.clickables.plusOne.scale, 0) : format(temp.timecube.clickables.plusOne.scale, 0)}` },
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.plus(temp.timecube.clickables.plusOne.scale)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        minusOne: {
            canClick() { return player.timecube.buySquareAmount.gt(1) },
            scale() { return player.timecube.buySquareAmount.max(1).log10().floor().minus(1).pow10() },
            display() { return `-${temp.timecube.clickables.minusOne.scale.gte(1e4) ? exponentialFormat(temp.timecube.clickables.minusOne.scale, 0) : format(temp.timecube.clickables.minusOne.scale, 0)}` },
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.minus(temp.timecube.clickables.minusOne.scale)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        minusTen: {
            canClick() { return player.timecube.buySquareAmount.gt(10) },
            scale() { return player.timecube.buySquareAmount.max(1).log10().floor().max(1).pow10() },
            display() { return `-${temp.timecube.clickables.minusTen.scale.gte(1e4) ? exponentialFormat(temp.timecube.clickables.minusTen.scale, 0) : format(temp.timecube.clickables.minusTen.scale, 0)}` },
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.minus(temp.timecube.clickables.minusTen.scale)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        overTen: {
            canClick() { return player.timecube.buySquareAmount.gte(10) },
            display: `/10`,
            onClick() {
                player.timecube.buySquareAmount = player.timecube.buySquareAmount.dividedBy(10)
                let element = document.getElementById('input-timecube-buySquareAmount')
                if (element) element.value = formatWhole(player.timecube.buySquareAmount)
            },
            style: { 'min-height': '30px', 'width': '50px' },
        },
        enterTimeline: {
            display: () => {
                let inTimeline = Object.values(player.timecube.activeTimelines).filter(depth => depth > 0).length > 0
                let enteringTimeline = Object.keys(player.timecube.scores).map(id => getClickableState('timecube', id)).filter(state => state).length > 0
                return enteringTimeline ? 'Enter selected timelines' : (inTimeline ? 'Exit timelines' : 'Perform timeline reset')
            },
            canClick: true,
            onClick() {
                if (!player.timecube.enteredTimeline)
                    if (!confirm("Warning: Entering a Timeline will reset your currencies in all layers before Entangled Strings, as well as any Acceleron and Inflaton upgrades that provide production bonuses. Additionally, the Subspacial Construction repeatable will be reset to 0. Are you sure you want to enter?\n\nThis warning will not be shown again."))
                        return

                let acceleronUpgrades = player.acceleron.upgrades.filter(id => id >= 100 || [13,14,21,24,25].includes(id))
                let acceleronProgress = Object.values(player.acceleron.loops).map(loop => loop.progress)
                let acceleronEnhancements = [...player.acceleron.enhancements]
                let presetNames = Object.values(player.acceleron.presets).map(preset => preset.name)
                layerDataReset('acceleron', ['enhancements', 'entropy', 'loops', 'milestones', 'presets'])
                player.acceleron.upgrades = acceleronUpgrades
                acceleronProgress.forEach((loop, index) => player.acceleron.loops[index].progress = loop)
                player.acceleron.enhancements = acceleronEnhancements
                Object.keys(player.acceleron.presets).forEach(id => player.acceleron.presets[id].name = presetNames[id])

                let inflatonUpgrades = player.inflaton.upgrades.filter(id => [11,12,13,22,23,31,32,33].includes(id))
                let inflatonCosts = {...player.inflaton.upgradeCosts}
                layerDataReset('inflaton', ['autoBuild', 'autoResearch', 'repeatables', 'research', 'researchProgress', 'researchQueue', 'upgradeCosts'])
                player.inflaton.upgrades = inflatonUpgrades
                player.inflaton.upgradeCosts = inflatonCosts
                player.inflaton.repeatables[113] = decimalZero
                
                let timecubeTimelines = {...player.timecube.timelines}
                let timecubeScores = {...player.timecube.nextScores}
                let timecubeSelectors = Object.fromEntries(Object.keys(player.timecube.scores).map(id => [id, getClickableState('timecube', id)]))
                layerDataReset('timecube', ['upgrades', 'buyables', 'clickables'])
                player.timecube.timelines = timecubeTimelines
                player.timecube.activeTimelines = {...timecubeTimelines}
                player.timecube.scores = timecubeScores
                player.timecube.nextScores = {...timecubeScores}
                player.timecube.activeSelectors = timecubeSelectors

                layerDataReset('fome', ['autoProtoversal', 'autoInfinitesimal', 'autoSubspatial', 'autoSubplanck', 'autoQuantum', 'autoReform', 'milestones'])

                let skyrmionCosts = {...player.skyrmion.upgradeCosts}
                layerDataReset('skyrmion', ['autobuyPion', 'autobuySpinor', 'milestones', 'upgrades'])
                player.skyrmion.upgradeCosts = skyrmionCosts

                for (let i = 0; i < 10; i++)
                    updateTemp()

                player.timecube.enteredTimeline = true
            },
            style: {
                "min-height": "50px",
                width: "150px"
            }
        },
        11: {
            title: 'Top Left',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Top: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.top))}%<br>Left: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.left))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.top--
                    player.timecube.timelines.left--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.top++
                    player.timecube.timelines.left++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        12: {
            title: 'Top Front',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Top: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.top))}%<br>Front: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.front))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.top--
                    player.timecube.timelines.front--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.top++
                    player.timecube.timelines.front++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        13: {
            title: 'Top Back',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Top: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.top))}%<br>Back: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.back))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.top--
                    player.timecube.timelines.back--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.top++
                    player.timecube.timelines.back++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        14: {
            title: 'Top Right',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Top: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.top))}%<br>Right: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.right))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.top--
                    player.timecube.timelines.right--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.top++
                    player.timecube.timelines.right++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        21: {
            title: 'Front Left',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Front: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.front))}%<br>Left: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.left))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.front--
                    player.timecube.timelines.left--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.front++
                    player.timecube.timelines.left++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        22: {
            title: 'Front Right',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Front: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.front))}%<br>Right: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.right))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.front--
                    player.timecube.timelines.right--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.front++
                    player.timecube.timelines.right++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        23: {
            title: 'Back Left',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Back: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.back))}%<br>Left: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.left))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.back--
                    player.timecube.timelines.left--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.back++
                    player.timecube.timelines.left++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        24: {
            title: 'Back Right',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Back: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.back))}%<br>Right: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.right))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.back--
                    player.timecube.timelines.right--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.back++
                    player.timecube.timelines.right++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        31: {
            title: 'Bottom Left',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Bottom: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.bottom))}%<br>Left: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.left))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.bottom--
                    player.timecube.timelines.left--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.bottom++
                    player.timecube.timelines.left++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        32: {
            title: 'Bottom Front',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Bottom: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.bottom))}%<br>Front: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.front))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.bottom--
                    player.timecube.timelines.front--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.bottom++
                    player.timecube.timelines.front++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        33: {
            title: 'Bottom Back',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Bottom: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.bottom))}%<br>Back: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.back))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.bottom--
                    player.timecube.timelines.back--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.bottom++
                    player.timecube.timelines.back++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        },
        34: {
            title: 'Bottom Right',
            display() { return `Amount: ${format(player.timecube.scores[this.id])}<br>Bottom: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.bottom))}%<br>Right: +${format(clickableEffect('timecube', this.id).times(100).times(timelineBonusMultiplier.right))}%` },
            canClick: true,
            onClick() {
                if (getClickableState('timecube', this.id)) {
                    setClickableState('timecube', this.id, false)
                    player.timecube.timelines.bottom--
                    player.timecube.timelines.right--
                }
                else {
                    setClickableState('timecube', this.id, true)
                    player.timecube.timelines.bottom++
                    player.timecube.timelines.right++
                }
            },
            effect() { return player.timecube.scores[this.id].plus(1).log10().div(10) },
            onHold() {},
            style() {
                let style = {}
                style["background-color"] = getClickableState('timecube', this.id) ? temp.timecube.color : "var(--locked)"
                style["border-color"] = player.timecube.activeSelectors[this.id] ? temp.timecube.darker : "rgba(0,0,0,0.125)"
                return style
            }
        }
    },
    inTimeline() { return Object.values(player.timecube.activeTimelines).some(level => level>0) },
    baseScore() { return Object.values(player.timecube.activeTimelines).reduce((a,b) => a+b)/2 },
    skyrmionScore() { return ['pion', 'spinor'].map(type => player.skyrmion[type].points.plus(1).log10()).reduce((a,b) => a.plus(b)).div(10) },
    fomeScore() { return fomeTypes.map(type => player.fome.fome[type].points.plus(1).log10()).reduce((a,b) => a.plus(b)).div(50) },
    acceleronScore() { return player.acceleron.points.plus(1).log10() },
    inflatonScore() { return temp.inflaton.storage.plus(10).log10().log10().times(5) },
    timecubeScore() { return player.timecube.points.plus(1).log10() },
    timelineScore() {
        let baseScore = temp.timecube.baseScore
        let skyrmionScore = temp.timecube.skyrmionScore
        let fomeScore = temp.timecube.fomeScore
        let acceleronScore = temp.timecube.acceleronScore
        let inflatonScore = temp.timecube.inflatonScore
        let timecubeScore = temp.timecube.timecubeScore

        return skyrmionScore.times(fomeScore).times(acceleronScore).times(inflatonScore).times(timecubeScore).div(1e4).pow(baseScore)
    },
    timelineBonus() {
        return {
            front: [12,21,22,32].map(id => clickableEffect('timecube', id)).reduce(Decimal.add),
            left: [11,21,23,31].map(id => clickableEffect('timecube', id)).reduce(Decimal.add),
            top: [11,12,13,14].map(id => clickableEffect('timecube', id)).reduce(Decimal.add),
            back: [13,23,24,33].map(id => clickableEffect('timecube', id)).reduce(Decimal.add),
            right: [14,22,24,34].map(id => clickableEffect('timecube', id)).reduce(Decimal.add),
            bottom: [31,32,33,34].map(id => clickableEffect('timecube', id)).reduce(Decimal.add)
        }
    },

    buyables: {},
    squares: {
        front: {
            effect() { return getBuyableAmount('timecube', 'front').pow(0.45).times(defaultUpgradeEffect('timecube', 33)).plus(1) },
            display() { return `+${format(buyableEffect('timecube', 'front').minus(1).times(100))}% Time Cube gain` }
        },
        right: {
            effect() { return getBuyableAmount('timecube', 'right').pow(0.7).plus(1) },
            display() { return `+${format(buyableEffect('timecube', 'right'))}x Entropic Loop build speed` }
        },
        top: {
            effect() { return getBuyableAmount('timecube', 'top').pow(0.15).div(15).plus(1) },
            display() { return `+${format(buyableEffect('timecube', 'top').minus(1).times(100))}% increased Universe diameter`}
        },
        back: {
            effect() { return getBuyableAmount('timecube', 'back').pow(0.2).div(5).plus(1) },
            display() { return `+${format(buyableEffect('timecube', 'back').minus(1).times(100))}% Acceleron effect` }
        },
        left: {
            effect() { return getBuyableAmount('timecube', 'left').pow(0.5).plus(1) },
            display() { return `1/${format(buyableEffect('timecube', 'left'))}x Subspatial Construction cost` }
        },
        bottom: {
            effect() { return getBuyableAmount('timecube', 'bottom').pow(0.1).times(defaultUpgradeEffect('timecube', 34)) },
            display() { return `+${format(buyableEffect('timecube', 'bottom'))} effective Entropic Enhancements` }
        }
    },

    microtabs: {
        stuff: {
            "Time Cubes": {
                content: [
                    "blank",
                    "upgrades"
                ]
            },
            "Time Squares": {
                content: [
                    "blank",
                    ["row", [
                        ["clickable", "overTen"], ["clickable", "minusTen"], ["clickable", "minusOne"], "blank",
                        ["text-input", "buySquareAmount", decimalOne], "blank",
                        ["clickable", "plusOne"], ["clickable", "plusTen"], ["clickable", "timesTen"]
                    ]],
                    "blank",
                    ["component-table", [
                        [
                            ["buyable", "front"],
                            ["column", [["buyable", "frontBuy"], ["buyable", "frontBuyNext"], ["buyable", "frontBuyMax"]]],
                            "blank",
                            ["buyable", "left"],
                            ["column", [["buyable", "leftBuy"], ["buyable", "leftBuyNext"], ["buyable", "leftBuyMax"]]],
                            "blank",
                            ["buyable", "top"],
                            ["column", [["buyable", "topBuy"], ["buyable", "topBuyNext"], ["buyable", "topBuyMax"]]]
                        ],
                        ["blank"],
                        [
                            ["buyable", "back"],
                            ["column", [["buyable", "backBuy"], ["buyable", "backBuyNext"], ["buyable", "backBuyMax"]]],
                            "blank",
                            ["buyable", "right"],
                            ["column", [["buyable", "rightBuy"], ["buyable", "rightBuyNext"], ["buyable", "rightBuyMax"]]],
                            "blank",
                            ["buyable", "bottom"],
                            ["column", [["buyable", "bottomBuy"], ["buyable", "bottomBuyNext"], ["buyable", "bottomBuyMax"]]]
                        ]
                    ]]
                ],
                unlocked() { return hasUpgrade('timecube', 31) }
            },
            "Time Lines": {
                content: [["microtabs", "timeline"]],
                unlocked() { return hasUpgrade('timecube', 41) }
            }
        },
        timeline: {
            "Selectors": {
                content: [
                    "blank",
                    ["component-table", [
                        [["clickable", 11], ["clickable", 12], ["clickable", 13], ["clickable", 14]],
                        [["clickable", 21], ["clickable", 22], ["clickable", 23], ["clickable", 24]],
                        [["clickable", 31], ["clickable", 32], ["clickable", 33], ["clickable", 34]]
                    ]],
                    "blank",
                    () => temp.timecube.inTimeline ? ["display-text", `Score: ${format(temp.timecube.timelineScore)}`] : '',
                    () => temp.timecube.inTimeline ? "blank" : '',
                    ["display-text", 'Timeline Effects'],
                    ["component-table", [
                        [["display-text", "Square", {}, timelineLeftStyle], ["display-text", "Effect", {}, timelineMiddleStyle], ["display-text", "Active Effect", {}, timelineMiddleStyle], ["display-text", "Passive Bonus", {}, timelineRightStyle]],
                        [["display-text", `Front`, {}, timelineLeftStyle], ["display-text", `Time Cube gain`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('front'),0)} -> /${totalExponential(getNextTimelineEffect('front'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('front').times(100))}%`, {}, timelineRightStyle]],
                        [["display-text", `Left`, {}, timelineLeftStyle], ["display-text", `Foam gain`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('left'),0)} -> /${totalExponential(getNextTimelineEffect('left'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('left').times(100))}%`, {}, timelineRightStyle]],
                        [["display-text", `Top`, {}, timelineLeftStyle], ["display-text", `Universe size`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('top'),0)} -> /${totalExponential(getNextTimelineEffect('top'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('top').times(100))}%`, {}, timelineRightStyle]],
                        [["display-text", `Back`, {}, timelineLeftStyle], ["display-text", `Acceleron effect`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('back'),0)} -> /${totalExponential(getNextTimelineEffect('back'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('back').times(100))}%`, {}, timelineRightStyle]],
                        [["display-text", `Right`, {}, timelineLeftStyle], ["display-text", `Entropic Loop effect`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('right'),0)} -> /${totalExponential(getNextTimelineEffect('right'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('right').times(100))}%`, {}, timelineRightStyle]],
                        [["display-text", `Bottom`, {}, timelineLeftStyle], ["display-text", `Pion and Spinor gain`, {}, timelineMiddleStyle], ["display-text", () => `/${totalExponential(getTimelineEffect('bottom'),0)} -> /${totalExponential(getNextTimelineEffect('bottom'),0)}`, {}, timelineMiddleStyle], ["display-text", () => `+${format(getTimelineBonus('bottom').times(100))}%`, {}, timelineRightStyle]]
                    ]],
                    "blank",
                    ["clickable", "enterTimeline"]
                ]
            },
            "Info": {
                content: [
                    "blank",
                    ["styled-text", "Each active Timeline Selector grants a level in two alternate timelines, i.e. the Top Left selector grants a level in the Top timeline and the Left timeline.", {"max-width": "600px", "margin-bottom": "5px"}],
                    ["styled-text", "Timeline levels divide the production their corresponding resources by a flat amount, based on their level, while they're active.", {"max-width": "600px", "margin-bottom": "5px"}],
                    ["styled-text", "Progress in these alternate timelines will give you increased scores in those timelines, granting permanent cumulative bonuses to the timeline resources based on how far you go.", {"max-width": "600px", "margin-bottom": "5px"}],
                    ["styled-text", "Each active timeline will grant greater and greater rewards, but be warned, their strength may be beyond your abilities.", {"max-width": "600px", "margin-bottom": "5px"}],
                    ["styled-text", "Entering a Timeline will reset your currencies in all layers before Entangled Strings, as well as any Acceleron and Inflaton upgrades that provide production bonuses. Additionally, the Subspacial Construction repeatable is be reset to 0.", {"max-width": "600px"}],
                    "blank",
                    ["display-text", '<b>Timeline Score Calculation</b>'],
                    "blank",
                    ["component-table", [
                        [["display-text", "<b>Layer</b>"], ["display-text", "<b>Formula</b>"], ["display-text", "<b>Current Score</b>"]],
                        ["blank"],
                        [["display-text", "Skyrmion", {}, timelineLeftStyle], ["display-text", "[log10(pions) + log10(spinors)] / 10", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.skyrmionScore)}`, {}, timelineRightStyle]],
                        [["display-text", "Foam", {}, timelineLeftStyle], ["display-text", "sum(log10(foam amounts)) / 50", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.fomeScore)}`, {}, timelineRightStyle]],
                        [["display-text", "Acceleron", {}, timelineLeftStyle], ["display-text", "log10(accelerons)", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.acceleronScore)}`, {}, timelineRightStyle]],
                        [["display-text", "Inflaton", {}, timelineLeftStyle], ["display-text", "log10(log10(stored inflatons)) * 5", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.inflatonScore)}`, {}, timelineRightStyle]],
                        [["display-text", "Timecube", {}, timelineLeftStyle], ["display-text", "log10(timecubes)", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.timecubeScore)}`, {}, timelineRightStyle]],
                        [["display-text", "Timelines", {}, timelineLeftStyle], ["display-text", "active timeline selector count", {}, timelineMiddleStyle], ["display-text", () => `${Object.values(player.timecube.activeTimelines).reduce((a,b) => a+b)/2}`, {}, timelineRightStyle]],
                        [["display-text", "Total Score", {}, timelineLeftStyle], ["display-text", "(product of other scores / 1e4)^(active timeline count)", {}, timelineMiddleStyle], ["display-text", () => `${format(temp.timecube.timelineScore)}`, {}, timelineRightStyle]]
                    ]],
                ]
            }
        }
    },

    tabFormat: [
        "main-display",
        "blank",
        () => hasUpgrade('timecube', 31) ? ["microtabs", "stuff"] : "upgrades"
    ],

    hotkeys: [
        {
            key: "ctrl+c",
            onPress() { if (temp.timecube.layerShown === true) player.tab = 'timecube' }
        }
    ]
})

function totalExponential(num) {
    return Decimal.gt(num, 1) ? exponentialFormat(num, 0) : formatSmall(num, 0)
}

let baseSquareCost = new Decimal(1e6)
function createSquareBuyables(buyables) {
    let baseSize = 60
    let border = 25
    for (let id in layers.timecube.squares) {
        buyables[id] = {
            cost() { return new Decimal(Number.POSITIVE_INFINITY) },
            effect() { return temp.timecube.squares[id].effect },
            title: id[0].toUpperCase() + id.substring(1),
            display() { return `${temp.timecube.squares[id].display()}<br>Amount: ${formatWhole(getBuyableAmount('timecube', id))}`},
            canAfford: false,
            buy() {},
            style: {
                height: `${baseSize*3}px`,
                width: '150px',
                'border-radius': 0,
                'padding-left': '10px',
                'border-top-left-radius': `${border}px`,
                'border-bottom-left-radius': `${border}px`
            }
        }

        let buyId = `${id}Buy`
        buyables[buyId] = {
            cost() {
                let amount = getBuyableAmount('timecube', id)
                let buyAmount = player.timecube.buySquareAmount
                let totalAmount = amount.plus(buyAmount)
                let totalCost = totalAmount.plus(1).times(totalAmount).div(2)
                let currentCost = amount.plus(1).times(amount).div(2)
                return totalCost.minus(currentCost).times(baseSquareCost.div(decimalOne.plus(temp.timecube.timelineBonus[id])))
            },
            effect() {},
            title: 'Buy',
            display() { return `+${formatShort(player.timecube.buySquareAmount)}: ${formatWhole(temp.timecube.buyables[buyId].cost)}` },
            canAfford() { return player.timecube.points.gte(temp.timecube.buyables[buyId].cost) },
            buy() {
                player.timecube.points = player.timecube.points.minus(temp.timecube.buyables[buyId].cost)
                addBuyables('timecube', id, player.timecube.buySquareAmount)
            },
            style: {
                height: `${baseSize}px`,
                width: '100px',
                'border-radius': 0,
                'border-top-right-radius': `${border}px`
            }
        }

        let buyNextId = `${id}BuyNext`
        buyables[buyNextId] = {
            amount() {
                let amount = getBuyableAmount('timecube', id)
                let scale = amount.max(1).log10().floor()
                let mult = amount.dividedBy(scale.pow10()).floor()
                let total = mult.plus(1).times(scale.pow10())
                return total.minus(amount)
            },
            cost() {
                let amount = getBuyableAmount('timecube', id)
                let buyAmount = temp.timecube.buyables[buyNextId].amount
                let totalAmount = amount.plus(buyAmount)
                let totalCost = totalAmount.plus(1).times(totalAmount).div(2)
                let currentCost = amount.plus(1).times(amount).div(2)
                return totalCost.minus(currentCost).times(baseSquareCost.div(decimalOne.plus(hasUpgrade('timecube', 43) ? temp.timecube.timelineBonus[id] : 0)))
            },
            effect() {},
            title: 'Buy Next',
            display() { return `+${formatShort(temp.timecube.buyables[buyNextId].amount)}: ${formatWhole(temp.timecube.buyables[buyNextId].cost)}` },
            canAfford() { return player.timecube.points.gte(temp.timecube.buyables[buyNextId].cost) },
            buy() {
                player.timecube.points = player.timecube.points.minus(temp.timecube.buyables[buyNextId].cost)
                addBuyables('timecube', id, temp.timecube.buyables[buyNextId].amount)
            },
            style: {
                height: `${baseSize}px`,
                width: '100px',
                'border-radius': 0
            }
        }

        let buyMaxId = `${id}BuyMax`
        buyables[buyMaxId] = {
            amount() {
                let amount = getBuyableAmount('timecube', id)
                let currentCost = amount.plus(1).times(amount).div(2).times(baseSquareCost.div(decimalOne.plus(hasUpgrade('timecube', 43) ? temp.timecube.timelineBonus[id] : 0)))
                let total = player.timecube.points.max(1).plus(currentCost).div(baseSquareCost.div(decimalOne.plus(hasUpgrade('timecube', 43) ? temp.timecube.timelineBonus[id] : 0))).times(8).plus(1).sqrt().minus(1).div(2).floor()
                return total.minus(amount).max(1)
            },
            cost() {
                let amount = getBuyableAmount('timecube', id)
                let buyAmount = temp.timecube.buyables[buyMaxId].amount
                let totalAmount = amount.plus(buyAmount)
                let totalCost = totalAmount.plus(1).times(totalAmount).div(2)
                let currentCost = amount.plus(1).times(amount).div(2)
                return totalCost.minus(currentCost).times(baseSquareCost.div(decimalOne.plus(hasUpgrade('timecube', 43) ? temp.timecube.timelineBonus[id] : 0)))
            },
            effect() {},
            title: 'Buy Max',
            display() { return `+${formatShort(temp.timecube.buyables[buyMaxId].amount)}: ${formatWhole(temp.timecube.buyables[buyMaxId].cost)}` },
            canAfford() { return player.timecube.points.gte(temp.timecube.buyables[buyMaxId].cost) },
            buy() {
                player.timecube.points = player.timecube.points.minus(temp.timecube.buyables[buyMaxId].cost)
                addBuyables('timecube', id, temp.timecube.buyables[buyMaxId].amount)
            },
            style: {
                height: `${baseSize}px`,
                width: '100px',
                'border-radius': 0,
                'border-bottom-right-radius': `${border}px`
            }
        }
    }
}

function getNextTimelineEffect(square) { return getTimelineEffect(square, true) }

function getTimelineEffect(square, next = false) {
    let level = player.timecube[next ? 'timelines' : 'activeTimelines'][square]
    switch(square) {
        case 'front': return baseTimelineEffects['front'][level] // timecube
        case 'left': return baseTimelineEffects['left'][level] // foam
        case 'top': return baseTimelineEffects['top'][level] // universe
        case 'back': return baseTimelineEffects['back'][level] // acceleron
        case 'right': return baseTimelineEffects['right'][level] // loop
        case 'bottom': return baseTimelineEffects['bottom'][level] // skyrmion
    }
}

const timelineBonusMultiplier = {
    'front': 100,
    'left': 1000,
    'right': 0.01,
    'back': 1,
    'top': 1,
    'bottom': 1
}

function getTimelineBonus(square) {
    return Decimal.times(temp.timecube.timelineBonus[square], timelineBonusMultiplier[square])
}

const baseTimelineEffects = {
    'front': [decimalOne, new Decimal(1e8), new Decimal(1e80), new Decimal('1e800'), new Decimal('1e8000')], // timecube
    'left': [decimalOne, new Decimal(1e12), new Decimal(1e120), new Decimal('1e1200'), new Decimal('1e12000')], // foam
    'top': [decimalOne, new Decimal(1e3), new Decimal(1e30), new Decimal('1e300'), new Decimal('1e3000')], // universe
    'back': [decimalOne, new Decimal(1e6), new Decimal(1e60), new Decimal('1e600'), new Decimal('1e6000')], // acceleron
    'right': [decimalOne, new Decimal(1e2), new Decimal(1e20), new Decimal(1e200), new Decimal('1e2000')], // loop
    'bottom': [decimalOne, new Decimal(1e5), new Decimal(1e50), new Decimal('1e500'), new Decimal('1e5000')] // skyrmion
}