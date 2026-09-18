addLayer("fP", {
    name: "flattened prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "fP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#d9f0c7",
    requires(){ 
        let requirement = new Decimal(50)
        if (hasUpgrade('fP', 12)) requirement = requirement.div(1.5)
        return requirement
    },
    resource: "flattened prestige points", // Name of prestige currency
    baseResource: "exterior prestige points", // Name of resource prestige is based on
    baseAmount() {return player.eP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.4, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.gP.unlocked) mult = mult.times(tmp.gP.effect)
        if (hasUpgrade('gP', 11)) mult = mult.times(2)
        if (hasUpgrade('gP', 13)) mult = mult.times(3)
        if (hasMilestone('hP', 12)) mult = mult.times(2)
        if (hasMilestone('hP', 13)) mult = mult.times(3)
        if (hasMilestone('jP', 12)) mult = mult.times(10)
        if (hasUpgrade('jP', 15)) mult = mult.times(5)
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
        let eff = (player.fP.points.add(1)).pow(0.48)
        return eff
    },
    effectDescription() {
        dis = "which boosts Exterior Prestige Point gain by "+format(tmp.fP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (hasMilestone('iP', 11)) passive = new Decimal(0.1)
        if (hasMilestone('jP', 11)) passive = new Decimal(1)
        if (player.A.unlocked) passive = new Decimal(10)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12)) passive = new Decimal(0)
        return passive
    },
    branches: ["gP",'g'],
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "f: Reset for flattened prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('eP', 14) || player.fP.unlocked},
        milestones: {
        11: {
            requirementDescription: "1 Flattened Prestige Points",
            effectDescription: `Keep content before Exterior Prestige Points on Flattened Prestige Reset<br>Passively gain 10% CP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.fP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Flattened Prestige Points",
            effectDescription: `Triple Delta Prestige Points & Ten-Fold Buffed Prestige Point Gain`,
            done() { return player.fP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Flattened Prestige Points",
            effectDescription: `Double Delta Prestige Point Gain`,
            done() { return player.fP.points.gte(12) },
        },
        14: {
            requirementDescription: "25 Flattened Prestige Points",
            effectDescription: `Automate Boosters and Better Booster Effect`,
            done() { return player.fP.points.gte(25) },
        },
    },
    upgrades: {
        11: {
            title: "Flattened Modern",
            description: "Double Exterior Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Flattened Normality",
            description: "/1.5 Flattened Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('fP', 11) },
        },
        13: {
            title: "Flattened Difference",
            description: "Triple Exterior Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('fP', 12) },
        },
        14: {
            title: "Flattened Association",
            description: "Twenty-fold Prestige Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('fP', 13) },
        },
    },
})