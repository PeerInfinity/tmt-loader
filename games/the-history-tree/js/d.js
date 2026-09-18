addLayer("d", {
    name: "Year 3 (2017)", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y3", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#4000ff",
    requires: new Decimal(1e40), // Can be a function that takes requirement increases into account
    branches: ["y2"],
    resource: "Ideas", // Name of prestige currency
    baseResource: "knowledge", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.80, // Prestige currency exponent

    effect(){
        let effect1 = new Decimal (1)
        if (player.c.points >= 1) effect1 = effect1.times(2).pow(player.c.points)
        if (hasChallenge('c', 11)) effect1 = effect1.times(player.c.points).pow(3)
        if (hasUpgrade('a', 24)) effect1 = effect1.times(upgradeEffect('a', 24))
        if (inChallenge('c', 11)) effect1 = Math.sqrt(effect1)
        if (inChallenge('c', 12)) effect1 = Math.sqrt(effect1)
        return effect1

  /*
    you should use this.layer instead of <layerID>
    Decimal.pow(num1, num2) is an easier way to do
    num1.pow(num2)
  */
    },
    effectDescription(){
        return "multiplying point gain by " + format(tmp[this.layer].effect)
        /*
          use format(num) whenever displaying a number
        */
      },
    canBuyMax() {
        return hasChallenge("c", 12)
        },
        
    milestones: {
            0: {requirementDescription: "5 Stars",
                done() {return player[this.layer].best.gte(5)}, // Used to determine when to give the milestone
                effectDescription: "Year 2 prestiges resets nothing, and gain 1% of the points you get every second.",
                effect() {
                    return player[this.layer].points.add(1).pow(0.22)
                },
                effect() {
                    return player.points.add(1).pow(0.21)
                },
            },
            1: {requirementDescription: "14 Stars",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(14)},
                effectDescription: "Get a boost on the layer boost formula",
                },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "3", description: "3: Reset for Ideas", onPress(p){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    effect() {
        let effect2 = new Decimal (1)
        if (player.d.points >= 1) effect2 = new Decimal (1.1).pow(player.d.points).add(3)
    },
    upgrades: {
    },
    layerShown(){return (player.a.points.gte(1e36))},
})