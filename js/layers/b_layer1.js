addLayer("b", {
    name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#4343de",
    requires(){ 
        let requirement = new Decimal(50)
        if (hasMilestone('jP', 13)) requirement = requirement.minus(20)
        if (hasChallenge('Ab', 21)) requirement = requirement.pow(0.3)
        return requirement
    },
    resource: "boosters", // Name of prestige currency
    baseResource: "buffed prestige points", // Name of resource prestige is based on
    baseAmount() {return player.bP.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.7, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.b.points.times(player.b.points)).add(1)
        eff = eff.times(tmp.b.effectBase)
        if (hasUpgrade('Ab', 15)) eff = eff.pow(1.2)
        if (inChallenge('Ab', 11)) eff = eff.pow(1.6)
        return eff
    },
    effectBase(){
        let base = new Decimal(1)
        if (player.bB.unlocked) base = base.add(tmp.bB.effect)
        if (hasMilestone('fP', 14)) base = base.times(2.5)
        return base
},
    effectDescription() {
        dis = "which boosts point gain by "+format(tmp.b.effect)+"x"
        return dis
    },
    resetsNothing() { return player.b.unlocked },
    autoPrestige() { return hasMilestone('fP', 14) },
    branches: ['bB'],
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "B", description: "shift + b: Reset for Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('bP', 13) || player.b.unlocked || player.cP.unlocked},  
})