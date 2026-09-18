addLayer("hP", {
    name: "happy prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "hP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#adf2d2",
    requires(){ 
        let requirement = new Decimal(40)
        if (hasUpgrade('hP', 12)) requirement = requirement.div(2)
        return requirement
    },
    resource: "happy prestige points", // Name of prestige currency
    baseResource: "golden prestige points", // Name of resource prestige is based on
    baseAmount() {return player.gP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.4, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.iP.unlocked) mult = mult.times(tmp.iP.effect)
        if (hasUpgrade('iP', 11)) mult = mult.times(2)
        if (hasUpgrade('iP', 13)) mult = mult.times(3)
        if (hasMilestone('jP', 12)) mult = mult.times(2)
        if (hasMilestone('jP', 13)) mult = mult.times(3)
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
        let eff = (player.hP.points.add(1)).pow(0.53)
        return eff
    },
    effectDescription() {
        dis = "which boosts Golden Prestige Point gain by "+format(tmp.hP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (player.A.unlocked) passive = new Decimal(0.1)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.pow(0.07)
        if (inChallenge('Ab', 12)) passive = new Decimal(0)
        return passive
    },
    branches: ["iP"],
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "h: Reset for happy prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('gP', 15) || player.hP.unlocked},
    milestones: {
        11: {
            requirementDescription: "1 Happy Prestige Points",
            effectDescription: `Keep content before Golden Prestige Points on Happy Prestige Reset<br>Passively gain 10% EP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.hP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Happy Prestige Points",
            effectDescription: `Triple Flattened Prestige Points & Ten-Fold Delta Prestige Point Gain`,
            done() { return player.hP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Happy Prestige Points",
            effectDescription: `Double Flattened Prestige Point Gain`,
            done() { return player.hP.points.gte(12) },
        },
        14: {
            requirementDescription: "25 Happy Prestige Points",
            effectDescription: `Cent-Fold Generator Power Gain`,
            done() { return player.hP.points.gte(25) },
        },
    },
    upgrades: {
        11: {
            title: "Happy Modern",
            description: "Double Golden Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Happy Normality",
            description: "/2 Happy Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('hP', 11) },
        },
        13: {
            title: "Happy Difference",
            description: "Triple Golden Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('hP', 12) },
        },
        14: {
            title: "Happy Association",
            description: "Ten-fold Community Prestige Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('hP', 13) },
        },
        15: {
            title: "Happy Luck",
            description: "Five-fold DeltaPrestige Point gain",
            cost: new Decimal(25),
            unlocked(){ return hasUpgrade('hP', 14) },
        },
        16: {
            title: "Happy Sanity",
            description: "^1.1 Point gain",
            cost: new Decimal(50),
            unlocked(){ return hasUpgrade('hP', 15) },
        },
    },
})