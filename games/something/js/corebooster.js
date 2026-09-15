addLayer("corebooster", {
    name: "corebooster", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CRB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        useful: new Decimal(0),
        trueUseful: new Decimal(0),
        e1: new Decimal(1),
        e2: new Decimal(1),
        e3: new Decimal(1),
        e4: new Decimal(1),
        e5: new Decimal(1),
    }},
    color: "#80e040",
    requires: new Decimal("1e30"), // Can be a function that takes requirement increases into account
    resource: "Core Boosters", // Name of prestige currency
    baseResource: "Number Cores", // Name of resource prestige is based on
    baseAmount() {return player.numbercore.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = new Decimal(3)
        if (hasAchievement("achievements", 53)) base = base.sub(0.5)
        if (hasUpgrade("primitive", 37)) base = base.sub(0.5)
        return base
    }, // Prestige currency exponent
    base() {
        let initial = new Decimal(50)
        return initial
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //final
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    directMult() {
        let dMult = new Decimal(1)

        if (hasMilestone("division", 7)) dMult = dMult.mul(1.5)
        if (hasUpgrade("primitive", 34)) dMult = dMult.mul(5)
        if (hasUpgrade("multiplication", 95)) dMult = dMult.mul(upgradeEffect("multiplication", 95))
        if (maxedChallenge("polygon", 11)) dMult = dMult.mul(2.5)
        if (hasUpgrade("division", 32)) dMult = dMult.mul(upgradeEffect("division", 32))
        dMult = dMult.mul(new Decimal(1.25).pow(getBuyableAmount("planetary", 31)))
            
        if (hasUpgrade("division", 31)) dMult = dMult.pow(player.pbooster.e3)

        return dMult
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "B", description: "SHIFT+B: Reset for Core Boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.corebooster.unlocked},
    passiveGeneration() {return false},
    onPrestige() {
        player.corebooster.points = player.corebooster.points.add(getResetGain("corebooster"))
        if (!hasMilestone("corebooster", 3)) doReset("polygon", true)

        if (hasMilestone("division", 11)) player.corebooster.useful = player.corebooster.useful.add(player.corebooster.points.mul(0.0001))
        else {
            player.corebooster.useful = player.corebooster.points
            if (player.corebooster.useful.gte(12)){
                let remainder = player.corebooster.points.sub(12)
                let divid = new Decimal(3)
                if (hasUpgrade("multiplication", 92)) divid = divid.sub(1)
                if (hasMilestone("corebooster", 2)) divid = divid.sub(0.5)

                remainder = remainder.div(divid).floor()

                player.corebooster.useful = new Decimal(12).add(remainder)
                player.corebooster.trueUseful = player.corebooster.useful

                let buff = player.corebooster.points
                let multi = new Decimal(1.2)
                if (hasMilestone("corebooster", 3)) multi = multi.add(0.3)
                if (hasUpgrade("division", 22)) player.corebooster.useful = buff.mul(multi)
            }
        }
    },
    autoPrestige() {return hasMilestone("corebooster", 3)},
    resetsNothing() {return hasMilestone("corebooster", 3)},
    canBuyMax() {return true},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        let keptUseful = player.corebooster.useful
        if (hasUpgrade("corebooster", 13)) keptUpgrades.push(11, 12, 13)

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["points", "milestones"];
        if (layers[resettingLayer].name == "planetary") keep = []

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        if (hasMilestone("division", 11)) player.corebooster.useful = keptUseful
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return "You have " + format(player.numbercore.points) + " Number Cores"}],
        "blank",
        "clickables",
        "blank",
        ["display-text", function() { return "<i>Core Boosters come bundled with a free Core Booster!"}],
        "blank",
        ["display-text", function() { return "<h3>GAINING CORE BOOSTERS WILL FORCE POLYGON RESET.</h3>"}],
        "blank",
        ["display-text", function() { return "<h2>You have " + format(player.corebooster.useful) + " useful Core Boosters, which..."}],
        "blank",
        ["display-text", function() {
            let text = "<h3>x" + format(player.corebooster.e1) + " to Shapes"
            if (hasMilestone("corebooster", 1)) text += ", x" + format(player.corebooster.e1.add(1).pow(100)) + " to Points"
            return text
        }],
        "blank",
        ["display-text", function() { return "<h3>x" + format(player.corebooster.e2) + " to Division"}],
        "blank",
        ["display-text", function() {
            if (!hasAchievement("achievements", 53) && !player.planetary.unlocked) return ""
            return "<h3>/" + format(player.corebooster.e3) + " to Pentagon and Hexagon construction time"
        }],
        "blank",
        ["display-text", function() {
            if (!hasMilestone("primitive", 11) && !player.planetary.unlocked) return ""
            return "<h3>x" + format(player.corebooster.e4) + " to Points, Fundamentality, and Addition"
        }],
        "blank",
        ["display-text", function() {
            if (!hasUpgrade("arithmetic", 37) && !player.planetary.unlocked) return ""
            return "<h3>x" + format(player.corebooster.e5) + " to Shapes and Division"
        }],
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],
    milestones: {
        1: {
            requirementDescription: "1: 130 useful Core Boosters",
            effectDescription: "The first Core Booster effect now affects Points at an increased rate. Remove the 5th Multiplication hardcap.",
            done() { return player.corebooster.useful.gte(130) },
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked}
        },
        2: {
            requirementDescription: "2: 530 useful Core Boosters",
            effectDescription: "Have more useful Core Boosters, and keep the 5th Fundamental buyable. ^1.1 Division.",
            done() { return player.corebooster.useful.gte(530) },
            unlocked() {return hasMilestone("corebooster", this.id - 1) || player.planetary.unlocked}
        },
        3: {
            requirementDescription: "3: 1,480 useful Core Boosters",
            effectDescription: "Autobuy Core Boosters. Useful Core Boosters are x1.5 your total Core Boosters.",
            done() { return player.corebooster.useful.gte(1480) },
            unlocked() {return hasMilestone("corebooster", this.id - 1) || player.planetary.unlocked}
        },
        4: {
            requirementDescription: "4: 2,222 useful Core Boosters",
            effectDescription() {
                let text = "Division boosts Points."
                let base = player.division.points
                let exp = new Decimal(100)
                base = base.pow(exp)

                text += " Currently: x" + format(base)
                return text
            },
            done() { return player.corebooster.useful.gte(2222) },
            unlocked() {return hasMilestone("corebooster", this.id - 1) || player.planetary.unlocked}
        },
        5: {
            requirementDescription: "5: 12,500 useful Core Boosters",
            effectDescription: "x500 Division and ^1.01 Multiplication.",
            done() { return player.corebooster.useful.gte(12500) },
            unlocked() {return hasMilestone("corebooster", this.id - 1) || player.planetary.unlocked}
        },
    },
    clickables: {
        11: {
            title: "Reset Core Boosters",
            display: "Reset Core Boosters. This will cause a Polygon reset and set your Core Boosters to zero. Useful if you are stuck because of Core Boosters and want to max them.",
            canClick() {return true},
            onClick() {
                doReset("polygon", true)
                player.corebooster.points = new Decimal(0)
            },
            style() {
                return {
                    "width": "150px",
                }
            }
        },
    },

    upgrades: {
        11: {
            title: "Regulation is Ultimate",
            description: "Core Boosters boost the Shape hardcap.",
            cost: new Decimal("111111"),
            unlocked() {return hasChallenge("pbooster", 21)},
            effect() {
                let base = player[this.layer].points.add(1)
                base = base.pow(16)

                return base
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            pay() {return new Decimal(0)},
        },
        12: {
            title: "Core Strengthening",
            description: "Core Boosters boost their effects.",
            cost: new Decimal("200000"),
            unlocked() {return hasChallenge("pbooster", 21)},
            effect() {
                let base = player[this.layer].points.add(1)
                base = base.pow(0.05).add(1).log("1e10").add(1)

                return base
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) },
            pay() {return new Decimal(0)},
        },
        13: {
            title: "FINALLY",
            description: "Keep Core Booster upgrades, and generate 100% of pending Shapes per second. +13th Row.",
            cost: new Decimal("400000"),
            unlocked() {return hasChallenge("pbooster", 21)},
            pay() {return new Decimal(0)},
        },
    },

    update(diff){
        if (hasMilestone("division", 11) && player.corebooster.useful.lt("999999")) player.corebooster.useful = player.corebooster.useful.add(player.corebooster.points.mul(0.0001))
        else {
            player.corebooster.useful = player.corebooster.points
            if (player.corebooster.useful.gte(12)){
                let remainder = player.corebooster.points.sub(12)
                let divid = new Decimal(3)
                if (hasUpgrade("multiplication", 92)) divid = divid.sub(1)
                if (hasMilestone("corebooster", 2)) divid = divid.sub(0.5)

                remainder = remainder.div(divid).floor()

                player.corebooster.useful = new Decimal(12).add(remainder)
                player.corebooster.trueUseful = player.corebooster.useful

                let buff = player.corebooster.points
                let multi = new Decimal(1.2)
                if (hasMilestone("corebooster", 3)) multi = multi.add(0.3)
                if (hasUpgrade("division", 22)) player.corebooster.useful = buff.mul(multi)
            }
        }

        if (player.corebooster.useful.gte("999999") || hasChallenge("pbooster", 21)) player.corebooster.useful = new Decimal("1e6")

        let e1b = player.corebooster.useful
        e1b = e1b.add(1).log(20).add(1)
        if (hasAchievement("achievements", 53)) e1b = e1b.pow(3)
        if (hasMilestone("pbooster", 3)) e1b = e1b.pow(player.pbooster.e2)
        player.corebooster.e1 = e1b

        let e2b = player.corebooster.useful
        e2b = e2b.add(1).pow(0.5)
        if (hasAchievement("achievements", 53)) e2b = e2b.pow(2)
        if (hasMilestone("pbooster", 3)) e2b = e2b.pow(player.pbooster.e2)
        player.corebooster.e2 = e2b

        let e3b = player.corebooster.useful
        e3b = e3b.add(1).pow(0.25)
        if (hasMilestone("pbooster", 3)) e3b = e3b.pow(player.pbooster.e2)
        if (!hasAchievement("achievements", 53)) player.corebooster.e3 = new Decimal(1)
        else player.corebooster.e3 = e3b

        let e4b = player.corebooster.useful
        e4b = e4b.add(1).pow(new Decimal(13).mul(player.corebooster.useful))
        if (hasMilestone("pbooster", 3)) e4b = e4b.pow(player.pbooster.e2)
        if (!hasMilestone("primitive", 11)) player.corebooster.e4 = new Decimal(1)
        else player.corebooster.e4 = e4b

        let e5b = player.corebooster.useful
        e5b = e5b.add(1).pow(1.5)
        if (hasMilestone("pbooster", 3)) e5b = e5b.pow(player.pbooster.e2)
        if (!hasMilestone("primitive", 11)) player.corebooster.e5 = new Decimal(1)
        else player.corebooster.e5 = e5b

        if (inChallenge("arithmetic", 23) || inChallenge("pbooster", 11)){
            player.corebooster.e1 = new Decimal(1)
            player.corebooster.e2 = new Decimal(1)
            player.corebooster.e3 = new Decimal(1)
            player.corebooster.e4 = new Decimal(1)
            player.corebooster.e5 = new Decimal(1)
        }

        if (hasUpgrade("corebooster", 12)){
            player.corebooster.e1 = player.corebooster.e1.pow(upgradeEffect("corebooster", 12))
            player.corebooster.e2 = player.corebooster.e2.pow(upgradeEffect("corebooster", 12))
            player.corebooster.e3 = player.corebooster.e3.pow(upgradeEffect("corebooster", 12))
            player.corebooster.e4 = player.corebooster.e4.pow(upgradeEffect("corebooster", 12))
            player.corebooster.e5 = player.corebooster.e5.pow(upgradeEffect("corebooster", 12))
        }
    },
    tooltip() {return format(player.corebooster.points) + " (" + format(player.corebooster.useful) + " Useful) Core Boosters (" + format(getNextAt("corebooster")) + " Number Cores for next Core Booster)"},
})