addLayer("ai", {
    name: "ai", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    tooltip(){
        return "<h3>Air</h3><br>" + format(player.ai.points) + " Air"
      },
      upgrades: {
        11: {
            title: "Airs",
            description: "Every Air you have boosts energy and light by 5x",
            cost: new Decimal(0),
            effect() {
                let effect = Decimal.pow(5, player[this.layer].points).div(5).min("1e213")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                },
  },
  resetsNothing() {return hasMilestone("sa", 12)},
    autoPrestige() {
        return hasMilestone("sa", 12)
    },
    canBuyMax() { return hasMilestone("sa", 12) },
    autoUpgrade() { if (hasMilestone("sa" , 12)) return true},
    color: "blue",
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "Air", // Name of prestige currency
    baseResource: "Mega-Points", // Name of resource prestige is based on
    baseAmount() {return player.mp.points}, // Get the current amount of baseResource
    branches: ["mp"],
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2,    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('e', 15)) mult = mult.div(10)
        if (hasUpgrade('e', 21)) mult = mult.div(upgradeEffect('e', 21))
        if (hasUpgrade('e', 22)) mult = mult.div(upgradeEffect('e', 22))
        if (hasUpgrade('dp', 12)) mult = mult.times(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "A: Reset for Air", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){if (hasUpgrade("dp", 12)) return false
    else return (hasUpgrade("mp", 61) || player[this.layer].unlocked)},})
