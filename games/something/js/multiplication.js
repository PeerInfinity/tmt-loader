addLayer("multiplication", {
    name: "multiplication", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "×", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        effect: new Decimal(0),
        isAbleToReset: false,
    }},
    color: "#FF50FF",
    requires() {
        return new Decimal("5e16")
    }, // Can be a function that takes requirement increases into account
    resource: "Multiplication", // Name of prestige currency
    baseResource: "Operation Power", // Name of resource prestige is based on
    baseAmount() {return player.arithmetic.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        let final = new Decimal(4)
        let nerf = new Decimal(0)
        if (hasUpgrade("subtraction", 14)) nerf = nerf.add(1)
        if (hasMilestone("pbooster", 1)) nerf = nerf.add(1)
        final = final.sub(nerf)

        if (player.multiplication.points.gte("600") && !hasMilestone("pbooster", 1)) final = final.add(3)
        if (player.multiplication.points.gte("5000") && !hasMilestone("pbooster", 1)) final = final.add(6)
        if (player.multiplication.points.gte("40000") && !hasMilestone("pbooster", 1)) final = final.add(10)
        if (player.multiplication.points.gte("250000") && !hasMilestone("pbooster", 1)) final = final.add(35)
        if (player.multiplication.points.gte("1e7") && !hasMilestone("pbooster", 1)) final = final.add(100)
        if (player.multiplication.points.gte("2.15e9") && !hasMilestone("pbooster", 1)) final = final.add(750)
        return final
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        //exp
        //other hypers
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "M", description: "SHIFT+M: Reset for Multiplication", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge("arithmetic", 12) || hasMilestone("polygon", 5) || player.planetary.unlocked},
    directMult() {
        let dMult = new Decimal(1)
        if (hasMilestone("division", 1)) dMult = dMult.mul(2)
        if (hasUpgrade("division", 11)) dMult = dMult.mul(upgradeEffect("division", 11))
        if (hasMilestone("primitive", 12)) dMult = dMult.mul(1.1)
        if (hasUpgrade("subtraction", 25)) dMult = dMult.mul(1000)
        if (hasMilestone("planetary", 2)) dMult = dMult.mul(100)
        if (hasMilestone("pbooster", 2)) dMult = dMult.mul("1e10")
        if (hasMilestone("dimension", 6)) dMult = dMult.mul("1e10")

        if (hasMilestone("primitive", 14)) dMult = dMult.pow(1.05)
        if (maxedChallenge("polygon", 11)) dMult = dMult.pow(1.2)
        if (hasMilestone("corebooster", 5)) dMult = dMult.pow(1.01)
        if (hasChallenge("pbooster", 22)) dMult = dMult.pow("1.15")

        if (inChallenge("pbooster", 12)) dMult = dMult.log(10)
        return dMult
    },
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        //self refs
        if (hasUpgrade("multiplication", 43)) keptUpgrades.push(43)
        if (hasUpgrade("multiplication", 62)) keptUpgrades.push(62)

        //everything else
        if (hasUpgrade("polygon", 13)) keptUpgrades.push(11, 21, 22, 31, 32)
        if (hasUpgrade("fundamental", 43) || hasUpgrade("division", 14)) keptUpgrades.push(41, 42, 43, 51, 52)
        if (hasUpgrade("division", 15)) keptUpgrades.push(61, 62,63, 64, 71, 72, 73)
        if (hasUpgrade("fundamental", 46)) keptUpgrades.push(81)

        if (hasUpgrade("multiplication", 91)) keptUpgrades.push(91)
        if (hasUpgrade("multiplication", 92)) keptUpgrades.push(92)
        if (hasUpgrade("multiplication", 93)) keptUpgrades.push(93)
        if (hasUpgrade("multiplication", 94)) keptUpgrades.push(94)
        if (hasUpgrade("multiplication", 95)) keptUpgrades.push(95)

        if (hasUpgrade("multiplication", 101)) keptUpgrades.push(101)
        if (hasUpgrade("multiplication", 102)) keptUpgrades.push(102)
        if (layers[resettingLayer].name == "planetary") keptUpgrades = []

        if (hasMilestone("planetary", 8)) keptUpgrades.push(11, 21, 22, 31, 32, 41, 42, 43, 51, 52, 61, 62, 63, 64, 71, 72, 73, 81, 91, 92, 93, 94, 95, 101, 102)
        if (hasUpgrade("fundamental", 56)) keptUpgrades.push(111)

        if (hasUpgrade("division", 33)) keptUpgrades.push(121, 122, 123)
            
        if (hasMilestone("planetary", 11)) keptUpgrades.push(131, 132)
        if (hasUpgrade("multiplication", 141)) keptUpgrades.push(141)

        let keptBuyables = []
        if (layers[resettingLayer].name == "planetary"){
            if (hasMilestone("pbooster", 2)) keptBuyables.push(getBuyableAmount("multiplication", 11))
        } else if (hasUpgrade("polygon", 15) && layers[resettingLayer].name != "planetary") keptBuyables.push(getBuyableAmount("multiplication", 11))
        if (hasMilestone("pbooster", 2)) keptBuyables.push(getBuyableAmount("multiplication", 12))

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone("polygon", 9)) keep.push("points")
        if (layers[resettingLayer].name == "planetary") keep = []
    
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier in Stage 2
        player[this.layer].upgrades.push(...keptUpgrades)
        setBuyableAmount("multiplication", 11, keptBuyables[0] || new Decimal(0))
        setBuyableAmount("multiplication", 12, keptBuyables[1] || new Decimal(0))
    },
    deactivated() {return inChallenge("pbooster", 22)},
    effect() {
        if (inChallenge("pbooster", 22)) return new Decimal(1)
        let final = player.multiplication.points.add(1).pow(10)
        if (player.polygon.points.gte(1)) final = final.mul(player.polygon.effect)
        if (hasMilestone("division", 9)) final = final.pow(4.66)
        player.multiplication.effect = final || new Decimal(1)
    },
    effectDescription() {
        if (hasMilestone("division", 9)) return "multiplying Points and Number Cores by x" + format(player.multiplication.effect)
        return "multiplying Points by x" + format(player.multiplication.effect)
    },
    resetsNothing() {return true},
    canBuyMax() {return true},
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["infobox", "treeLimit"],
                "blank",
                ["upgrade-tree", [[11], [21, 22], [31, 32], [41, 42, 43], [51, 52], [61, 62, 63, 64], [71, 72, 73], [81], [91, 92, 93, 94, 95], [101, 102], [111], [121, 122, 123], [131, 132], [141]]]
            ],
        },
        "Buyables": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "buyables",
            ],
            unlocked() {return hasMilestone("polygon", 6) || player.planetary.unlocked},
        },
    },
    infoboxes: {
        treeLimit: {
            title: "The Multiplication Tree",
            body() { return "Yes, I'm more than just a character in the lore. I actually give information! " +
                "Anyway, in The Multiplication Tree, NOT The Modding Tree, you can only have 1 upgrade in each row. " +
                "This persists until you get upgrades in The Multiplication Tree (referred to as TMT in this game) or elsewhere " +
                "that allow for multiple upgrades in a single row. WAIT! If you ever need to respec TMT, " +
                "just Arithmetic reset."
             },
        },
    },
    upgrades: {
        11: {
            title: "Upgrade Tree Trauma",
            description: "You know what? Improve the 8th Primitive milestone.",
            cost: new Decimal(1),
            branches: [[21, "#FFFFFF", 10], [22, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(1)) return false
            },
            pay() {return new Decimal(0)}
        },

        21: {
            title: "Why Multiplication?",
            description: "x1e15 Points and x5 Operation Power.",
            cost: new Decimal(3),
            branches: [[31, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(3)) return false
                if (hasUpgrade("multiplication", 22) && !hasUpgrade("multiplication", 42)) return false
                return hasUpgrade("multiplication", 11)
            },
            pay() {return new Decimal(0)}
        },
        22: {
            title: "A Split Choice",
            effect() {return player.multiplication.points.pow(player.multiplication.points.pow(0.75)).add(1)},
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            description: "Improve the Point Addition booster by Multiplication.",
            cost: new Decimal(3),
            branches: [[32, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(3)) return false
                if (hasUpgrade("multiplication", 21) && !hasUpgrade("multiplication", 31)) return false
                return hasUpgrade("multiplication", 11)
            },
            pay() {return new Decimal(0)}
        },

        31: {
            title: "Multi-Upgrade",
            description: "+1 upgrade in the 2nd row, and ^1.2 Fundamentality after softcap.",
            cost: new Decimal(5),
            branches: [[41, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(5)) return false
                if (hasUpgrade("multiplication", 32) && !hasUpgrade("multiplication", 42)) return false
                return hasUpgrade("multiplication", 21)
            },
            pay() {return new Decimal(0)}
        },
        32: {
            title: "Trade-Off",
            description: "/5 Operation Power, but ^1.05 Numbers (after softcap), ^1.1 Addition, and ^1.05 Subtraction.",
            cost: new Decimal(5),
            branches: [[42, "#FFFFFF", 10], [43, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(5)) return false
                if (hasUpgrade("multiplication", 31)) return false
                return hasUpgrade("multiplication", 22)
            },
            pay() {return new Decimal(0)}
        },

        41: {
            title: "Fundamental Help",
            description: "x1e25 Fundamentality after softcap, and raise Fundamental buyable 2's effect to ^1.05.",
            cost: new Decimal(10),
            branches: [[51, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(10)) return false
                if (hasUpgrade("multiplication", 42) && !hasAchievement("achievements", 46)) return false
                return hasUpgrade("multiplication", 31)
            },
            pay() {return new Decimal(0)}
        },
        42: {
            title: "Primitive Help",
            description: "x1e10 Numbers after softcap, and unlock more Primitive upgrades. Also, +1 upgrade in the 2nd and 3rd row.",
            cost: new Decimal(10),
            branches: [[51, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(10)) return false
                if (hasUpgrade("multiplication", 41) && !hasAchievement("achievements", 46)) return false
                return hasUpgrade("multiplication", 32)
            },
            pay() {return new Decimal(0)}
        },
        43: {
            title: "Division Help",
            description: "x5 Division, and x25 Numbers in Long Division. <i>This upgrade is kept until the next reset layer and doesn't disallow other upgrades in this row. </i>",
            cost: new Decimal(25),
            branches: [[52, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(25)) return false
                if (hasUpgrade("multiplication", 41) || hasUpgrade("multiplication", 42)) return false
                return hasUpgrade("multiplication", 32)
            },
            pay() {return new Decimal(0)}
        },

        51: {
            title: "Arithmetic PERMUTATION",
            effect() {
                let base = upgradeEffect("arithmetic", 14)
                base = base.pow(0.005).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 51))},
            description: "\"Arithmetic Combination\" now effects Operation Power at a really reduced rate.",
            cost: new Decimal(100),
            branches: [[61, "#FFFFFF", 10], [62, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(100)) return false
                if (hasUpgrade("multiplication", 52) && !hasMilestone("division", 3)) return false
                return hasUpgrade("multiplication", 41) && hasUpgrade("multiplication", 42)
            },
            pay() {return new Decimal(0)}
        },
        52: {
            title: "Primitive Progression",
            effect() {
                let base = player.multiplication.points
                base = base.pow(0.5)
                if (base.eq(0)) return new Decimal(1)
                return base
            },
            effectDisplay() {return "^" + format(upgradeEffect("multiplication", 52))},
            description: "Multiplication boosts \"Primitive Boost.\"",
            cost: new Decimal(150),
            branches: [[63, "#FFFFFF", 10], [64, "#FFFFFF", 10]],
            canAfford() {
                if (player.multiplication.points.lt(150)) return false
                if (hasUpgrade("multiplication", 51) && !hasMilestone("division", 3)) return false
                return hasUpgrade("multiplication", 43)
            },
            pay() {return new Decimal(0)}
        },

        61: {
            title: "THE FUNDAMENTALITY",
            description: "x1e50 Fundamentality after softcap, and improve the first Fundamental buyable.",
            cost: new Decimal(300),
            canAfford() {
                if (player.multiplication.points.lt(300)) return false
                if (hasUpgrade("multiplication", 63)) return false
                if (hasUpgrade("multiplication", 64)) return false
                return hasUpgrade("multiplication", 51)
            },
            branches: [[71, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        62: {
            title: "THE DIVISION",
            description: "x15 Division! (and x1e10 Operation Power in Long Division) <i>This upgrade is kept until the next reset layer and doesn't disallow other upgrades in this row. </i>",
            cost: new Decimal(300),
            canAfford() {
                if (player.multiplication.points.lt(300)) return false
                if (hasUpgrade("multiplication", 61)) return false
                if (hasUpgrade("multiplication", 63)) return false
                if (hasUpgrade("multiplication", 64)) return false
                return hasUpgrade("multiplication", 51)
            },
            branches: [[72, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        63: {
            title: "THE ADDITION",
            description: "x1e50 Addition, and improve the Addition booster for Number Cores.",
            cost: new Decimal(550),
            canAfford() {
                if (player.multiplication.points.lt(350)) return false
                if (hasUpgrade("multiplication", 61) && !hasUpgrade("multiplication", 71)) return false
                if (hasUpgrade("multiplication", 64) && !hasUpgrade("multiplication", 71)) return false
                return hasUpgrade("multiplication", 51)
            },
            branches: [[72, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },
        64: {
            title: "THE POINTS",
            effect() {
                let base = player.points
                base = base.add(1).log(1.01).pow(5)
                if (base.lte(0)) return new Decimal(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 64))},
            description: "Points boost themselves.",
            cost: new Decimal(550),
            canAfford() {
                if (player.multiplication.points.lt(350)) return false
                if (hasUpgrade("multiplication", 63) && !hasUpgrade("multiplication", 71)) return false
                if (hasUpgrade("multiplication", 61) && !hasUpgrade("multiplication", 71)) return false
                return hasUpgrade("multiplication", 51)
            },
            branches: [[73, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 3) || player.planetary.unlocked},
        },

        71: {
            title: "Redundancy",
            description: "+2 Upgrades in the 6th row.",
            cost: new Decimal(600),
            canAfford() {
                if (player.multiplication.points.lt(600)) return false
                if (hasUpgrade("multiplication", 72) && !hasUpgrade("subtraction", 17)) return false
                if (hasUpgrade("multiplication", 73) && !hasUpgrade("subtraction", 17)) return false
                return hasUpgrade("multiplication", 61)
            },
            branches: [[81, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return player.dimension.points.gte(4) || player.planetary.unlocked},
        },
        72: {
            title: "Straightforward Mathematics",
            effect() {
                let base = getBuyableAmount("polygon", 12)
                base = new Decimal(base).add(1).tetrate(3).add(1).log(2)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 72))},
            description: "Constructor straightedge level boosts Operation Power after softcap.",
            cost: new Decimal(600),
            canAfford() {
                if (player.multiplication.points.lt(600)) return false
                if (hasUpgrade("multiplication", 71) && !hasUpgrade("subtraction", 17)) return false
                if (hasUpgrade("multiplication", 73) && !hasUpgrade("subtraction", 17)) return false
                return hasUpgrade("multiplication", 62) && hasUpgrade("multiplication", 63)
            },
            branches: [[81, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return player.dimension.points.gte(4) || player.planetary.unlocked},
        },
        73: {
            title: "Primitive Layer Still Underrated",
            description: "x1e100 Points and Unlock Points.",
            cost: new Decimal(600),
            canAfford() {
                if (player.multiplication.points.lt(600)) return false
                if (hasUpgrade("multiplication", 71) && !hasUpgrade("subtraction", 17)) return false
                if (hasUpgrade("multiplication", 72) && !hasUpgrade("subtraction", 17)) return false
                return hasUpgrade("multiplication", 64)
            },
            branches: [[81, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return player.dimension.points.gte(4) || player.planetary.unlocked},
        },
        81: {
            title: "Culmination",
            effect() {
                let base = player.multiplication.points
                base = base.add(1).pow(0.2)
                return base
            },
            effectDisplay() {return "Shapes: x" + format(upgradeEffect("multiplication", 81))},
            description: "Multiplication boosts Shapes, and Hexagons boost all other Constructor polygons.",
            cost: new Decimal("4096"),
            canAfford() {
                if (player.multiplication.points.lt("4096")) return false
                if (!hasUpgrade("multiplication", 71)) return false
                if (!hasUpgrade("multiplication", 72)) return false
                if (!hasUpgrade("multiplication", 73)) return false
                return true
            },
            branches: [[91, "#FFFFFF", 10], [92, "#FFFFFF", 10], [93, "#FFFFFF", 10], [94, "#FFFFFF", 10], [95, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("primitive", 11) || player.planetary.unlocked},
        },
        91: {
            title: "Muga Millions",
            description: "x1e6 Division.",
            cost: new Decimal("2e6"),
            canAfford() {
                if (player.multiplication.points.lt("2e6")) return false
                return hasUpgrade("multiplication", 81)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked},
        },
        92: {
            title: "Less Defects",
            description: "Have more useful Core Boosters.",
            cost: new Decimal("1e7"),
            canAfford() {
                if (player.multiplication.points.lt("1e7")) return false
                return hasUpgrade("multiplication", 81)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked},
        },
        93: {
            title: "Overpowered",
            description: "^1.25 Number Cores.",
            cost: new Decimal("1e13"),
            canAfford() {
                if (player.multiplication.points.lt("1e11")) return false
                return hasUpgrade("multiplication", 81)
            },
            branches: [[101, "#FFFFFF", 10], [102, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked},
        },
        94: {
            title: "Numerical Ease",
            effect() {
                let base = player.primitive.points
                base = base.add(1).log(1000).add(1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 94))},
            description: "Numbers boost Division.",
            cost: new Decimal("135e6"),
            canAfford() {
                if (player.multiplication.points.lt("135e6")) return false
                return hasUpgrade("multiplication", 81)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked},
        },
        95: {
            title: "NO DIFFERENCE",
            effect() {
                let base = player.subtraction.points
                base = base.add(1).slog().div(1.5)
                return Decimal.max(base, decimalOne)
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 95))},
            description: "Subtraction boosts Core Boosters.",
            cost: new Decimal("2.15e9"),
            canAfford() {
                if (player.multiplication.points.lt("2.15e9")) return false
                return hasUpgrade("multiplication", 81)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("division", 8) || player.planetary.unlocked},
        },

        101: {
            title: "Five. Hundred. Shapes.",
            description: "x1,000,000 Shapes after softcap.",
            cost: new Decimal("1e18"),
            canAfford() {
                if (player.multiplication.points.lt("1e18")) return false
                return hasUpgrade("multiplication", 93)
            },
            branches: [[111, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("addition", 7) || player.planetary.unlocked},
        },
        102: {
            title: "Constructor Enhancement",
            effect() {
                let base = buyableEffect("polygon", 12)
                base = base.add(1).pow(0.1)
                return base
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", 102))},
            description: "15 free levels for the compass. The straightedge effect boosts Shapes and Division at a reduced rate.",
            cost: new Decimal("1e20"),
            canAfford() {
                if (player.multiplication.points.lt("1e20")) return false
                return hasUpgrade("multiplication", 93)
            },
            branches: [[111, "#FFFFFF", 10]],
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("addition", 7) || player.planetary.unlocked},
            onPurchase() {addBuyables("polygon", 11, new Decimal(15))}
        },

        111: {
            title: "Literally Multiplying",
            effect() {
                let base = player.multiplication.points
                if (base.gte("1e200")) base = base.pow(0.25).mul("1e150")
                return Decimal.max(base, decimalOne)
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", this.id))},
            description: "Multiplication multiplies the Shape hardcap.",
            cost: new Decimal("1e132"),
            canAfford() {
                if (player.multiplication.points.lt("1e132")) return false
                return hasUpgrade("multiplication", 101) && hasUpgrade("multiplication", 102)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("pbooster", 1)},

            branches: [[121, "#FFFFFF", 10], [122, "#FFFFFF", 10], [123, "#FFFFFF", 10]],
        },

        121: {
            title: "Primitive Hyperfixation",
            description: "^1.1 Number Cores and improve \"Slowing down?\" a TREMENDOUS amount.",
            cost: new Decimal("1e170"),
            canAfford() {
                if (player.multiplication.points.lt("1e170")) return false
                if (hasUpgrade(this.layer, 122) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 123) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 123) && hasUpgrade(this.layer, 122)) return false
                return hasUpgrade("multiplication", 111)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("pbooster", 2)},
            branches: [[131, "#FFFFFF", 10]],
        },
        122: {
            title: "Arithmetic Hyperfixation",
            description: "^1.1 Operation Power after softcap and uncap \"Insane Math\", which now multiplies Numbers.",
            cost: new Decimal("1e170"),
            canAfford() {
                if (player.multiplication.points.lt("1e170")) return false
                if (hasUpgrade(this.layer, 121) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 123) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 121) && hasUpgrade(this.layer, 123)) return false
                return hasUpgrade("multiplication", 111)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("pbooster", 2)},
        },
        123: {
            title: "Polygonal Hyperfixation",
            description: "^1.1 all Constructor polygon gains, and nerf the Triangle effect softcap.",
            cost: new Decimal("1e170"),
            canAfford() {
                if (player.multiplication.points.lt("1e170")) return false
                if (hasUpgrade(this.layer, 121) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 122) && !hasMilestone("dimension", 6)) return false
                if (hasUpgrade(this.layer, 121) && hasUpgrade(this.layer, 122)) return false
                return hasUpgrade("multiplication", 111)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("pbooster", 2)},
            branches: [[132, "#FFFFFF", 10]],
        },

        131: {
            title: "Exoplanetary Geometry",
            effect() {
                let base = getBuyableAmount("planetary", 11).add(getBuyableAmount("planetary", 12)).add(getBuyableAmount("planetary", 21)).add(getBuyableAmount("planetary", 22)).add(getBuyableAmount("planetary", 31)).add(getBuyableAmount("planetary", 32)).add(getBuyableAmount("planetary", 41)).add(getBuyableAmount("planetary", 42))
                base = new Decimal(2).pow(base).pow(0.75)
                return Decimal.max(base, decimalOne)
            },
            effectDisplay() {return "x" + format(upgradeEffect("multiplication", this.id))},
            description: "The sum of your Planetary generators boosts the Shape hardcap at an increased rate.",
            cost: new Decimal("1e430"),
            canAfford() {
                if (player.multiplication.points.lt("1e430")) return false
                if (hasUpgrade(this.layer, 132) && !hasUpgrade("polygon", 26)) return false
                return hasUpgrade("multiplication", 121)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasUpgrade("corebooster", 13)},
            branches: [[141, "#FFFFFF", 10]],
        },
        132: {
            title: "Fundamental Geometry",
            effect() {
                let base = player.fundamental.points
                base = base.add(1).log("e1e9")
                return Decimal.max(base, decimalOne)
            },
            effectDisplay() {return "^" + format(upgradeEffect("multiplication", this.id))},
            description: "Fundamentality boosts all Constructor polygons at a really reduced rate.",
            cost: new Decimal("1e430"),
            canAfford() {
                if (player.multiplication.points.lt("1e430")) return false
                if (hasUpgrade(this.layer, 131) && !hasUpgrade("polygon", 26)) return false
                return hasUpgrade("multiplication", 123)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasUpgrade("corebooster", 13)},
            branches: [[141, "#FFFFFF", 10]],
        },

        141: {
            title: "wtf",
            description: "x1.25 Planetary Boosters.",
            cost: new Decimal("1e810"),
            canAfford() {
                if (player.multiplication.points.lt("1e810")) return false
                return hasUpgrade("multiplication", 131) && hasUpgrade("multiplication", 132)
            },
            pay() {return new Decimal(0)},
            unlocked() {return hasMilestone("planetary", 11)},
        },
    },
    buyables: {
        11: {
            cost(x) {
                let base = new Decimal(2).pow(x)
                return base
            },
            title: "Actual Multiplying Boost",
            display() { return "Multiplies Points and Addition by 250 per purchase. (Require: only needs x, does not subtract / Cost: does subtract currency)" + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "/600" + "\n" + "Require: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                if (inChallenge("pbooster", 22)) return new Decimal(1)
                let base = new Decimal(250)
                let effect = base.pow(x)
                if (player.dimension.points.gte(4)) effect = effect.pow(1.2)
                return effect
            },
            unlocked() {return hasMilestone("polygon", 6) || player.planetary.unlocked},
            purchaseLimit: 600
        },
        12: {
            cost(x) {
                let base = new Decimal(10).pow(0.5).pow(x).mul("1e40")
                return base
            },
            title: "Number Core Passiveness",
            display() { return "Number Cores boost Division. " + "\n" + "Bought: " + getBuyableAmount(this.layer, this.id) + "\n" + "Require: " + format(this.cost()) + "\n" + "Effect: x" + format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                if (inChallenge("pbooster", 22)) return new Decimal(1)
                let base = player.numbercore.points
                let effect = base.add(1).log(10).add(1)
                effect = effect.mul(new Decimal(1.5).pow(getBuyableAmount(this.layer, this.id)))
                effect = effect.pow(buyableEffect("numbercore", 31)[0])
                return effect
            },
            unlocked() {return hasMilestone("planetary", 5)},
        },
    },
    canReset() {
        if (player.multiplication.points.gte("600") && !hasMilestone("division", 4)) {
            return false;
        }
        if (player.multiplication.points.gte("5000") && !hasUpgrade("arithmetic", 36)) {
            return false;
        }
        if (player.multiplication.points.gte("4e4") && !hasUpgrade("primitive", 31)) {
            return false;
        }
        if (player.multiplication.points.gte("250000") && !hasUpgrade("primitive", 35)) {
            return false;
        }
        if (player.multiplication.points.gte("1e7") && !hasMilestone("corebooster", 1)) {
            return false;
        }
        if (player.multiplication.points.gte("215e7") && !hasMilestone("division", 9)) {
            return false;
        }

        if (player.arithmetic.points.gte(getNextAt("multiplication"))) return true;
        
        return false;
    },
    update(diff){
        player.multiplication.isAbleToReset = false
        if (canReset("multiplication")) player.multiplication.isAbleToReset = true

        if (player.multiplication.points.gte("600") && !hasMilestone("division", 4) && !hasMilestone("planetary", 4)) {
            player.multiplication.points = new Decimal("600")
            player.multiplication.isAbleToReset = false
        }
        if (player.multiplication.points.gte("5000") && !hasUpgrade("arithmetic", 36) && !hasMilestone("planetary", 4)) {
            player.multiplication.points = new Decimal("5000")
            player.multiplication.isAbleToReset = false
        }
        if (player.multiplication.points.gte("4e4") && !hasUpgrade("primitive", 31) && !hasMilestone("planetary", 4)) {
            player.multiplication.points = new Decimal("4e4")
            player.multiplication.isAbleToReset = false
        }
        if (player.multiplication.points.gte("250000") && !hasUpgrade("primitive", 35) && !hasAchievement("planetary", 13)) {
            player.multiplication.points = new Decimal("250000")
            player.multiplication.isAbleToReset = false
        }
        if (player.multiplication.points.gte("1e7") && !hasMilestone("corebooster", 1) && !hasAchievement("planetary", 13)) {
            player.multiplication.points = new Decimal("1e7")
            player.multiplication.isAbleToReset = false
        }
        if (player.multiplication.points.gte("215e7") && !hasMilestone("division", 9) && !hasAchievement("planetary", 13)) {
            player.multiplication.points = new Decimal("215e7")
            player.multiplication.isAbleToReset = false
        }

        if (player.dimension.points.gte(5) && player.multiplication.isAbleToReset) {
            if (canReset(this.layer)) doReset(this.layer)
        }
    },

    glowColor() {
        let layer = "multiplication"
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
        let layer = "multiplication"
        for (const id of [11, 12]) {
            if (canBuyBuyable("multiplication", id)) {
                return true
            }
        }
        return false
    },

    automate() {
        let layer = "multiplication"
        for (const id of [11, 12]) {
            if (canBuyBuyable(layer, id) && hasMilestone("planetary", 5)) {
                setBuyableAmount(layer, id, getBuyableAmount(layer, id).add(1))
            }
        }
    },

    tooltip() {
        let able = canReset("multiplication")
        if (!able) return format(player.multiplication.points) + " Multiplication (Unable to gain)"
        return format(player.multiplication.points) + " Multiplication (+" + format(getResetGain("multiplication")) + " Multiplication on reset)"
    },
})