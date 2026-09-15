addLayer("pb5", {
    name: "p5", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P5", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    tooltip(){
        return "<h3>Points-5</h3><br>" + format(player.pb5.points) + " P-5"
      },
      upgrades: {
        11: {
            title: "Sub-Points^5",
            description: "Every Points-5 you have multiplies hyper-point gain by 10x compounding again but divide super-point gain by 10x compounding.",
            cost: new Decimal(0),
            effect() {
                let effect = Decimal.pow(10, player[this.layer].points).min("1e100")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" + " and /" + format(upgradeEffect(this.layer, this.id))  }, // Add formatting to the effect
     
        },
  },
  autoUpgrade() { if (hasMilestone("sa" , 2)) return true},

    color: "#500000",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resetsNothing() {return hasMilestone("sa", 2)},
    autoPrestige() {
        return hasMilestone("sa", 2)
    },
    resource: "Points-5", // Name of prestige currency
    canBuyMax() { return hasMilestone("sa", 2) },

    baseResource: "Super-Points", // Name of resource prestige is based on
    baseAmount() {return player.sp.points}, // Get the current amount of baseResource
    branches: ["e"],
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {if (inChallenge("hp", 12)) return new Decimal(11)
    else return new Decimal(5)},  
        gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('hp', 91)) mult = mult.div(upgradeEffect('hp', 91))
        if (hasUpgrade('le', 11)) mult = mult.times(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){if (hasUpgrade("le", 11)) return false
    else return (hasUpgrade("mp", 51) || player[this.layer].unlocked)},
})