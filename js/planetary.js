addLayer("planetary", {
    name: "planetary", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PLF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),

        mercuryGenAmt: new Decimal(0),
        venusGenAmt: new Decimal(0),
        earthGenAmt: new Decimal(0),
        marsGenAmt: new Decimal(0),
        jupiterGenAmt: new Decimal(0),
        saturnGenAmt: new Decimal(0),
        uranusGenAmt: new Decimal(0),
        neptuneGenAmt: new Decimal(0),
        planetPower: new Decimal(0),
        planetPowerEffect: new Decimal(0),
        pPps: new Decimal(0),
        pPA: true
    }},
    color: "#80E0FF",
    requires: new Decimal("1e150"), // Can be a function that takes requirement increases into account
    resource: "Planetary Fragments", // Name of prestige currency
    baseResource: "Polygons", // Name of resource prestige is based on
    baseAmount() {return player.polygon.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.01, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (hasAchievement("planetary", 24)) mult = mult.add(2)
        if (hasMilestone("planetary", 8)) mult = mult.add(4)
        if (hasUpgrade("polygon", 22)) mult = mult.add(25)
        //mul
        if (hasAchievement("planetary", 11)) mult = mult.mul(3)
        if (hasAchievement("planetary", 12)) mult = mult.mul(5)
        if (hasAchievement("planetary", 32)) mult = mult.mul(12)
        if (hasMilestone("dimension", 6)) mult = mult.mul(25)
        mult = mult.mul(player.pbooster.e1)
        if (hasUpgrade("polygon", 24)) mult = mult.mul(upgradeEffect("polygon", 24))
        if (hasUpgrade("fundamental", 57)) mult = mult.mul(upgradeEffect("fundamental", 57))
        if (hasUpgrade("polygon", 26)) mult = mult.mul(512)
        //exp 
        if (hasChallenge("pbooster", 22)) mult = mult.pow("1.15")
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
        return dMult
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "L", description: "SHIFT+L: Reset for Planetary Fragments", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.planetary.unlocked},
    passiveGeneration() {return false},
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
        player.planetary.pPA = false
        setClickableState("planetary", 12, player.planetary.pPA)
        setClickableState("planetary", 13, "Inactive")

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes" }],
                ["display-text", function() { return "You have " + format(player.planetary.total) + " total Planetary Fragments" }],
                "blank",
                ["display-text", function() { return "<b>Planetary reset will fully reset EVERYTHING!</b>" }],
                "blank",
                ["display-text", function() { return "<sup>Certain achievements will also be reset.</sup>" }],
                "blank",
                "milestones",
                "blank",
                "upgrades",
            ],
        },
        "Generators": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes" }],
                ["display-text", function() { return "You have " + format(player.planetary.total) + " total Planetary Fragments" }],
                "blank",
                ["display-text", function() {
                    let text = "<h2>You have " + format(player.planetary.planetPower) + " Planet Power, "
                    if (!getClickableState("planetary", 12)) text += "dividing Points by /" + format(player.planetary.planetPowerEffect.pow(2))
                    else text += "multiplying Points by x" + format(player.planetary.planetPowerEffect)
                    return text
                }],
                ["display-text", function() { return "<h3>You are gaining " + format(player.planetary.pPps) + " Planet Power per second."}],
                "blank",
                ["display-text", function() {
                    let text = "<h3>Planet Power gain is heavily softcapped after 1e10,000!</h3>"
                    if (player.planetary.planetPower.lt("1e10000")) return ""
                    return text
                }],
                ["display-text", function() {
                    let text = "<h3>Planet Power gain is heavily supercapped after 1e100,000!</h3>"
                    if (player.planetary.planetPower.lt("1e100000")) return ""
                    return text
                }],
                ["display-text", function() {
                    let text = "<h3>Planet Power gain is heavily hypercapped after 1e1,000,000!</h3>"
                    if (player.planetary.planetPower.lt("1e1000000")) return ""
                    return text
                }],
                "blank",
                ["row", [
                    ["clickable", 12],
                    ["clickable", 13]
                ]],
                "blank",
                "buyables",
            ],
        },
        "Planetary Challenges": {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return "You have " + format(player.polygon.points) + " Shapes" }],
                ["display-text", function() { return "You have " + format(player.planetary.total) + " total Planetary Fragments" }],
                "blank",
                ["infobox", "planChalBox"],
                "blank",
                ["clickable", 11],
                "blank",
                "achievements",
            ],
            unlocked() {return hasMilestone("planetary", 6)},
        },
    },

    clickables: {
        11: {
            title: "Force Planetary reset",
            display: "This will force a Planetary reset with no currency gain.",
            canClick() {return true},
            onClick() {
                doReset("planetary", true)
            },
            style() {
                return {
                    "width": "150px",
                }
            }
        },
        12: {
            title: "Planet Power Effect",
            display() {
                let text = "This will force a Planetary reset with no currency gain, and change Planet Power's effect from multiplying to dividing. Currently: "
                if (getClickableState(this.layer, this.id)) text += "Planet Power's effect is multiplying."
                else text += "Planet Power's effect is dividing at a reduced rate."
                return text
            },
            canClick() {return true},
            onClick() {
                player.planetary.pPA = !player.planetary.pPA
                setClickableState(this.layer, this.id, player.planetary.pPA)
                doReset("planetary", true)
            },
            style() {
                return {
                    "width": "150px",
                }
            },
            unlocked() {return true}
        },
        13: {
            title: "Square Root Planet Power and Halve ALL Generator Amounts",
            display() {
                let text = "Halve ALL generator amounts (not bought generators) and square root Planet Power, rounded up. Useful if you need a smaller divisor for Planetary Challenge 2."
                return text
            },
            canClick() {return true},
            onClick() {
                player.planetary.neptuneGenAmt = player.planetary.neptuneGenAmt.mul(0.5).ceil()
                player.planetary.uranusGenAmt = player.planetary.uranusGenAmt.mul(0.5).ceil()
                player.planetary.saturnGenAmt = player.planetary.saturnGenAmt.mul(0.5).ceil()
                player.planetary.jupiterGenAmt = player.planetary.jupiterGenAmt.mul(0.5).ceil()
                player.planetary.marsGenAmt = player.planetary.marsGenAmt.mul(0.5).ceil()
                player.planetary.earthGenAmt = player.planetary.earthGenAmt.mul(0.5).ceil()
                player.planetary.venusGenAmt = player.planetary.venusGenAmt.mul(0.5).ceil()
                player.planetary.mercuryGenAmt = player.planetary.mercuryGenAmt.mul(0.5).ceil()
                player.planetary.planetPower = player.planetary.planetPower.pow(0.5).ceil()

            },
            style() {
                return {
                    "width": "260px",
                }
            },
            unlocked() {return hasMilestone("planetary", 6)}
        },
    },

    upgrades: {
        11: {
            title: "Polygonal Care",
            effect() {
                let base = player.planetary.points
                let effect = base.add(1).pow(0.9).mul("1e25")
                if (hasAchievement("planetary", 31)) effect = effect.pow(1.25)
                return effect
            },
            effectDisplay() {return "x" + format(upgradeEffect(this.layer, this.id))},
            description: "Planetary Fragments delay the Shape hardcap.",
            cost: new Decimal("10"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        12: {
            title: "Mercury Love",
            effect() {
                let base = getBuyableAmount("planetary", 11)
                let effect = base.add(1).log(10).div(100).add(1)
                return effect
            },
            effectDisplay() {return "^" + format(upgradeEffect(this.layer, this.id), 4)},
            description: "Bought Mercury Generators have a better effect on Planet Power generation.",
            cost: new Decimal("5000"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        13: {
            title: "Home Planet",
            description: "Unlock the Earth Generator.",
            cost: new Decimal("25000"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        14: {
            title: "Across the JSTverse",
            effect() {
                let base = getBuyableAmount("planetary", 21)
                base = base.pow(3)
                return base
            },
            effectDisplay() {return "^" + format(upgradeEffect(this.layer, this.id))},
            description: "Bought Earth Generators raise Fundamental buyable 1's effect.",
            cost: new Decimal("200000"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        15: {
            title: "Unbreakable Constructor",
            description: "Keep the compass and straightedge levels.",
            cost: new Decimal("1e7"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        16: {
            title: "Buyable Mania IS real.",
            description: "Unlock another Number Core buyable. Keep the 8th and 9th Polygon upgrades.",
            cost: new Decimal("1e9"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
        17: {
            title: "Re-Challenged",
            description: "Unlock Booster Challenges.",
            cost: new Decimal("1e14"),
            unlocked() {return hasMilestone("planetary", 1)},
        },
    },

    milestones: {
        1: {
            requirementDescription: "1: 1 total Planetary Fragment",
            effectDescription: "Keep generation for Fundamentality, Numbers, and Operation Power. /100 all Constructor polygon construction times. x100 Shapes. Raise the Point Addition booster hardcap to 1e2500. ^1.5 Operation Power. Also, unlock the first row of Planetary upgrades.",
            done() { return player.planetary.total.gte(1) },
            unlocked () {return true},
        },
        2: {
            requirementDescription: "2: 2 total Planetary Fragments",
            effectDescription: "Square Point gain, x1e10 Division, x100 Multiplication, and autobuy Fundamental and Number Core buyables.",
            done() { return player.planetary.total.gte(2) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
            toggles: [
                ["fundamental", "PM2FT"],
                ["numbercore", "PM2NCT"],
            ]
        },
        3: {
            requirementDescription: "3: 3 total Planetary Fragments",
            effectDescription: "Keep all Arithmetic upgrades and uncap \"Mutual Relationship\".",
            done() { return player.planetary.total.gte(3) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        4: {
            requirementDescription: "4: 5 total Planetary Fragments",
            effectDescription: "Keep all Fundamental and Primitive upgrades up to this point. Start with the first three Multiplication hardcaps removed.",
            done() { return player.planetary.total.gte(5) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        5: {
            requirementDescription: "5: 15 total Planetary Fragments",
            effectDescription: "Automate the Multiplication buyable and unlock another one. Keep the Fundamentality buyables.",
            done() { return player.planetary.total.gte(15) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        6: {
            requirementDescription: "6: 50 total Planetary Fragments",
            effectDescription: "Unlock Planetary Challenges, and keep the Constructor unlocked.",
            done() { return player.planetary.total.gte(50) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        7: {
            requirementDescription: "7: 1,000 total Planetary Fragments",
            effectDescription: "Keep Number Core buyables and Polygon upgrades 1-7.",
            done() { return player.planetary.total.gte(1000) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        8: {
            requirementDescription: "8: 15,000 total Planetary Fragments",
            effectDescription: "Keep TMT and Subtraction upgrades. +4 Planetary Fragments and x1e10 to the Shape hardcap.",
            done() { return player.planetary.total.gte(15000) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        9: {
            requirementDescription: "9: 100,000 total Planetary Fragments",
            effectDescription: "Keep Arithmetic Challenges 1-5, and unlock two more Planetary Challenges. The Number Core Addition booster is always active. x1,000,000 Polygonifications.",
            done() { return player.planetary.total.gte(100000) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        10: {
            requirementDescription: "10: 2,500,000 total Planetary Fragments",
            effectDescription: "Polygonifications persist through Planetary reset. Keep Division upgrades 1-14.",
            done() { return player.planetary.total.gte(2500000) },
            unlocked() {return hasMilestone(this.layer, this.id - 1)},
        },
        11: {
            requirementDescription: "11: 1e75 total Planetary Fragments",
            effectDescription: "Unlock the 14th row and keep the 13th.",
            done() { return player.planetary.total.gte("1e75") },
            unlocked() {return hasMilestone(this.layer, this.id)},
        },
    },

    buyables: {
        11: {
            cost(x) {
                let base = new Decimal(1.5).pow(x)
                return base
            },
            title: "Mercury Generator",
            display() {
                let text = "Generates Planet Power based on its amount." + "\n" + "Amount: " + format(player.planetary.mercuryGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount("planetary", 11).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Planet Power/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.mercuryGenAmt = player.planetary.mercuryGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.1)
                let effect = base.pow(player.planetary.mercuryGenAmt)
                effect = effect.div(1.1)
                return effect
            },
            unlocked() {return true},
        },
        12: {
            cost(x) {
                let base = new Decimal(2).pow(x).mul("50")
                return base
            },
            title: "Venus Generator",
            display() {
                let text = "Generates Mercury Generators based on its amount." + "\n" + "Amount: " + format(player.planetary.venusGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount(this.layer, this.id).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Mercury Generators/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.venusGenAmt = player.planetary.venusGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.2)
                let effect = base.pow(player.planetary.venusGenAmt)
                effect = effect.div(1.2)
                return effect
            },
            unlocked() {return getBuyableAmount("planetary", 11).gte(1)},
        },
        21: {
            cost(x) {
                let base = new Decimal(4).pow(x).mul("1e4")
                return base
            },
            title: "Earth Generator",
            display() {
                let text = "Generates Venus Generators based on its amount. BONUS: x1,000,000 to the Shape hardcap per bought Earth Generator." + "\n" + "Amount: " + format(player.planetary.earthGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount(this.layer, this.id).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Venus Generators/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.earthGenAmt = player.planetary.earthGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.3)
                let effect = base.pow(player.planetary.earthGenAmt)
                effect = effect.div(1.3)
                return effect
            },
            unlocked() {return hasUpgrade("planetary", 13)},
        },
        22: {
            cost(x) {
                let base = new Decimal(10).pow(x).mul("1e7")
                return base
            },
            title: "Mars Generator",
            display() {
                let text = "Generates Earth Generators based on its amount. BONUS: x100 Division per bought Mars Generator." + "\n" + "Amount: " + format(player.planetary.marsGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount(this.layer, this.id).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Earth Generators/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.marsGenAmt = player.planetary.marsGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.4)
                let effect = base.pow(player.planetary.marsGenAmt)
                effect = effect.div(1.4)
                return effect
            },
            unlocked() {return getBuyableAmount("planetary", 11).gte(40)},
        },
        31: {
            cost(x) {
                let base = new Decimal(100).pow(x).mul("1e32")
                return base
            },
            title: "Jupiter Generator",
            display() {
                let text = "Generates Mars Generators based on its amount. BONUS: x1.25 Core Boosters per purchase." + "\n" + "Amount: " + format(player.planetary.jupiterGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount(this.layer, this.id).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Mars Generators/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.jupiterGenAmt = player.planetary.jupiterGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.5)
                let effect = base.pow(player.planetary.jupiterGenAmt)
                effect = effect.div(1.5)
                return effect
            },
            unlocked() {return hasChallenge("pbooster", 22)},
        },
        32: {
            cost(x) {
                let base = new Decimal("1e5").pow(x).mul("1e70")
                return base
            },
            title: "Saturn Generator",
            display() {
                let text = "Generates Jupiter Generators based on its amount. BONUS: ^1.001 Points per purchase." + "\n" + "Amount: " + format(player.planetary.saturnGenAmt) + " (" + getBuyableAmount(this.layer, this.id) + ")" + "\n" + "Cost: " + format(this.cost()) + "\n" + "Effect: "
                if (getBuyableAmount(this.layer, this.id).eq(0)) text += "Buy a generator to start generating!"
                else text += "+" + format(this.effect().mul(getBuyableAmount(this.layer, this.id))) + " Jupiter Generators/s"
                return text
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.planetary.saturnGenAmt = player.planetary.saturnGenAmt.add(1)
            },
            effect(x) {
                let base = new Decimal(1.6)
                let effect = base.pow(player.planetary.saturnGenAmt)
                effect = effect.div(1.6)
                return effect
            },
            unlocked() {return hasMilestone("pbooster", 5)},
        },
    },

    infoboxes: {
        planChalBox: {
            title: "Planetary Challenges",
            body() { return "Welcome to another instance of me appearing in a place that's not the Unlock layer. " +
                "Anyway, Planetary Challenges are NOT your standard The Modding Tree challenges. Instead, they're achievements! " +
                "To complete them, you need to Planetary reset. Simple? NO. Each challenge restricts your pre-planetary progress in some way, " +
                "unique for each challenge. For the first one, \"No need to sacrifice,\" as an example, you need " +
                "to Planetary reset without sacrificing your constructor. The tooltip that appears on hover will " +
                "explain the challenge's condition in more detail. The reward will appear in the tooltip after its " +
                "completed. I went ahead and added a force reset button in this tab for convenience. "
            },
        },
    },

    achievements: {
        11: {
            name: "<h1>1: No need to sacrifice.<br>",
            done(){return getResetGain("planetary").gte("1") && challengeCompletions("polygon", 11) == 0},
            goalTooltip() {return "Planetary reset without sacrificing the Constructor, not even 10%."},
            doneTooltip() {return "This Planetary Challenge is completed. x3 Planetary Fragments. I miss the small multipliers."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        12: {
            name: "<h1>2: Deadly Generators<br>",
            done(){return getResetGain("planetary").gte("1") && !getClickableState("planetary", 12) && player.planetary.planetPower.gte("1e36")},
            goalTooltip() {return "Planetary reset while your Planet Power is dividing. Planet Power MUST be at least than 1e33."},
            doneTooltip() {return "This Planetary Challenge is completed. x5 Planetary Fragments."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        13: {
            name: "<h1>3: Boostless Core<br>",
            done(){return getResetGain("planetary").gte("1") && player.corebooster.points.eq("0")},
            goalTooltip() {return "Planetary reset without any Core Boosters."},
            doneTooltip() {return "This Planetary Challenge is completed. Permanently remove the 4th-6th Multiplication hardcaps until the next reset layer."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        14: {
            name: "<h1>4: Only Multiplication<br>",
            done(){return getResetGain("planetary").gte("1") && player.division.points.eq("0")},
            goalTooltip() {return "Planetary reset without utilizing Division features."},
            doneTooltip() {return "This Planetary Challenge is completed. Keep Division Milestones until the next reset layer."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        21: {
            name: "<h1>5: Number Core Nonexistence<br>",
            done(){return getResetGain("planetary").gte("1") &&
                getBuyableAmount("numbercore", 11).lt(1) &&
                getBuyableAmount("numbercore", 12).lt(1) &&
                getBuyableAmount("numbercore", 13).lt(1) &&
                getBuyableAmount("numbercore", 21).lt(1) &&
                getBuyableAmount("numbercore", 22).lt(1)
            },
            goalTooltip() {return "Planetary reset without Number Core buyables. (There's a toggle on Planetary Milestone 2, and <i>tip: Planetary reset with the toggle OFF.</i>)"},
            doneTooltip() {return "This Planetary Challenge is completed. ^1.25 Number Cores."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        22: {
            name: "<h1>6: Hole-in-one<br>",
            done(){return getResetGain("planetary").gte("1") && player.polygon.resets.eq("1")},
            goalTooltip() {return "Planetary reset with only 1 Polygonification."},
            doneTooltip() {return "This Planetary Challenge is completed. x1e25 to the Shape softcap."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        23: {
            name: "<h1>7: Shapeless Realm<br>",
            done(){return getResetGain("planetary").gte("1") &&
                player.polygon.triangles.eq("0") &&
                player.polygon.squares.eq("0") &&
                player.polygon.pentagons.eq("0") &&
                player.polygon.hexagons.eq("0")
            },
            goalTooltip() {return "Planetary reset without constructing any Constructor polygons, Constructor Sacrifice generation also counts."},
            doneTooltip() {return "This Planetary Challenge is completed. Keep the Constructor sacrificed."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        24: {
            name: "<h1>8: Arithmetic Challenge 3 V2<br>",
            done(){return getResetGain("planetary").gte("1") && player.dimension.points.eq("0")},
            goalTooltip() {return "Planetary reset without Dimensions."},
            doneTooltip() {return "This Planetary Challenge is completed. +2 Planetary Fragments (Look at Fundamental Upgrade 3) and keep Dimensions up to the fifth."},
            unlocked() {return true},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        31: {
            name: "<h1>9: Interrupted Challenges<br>",
            done(){return player.primitive.points.gte("e7403828") && player.polygon.points.eq("0") && inChallenge("polygon", 11) && inChallenge("arithmetic", 22)},
            goalTooltip() {return "The next Planetary Challenges are a little different. Have e7,403,828 Numbers and 0 Shapes while in Constructor Sacrifice and Arithmetic Challenge 5."},
            doneTooltip() {return "This Planetary Challenge is completed. ^1.1 the gain of all Constructor Polygons, and Unlock another Number Core buyable (NOT AUTOMATED)."},
            unlocked() {return hasMilestone("planetary", 9)},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
        32: {
            name: "<h1>10: Hypernerfed Progression<br>",
            done(){return player.primitive.points.gte("e16240") && inChallenge("arithmetic", 23)},
            goalTooltip() {return "Have 1e16,240 Numbers while in Arithmetic Challenge 6. Recommended to wait for max useful Core Boosters (1,000,000)."},
            doneTooltip() {return "This Planetary Challenge is completed. You should be able to get e125M-e126M points by now. Improve \"Polygonal Care,\" x12 Planetary Fragments, and x1e5000 Operation power after softcap!"},
            unlocked() {return hasMilestone("planetary", 9)},
            style() {return {
                "width": "200px",
                "height": "150px",
                "align-content": "center"
            }}
        },
    },

    update(diff){
        let mult = new Decimal(0)

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 32).gte(1)) mult = mult.add(buyableEffect("planetary", 32)).mul(getBuyableAmount("planetary", 32))
        player.planetary.jupiterGenAmt = player.planetary.jupiterGenAmt.add(mult.mul(diff))

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 31).gte(1)) mult = mult.add(buyableEffect("planetary", 31)).mul(getBuyableAmount("planetary", 31))
        player.planetary.marsGenAmt = player.planetary.marsGenAmt.add(mult.mul(diff))

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 22).gte(1)) mult = mult.add(buyableEffect("planetary", 22)).mul(getBuyableAmount("planetary", 22))
        player.planetary.earthGenAmt = player.planetary.earthGenAmt.add(mult.mul(diff))

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 21).gte(1)) mult = mult.add(buyableEffect("planetary", 21)).mul(getBuyableAmount("planetary", 21))
        player.planetary.venusGenAmt = player.planetary.venusGenAmt.add(mult.mul(diff))

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 12).gte(1)) mult = mult.add(buyableEffect("planetary", 12)).mul(getBuyableAmount("planetary", 12))
        player.planetary.mercuryGenAmt = player.planetary.mercuryGenAmt.add(mult.mul(diff))

        mult = new Decimal(0)
        if (getBuyableAmount("planetary", 11).gte(1)) mult = mult.add(buyableEffect("planetary", 11)).mul(getBuyableAmount("planetary", 11))

        if (mult.gte("1e10000")) mult = mult.log(10).mul("1e9996")
        if (mult.gte("1e100000")) mult = mult.log(10).mul("1e99995")
        if (mult.gte("1e1000000")) mult = mult.log(100).mul("1e999997")
        if (mult.gte("1e10000000")) mult = mult.log(10).mul("1e9999993")
        
        mult = mult.pow(buyableEffect("numbercore", 32)[0])

        player.planetary.pPps = mult

        //FINAL!!!
        player.planetary.planetPower = player.planetary.planetPower.add(mult.mul(diff))
        player.planetary.planetPowerEffect = player.planetary.planetPower.add(1).pow(player.planetary.planetPower.add(1).log(player.planetary.planetPower.add(1).pow(new Decimal(1).div(player.planetary.planetPower.log(10)))))

        if (hasUpgrade("planetary", 12)) player.planetary.planetPowerEffect = player.planetary.planetPowerEffect.pow(upgradeEffect("planetary", 12))
        if (player.planetary.planetPowerEffect.gte("1e10000")) player.planetary.planetPowerEffect = player.planetary.planetPowerEffect.pow(0.05).mul("1e9500")
        if (player.planetary.planetPowerEffect.gte("1e200000")) player.planetary.planetPowerEffect = player.planetary.planetPowerEffect.pow(0.01).mul("1e198000")
        if (player.planetary.planetPowerEffect.gte("1e20000000")) player.planetary.planetPowerEffect = player.planetary.planetPowerEffect.pow(0.01).mul("1e19800000")
        if (player.planetary.planetPowerEffect.gte("e1e8")) player.planetary.planetPowerEffect = player.planetary.planetPowerEffect.pow(0.01).mul("1e99999999")
    },

    glowColor() {
        let layer = "planetary"
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
        let layer = "planetary"
        for (const id of [11, 12]) {
            if (canBuyBuyable("planetary", id)) {
                return true
            }
        }
        return false
    },

    branches: [["pbooster", "#60C0FF", 5]],
    tooltip() {return format(player.planetary.points) + " Planetary Fragments (+" + format(getResetGain("planetary")) + " Planetary Fragments on reset)"},
})