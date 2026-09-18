addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    passiveGeneration() { return (hasMilestone("b", 1)?1:0 )},
    color: "gold",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("b", 0) && (resettingLayer=="b" || resettingLayer=='g')) keep.push("upgrades")
        if (hasMilestone("bb", 0) && resettingLayer=="bb") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
    },
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Point++",
            description: "Add one to point gain",
            cost: new Decimal(1),
        },
        12: {
            title: "Point *= 1",
            description: "Points are unchanged...for now",
            cost: new Decimal(1),
            unlocked () {return hasUpgrade("p", 11)},
        },
        13: {
            title: "Base Boost",
            description: "Now has ended: +1 to previous upgrade bases",
            cost: new Decimal(1),
            unlocked () {return hasUpgrade("p", 11)},
        },
        21: {
            title: "PPAB",
            description: "Prestige Points Add Base by log base 2",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(2).log10().times(3.322)
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
            unlocked () {return hasUpgrade("p", 11)},
        },
        22: {
            title: "Upgrade Power",
            description: "# of upgrades multiply base",
            cost: new Decimal(50),
            effect() {
                let FX = new Decimal(1.5)
                FX = FX.pow(player.p.upgrades.length)
                return FX
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
            unlocked () {return hasUpgrade("p", 11)},
        },
        23: {
            title: "RPB",
            description: "Points multiply Prestige Points by log10 ^0.5",
            cost: new Decimal(250),
            effect() {
                let Exponent = new Decimal(0.5)
                if (hasUpgrade('p', 31)) Exponent = Exponent.add(upgradeEffect('p', 31))
                return player.points.add(1).log10().pow(Exponent).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
            unlocked () {return hasUpgrade("p", 11)},
        },
        31: {
            title: "BBPUE",
            description: "Boosters Boost Previous Upgrade Exponent",
            cost: new Decimal("e216,632,083"),
            unlocked () {return hasUpgrade("b", 22)},
            effect() {
                return player.b.points.add(1).pow(3)
            },
            effectDisplay() { return "Exponent +" + format(upgradeEffect(this.layer, this.id)) },
        },
        32: {
            title: "GPB",
            description: "Generic Prestige Boost",
            cost: new Decimal("e8.897e28"),
            unlocked () {return hasUpgrade("b", 22)},
            effect() {
                let n = new Decimal(10)
                let expo = n.pow(player.p.points.add(1).log10().add(1).log10().pow(0.5).add(1))
                if (hasUpgrade('bb', 22)) expo = expo.pow(upgradeEffect('bb', 22))
                return expo
            },
            effectDisplay() { return "Total point gain ^" + format(upgradeEffect(this.layer, this.id)) },
        },
        33: {
            title: "Things go boom",
            description: "Apply <b>MORE POINTS</b> again, but far weaker",
            cost: new Decimal("e2.299e325"),
            unlocked () {return hasUpgrade("b", 22)},
        },
    },
    getBase() {
        let base = new Decimal(1)
        if (hasUpgrade("p", 13)) base = base.add(1)
        if (hasUpgrade("p", 21)) base = base.add(upgradeEffect("p", 21))
        if (hasUpgrade("p", 22)) base = base.times(upgradeEffect("p", 22))
        if (player.g.unlocked) base = base.times(tmp.g.powerEff)
        if ((player.b.points.gte(1)) && hasUpgrade("b", 11)) base = base.times(upgradeEffect("b", 11))
        if (hasUpgrade("b", 21)) base = base.pow(upgradeEffect("b", 21))
        if (hasUpgrade('g', 12) && player.g.points.gte(1)) base = base.pow(upgradeEffect('g', 12))
        if (hasUpgrade('bb', 23) && player.bb.points.gte(1)) base = base.pow(upgradeEffect('bb', 23))
        return base
    },
})

addLayer("b", {
    name: "booster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    resetsNothing() { return hasMilestone("b", 2) },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("bb", 0) && resettingLayer=="bb") {
            keep.push("upgrades")
            keep.push("milestones")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
    },
    branches: ["p"],
    color: "blue",
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "boosters", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1.25),
    base: new Decimal(5),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    hotkeys: [
        {key: "b", description: "Press B to perform a booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    autoPrestige() { return (hasMilestone("b", 3)) },
    canBuyMax() { return hasMilestone("b", 3) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "7 Boosters",
            done() { return player.b.best.gte(7) },
            effectDescription: "Keep Prestige Upgrades on reset.",
        },
        1: {
            requirementDescription: "30 Boosters",
            done() { return player.b.best.gte(30) },
            effectDescription: "Gain 100% of PP gain per second.",
        },
        2: {
            requirementDescription: "300 Boosters",
            done() { return player.b.best.gte(300) },
            effectDescription: "Boosters no longer reset.",
        },
        3: {
            requirementDescription: "1337 Boosters",
            done() { return player.b.best.gte(1337) },
            effectDescription: "Finally auto-buy-max boosters"
        },
    },
    upgrades: {
        11: {
            title: "Booster Effect",
            description: "Boosters double first 2 PP upgrades each",
            cost: new Decimal(1),
            effect() {
                let Boost = new Decimal(2)
                if (hasUpgrade('b', 12)) Boost = Boost.add(1)
                if (hasUpgrade('b', 13)) Boost = Boost.add(upgradeEffect('b', 13))
                if (hasUpgrade('bb', 11)) Boost = Boost.times(upgradeEffect('bb', 11))
                Boost = Boost.pow(player[this.layer].points)
                if (hasUpgrade('b', 31) && player.bb.points.gte(1)) Boost = Boost.pow(upgradeEffect('b', 31))
                return Boost
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        12: {
            title: "Booster Booster",
            description: "Add one to booster base",
            cost: new Decimal(4),
        },
        13: {
            title: "PPBBB",
            description: "Prestige Points Boost Booster Base",
            cost: new Decimal(7),
            effect() {
                let boost = player.p.points.add(1).log10().div(2)
                if (boost.gte(15)) boost = boost.pow(0.5).times(3.873)
                if (boost.gte(50)) boost = boost.pow(0.5).times(7.071)
                return boost
            },
            effectDisplay() {
                return ('+' + format(upgradeEffect(this.layer, this.id)))
            },
        },
        21: {
            title: "FINALLY an exponent",
            description: "Boosters raise base, AFTER effect",
            cost: new Decimal(0),
            unlocked() {return player.b.points.gte(859)},
            effect() {
                let base = player[this.layer].points.add(10).log10()
                if (hasUpgrade('b', 23)) base = base.pow(base.add(1).pow(0.25))
                if (hasUpgrade('p', 33)) base = base.pow(base.add(1).log10()).pow(2)
                if (hasUpgrade('bb', 21)) base = base.pow(base.add(1).log10().add(1).log10())
                return base
            },
            effectDisplay() {
                return ("^" + format(upgradeEffect(this.layer, this.id)))
            },
        },
        22: {
            title: "More Prestige Upgrades",
            description: "Unlock one more row of prestige upgrades",
            cost: new Decimal(18473380),
        },
        23: {
            title: "MORE POINTS",
            description: "Raise <b>Finally an exponent</b> to its fourth root",
            cost: new Decimal("7.07e77"),
        },
        31: {
            title: 'BBE',
            description: 'Booster Boosters are an exponent',
            cost: new Decimal('3e26,921'),
            effect() {
                BBs = player.bb.points
                if (hasUpgrade('bb', 13)) BBs = BBs.pow(3)
                if (hasUpgrade('b', 32)) BBs = BBs.pow(player.g.power.add(1).log10().add(1).log10().add(1).pow(2/3))
                if (hasUpgrade('b', 33)) BBs = BBs.pow(upgradeEffect('b', 33))
                return BBs
            },
        },
        32: {
            title: 'Boost. It. AGAIN!',
            description: '<b>BBE</b> is boosted',
            cost: new Decimal('e3464871'),
        },
        33: {
            title: 'BBBEbBB',
            description: 'Boost BBE by Booster Boosters',
            cost: new Decimal('e111280596'),
            effect() {
                return player.bb.points.pow(0.5)
            },
            effectDescription() {
                return "^" + format(upgradeEffect('b', 33))
            },
        },
    },
})

addLayer("bb", {
    name: "booster booster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    resetsNothing() {
        return hasMilestone('l', 0)
    },
    autoPrestige() {
        return hasMilestone('l', 0)
    },
    canBuyMax() {
        return hasMilestone('l', 0)
    },
    branches: ["b"],
    color: "blue",
    requires: new Decimal("e26907"), // Can be a function that takes requirement increases into account
    resource: "booster boosters", // Name of prestige currency
    baseResource: "boosters", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal("3"),
    base: new Decimal("2"),
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    hotkeys: [
        {key: "B", description: "Press Shift-B to perform a booster booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "2 Booster Boosters",
            done() { return player.bb.best.gte(2) },
            effectDescription: "Keep Prestige and Booster Upgrades and Milestones on reset.",
        },
    },
    upgrades: {
        11: {
            title: 'Booster Booster Effect',
            description: 'Booster boosters multiply booster base by 10 each',
            cost: new Decimal(0),
            unlocked() {
                return (player.bb.points.gte(1) || hasUpgrade('bb', 11))
            },
            effect() {
                let BBBase = new Decimal(10)
                let BBs = player.bb.points
                if (hasUpgrade('bb', 12)) BBBase = BBBase.pow(3)
                BBBase = BBBase.pow(BBs)
                return BBBase
            },
            effectDisplay() {
                return format(upgradeEffect('bb', 11)) + "x"
            },
        },
        12: {
            title: "Booster Booster Boost",
            description: "Cube BB effect",
            cost: new Decimal(4),
        },
        13: {
            title: "<-- Boost plz",
            description: 'Previous upgrade is applied to <b>BBE</b>',
            cost: new Decimal(0),
            unlocked() {
                return (hasUpgrade(this.layer, this.id) || player.bb.points.gte(5))
            },
        },
        21: {
            title: 'BOOSTER, BOOSTER ROCKET',
            description: "Big boost. 'Nuff said.",
            cost: new Decimal(17),
            unlocked() {
                return (hasUpgrade(this.layer, this.id) || player.bb.points.gte(5))
            },
        },
        22: {
            title: 'BGPB',
            description: 'Boost Generic Prestige Boost based on BB',
            cost: new Decimal(273),
            effect() {
                return player.bb.points
            },
            effectDisplay() {
                return "^" + format(upgradeEffect('bb', 22))
            },
        },
        23: {
            title: 'MORE EXPONENTS',
            description: 'Raise prestige base based on BB',
            cost: new Decimal(7714),
            effect() {
                return player.bb.points.pow(1e100)
            },
            effectDisplay() {
                return "^" + format(upgradeEffect('bb', 23))
            },
        },
    },
})

addLayer("g", {
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
    }},
    tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text", function() {return 'You have ' + format(player.g.power) + ' Generator Power, which boosts PP bases by '+format(tmp.g.powerEff)+'x'}],
            "blank", "blank", "upgrades"],

    resetsNothing() {return (hasMilestone('bb', 0)&&player.l.points.gte(1))},
    autoPrestige() { return (hasMilestone('bb', 0)&&player.l.points.gte(1)) },
    canBuyMax() { return (hasMilestone('bb', 0)&&player.l.points.gte(1)) },
    hotkeys: [
        {key: "g", description: "Press G to perform a generator reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    color: "#00ff00",
    resource: "generators",
    row: 1,
    position: 1,
    branches: ["p"],

    baseResource: "points",
    baseAmount() { return player.points },

    requires() {
        let infinite = new Decimal("eeeeeee10")
        if (player.l.points.eq(0)) return infinite
        return new Decimal(1e5)
    },

    type: "static",
    exponent: new Decimal('1.25'),
    base: new Decimal('5'),

    gainMult() {
        return new Decimal(1)
    },
    gainExp() {
        return new Decimal(1)
    },

    layerShown() { return player.l.points.gte(1) },

    effBase() {
        let base = new Decimal(2)
        if (hasUpgrade('g', 11)) base = new Decimal(1e100)
        return base
    },
    
    effect() {
        if (!player[this.layer].unlocked) return new Decimal(0)
        let gens = player.g.points
        let effect = Decimal.pow(this.effBase(), gens).sub(1).max(0)
        if (hasUpgrade('g', 13)) effect = effect.pow(upgradeEffect('g', 13))
        return effect
    },

    effectDescription() {
        return "which are generating "+format(tmp.g.effect)+" Generator Power/sec"
    },

    update(diff) {
		if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff))
	},

    powerExp() {
        let exp = new Decimal(1/2)
        if (hasUpgrade('g', 11)) exp = new Decimal(1e100)
        return exp
    },
    powerEff() {
        if (!player[this.layer].unlocked) return new Decimal(1)
        return player.g.power.plus(1).pow(this.powerExp())
    },
    
    doReset(resettingLayer) {
        let keep = []
        player.g.power = new Decimal(0);
        if (hasMilestone("bb", 0) && resettingLayer=="bb") {
            keep.push("upgrades")
            keep.push("milestones")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
    },

    upgrades: {
        11: {
            title: 'Generators OP?',
            description: 'Boost the generator formula A LOT',
            cost: new Decimal("2e26,951"),
        },
        12: {
            title: "GPAE",
            description: "Generator Power Also Exponents",
            cost: new Decimal('e3042928'),
            effect() {
                return player.g.power.add(1).log10().add(1).pow(0.01)
            },
            effectDisplay() {
                return ('^' + format(upgradeEffect(this.layer, this.id)))
            },
        },
        13: {
            title: "GPGBBB",
            description: "Generator Power Gain Booster Booster Boosted",
            cost: new Decimal('e65527787'),
            effect() {
                return new Decimal(1e10).pow(player.bb.points.pow(2))
            },
            effectDisplay() {
                return "^" + format(upgradeEffect('g', 13))
            },
        },
    },
})

addLayer("l", {
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},

    color: "white",
    resource: "layers",
    row: 3,

    baseResource: "booster boosters",
    baseAmount() { return player.bb.points },

    requires: new Decimal('6'),

    type: "static",
    exponent: new Decimal('eee100000'),
    base: new Decimal('eee100000'),

    gainMult() {
        return new Decimal(1)
    },
    gainExp() {
        return new Decimal(1)
    },

    layerShown() { return (player.bb.points.gte(6)||player.l.points.gte(1)) },

    upgrades: {
    },

    milestones: {
        0: {
            requirementDescription: "1 Layer",
            done() { return player.l.best.gte(1) },
            effectDescription: "Auto-buy-max BBs, unlock generators",
        }
    },
})