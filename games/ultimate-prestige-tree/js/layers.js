addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["mp", "b", "g"],
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#27C6D6",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(0.5)
        let div = new Decimal(5)
        if(hasUpgrade("b", 32)) div = div.sub(1)
        if(getBuyableAmount("b", 11).gte(1)) exp = exp.add(getBuyableAmount("b", 11).add(1).log(5).root(2).divideBy(div))
        return exp
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if(hasMilestone("p", 1)) mult = mult.times(player.points.add(1).pow(0.15))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "1 True Prestige Point",
            effectDescription: "Doubles Point Generation.",
            done() { return hasUpgrade("p", 12) }
        },
        1: {
            requirementDescription: "2 True Prestige Points",
            effectDescription: "Points Boost Prestige Point Generation.",
            done() { return hasUpgrade("p", 13) }
        }
    },
    upgrades: {
        11: {
            title: "Point Generation",
            description: "Generate 1 Point per second.",
            cost: new Decimal(1)
        },
        12: {
            title: "True Prestige Point 1",
            description: "Your first True Prestige Point! Unlocks Mega Points!",
            cost: new Decimal(2)
        },
        13: {
            title: "True Prestige Point 2",
            description: "Your second True Prestige Point! Unlocks Boosters!",
            cost: new Decimal(10)
        },
        14: {
            title: "True Prestige Point 3",
            description: "Your third True Prestige Point! Unlocks Generators!",
            cost: new Decimal(100)
        },
        15: {
            title: "True Prestige Point 4",
            description: "Your fourth  True Prestige Point! Gain 1% of Mega Point gain per second!",
            cost: new Decimal(1000000)
        },
        21: {
            title: "True Prestige Point 5",
            description: "Unlock 3 new booster Upgrades.",
            cost: new Decimal("5e10")
        },
        22: {
            title: "True Prestige Point 6",
            description: "Generate 100% of Prestige point gain every second.",
            cost: new Decimal("5e16")
        }
    },
    doReset(resettingLayer){
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasUpgrade("p", 12)) keep.push("upgrades")
            keep.push("milestones")
            layerDataReset(this.layer, keep)
        }
    },
    passiveGeneration() {
        if(hasUpgrade("p", 22)) return 1
        return 0
    }
})

addLayer("mp", {
    name: "Mega Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0)
    }},
    color: "#7a37b9",
    requires: new Decimal(3), // Can be a function that takes requirement increases into account
    resource: "Mega Points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(0.5)
        if(hasUpgrade("mp", 34)) exp = exp.sub(0.1)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if(hasUpgrade("mp", 13)) mult = mult.times(upgradeEffect("mp", 13))
        if(hasUpgrade("t", 42)) mult = mult.times(upgradeEffect("t", 42))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for mega points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("p", 12)) return true
        return false
    },
    upgrades: {
        11: {
            title: "Better Point Generation",
            description: "Doubles point generation.",
            cost: new Decimal(1)
        },
        12: {
            title: "Synergism",
            description: "Increases point generation based on your Mega Points.",
            cost: new Decimal(3),
            effect() {
                let exp = new Decimal(0.5)
                if(hasMilestone("te", 1)) exp = exp.add(0.3)
                return player[this.layer].points.add(1).pow(exp)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "Points X Mega Points",
            description: "Multiplies Mega Point generation based on your Points.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Even Better Point Generation",
            description: "Doubles point generation again.",
            cost: new Decimal(10)
        },
        21: {
            title: "Cheaper Boosters",
            description: "Boosters are slightly cheaper.",
            cost: new Decimal(50),
            unlocked() {return hasMilestone("b", 0)}
        },
        22: {
            title: "Another Free Booster?",
            description: "Doubles point gain again.",
            cost: new Decimal(250),
            unlocked() {return hasMilestone("b", 0)}
        },
        23: {
            title: "Cheaper Generators",
            description: "Generators are slightly cheaper.",
            cost: new Decimal(125),
            unlocked() {return hasMilestone("g", 0)}
        },
        24: {
            title: "GP Skyrocketing",
            description: "GP gain multiplied by 3.",
            cost: new Decimal(300),
            unlocked() {return hasMilestone("g", 0)}
        },
        31: {
            title: "Too slow for my ADHD",
            description: "5x Points.",
            cost() {return new Decimal("1.5e7")},
            unlocked() {return hasMilestone("g", 2)}
        },
        32: {
            title: "To the moon!",
            description: "50x GP. Huge.",
            cost() {return new Decimal("5e7")},
            unlocked() {return hasMilestone("g", 2)}
        },
        33: {
            title: "Small dip in revenue",
            description: "Oh no, the stock market! Anyway, Boosters are slightly cheaper.",
            cost() {return new Decimal("2e8")},
            unlocked() {return hasMilestone("b", 1)}
        },
        34: {
            title: "More Mega",
            description: "Mega Points are slightly easier to get",
            cost() {return new Decimal("1e9")},
            unlocked() {return hasMilestone("b", 1)}
        }
    },
    passiveGeneration() {
        if(hasUpgrade("p", 15)) return 0.01
        return 0
    },
    resetsNothing() {
        if(hasUpgrade("e", 24)) return true
        return false
    }
})

addLayer("b", {
    name: "Boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["e", "t"],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        bl: new Decimal(0)
    }},
    color: "#2a35d3",
    requires: new Decimal(20), // Can be a function that takes requirement increases into account
    resource: "Boosters", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let exp = new Decimal(2)
        if(hasUpgrade("mp", 21)) exp = exp.sub(0.1)
        if(hasUpgrade("e", 21)) exp = exp.sub(0.4)
        if(hasUpgrade("mp", 33)) exp = exp.sub(0.1)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("p", 13)) return true
        return false
    },
    effect() {
        let eff_boosters = new Decimal(1)
        eff_boosters = eff_boosters.times(2**player.b.points)
        return eff_boosters
    },
    effectDescription() { return "which are multiplying point gain by "+format(tmp[this.layer].effect)+"x" },
    upgrades: {
        11: {
            title : "Free Booster?",
            description: "Doubles point gain",
            cost: new Decimal(4)
        },
        12: {
            title: "Second half of Enhancements",
            description: "Unlocking Enhancements... Also multiplies point gain by 1.5x!",
            cost: new Decimal(5)
        },
        13: {
            title: "Time for Time",
            description: "Unlock Time and multiply point gain by 2x.",
            cost: new Decimal(6)
        },
        21: {
            title: "Completely unrelated",
            description: "2x GP gain.",
            cost: new Decimal(12),
            unlocked() {return hasUpgrade("p", 21)}
        },
        22: {
            title: "Semi-related",
            description: "Enhancements are slightly cheaper",
            cost: new Decimal(15),
            unlocked() {return hasUpgrade("p", 21)}
        },
        23: {
            title: "Not water.",
            description: "Unlocks Booster Liquid.",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade("p", 21)}
        },
        31: {
            title: "Liquid Investments",
            description: "Booster Liquid boosts point gain.",
            cost: new Decimal(1000),
            currencyDisplayName: "ml of Booster Liquid",
            currencyInternalName: "bl",
            currencyLayer: "b",
            effect() {
                let exp = new Decimal(0.5)
                let mult = new Decimal(1)
                return player.b.bl.times(10).root(2).log(1.055).pow(exp).times(mult)
            },
            effectDisplay() {return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        32: {
            title: "Better Plant of Prestige",
            description: "Plant of Prestige is stronger.",
            cost: new Decimal(3200),
            currencyDisplayName: "ml of Booster Liquid",
            currencyInternalName: "bl",
            currencyLayer: "b"
        },
        33: {
            title: "Better Plant of Power",
            description: "Plant of Power is stronger.",
            cost: new Decimal(10000),
            currencyDisplayName: "ml of Booster Liquid",
            currencyInternalName: "bl",
            currencyLayer: "b"
        },
        41: {
            title: "Booster Liquid Boosted",
            description: "Doubles Booster liquid gain.",
            cost: new Decimal(60)
        },
        42: {
            title: "SUPER LIQUID",
            description: "Booster Liquid gain is multiplied by half of your Boosters.",
            cost: new Decimal(75)
        },
        43: {
            title: "Plant of Fre(E)",
            description: "Unlocks the 3rd plant.",
            cost: new Decimal(82)
        }
    },
    milestones: {
        0: {
            requirementDescription: "2 Boosters",
            effectDescription: "Unlocks new Mega Point upgrades.",
            done() { return player.b.points.gte(2) }
        },
        1: {
            requirementDescription: "9 Boosters",
            effectDescription: "Unlocks another 2 Mega Point Upgrades.",
            done() {return player.b.points.gte(9)}
        }
    },
    buyables: {
        11: {
            title: "Plant of Prestige",
            cost(x) {
                let base = new Decimal(3)
                return base.pow(getBuyableAmount("b", 11).add(1)).pow(3)
            },
            display() {
                let div = new Decimal(5)
                if(hasUpgrade("b", 32)) div = div.sub(1)
                return "Reduces Prestige Point exponent by " + format(getBuyableAmount("b", 11).add(1).log(5).root(2).divideBy(div)) + ".\nCost: " + format(this.cost()) + " ml of Booster Liquid"
            },
            canAfford() {
                return player.b.bl.gte(this.cost())
            },
            buy() {
                player.b.bl = player.b.bl.sub(this.cost())
                player.b.buyables[11] = player.b.buyables[11].add(1)
            },
            unlocked() {return hasUpgrade("b", 23)},
        },
        12: {
            title: "Plant of Power",
            cost(x) {
                let base = new Decimal(5)
                return base.pow(getBuyableAmount("b", 12).add(1)).pow(3.2)
            },
            display() {
                let div = new Decimal(5)
                if(hasUpgrade("b", 33)) div = div.sub(2)
                return "Multiplies GP gain by " + format(getBuyableAmount("b", 12).add(1).divideBy(div).add(1)) + "x\nCost: " + format(this.cost()) + " ml of Booster Liquid"
            },
            canAfford() {
                return player.b.bl.gte(this.cost())
            },
            buy() {
                player.b.bl = player.b.bl.sub(this.cost())
                player.b.buyables[12] = player.b.buyables[12].add(1)
            },
            unlocked() {return hasUpgrade("b", 23)},
        },
        21: {
            title: "Plant of fre(E)",
            cost(x) {
                let base = new Decimal(15)
                return base.pow(getBuyableAmount("b", 21).add(1)).pow(1.3)
            },
            display() {
                return "Gives " + format(getBuyableAmount("b", 21).times(2)) + " Free Enhancements.\nCost: " + format(this.cost()) + " ml of Booster Liquid"
            },
            canAfford() {
                return player.b.bl.gte(this.cost())
            },
            buy() {
                player.b.bl = player.b.bl.sub(this.cost())
                player.b.buyables[21] = player.b.buyables[21].add(1)
            },
            unlocked() {return hasUpgrade("b", 43)},
        }
    },
    canBuyMax() {
        if(hasMilestone("t", 1)) return true
        return false
    },
    resetsNothing() {
        if(hasMilestone("t", 3)) return true
        return false
    },
    autoPrestige() {
        return player.b.auto && hasMilestone("t", 4)
    },
    tabFormat: {
        "Boosters": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                "milestones",
                "blank",
                ["upgrades", [1,2,4]],
            ]
        },
        "Booster Liquid": {
            content: [
                ["display-text", function(){
                    let blgain = new Decimal(player.b.points)
                    if(hasUpgrade("b", 41)) blgain = blgain.times(2)
                    if(hasUpgrade("b", 42)) blgain = blgain.times(player.b.points.add(1).divideBy(2).sub(0.5).ceil())
                    return "You have <h2 style = 'color: #2a35d3'>" + format(player.b.points) + "</h2> Boosters, which are generating <h2 style = 'color: #2a35d3'>" + format(blgain) + "</h2> ml of Booster Liquid per second." 
                }],
                "blank",
                ["display-text", function(){
                    return "You have <h2 style = 'color: #2a35d3'>" + formatWhole(player.b.bl) + "</h2> ml of Booster Liquid."
                }],
                "blank",
                ["upgrades", [3]],
                "blank",
                "buyables"
            ],
            unlocked() {return hasUpgrade("b", 23)}
        }
    },
    update(diff) {
        let blgain = new Decimal(player.b.points).times(1).times(diff)
        if(hasUpgrade("b", 41)) blgain = blgain.times(2)
        if(hasUpgrade("b", 42)) blgain = blgain.times(player.b.points.add(1).divideBy(2).sub(0.5).ceil())
        player.b.bl = player.b.bl.add(blgain)
    }
    
})

addLayer("g", {
    name: "Generators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["e", "f"],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        gp: new Decimal(0),
    }},
    color: "#3ee03e",
    requires: new Decimal(20),
    resource: "Generators", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points},
    type: "static",
    exponent() {
        let exp = new Decimal(3)
        if(hasUpgrade("mp", 23)) exp = exp.sub(0.2)
        if(hasUpgrade("g", 23) && player.g.gp.gte(10)) exp = exp.sub(upgradeEffect("g", 23))
        return exp
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    hotkeys: [
        {key: "g", description: "G: Reset for generators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (hasUpgrade("p", 14)) return true
        return false
    },
    effect() {
        let eff_generators = new Decimal(1)
        let geneff = new Decimal(2)
        if(hasUpgrade("e", 22)) geneff = geneff.add(1)
        eff_generators = eff_generators.times(geneff**player.g.points)
        return eff_generators
    },
    effectDescription() { return "which are multiplying GP gain by "+format(tmp[this.layer].effect)+"x" },
    gpPointMultiplier() {
        let divider = new Decimal(5)
        if(hasUpgrade("f", 12)) divider = divider.sub(2)
        if(hasUpgrade("g", 21)) divider = divider.sub(2)
        return player.g.gp.root(2).add(1).log(2).divideBy(divider).add(1)
    },
    buyables: {
        11: {
            title: "Generator 1",
            cost(x) {
                return new Decimal(10)
            },
            display() {
                if(getBuyableAmount("g", 11).gt(0)) {
                    return "Generates 10 GP per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[11]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 10 GP per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[11]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"
            },
            canAfford() {
                let reachedMax = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[11] = player.g.buyables[11].add(1)
            },
            unlocked() {return player.g.unlocked},
            purchaseLimit() {return new Decimal(1)}
        },
        12: {
            title: "Generator 2",
            cost(x) {
                return new Decimal(20000)
            },
            display() {
                let amt_gen = new Decimal(1)
                if(hasUpgrade("g", 22)) amt_gen = amt_gen.add(1)
                if(getBuyableAmount("g", 12).gt(0)) {
                    return "Generates " + formatWhole(amt_gen) + " Generator 1 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[12]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates " + formatWhole(amt_gen) + " Generator 1 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[12]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"
            },
            canAfford() {
                let reachedMax2 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax2
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[12] = player.g.buyables[12].add(1)
            },
            unlocked() {return getBuyableAmount(this.layer, 11).gt(0)},
            purchaseLimit() {return new Decimal(1)}
        },
        13: {
            title: "Generator 3",
            cost(x) {
                return new Decimal("e6")
            },
            display() {
                if(getBuyableAmount("g", 13).gt(0)) {
                    return "Generates 1 Generator 2 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[13]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Generator 2 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[13]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"                
            },
            canAfford() {
                let reachedMax3 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax3
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[13] = player.g.buyables[13].add(1)
            },
            unlocked() {
                return getBuyableAmount(this.layer, 12).gt(0) && hasUpgrade("g", 12)
            },
            purchaseLimit() {return new Decimal(1)}
        },
        21: {
            title: "Generator 4",
            cost(x) {
                return new Decimal("5e8")
            },
            display() {
                if(getBuyableAmount("g", 21).gt(0)) {
                    return "Generates 1 Generator 3 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[21]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Generator 3 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[21]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"                
            },
            canAfford() {
                let reachedMax4 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax4
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[21] = player.g.buyables[21].add(1)
            },
            unlocked() {
                return getBuyableAmount(this.layer, 13).gt(0) && hasMilestone("g", 1)
            },
            purchaseLimit() {return new Decimal(1)}
        },
        22: {
            title: "Generator 5",
            cost(x) {
                return new Decimal("5e12")
            },
            display() {
                if(getBuyableAmount("g", 22).gt(0)) {
                    return "Generates 1 Generator 4 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[22]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Generator 4 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[22]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"                
            },
            canAfford() {
                let reachedMax5 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax5
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[22] = player.g.buyables[22].add(1)
            },
            unlocked() {
                return getBuyableAmount(this.layer, 21).gt(0) && hasUpgrade("e", 13)
            },
            purchaseLimit() {return new Decimal(1)}
        },
        23: {
            title: "Generator 6",
            cost(x) {
                return new Decimal("5e16")
            },
            display() {
                if(getBuyableAmount("g", 23).gt(0)) {
                    return "Generates 1 Generator 5 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[23]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Generator 5 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[23]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"                
            },
            canAfford() {
                let reachedMax6 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax6
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[23] = player.g.buyables[23].add(1)
            },
            unlocked() {
                return getBuyableAmount(this.layer, 22).gt(0) && hasMilestone("f", 1)
            },
            purchaseLimit() {return new Decimal(1)}
        },
        31: {
            title: "Generator 7",
            cost(x) {
                return new Decimal("1e75")
            },
            display() {
                if(getBuyableAmount("g", 31).gt(0)) {
                    return "Generates 1 Generator 6 per second. \n" +
                    "Owned:" + formatWhole(player.g.buyables[31]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Generator 6 per second. \n" +
                "Owned:" + formatWhole(player.g.buyables[31]) + "\n" +
                "Cost:" + format(this.cost()) + " Points"                
            },
            canAfford() {
                let reachedMax7 = getBuyableAmount(this.layer, this.id).gte(1)
                return player.points.gte(this.cost()) && !reachedMax7
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.g.buyables[31] = player.g.buyables[31].add(1)
            },
            unlocked() {
                return getBuyableAmount(this.layer, 23).gt(0) && hasMilestone("f", 2)
            },
            purchaseLimit() {return new Decimal(1)}
        },
    },
    upgrades: {
        11: {
            title: "First Half of Enhancements",
            description: "Unlocking Enhancements..." + " Also multiplies point gain by 1.5x!",
            cost: new Decimal(3)
        },
        12: {
            title: "Generator 3",
            description: "Unlock generator 3",
            cost: new Decimal(3)
        },
        13: {
            title: "Mass manufacturing",
            description: "Unlocks Factories and multiply point gain by 2x",
            cost: new Decimal(4)
        },
        21: {
            title: "GP is my favorite fruit",
            description: "GP boosts points slightly more.",
            cost: new Decimal(6),
            unlocked() {return hasMilestone("te", 0)}
        },
        22: {
            title: "G2 might be cooking",
            description: "Generator 2 now produces 2 Generator 1s per second!",
            cost: new Decimal(7),
            unlocked() {return hasMilestone("te", 0)},
        },
        23: {
            title: "Toxic GP",
            description: "GP makes generators cheaper.",
            cost: new Decimal(8),
            unlocked() {return hasMilestone("te", 0)},
            effect() {return player.g.gp.log(10).root(10).pow(0.5).sub(1)}
        }
    },
    update(diff) {
        if(getBuyableAmount(this.layer, 31).gt(0)) {
            let g6Produced = getBuyableAmount(this.layer, 31).times(1).times(diff)
            let currentG6 = getBuyableAmount(this.layer, 23)
            setBuyableAmount(this.layer, 23, currentG6.add(g6Produced))
        }
        if(getBuyableAmount(this.layer, 23).gt(0)) {
            let g5Produced = getBuyableAmount(this.layer, 23).times(1).times(diff)
            let currentG5 = getBuyableAmount(this.layer, 22)
            setBuyableAmount(this.layer, 22, currentG5.add(g5Produced))
        }
        if(getBuyableAmount(this.layer, 22).gt(0)) {
            let g4Produced = getBuyableAmount(this.layer, 22).times(1).times(diff)
            let currentG4 = getBuyableAmount(this.layer, 21)
            setBuyableAmount(this.layer, 21, currentG4.add(g4Produced))
        }
        if(getBuyableAmount(this.layer, 21).gt(0)) {
            let g3Produced = getBuyableAmount(this.layer, 21).times(1).times(diff)
            let currentG3 = getBuyableAmount(this.layer, 13)
            setBuyableAmount(this.layer, 13, currentG3.add(g3Produced))
        }    
        if(getBuyableAmount(this.layer, 13).gt(0)) {
            let g2Produced = getBuyableAmount(this.layer, 13).times(1).times(diff)
            let currentG2 = getBuyableAmount(this.layer, 12)
            setBuyableAmount(this.layer, 12, currentG2.add(g2Produced))
        }
        if(getBuyableAmount(this.layer, 12).gt(0)) {
            let g1Produced = getBuyableAmount(this.layer, 12).times(1).times(diff)
            if(hasUpgrade("g", 22)) g1Produced = g1Produced.times(2)
            let currentG1 = getBuyableAmount(this.layer, 11)
            setBuyableAmount(this.layer, 11, currentG1.add(g1Produced))
        }
        if(getBuyableAmount(this.layer, 11).gt(0)) {
            //REMEMBER TO ADD TO GP PER SECOND DISPLAY ASWELL!!!!
            let gpProduced = new Decimal(10).times(getBuyableAmount(this.layer, 11)).times(diff)
            let geneff = new Decimal(2)
            let bldiv = new Decimal(5)
            if(hasUpgrade("b", 33)) bldiv = bldiv.sub(2)
            if(hasUpgrade("e", 21)) geneff = geneff.add(1)
            if(player.g.points.gte(0)) gpProduced = gpProduced.times(geneff**player.g.points)
            if(hasUpgrade("mp", 24)) gpProduced = gpProduced.times(3)
            if(getBuyableAmount("e", 11).gt(0)) gpProduced = gpProduced.times(tmp.e.enhancersToGP)
            if(hasUpgrade("t", 22)) gpProduced = gpProduced.times(5)
            if(hasUpgrade("b", 21)) gpProduced = gpProduced.times(2)
            if(player.f.unlocked) gpProduced = gpProduced.times(tmp.f.aptogp)
            if(hasUpgrade("f", 11)) gpProduced = gpProduced.times(20)
            if(hasUpgrade("mp", 32)) gpProduced = gpProduced.times(50)
            if(hasMilestone("te", 0)) gpProduced = gpProduced.times(2)
            if(getBuyableAmount("b", 12).gte(1)) gpProduced = gpProduced.times(getBuyableAmount("b", 12).add(1).divideBy(bldiv).add(1))
            if(hasUpgrade("f", 14)) gpProduced = gpProduced.times(10)
            player.g.gp = player.g.gp.add(gpProduced)
        }
    },
    milestones: {
        0: {
            requirementDescription: "2 Generators",
            effectDescription: "Unlocks new Mega Point upgrades.",
            done() { return player.g.points.gte(2) }
        },
        1: {
            requirementDescription: "10,000,000 GP",
            effectDescription: "Unlocks Generator 4",
            done() { return player.g.gp.gte(10000000)}
        },
        2: {
            requirementDescription: "5 Generators",
            effectDescription: "Unlocks another 2 Mega Point upgrades.",
            done() {return player.g.points.gte(5)}
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return "You have " + format(player.points) + " points"
        }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        ["display-text", function() {
            return "You have <h2 style= 'color: #3ee03e'>" + format(player.g.gp) + "</h2> GP, Which is multiplying point gain by <h2 style = 'color: #ffffff'>" + format(tmp.g.gpPointMultiplier) + "</h2>x"
        }],
        ["display-text", function() {
            let gpps = new Decimal(0)
            let geneffdis = new Decimal(2)
            let bldiv = new Decimal(5)
            if(hasUpgrade("b", 33)) bldiv = bldiv.sub(2)
            if(hasUpgrade("e", 21)) geneffdis = geneffdis.add(1)
            if(getBuyableAmount("g", 11).gt(0)) gpps = gpps.add(10)
            gpps = gpps.times(getBuyableAmount("g", 11))
            gpps = gpps.times(geneffdis**player.g.points)
            if(hasUpgrade("mp", 24)) gpps = gpps.times(3)
            if(hasUpgrade("t", 22)) gpps = gpps.times(5)
            if(getBuyableAmount("e", 11).gt(0)) gpps = gpps.times(tmp.e.enhancersToGP)
            if(hasUpgrade("b", 21)) gpps = gpps.times(2)
            if(player.f.unlocked) gpps = gpps.times(tmp.f.aptogp)
            if(hasUpgrade("f", 11)) gpps = gpps.times(20)
            if(hasUpgrade("mp", 32)) gpps = gpps.times(50)
            if(hasMilestone("te", 0)) gpps = gpps.times(2)
            if(getBuyableAmount("b", 12).gte(1)) gpps = gpps.times(getBuyableAmount("b", 12).add(1).divideBy(bldiv).add(1))
            if(hasUpgrade("f", 14)) gpps = gpps.times(10)
            return "You're generating <h2 style = 'color: #3ee03e'>" + format(gpps) + "</h2> GP per second"
        }],
        "blank",
        "buyables",
    ],
    canBuyMax() {
        if(hasMilestone("f", 0)) return true
        return false
    }
})

addLayer("e", {
    name: "Enhancers",
    symbol: "E",
    position: 1,
    branches: ["te", "ge"],
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    color: "#af59c9",
    requires: new Decimal(1000000),
    resource: "Enhancement Points",
    baseResource: "Points",
    baseAmount() {return player.points},
    type: "normal",
    exponent() {
        let exp = new Decimal(0.8)
        if(hasMilestone("t", 2)) exp = exp.sub(0.1)
        if(hasUpgrade("e", 14)) exp = exp.sub(0.1)
        return exp
    },
    gainMult() {
        mult = new Decimal(1)
        if(hasUpgrade("t", 52)) mult = mult.times(upgradeEffect("t", 52))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    enhancersToPoint() {
        let extra_en = new Decimal(0)
        if(hasUpgrade("e", 23)) extra_en = extra_en.add(1)
        if(hasUpgrade("b", 43)) extra_en = extra_en.add(getBuyableAmount("b", 21).times(2))
        return getBuyableAmount(this.layer, 11).add(extra_en).times(3).pow(1.4).ceil().add(1)
    },
    enhancersToGP() {
        let extra_en = new Decimal(0)
        if(hasUpgrade("e", 23)) extra_en = extra_en.add(1)
        if(hasUpgrade("b", 43)) extra_en = extra_en.add(getBuyableAmount("b", 21).times(2))
        return getBuyableAmount(this.layer, 11).add(extra_en).times(2).pow(1.3).ceil().add(1)
    },
    row: 2,
    hotkeys: [
        {key: "e", description: "E: Reset for Enhancers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        if((hasUpgrade("g", 11) && hasUpgrade("b", 12)) || player.e.unlocked) return true
        return false
    },
    buyables: {
        11: {
            title: "Enhancement",
            cost(x) {
                let buys = player.e.buyables[11]
                let exp = new Decimal(0.75)
                if(hasMilestone("e", 2)) exp = exp.sub(0.05)
                if(hasUpgrade("e", 11)) exp = exp.sub(0.05)
                if(hasUpgrade("b", 22)) exp = exp.sub(0.1)
                return new Decimal(100000).pow(buys).pow(exp)
            },
            display() {
                let extra_en = new Decimal(0)
                if(hasUpgrade("e", 23)) extra_en = extra_en.add(1)
                if(hasUpgrade("b", 43)) extra_en = extra_en.add(getBuyableAmount("b", 21).times(2))
                return "Owned:" + formatWhole(getBuyableAmount(this.layer, this.id)) + "+" + formatWhole(extra_en) + "\n"
                + "Cost:" + format(this.cost()) + " Points \n"
                + "Multiplying point gain by " + formatWhole(tmp.e.enhancersToPoint) + "x\n"
                + "Multiplying GP gain by " + formatWhole(tmp.e.enhancersToGP) + "x"
            },
            buy() {
                player.points = player.points.sub(this.cost())
                player.e.buyables[11] = player.e.buyables[11].add(1)
            },
            canAfford() {
                return player.points.gte(this.cost())
            },
            unlocked() { return hasMilestone("e", 0)}
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Enhancement Point",
            effectDescription: "Unlocks Enhancers",
            done() {return player.e.points.gte(1)}
        },
        1: {
            requirementDescription: "10 Enhancement Points",
            effectDescription: "Doubles Point Gain",
            done() {return player.e.points.gte(10)}
        },
        2: {
            requirementDescription: "250 Enhancement Points",
            effectDescription: "Enhancements are slightly cheaper",
            done() {return player.e.points.gte(250)}
        },
        3: {
            requirementDescription: "1e10 Enhancement Points",
            effectDescription: "Unlocks Gears node and multiplies point gain by 5x.",
            done() {return player.e.points.gte("1e10")}
        }
    },
    upgrades: {
        11: {
            title: "Even Cheaper Enhancements",
            description: "Enhancements are slightly cheaper",
            cost: new Decimal(600)
        },
        12: {
            title: "Synergism part II",
            description: "Enhancement points boost point gain.",
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
            cost: new Decimal(1300),
            effect() {
                return player.e.points.add(1).pow(0.2)
            }
        },
        13: {
            title: "Generator 5?",
            description: "unlocks Generator 5.",
            cost: new Decimal(10000)
        },
        14: {
            title: "And a little extra",
            description: "Enhancement Points are slightly easier to get. Doubles point gain.",
            cost() {return new Decimal("1e6")}
        },
        21: {
            title: "Booster market crash",
            description: "Boosters are SIGNIFICANTLY cheaper.",
            cost: new Decimal("1e7")
        },
        22: {
            title: "Absurdly powerful generators",
            description: "Generators now multiply GP gain by 3x instead of 2x.",
            cost: new Decimal("5e9")
        },
        23: {
            title: "Technology Wins.",
            description: "Unlock the Technological Advancements node. Also get a free enhancement.",
            cost: new Decimal("1e10")
        },
        24: {
            title: "Mega Win for the Mega Points.",
            description: "Mega point resets no longer reset anything.",
            cost: new Decimal("1e12")
        }
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {
            return "You have " + format(player.points) + " points."
        }],
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        "buyables"
    ]
})

addLayer("t" , {
    name: "Time",
    symbol: "T",
    position: 2,
    branches: ["te", "tt"],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        tc: new Decimal(0)
    }},
    color: "#063d0f",
    requires: new Decimal(10000000),
    resource: "Time Shards",
    baseResource: "points",
    baseAmount () { return player.points},
    type: "normal",
    exponent() {
        if(hasUpgrade("t", 11)) return 0.6
        return 0.5
    },
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade("t", 21)) mult = mult.times(upgradeEffect("t", 21))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "t", description: "T: Reset for Time", onPress() {if(canReset(this.layer)) doReset(this.layer)}}
    ],
    layerShown() {
        if(hasUpgrade("b", 13) || player.t.unlocked) return true
        return false
    },
    upgrades: {
        11: {
            title: "Easier Time",
            description: "Gain slightly more time shards when resetting.",
            cost: new Decimal(10)
        },
        12: {
            title: "Timeback synergism",
            description: "Points boost their own gain",
            cost: new Decimal(50),
            effect() {
                let exp = new Decimal(0.05)
                if(hasMilestone("te", 2)) exp = exp.add(0.1)
                return player.points.add(1).pow(exp)
            },
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"}
        },
        13: {
            title: "Time Lab",
            description: "Unlock the Time Lab inside the Time node. Also 2x point gain.",
            cost: new Decimal(1000)
        },
        21: {
            title: "Shattered Crystals",
            description: "Time Crystals boost Time Shard gain.",
            cost: new Decimal(1),
            effect() {
                return player.t.tc.add(1).pow(0.15)
            },
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
            currencyDisplayName: "Time Crystal",
            currencyInternalName: "tc",
            currencyLayer: "t"
        },
        22: {
            title: "Even More GP",
            description: "5x GP gain.",
            cost: new Decimal(5),
            currencyDisplayName: "Time Crystals",
            currencyInternalName: "tc",
            currencyLayer: "t"
        },
        23: {
            title: "A dream",
            description: "Multiplies point gain by 3x",
            cost: new Decimal(50),
            currencyDisplayName: "Time Crystals",
            currencyInternalName: "tc",
            currencyLayer: "t"
        },
        31: {
            title: "The small things in life",
            description: "Multiplies Point gain by 1.1x",
            cost: new Decimal(5000),
        },
        32: {
            title: "The slightly bigger things in life",
            description: "Multiplies point gain by 1.3x",
            cost: new Decimal(20000)
        },
        33: {
            title: "The adequately sized things in life",
            description: "Multiplies point gain by 1.5x",
            cost: new Decimal(65000)
        },
        41: {
            title: "Shards of infinity",
            description: "Time Shards boost point generation.",
            cost: new Decimal("1e35"),
            unlocked() {return hasMilestone("te", 0)},
            effect() {return player.t.points.add(1).times(0.01).root(5).root(4).divideBy(3).add(1)},
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"}
        },
        42: {
            title: "Bring me back in time",
            description: "Time Shards and Time Crystals boost MP gain.",
            cost: new Decimal("1e40"),
            unlocked() {return hasMilestone("te", 0)},
            effect() {return player.t.points.times(player.t.tc).divideBy(100).root(10).add(1)},
            effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"}
        },
        43: {
            title: "Liquified Time",
            description: "1000x Point gain. Surprisingly, this doesn't break the game.",
            cost: new Decimal("1e65"),
            unlocked() {return hasMilestone("te", 0)}
        },
        51: {
            title: "QoL for the win!",
            description: "make 100TC per purchase instead of 1!",
            cost: new Decimal(250),
            unlocked() {return hasMilestone("te", 0)},
            currencyDisplayName: "Time Crystals",
            currencyInternalName: "tc",
            currencyLayer: "t"
        },
        52: {
            title: "Shining Bright",
            description: "Time Crystals boost Enhancement point gain.",
            cost: new Decimal(5000),
            unlocked() {return hasMilestone("te", 0)},
            currencyDisplayName: "Time Crystals",
            currencyInternalName: "tc",
            currencyLayer: "t",
            effect() {return player.t.tc.times(0.01).root(2).root(2).divideBy(5).add(1)},
            effectDisplay() { return format((upgradeEffect(this.layer, this.id))) + "x"}
        },
        53: {
            title: "Fractured Crystals",
            description: "Time Crystals boost point generation again.",
            cost: new Decimal(20000),
            unlocked() {return hasMilestone("te", 0)},
            currencyDisplayName: "Time Crystals",
            currencyInternalName: "tc",
            currencyLayer: "t",
            effect() {return player.t.tc.add(1).pow(0.25).divideBy(1.2)},
            effectDisplay() {return format((upgradeEffect(this.layer, this.id))) + "x"}
        }
    },
    milestones: {
        0: {
            requirementDescription: "1 Time Shard",
            effectDescription: "Triples point gain.",
            done() {return player.t.points.gte(1)}
        },
        1: {
            requirementDescription: "500 Time Shards",
            effectDescription: "You can buy multiple boosters at once.",
            done() {return player.t.points.gte(500)}
        },
        2: {
            requirementDescription: "5,000 Time Shards",
            effectDescription: "Enhancement Points are slightly easier to get.",
            done() {return player.t.points.gte(5000)}
        },
        3: {
            requirementDescription: "12,500 Time Shards",
            effectDescription: "Booster resets no longer reset anything.",
            done() {return player.t.points.gte(12500)}
        },
        4: {
            requirementDescription: "25,000 Time Shards",
            effectDescription: "Unlock auto-boosters",
            done() {return player.t.points.gte(25000)},
            toggles: [["b", "auto"]]
        },
        5: {
            requirementDescription: "1e30 Time Shards",
            effectDescription: "Unlock Time Travel node and multiply point gain by 10x.",
            done() {return player.t.points.gte("e30")}
        }
    },
    buyables: {
        11: {
            title: "Make a Time Crystal",
            cost(x) {
                let pur = new Decimal(1500)
                if(hasUpgrade("t", 51)) pur = pur.times(100)
                return pur
            },
            display() {
                let adder = new Decimal(1)
                if(hasUpgrade("t", 51)) adder = adder.add(99)
                return "Cost: " + formatWhole(this.cost()) + " Time Shards" + "\nProduces " +format(adder) + " Time Crystals"
            },
            buy() {
                let adder = new Decimal(1)
                if(hasUpgrade("t", 51)) adder = adder.add(99)
                player.t.points = player.t.points.sub(this.cost())
                player.t.tc = player.t.tc.add(adder)
            },
            canAfford() {
                return player.t.points.gte(this.cost())
            },

        }
    },
    tabFormat: {
        "Time Shards": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                "milestones",
                ["upgrades", [1,3,4]]
            ]
        },
        "Time Lab": {
            content: [
                ["display-text", function() {
                    return "You have <h2 style = 'color: #063d0f'>" + formatWhole(player.t.tc) + "</h2> Time Crystals"
                }],
                "blank",
                ["buyables", [1]],
                ["display-text", function() {
                    return "You have " + formatWhole(player.t.points) + " Time Shards"
                }],
                "blank",
                ["upgrades", [2,5]]
            ],
            unlocked() {
                if(hasUpgrade("t", 13)) return true
                return false
            }
        }
    }
})

addLayer("f" , {
    name: "Factories",
    symbol: "F",
    branches: ["ge", "w"],
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        ap: new Decimal(0)
    }},
    color: "#c45903",
    requires: new Decimal(100000000),
    resource: "Factory Energy",
    baseResource: "GP",
    baseAmount () { return player.g.gp},
    type: "normal",
    exponent: 0.3,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "f", description: "F: Reset for Factories", onPress() {if(canReset(this.layer)) doReset(this.layer)}}
    ],
    layerShown() {
        if(hasUpgrade("g", 13) || player.f.unlocked) return true
        return false
    },
    buyables: {
        11: {
            title: "Arc Generator 1",
            cost(x) {return new Decimal(1)},
            display() {
                if(getBuyableAmount("f", 11).gt(0)) {
                    return "Generates 10 Arc Power per second. \n" +
                    "Owned:" + formatWhole(player.f.buyables[11]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 10 Arc Power per second. \n" +
                "Owned:" + formatWhole(player.f.buyables[11]) + "\n" +
                "Cost:" + format(this.cost()) + " Factory Energy"  
            },
            buy() {
                player.f.points = player.f.points.sub(this.cost())
                player.f.buyables[11] = player.f.buyables[11].add(1)
            },
            canAfford() {
                let reachedMaxF = getBuyableAmount("f", 11).gte(1)
                return player.f.points.gte(this.cost()) && !reachedMaxF
            },
            unlocked() {
                return player.f.unlocked
            },
            purchaseLimit() {return new Decimal(1)}
        },
        12: {
            title: "Arc Generator 2",
            cost(x) {return new Decimal(5)},
            display() {
                if(getBuyableAmount("f", 12).gt(0)) {
                    return "Generates 1 Arc Generator 1 per second. \n" +
                    "Owned:" + formatWhole(player.f.buyables[12]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Arc Generator 1 per second. \n" +
                "Owned:" + formatWhole(player.f.buyables[12]) + "\n" +
                "Cost:" + format(this.cost()) + " Factory Energy"       
            },
            buy() {
                player.f.points = player.f.points.sub(this.cost())
                player.f.buyables[12] = player.f.buyables[12].add(1)
            },
            canAfford() {
                let reachedMaxF2 = getBuyableAmount("f", 12).gte(1)
                return player.f.points.gte(this.cost()) && !reachedMaxF2
            },
            unlocked() {
                return getBuyableAmount("f", 11).gte(1)
            },
            purchaseLimit() {return new Decimal(1)}
        },
        13: {
            title: "Arc Generator 3",
            cost(x) {return new Decimal(150)},
            display() {
                if(getBuyableAmount("f", 13).gt(0)) {
                    return "Generates 1 Arc Generator 2 per second. \n" +
                    "Owned:" + formatWhole(player.f.buyables[13]) + "\n" +
                    "UNLOCKED"
                }
                return "Generates 1 Arc Generator 2 per second. \n" +
                "Owned:" + formatWhole(player.f.buyables[13]) + "\n" +
                "Cost:" + format(this.cost()) + " Factory Energy"       
            },
            buy() {
                player.f.points = player.f.points.sub(this.cost())
                player.f.buyables[13] = player.f.buyables[13].add(1)
            },
            canAfford() {
                let reachedMaxF3 = getBuyableAmount("f", 13).gte(1)
                return player.f.points.gte(this.cost()) && !reachedMaxF3
            },
            unlocked() {
                return getBuyableAmount("f", 12).gte(1)
            },
            purchaseLimit() {return new Decimal(1)}
        }
    },
    aptogp() {
        return player.f.ap.root(2).add(1).log(2).divideBy(2).add(1)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "milestones",
        "blank",
        "upgrades",
        "blank",
        ["display-text", function() {
            return "You have <h2 style = 'color: #c45903'>" + formatWhole(player.f.ap) + "</h2> Arc Power, Which multiplies GP gain by <h2>" + format(tmp.f.aptogp) + "</h2>x."
        }],
        ["display-text", function() {
            let apps = new Decimal(0)
            if(getBuyableAmount("f", 11).gte(1)) apps = apps.add(getBuyableAmount("f", 11).times(10))
            if(hasMilestone("te", 0)) apps = apps.times(2)
            if(hasUpgrade("f", 14)) apps = apps.times(10)
            if(hasMilestone("f", 2)) apps = apps.times(5)
            return "You are generating <h2 style = 'color: #c45903'>" + format(apps) + "</h2> Arc Power per second."
        }],
        "blank",
        "buyables",
    ],
    update(diff) {
        if(getBuyableAmount("f", 13).gte(1)) {
            let ag2Produced = new Decimal(1).times(getBuyableAmount("f", 13)).times(diff)
            player.f.buyables[12] = player.f.buyables[12].add(ag2Produced)
        }     
        if(getBuyableAmount("f", 12).gte(1)) {
            let ag1Produced = new Decimal(1).times(getBuyableAmount("f", 12)).times(diff)
            player.f.buyables[11] = player.f.buyables[11].add(ag1Produced)
        }
        if(getBuyableAmount("f", 11).gte(1)) {
            let apProduced = new Decimal(10).times(getBuyableAmount("f", 11)).times(diff)
            if(hasMilestone("te", 0)) apProduced = apProduced.times(2)
            if(hasUpgrade("f", 14)) apProduced = apProduced.times(10)
            if(hasMilestone("f", 2)) apProduced = apProduced.times(5)
            player.f.ap = player.f.ap.add(apProduced)
        }
        //REMEMBER TO ADD TO DISPLAY
    },
    upgrades: {
        11: {
            title: "I NEED GP",
            description: "20x GP gain. You happy now?",
            cost() {return new Decimal(50)}
        },
        12: {
            title: "I WANT BETTER GP",
            description: "GP boosts points more.",
            cost() {return new Decimal(250)}
        },
        13: {
            title: "OK I AM HAPPY NOW",
            description: "Doubles point gain. Hopefully this makes you remain happy.",
            cost() {return new Decimal(500)}
        },
        14: {
            title: "GET ME WORKFORCE",
            description: "Unlocks Workers node. Multiplies AP and GP gain by 10x!",
            cost() {return new Decimal(10000)}
        }
    },
    milestones: {
        0: {
            requirementDescription: "10 Factory energy",
            effectDescription: "Lets you buy multiple generators at once. QoL for the win!",
            done() {return player.f.points.gte(10)}
        },
        1: {
            requirementDescription: "400 Factory energy",
            effectDescription: "Unlocks Generator 6",
            done() {return player.f.points.gte(400)}
        },
        2: {
            requirementDescription: "1,000,000 Factory energy",
            effectDescription: "Unlocks Generator 7 and multiply AP gain by 5x.",
            done() {return player.f.points.gte(1000000)}
        }
    }
}),

addLayer("te" , {
    name: "Technological Advancements",
    symbol: "Ta",
    position: 3,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    color: "#817f7d",
    requires: new Decimal(5),
    resource: "Technological Advancements",
    baseResource: "Enhancement Points",
    baseAmount () { return player.e.points},
    type: "static",
    exponent: 4,
    gainMult() {
        mult = new Decimal("1e10")
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    layerShown() {
        if(hasUpgrade("e", 23) || player.te.unlocked) return true
        return false
    },
    milestones: {
        0: {
            requirementDescription: "1 Technological Advancement",
            effectDescription: "Multiply GP, AP and Point gain by 2x. Also unlocks 3 new Generator, Booster, Time and Time lab upgrades.",
            done() {return player.te.points.gte(1)}
        },
        1: {
            requirementDescription: "2 Technological Advancements",
            effectDescription: "'Synergism' is stronger.",
            done() {return player.te.points.gte(2)}
        },
        2: {
            requirementDescription: "3 Technological Advancements",
            effectDescription: "'Timeback synergism' is stronger.",
            done() {return player.te.points.gte(3)}
        }
    }
}),

addLayer("tt" , {
    name: "Time Travel",
    symbol: "Tt",
    position: 4,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    color: "#3cff00",
    requires: new Decimal("e30"),
    resource: "seconds of pure time",
    baseResource: "Time Shards",
    baseAmount () { return player.t.points},
    type: "normal",
    exponent: 0.4,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    layerShown() {
        if(hasMilestone("t", 5) || player.tt.unlocked) return true
        return false
    },
}),

addLayer("ge" , {
    name: "Gears",
    symbol: "Ge",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    color: "#b2bbb0",
    requires: new Decimal("e30"),
    resource: "Gears",
    baseResource: "Enhancement points",
    baseAmount () { return player.e.points},
    type: "static",
    exponent: 4,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    layerShown() {
        if(hasMilestone("e", 3) || player.ge.unlocked) return true
        return false
    },
    canBuyMax() {return true}
}),

addLayer("w" , {
    name: "Workers",
    symbol: "W",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    color: "#ecb316",
    requires: new Decimal("e6"),
    resource: "Workers",
    baseResource: "Factory Energy",
    baseAmount () { return player.f.points},
    type: "static",
    exponent: 3,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    layerShown() {
        if(hasUpgrade("f", 14) || player.w.unlocked) return true
        return false
    },
    canBuyMax() {return true}
})
