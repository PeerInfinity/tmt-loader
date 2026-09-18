addLayer("jP", {
    name: "juggling prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "jP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#ae55a6",
    requires(){ 
        let requirement = new Decimal(75)
        if (hasUpgrade('jP', 12)) requirement = requirement.div(3)
        return requirement
    },
    resource: "juggling prestige points", // Name of prestige currency
    baseResource: "interest prestige points", // Name of resource prestige is based on
    baseAmount() {return player.iP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (player.A.unlocked) mult = mult.times(tmp.A.boostEff)
        if (player.kP.unlocked) mult = mult.times(tmp.kP.effect)
        if (inChallenge('Ab', 11)) mult = mult.div(tmp.A.boostEff)
        if (inChallenge('Ab', 11)) mult = mult.pow(0.1)
        if (hasChallenge('Ab', 11)) mult = mult.pow(1.2)
        if (hasChallenge('Ab', 12)) mult = mult.pow(1.3)
        if (hasChallenge('Ab', 21)) mult = mult.pow(1.35)
        if (hasUpgrade('A', 51)) mult = mult.times(1e33)
        if (hasUpgrade('kP', 11)) mult = mult.times(1e15)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.jP.points.add(1)).pow(0.58)
        return eff
    },
    effectDescription() {
        dis = "which boosts Prestige & Interest Prestige Point gain by "+format(tmp.jP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        if (player.A.unlocked) passive = passive.plus(tmp.A.passiveEff.div(100))
        if (inChallenge('Ab', 11)) passive = new Decimal(0)
        return passive
    },
    branches: ["kP"],
    row: 9, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "j", description: "j: Reset for juggling prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('iP', 16) || player.jP.unlocked},
    milestones: {
        11: {
            requirementDescription: "1 Juggling Prestige Points",
            effectDescription: `Keep content before Interest Prestige Points on Juggling Prestige Reset<br>Passively gain 10% GP Points and it'll ten-fold the effect every new (layer)P`,
            done() { return player.jP.points.gte(1) },
        },
        12: {
            requirementDescription: "5 Juggling Prestige Points",
            effectDescription: `Triple Happy Prestige Points & Ten-Fold Flattened Prestige Point Gain`,
            done() { return player.jP.points.gte(5) },
        },
        13: {
            requirementDescription: "12 Juggling Prestige Points",
            effectDescription: `Double Happy Prestige Point Gain & Decrease Booster Requirement significantly`,
            done() { return player.jP.points.gte(12) },
        },
        14: {
            requirementDescription: "25 Juggling Prestige Points",
            effectDescription: `7500x Generator Power Gain`,
            done() { return player.jP.points.gte(25) },
        },
        15: {
            requirementDescription: "40 Juggling Prestige Points",
            effectDescription: `Mill-fold Prestige Gain`,
            done() { return player.jP.points.gte(40) },
        },
    },
    upgrades: {
        11: {
            title: "Juggling Modern",
            description: "Double Interest Prestige point gain",
            cost: new Decimal(2),
        },
        12: {
            title: "Juggling Normality",
            description: "/3 Juggling Prestige Point requirement",
            cost: new Decimal(6),
            unlocked(){ return hasUpgrade('jP', 11) },
        },
        13: {
            title: "Juggling Difference",
            description: "Triple Interest Prestige Point gain",
            cost: new Decimal(10),
            unlocked(){ return hasUpgrade('jP', 12) },
        },
        14: {
            title: "Juggling Association",
            description: "Ten-fold Exterior Prestige Point gain",
            cost: new Decimal(15),
            unlocked(){ return hasUpgrade('jP', 13) },
        },
        15: {
            title: "Juggling Luck",
            description: "Five-fold Flattened Prestige Point gain",
            cost: new Decimal(25),
            unlocked(){ return hasUpgrade('jP', 14) },
        },
        16: {
            title: "Juggling Sanity",
            description: "^1.1 Buffed Prestige Point gain",
            cost: new Decimal(50),
            unlocked(){ return hasUpgrade('jP', 15) },
        },
        21: {
            title: "Juggling Mentality",
            description: "Ten-Fold Community Booster Effect",
            cost: new Decimal(70),
            unlocked(){ return hasUpgrade('jP', 16) },
        },
    },
})