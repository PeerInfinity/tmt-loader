addLayer("eP", {
    name: "exterior prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "eP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#b0aa91",
    requires(){ 
        let requirement = new Decimal(20)
        if (hasUpgrade('eP', 12)) requirement = requirement.div(5)
        return requirement
    },
    resource: "exterior prestige points", // Name of prestige currency
    baseResource: "delta prestige points", // Name of resource prestige is based on
    baseAmount() {return player.dP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.fP.unlocked) mult = mult.times(tmp.fP.effect)
        if (hasUpgrade('fP', 11)) mult = mult.times(2)
        if (hasUpgrade('fP', 13)) mult = mult.times(3)
        if (hasMilestone('gP', 12)) mult = mult.times(2)
        if (hasMilestone('gP', 13)) mult = mult.times(3)
        if (hasMilestone('iP', 12)) mult = mult.times(10)
        if (hasUpgrade('iP', 15)) mult = mult.times(5)
        if (hasUpgrade('jP', 14)) mult = mult.times(10)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.div(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 25)) mult = mult.times(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.eP.points.add(1)).pow(0.45)
        return eff
    },
    effectDescription() {
        dis = "which boosts Delta Prestige Point gain by "+format(tmp.eP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (hasMilestone('hP', 11)) passive = new Decimal(0.1)
        if (hasMilestone('iP', 11)) passive = new Decimal(1)
        if (hasMilestone('jP', 11)) passive = new Decimal(10)
        if (player.A.unlocked) passive = new Decimal(100)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12) || inChallenge('Ab', 21)) passive = new Decimal(0)
        return passive
    },
    branches: ['fP'],
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "e: Reset for exterior prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('dP', 13) || player.eP.unlocked},
        milestones: {
        11: {
            requirementDescription: "1 Exterior Prestige Points",
            effectDescription: `Keep content before Delta Prestige Points on Exterior Prestige Reset<br>Passively gain 10% BP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.eP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Exterior Prestige Points",
            effectDescription: `Triple Community Prestige Points & Ten-Fold Prestige Point Gain`,
            done() { return player.eP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Exterior Prestige Points",
            effectDescription: `Double Community Prestige Point Gain`,
            done() { return player.eP.points.gte(12) },
        },
    },
    upgrades: {
        11: {
            title: "Exterior Modern",
            description: "Triple Delta Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Exterior Normality",
            description: "/5 Exterior Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('eP', 11) },
        },
        13: {
            title: "Exterior Difference",
            description: "Ten-fold Delta Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('eP', 12) },
        },
        14: {
            title: "Exterior Association",
            description: "Cent-fold Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('eP', 13) },
        },
    },
})