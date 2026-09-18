addLayer("dP", {
    name: "delta prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "dP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#b3ed91",
    requires(){ 
        let requirement = new Decimal(10)
        if (hasUpgrade('dP', 12)) requirement = requirement.div(5)
        return requirement
    },
    resource: "delta prestige points", // Name of prestige currency
    baseResource: "community prestige points", // Name of resource prestige is based on
    baseAmount() {return player.cP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.55, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.eP.unlocked) mult = mult.times(tmp.eP.effect)
        if (hasUpgrade('eP', 11)) mult = mult.times(3)
        if (hasUpgrade('eP', 13)) mult = mult.times(10)
        if (hasMilestone('fP', 12)) mult = mult.times(2)
        if (hasMilestone('fP', 13)) mult = mult.times(3)
        if (hasMilestone('hP', 12)) mult = mult.times(10)
        if (hasUpgrade('hP', 15)) mult = mult.times(5)
        if (hasUpgrade('iP', 14)) mult = mult.times(10)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (inChallenge('Ab', 11) || inChallenge('Ab', 21)) mult = mult.div(tmp.A.boostEff)
        if (hasUpgrade('Ab', 16)) mult = mult.times(1e15)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 25)) mult = mult.times(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.dP.points.add(1)).pow(0.43)
        return eff
    },
    effectDescription() {
        dis = "which boosts Community Prestige Point gain by "+format(tmp.dP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (hasMilestone('gP', 11)) passive = new Decimal(0.1)
        if (hasMilestone('hP', 11)) passive = new Decimal(1)
        if (hasMilestone('iP', 11)) passive = new Decimal(10)
        if (hasMilestone('jP', 11)) passive = new Decimal(100)
        if (player.A.unlocked) passive = new Decimal(1000)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12) || inChallenge('Ab', 21)) passive = new Decimal(0)
        return passive
    },
    branches: ['eP', 'g'],
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "d: Reset for delta prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('cP', 13) || player.dP.unlocked},
        milestones: {
        11: {
            requirementDescription: "1 Delta Prestige Points",
            effectDescription: `Keep content before Community Prestige Points on Delta Prestige Reset<br>Passively gain 10% P Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.dP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Delta Prestige Points",
            effectDescription: `Triple Buffed Prestige Points & Ten-Fold Point Gain`,
            done() { return player.dP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Delta Prestige Points",
            effectDescription: `Double Buffed Prestige Point Gain`,
            done() { return player.dP.points.gte(12) },
        },
    },
    upgrades: {
        11: {
            title: "Delta Modern",
            description: "Triple Community Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Delta Normality",
            description: "/5 Delta Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('dP', 11) },
        },
        13: {
            title: "Delta Difference",
            description: "Twenty-fold Community Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('dP', 12) },
        },
    },
})