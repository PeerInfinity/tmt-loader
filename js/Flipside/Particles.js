addLayer("Pa", {
    name: "Particles Layer", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        layerview: 1,
        atom: {
            protons: 0,
            electrons: 0,
        }
    }},
    passiveGeneration() {
        /*if (hasUpgrade('D',31)) return 0.3
        if (hasMilestone('H', 1)) return 0.15
        if (hasUpgrade("L",32)) return 0.1
        if (hasMilestone('S', 2)) return 0.1*/
        return 0
    },
    autoUpgrade() {
        /*if (hasMilestone('H', 1)) {return true}
        else if (hasUpgrade("L",32)) {return true}
        else {return false}*/
    },
    layerShown(){
        let visible = false
        if (hasUpgrade("AD", 26) || player.Pa.unlocked) visible = true
        if (player.L.inchallenge) visible = false
        if (player.layerview != player.AD.layerview) visible = false
        return visible
     },   
    color: "#ae00ff",
    branches: ["Pa", ""], 
    requires: function() {
        req = new Decimal(500000)
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "Particles", // Name of prestige currency
    baseResource: "Anti Dressy points", // Name of resource prestige is based on
    baseAmount() {return player.AD.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: function() {
        exp = new Decimal(0.1)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    upgrades: { 
        11: {
            title: "Boost Crossing",
            description: "The first row particle upgrade effects also work on AD (some can have changes)",
            cost: new Decimal(100),
        },
        12: {
            title: "Atomic",
            description: "Particles boost points",
            cost: new Decimal(1),
            effect() {
                return new Decimal(player.Pa.points.add(1)).log(100).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Molecule",
            description: "Particles boost AD",
            cost: new Decimal(3),
            effect() {
                return new Decimal(player.Pa.points.add(1)).slog().add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    }, 
        tabFormat: {
            "Particles": {
                content: [
                    "main-display",
                    "blank",
                    "prestige-button",
                    "blank",
                    "blank",
                    "upgrades",
                    "blank",
                    "blank",
                    "challenges"
                    ["main"],
                    ["challenges"]
                ],
            },
            "Atoms": {
                content: [
                    "main-display",
                    "blank",
                    "blank",
                    "blank",
                    ["display-text", function() {return "soon"}],
                    "blank",
                    "blank",
                    ["main"],
                ],
            },
        }
})