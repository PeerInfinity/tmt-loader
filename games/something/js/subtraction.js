addLayer("subtraction", {
    name: "subtraction", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "-", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF50FF",
    requires: new Decimal("1"), // Can be a function that takes requirement increases into account
    resource: "Subtraction", // Name of prestige currency
    baseResource: "Operation Power", // Name of resource prestige is based on
    baseAmount() {return player.arithmetic.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (hasUpgrade("fundamental", 42)) mult = mult.add(100)
        //mul
        mult = mult.mul(player.arithmetic.points.div(10).add(1))
        if (hasUpgrade("arithmetic", 21)) mult = mult.mul(upgradeEffect("arithmetic", 21))
        if (hasUpgrade("division", 11)) mult = mult.mul(upgradeEffect("division", 11))
        if (hasUpgrade("division", 13)) mult = mult.mul("1e30")
        if (hasUpgrade("division", 25)) mult = mult.mul("1e500")
        if (hasMilestone("dimension", 6)) mult = mult.mul("e1e6")
        //exp
        if (hasUpgrade("arithmetic", 15)) mult = mult.pow(1.1)
        if (hasMilestone("dimension", 3) && !inChallenge("arithmetic", 13) && !getClickableState("division", 11)) mult = mult.pow(1.5)
        if (inChallenge("arithmetic", 13)) mult = mult.pow(0.75)
        if (hasUpgrade("multiplication", 31)) mult = mult.pow(1.05)
        if (player.polygon.pentagons.gte(1)) mult = mult.pow(player.polygon.penEffect)

        if (inChallenge("pbooster", 12)) mult = mult.log(10)
        //other hypers
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("arithmetic", 13) || hasMilestone("dimension", 3) || player.planetary.unlocked},
    directMult() {
        let dMult = new Decimal(1)
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
        if (hasMilestone("planetary", 8)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27)

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["upgrades"];
        if (layers[resettingLayer].name == "planetary") keep = []

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier in Stage 2
        player[this.layer].upgrades.push(...keptUpgrades)
    },
    upgrades: {
        11: {
            title: "Nerfed Scalings!",
            description: "Fundamental buyable 2 scaling is reduced to x85000.",
            cost: new Decimal("50e3"),
        },
        12: {
            title: "Nerfed Softcap!",
            description: "+0.05 to the exponent of the Numbers softcap.",
            cost: new Decimal("15e6"),
        },
        13: {
            title: "Waiting Game",
            description: "x100 Points, Fundamentality (after softcap), Numbers (after softcap), and Operation Power.",
            cost: new Decimal("1e10"),
        },
        14: {
            title: "Multiplicative Reduction",
            description: "-1 to the exponent of Multiplication's scaling.",
            cost: new Decimal("1e70"),
        },
        15: {
            title: "A Better Divided Life",
            description: "The logarithm in Division's formula is base 5 instead of base 10.",
            cost: new Decimal("1e400"),
            unlocked(){return player.polygon.unlocked},
        },
        16: {
            title: "Opposite Addition",
            effect(){
                let base = player.subtraction.points.add(1)
                base = base.log(100).pow(0.1)
                return base || new Decimal(1)
            },
            effectDisplay(){return "x" + format(upgradeEffect(this.layer, this.id))},
            description: "Subtraction boosts Division at a really reduced rate.",
            cost: new Decimal("1e500"),
            unlocked(){return player.polygon.unlocked},
        },
        17: {
            title: "Breakthrough",
            description: "Divide all construction times by 3, x15 Division, x1e10 Number Cores, and +2 upgrades in the 7th row of TMT.",
            cost: new Decimal("1e650"),
            unlocked(){return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        21: {
            title: "Reverse Subtraction",
            description: "+0.01 to Number Cores' formula exponent.",
            cost: new Decimal("1e2900"),
            unlocked(){return player.subtraction.points.gte("1e2900") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
        22: {
            title: "Inverted",
            description: "x1e15 Addition. Wait, isn't this supposed to be a BIG boost at this point??",
            cost: new Decimal("1e92000"),
            unlocked(){return player.subtraction.points.gte("1e50000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
            tooltip() {
                if (hasUpgrade(this.layer, this.id)) return "x10,000 Division too."
            }
        },
        23: {
            title: "Hyper Subtraction",
            description: "/1e25 to the costs of the compass and straightedge levels. ^1.05 Division.",
            cost: new Decimal("1e96000"),
            unlocked(){return player.subtraction.points.gte("1e94000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
        24: {
            title: "Finishing Rows",
            description: "x1e10 Division and Shapes.",
            cost: new Decimal("1e150000"),
            unlocked(){return player.subtraction.points.gte("1e135000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
        25: {
            title: "a(b-c)",
            description: "x1000 Multiplication.",
            cost: new Decimal("1e185000"),
            unlocked(){return player.subtraction.points.gte("1e150000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
        26: {
            title: "-2",
            description: "^1.01 Shapes after softcap.",
            cost: new Decimal("1e222222"),
            unlocked(){return player.subtraction.points.gte("1e200000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
        27: {
            title: "Subtractive Farewell",
            description: "^1.35 Division.",
            cost: new Decimal("1e240000"),
            unlocked(){return player.subtraction.points.gte("1e220000") || hasUpgrade(this.layer, this.id) || player.planetary.unlocked},
        },
    },
    tooltip() {return format(player.subtraction.points) + " Subtraction (+" + format(getResetGain("subtraction")) + " Subtraction/sec)"},
})