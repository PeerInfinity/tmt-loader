addLayer("dB", {
    name: "delta boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "dB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
                points: new Decimal(0),
    }},
    color: "#7955ed",
    requires(){ 
        let requirement = new Decimal(2)
        return requirement
    },
    resource: "delta boosters", // Name of prestige currency
    baseResource: "community boosters", // Name of resource prestige is based on
    baseAmount() {return player.cB.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect(){
        let eff = (player.dB.points.times(player.dB.points)).add(15)
        return eff
    },
    effectDescription() {
        dis = "which boosts Community Booster effect by "+format(tmp.dB.effect)+"x"
        return dis
    },
    resetsNothing() { return player.dB.unlocked },
    autoPrestige() { return hasUpgrade('A', 43)},
    row: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "3", description: "Number Key 3: Reset for Delta Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('hP', 16) || player.dB.unlocked || player.iP.unlocked},  
})