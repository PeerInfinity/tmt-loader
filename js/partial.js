addLayer("Partialprestige", {
    name: "Partialprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FE5E41",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "Partial prestiges", // Name of prestige currency
    baseResource: "Small prestiges", // Name of resource prestige is based on
    baseAmount() {return player.Smallprestige.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 5,
    branches: ["Smallprestige"],
    effect() {
        var eff = player.Partialprestige.points.plus(1)
        return eff
    },
    effectDescription() {
        var desc;
        desc = "which are multiplying Point gain by "
        desc += format(tmp.Partialprestige.effect) + "x"
        return desc
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.Partialprestige.points.equals(1)) mult = Decimal.dInf
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "p: Reset for Partial Prestiges", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    
    upgrades: {
     
    },
    achievements: {
        11: {
            name: "Partially responsible",
            done() {return player.Partialprestige.points.gte(1)},
            tooltip: "Partial Prestige for the first time.",
            image() {
                if (hasAchievement("Partialprestige", 11)) return "js/images/Partialprestige/partial11.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        12: {
            name: "[S] Cascade.",
            done() {return player.BrokenMicro.unlocked},
            tooltip: "Unlock Cascaded Micro. Buying Broken Nano buyables sets their amount to their maximum.",
            image() {
                if (hasAchievement("Partialprestige", 12)) return "js/images/Partialprestige/partial12.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        13: {
            name: "Infinite Magnitude",
            done() {return player.points.gte("e1.79e308")},
            tooltip: "Get more than e1.79e308 points. Smallprestige no longer resets Miniprestige upgrades.",
            image() {
                if (hasAchievement("Partialprestige", 13)) return "js/images/Partialprestige/partial13.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        14: {
            name: "The illusion...",
            done() {return hasUpgrade("CMEnlarge", 31) || hasUpgrade("CMEnlarge", 32) || hasUpgrade("CMEnlarge", 33)},
            tooltip: "Purchase one of the row 2 Enlargement upgrades. You can bulk buy Smallprestige.",
            image() {
                if (hasAchievement("Partialprestige", 14)) return "js/images/Partialprestige/partial14.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        15: {
            name: "...of free choice.",
            done() {return hasUpgrade("CMEnlarge", 51)},
            tooltip: "Purchase all five of the normal Enlargement upgrades.",
            image() {
                if (hasAchievement("Partialprestige", 15)) return "js/images/Partialprestige/partial15.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
    },
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "resource-display", "prestige-button", "upgrades"],
            unlocked() {return true}
        },
        "Buyables": {
            content: ["main-display", "resource-display", "prestige-button", "buyables"],
            unlocked() {return false}          
        },
        "Challenges": {
            content: ["main-display", "resource-display", "prestige-button", "challenges"],
            unlocked() {return false}

        },
        "Achievements": {
            content: ["main-display", "resource-display", "achievements"],
            unlocked() {return true}

        }
    },
    layerShown(){
        return player.Smallprestige.best.gte(4) || player.Partialprestige.best.gte(1)}
})