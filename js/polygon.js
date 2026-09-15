addLayer("polygon", {
    name: "polygon", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PLY", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        resets: new Decimal(0),
        effect: new Decimal(0),
        softcap: new Decimal(1),
        constrBaseTime: new Decimal(30),
        constrCurrentTime: new Decimal(30),

        triangles: new Decimal(0),
        squares: new Decimal(0),
        pentagons: new Decimal(0),
        hexagons: new Decimal(0),
        triEffect: new Decimal(1),
        squEffect: new Decimal(1),
        penEffect: new Decimal(1),
        hexEffect: new Decimal(1),

        constrNextGain: new Decimal(1),
        hardcap: new Decimal("1e200"),
        bestHardcapDelay: new Decimal("1e200"),
        FU51KEEP: new Decimal(1),
    }},
    color: "#2050FF",
    requires: new Decimal("1e80"), // Can be a function that takes requirement increases into account
    resource: "Shapes", // Name of prestige currency
    baseResource: "Operation Power", // Name of resource prestige is based on
    baseAmount() {return player.arithmetic.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.0333, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        if (hasMilestone("division", 2)) mult = mult.mul(10)
        if (hasUpgrade("polygon", 13)) mult = mult.mul(upgradeEffect("polygon", 13))
        if (player.dimension.points.gte(4)) mult = mult.mul(4)
        if (hasUpgrade("arithmetic", 31)) mult = mult.mul(25)
        if (hasUpgrade("multiplication", 81)) mult = mult.mul(upgradeEffect("multiplication", 81))
        if (hasUpgrade("arithmetic", 37)) mult = mult.mul(player.corebooster.e5)
        if (hasMilestone("division", 7)) mult = mult.mul(10)
        if (hasUpgrade("multiplication", 102)) mult = mult.mul(upgradeEffect("multiplication", 102))
        if (hasUpgrade("subtraction", 24)) mult = mult.mul("1e10")
        if (hasMilestone("planetary", 1)) mult = mult.mul(100)
        //exp
        if (hasUpgrade("division", 16)) mult = mult.pow(1.01)
        if (inChallenge("arithmetic", 23)) mult = mult.pow(0.025)
        //other hypers
        //final effects

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "S", description: "SHIFT+S: Reset for Shapes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.polygon.unlocked},
    resetDescription: "Polygonify for ",
    onPrestige() {
        let mult = decimalOne
        if (hasMilestone("planetary", 9)) mult = mult.mul("1e6")

        player.polygon.resets = player.polygon.resets.add(mult)
        player.polygon.softcap = new Decimal(1)

        player.polygon.FU51KEEP = upgradeEffect("fundamental", 51)
    },
    effect() {
        let base = player.polygon.points.add(1).pow(3.33)
        if (base.gte("1e200")) base = base.pow(0.02).mul("1e200")
        player.polygon.effect = base
    },
    effectDescription() {
        return "multiplying Fundamental buyable 1's effect, Multiplication's effect, and \"Arithmetic Combination\" by x" + format(player.polygon.effect)
    },
    softcap() {return new Decimal("1e50")},
    passiveGeneration() {if (hasUpgrade("corebooster", 13)) return 1},
    directMult() {
        let dMult = new Decimal(1)
        if (hasUpgrade("multiplication", 101)) dMult = dMult.mul("1e6")
        if (hasUpgrade("division", 24)) dMult = dMult.mul(upgradeEffect("division", 24))
        if (hasUpgrade("division", 27)) dMult = dMult.mul("1e10")
        if (hasUpgrade("polygon", 24)) dMult = dMult.mul(5)

        if (hasUpgrade("subtraction", 26)) dMult = dMult.pow(1.01)
        return dMult
    },
    softcapPower() {
        let power = new Decimal(0.05)
        player.polygon.softcap = power
        return power
    },
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        setClickableState("polygon", 12, "Enabled")
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasMilestone("planetary", 7)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17)
        if (hasUpgrade("planetary", 16)) keptUpgrades.push(21, 22)
        if (hasUpgrade("fundamental", 56)) keptUpgrades.push(23)

        if (hasUpgrade("polygon", 24)) keptUpgrades.push(24)
        if (hasUpgrade("polygon", 25)) keptUpgrades.push(25)
        if (hasUpgrade("polygon", 26)) keptUpgrades.push(26)
        if (hasUpgrade("polygon", 27)) keptUpgrades.push(27)

        let keptBuyables = []
        if (hasUpgrade("planetary", 15)) keptBuyables.push(getBuyableAmount("polygon", 11), getBuyableAmount("polygon", 12))

        let keptPolygonifications = new Decimal(0)
        if (hasMilestone("planetary", 10)) keptPolygonifications = player.polygon.resets

        let keptBHD = player.polygon.bestHardcapDelay

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier in Stage 2
        if (hasAchievement("planetary", 23)) player[this.layer].challenges[11] = 10
        player[this.layer].upgrades.push(...keptUpgrades)
        if (hasMilestone("planetary", 10)) player.polygon.resets = keptPolygonifications
        player.polygon.bestHardcapDelay = keptBHD

        setBuyableAmount("polygon", 11, keptBuyables[0] || new Decimal(0))
        setBuyableAmount("polygon", 12, keptBuyables[1] || new Decimal(0))
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.arithmetic.points) + " Operation Power" }],
                ["display-text", function() { return "You have Polygonified " + format(player.polygon.resets) + " time(s)" }],
                "blank",
                ["display-text", function() {
                    if (getResetGain("polygon").gte(player.polygon.hardcap)) return "Shapes <i>are</i> physical objects in The Void, by the way, so to prevent injuries and deaths...<br><br> <b>Shape gain is hardcapped at " + format(player.polygon.hardcap) + ".</b><br><br> But this hardcap can be delayed, just like Operation Power! It's the equivalent of giving the Void Masters more real estate! (This probably makes no sense if you don't care about the lore, but the hardcap value is in there somewhere.)"
                    if (getResetGain("polygon").lt("1e50")) return ""
                    return "Shape gain is softcapped by ^" + format(player.polygon.softcap) + "!"
                }],
                "blank",
                "milestones",
                "blank",
                "upgrades",
            ],
        },
        "Constructor": {
            unlocked() {return hasMilestone("division", 3) || hasMilestone("planetary", 6)},
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.arithmetic.points) + " Operation Power" }],
                ["display-text", function() { return "You have Polygonified " + format(player.polygon.resets) + " time(s)" }],
                "blank",
                ["display-text", function() {
                    if (getResetGain("polygon").gte(player.polygon.hardcap)) return "Shapes <i>are</i> physical objects in The Void, by the way, so to prevent injuries and deaths...<br><br> <b>Shape gain is hardcapped at " + format(player.polygon.hardcap) + ".</b><br><br> But this hardcap can be delayed, just like Operation Power! It's the equivalent of giving the Void Masters more real estate! (This probably makes no sense if you don't care about the lore, but the hardcap value is in there somewhere.)"
                    if (getResetGain("polygon").lt("1e50")) return ""
                    return "Shape gain is softcapped by ^" + format(player.polygon.softcap) + "!"
                }],
                "blank",
                ["display-text", function() { return "<b>Unlocking the Constructor unlocks a 4th buyable for Number Cores, gives +1 upgrade in the 5th row of TMT, and unlocks the 6th row of TMT. Also, x5 Division." }],
                "blank",
                ["display-text", function() { return "<sup>Note: \"Constructor polygons\" will refer to the Constructor's shapes, \"Shapes\" will refer to the main currency, \"Polygon Layer\" will refer to the layer as a whole." }],
                "blank",
                ["bar", "level"],
                "blank",
                ["clickables", [1]],
                ["display-text", function() {
                    if (inChallenge("polygon", 11)) return "You have constructed <b>" + format(player.polygon.triangles) + " Triangles</b>, but you are currently sacrificing the Constructor, so they do not do anything."
                    let text = "You have constructed <b>" + format(player.polygon.triangles) + " Triangles</b>, multiplying Operation power (after softcap) by x" + format(player.polygon.triEffect)
                    if (hasMilestone("division", 4)) text += ", Squares by x" + format(player.polygon.triEffect.add(1).pow("0.5")) + ", Points by x" + format(player.polygon.triEffect.add(1).pow("100"))
                    return text
                }],
                ["display-text", function() { return "You have constructed <b>" + format(player.polygon.squares) + " Squares</b>, multiplying Number Cores by x" + format(player.polygon.squEffect) }],
                ["display-text", function() { return "You have constructed <b>" + format(player.polygon.pentagons) + " Pentagons</b>, raising Addition, Subtraction, and Operation Power (after softcap) to ^" +format(player.polygon.penEffect, 6)}],
                ["display-text", function() {
                    let text = "You have constructed <b>" + format(player.polygon.hexagons) + " Hexagons</b>, raising Points, Fundamentality (after softcap), and Numbers (after softcap) to ^" + format(player.polygon.hexEffect, 6)
                    if (hasUpgrade("multiplication", 81)) text += " and multiplying Triangles, Squares, and Pentagons by x" + format(player.polygon.hexagons.pow(0.8))
                    return text
                }],
                "blank",
                ["buyables", [1]],
                "blank",
                ["display-text", function() {
                    if (challengeCompletions("polygon", 11) < 5) return ""
                    let text = "<b>Tip: Arithmetic reset..."
                    return text
                }],
                "blank",
                "challenges",
                "blank",
                ["display-text", function() {
                    if (!maxedChallenge("polygon", 11)) return ""
                    let text = "<b>Complete Constructor Sacrifice bonus:</b> x2.5 Core Boosters, x1e5000 Points, ^1.01 Fundamentality (after softcap) and Number Cores, ^1.2 Multiplication, and the Numbers softcap is fixed at ^0.35. ^1.27 all Constructor polygons."
                    return text
                }],
                "blank",
            ],
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 1 Polygonification",
            effectDescription: "Keep all Primitive milestones completed.",
            done() { return player.polygon.resets.gte("1") },
            unlocked() {return true},
        },
        2: {
            requirementDescription: "2: 2 Polygonifications",
            effectDescription: "Keep all Arithmetic Challenges unlocked.",
            done() { return player.polygon.resets.gte("2") },
            unlocked() {return true},
        },
        3: {
            requirementDescription: "3: 3 Polygonifications",
            effectDescription: "Keep Fundamental upgrades 1-23, Primitive upgrades 1-12, and Arithmetic upgrades 1-7.",
            done() { return player.polygon.resets.gte("3") },
            unlocked() {return true},
        },
        4: {
            requirementDescription: "4: 4 Polygonifications",
            effectDescription: "The Addition booster for Fundamentality is always active. Passively generate 100% of pending Operation Power per second.",
            done() { return player.polygon.resets.gte("4") },
            unlocked() {return true},
        },
        5: {
            requirementDescription: "5: 5 Polygonifications",
            effectDescription: "Unlock Division and keep Multiplication unlocked.",
            done() { return player.polygon.resets.gte("5") },
            unlocked() {return true},
        },
        6: {
            requirementDescription: "6: 7 Polygonifications",
            effectDescription: "Unlock a Multiplication buyable and another Fundamental buyable. +50 to the max of Fundamental buyable 1.",
            done() { return player.polygon.resets.gte("7") },
            unlocked() {return true},
        },
        7: {
            requirementDescription: "7: 10 Polygonifications",
            effectDescription: "x1e10 Points in Long Division.",
            done() { return player.polygon.resets.gte("10") },
            unlocked() {return true},
        },
        8: {
            requirementDescription: "8: 25 Polygonifications",
            effectDescription: "x3.5 Division, and keep the first three Arithmetic Challenges completed.",
            done() { return player.polygon.resets.gte("25") },
            unlocked() {return true},
        },
        9: {
            requirementDescription: "9: 50 Polygonifications",
            effectDescription: "KEEPIN' EVERYTHING! Keep the 4th Fundamental buyable, Primitive upgrades 13-14, the second row of Arithmetic upgrades, and Multiplication on Polygonification.",
            done() { return player.polygon.resets.gte("50") },
            unlocked() {return true},
        },
    },
    upgrades: {
        11: {
            title: "Powerful Boosts",
            description: "x1000 Operation Power and ^1.5 Fundamentality, both after softcap.",
            cost: new Decimal(50),
        },
        12: {
            title: "Not Much to do Here...",
            description: "x1e40 Unlock Points.",
            cost: new Decimal(250),
        },
        13: {
            effect(){
                let base = player.subtraction.points
                base = base.pow(0.001)
                if (base.eq(0)) base = new Decimal(1)
                if (base.gte("1e250")) return new Decimal("1e250")
                return base
            },
            effectDisplay(){
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
            title: "QOL Time!",
            description: "Keep the first three rows of TMT, and the Addition booster for Numbers is always active. Also, Subtraction boosts Shapes.",
            cost: new Decimal(500),
        },
        14: {
            title: "Another Challenge?",
            description: "Unlock a 4th Arithmetic Challenge.",
            cost: new Decimal("2000"),
        },
        15: {
            effect(){
                let base = getBuyableAmount("multiplication", 11)
                base = base.add(1).pow(1.5).pow(base.add(1).log(4))
                if (hasMilestone("primitive", 9)) base = base.mul(base.pow(0.5))
                return base
            },
            effectDisplay(){
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
            title: "This isn't even Polygon-related.",
            description: "The amount of the first Multiplication buyable boosts Number Cores, and keep its amount.",
            cost: new Decimal("50000"),
        },
        16: {
            effect(){
                let base = player.polygon.points
                base = base.add(1).log(10).add(1)
                return base
            },
            effectDisplay(){
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
            title: "Parallel Universe",
            description: "Shapes are polygons, polygons are shapes. Shapes boost all Constructor polygons.",
            cost: new Decimal("1000000"),
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        17: {
            title: "More Basic Boosts",
            description: "Nerf the Fundamentality ultracap again, and ^1.3 Operation Power after softcap.",
            cost: new Decimal("50e6"),
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },

        21: {
            title: "TETRATION????",
            description: "Tetrate Points to ^^1+10<sup>-12</sup>",
            cost: new Decimal("1e560"),
            unlocked() {return hasMilestone("pbooster", 2)},
        },  
        22: {
            title: "Additive Constant Boost",
            description: "+25 Planetary Fragments.",
            cost: new Decimal("1e570"),
            unlocked() {return hasMilestone("pbooster", 2)},
        }, 
        23: {
            title: "Number Cores Lifesaver",
            description: "Delay the Number Cores softcap to e1e6.",
            cost: new Decimal("1e615"),
            unlocked() {return hasMilestone("pbooster", 2)},
        },  
        24: {
            effect(){
                let base = player.polygon.points
                base = base.add(1).log("1e10").add(1)
                return base
            },
            effectDisplay(){
                return "x" + format(upgradeEffect(this.layer, this.id))
            },
            title: "Arbitrary n-gon",
            description: "Shapes boost Planetary Fragments, and x5 Shapes after softcap.",
            cost: new Decimal("1e820"),
            unlocked() {return hasChallenge("pbooster", 11)},
        },  
        25: {
            title: "Avid Challenger",
            description: "Unlock two more Booster Challenges.",
            cost: new Decimal("1e1024"),
            unlocked() {return hasChallenge("pbooster", 11)},
        }, 
        26: {
            title: "8-Dimensional Boost",
            description: "x512 Planetary Fragments and +1 upgrade in 13th row.",
            cost: new Decimal("1e6070"),
            canAfford() {return player.dimension.points.gte("8")},
            unlocked() {return hasMilestone("pbooster", 5)},
        }, 
        27: {
            title: "Upgrades? Again??",
            description: "x1.25 Planetary Boosters and unlock two more Division upgrades.",
            cost: new Decimal("1e6230"),
            unlocked() {return hasMilestone("pbooster", 5)},
        }, 
    },
    bars: {
        level: {
            direction: RIGHT,
            width: 750,
            height: 75,
            display() {
                let chosen = getClickableState("polygon", 11) || "triangle"
                let text = "Your next " + format(player.polygon.constrNextGain) + " " + chosen + "s will be constructed in " + formatTime(player.polygon.constrCurrentTime) + "/" + formatTime(player.polygon.constrBaseTime) + "."
                
                return text
            },
            progress() {
                let prog = 0
                prog = 1 - (player.polygon.constrCurrentTime.div(player.polygon.constrBaseTime))
                return prog
            },
            baseStyle() { return {"background-color": "#082070",} },
            fillStyle() { return {"background-color": "#2050FF",} },
        },
    },
    clickables: {
        11: {
            title: "Switch Focus",
            display() {
                return "Switching construction focus will reset the construction timer. <b>Currently: " + getClickableState("polygon", 11)
            },
            canClick() {return true},
            onClick() {
                //Decide time...
                if (getClickableState("polygon", 11) == "Pentagon") {setClickableState("polygon", 11, "Hexagon"); player.polygon.constrBaseTime = new Decimal(10800)}
                else if (getClickableState("polygon", 11) == "Square") {setClickableState("polygon", 11, "Pentagon"); player.polygon.constrBaseTime = new Decimal(3600)}
                else if (getClickableState("polygon", 11) == "Triangle") {setClickableState("polygon", 11, "Square"); player.polygon.constrBaseTime = new Decimal(300)}
                else {setClickableState("polygon", 11, "Triangle"); player.polygon.constrBaseTime = new Decimal(30)}

                //Global time shifts
                player.polygon.constrBaseTime = player.polygon.constrBaseTime.mul(buyableEffect("polygon", 11))
                if (hasMilestone("addition", 3)) player.polygon.constrBaseTime = player.polygon.constrBaseTime.div(10)
                if (hasUpgrade("subtraction", 17)) player.polygon.constrBaseTime = player.polygon.constrBaseTime.div(3)
                if (hasMilestone("planetary", 1)) player.polygon.constrBaseTime = player.polygon.constrBaseTime.div(100)

                //Specific time shifts
                //tri
                //squ
                //pen
                if (getClickableState("polygon", 11) == "Pentagon") player.polygon.constrBaseTime = player.polygon.constrBaseTime.div(player.corebooster.e3)
                //hex
                if (getClickableState("polygon", 11) == "Hexagon") player.polygon.constrBaseTime = player.polygon.constrBaseTime.div(player.corebooster.e3)

                player.polygon.constrCurrentTime = player.polygon.constrBaseTime
            },
        },
        12: {
            title: "Disable Constructor",
            display() {
                return "Disabling the Constructor will stop construction and generation of ALL Constructor polygons. <b>Currently: Construction is " + getClickableState("polygon", 12)
            },
            canClick() {return true},
            onClick() {
                if (getClickableState("polygon", 12) == "Enabled") setClickableState("polygon", 12, "Disabled")
                else setClickableState("polygon", 12, "Enabled")
            },
            unlocked() {return hasMilestone("planetary", 6)},
            style() {return {"width": "150px"}},
        },
    },
    buyables: {
        11: {
            cost(x) {
                let base = new Decimal("1500")
                let scale = new Decimal("1.1").add(x.div("10"))
                
                let final = scale.pow(x).mul(base)
                final = final.div(buyableEffect("numbercore", 22)[1])
                if (hasUpgrade("subtraction", 23)) final = final.div("1e25")
                return final
            },
            title: "Upgrade Compass",
            display() { return "Upgrade your compass so you can draw shapes faster! The effects will occur upon switching construction focus." + "\n" + "Compass level: " + getBuyableAmount(this.layer, this.id) + "\n" + "Require: " + format(this.cost()) + "\n" + "Time multiplier (of all shapes): x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let effect = new Decimal("0.95").pow(x)
                if (player.dimension.points.gte(4)) effect = effect.div(1.2)
                effect = effect.div(buyableEffect("numbercore", 22)[0])
                return effect
            },
        },
        12: {
            cost(x) {
                let base = new Decimal("1500")
                let scale = new Decimal("1.125").add(x.div("8"))

                let final = scale.pow(x).mul(base)
                final = final.div(buyableEffect("numbercore", 22)[1])
                if (hasUpgrade("subtraction", 23)) final = final.div("1e25")
                return final
            },
            title: "Upgrade Straightedge",
            display() { return "Upgrade your straightedge so you can draw more Constructor polygons at a time!" + "\n" + "Straightedge level: " + getBuyableAmount(this.layer, this.id) + "\n" + "Require: " + format(this.cost()) + "\n" + "Shape multiplier: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base = new Decimal("1.25").pow(x)
                base = base.mul(buyableEffect("numbercore", 22)[0])
                return base
            },
        },
    },
    challenges: {
        11: {
            name: "Constructor Sacrifice",
            challengeDescription: "All Triangle boosts don't work. Operation Power and Points are raised to ^0.1. You are also in Long Division.",
            goalDescription: function() {
                if (inChallenge(this.layer, this.id)) setClickableState("division", 11, "Active")
                if (challengeCompletions("polygon", 11) >= 10) return "<b>Your Constructor has been sacrificed."
                return `Have <b>${tmp[this.layer].challenges[this.id].goal}</b> Points.`
            },
            rewardDescription: function() {return "x1e500 Points and x1e10 Operation Power per completion. At 10 completions, the Constructor polygons will always be constructed passively. Uncap but softcap the Triangle effects. <br><b>Sacrifice progress: " + challengeCompletions(this.layer, this.id) + "0%</b>" },
            rewardEffect() {return [new Decimal("1e500").pow(challengeCompletions(this.layer, this.id)), new Decimal("1e10").pow(challengeCompletions(this.layer, this.id))]},
            rewardDisplay() {return "x" + format(challengeEffect(this.layer, this.id)[0]) + " Points, x" + format(challengeEffect(this.layer, this.id)[1]) + " Operation Power"},
            completionLimit: 10,
            canComplete: function() {return player.points.gte(tmp[this.layer].challenges[this.id].goal)},
            goal() {
                let list = [
                    new Decimal("1e960"),
                    new Decimal("1e1035"),
                    new Decimal("1e1200"),
                    new Decimal("1e1350"),
                    new Decimal("1e2565"),
                    new Decimal("1e3650"),
                    new Decimal("1e4060"),
                    new Decimal("1e22570"),
                    new Decimal("1e25290"),
                    new Decimal("1e27225"),
                ]
                return list[challengeCompletions(this.layer, this.id)]
            },
            unlocked() {return hasUpgrade("arithmetic", 35)},
            style() {return {
                    "width": "405px",
                    "height": "320px",
                }
            }
        },
    },

    update(diff){
        //Global gain
        let effect = new Decimal(1)

        effect = effect.mul(buyableEffect("polygon", 12))
        if (hasUpgrade("polygon", 16)) effect = effect.mul(upgradeEffect("polygon", 16))
        if (hasUpgrade("fundamental", 45)) effect = effect.mul(upgradeEffect("fundamental", 45))

        //Local gains
        let triBase = effect
        if (hasUpgrade("multiplication", 81)) triBase = triBase.mul(player.polygon.hexagons.pow(0.8).add(1))

        if (player.polygon.triangles.gte("1e50")) triBase = triBase.div(player.polygon.triangles.pow(0.1))
                
        let squBase = effect
        if (hasMilestone("division", 4) && !inChallenge("polygon", 11)) squBase = squBase.mul(player.polygon.triEffect.add(1).pow("0.5"))
        if (hasUpgrade("multiplication", 81)) squBase = squBase.mul(player.polygon.hexagons.pow(0.8).add(1))

        if (player.polygon.squares.gte("1e50")) squBase = squBase.div(player.polygon.squares.pow(0.125))

        let penBase = effect
        if (hasUpgrade("multiplication", 81)) penBase = penBase.mul(player.polygon.hexagons.pow(0.8).add(1))

        if (player.polygon.pentagons.gte("1e50")) penBase = penBase.div(player.polygon.pentagons.pow(0.1))

        let hexBase = effect

        if (player.polygon.hexagons.gte("1e50")) hexBase = hexBase.div(player.polygon.hexagons.pow(0.1))

        if (hasAchievement("planetary", 31)){
            triBase = triBase.pow(1.1)
            squBase = squBase.pow(1.1)
            penBase = penBase.pow(1.1)
            hexBase = hexBase.pow(1.1)
        }

        if (hasUpgrade("multiplication", 123)){
            triBase = triBase.pow(1.1)
            squBase = squBase.pow(1.1)
            penBase = penBase.pow(1.1)
            hexBase = hexBase.pow(1.1)
        }

        if (hasUpgrade("multiplication", 132)){
            triBase = triBase.pow(upgradeEffect("multiplication", 132))
            squBase = squBase.pow(upgradeEffect("multiplication", 132))
            penBase = penBase.pow(upgradeEffect("multiplication", 132))
            hexBase = hexBase.pow(upgradeEffect("multiplication", 132))
        }

        //Sacrifices
        if (maxedChallenge("polygon", 11)){
            triBase = triBase.pow(1.27)
            squBase = squBase.pow(1.27)
            penBase = penBase.pow(1.27)
            hexBase = hexBase.pow(1.27)
            player.polygon.triangles = player.polygon.triangles.add(triBase)
            player.polygon.squares = player.polygon.squares.add(squBase)
            player.polygon.pentagons = player.polygon.pentagons.add(penBase)
            player.polygon.hexagons = player.polygon.hexagons.add(hexBase)
        }

        //Deciding next shape to add to
        if (getClickableState("polygon", 11) == "Triangle") player.polygon.constrNextGain = triBase
        else if (getClickableState("polygon", 11) == "Square") player.polygon.constrNextGain = squBase
        else if (getClickableState("polygon", 11) == "Pentagon") player.polygon.constrNextGain = penBase
        else if (getClickableState("polygon", 11) == "Hexagon") player.polygon.constrNextGain = hexBase

        //Timer + addition
        if (hasMilestone("division", 3) || hasMilestone("planetary", 6)){
            player.polygon.constrCurrentTime = player.polygon.constrCurrentTime.sub(diff)
            if (player.polygon.constrCurrentTime.lte(0)) {
                player.polygon.constrCurrentTime = player.polygon.constrBaseTime

                if (getClickableState("polygon", 11) == "Triangle" && getClickableState("polygon", 12) == "Enabled") player.polygon.triangles = player.polygon.triangles.add(triBase)
                else if (getClickableState("polygon", 11) == "Square" && getClickableState("polygon", 12) == "Enabled") player.polygon.squares = player.polygon.squares.add(squBase)
                else if (getClickableState("polygon", 11) == "Pentagon" && getClickableState("polygon", 12) == "Enabled") player.polygon.pentagons = player.polygon.pentagons.add(penBase)
                else if (getClickableState("polygon", 11) == "Hexagon" && getClickableState("polygon", 12) == "Enabled") player.polygon.hexagons = player.polygon.hexagons.add(hexBase)
            }
        }

        //Effects
        player.polygon.triEffect = player.polygon.triangles.pow(0.5).add(1)
        player.polygon.squEffect = player.polygon.squares.pow(0.8).add(1)
        player.polygon.penEffect = player.polygon.pentagons.add(1).pow(0.01)
        player.polygon.hexEffect = player.polygon.hexagons.add(1).log(100).div(500).add(1)

        //Effect softcaps
        if (player.polygon.penEffect.gte("1.2")) player.polygon.penEffect = player.polygon.penEffect.log(100).add(1.2)
        if (player.polygon.penEffect.gte("1.35")) player.polygon.penEffect = player.polygon.penEffect.log(500).add(1.35)
        if (player.polygon.hexEffect.gte("1.04")) player.polygon.hexEffect = player.polygon.hexEffect.pow(0.5).add(1.04)
        if (player.polygon.hexEffect.gte("2.9")) player.polygon.hexEffect = player.polygon.hexEffect.pow(0.1).add(2.9)

        if (player.polygon.triEffect.gte("1e20")){
            if (maxedChallenge("polygon", 11) && hasUpgrade("multiplication", 123)) player.polygon.triEffect = new Decimal("1e20").mul(player.polygon.triEffect.pow(0.001))
            else if (maxedChallenge("polygon", 11)) player.polygon.triEffect = new Decimal("1e20").mul(player.polygon.triEffect.log(10))
            else player.polygon.triEffect = new Decimal("1e20")
        }

        //Sacrifices
        if (inChallenge("polygon", 11)) player.polygon.triEffect = new Decimal(1)

        //Autobuy buyables
        if (player.dimension.points.gte(5)){
            if (tmp.polygon.buyables[11].cost.lte(player.polygon.points)) setBuyableAmount("polygon", 11, getBuyableAmount("polygon", 11).add(1))
            if (tmp.polygon.buyables[12].cost.lte(player.polygon.points)) setBuyableAmount("polygon", 12, getBuyableAmount("polygon", 12).add(1))
        }

        //Effect boosts
        if (hasUpgrade("division", 26)) player.polygon.hexEffect = player.polygon.hexEffect.mul(1.1)
        if (hasUpgrade("fundamental", 55)) player.polygon.penEffect = player.polygon.penEffect.mul(1.1)

        //Hardcap
        let HARD = new Decimal("1e200")
        if (hasUpgrade("planetary", 11)) HARD = HARD.mul(upgradeEffect("planetary", 11))
        if (hasAchievement("planetary", 22)) HARD = HARD.mul("1e25")
        if (hasMilestone("planetary", 8)) HARD = HARD.mul("1e10")
        HARD = HARD.mul(new Decimal.pow("1e6", getBuyableAmount("planetary", 21)))
        if (hasUpgrade("fundamental", 51)) HARD = HARD.mul(player.polygon.FU51KEEP)
        if (hasUpgrade("fundamental", 53)) HARD = HARD.mul("1e50")
        if (hasUpgrade("multiplication", 111)) HARD = HARD.mul(upgradeEffect("multiplication", 111))
        HARD = HARD.mul(buyableEffect("numbercore", 31)[2])
        if (hasMilestone("dimension", 6)) HARD = HARD.mul("1e10")
        if (hasUpgrade("fundamental", 55)) HARD = HARD.mul("1e20")
        if (hasChallenge("pbooster", 12)) HARD = HARD.mul("1e50")
        HARD = HARD.mul(buyableEffect("numbercore", 32)[1])
        if (hasChallenge("pbooster", 21)) HARD = HARD.mul("1e100")
        if (hasUpgrade("corebooster", 11)) HARD = HARD.mul(upgradeEffect("corebooster", 11))
        if (hasUpgrade("multiplication", 131)) HARD = HARD.mul(upgradeEffect("multiplication", 131))
        if (hasUpgrade("division", 34)) HARD = HARD.mul("1e1000")
            
        if (hasUpgrade("division", 31)) HARD = HARD.pow(player.pbooster.e3)
        if (hasChallenge("pbooster", 22)) HARD = HARD.pow("1.15")

        player.polygon.bestHardcapDelay = Decimal.max(HARD, player.polygon.bestHardcapDelay)
        player.polygon.hardcap = player.polygon.bestHardcapDelay

        if (player.polygon.points.gte(player.polygon.bestHardcapDelay)) player.polygon.points = player.polygon.bestHardcapDelay
    },

    getResetGain(){
        let layer = "polygon"
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		if (gain.gte(tmp[layer].softcap)) gain = gain.pow(tmp[layer].softcapPower).times(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower)))
		gain = gain.times(tmp[layer].directMult)

        gain = Decimal.min(gain, player.polygon.bestHardcapDelay)
		return gain.floor().max(0);
    },

    canReset() {
        if (player.polygon.hardcap.eq(player.polygon.points)) return false
        return player.arithmetic.points.gte("1e80")
    },

    glowColor() {
        let layer = "polygon"
        for (id in tmp[layer].upgrades){
            if (isPlainObject(layers[layer].upgrades[id])){
                if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
                    return "red"
                }
            }
        }

        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id)) {
                return "cyan"
            }
        }

        return ""
    },
    shouldNotify() {
        let layer = "polygon"
        for (const id of [11, 12]) {
            if (canBuyBuyable("polygon", id) && hasMilestone("division", 3)) {
                return true
            }
        }
        return false
    },

    branches: [["planetary", "#FFFFFF", 10], ["pbooster", "#60C0FF", 5]],
    tooltip() {
        if (player.polygon.hardcap.eq(player.polygon.points)) return format(player.polygon.points) + " Shapes (Hardcapped at " + format(player.polygon.hardcap) + ")"
        return format(player.polygon.points) + " Shapes (+" + format(getResetGain("polygon")) + " Shapes on reset)"
    },
})