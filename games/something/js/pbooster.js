addLayer("pbooster", {
    name: "pbooster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PLB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        e1: new Decimal(1),
        e2: new Decimal(1),
        e3: new Decimal(1),
        e4: new Decimal(1),
        e5: new Decimal(1),
    }},
    color: "#60C0FF",
    requires: new Decimal("1e330"), // Can be a function that takes requirement increases into account
    resource: "Planetary Boosters", // Name of prestige currency
    baseResource: "Shapes", // Name of resource prestige is based on
    baseAmount() {return player.polygon.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = new Decimal(4)
        return base
    }, // Prestige currency exponent
    base() {
        let initial = new Decimal(5)
        return initial
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //final
        return mult//DO NOT USE IF STATIC
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    directMult() {
        let dMult = new Decimal(1)
        if (hasUpgrade("fundamental", 56)) dMult = dMult.add(1)
        if (hasUpgrade("multiplication", 141)) dMult = dMult.mul(1.25)
        if (hasUpgrade("polygon", 27)) dMult = dMult.mul(1.25)
        return dMult
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "N", description: "SHIFT+N: Reset for Planetary Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.pbooster.unlocked},
    passiveGeneration() {return false},
    autoPrestige() {return false},
    resetsNothing() {return false},
    canBuyMax() {return false},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes"}],
        "blank",
        ["display-text", function() { return "<h2>You have " + format(player.pbooster.points) + " Planetary Boosters, which..."}],
        "blank",
        ["display-text", function() { return "<h3>x" + format(player.pbooster.e1) + " to Planetary Fragments"}],
        "blank",
        ["display-text", function() {
            if (!hasMilestone("pbooster", 3)) return ""
            return "<h3>^" + format(player.pbooster.e2) + " to all Core Booster effects."
        }],
        "blank",
        ["display-text", function() {
            if (true) return ""
            return "<h3>/" + format(player.corebooster.e3) + " to Pentagon and Hexagon construction time"
        }],
        "blank",
        ["display-text", function() {
            if (true) return ""
            return "<h3>x" + format(player.corebooster.e4) + " to Points, Fundamentality, and Addition"
        }],
        "blank",
        ["display-text", function() {
            if (true) return ""
            return "<h3>x" + format(player.corebooster.e5) + " to Shapes and Division"
        }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
    ],
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes"}],
                "blank",
                ["display-text", function() { return "<h2>You have " + format(player.pbooster.points) + " Planetary Boosters, which..."}],
                "blank",
                ["display-text", function() { return "<h3>x" + format(player.pbooster.e1) + " to Planetary Fragments"}],
                "blank",
                ["display-text", function() {
                    if (!hasMilestone("pbooster", 3)) return ""
                    return "<h3>^" + format(player.pbooster.e2) + " to all Core Booster effects"
                }],
                "blank",
                ["display-text", function() {
                    if (!hasUpgrade("division", 31)) return ""
                    return "<h3>^" + format(player.pbooster.e3) + " to the Shape hardcap and Core Boosters"
                }],
                "blank",
                ["display-text", function() {
                    if (true) return ""
                    return "<h3>x" + format(player.pbooster.e4) + " to Points, Fundamentality, and Addition"
                }],
                "blank",
                ["display-text", function() {
                    if (true) return ""
                    return "<h3>x" + format(player.pbooster.e5) + " to Shapes and Division"
                }],
                "blank",
                "milestones",
                "blank",
                "upgrades",
            ],
        },
        "Challenges": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes"}],
                "blank",
                "challenges",
            ],
            unlocked() {return hasUpgrade("planetary", 17)}
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 2 Planetary Boosters",
            effectDescription: "Remove all Multiplication scalings and x1e25 Division. ^1.3 Number Cores and Fundamentality. Unlock the 11th row of TMT.",
            done() { return player.pbooster.points.gte(2) },
            unlocked() {return true}
        },
        2: {
            requirementDescription: "2: 5 Planetary Boosters",
            effectDescription: "Improve \"THE LARGEST COST GAP\" and unlock three Polygon upgrades. Keep the Multiplication buyables, unlock the 12th row, and x1e10 Multiplication.",
            done() { return player.pbooster.points.gte(5) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)}
        },
        3: {
            requirementDescription: "3: 11 Planetary Boosters",
            effectDescription: "Unlock a second Planetary Booster effect.",
            done() { return player.pbooster.points.gte(11) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)}
        },
        4: {
            requirementDescription: "4: 13 Planetary Boosters",
            effectDescription: "+0.03 to Number Cores' gain exponent and unlock three Division upgrades.",
            done() { return player.pbooster.points.gte(13) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)}
        },
        5: {
            requirementDescription: "5: 20 Planetary Boosters",
            effectDescription: "Unlock the Saturn Generator and two more Polygon upgrades.",
            done() { return player.pbooster.points.gte(20) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)}
        },
    },

    challenges: {
        11: {
            name: "Nullboosted",
            challengeDescription: "<i>\"Look at who's came back for more... can't get enough of challenges, can you?\"</i> Core Booster effects do not work. Neither do Dimensions nor Planet Power. The gain of Points is log(1,000,000).",
            goalDescription: "Have 1e679 Shapes.",
            rewardDescription: "Unlock two more Polygon upgrades and improve \"Progressing+\".",
            canComplete: function() {return player.polygon.points.gte("1e679")},
            unlocked() {return hasUpgrade("planetary", 17)},
        },
        12: {
            name: "Logarithmic Insanity",
            challengeDescription: "<i>\"What if we take Googol's nightmare and apply it to everything?\"</i> The gain of Points, Fundamentality, Numbers, Operation Power, Addition, Subtraction, Multplication, Division, and Number Cores is log(10).",
            goalDescription: "Have 1e100 Shapes.",
            rewardDescription: "^1.25 Number Cores, and x1e50 to the Shape Hardcap!",
            canComplete: function() {return player.polygon.points.gte("1e100")},
            unlocked() {return hasUpgrade("planetary", 17)},
        },
        21: {
            name: "Super Anti Planet Power",
            challengeDescription: "<i>\"The celestial armageddon: planetary collisions on orders far too much to perceive.\"</i> Planet Power now divides Points, Fundamentality, Numbers, Addition, and Number Cores after softcaps and exponents, but at a ^0.75 reduction.",
            goalDescription: "Have 1e1030 Shapes.",
            rewardDescription: "x1e100 to the Shape hardcap and unlock Core Booster upgrades.",
            canComplete: function() {return player.polygon.points.gte("1e1030")},
            unlocked() {return hasUpgrade("polygon", 25)},
        },
        22: {
            name: "NO OPERATIONS AT ALL",
            challengeDescription: "<i>\"Imagine a world without math. You don't need to. Fun.\"</i> Arithmetic, Addition, Subtraction, Multiplication, and Division layers are all disabled.",
            goalDescription: "Have 1e66 Shapes.",
            rewardDescription: "^1.15 to the Shape hardcap, Multiplication, and Planetary Fragments, and unlock the Jupiter Generator.",
            canComplete: function() {return player.polygon.points.gte("1e66")},
            unlocked() {return hasUpgrade("polygon", 25)},
        },
    },

    update(diff){
        let amount = player.pbooster.points

        let e1b = amount.add(1)
        e1b = e1b.pow(0.5)
        player.pbooster.e1 = e1b

        let e2b = amount.add(1)
        e2b = e2b.log(1000).div(15).add(1)
        player.pbooster.e2 = e2b
        
        let e3b = amount.add(1)
        e3b = e3b.log(10).div(10).add(1)
        player.pbooster.e3 = e3b
    },
    tooltip() {return format(player.pbooster.points) + " Planetary Boosters (" + format(getNextAt("pbooster")) + " Shapes for next Planetary Booster)"},
})