addLayer("cB", {
    name: "community boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "cB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#4a6ce6",
    requires(){ 
        let requirement = new Decimal(2)
        return requirement
    },
    resource: "community boosters", // Name of prestige currency
    baseResource: "buffed boosters", // Name of resource prestige is based on
    baseAmount() {return player.bB.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.cB.points.times(player.cB.points)).add(4)
        eff = eff.times(tmp.cB.effectBase)
        return eff
    },
    effectBase(){
        let base = new Decimal(1)
        if (player.dB.unlocked) base = base.add(tmp.dB.effect)
        if (hasUpgrade('jP', 21)) base = base.times(10)
        return base
    },
    effectDescription() {
        dis = "which boosts Buffed Booster effect by "+format(tmp.cB.effect)+"x"
        return dis
    },
        resetsNothing() { return player.cB.unlocked },
    autoPrestige() { return hasUpgrade('A', 42) },
    branches: ["dB"],
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "2", description: "Number Key 2: Reset for Community Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('fP', 13) || player.cB.unlocked || player.gP.unlocked},  
})