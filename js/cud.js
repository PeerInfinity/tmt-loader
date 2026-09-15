addLayer("cud", {
    name: "cud", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/Cud.svg",
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
    color: "#006bf7",
    requires: new Decimal(70000), // Can be a function that takes requirement increases into account
    resource: "Ameobas", // Name of prestige currency
    baseResource: "Congratulations Buttons", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.17, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = decimalOne

        if (hasAchievement("achievements", 15)) {
            mult = mult.times(7)
        }

        if (hasUpgrade("cud", 11)) {
            mult = mult.times(2)
        }
        if (hasUpgrade("cud", 13)) {
            mult = mult.times(4)
        }
        if (hasUpgrade("cud", 14)) {
            mult = mult.times(upgradeEffect("cud", 14))
        }
        if (hasUpgrade("cud", 15)) {
            mult = mult.times(0.25)
        }
        if (hasUpgrade("cud", 16)) {
            mult = mult.times(7.9997)
        }

        if (hasUpgrade("main", 22)) {
            mult = mult.times(5)
        }
        if (hasUpgrade("main", 27)) {
            mult = mult.times(7.77)
        }

        if (hasUpgrade("lostcat", 14)) {
            mult = mult.times(3)
        }

        if (hasUpgrade("fizzy", 13)) {
            mult = mult.times(4)
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = decimalOne

        if (hasUpgrade("cud", 13)) {
            mult = mult.times(0.95)
        }

        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["main"],
    hotkeys: [
        { key: "a", description: "A: Split for Amoebas", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() {
        if (hasUpgrade("main", 26)) {
            unlocked = true
            return true
        }
    },


    upgrades: {
        11: {
            title: "Single Celled",
            description: "2.00x Ameobas",
            cost: new Decimal(10),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        12: {
            title: "moon stop adding spinners",
            description: "^0.90 and 13x Planets",
            cost: new Decimal(65),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        13: {
            title: "Never Hire Builders",
            description: "^0.95 and 4.00x Amoebas",
            cost: new Decimal(200),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        14: {
            title: "Insomniac",
            description: "Amoebas scale based off of last reset",
            cost: new Decimal(500),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
            effect() {
                return new Decimal(player["cud"].resetTime).times(0.07).add(1).min(50000)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        15: {
            title: "Bad Finance",
            description: "0.25x Amoebas and 3.00x to all adjacent layers",
            cost: new Decimal(500),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        16: {
            title: "Pee Essay",
            description: "7.9997x Amoebas",
            cost: new Decimal(7000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        17: {
            title: "I AM THE ONE WHO GOONS!!!",
            description: "^1.7 and 0.017x Amoebas",
            cost: new Decimal(17171.7),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
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
            return "<h3>[ More Upgrades ]</h3>"
        }],
        "blank",
        ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14],]],
        ["row", [["upgrade", 15], ["upgrade", 16], ["upgrade", 17], ["upgrade", 18],]],
        "blank",
    ],
})
