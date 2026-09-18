addLayer("iP", {
    name: "interest prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "iP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#acf552",
    requires(){ 
        let requirement = new Decimal(60)
        if (hasUpgrade('iP', 12)) requirement = requirement.div(3)
        return requirement
    },
    resource: "interest prestige points", // Name of prestige currency
    baseResource: "happy prestige points", // Name of resource prestige is based on
    baseAmount() {return player.hP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.jP.unlocked) mult = mult.times(tmp.jP.effect)
        if (hasUpgrade('jP', 11)) mult = mult.times(2)
        if (hasUpgrade('jP', 13)) mult = mult.times(3)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.div(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (inChallenge('Ab', 11) && hasUpgrade('Ab', 26)) mult = mult.times(10)
        if (hasUpgrade('kP', 13)) mult = mult.times(1e25)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.iP.points.add(1)).pow(0.56)
        return eff
    },
    effectDescription() {
        dis = "which boosts Happy Prestige Point gain by "+format(tmp.iP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = passive.minus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 12)) passive = new Decimal(0)
        return passive
    },
    branches: ["jP"],
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "i", description: "i: Reset for interest prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('hP', 16) || player.iP.unlocked},
    milestones: {
        11: {
            requirementDescription: "1 Interest Prestige Points",
            effectDescription: `Keep content before Happy Prestige Points on Interest Prestige Reset<br>Passively gain 10% FP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.iP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Interest Prestige Points",
            effectDescription: `Triple Golden Prestige Points & Ten-Fold Exterior Prestige Point Gain`,
            done() { return player.iP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Interest Prestige Points",
            effectDescription: `Double Golden Prestige Point Gain`,
            done() { return player.iP.points.gte(12) },
        },
        14: {
            requirementDescription: "25 Interest Prestige Points",
            effectDescription: `1500x Generator Power Gain`,
            done() { return player.iP.points.gte(25) },
        },
        15: {
            requirementDescription: "40 Interest Prestige Points",
            effectDescription: `Mili-fold Point Gain`,
            done() { return player.iP.points.gte(40) },
        },
    },
    upgrades: {
        11: {
            title: "Interest Modern",
            description: "Double Happy Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Interest Normality",
            description: "/3 Interest Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('iP', 11) },
        },
        13: {
            title: "Interest Difference",
            description: "Triple Happy Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('iP', 12) },
        },
        14: {
            title: "Interest Association",
            description: "Ten-fold Delta Prestige Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('iP', 13) },
        },
        15: {
            title: "Interest Luck",
            description: "Five-fold Exterior Prestige Point gain",
            cost: new Decimal(25),
            unlocked(){ return hasUpgrade('iP', 14) },
        },
        16: {
            title: "Interest Sanity",
            description: "^1.1 Prestige Point gain",
            cost: new Decimal(50),
            unlocked(){ return hasUpgrade('iP', 15) },
        },
    },
})