addLayer("division", {
    name: "division", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "÷", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        resets: new Decimal(0),
        currencyMulti: new Decimal(1)
    }},
    color: "#FF50FF",

    requires() {
        return new Decimal ("1")
    }, // Can be a function that takes requirement increases into account
    resource: "Division", // Name of prestige currency
    baseResource: "Numbers", // Name of resource prestige is based on
    baseAmount() {return player.primitive.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        return new Decimal (0.5)
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        if (hasMilestone("division", 1)) mult = mult.mul(2)
        if (hasUpgrade("multiplication", 43)) mult = mult.mul(5)
        if (hasMilestone("polygon", 8)) mult = mult.mul(3.5)
        if (hasMilestone("division", 3)) mult = mult.mul(5)
        if (hasUpgrade("multiplication", 62)) mult = mult.mul(15)
        if (player.dimension.points.gte(4)) mult = mult.mul(5)
        mult = mult.mul(player.corebooster.e1)
        if (hasUpgrade("subtraction", 17)) mult = mult.mul(15)
        if (hasMilestone("primitive", 11)) mult = mult.mul(15)
        if (hasMilestone("addition", 4)) mult = mult.mul(player.addition.points.add(1).log(1.3))
        if (hasUpgrade("arithmetic", 37)) mult = mult.mul(player.corebooster.e5)
        if (hasUpgrade("primitive", 32)) mult = mult.mul(30)
        if (hasUpgrade("primitive", 34)) mult = mult.mul(5)
        if (hasUpgrade("multiplication", 91)) mult = mult.mul("1e6")
        if (hasUpgrade("multiplication", 94)) mult = mult.mul(upgradeEffect("multiplication", 94))
        if (hasMilestone("primitive", 14)) mult = mult.mul("1e6")
        if (hasUpgrade("multiplication", 102)) mult = mult.mul(upgradeEffect("multiplication", 102))
        if (hasUpgrade("subtraction", 24)) mult = mult.mul("1e10")
        if (hasMilestone("corebooster", 5)) mult = mult.mul("500")
        if (hasUpgrade("subtraction", 22)) mult = mult.mul("1e6")
        if (hasMilestone("planetary", 2)) mult = mult.mul("1e10")
        if (getBuyableAmount("multiplication", 12).gte("1")) mult = mult.mul(buyableEffect("multiplication", 12))
        if (hasMilestone("pbooster", 1)) mult = mult.mul("1e25")
        if (player.corebooster.e2.gte(1)) mult = mult.mul(player.corebooster.e2)
        mult = mult.mul(new Decimal(100).pow(getBuyableAmount("planetary", 22)))
        if (hasMilestone("dimension", 6)) mult = mult.mul("1e10")
        //exp
        if (hasMilestone("corebooster", 2)) mult = mult.pow("1.1")
        if (hasMilestone("division", 10)) mult = mult.pow("1.1")
        if (hasUpgrade("subtraction", 27)) mult = mult.pow("1.35")
        if (hasUpgrade("subtraction", 23)) mult = mult.pow("1.05")

        if (inChallenge("pbooster", 12)) mult = mult.add(1).log(10)
        //other hypers
        player.division.currencyMulti = mult
        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "V", description: "SHIFT+V: Reset for Division", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone("polygon", 5) || player.planetary.unlocked},
    directMult() {
        let dMult = new Decimal(1)
        return dMult
    },

    getResetGain(){
        let base = player.primitive.points
        if (base.lt("1e33")) return new Decimal(0)
        base = base.sub("1e33")
        base = base.add(1)
        if (hasUpgrade("subtraction", 15)) base = base.logarithm(5)
        else base = base.logarithm(10)
        base = base.sub(31)
        base = base.floor()
        base = base.mul(player.division.currencyMulti)
        return base
    },
    getNextAt(){
        let base = getResetGain("division")
        base = base.div(player.division.currencyMulti)
        base = base.add(32)
        if (hasUpgrade("subtraction", 15)) base = new Decimal(5).pow(base)
        else base = new Decimal(10).pow(base)
        base = base.sub(1)
        base = base.add("1e33")
        return "Next Division at " + format(base)
    },
    canReset() {
        if (player.division.resets.eq(0)) return true
        if (getClickableState("division", 11) != "Active") return false
        return true
    },
    passiveGeneration(){
        if (hasMilestone("division", 10)) return 1
        if (hasMilestone("primitive", 10) && getClickableState("division", 11) == "Active") return 1
        return 0
    },
    prestigeNotify() { return getResetGain("division").mul("100").gte(player.division.points) && getClickableState("division", 11)},
    prestigeButtonText() {
        if (getClickableState("division", 11) != "Active" && player.division.resets.eq(0)) return "You need to be in Long Division to reset. However, press this button anyway to initiate the layer."
        if (getClickableState("division", 11) != "Active") return "You need to be in Long Division to reset."
        let detect = player.primitive.points
        let text = "Reset for <b>+" + format(getResetGain("division")) + "</b> Division"
        if (hasMilestone("primitive", 10)) text = "You are gaining <b>+" + format(getResetGain("division")) + "</b> Division per second."
        if (detect.lt("1.1e33")) return "You start gaining Division at <b>1.1e33</b> Numbers."
        return text
    },
    onPrestige() {
        if (player.division.resets.eq(0)) player.division.points = player.division.points.sub(getResetGain("division"))
        player.division.resets = player.division.resets.add(1)
        setClickableState("division", 11, "Inactive")
    },
    deactivated() {return inChallenge("pbooster", 22)},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasMilestone("planetary", 10)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27)

        if (hasUpgrade("division", 31)) keptUpgrades.push(31)
        if (hasUpgrade("division", 32)) keptUpgrades.push(32)
        if (hasUpgrade("division", 33)) keptUpgrades.push(33)
        if (hasUpgrade("division", 34)) keptUpgrades.push(34)
        if (hasUpgrade("division", 35)) keptUpgrades.push(35)

        let keptBuyables = []

        let keptResetAmount = player.division.resets

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["points", "upgrades", "milestones", "total"];
        if (layers[resettingLayer].name == "planetary"){
            if (hasAchievement("planetary", 14)) keep = ["milestones"]
            else keep = []
        }

        // Stage 4, do the actual data reset
        if (resettingLayer == "division") doReset("polygon", true)
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        player.division.resets = keptResetAmount
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.primitive.points) + " Numbers" }],
                ["display-text", function() {
                    let text = "You have " + format(player.division.points) + " Division"
                    return text
                }],
                ["display-text", function() {
                    if (getClickableState("division", 11) != "Active") return "-"
                    let text = getNextAt("division") + " Numbers."
                    return text
                }],
                "blank",
                ["infobox", "longDivBox"],
                "blank",
                ["clickables", [1]],
                "blank",
                "upgrades",
            ],
        },
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.primitive.points) + " Numbers" }],
                ["display-text", function() { return "You have " + format(player.division.points) + " Division" }],
                ["display-text", function() {
                    if (getClickableState("division", 11) != "Active") return "-"
                    let text = getNextAt("division") + " Numbers."
                    return text
                }],
                "blank",
                "milestones",
            ],
        },
    },
    infoboxes: {
        longDivBox: {
            title: "Long Division",
            body() { return "Welcome to possibly the most inefficient operation in mathematics: Long Division. " +
                "Here, it's basically a time dilation. Think of Shark Incremental's Oceans, IMR's Big Rip, Algebraic Progression's Square Root, etc. " +
                "Fundamental buyables do not work. Addition boosters are heavily nerfed. ^0.3 to Points. Dimension milestones do not work. ^0.5 to Numbers. " +
                "The exponent nerfs are applied after everything else. Entering and exiting Long Division forces a Polygon reset. " +
                "However, all four operations will stay unlocked. <i> It is recommended to start doing Long Division at 10 Polygonifications. </i>" +
                "<b> There will be grinds. Tip: whenever something can be reached within 100 resets, GO FOR IT. </b>"
            }, //1e33 numbers is perfect! draw a line from prm to /
        },
    },
    clickables: {
        11: {
            title: "Enter Long Division",
            display() {
                if (getClickableState("division", 11) == "Active") return "You are in Long Division right now. Reset for Division to leave."
                return "You are not in Long Division right now."
            },
            canClick() {return true},
            onClick() {
                if (getClickableState("division", 11) != "Active") doReset("division", true)
                setClickableState("division", 11, "Active")
            },
        },
        12: {
            title: "Reset and Reenter",
            display() {
                if (getClickableState("division", 11) == "Active") return "Click this button to reenter Long Division after resetting."
                return "This button only works in Long Division."
            },
            canClick() {return true},
            onClick() {
                if (getClickableState("division", 11) != "Active") return
                doReset("division")
                setClickableState("division", 11, "Active")
            },
        },
        13: {
            title: "Force Leave",
            display() {
                if (getClickableState("division", 11) == "Active") return "Click this button to forcefully leave Long Division (will cause a Polygon reset)."
                return "You are not in Long Division right now."
            },
            canClick() {return true},
            onClick() {
                doReset("division", true)
                setClickableState("division", 11, "Inactive")
            },
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 10 Division",
            effectDescription: "x2 Multiplication and Division.",
            done() { return player.division.points.gte(10) },
        },
        2: {
            requirementDescription: "2: 1,000 Division",
            effectDescription: "x10 Shapes.",
            done() { return player.division.points.gte("1e3") },
        },
        3: {
            requirementDescription: "3: 250,000 Division",
            effectDescription: "Time for a Polygonal focus. Unlock the Constructor.",
            done() { return player.division.points.gte("2.5e5") },
            onComplete() {setClickableState("polygon", 11, "Triangle")},
        },
        4: {
            requirementDescription: "4: 15,000,000 Division",
            effectDescription: "Triangles boost Squares and Points and REMOVE THE FIRST MULTIPLICATION HARDCAP.",
            done() { return player.division.points.gte("15e6") },
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        5: {
            requirementDescription: "5: 5e9 Division",
            effectDescription: "x150 Operation Power after softcap.",
            done() { return player.division.points.gte("5e9") },
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        6: {
            requirementDescription: "6: 2e12 Division",
            effectDescription: "x1e250 Points and ^1.1 Number Cores.",
            done() { return player.division.points.gte("2e12") },
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        7: {
            requirementDescription: "7: 1e21 Division",
            effectDescription: "x10 Shapes and x1.5 Core Boosters.",
            done() { return player.division.points.gte("1e21") },
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        8: {
            requirementDescription: "8: 5e23 Division",
            effectDescription: "THE NINTH ROW.",
            done() { return player.division.points.gte("5e23") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
        9: {
            requirementDescription: "9: 5e43 Division",
            effectDescription: "Remove the 6th and final Multiplication hardcap. Drastically improve Multiplication's effect and it now affects Number Cores.",
            done() { return player.division.points.gte("5e43") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
        10: {
            requirementDescription: "10: 1e50 Division",
            effectDescription: "You know it was coming eventually. Passively Generate Division outside of Long Division, and ^1.1 Division.",
            done() { return player.division.points.gte("1e50") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
        11: {
            requirementDescription: "11: 1e85 Division",
            effectDescription: "Seriously, Core Boosters aren't supposed to replicate! Useful Core Boosters passively gain 0.01% of your Core Boosters.",
            done() { return player.division.points.gte("1e85") },
            unlocked() {return hasMilestone("division", 10) || player.planetary.unlocked},
        },
    },
    upgrades: {
        11: {
            title: "Embrace the Quotients",
            effect(){
                let base = player.division.points
                base = base.pow(0.25).add(1)
                if (hasUpgrade("division", 23)) base = base.pow(1.2)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 11))},
            description: "Division boosts Addition, Subtraction, and Multiplication.",
            cost: new Decimal(1000),
        },
        12: {
            title: "Repeated Division",
            effect(){
                let base = player.division.points
                base = base.pow(2.25).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 12))},
            description: "Division boosts Operation Power and Points.",
            cost: new Decimal("25000"),
        },
        13: {
            title: "Subtraction is Under-used.",
            description: "x1e30 to Subtraction.",
            cost: new Decimal("5e6"),
        },
        14: {
            title: "Not Challenging Enough",
            description: "Keep the 4th Arithmetic Challenge and the 24th Fundamental Upgrade.",
            cost: new Decimal("200e6"),
        },
        15: {
            title: "Tree Preservation",
            description: "Keep the 6th and 7th rows of TMT. (Don't say it...)",
            cost: new Decimal("2.5e11"),
        },
        16: {
            title: "EXPONENTS!",
            description: "^1.01 Points, Fundamentality, Numbers, Operation Power, and Shapes (after softcaps for middle 3).",
            cost: new Decimal("1e18"),
        },
        17: {
            title: "Unhardcapped",
            effect(){
                let base = player.division.points
                base = base.pow(1.35).add(1)
                if (hasUpgrade("primitive", 36)) base = base.pow(player.division.points.pow(0.03))
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 17))},
            description: "Division delays the Operation Power hardcap.",
            cost: new Decimal("1e24"),
        },

        21: {
            title: "Not Completely Useless",
            effect(){
                let base = player.corebooster.points.sub(player.corebooster.trueUseful)
                base = base.pow(50).pow(base.pow(0.1))
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 21))},
            description: "Useless Core Boosters boost the Operation Power hardcap and Points.",
            cost: new Decimal("1e30"),
            unlocked() {return hasUpgrade("division", 17) || player.planetary.unlocked},
        },
        22: {
            title: "WHAT?!",
            description: "Useful Core Boosters are x1.2 your total Core Booster amount.",
            cost: new Decimal("1e36"),
            unlocked() {return hasUpgrade("division", 17) || player.planetary.unlocked},
        },
        23: {
            title: "King Sammelot Buffed",
            description: "REAL FIVE FIVE! Improve \"Embrace the Quotients\".",
            cost: new Decimal("5.55e55"),
            unlocked() {return hasUpgrade("division", 17) || player.planetary.unlocked},
        },
        24: {
            title: "Subtraction is Under-used+",
            effect(){
                let base = player.subtraction.points
                base = base.add(1.1).log(1.1).pow(1.25)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 24))},
            description: "Subtraction boosts Shapes after softcap.",
            cost: new Decimal("1e61"),
            unlocked() {return hasUpgrade("division", 17) || player.planetary.unlocked},
        },
        25: {
            title: "I know you want the next layer",
            description: "x1e500 Subtraction.",
            cost: new Decimal("5e68"),
            unlocked() {return hasUpgrade("division", 17) || player.planetary.unlocked},
        },
        26: {
            title: "Just a few more upgrades",
            description: "^1.001 Points and improve Hexagon's effect.",
            cost: new Decimal("1e87"),
            unlocked() {return hasUpgrade("division", 25) || player.planetary.unlocked},
        },
        27: {
            title: "NEXT LAYER IMMINENT",
            description: "^1.2 Points and x1e10 Shapes after softcap.",
            cost: new Decimal("1e120"),
            unlocked() {return hasUpgrade("division", 26) || player.planetary.unlocked},
        },
        31: {
            title: "746869726420 656666656374",
            description: "Unlock a third Planetary Booster effect. This row is kept.",
            cost: new Decimal("1e555"),
            unlocked() {return hasMilestone("pbooster", 4)},
        },
        32: {
            title: "Division Boosters",
            effect(){
                let base = player.division.points
                base = base.add(1).log("1e10000").add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("division", 32))},
            description: "Division boosts Core Boosters",
            cost: new Decimal("1e579"),
            unlocked() {return hasMilestone("pbooster", 4)},
        },
        33: {
            title: "Multi Trio",
            description: "Keep the 12th row of TMT.",
            cost: new Decimal("1e590"),
            unlocked() {return hasMilestone("pbooster", 4)},
        },
        34: {
            title: "HOW MANY MORE UPGRADES",
            description: "Get ready. x1e1000 to the Shape hardcap.",
            cost: new Decimal("1e1775"),
            unlocked() {return hasUpgrade("polygon", 27)},
        },
        35: {
            title: "HOW MANY MORE UPGRADES",
            description: "Get ready. x1e1000 to the Shape hardcap.",
            cost: new Decimal("1e1775532"),
            unlocked() {return hasUpgrade("polygon", 27)},
        },
    },
    tooltip() {
        if (getClickableState("division", 11) == "Active" || hasMilestone("division", 10)) return format(player.division.points) + " Division (+" + format(getResetGain("division")) + " Division on reset)"
        return format(player.division.points) + " Division (not in Long Division)"
    },
})