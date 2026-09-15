addLayer("fundamental", {
    name: "fundamental", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FND", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        softcapExponent: new Decimal(0)
    }},
    color: "#FFC800",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Fundamentality", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (hasUpgrade("fundamental", 15)) mult = mult.add(5)
        if (getClickableState("addition", 11) == "Active" && !inChallenge("arithmetic", 12)) mult = mult.add(clickableEffect("addition", 11))
        //mul
        if (hasUpgrade("fundamental", 11)) mult = mult.mul(2)
        if (hasUpgrade("fundamental", 14)) mult = mult.mul(5)
        if (hasUpgrade("fundamental", 21)) mult = mult.mul(upgradeEffect("fundamental", 21))
        if (hasUpgrade("primitive", 11)) mult = mult.mul(10)
        if (hasUpgrade("fundamental", 25)) mult = mult.mul(upgradeEffect("fundamental", 25))
        if (!inChallenge("arithmetic", 11) && getClickableState("division", 11) != "Active") mult = mult.mul(buyableEffect("fundamental", 11))
        if (hasMilestone("primitive", 3)) mult = mult.mul(25)
        if (hasMilestone("primitive", 4)) mult = mult.mul(100)
        if (hasUpgrade("subtraction", 13)) mult = mult.mul(100)
        if (hasUpgrade("multiplication", 41)) mult = mult.mul("1e25")
        mult = mult.mul(player.corebooster.e4)
        if (hasMilestone("dimension", 6)) mult = mult.mul("e1e6")
        //exp
        if (inChallenge("arithmetic", 13)) mult = mult.pow(0.75)
        if (hasChallenge("arithmetic", 13)) mult = mult.pow(1.05)
        if (inChallenge("arithmetic", 23)) mult = mult.pow(0.005)
        if (hasMilestone("pbooster", 1)) mult = mult.pow(1.3)
        
	    if (inChallenge("pbooster", 12)) mult = mult.log(10)
        //other hypers
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "F", description: "SHIFT+F: Reset for Fundamentality", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.fundamental.unlocked},
    passiveGeneration() {if (hasUpgrade("fundamental", 23) || hasUpgrade("arithmetic", 12)) return 1},
    softcap() {return new Decimal("1e50")},
    directMult() {
        let dMult = new Decimal(1)
        if (hasUpgrade("primitive", 17)) dMult = dMult.mul(upgradeEffect("primitive", 17))
        if (hasUpgrade("fundamental", 32)) dMult = dMult.mul(250)
        if (hasUpgrade("arithmetic", 11)) dMult = dMult.mul(100)
        if (hasUpgrade("subtraction", 13)) dMult = dMult.mul(100)
        if (hasUpgrade("arithmetic", 23)) dMult = dMult.mul(100)
        if (hasUpgrade("multiplication", 61)) dMult = dMult.mul("1e50")
        if (hasChallenge("arithmetic", 22)) dMult = dMult.mul("1e10")
        dMult = dMult.mul(buyableEffect("fundamental", 22))

        if (hasUpgrade("fundamental", 34)) dMult = dMult.pow(1.5)
        if (hasUpgrade("multiplication", 31)) dMult = dMult.pow(1.2)
        if (hasUpgrade("polygon", 11)) dMult = dMult.pow(1.5)
        if (player.polygon.hexagons.gte(1)) dMult = dMult.pow(player.polygon.hexEffect)
        if (hasUpgrade("division", 16)) dMult = dMult.pow(1.01)
        if (hasMilestone("primitive", 14)) dMult = dMult.pow(1.35)
        if (maxedChallenge("polygon", 11)) dMult = dMult.pow(1.01)
            
	    if (inChallenge("pbooster", 21)) dMult = dMult.div(player.planetary.planetPowerEffect.pow(0.75))
        
        return dMult
    },
    softcapPower() {
        if (player.fundamental.points.gte("1e50")) {
            let numerator = new Decimal(1)
            if (hasUpgrade("fundamental", 31)) numerator = numerator.add(10)
            if (hasUpgrade("fundamental", 36)) numerator = numerator.add(5)

            let power = numerator

            if (hasUpgrade("primitive", 24)) power = power.div(new Decimal(1).add(player.fundamental.points.div("1e50").logarithm(12)))
            else power = power.div(new Decimal(1).add(player.fundamental.points.div("1e50").logarithm(10)))
            if (hasUpgrade("arithmetic", 16)) power = power.add(new Decimal(0.1))
            if (player.fundamental.points.gte("1e500")) power = power.div(1.1)

            if (player.dimension.points.gte(5)) power = power    
            else if (player.fundamental.points.gte("1e2000")) power = power.div(1.5)

            let ultra = new Decimal(2)
            if (hasUpgrade("arithmetic", 31)) ultra = ultra.sub(0.8)
            if (hasUpgrade("polygon", 17)) ultra = ultra.sub(0.125)
            if (player.dimension.points.gte(5)) power = power
            else if (player.fundamental.points.gte("1e2700")) power = power.div(ultra)

            if (hasMilestone("primitive", 13)) power = new Decimal("0.25")
            player.fundamental.softcapExponent = power
            return power
        }
        return (new Decimal(1)) 
    },
    effectDescription() {
        let text = ""
        if (player.fundamental.points.gte("1e2700") && !player.dimension.points.gte(5)) text = text + "ultracapped by ^" + player.fundamental.softcapExponent.toFixed(6) + " to its gain."
        else if (player.fundamental.points.gte("1e2000") && !player.dimension.points.gte(5)) text = text + "hypercapped by ^" + player.fundamental.softcapExponent.toFixed(6) + " to its gain."
        else if (player.fundamental.points.gte("1e500")) text = text + "supercapped by ^" + player.fundamental.softcapExponent.toFixed(6) + " to its gain."
        else if (player.fundamental.points.gte("1e50")) text = text + "softcapped by ^" + player.fundamental.softcapExponent.toFixed(6) + " to its gain."
        else return
        return text
    },
    deactivated() {return inChallenge("arithmetic", 21)},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasMilestone("primitive", 2)) keptUpgrades.push(23)
        if (hasUpgrade("primitive", 15) || hasAchievement("achievements", 24)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27)
        if (hasAchievement("achievements", 24)) keptUpgrades.push(31, 32, 33, 34, 35, 36)
        if (hasAchievement("achievements", 35)) keptUpgrades.push(37)
        if (hasMilestone("polygon", 3)) keptUpgrades.push(41, 42)
        if (hasUpgrade("division", 14)) keptUpgrades.push(43)
        if (hasMilestone("primitive", 10)) keptUpgrades.push(44)
        if (hasUpgrade("fundamental", 46)) keptUpgrades.push(45, 46)
        if (hasUpgrade("fundamental", 47)) keptUpgrades.push(47)
        if (layers[resettingLayer].name == "planetary") keptUpgrades = [23]
        if (hasMilestone("planetary", 4)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 24, 25, 26, 27, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 47)

        if (hasUpgrade("fundamental", 51)) keptUpgrades.push(51)
        if (hasUpgrade("fundamental", 52)) keptUpgrades.push(52)
        if (hasUpgrade("fundamental", 53)) keptUpgrades.push(53)
        if (hasUpgrade("fundamental", 54)) keptUpgrades.push(54)
        if (hasUpgrade("fundamental", 55)) keptUpgrades.push(55)
        if (hasUpgrade("fundamental", 56)) keptUpgrades.push(56)
        if (hasUpgrade("fundamental", 57)) keptUpgrades.push(57)

        let keptBuyables = []
        if (hasUpgrade("primitive", 21) || hasUpgrade("arithmetic", 16)) keptBuyables.push(getBuyableAmount("fundamental", 11))
        if (hasUpgrade("arithmetic", 16)) keptBuyables.push(getBuyableAmount("fundamental", 12))
        if (hasAchievement("achievements", 34)) keptBuyables.push(getBuyableAmount("fundamental", 13))
        if (hasMilestone("polygon", 9)) keptBuyables.push(getBuyableAmount("fundamental", 21))
        if (hasMilestone("corebooster", 2)) keptBuyables.push(getBuyableAmount("fundamental", 22))
        if (layers[resettingLayer].name == "planetary") keptBuyables = []
        if (hasMilestone("planetary", 5)) keptBuyables = [
            getBuyableAmount("fundamental", 11),
            getBuyableAmount("fundamental", 12),
            getBuyableAmount("fundamental", 13),
            getBuyableAmount("fundamental", 21),
            getBuyableAmount("fundamental", 22),
        ]

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        //if (someOtherCondition) keep.push("milestones");

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades)
        setBuyableAmount("fundamental", 11, keptBuyables[0] || new Decimal(0))
        setBuyableAmount("fundamental", 12, keptBuyables[1] || new Decimal(0))
        setBuyableAmount("fundamental", 13, keptBuyables[2] || new Decimal(0))
        setBuyableAmount("fundamental", 21, keptBuyables[3] || new Decimal(0))
        setBuyableAmount("fundamental", 22, keptBuyables[4] || new Decimal(0))
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        if (!hasUpgrade("fundamental", 23) || !hasUpgrade("arithmetic", 12)) return
                        let text = "You are gaining "
                        text = text + format(getResetGain(this.layer)) + " Fundamentality per second"
                        return text
                    }
                ],
                "blank",
                "upgrades",
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        if (!hasUpgrade("fundamental", 23) || !hasUpgrade("arithmetic", 12)) return
                        let text = "You are gaining "
                        text = text + format(getResetGain(this.layer)) + " Fundamentality per second"
                        return text
                    }
                ],
                "blank",
                "buyables",
            ],
            unlocked() {return hasUpgrade("primitive", 13) || player.arithmetic.unlocked}
        },
    },
    upgrades: {
        11: {
            title: "The First REAL Upgrade",
            description: "x2 Points and Fundamentality.",
            cost: new Decimal(1),
        },

        12: {
            title: "The Second REAL Upgrade",
            description: "x3 Points. And maybe something else...",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
        },

        13: {
            title: "Learn the Order of Boosts",
            description: "+1 Points. (operations in order: +, *, ^, etc.)",
            cost: new Decimal(15),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
        },

        14: {
            title: "The Beginning of the Exponential",
            description: "x5 Fundamentality.",
            cost: new Decimal(30),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
        },

        15: {
            title: "The 5th Upgrade",
            description: "x3 Points and +5 Fundamentality.",
            cost: new Decimal(150),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
        },

        16: {
            title: "The Largest Boost so far",
            description: "x15 Points! And +5 Points because why not.",
            cost: new Decimal(1000),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
        },

        17: {
            title: "Progressing",
            description: "Fundamentality boosts Points.",
            cost: new Decimal(2500),
            unlocked() {return hasUpgrade("fundamental", 11) || player.primitive.unlocked},
            effect() {
                let base = player[this.layer].points.add(1)
                if (hasUpgrade("fundamental", 22)) base = base.pow(0.75)
                else base = base.pow(0.33)

                if (base.pow(buyableEffect("fundamental", 12)).gte("1e6500") && !hasUpgrade("fundamental", 54)) return new Decimal("1e6500")
                if (inChallenge("arithmetic", 11) || getClickableState("division", 11) == "Active") return base

                let threshold = new Decimal("1e6500").div(new Decimal("1e6500").add(1).log(1.000001).pow(10000))
                if (hasUpgrade("fundamental", 54)) base = base.add(1).log(1.000001).pow(10000).mul(threshold)

                return base.pow(buyableEffect("fundamental", 12))
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
        },

        21: {
            title: "Mutual Relationship",
            description: "Points boosts Fundamentality.",
            cost: new Decimal(25000),
            unlocked() {return hasUpgrade("fundamental", 17) || player.primitive.unlocked},
            effect() {
                if (player.points.add(1).pow(0.25).pow(buyableEffect("fundamental", 12)).gte("1e10000") && !hasMilestone("planetary", 3)) return new Decimal("1e10000")
                if (inChallenge("arithmetic", 11) || getClickableState("division", 11) == "Active") return player.points.add(1).pow(0.25)
                return player.points.add(1).pow(0.25).pow(buyableEffect("fundamental", 12))
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
        },

        22: {
            title: "Improving the Past",
            description: "\"Progressing\" is improved.",
            cost: new Decimal(1000000),
            unlocked() {return hasUpgrade("fundamental", 17) || player.primitive.unlocked},
        },

        23: {
            title: "Generation",
            description: "Passively generate 100% of pending Fundamentality per second.",
            cost: new Decimal("1e9"),
            unlocked() {return hasUpgrade("fundamental", 17) || player.primitive.unlocked},
        },

        24: {
            title: "The Next Layer",
            description: "x100 Unlock Points.",
            cost: new Decimal("1e11"),
            unlocked() {return hasUpgrade("fundamental", 17) || player.primitive.unlocked},
        },

        25: {
            title: "Welcome Back!",
            description: "Fundamentality boosts itself.",
            cost: new Decimal("5e16"),
            unlocked() {return hasUpgrade("primitive", 12) || player.arithmetic.unlocked},
            effect() { return player.fundamental.points.add(1).pow(0.15)},
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
        },

        26: {
            title: "1 Sextillion.",
            description: "x25 Points.",
            cost: new Decimal("1e21"),
            unlocked() {return hasUpgrade("primitive", 12) || player.arithmetic.unlocked},
        },

        27: {
            title: "Wrong Layer",
            description: "x2 Numbers.",
            cost: new Decimal("1e51"),
            unlocked() {return hasUpgrade("primitive", 12) || player.arithmetic.unlocked},
        },

        31: {
            title: "New Row!",
            description: "+10 to Fundamentality softcap numerator and x5 Numbers.",
            cost: new Decimal("1e52"),
            unlocked() {return hasUpgrade("fundamental", 27) || player.arithmetic.unlocked},
        },

        32: {
            title: "Need Help?",
            description: "x25 Numbers and x250 Fundamentality after softcap.",
            cost: new Decimal("1e63"),
            unlocked() {return hasUpgrade("fundamental", 27) || player.arithmetic.unlocked},
        },

        33: {
            title: "That was... Fast...",
            description: "x1e6 to Points.",
            cost: new Decimal("1e69"),
            unlocked() {return hasUpgrade("fundamental", 27) || player.arithmetic.unlocked},
        },

        34: {
            title: "Placeholder Name",
            description: "^1.5 Fundamentality after softcap. Also, x500 Unlock Points.",
            cost: new Decimal("1e72"),
            unlocked() {return hasUpgrade("fundamental", 27) || player.arithmetic.unlocked},
        },

        35: {
            title: "x1e21",
            description: "x1000 Points and x20 Numbers.",
            cost: new Decimal("1e93"),
            unlocked() {return hasUpgrade("fundamental", 27) || player.arithmetic.unlocked},
        },
        
        36: {
            title: "PERIODIC TABLE???",
            description: "+5 to Fundamentality softcap numerator and... x3 Operation Power!",
            cost: new Decimal("1e118"),
            unlocked() {return hasMilestone("primitive", 6) || player.polygon.unlocked},
        },

        37: {
            title: "The Next Layer V2",
            description: "This is getting slow. x1e10 Unlock Points.",
            cost: new Decimal("1e156"),
            unlocked() {return hasMilestone("primitive", 6) || player.polygon.unlocked},
        },

        41: {
            title: "Fundamental Exponent",
            effect() {
                let effect = player.fundamental.points
                effect = effect.add(1).pow(0.0002)
                if (effect.gte(25)) effect = new Decimal(25)
                return effect
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) },
            description: "Oh, hi. Raise Numbers based on Fundamentality.",
            cost: new Decimal("1e321"),
            unlocked() {return hasMilestone("addition", 1) || player.polygon.unlocked},
        },

        42: {
            title: "Random Number",
            description: "+100 to Subtraction base and x1e5 Numbers.",
            cost: new Decimal("3.49e446"),
            unlocked() {return hasMilestone("addition", 1) || player.polygon.unlocked},
        },

        43: {
            title: "oh hi there",
            description: "Welcome to the Fundamentality ultracap. Keep the fourth and fifth row of TMT and x1.5 Division.",
            cost: new Decimal("1e2700"),
            unlocked() {return player.fundamental.points.gte("1e2700") || hasUpgrade("fundamental", 43) || player.planetary.unlocked},
        },

        44: {
            title: "Halfway",
            description: "+150 to the max of Fundamental buyable 1 and +5 to the maxes of Fundamental buyables 2 and 3.",
            cost: new Decimal("1e2800"),
            unlocked() {return hasUpgrade("arithmetic", 31) || player.planetary.unlocked},
        },
        45: {
            title: "Progressing+",
            effect() {
                let effect = player.fundamental.points
                effect = effect.add(1).pow(0.001)
                if (hasChallenge("pbooster", 11)) effect = effect.mul(effect.add(1).pow(0.1))
                return effect
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            description: "Fundamentality boosts all Constructor polygons.",
            cost: new Decimal("1e3350"),
            unlocked() {return hasUpgrade("fundamental", 44) || player.planetary.unlocked},
        },
        46: {
            title: "Kept, kept!",
            description: "Keep the 26th and 27th Fundamental Upgrade, the 8th row of TMT, and Arithmetic Challenge 5.",
            cost: new Decimal("1e3500"),
            unlocked() {return hasUpgrade("fundamental", 45) || player.planetary.unlocked},
        },
        47: {
            title: "Finality of Fourth Row",
            description: "After all operations, x1e100 Points.",
            cost: new Decimal("1e20600"),
            unlocked() {return hasUpgrade("fundamental", 46) || player.planetary.unlocked},
        },

        51: {
            title: "THE ENDLESS COST GAP",
            effect() {
                let effect = player.fundamental.points
                effect = effect.add(1).slog(1.1).pow(1.5)
                if (hasMilestone("pbooster", 2)) effect = effect.mul(effect.add(1).pow(0.2).add(1)).pow(1.25)
                return effect
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            description: "Fundamentality delays the Shape hardcap at an INSANELY reduced rate.",
            cost: new Decimal("e295000000"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(1)},
        },
        52: {
            title: "Steady OoMs",
            description: "^1.05 Points.",
            cost: new Decimal("e375000000"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(2)},
        },
        53: {
            title: "MORE SHAPES!",
            description: "x1e50 to the Shape hardcap. Additionally, improve Core Boosters' second effect.",
            cost: new Decimal("e500000000"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(3)},
        },
        54: {
            title: "Progressing++",
            description: "Uncap \"Progressing\", but its effect is softcapped after 1e6500. ^1.01 Number Cores.",
            cost: new Decimal("e533000000"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(4)},
        },
        55: {
            title: "Wrong Layer+",
            description: "x1e20 to the Shape Hardcap and improve Pentagon's effect.",
            cost: new Decimal("e555555555"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(5)},
        },
        56: {
            title: "NEED. MORE. QOL.",
            description: "Keep the 11th row and 10th Polygon upgrade. +1 Planetary Boosters.",
            cost: new Decimal("e560e6"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(6)},
        },
        57: {
            title: "Fifth Row Conclusion",
            effect() {
                let effect = player.fundamental.points
                effect = effect.add(1).slog(1.5)
                return effect
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            description: "Fundamentality multplies Planetary Fragments.",
            cost: new Decimal("e615e6"),
            unlocked() {return getBuyableAmount("numbercore", 23).gte(7)},
        },
    },
    buyables: {
        11: {
            cost(x) {
                let expbase = new Decimal("1000")
                if (hasUpgrade("primitive", 21)) expbase = expbase.sub(400)
                let final = expbase.pow(x).mul("1e30")

                if (x.gte(250)) final = final.mul("1e2000")

                return final
            },
            title: "Exponential Increase",
            display() {
                return "Multiplies Points and Fundamentality by 2 per purchase. " + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/" + tmp.fundamental.buyables[11].purchaseLimit + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base = new Decimal(2)
                if (hasMilestone("dimension", 1) && !inChallenge("arithmetic", 13)) base = base.add(3)
                if (hasMilestone("primitive", 8)) {
                    let addit = new Decimal(0.1)
                    if (hasUpgrade("multiplication", 11)) addit = addit.add(0.4)
                    base = base.add(getBuyableAmount("fundamental", 13).mul(addit))
                }
                if (hasMilestone("addition", 2)) base = base.add(5)
                let effect = base.pow(x)
                if (inChallenge("arithmetic", 13)) effect = effect.pow(0.75)
                if (player.polygon.points.gte(1)) effect = effect.mul(player.polygon.effect)
                if (hasUpgrade("multiplication", 61)) effect = effect.pow(1.1)
                if (player.dimension.points.gte(4)) effect = effect.pow(1.2)
                
                if (hasUpgrade("planetary", 14)) effect = effect.pow(upgradeEffect("planetary", 14))
                return effect
            },
            unlocked() {return hasUpgrade("primitive", 13) || player.arithmetic.unlocked},
            purchaseLimit() {
                let cap = new Decimal(200)
                if (hasMilestone("polygon", 6)) cap = cap.add(50)
                if (hasUpgrade("fundamental", 44)) cap = cap.add(150)
                return cap
            },
        },
        12: {
            cost(x) {
                let expbase = new Decimal("1e5")
                if (hasUpgrade("subtraction", 11)) expbase = expbase.sub("15000")
                let final = expbase.pow(x).mul("1e70")

                if (x.gte(20)) final = final.mul("1e2600")

                return final
            },
            title: "Dynamic Improvement",
            display() {
                return "Improves \"Progressing\" and \"Mutual Relationship\" per purchase. " + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/" + tmp.fundamental.buyables[12].purchaseLimit + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base = new Decimal(1).add(x.div(10))
                if (hasUpgrade("multiplication", 41)) base = base.pow(1.05)
                return base
            },
            unlocked() {return hasUpgrade("primitive", 22) || player.arithmetic.unlocked},
            purchaseLimit() {
                let cap = new Decimal("10").add(buyableEffect("fundamental", 13))
                if (hasUpgrade("fundamental", 44)) cap = cap.add(5)
                return cap
            },
        },
        13: {
            cost(x) {
                let base = new Decimal("1e40").pow(x).mul("1e150")
                if (x.gte(10)) base = base.mul("1e2200")
                if (x.gte(15)) base = base.mul("1e22200")
                return base
            },
            title: "Hardcap Delay",
            display() {
                return "Adds 1 to the number of max purchases of \"Dynamic Improvement\" per purchase. " + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/" + tmp.fundamental.buyables[13].purchaseLimit + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: +" + format(this.effect())
            },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { return new Decimal(x) },
            unlocked() {return hasChallenge("arithmetic", 11) || player.polygon.unlocked},
            purchaseLimit(){
                let cap = new Decimal("10")
                if (hasUpgrade("fundamental", 44)) cap = cap.add(5)
                cap = cap.add(getBuyableAmount("fundamental", 22).mul(3))
                return cap
            },
        },
        21: {
            cost(x) {
                let base = new Decimal("1e1200")
                let expbase = new Decimal("1e75")
                if (player.dimension.points.gte(4)) expbase = new Decimal("1e60")
                let multi = new Decimal(expbase).pow(x)

                if (x.gte(50)) multi = multi.mul("1e21500")
                return base.mul(multi)
            },
            title: "Can't Think of a Good Name.",
            display() { return "Raises points to ^1.005 per purchase." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/" + tmp.fundamental.buyables[21].purchaseLimit + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: ^" + this.effect().toFixed(4) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base = new Decimal(1.005)
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasMilestone("polygon", 6) || player.planetary.unlocked},
            purchaseLimit(){
                let cap = new Decimal("50")
                cap = cap.add(getBuyableAmount("fundamental", 22).mul(3))
                return cap
            },
        },
        22: {
            cost(x) {
                let base = new Decimal("1e25000")
                let expbase = new Decimal("1e250")
                let extra = new Decimal("0")

                if (x.gte(10)) {expbase = expbase.mul("1e150"); extra = extra.add("1")}
                if (x.gte(20)) {expbase = expbase.mul("1e250"); extra = extra.add("1")}
                if (x.gte(30)) {expbase = expbase.mul("1e350"); extra = extra.add("1")}
                if (x.gte(40)) {expbase = expbase.mul("1e450"); extra = extra.add("1")}
                if (x.gte(50)) {expbase = expbase.mul("1e550"); extra = extra.add("2")}
                if (x.gte(60)) {expbase = expbase.mul("1e650"); extra = extra.add("2")}
                if (x.gte(70)) {expbase = expbase.mul("1e750"); extra = extra.mul("40")}
                if (x.gte(80)) {expbase = expbase.mul("1e850"); extra = extra.mul("1.1")}
                if (x.gte(90)) {expbase = expbase.mul("1e950"); extra = extra.mul("4.8")}

                let multi = new Decimal(expbase).pow(x)
                return base.mul(multi).mul(new Decimal("1e500").pow(extra))
            },
            title: "Triple La- Boost",
            display() { return "x1e25 Points, Fundamentality, and Numbers after softcap per purchase, along with +3 to the caps of \"Can't Think of a Good Name.\" and \"Hardcap Delay\"." + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/" + new Decimal("100") + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) + ", +" + getBuyableAmount(this.layer, this.id).mul(3) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base = new Decimal("1e25")
                let effect = base.pow(x)
                return effect
            },
            unlocked() {return hasUpgrade("primitive", 36) || player.planetary.unlocked},
            purchaseLimit: new Decimal(100)
        },
    },

    glowColor() {
        let layer = "fundamental"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12, 13, 21, 22]) {
            if (canBuyBuyable(layer, id)) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "fundamental"
        for (const id of [11, 12, 13, 21, 22]) {
            if (canBuyBuyable("fundamental", id)) {
                return true
            }
        }
        return false
    },

    automate() {
        let layer = "fundamental"
        for (const id of [11, 12, 13, 21, 22]) {
            if (canBuyBuyable(layer, id) && hasMilestone("planetary", 2) && player.fundamental.PM2FT) {
                player[layer].points = player[layer].points.sub(tmp[layer].buyables[id].cost)
                setBuyableAmount(layer, id, getBuyableAmount(layer, id).add(1))
            }
        }
    },

    branches: [["primitive", "#FFFFFF", 10]],
    tooltip() {return format(player.fundamental.points) + " Fundamentality (+" + format(getResetGain("fundamental")) + " Fundamentality on reset)"},
})