addLayer("bB", {
    name: "buffed boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "bB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#6a6ce6",
    requires(){ 
        let requirement = new Decimal(2.5)
        return requirement
    },
    resource: "buffed boosters", // Name of prestige currency
    baseResource: "boosters", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.05, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.bB.points.times(player.bB.points)).add(3)
        eff = eff.times(tmp.bB.effectBase)
        return eff
    },
    effectBase(){
        let base = new Decimal(1)
        if (player.cB.unlocked) base = base.add(tmp.cB.effect)
        return base
    },
    effectDescription() {
        dis = "which boosts Booster effect by "+format(tmp.bB.effect)+"x"
        return dis
    },
    resetsNothing() { return player.bB.unlocked },
    autoPrestige() { return hasMilestone('gP', 14) },
    branches: ["cB"],
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "1", description: "Number Key 1: Reset for Buffed Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('dP', 13) || player.bB.unlocked || player.eP.unlocked},  
})