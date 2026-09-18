addLayer("gP", {
    name: "gold prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "gP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#fcf3d2",
    requires(){ 
        let requirement = new Decimal(25)
        if (hasUpgrade('gP', 12)) requirement = requirement.div(1.5)
        return requirement
    },
    resource: "golden prestige points", // Name of prestige currency
    baseResource: "flattened prestige points", // Name of resource prestige is based on
    baseAmount() {return player.fP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.hP.unlocked) mult = mult.times(tmp.hP.effect)
        if (hasUpgrade('hP', 11)) mult = mult.times(2)
        if (hasUpgrade('hP', 13)) mult = mult.times(3)
        if (hasMilestone('iP', 12)) mult = mult.times(2)
        if (hasMilestone('iP', 13)) mult = mult.times(3)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.div(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 26)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.gP.points.add(1)).pow(0.5)
        return eff
    },
    effectDescription() {
        dis = "which boosts Flattened Prestige Point gain by "+format(tmp.gP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (hasMilestone('jP', 11)) passive = new Decimal(0.1)
        if (player.A.unlocked) passive = new Decimal(1)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12)) passive = new Decimal(0)
        return passive
    },
    branches: ['hP'],
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "g: Reset for golden prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('fP', 14) || player.gP.unlocked},
    milestones: {
        11: {
            requirementDescription: "1 Golden Prestige Points",
            effectDescription: `Keep content before Flattened Prestige Points on Golden Prestige Reset<br>Passively gain 10% DP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.gP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Golden Prestige Points",
            effectDescription: `Triple Exterior Prestige Points & Ten-Fold Community Prestige Point Gain`,
            done() { return player.gP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Golden Prestige Points",
            effectDescription: `Double Exterior Prestige Point Gain`,
            done() { return player.gP.points.gte(12) },
        },
        14: {
            requirementDescription: "25 Golden Prestige Points",
            effectDescription: `Automate Buffed Boosters and have a better Buffed Prestige Points Effect`,
            done() { return player.gP.points.gte(25) },
        },
    },
    upgrades: {
        11: {
            title: "Golden Modern",
            description: "Double Flattened Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Golden Normality",
            description: "/1.5 Golden Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('gP', 11) },
        },
        13: {
            title: "Golden Difference",
            description: "Triple Flattened Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('gP', 12) },
        },
        14: {
            title: "Golden Association",
            description: "Ten-fold Buffed Prestige Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('gP', 13) },
        },
        15: {
            title: "Golden Luck",
            description: "Five-fold Community Prestige Point gain",
            cost: new Decimal(25),
            unlocked(){ return hasUpgrade('gP', 14) },
        },
    },
})