addLayer("liz", {
    name: "liz", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/Liz.svg",
    startData() {
        return {
            unlocked: false,
            points: decimalZero,
        }
    },
    nodeStyle() {
        return {
            "background-size": "110%",
            "background-repeat": "no-repeat",
            "background-position": "center",
        }
    },
    color: "#ff0000",
    requires: new Decimal(7000), // Can be a function that takes requirement increases into account
    resource: "H-E-B Creamy Creations Neapolitan Ice Creams", // Name of prestige currency
    baseResource: "Congratulations Buttons", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.27777777, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = decimalOne

        if (hasAchievement("achievements", 15)) {
            mult = mult.times(7)
        }

        if (hasUpgrade("liz", 11)) {
            mult = mult.times(0.7)
        }
        if (hasUpgrade("liz", 13)) {
            mult = mult.times(5)
        }
        if (hasUpgrade("liz", 14)) {
            mult = mult.times(13)
        }
        if (hasUpgrade("liz", 16)) {
            mult = mult.times(7.77)
        }

        if (hasUpgrade("main", 22)) {
            mult = mult.times(5)
        }
        if (hasUpgrade("main", 29)) {
            mult = mult.times(7.00)
        }
        if (hasUpgrade("main", 34)) {
            mult = mult.times(upgradeEffect("main", 31))
        }

        if (hasUpgrade("cud", 15)) {
            mult = mult.times(3)
        }

        if (hasUpgrade("fizzy", 13)) {
            mult = mult.times(4)
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = decimalOne
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["main"],
    hotkeys: [
        { key: "l", description: "L: Purchase H-E-B Creamy Creations Neapolitan Ice Creams", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() {
        if (hasUpgrade("main", 21)) {
            unlocked = true
            return true
        }
    },


    upgrades: {
        11: {
            title: "You Can Do This Girl!",
            description: "7.00x Congratulations Buttons but 0.7x H-E-B Creamy Creations Neapolitan Ice Creams",
            cost: new Decimal(10),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        12: {
            title: "Take Off Your Shirt Moon!!!",
            description: "2.60x Planets",
            cost: new Decimal(39),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        13: {
            title: "It's Amazing 🥹",
            description: "5.00x H-E-B Creamy Creations Neapolitan Ice Creams",
            cost: new Decimal(170),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        14: {
            title: "this will save dac!",
            description: "0.10x Congratulations Buttons but 13.00x Planets and H-E-B Creamy Creations Neapolitan Ice Creams",
            cost: new Decimal(650),
            style: {
                "height": "175px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        15: {
            title: "Love Wins",
            description: "Unlock the Fizzy Layer",
            cost: new Decimal(10000),
            style: {
                "height": "200px",
                "width": "200px",
                "corner-shape": "squircle",
                "border-radius": "5%",
            },
            persisting: true
        },
        16: {
            title: "Basket Banger",
            description: "7.77x H-E-B Creamy Creations Neapolitan Ice Creams",
            cost: new Decimal(50000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("liz", 15)
            },
        },
        17: {
            title: "The Savior",
            // 13.00x Planets and increase effectiveness of dr.sex spawner
            description: "<img src='resources/TheSavior.webp' alt='A description of the image' width='100'>",
            cost: new Decimal(130000),
            style: {
                "height": "175px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("liz", 15)
            },
        },
    },

    tabFormat: [
        "main-display",
        "resource-display",
        "prestige-button",
        "blank",

        "clickables",
        "milestones",
        "blank",


        "blank",
        ["display-text", function () {
            return "<h3>[ Fizzy Tree ]</h3>"
        }],
        "blank",
        ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14],]],
        "blank",
        ["row", [["upgrade", 15], ,]],
        "blank",


        "blank",
        ["display-text", function () {
            if (hasUpgrade("liz", 15)) {
                return "<h3>[ More Upgrades ]</h3>"
            }
            return ""
        }],
        "blank",
        ["row", [["upgrade", 16], ["upgrade", 17],]],
        "blank",
    ],
})
