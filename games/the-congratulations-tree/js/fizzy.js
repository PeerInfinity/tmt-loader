addLayer("fizzy", {
    name: "fizzy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/Fizzy.svg",
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
    color: "#ccaa88",
    requires: decimalOne, // Can be a function that takes requirement increases into account
    resource: "Radnor Fizzs", // Name of prestige currency
    baseResource: "H-E-B Creamy Creations Neapolitan Ice Creams", // Name of resource prestige is based on
    baseAmount() { return player["liz"].points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = decimalOne

        if (hasUpgrade("main", 34)) {
            mult = mult.times(upgradeEffect("main", 31))
        }
        if (hasUpgrade("main", 32)) {
            gain = gain.times(3.00)
        }

        if (hasUpgrade("fizzy", 12)) {
            mult = mult.times(upgradeEffect("fizzy", 12))
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
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["liz"],
    hotkeys: [
        { key: "r", description: "R: Purchase Radnor Fizzs", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() {
        if (hasUpgrade("liz", 15)) {
            unlocked = true
            return true
        }
    },

    upgrades: {
        11: {
            title: "6 Feet Four",
            description: "1.60x to all layers adjacent to this one.",
            cost: new Decimal(6),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        12: {
            title: "Moon's Successor",
            description: "Radnor Fizzs scale off of Planets",
            cost: new Decimal(13),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
            effect() {
                return player["moon"].points.pow(0.13).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        13: {
            title: "I CAN BUILD!!",
            description: "4.00x Randor Fizzs, Planets, and Amoebas",
            cost: new Decimal(20),
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
        ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13],]],
        "blank",
    ],
})
