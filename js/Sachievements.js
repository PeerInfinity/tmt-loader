addLayer("SAch", {
    name: "SAch", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Sa", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#8d8d8d",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
    requires: new Decimal("1F100"), // Can be a function that takes requirement increases into account
    resource: "Achievement points", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    achievements: {
        11: {
            name: "Are you alright?",
            done() {
                return (player.points.gte(300) && getPointGen().lte(1))
            },
            tooltip: function() {
                if (hasAchievement(this.layer, this.id)) {
                    return "Get 300 points with the point generation being less than 1"
                }
                else {
                    return "Get to 300 points in a very patient way"
                }
            },
            unlocked() {return true},
            style() {return {"visibility": "visible",}}

        },
        12: {
            name: "Patience is NOT key",
            done() {
                return (player.H.resetTime > 750 && player.M.points.lte(11))
            },
            tooltip: function() {
                if (hasAchievement(this.layer, this.id)) {
                    return "Dont reset hyper or above for 750 seconds while being new to it"
                }
                else {
                    return "You dont like a certain layer so you try to avoid it"
                }
            },
            unlocked() {return true},
            style() {return {"visibility": "visible",}}

        },
        13: {
            name: "Cant you listen",
            done() {
                return (getBuyableAmount("M", 999991).gte(1000))
            },
            tooltip: function() {
                if (hasAchievement(this.layer, this.id)) {
                    return "Buy 1000 epic in the shop"
                }
                else {
                    return "Get ALOT of something useless"
                }
            },
            unlocked() {return true},
            style() {return {"visibility": "visible",}}

        },
        14: {
            name: "Wrong game genre",
            done() {
                return (player.clicks >= 10000)
            },
            tooltip: function() {
                if (hasAchievement(this.layer, this.id)) {
                    return "Click 10000 times throughout the whole game"
                }
                else {
                    return "Do something common alot of times or just play normally for a long time"
                }
            },
            unlocked() {return true},
            style() {return {"visibility": "visible",}}

        },
        15: {
            name: "Side questing supreme",
            done() {
                return (hasUpgrade("Mi", 101))
            },
            tooltip: function() {
                if (hasAchievement(this.layer, this.id)) {
                    return "Get the final upgrade in the minigame layer"
                }
                else {
                    return "Complete the side quest."
                }
            },
            unlocked() {return true},
            style() {return {"visibility": "visible",}}

        },
    },
    tabFormat: {
        "Achievements": {
            content: [
                "blank",
                "blank",
                "achievements",
                "blank",
            ],
        },
    },
})
