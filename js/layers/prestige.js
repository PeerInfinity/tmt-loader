addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#2BDC13",
    requires(){ 
        let requirement = new Decimal(5)
        if (hasUpgrade('p', 12)) requirement = requirement.div(2.5)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 24)) requirement = requirement.div(10)
        return requirement
    },
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.bP.unlocked) mult = mult.times(tmp.bP.effect)
        if (hasUpgrade('bP', 11)) mult = mult.times(2)
        if (hasUpgrade('bP', 13)) mult = mult.times(10)
        if (hasMilestone('cP', 12)) mult = mult.times(3)
        if (hasMilestone('eP', 12)) mult = mult.times(10)
        if (hasUpgrade('fP', 14)) mult = mult.times(20)
        if (hasUpgrade('iP', 16)) mult = mult.pow(1.1)
        if (player.g.unlocked) mult = mult.times(tmp.g.powerEff)
        if (player.jP.unlocked) mult = mult.times(tmp.jP.effect)
        if (hasMilestone('jP', 15)) mult = mult.times(1000000)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.div(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 21)) mult = mult.times(10)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 25)) mult = mult.times(100)
        if (inChallenge('Ab', 12) || inChallenge('Ab', 21)) mult = mult.pow(0.05)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    branches: ['bP', 'b'],
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration(){
        let passive = new Decimal(0)
        if (hasMilestone('dP', 11)) passive = new Decimal(0.1)
        if (hasMilestone('eP', 11)) passive = new Decimal(1)
        if (hasMilestone('fP', 11)) passive = new Decimal(10)
        if (hasMilestone('gP', 11)) passive = new Decimal(100)
        if (hasMilestone('hP', 11)) passive = new Decimal(1000)
        if (hasMilestone('iP', 11)) passive = new Decimal(10000)
        if (hasMilestone('jP', 11)) passive = new Decimal(100000)
        if (player.A.unlocked) passive = new Decimal(1000000)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12) || inChallenge('Ab', 21)) passive = new Decimal(0)
        return passive
    },
    layerShown(){return true},
doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer)
        // DP Keep
        if (hasMilestone('cP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('dP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('dP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('dP', 11)) player.bP.milestones.push('11')
        // EP Keep
        if (hasMilestone('eP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('eP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('eP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('eP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('eP', 11)) player.cP.milestones.push('11', '12')
        // FP Keep
        if (hasMilestone('fP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('fP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('fP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('fP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('fP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('fP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('fP', 11)) player.dP.milestones.push('11', '12', '13')
        // GP Keep
        if (hasMilestone('gP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('gP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('gP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('gP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('gP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('gP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('gP', 11)) player.dP.milestones.push('11', '12', '13')
        if (hasMilestone('gP', 11)) player.eP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('gP', 11)) player.eP.milestones.push('11', '12', '13')
        // HP Keep
        if (hasMilestone('hP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('hP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('hP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.dP.milestones.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.eP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('hP', 11)) player.eP.milestones.push('11', '12', '13')
        if (hasMilestone('hP', 11)) player.fP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('hP', 11)) player.fP.milestones.push('11', '12', '13', '14')
        // IP Keep
        if (hasMilestone('iP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('iP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('iP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.dP.milestones.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.eP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('iP', 11)) player.eP.milestones.push('11', '12', '13')
        if (hasMilestone('iP', 11)) player.fP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('iP', 11)) player.fP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('iP', 11)) player.gP.upgrades.push('11', '12', '13', '14', '15')
        if (hasMilestone('iP', 11)) player.gP.milestones.push('11', '12', '13', '14')
        // JP Keep
        if (hasMilestone('jP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('jP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('jP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.dP.milestones.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.eP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('jP', 11)) player.eP.milestones.push('11', '12', '13')
        if (hasMilestone('jP', 11)) player.fP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('jP', 11)) player.fP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('jP', 11)) player.gP.upgrades.push('11', '12', '13', '14', '15')
        if (hasMilestone('jP', 11)) player.gP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('jP', 11)) player.hP.upgrades.push('11', '12', '13', '14', '15', '16')
        if (hasMilestone('jP', 11)) player.hP.milestones.push('11', '12', '13', '14')
        // A KEEPING
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.p.upgrades.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.bP.upgrades.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.bP.milestones.push('11')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.cP.upgrades.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.cP.milestones.push('11', '12')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.dP.upgrades.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.dP.milestones.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.eP.upgrades.push('11', '12', '13', '14')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.eP.milestones.push('11', '12', '13')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.fP.upgrades.push('11', '12', '13', '14')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.fP.milestones.push('11', '12', '13', '14')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.gP.upgrades.push('11', '12', '13', '14', '15')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.gP.milestones.push('11', '12', '13', '14')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.hP.upgrades.push('11', '12', '13', '14', '15', '16')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.hP.milestones.push('11', '12', '13', '14')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.iP.upgrades.push('11', '12', '13', '14', '15', '16')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.iP.milestones.push('11', '12', '13', '14', '15')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.jP.upgrades.push('11', '12', '13', '14', '15', '16', '21')
        if (hasUpgrade('A', 11) && resettingLayer == "A") player.jP.milestones.push('11', '12', '13', '14', '15')

  // KP Keeping
        if (hasMilestone('kP', 11)) player.p.upgrades.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.bP.upgrades.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.bP.milestones.push('11')
        if (hasMilestone('kP', 11)) player.cP.upgrades.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.cP.milestones.push('11', '12')
        if (hasMilestone('kP', 11)) player.dP.upgrades.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.dP.milestones.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.eP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('kP', 11)) player.eP.milestones.push('11', '12', '13')
        if (hasMilestone('kP', 11)) player.fP.upgrades.push('11', '12', '13', '14')
        if (hasMilestone('kP', 11)) player.fP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('kP', 11)) player.gP.upgrades.push('11', '12', '13', '14', '15')
        if (hasMilestone('kP', 11)) player.gP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('kP', 11)) player.hP.upgrades.push('11', '12', '13', '14', '15', '16')
        if (hasMilestone('kP', 11)) player.hP.milestones.push('11', '12', '13', '14')
        if (hasMilestone('kP', 11)) player.iP.upgrades.push('11', '12', '13', '14', '15', '16')
        if (hasMilestone('kP', 11)) player.iP.milestones.push('11', '12', '13', '14', '15')
        if (hasMilestone('kP', 11)) player.jP.upgrades.push('11', '12', '13', '14', '15', '16', '21')
        if (hasMilestone('kP', 11)) player.jP.milestones.push('11', '12', '13', '14', '15')

},
    upgrades: {
        11: {
            title: "Modern",
            description: "Double point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Normality",
            description: "/2.5 Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('p', 11) },
        },
        13: {
            title: "Difference",
            description: "ten-fold point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('p', 12) },
        },
    },
})
