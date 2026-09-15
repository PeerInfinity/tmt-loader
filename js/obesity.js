addLayer("ob", {
    upgrades: {
        11: {
            title: "Speed of Weight",
            description: "Obesity increases gram base.",
            cost: new Decimal(1),
        },
        12: {
            title: "World's Heaviest Guy",
            description: "Obesity increases weight base.",
            cost: new Decimal(2),
            unlock() {return hasUpgrade('ob', 11)}
        },
        13: {
            title: "Gravity",
            description: "Unlock Weight Upgrades even more.",
            cost: new Decimal(2),
            unlock() {return hasUpgrade('ob', 12)}
        },
    },
    name: "obesity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Ob", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#1A6930",
    requires: new Decimal(400), // Can be a function that takes requirement increases into account
    resource: "obesity", // Name of prestige currency
    baseResource: "overweights", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.15, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for comparisons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.o.points.gte(760) || player.ob.points.gte(1) || hasUpgrade('ob', 11)}
})