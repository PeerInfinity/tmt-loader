addLayer("a", {
    name: "Apples", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#489650",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Apples", // Name of prestige currency
    baseResource: "Seed", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    doReset(layer) {
        if (layers[layer].position <= layers[this.layer].position) return;
        const keep = []
        if (hasMilestone('b', 0)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    passiveGeneration() {return hasMilestone('b', 1)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('a', 15)) mult = mult.times(2)
        if (hasUpgrade('a', 22)) mult = mult.times(2)
        if (hasUpgrade('a', 24)) mult = mult.times(2.5)
        if (hasUpgrade('a', 31)) mult = mult.times(5)

        if (hasUpgrade('b', 12)) mult = mult.times(1.5)
        if (hasUpgrade('b', 14)) mult = mult.times(player.a.points.add(10).log(10))
        if (hasUpgrade('b', 21)) mult = mult.times(2)
        if (hasUpgrade('b', 22)) mult = mult.times(5)

        if (hasUpgrade('c', 11)) mult = mult.times(4)
        if (hasUpgrade('c', 13)) mult = mult.times(3)
        if (hasUpgrade('c', 24)) mult = mult.times(player.c.points.add(10).log(10))

        if (hasUpgrade('cm', 45)) mult = mult.pow(1.2)
        if (hasUpgrade('cm', 54)) mult = mult.times("1e25")

        if (hasUpgrade('d', 11)) mult = mult.times(10)
        if (hasUpgrade('d', 21)) mult = mult.pow("1.06")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "a", description: "a: Reset for Apples", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return true },
    upgrades: {
        11: {
            title: "First Upgrade",
            description: "Double your point gain!",
            cost: new Decimal(1)
        },
        12: {
            title: "Double Again!",
            description: "Double the effects of the previous upgrade!",
            cost: new Decimal(3)
        },
        13: {
            title: "More Multipliers!",
            description: "Triple your point gain!",
            cost: new Decimal(10)
        },
        14: {
            title: "More Apple Seeds",
            description: "Apples boost seed. ",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.a.points.sqrt().add(1) },
            cost: new Decimal(20)
        },
        15: {
            title: "Seeds Grow Two",
            description: "Get twice as many apples",
            cost: new Decimal(100)
        },
        21: {
            title: "Not Double?",
            description: "Get x1.5 seed",
            cost: new Decimal(320)
        },
        22: {
            title: "Gold Plated",
            description: "Apples are now golden, and grow twice as much!",
            cost: new Decimal(450)
        },
        23: {
            title: "QUINTUPLE SEEDS????",
            description: "Gain x5 more seed!",
            cost: new Decimal(1500)
        },
        24: {
            title: "Big Boosts",
            description: "Gain x3 more seed and x2.5 more apples",
            cost: new Decimal(5000)
        },
        25: {
            title: "10th Boosts",
            description: "Get x3 more seed and unlock a new layer",
            cost: new Decimal("25e3")
        },
        31: {
            title: "BananaBoost?",
            description: "Boost apples by x5",
            unlocked() { return hasUpgrade('b', 23) },
            cost: new Decimal("1e9")
        },
        32: {
            title: "Extra Seedy",
            description: "Get 10x Seed",
            unlocked() { return hasUpgrade('b', 23) },
            cost: new Decimal("1e11")
        },
        33: {
            title: "Seedy Seeds",
            description: "Seeds boost themselves. ",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.points.add(10).log(10) },
            unlocked() { return hasUpgrade('b', 23) },
            cost: new Decimal("1e12")
        },
        34: {
            title: "Exponential",
            description: "Power seed gain by 2",
            unlocked() { return hasUpgrade('b', 23) },
            cost: new Decimal("1e13")
        },
        35: {
            title: "A to B",
            description: "Boost Banana gain by three times",
            unlocked() { return hasUpgrade('b', 23) },
            cost: new Decimal("1e27")
        },
    },


})

addLayer("b", {
    name: "Bananas", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["a"],
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#aecc27",
    requires: new Decimal("100e3"), // Can be a function that takes requirement increases into account
    resource: "Bananas", // Name of prestige currency
    baseResource: "Apples", // Name of resource prestige is based on
    baseAmount() { return player.a.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    passiveGeneration() { return hasMilestone('c', 2) },
    doReset(layer) {
        if (layers[layer].position <= layers[this.layer].position) return;
        const keep = []
        if (hasMilestone('c', 0)) keep.push("milestones")
        if (hasMilestone('c', 1)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('a', 35)) mult = mult.times(3)

        if (hasUpgrade('b', 21)) mult = mult.times(2)
        if (hasUpgrade('b', 23)) mult = mult.times(2)

        if (hasUpgrade('c', 11)) mult = mult.times(4)
        if (hasUpgrade('c', 13)) mult = mult.times(3)
        if (hasUpgrade('c', 31)) mult = mult.times(player.c.points.add(10).log(2))
        if (hasUpgrade('c', 33)) mult = mult.pow(1.5)

        if (hasUpgrade('cm', 24)) mult = mult.times("1e3")
        if (hasUpgrade('cm', 33)) mult = mult.times("1e10")
        if (hasUpgrade('cm', 53)) mult = mult.times("1e6")

        if (hasUpgrade('d', 11)) mult = mult.times(10)
        if (hasUpgrade('d', 31)) mult = mult.pow(4)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        gan = new Decimal(1)
        if (hasUpgrade('c', 22)) gan = gan.times(1.3)
        return gan
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "b", description: "b: Reset for Bananas", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade('a', 25) || player.c.unlocked || player.b.unlocked || player.d.unlocked},
    milestones: {
        0: {
            requirementDescription: "5 Bananas",
            effectDescription: "Keep Apple upgrades on all resets",
            done() { return player.b.points.gte(5) },
        },
        1: {
            requirementDescription: "50 Bananas",
            effectDescription: "Gain 100% of Apple gain per second",
            done() { return player.b.points.gte(50) },
        },
    },
    upgrades: {
        11: {
            title: "BANANAS!!!!",
            description: "Gain 3 times more Seed!",
            cost: new Decimal(1)
        },
        12: {
            title: "Super Seeds",
            description: "Gain 2 times more Seed and 1.5 times more Apples!",
            cost: new Decimal(2)
        },
        13: {
            title: "Banana Boost",
            description: "Gain more Seed based on Bananas!",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.b.points.sqrt().add(1) },
            cost: new Decimal(6)
        },
        14: {
            title: "Duplication",
            description: "Apples boost themselves",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.a.points.add(10).log(10) },
            cost: new Decimal(15)
        },
        21: {
            title: "Fruit Ninja",
            description: "Gain twice as much Banana and Apple",
            cost: new Decimal("40")
        },
        22: {
            title: "Apple Seeds",
            description: "Gain 5x as much Apple and Seed",
            cost: new Decimal("100")
        },
        23: {
            title: "Banana Box",
            description: "x2 Bananas and unbox new Apple upgrades",
            cost: new Decimal("500")
        },
        24: {
            title: "",
            description: "Unlock a new layer",
            cost: new Decimal("5e12")
        },

    },

})

addLayer("c", {
    name: "Coconuts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["a", "b"],
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#cfcfcf",
    requires: new Decimal("1e13"), // Can be a function that takes requirement increases into account
    resource: "Coconuts", // Name of prestige currency
    baseResource: "Bananas", // Name of resource prestige is based on
    baseAmount() { return player.b.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    passiveGeneration() { return hasUpgrade('cm', 35) },
    doReset(layer) {
        if (layers[layer].position <= layers[this.layer].position) return;
        const keep = []
        if (hasMilestone('d', 0)) keep.push("upgrades")
        if (hasMilestone('d', 1)) keep.push("milestones")
        layerDataReset(this.layer, keep)
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)

        if (hasUpgrade('c', 13)) mult = mult.times(1.5)
        if (hasUpgrade('c', 21)) mult = mult.times(5)
        if (hasUpgrade('c', 32)) mult = mult.times(player.c.points.add(10).log(2))
        if (hasUpgrade('c', 41)) mult = mult.pow(1.25)
        if (hasUpgrade('c', 42)) mult = mult.times(10)
        if (hasUpgrade('c', 43)) mult = mult.times(player.c.points.add(10).log(1.8))


        if (hasUpgrade('cm', 15)) mult = mult.times(player.cm.points.add(10).log(10))
        if (hasUpgrade('cm', 22)) mult = mult.times(19.47)
        if (hasUpgrade('cm', 25)) mult = mult.times(10)
        if (hasUpgrade('cm', 52)) mult = mult.times(50)
        if (hasUpgrade('cm', 55)) mult = mult.times("1e10")
        if (hasUpgrade('cm', 61)) mult = mult.times("1e100")
        if (hasUpgrade('cm', 62)) mult = mult.times("1e250")
        if (hasUpgrade('cm', 63)) mult = mult.times("1e500")
        if (hasUpgrade('cm', 64)) mult = mult.times("1e750")
        if (hasUpgrade('cm', 65)) mult = mult.times("1e1000")

        if (hasUpgrade('d', 11)) mult = mult.times(10)
        if (hasUpgrade('d', 12)) mult = mult.pow(1.2)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "c", description: "c: Reset for Coconut", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade('b', 24) || player.c.unlocked || player.d.unlocked },

    milestones: {
        0: {
            requirementDescription: "4 Coconut",
            effectDescription: "Keep Banana milestones on all resets",
            done() { return player.c.points.gte(4) },
        },
        1: {
            requirementDescription: "75 Coconut",
            effectDescription: "Keep Banana upgrades on all resets",
            done() { return player.c.points.gte(75) },
        },
        2: {
            requirementDescription: "1e12 Coconut",
            effectDescription: "Gain 100% of Banana gain per second",
            done() { return player.c.points.gte("1e12") },
        },
    },
    upgrades: {
        11: {
            title: "Coconuts for days",
            description: "Gain 4 times more Apples and Bananas",
            cost: new Decimal(1)
        },
        12: {
            title: "Coconut Seeds",
            description: "Gain x10 Seed",
            cost: new Decimal(3)
        },
        13: {
            title: "Boost Everything!",
            description: "Get 3 times as much Seed, Apple and Banana, and get 1.5 times more Coconuts",
            cost: new Decimal(8)
        },
        14: {
            title: "POWER",
            description: "Power seed gain by ^1.2",
            cost: new Decimal(20)
        },
        21: {
            title: "Quincoco",
            description: "Get 5x more coconuts",
            cost: new Decimal("5e3")
        },
        22: {
            title: "Exponents",
            description: "Increase banana exponent by x2",
            cost: new Decimal("20e3")
        },
        23: {
            title: "Cocoboosts",
            description: "Coconuts boost Seed gain",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(10) },
            cost: new Decimal("2.5e6")
        },
        24: {
            title: "Cocobooststwo",
            description: "Coconuts boost Apple gain",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(10) },
            cost: new Decimal("250e6")
        },
        31: {
            title: "Cocobooststhree",
            description: "Coconuts boost Banana gain",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(2) },
            cost: new Decimal("250e6")
        },
        32: {
            title: "Cocoboostsfour",
            description: "Coconuts boost Coconut gain",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(2) },
            cost: new Decimal("1e9")
        },
        33: {
            title: "Extra Banana",
            description: "Power banana gain by ^1.5",
            cost: new Decimal("1.5e10")
        },
        34: {
            title: "Extra Banana",
            description: "Power banana gain by ^1.5 and unlock Milk",
            cost: new Decimal("1e13")
        },
        41: {
            title: "Milky",
            description: "Get x10 Milk and power Coconut gain to ^1.25",
            unlocked() { return hasUpgrade('cm', 25) },
            cost: new Decimal("1e18")
        },
        42: {
            title: "Reverse Milky",
            description: "Get x10 Coconuts and power Milk gain to ^1.25",
            unlocked() { return hasUpgrade('cm', 25) },
            cost: new Decimal("2.5e19")
        },
        43: {
            title: "Big Big Boosts",
            description: "Coconuts boost themselves and milk",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(1.8) },
            unlocked() { return hasUpgrade('cm', 25) },
            cost: new Decimal("5e20")
        },
        44: {
            title: "Milky Seeds",
            description: "Get x1e50 Seed and x10 Milk",
            unlocked() { return hasUpgrade('cm', 25) },
            cost: new Decimal("1e23")
        },
        51: {
            title: "Milk 1",
            description: "x1e10 Milk",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e510")
        },
        52: {
            title: "Milk 2",
            description: "x1e20 Milk",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e635")
        },
        53: {
            title: "Milk 3",
            description: "x1e40 Milk",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e942")
        },
        54: {
            title: "Milk 4",
            description: "x1e100 Milk",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e1544")
        },
    },

    tabFormat: {
        Main: {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function () { return 'You have ' + format(player.c.points) + ' Coconuts' }],
                "blank",
                "milestones",
                "upgrades"
            ],
        },
        Milk: {
            embedLayer: "cm",
            unlocked() { return hasUpgrade('c', 34)},
        },
    },

})

addLayer("cm", {
    name: "Coconut Milk", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#cfcfcf",
    requires: new Decimal("2.5e13"), // Can be a function that takes requirement increases into account
    resource: "Coconut Milk", // Name of prestige currency
    baseResource: "Coconuts", // Name of resource prestige is based on
    baseAmount() { return player.c.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    passiveGeneration() { return tmp.c.tabFormat["Milk"].unlocked },
    doReset(layer) {
        if (layers[layer].position <= layers[this.layer].position) return;
        const keep = []
        if (hasMilestone('d', 2)) keep.push("upgrades")
        layerDataReset(this.layer, keep)
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)

        if (hasUpgrade('c', 41)) mult = mult.times(10)
        if (hasUpgrade('c', 42)) mult = mult.pow(1.25)
        if (hasUpgrade('c', 43)) mult = mult.times(player.c.points.add(10).log(1.8))
        if (hasUpgrade('c', 44)) mult = mult.times(10)
        if (hasUpgrade('c', 51)) mult = mult.times("1e10")
        if (hasUpgrade('c', 52)) mult = mult.times("1e20")
        if (hasUpgrade('c', 53)) mult = mult.times("1e40")
        if (hasUpgrade('c', 54)) mult = mult.times("1e100")

        if (hasUpgrade('cm', 11)) mult = mult.times(2)
        if (hasUpgrade('cm', 12)) mult = mult.times(player.c.points.add(10).log(3))
        if (hasUpgrade('cm', 13)) mult = mult.times(5)
        if (hasUpgrade('cm', 14)) mult = mult.pow(1.4)
        if (hasUpgrade('cm', 21)) mult = mult.times(15)
        if (hasUpgrade('cm', 22)) mult = mult.times(19.47)
        if (hasUpgrade('cm', 23)) mult = mult.times(12)
        if (hasUpgrade('cm', 24)) mult = mult.times(5)
        if (hasUpgrade('cm', 31)) mult = mult.pow(1.45)
        if (hasUpgrade('cm', 32)) mult = mult.times(5)
        if (hasUpgrade('cm', 33)) mult = mult.times(50)
        if (hasUpgrade('cm', 34)) mult = mult.pow(1.4)
        if (hasUpgrade('cm', 35)) mult = mult.times(100)
        if (hasUpgrade('cm', 41)) mult = mult.times(1.01)
        if (hasUpgrade('cm', 42)) mult = mult.pow(1.01)
        if (hasUpgrade('cm', 43)) mult = mult.times(101)
        if (hasUpgrade('cm', 44)) mult = mult.times(16)
        if (hasUpgrade('cm', 45)) mult = mult.pow(1.1)
        if (hasUpgrade('cm', 51)) mult = mult.times(101.01)
        if (hasUpgrade('cm', 52)) mult = mult.times(50)
        if (hasUpgrade('cm', 53)) mult = mult.times("1e6")
        if (hasUpgrade('cm', 54)) mult = mult.times("1e30")
        if (hasUpgrade('cm', 55)) mult = mult.times("1e11")
        if (hasUpgrade('cm', 64)) mult = mult.times("1e50")

        if (hasUpgrade('d', 12)) mult = mult.times("50")
        if (hasUpgrade('d', 21)) mult = mult.times("5")
        if (hasUpgrade('d', 33)) mult = mult.times("5")

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown() { return false },
    upgrades: {
        11: {
            title: "Milk",
            description: "Gain x2 Milk",
            cost: new Decimal(10),
        },
        12: {
            title: "Coconut Milk",
            description: "Gain more Milk based on Coconuts",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.c.points.add(10).log(3) },
            cost: new Decimal(150),
        },
        13: {
            title: "Quin Milk",
            description: "Get 5 times more milk",
            cost: new Decimal(3500),
        },
        14: {
            title: "^1.4?",
            description: "Power milk by ^1.4",
            cost: new Decimal("15e3"),
        },
        15: {
            title: "CocoBoost",
            description: "Milk boosts Coconut gain",
            effectDisplay() { return `x${format(upgradeEffect(this.layer, this.id))}` },
            effect() { return player.cm.points.add(10).log(10) },
            cost: new Decimal("250e3"),
        },
        21: {
            title: "Black Milk?",
            description: "Get 15x more Milk",
            cost: new Decimal("300e3"),
        },
        22: {
            title: "Usi1947",
            description: "Boost Milk and Coconut gain by x19.47",
            cost: new Decimal("2.5e6"),
        },
        23: {
            title: "Not From Cows",
            description: "You discover Coconut Milk does not come from cows. x12 Milk gain",
            cost: new Decimal("50e6"),
        },
        24: {
            title: "BananaMilk",
            description: "Gain a boost of x1k Bananas and x5 Milk",
            cost: new Decimal("1e9"),
        },
        25: {
            title: "Extra Coconuts",
            description: "Get x10 Coconuts and unlock more Coconut upgrades",
            cost: new Decimal("2.5e9"),
        },
        31: {
            title: "Power Power Power",
            description: "Power Milk gain by ^1.45",
            cost: new Decimal("1e15"),
        },
        32: {
            title: "Silk",
            description: "You mis-spelled Milk. Gain x5 Milk",
            cost: new Decimal("2.5e22"),
        },
        33: {
            title: "Middle",
            description: "The middle upgrade boosts Milk by x50 and Bananas by x1e10",
            cost: new Decimal("1e23"),
        },
        34: {
            title: "Increment",
            description: "^1.4 Milk",
            cost: new Decimal("1.5e25"),
        },
        35: {
            title: "Auto Coconuts?",
            description: "Gain 100% of Coconut gain per second, Also get x100 Milk",
            cost: new Decimal("2.5e34"),
        },
        41: {
            title: "New Row New Boost",
            description: "x1.01 Milk",
            cost: new Decimal("5e36"),
        },
        42: {
            title: "New Row New Boost 2",
            description: "^1.01 Milk",
            cost: new Decimal("5.05e36"),
        },
        43: {
            title: "New Row New Boost 3",
            description: "x101 Milk",
            cost: new Decimal("1.5e37"),
        },
        44: {
            title: "(4, 4)",
            description: "4x4 = x16 Milk",
            cost: new Decimal("2e39"),
        },
        45: {
            title: "POW",
            description: "^1.5 Seeds, ^1.2 Apples, ^1.1 Milk",
            cost: new Decimal("2.5e40"),
        },
        51: {
            title: "New Row New Boost v2",
            description: "x101.01 Milk",
            cost: new Decimal("1e48"),
        },
        52: {
            title: "e50",
            description: "x50 Milk, x50 Coconut",
            cost: new Decimal("1e50"),
        },
        53: {
            title: "Can we reach 1e100 p1?",
            description: "x1e6 Milk, x1e6 Banana",
            cost: new Decimal("1e52"),
        },
        54: {
            title: "Can we reach 1e100 p2?",
            description: "x1e30 Milk, x1e25 Apple",
            cost: new Decimal("1e58"),
        },
        55: {
            title: "Did we reach it",
            description: "x1e11 Milk, x1e10 Coconut and unlock a new layer",
            cost: new Decimal("5e88"),
        },
        61: {
            title: "Coconut 1",
            description: "x1e100 Coconut",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("2e135"),
        },
        62: {
            title: "Coconut 2",
            description: "x1e250 Coconut",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e199"),
        },
        63: {
            title: "Coconut 3",
            description: "x1e500 Coconut",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e326"),
        },
        64: {
            title: "Coconut 4",
            description: "x1e750 Coconut, x1e50 Milk",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("2.5e643"),
        },
        65: {
            title: "Coconut 5",
            description: "x1e1000 Coconut",
            unlocked() { return hasUpgrade('d', 22) },
            cost: new Decimal("1e695"),
        },
    },

    tabFormat: [
        "main-display",
        //"prestige-button",
        "blank",
        ["display-text",
            function () { return 'You are gaining ' + format(player.cm.points) + ' Coconut Milk per second <br>(Starts at 2.50e13 Coconuts)' }],
        "blank",
        ["display-text",
            function () { return 'You have ' + format(player.cm.points) + ' Coconut Milk' }],
        "blank",
        "milestones",
        "upgrades",
    ],
})

addLayer("d", {
    name: "Dragonfruit", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["b", "c"],
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#ad1854",
    requires: new Decimal("1e291"), // Can be a function that takes requirement increases into account
    resource: "Dragonfruit", // Name of prestige currency
    baseResource: "Coconut", // Name of resource prestige is based on
    baseAmount() { return player.c.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.02, // Prestige currency exponent
    doReset(layer) {
        if (layers[layer].position <= layers[this.layer].position) return;
        const keep = []
        layerDataReset(this.layer, keep)
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        gan = new Decimal(1)
        return gan
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "d", description: "d: Reset for Dragonfruit", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade('cm', 55) || player.d.unlocked},
    milestones: {
        0: {
            requirementDescription: "5 Dragonfruit",
            effectDescription: "Keep Coconut upgrades on all resets",
            done() { return player.d.points.gte("5") },
        },
        1: {
            requirementDescription: "1e3 Dragonfruit",
            effectDescription: "Keep Coconut milestones on all resets",
            done() { return player.d.points.gte("1e3") },
        },
        2: {
            requirementDescription: "1e100 Dragonfruit",
            effectDescription: "Keep Milk upgrades on all resets",
            done() { return player.d.points.gte("1e100") },
        },
    },
    upgrades: {
        11: {
            title: "New Fruit",
            description: "x100 Everything except Milk",
            cost: new Decimal("1"),
        },
        12: {
            title: "B",
            description: "^1.2 Coconuts and x50 Milk",
            cost: new Decimal("1"),
        },
        13: {
            title: "Seedy",
            description: "Power Seed gain by ^1.02",
            cost: new Decimal("2"),
        },
        21: {
            title: "More and More",
            description: "Gain x5 Milk and power Apple gain by ^1.06",
            cost: new Decimal("10e3"),
        },
        22: {
            title: "Even More",
            description: "Unlock more Coconut and Milk upgrades",
            cost: new Decimal("20e3"),
        },
        23: {
            title: "BIG JUMP",
            description: "Power Seed gain by ^1.015",
            cost: new Decimal("1.5e67"),
        },
        31: {
            title: "More Powers",
            description: "Power Banana gain by ^4",
            cost: new Decimal("2.5e78"),
        },
        32: {
            title: "POWAR",
            description: "Power Seed gain by ^1.0007",
            cost: new Decimal("1e88"),
        },
        33: {
            title: "POWAR MILK",
            description: "get x5 Milk",
            cost: new Decimal("1e90"),
        },
    },

})
