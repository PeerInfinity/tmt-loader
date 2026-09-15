addLayer("addition", {
    name: "addition", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "+", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF50FF",
    requires: new Decimal("1"), // Can be a function that takes requirement increases into account
    resource: "Addition", // Name of prestige currency
    baseResource: "Operation Power", // Name of resource prestige is based on
    baseAmount() {return player.arithmetic.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (hasUpgrade("primitive", 25)) mult = mult.add(upgradeEffect("primitive", 25))
        //mul
        mult = mult.mul(player.arithmetic.points.div(10).add(1))
        if (hasUpgrade("arithmetic", 21)) mult = mult.mul(upgradeEffect("arithmetic", 21))
        if (hasUpgrade("arithmetic", 23)) mult = mult.mul(100)
        if (hasUpgrade("arithmetic", 24)) mult = mult.mul(upgradeEffect("arithmetic", 24))
        mult = mult.mul(buyableEffect("multiplication", 11))
        if (hasUpgrade("primitive", 26)) mult = mult.mul("1e10")
        if (hasUpgrade("division", 11)) mult = mult.mul(upgradeEffect("division", 11))
        if (hasUpgrade("multiplication", 63)) mult = mult.mul("1e50")
        if (hasChallenge("arithmetic", 22)) mult = mult.mul("1e10")
        mult = mult.mul(player.corebooster.e4)
        if (hasUpgrade("primitive", 32) && getClickableState("division", 11) == "Active") mult = mult.mul("1e500")
        if (hasMilestone("addition", 5)){
            if (player.addition.points.add(1).pow(player.addition.points.add(1).log(100).div("1e7")).gte("1e15000")) mult = mult.mul("1e15000")
            else mult = mult.mul(player.addition.points.add(1).pow(player.addition.points.add(1).log(100).div("1e7")))
        }
        if (hasUpgrade("subtraction", 22)) mult = mult.mul("1e15")
        if (hasMilestone("dimension", 6)) mult = mult.mul("e1e6")
        //exp
        if (hasUpgrade("arithmetic", 15)) mult = mult.pow(1.1)
        if (hasMilestone("dimension", 3) && !inChallenge("arithmetic", 13) && !getClickableState("division", 11)) mult = mult.pow(1.5)
        if (inChallenge("arithmetic", 13)) mult = mult.pow(0.75)
        if (hasUpgrade("multiplication", 31)) mult = mult.pow(1.1)
        if (inChallenge("arithmetic", 21)) mult = mult.pow(0.1)
        if (player.polygon.pentagons.gte(1)) mult = mult.pow(player.polygon.penEffect)

        if (inChallenge("pbooster", 12)) mult = mult.log(10)
        //other hypers
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("arithmetic", 13) || hasMilestone("dimension", 3) || player.planetary.unlocked},
    directMult() {
        let dMult = new Decimal(1)
        
	    if (inChallenge("pbooster", 21)) dMult = dMult.div(player.planetary.planetPowerEffect.pow(0.75))

        return dMult
    },
    deactivated() {return inChallenge("pbooster", 22)},
    passiveGeneration() {if (hasUpgrade("arithmetic", 13)) return 1},
    resetsNothing() {return true},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["milestones"];
        if (layers[resettingLayer].name == "planetary") keep = []

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier in Stage 2
        setClickableState("addition", 11, "Inactive")
        setClickableState("addition", 12, "Inactive")
        setClickableState("addition", 13, "Inactive")
        setClickableState("addition", 14, "Inactive")
        setClickableState("addition", 15, "Inactive")
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have " + format(player.arithmetic.points) + " Operation Power" }],
        ["display-text", function() { return "You are gaining " + format(getResetGain("addition")) + " Addition per second" }],
        "blank",
        "clickables",
        "blank",
        "milestones",
    ],
    clickables: {
        11: {
            title: "Add to Fundamental",
            effect() {
                if (inChallenge("pbooster", 22)) return new Decimal(0)
                let base = player.addition.points
                if (hasMilestone("polygon", 4)) setClickableState("addition", 11, "ALWAYS ACTIVE")
                if (hasMilestone("primitive", 7)) base = base.pow(0.5).add(1).pow(1.6)
                base = base.pow(0.4).add(1).pow(1.5)

                base = base.mul(buyableEffect("numbercore", 21))

                if (hasChallenge("arithmetic", 21)) base = base.pow(1.25)

                //final
                if (getClickableState("division", 11) == "Active") base = base.pow(0.5)
                if (base.gt("1e80000")) return new Decimal("1e80000")
                return base
            },
            display() {
                let cap = ""
                if (clickableEffect("addition", 11).gte("1e80000")) cap = ", CAPPED"
                return "Addition adds to Fundamentality base: +" + format(clickableEffect("addition", 11)) + " (" + getClickableState("addition", 11) + cap + ")"
            },
            canClick() {return true},
            onClick() {
                setClickableState("addition", 11, "Active")

                if (!hasMilestone("polygon", 4)) setClickableState("addition", 12, "Inactive")
                if (!hasMilestone("polygon", 4)) setClickableState("addition", 13, "Inactive")
            },
        },

        12: {
            title: "Add to Primitive",
            effect() {
                if (inChallenge("pbooster", 22)) return new Decimal(0)
                let base = player.addition.points
                if (hasUpgrade("polygon", 13)) setClickableState("addition", 12, "ALWAYS ACTIVE")
                if (hasMilestone("primitive", 7)) base = base.pow(0.5).add(1).pow(1.6)
                base = base.pow(0.4).add(1).pow(1.5)

                base = base.mul(buyableEffect("numbercore", 21))

                if (hasChallenge("arithmetic", 21)) base = base.pow(1.25)

                //final
                if (getClickableState("division", 11) == "Active") base = base.pow(0.5)
                if (base.gt("1e80000")) return new Decimal("1e80000")
                return base
            },
            display() {
                let cap = ""
                if (clickableEffect("addition", 12).gte("1e80000")) cap = ", CAPPED"
                return "Addition adds to Numbers base: +" + format(clickableEffect("addition", 12)) + " (" + getClickableState("addition", 12) + cap + ")"
            },
            canClick() {return true},
            onClick() {
                setClickableState("addition", 12, "Active")
            
                if (!hasMilestone("polygon", 4)) setClickableState("addition", 11, "Inactive")
                if (!hasUpgrade("polygon", 13)) setClickableState("addition", 13, "Inactive")
            },
        },

        13: {
            title: "Add to Points",
            effect() {
                if (inChallenge("pbooster", 22)) return new Decimal(0)
                if (player.dimension.points.gte(5)) setClickableState("addition", 13, "ALWAYS ACTIVE")
                let base = player.addition.points
                base = base.pow(0.4).add(1).pow(1.5)
                if (hasUpgrade("multiplication", 22)) base = base.mul(upgradeEffect("multiplication", 22))
                if (hasChallenge("arithmetic", 21)) base = base.pow(1.25)

                base = base.mul(buyableEffect("numbercore", 21))

                //final
                if (getClickableState("division", 11) == "Active") base = base.pow(0.5)
                if (hasMilestone("planetary", 1) && base.gt("1e2500")) return new Decimal("1e2500")
                else if (base.gt("1e500")) return new Decimal("1e500")
                return base
            },
            display() {
                let cap = ""
                if (hasMilestone("planetary", 1) && clickableEffect("addition", 13).gt("1e2500")) cap = ", CAPPED"
                else if (clickableEffect("addition", 13).gte("1e500")) cap = ", CAPPED"
                return "Addition adds to Points base: +" + format(clickableEffect("addition", 13)) + " (" + getClickableState("addition", 13) + cap + ")"
            },
            canClick() {return true},
            onClick() {
                setClickableState("addition", 13, "Active")

                if (!hasMilestone("polygon", 4)) setClickableState("addition", 11, "Inactive")
                if (!hasUpgrade("polygon", 13)) setClickableState("addition", 12, "Inactive")
                if (!player.dimension.points.gte(5)) setClickableState("addition", 14, "Inactive")
                if (!player.dimension.points.gte(5)) setClickableState("addition", 15, "Inactive")
            },
            unlocked() {return hasMilestone("primitive", 7)},
        },

        14: {
            title: "Add to Number Cores",
            effect() {
                if (inChallenge("pbooster", 22)) return new Decimal(0)
                if (hasMilestone("planetary", 9)) setClickableState("addition", 14, "ALWAYS ACTIVE")
                let base = player.addition.points
                let exp = new Decimal(0.003)
                if (hasUpgrade("multiplication", 63)) exp = exp.add(0.007)
                base = base.pow(exp).add(1)

                return base
            },
            display() {return "Addition adds to Number Cores base: +" + format(clickableEffect("addition", 14)) + " (" + getClickableState("addition", 14) + ")"},
            canClick() {return true},
            onClick() {
                setClickableState("addition", 14, "Active")

                if (!hasMilestone("polygon", 4)) setClickableState("addition", 11, "Inactive")
                if (!hasUpgrade("polygon", 13)) setClickableState("addition", 12, "Inactive")
                setClickableState("addition", 13, "Inactive")
                setClickableState("addition", 15, "Inactive")
            },
            unlocked() {return hasChallenge("arithmetic", 21) || hasMilestone("planetary", 9)},
        },

        15: {
            title: "Add to Arithmetic",
            effect() {
                if (inChallenge("pbooster", 22)) return new Decimal(0)
                let base = player.addition.points
                let exp = new Decimal(0.02)
                base = base.pow(exp).add(1)
 
                if (base.gt("1e125")) return new Decimal("1e125")
                return base
            },
            display() {
                let cap = ""
                if (clickableEffect("addition", 15).gte("1e125")) cap = ", CAPPED"
                return "Addition adds to Operation Power base: +" + format(clickableEffect("addition", 15)) + " (" + getClickableState("addition", 15) + cap + ")"
            },
            canClick() {return true},
            onClick() {
                setClickableState("addition", 15, "Active")

                if (!hasMilestone("polygon", 4)) setClickableState("addition", 11, "Inactive")
                if (!hasUpgrade("polygon", 13)) setClickableState("addition", 12, "Inactive")
                setClickableState("addition", 13, "Inactive")
                setClickableState("addition", 14, "Inactive")
            },
            unlocked() {return hasUpgrade("arithmetic", 33)},
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 1e85 Addition",
            effectDescription: "The milestone virus is spreading... HEAVILY improve \"Primitive Boost,\" \"Insane Math,\" and unlock more Fundamental upgrades.",
            done() { return player.addition.points.gte("1e85") },
            unlocked() {return player.dimension.points.gte(3) || player.planetary.unlocked},
        },
        2: {
            requirementDescription: "2: 1e410 Addition",
            effectDescription: "+5 to Fundamental buyable 1's base.",
            done() { return player.addition.points.gte("1e410") },
            unlocked() {return player.dimension.points.gte(3) || player.planetary.unlocked},
        },
        3: {
            requirementDescription: "3: 1e860 Addition",
            effectDescription: "Division boosts Number Cores very slightly and divide all polygon construction times by 10. x1e100 Number Cores.",
            done() { return player.addition.points.gte("1e860") },
            unlocked() {return player.dimension.points.gte(4) || player.planetary.unlocked},
        },
        4: {
            requirementDescription: "4: 1e2560 Addition",
            effectDescription() {
                let text = "Addition boosts Number Cores and Division. Currently: x"
                text += format(player.addition.points.add(1).pow(0.006)) + " Number Cores, x"
                text += format(player.addition.points.add(1).log(1.3)) + " Division"
                return text
            },
            done() { return player.addition.points.gte("1e2560") },
            unlocked() {return hasUpgrade("arithmetic", 35) || player.planetary.unlocked},
        },
        5: {
            requirementDescription: "5: 1e6800 Addition",
            effectDescription() {
                let text = "Addition boosts itself. Currently: x"
                if (player.addition.points.add(1).pow(player.addition.points.add(1).log(100).div("1e7")).gte("1e15000")) text += "1e15,000"
                else text += format(player.addition.points.add(1).pow(player.addition.points.add(1).log(100).div("1e7")))
                return text
            },
            done() { return player.addition.points.gte("1e6800") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
        6: {
            requirementDescription: "6: 1e50,000 Addition",
            effectDescription() {
                let text = "Addition boosts the Operation Power softcap. Currently: x"
                text += format(player.addition.points.add(1).pow(player.addition.points.log(10).div("1e6")))
                return text
            },
            done() { return player.addition.points.gte("1e50000") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
        7: {
            requirementDescription: "7: 1e400,200 Addition",
            effectDescription() {
                let text = "TENTH ROW. And the Constructor compass level boosts \"Primitive Boost\". Currently: ^"
                text += format(getBuyableAmount("polygon", 11).add(1))
                return text
            },
            done() { return player.addition.points.gte("1e400200") },
            unlocked() {return player.dimension.points.gte(5) || player.planetary.unlocked},
        },
    },
    tooltip() {return format(player.addition.points) + " Addition (+" + format(getResetGain("addition")) + " Addition/sec)"},
})