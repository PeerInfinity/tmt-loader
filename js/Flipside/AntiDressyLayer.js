addLayer("AD", {
    name: "Anti Dressy Layer", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        layerview: 1,
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
        let visible = true
        if (player.L.inchallenge) visible = false
        if (player.layerview != player.AD.layerview) visible = false
        return visible
     },   
    color: "#ff0000",
    branches: ["AD", "Pa"], 
    requires: function() {
        req = new Decimal(1e111)

        if (hasUpgrade("AD", 14)) req = req.div(444)
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "Anti Dressy points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: function() {
        exp = new Decimal(0.1)

        if (hasUpgrade("AD",16)) exp = new Decimal(0.05).times(-1)
        if (hasUpgrade("AD",23)) exp = exp.add(0.05)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('AD', 13)) mult = mult.times(3.33)	
        if (hasUpgrade('AD', 15)) mult = mult.times(5)	
        if (hasUpgrade('AD', 22)) mult = mult.times(1/player.AD.resetTime)	
        if (hasUpgrade('AD', 25)) mult = mult.times(10)	
        if (hasUpgrade('Pa', 13)) mult = mult.times(upgradeEffect("Pa",13))
        if (hasUpgrade('Pa', 13) && hasUpgrade('Pa', 11)) mult = mult.times(new Decimal(player.AD.points.add(1)).slog().add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    upgrades: { 
        11: {
            title: "!edargpu tsrif ehT",
            description: "1.11x points.",
            cost: new Decimal(1),
        },
        12: {
            title: "!edargpu dnoces ehT",
            description: "2.22x points.",
            cost: new Decimal(10),
            unlocked() {return hasUpgrade("AD",11)}
        },
        13: {
            title: "Back to the beginning",
            description: "Its all reversed now, 3.33x points and 3.33x AD",
            cost: new Decimal(100),
            unlocked() {return hasUpgrade("AD",12)}
        },
        14: {
            title: "Beginning to the back",
            description: "/444 requirement",
            cost: new Decimal(250),
            unlocked() {return hasUpgrade("AD",13)}
        },
        15: {
            title: "5",
            description: "5x points and 5x AD",
            cost: new Decimal(555),
            unlocked() {return hasUpgrade("AD",14)}
        },
        16: {
            title: "Flipside",
            description: "...",
            cost: function() {
                if (player.AD) {
                    return new Decimal(player.AD.points)
                }
                else {
                    return new Decimal(0)
                }
            },
            unlocked() {return hasUpgrade("AD",15)}
        },
        21: {
            title: "What??",
            description: "1.11x points",
            cost: new Decimal(500),
            unlocked() {return hasUpgrade("AD",16)}
        },
        22: {
            title: "Swift is the key",
            description: "AD is boosted the quicker you reset BUT is debuffed the longer you take",
            cost: new Decimal(500),
            unlocked() {return hasUpgrade("AD",21)}
        },
        23: {
            title: "Anti Decay",
            description: 'AD gain "decays" slower',
            cost: new Decimal(2500),
            unlocked() {return hasUpgrade("AD",22)}
        },
        24: {
            title: "Anti^2",
            description: "Boost points the longer you take to reset AD",
            cost: new Decimal(10000),
            unlocked() {return hasUpgrade("AD",23)},
            effect() {
                return new Decimal(player.AD.resetTime).add(1).log(3).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        25: {
            title: "Anti^3",
            description: "Boost points more the longer you take to reset AD and 10x AD",
            cost: new Decimal(25000),
            unlocked() {return hasUpgrade("AD",24)},
            effect() {
                return new Decimal(player.AD.resetTime).add(1).log(2).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        26: {
            title: "Final of row 2",
            description: "22x point gain and unlock something new (deja vu)",
            cost: new Decimal(250000),
            unlocked() {return hasUpgrade("AD",25)},
        },
    }, 
        tabFormat: {
            "Dressy layer": {
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
            "Buyables": {
                content: [
                    "main-display",
                    "blank",
                    "prestige-button",
                    "blank",
                    "blank",
                    ["buyables",[1]],
                    "blank",
                    "blank",
                    ["main"],
                ],
            },
        }
})