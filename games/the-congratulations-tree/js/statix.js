addLayer("main", {
    name: "statix", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/Statix.svg",
    startData() {
        return {
            unlocked: true,
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
    color: "#dd2e44",
    requires: decimalOne, // Can be a function that takes requirement increases into account
    resource: "Runes", // Name of prestige currency
    baseResource: "Congratulations Buttons", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = decimalOne

        if (hasAchievement("achievements", 12)) {
            mult = mult.times(4)
        }
        if (hasAchievement("achievements", 13)) {
            mult = mult.times(7)
        }

        if (hasUpgrade("main", 14)) {
            mult = mult.times(5)
        }
        if (hasUpgrade("main", 17)) {
            mult = mult.times(3)
        }
        if (hasUpgrade("main", 18)) {
            mult = mult.times(upgradeEffect("main", 18))
        }
        if (hasUpgrade("main", 19)) {
            mult = mult.times(15)
        }
        if (hasUpgrade("main", 23)) {
            mult = mult.times(8)
        }
        if (hasUpgrade("main", 25)) {
            mult = mult.times(10)
        }
        if (hasUpgrade("moon", 11)) {
            mult = mult.times(1.3)
        }
        if (hasUpgrade("moon", 12)) {
            mult = mult.times(3.9)
        }
        if (hasUpgrade("liz", 14)) {
            mult = mult.times(0.01)
        }

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = decimalOne
        if (hasUpgrade("main", 12)) {
            exp = exp.times(1.01)
        }
        if (hasUpgrade("main", 25)) {
            exp = exp.times(0.85)
        }
        if (hasUpgrade("moon", 13)) {
            exp = exp.times(1.1)
        }
        return exp
    },
    passiveGeneration() {
        gain = new Decimal(0.001)

        function canGenPoints() {
            if (hasUpgrade("moon", 15)) {
                return true
            }
            return false
        }
        if (!canGenPoints()) {
            gain = decimalZero
        }

        return gain
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "c", description: "C: Run for Runes", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return true },


    upgrades: {
        11: {
            title: "Woke Liberal",
            description: "1.50x Congratulations Buttons",
            cost: new Decimal(10),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            }
        },
        12: {
            title: "i forgot what to name this",
            description: "^1.01 Runes",
            cost: new Decimal(12),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "scoop"
            }
        },
        13: {
            title: "Statixlings",
            description: "Congratulations Buttons scale off of Runes",
            cost: new Decimal(30),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
            effect() {
                return player[this.layer].points.pow(0.25).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        14: {
            title: "Static Broadcast",
            description: "5.00x Runes",
            cost: new Decimal(80),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
        },
        15: {
            title: "㊗",
            description: "Congratulations Buttons now scale off of Congratulations Buttons",
            cost: new Decimal(300),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
            effect() {
                return player.points.add(1).pow(0.13)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },
        },
        16: {
            title: "Watch The Stars",
            description: "Unlock the Moon Layer",
            cost: new Decimal(1300),
            style: {
                "height": "200px",
                "width": "200px",
                "corner-shape": "squircle",
                "border-radius": "5%",
            },
            persisting: true,
        },
        17: {
            title: "Mreow",
            description: "3.00x Runes and 3.00x Congratulations Buttons",
            cost: new Decimal(1500),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16)
            },
        },
        18: {
            title: "m!p uhh",
            description: "Multiply Runes porportional to the time since last reset (Cap: 50,000x)",
            cost: new Decimal(5000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },
            effect() {
                if (hasUpgrade("main", 24)) {
                    return new Decimal(player["main"].resetTime).times(1.5).min(50000)
                }
                return new Decimal(player["main"].resetTime).min(50000)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },


            unlocked() {
                return hasUpgrade("main", 16)
            },
        },
        19: {
            title: "@new role anyone a15",
            description: "15.00x Runes and 15.00x Congratulations Buttons",
            cost: new Decimal(300000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16)
            },
        },
        21: {
            title: "They Are An Immoral Person",
            description: "Unlock the Liz Layer",
            cost: new Decimal(7000000),
            style: {
                "height": "200px",
                "width": "200px",
                "corner-shape": "squircle",
                "border-radius": "5%",
            },
            persisting: true,


            unlocked() {
                return hasUpgrade("main", 16)
            },
        },
        22: {
            title: "Admin",
            description: "5.00x to all layers connecting to this one",
            cost: new Decimal(10000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21)
            },
        },
        23: {
            title: "Give Me Your Money",
            description: "0.10x Congratulations Buttons but 8.00x Runes",
            cost: new Decimal(30000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21)
            },
        },
        24: {
            title: "*ALARM BLARES*",
            description: "Increase the effectiveness of <b>'m!p uhh'</b>",
            cost: new Decimal(500000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21)
            },
        },
        25: {
            title: "Analog Horror Scream",
            description: "^0.85 and 10x Runes",
            cost: new Decimal(1000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21)
            },
        },
        26: {
            title: "Blue Spec On A Petri Dish",
            description: "Unlock the Cud Layer",
            cost: new Decimal(7000000000),
            style: {
                "height": "200px",
                "width": "200px",
                "corner-shape": "squircle",
                "border-radius": "5%",
            },
            persisting: true,


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21)
            },
        },
        27: {
            title: "CUD!! DON'T ABBREVIATE CLICK POWER!!! CUD!!!!",
            description: "7.77x Amoebas",
            cost: new Decimal(500000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        28: {
            title: "moon can i voice more dac characters",
            description: "13.00x Planets",
            cost: new Decimal(500000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        29: {
            title: "lizaDEAD",
            description: "7.00x H-E-B Creamy Creations Neapolitan Ice Creams",
            cost: new Decimal(500000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        31: {
            title: "Lost Kitty Meow Meow",
            description: "2.00x Cash",
            cost: new Decimal(500000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        32: {
            title: "Soda Pop",
            description: "3.00x Radnor Fizz",
            cost: new Decimal(500000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        33: {
            title: "This Is Overpowered",
            description: "200x Congratulations Buttons",
            cost: new Decimal(1000000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)
            },
        },
        34: {
            title: "YURI!? WHERE!?",
            description: "If the Liz and Fizzy layers exist, scale them off of their product",
            cost: new Decimal(70000000000000),
            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "bevel"
            },
            effect() {
                return player["liz"].points.times(player["fizzy"].points).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" },


            unlocked() {
                return hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26) && player["liz"].unlocked && player["fizzy"].unlocked
            },
        }
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
            return "<h3>[ Moon Tree ]</h3>"
        }],
        "blank",
        ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14],]],
        ["row", [["upgrade", 15],]],
        "blank",
        ["row", [["upgrade", 16],]],
        "blank",


        "blank",
        ["display-text", function () {
            if (hasUpgrade("main", 16)) {
                return "<h3>[ Liz Tree ]</h3>"
            }
            return ""
        }],
        "blank",
        ["row", [["upgrade", 17], ["upgrade", 18], ["upgrade", 19],]],
        "blank",
        ["row", [["upgrade", 21],]],
        "blank",


        "blank",
        ["display-text", function () {
            if (hasUpgrade("main", 21)) {
                return "<h3>[ Cud Tree ]</h3>"
            }
            return ""
        }],
        "blank",
        ["row", [["upgrade", 22], ["upgrade", 23], ["upgrade", 24], ["upgrade", 25],]],
        "blank",
        ["row", [["upgrade", 26],]],
        "blank",


        "blank",
        ["display-text", function () {
            if (hasUpgrade("main", 16) && hasUpgrade("main", 21) && hasUpgrade("main", 26)) {
                return "<h3>[ More Upgrades ]</h3>"
            }
            return ""
        }],
        "blank",
        ["row", [["upgrade", 27], ["upgrade", 28], ["upgrade", 29], ["upgrade", 31],]],
        ["row", [["upgrade", 32], ["upgrade", 33], ["upgrade", 34],]],
        "blank",
    ],


})
