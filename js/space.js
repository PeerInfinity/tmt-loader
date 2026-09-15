addLayer("sa", {
    upgrades: {
        11: {
            title: "Hypno-boost",
            description: "Space increases time.",
            cost: new Decimal(500),
            effect() {
                let effect = player.sa.points.add(1).log(10).pow(0.75)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "Uneven space-boost",
            description: "Singularities boost space.",
            cost: new Decimal(1000),
            effect() {
                let effect = player.s.points.add(2).pow(15).log(20)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Unfairness",
            description: "Gain more grams upon space-time.",
            cost: new Decimal(5000),
            effect() {
                let effect = player.sa.points.add(1).log(1.05).pow(player.t.points.log(5).pow(0.9)).pow(10)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Making a Difference",
            description: "Unlock new upgrades.",
            cost: new Decimal(25000),
        },
    },
    update(diff) {
        let gain = new Decimal(0)
        if (hasUpgrade("t", 24)) gain = new Decimal(1).mul(player.t.points.log(25).pow(1.5))
        if (hasUpgrade("sa", 12)) gain = gain.times(upgradeEffect('sa', 12))
        addPoints('sa', gain.times(diff))
    },
    name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Sa", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#111122",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "space", // Name of prestige currency
    baseResource: "space", // Name of resource prestige is based on
    baseAmount() {return player.sa.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.01, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("t", 24)}
})