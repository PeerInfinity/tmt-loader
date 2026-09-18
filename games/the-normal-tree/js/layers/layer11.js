addLayer("kP", {
    name: "key prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "kP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#b85333",
    requires(){ 
        let requirement = new Decimal(350)
        if (hasUpgrade('kP', 12)) requirement = requirement.div(5)
        return requirement
    },
    resource: "key prestige points", // Name of prestige currency
    baseResource: "Ascension", // Name of resource prestige is based on
    baseAmount() {return player.A.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.kP.points.add(1)).pow(0.8)
        return eff
    },
    effectDescription() {
        dis = "which boosts Juggling Prestige Point gain by "+format(tmp.kP.effect)+"x"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        return passive
    },
    row: 11, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "k", description: "k: Reset for key prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('A', 61) || player.kP.unlocked},
    milestones: {
        11: {
            requirementDescription: "1 Key Prestige Points",
            effectDescription: `Keep content before Ascension on Key Prestige Reset, Auto-Prestige Ascension`,
            done() { return player.kP.points.gte(1) },
        },
        12: {
            requirementDescription: "3 Key Prestige Points",
            effectDescription: `Ascension resets nothing, 100,000x Juggling Prestige Points`,
            done() { return player.kP.points.gte(3) },
        },
        13: {
            requirementDescription: "5 Key Prestige Points",
            effectDescription: `Ascension Effect Base is increased by .1`,
            done() { return player.kP.points.gte(5) },
        },
    },
    upgrades: {
        11: {
            title: "Key Modern",
            description: "1e15x Juggling Prestige Points",
            cost: new Decimal(2),
        },
        12: {
            title: "Key Normality",
            description: "/5 Key Prestige Point requirement",
            cost: new Decimal(3),
            unlocked(){ return hasUpgrade('kP', 11) },
        },
        13: {
            title: "Juggling Difference",
            description: "1e25x Interest Prestige Points",
            cost: new Decimal(8),
            unlocked(){ return hasUpgrade('kP', 12) },
        },
        14: {
            title: "Key Association",
            description: "^1.2 Point Gain",
            cost: new Decimal(13),
            unlocked(){ return hasUpgrade('kP', 13) },
        },
        15: {
            title: "Key Luck",
            description: "^1.3 Buffed Prestige Points",
            cost: new Decimal(18),
            unlocked(){ return hasUpgrade('kP', 14) },
        },
    },
})