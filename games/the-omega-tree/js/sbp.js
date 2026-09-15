addLayer("pb", {
    name: "p", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P1", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    tooltip(){
        return "<h3>Points-1</h3><br>" + format(player.pb.points) + " P-1"
      },
      upgrades: {
        11: {
            title: "Sub-Points",
            description: "Every Points-1 you have multiplies point gain by 1.5x compounding.",
            cost: new Decimal(0),
            effect() {
                let effect = Decimal.pow(1.5, player[this.layer].points).min("57.67")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                },
  },
  autoUpgrade() { if (hasMilestone("hp" , 3)) return true},
    color: "white",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resetsNothing() {return hasMilestone("hp", 3)},
    autoPrestige() {
        return hasMilestone("hp", 3)
    },
    resource: "Points-1", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["up", "p"],
    canBuyMax() { return hasMilestone("hp", 2) },
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {if (inChallenge("hp", 12)) return new Decimal(3.3)
    else if (inChallenge("mp", 12)) return new Decimal("20")
    else if (inChallenge("hp", 51)) return new Decimal("5.4")
    else if (inChallenge("hp", 32)) return new Decimal("4.2")
    else if (inChallenge("hp", 31)) return new Decimal("3.6")
    else if (inChallenge("mp", 11)) return new Decimal("20")
    else return new Decimal(3)},      
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 72)) mult = mult.div(upgradeEffect('p', 72))
        if (hasUpgrade('p', 81)) mult = mult.div(upgradeEffect('p', 81))
        if (hasUpgrade('hp', 65)) mult = mult.div(upgradeEffect('hp', 65))
        if (hasUpgrade('hp', 71)) mult = mult.div(upgradeEffect('hp', 71))
        if (hasUpgrade('mp', 65)) mult = mult.div(upgradeEffect('mp', 65))
        if (hasUpgrade('mp', 82)) mult = mult.div(upgradeEffect('mp', 82))
        if (hasUpgrade('le', 11)) mult = mult.times(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){if (hasUpgrade("le", 11)) return false
    else return (hasUpgrade("up", 11) || player[this.layer].unlocked)},
})
