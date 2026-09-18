addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00CDFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
        mult = mult.times(player['a'].knowledgePoints.add(1).pow(0.08))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Begin",
            description: "Start generating points",
            cost: new Decimal(1),
        },
        12: {
            title: "Improved Production",
            description: "generate points 50% faster",
            cost: new Decimal(1),
            unlocked() {
                if (hasUpgrade('p', 11))
                 return true
                else
                 return false
            }
        },
        13: {
            title: "Production synergy",
            description: "Prestige points boost point production",
            cost: new Decimal(2),
            effect() {
                let eff = new Decimal(player[this.layer].points.add(1).pow(0.5))
                if (hasUpgrade('p', 23)) eff = eff.times(upgradeEffect('p', 23))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 11))
                 return true
                else
                 return false
            }
        },
        21: {
            title: "Reverse synergy",
            description: "Points boost prestige point production",
            cost: new Decimal(5),
            effect() {
                let eff = new Decimal(player.points.add(1).pow(0.15))
                if (hasUpgrade('p', 23)) eff = eff.times(upgradeEffect('p', 23))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 12))
                 return true
                else
                 return false
            }
        },
        22: {
            title: "Self synergy",
            description: "Points boost their own production",
            cost: new Decimal(8),
            effect() {
                let eff = new Decimal(player.points.add(1).pow(0.075))
                if (hasUpgrade('p', 23)) eff = eff.times(upgradeEffect('p', 23))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 21))
                 return true
                else
                 return false
            }
        },
        23: {
            title: "Synergy synergy",
            description: "Prestige points and points boost synergy effects",
            cost: new Decimal(15),
            effect() {
                if (hasMilestone('a', 0))
                return player.points.add(1).pow(0.3).add(player[this.layer].points).add(player['a'].points).pow(0.1)
                else
                return player.points.add(1).pow(0.3).add(player[this.layer].points).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 22) && hasUpgrade('p', 13))
                 return true
                else
                 return false
            }
        },
    },
    doReset(resettingLayer) {
        if (resettingLayer == 'a' && hasMilestone('a', 1))
        layerDataReset('p', [ "upgrades" ] )
        else if (resettingLayer != 'p')
        layerDataReset('p')
    }
})

addLayer("a", {
    name: "Advancements",
    symbol: "AV",
    position: 0,
    branches: [ "p" ],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        knowledgePoints: new Decimal(0)
    }},
    color: "#FF27AC",
    requires: new Decimal(200),
    resource: "Advancement points",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.4,
    gainMult(){
        mult = new Decimal(1)
        return mult
    },
    gainExp(){
        return new Decimal(1)
    },
    row: 1,
    layerShown(){
        if (player.points.gte(100) || player[this.layer].points.gte(1))
         return true
        else
         return false
    },
    effect() {
        return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
        KPGen: (player[this.layer].points.pow(1.5)),
        KPBuff: (player[this.layer].knowledgePoints.add(1).pow(0.08))
    }},
    effectDescription() { // Optional text to describe the effects
        eff = this.effect();
        //eff.waffleBoost = eff.waffleBoost.times(buyableEffect(this.layer, 11).first)
        return "which are generating "+format(eff.KPGen)+" knowledge points per second. you have "+format(player[this.layer].knowledgePoints)+" knowledge points which are boosting prestige point gain by "+format(eff.KPBuff)+"x."
    },
    canBuyMax(){
        if (hasMilestone('l', 0))
        return true
        else
        return false
    },
    update(diff){
        player[this.layer].knowledgePoints = player[this.layer].knowledgePoints.add(player[this.layer].points.pow(1.5).times(diff))
    },
    milestones: {
        0: {
            requirementDescription: "2 Advancement points",
            effectDescription: "Advancement points boost synergy synergy",
            done() { return player[this.layer].points.gte(2) }
        },
        1: {
            requirementDescription: "4 Advancement points",
            effectDescription: "Keep prestige upgrades on advancement reset",
            done() { return player[this.layer].points.gte(4) }
        },
        2: {
            requirementDescription: "6 Advancement points",
            effectDescription: "Unlock knowledge upgrades",
            done() { return player[this.layer].points.gte(6) }
        }
    },
    upgrades: {
        11: {
            title: "Common sense",
            description: "10x point gain",
            cost: new Decimal(1000),
            currencyDisplayName: "Knowledge points",
            currencyInternalName: "knowledgePoints",
            currencyLayer: "a",
            unlocked() {
                if (hasMilestone('a', 2))
                return true
                else
                return false
            }
        }
    }
})

addLayer("l", {
    name: "polygon",
    symbol: "PL",
    position: 1,
    branches: [ "p" ],
    startData() { return {
        unlocked: false,
		points: new Decimal(2),
    }},
    color: "#BFFF00",
    requires: new Decimal(75),
    resource: "Sides",
    baseResource: "Presitge Points",
    baseAmount() { return player['p'].points },
    type: "static",
    exponent: "0.7",
    gainMult(){
        mult = new Decimal(1)
        return mult
    },
    gainExp(){
        return new Decimal(1)
    },
    row: 1,
    layerShown(){
        if (player.points.gte(100) || player[this.layer].points.gte(3) || player['p'].points.gte(50))
         return true
        else
         return false
    },
    effect() {
        return {
            IA: (player[this.layer].points.minus(2).times(180).divide(player[this.layer].points)),
            PGen: (player[this.layer].points.minus(2).times(180).divide(player[this.layer].points).divide(2).times(player[this.layer].points.pow(0.25)).divide(100).plus(1))
        }
    },
    effectDescription() {
        eff = this.effect()
        return "Which have an interior angle of "+format(eff.IA)+"° which boosts point gain by "+format(eff.PGen)+"x"
    },
    canBuyMax(){
        return false
    },
    tooltipLocked() {
        return ("You need around 230 prestige points to unlock this layer. You only have " + formatWhole(player['p'].points))
    },
    milestones : {
        0: {
            requirementDescription: "Pentagon (5 sides)",
            effectDescription: "You can buy max advancements",
            done() { return player[this.layer].points.gte(5) }
        },
    }
})