
addLayer("Microprestige", {
    name: "Microprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "μ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        pageNumber:new Decimal(1),
    }},
    color: "#1B8045",
    requires: new Decimal(2), // Can be a function that takes requirement increases into account
    resource: "Microprestiges", // Name of prestige currency
    baseResource: "Nanoprestiges", // Name of resource prestige is based on
    baseAmount() {return player.Nanoprestige.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 2,
    effect() {
        var eff = player.Microprestige.points.plus(1)
        if (hasUpgrade("Nanoprestige", 71)) eff = eff.pow(2)
        if (hasUpgrade("Microprestige", 61)) eff = eff.pow(Decimal.log2(tmp.BrokenMicro.effect).pow(2))
        if (hasUpgrade("CMEnlarge", 51)) eff = eff.pow(buyableEffect("Microprestige", 21))
        return eff
    },
    effectDescription() {
        var desc;
        desc = "which are multiplying Point gain by "
        desc += format(tmp.Microprestige.effect) + "x"
        return desc
    },
    branches: ["Nanoprestige"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("Nanoprestige", 24)) mult = mult.div(2)
        if (hasUpgrade("Nanoprestige", 34)) mult = mult.div(buyableEffect("Nanoprestige", 13))
        if (hasUpgrade("Nanoprestige", 43)) mult = mult.div(Decimal.max(1, buyableEffect("Nanoprestige", 21)))
        if (hasUpgrade("Nanoprestige", 15)) mult = mult.div(upgradeEffect("Nanoprestige", 15))
        
        if (hasAchievement("Miniprestige", 31)) mult = mult.div(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        if (challengeCompletions("Nanoprestige", 11) >= 3) mult = mult.times(1.3)
        if (hasUpgrade("Nanoprestige", 53)) mult = mult.times(1.3)
        if (hasUpgrade("Microprestige", 24)) mult = mult.times(1.5)
        
        if (hasUpgrade("Microprestige", 41)) mult = mult.times(new Decimal(1).plus(Decimal.mul(0.042, player.Nanoprestige.upgrades.length)))

        if (hasUpgrade("Miniprestige", 22)) mult = mult.times(1.5)
        return new Decimal(mult)
    },
    directMult() {
        mult = new Decimal(1)
        if (hasUpgrade("Nanoprestige", 65)) mult = mult.times(7)
        if (hasMilestone("Nanoprestige", 0)) mult = mult.times((Decimal.pow(1.2, tmp.Nanoprestige.completedRows)))
        if (hasAchievement("Unlockers", 45)) mult = mult.times(buyableEffect("Miniprestige", 11))
        if (hasUpgrade("Microprestige", 52)) mult = mult.times(upgradeEffect("Microprestige", 52))
        if (hasUpgrade("Microprestige", 53)) mult = mult.times(tmp.BrokenNano.effect.log10().plus(1))
        mult = mult.times(buyableEffect("BrokenMicro", 22))
        return mult
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: ",", description: ",: Reset for Microprestiges", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() {return hasMilestone("BrokenNano", 2)},
    buyables: {
        11: {
            cost(x) {
                var cost = new Decimal("80").plus(Decimal.pow("1.5", Decimal.pow(x, 1.3)))
                if (hasUpgrade("Nanoprestige", 73)) cost = new Decimal("80").plus(Decimal.pow("1.15", Decimal.pow(x, 1.1)))
                return Decimal.floor(cost);
            },
            title() { return "Microbuff"},
            display() {
                var display;
                display = "Multiply Nanoprestige gain by " + format(this.effect())+"<br><br>"
                display += "Cost: "+format(this.cost()) + " Microprestiges.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                var bulk = new Decimal(1)
                if (hasAchievement("Partialprestige", 11)) bulk = bulk.times(5)
                if (hasUpgrade("Microprestige", 61)) bulk = bulk.times(25)
                if (hasMilestone("CMEnlarge", 3)) bulk = bulk.times(5)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(bulk))
                setBuyableAmount(this.layer, this.id, player[this.layer].buyables[this.id].div(bulk).ceil().mul(bulk))
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("CMEnlarge", 31)) amount = amount.pow(Decimal.pow(1.05, player.CMEnlarge.upgrades.length))
                return amount
            },
            unlocked() {
                if (hasUpgrade("Microprestige",14)) {
                    return true
                } else return false

            },
            effect() {
                var base = new Decimal(1.1)
                if (hasUpgrade("Microprestige",34)) base = base.plus(0.05)
                if (hasUpgrade("Nanoprestige", 72)) base = base.times(100)
                if (hasUpgrade("CMEnlarge", 31)) base = base.times(new Decimal(1.1).pow(player.CMEnlarge.upgrades.length))
                if (hasUpgrade("Microprestige", 61)) base = base.times(tmp.Microprestige.effect)
                if (hasUpgrade("Microprestige", 61)) base = base.pow(Decimal.log2(tmp.Microprestige.effect))
                let eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                return eff
            },
            
        },
        12: {
            cost(x) {
                var cost
                var cost = new Decimal("2800").plus(Decimal.pow("1.5", Decimal.pow(x, 1.3)))
                return cost;
            },
            title() { return "Micropierce"},
            display() {
                var display;
                
                display = "Multiply the power of the first row of Nano buyables by " + format(this.effect())+"<br><br>"
                display += "Cost: "+format(this.cost()) + " Microprestiges.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("CMEnlarge", 31)) amount = amount.pow(Decimal.pow(1.05, player.CMEnlarge.upgrades.length))
                return amount
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                var bulk = new Decimal(1)
                if (hasAchievement("Partialprestige", 11)) bulk = bulk.times(5)
                if (hasMilestone("CMEnlarge", 3)) bulk = bulk.times(5)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(bulk))
                setBuyableAmount(this.layer, this.id, player[this.layer].buyables[this.id].div(bulk).ceil().mul(bulk))
                
            },
            unlocked() {
                if (hasUpgrade("Microprestige", 43)) {
                    return true
                } else return false

            },
            effect() {
                var base = new Decimal(1.1)
                let eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                return eff
            },
            
        },
        13: {
            cost(x) {
                var cost
                var cost = new Decimal("50000000").times(Decimal.pow("1.25", Decimal.pow(x, 1.2)))
                return cost;
            },
            title() { return "Microgains"},
            display() {
                var display;
                display = "Divide Miniprestige cost by /" + format(this.effect())+"<br><br>"
                display += "Formula: (BN Capital)^x<br>"
                display += "Cost: "+format(this.cost()) + " Microprestiges.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                var bulk = new Decimal(1)
                if (hasAchievement("Partialprestige", 11)) bulk = bulk.times(5)
                if (hasUpgrade("Microprestige", 61)) bulk = bulk.times(5)
                if (hasMilestone("CMEnlarge", 3)) bulk = bulk.times(5)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(bulk))
                setBuyableAmount(this.layer, this.id, player[this.layer].buyables[this.id].div(bulk).ceil().mul(bulk))
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("CMEnlarge", 31)) amount = amount.pow(Decimal.pow(1.05, player.CMEnlarge.upgrades.length))
                return amount
            },
            unlocked() {
                if (hasUpgrade("Miniprestige", 21)) {
                    return true
                } else return false

            },
            effect() {
                var base = new Decimal(player.BNCapital.points).plus(1)
                if (hasUpgrade("Microprestige", 65)) base = base.pow(Decimal.pow(2, player.Microprestige.milestones.length))
                let eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                return eff
            },
            
        },
        21: {
            cost(x) {
                var cost
                var cost = new Decimal("e75000").pow(Decimal.pow("1.25", Decimal.pow(x, 1.2)))
                return cost;
            },
            title() { return "Microeconomics"},
            display() {
                var display;
                display = "Raise Microprestige effect ^" + format(this.effect())+"<br><br>"
                display += "Formula: 2^x<br>"
                display += "Cost: "+format(this.cost()) + " Microprestiges.<br>"
                display += "Levels: " + format(player[this.layer].buyables[this.id]) + "+" + format(tmp[this.layer].buyables[this.id].totalAmount.minus(player[this.layer].buyables[this.id]))
                return display;
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                var bulk = new Decimal(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(bulk))
                
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                if (hasUpgrade("CMEnlarge", 31)) amount = amount.pow(Decimal.pow(1.05, player.CMEnlarge.upgrades.length))
                return amount
            },
            unlocked() {
                if (hasAchievement("Unlockers", 54)) {
                    return true
                } else return false

            },
            effect() {
                var base = new Decimal(2)
                let eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                return eff
            },
            
        },

    },
    checkBreak() {
        if (!hasAchievement("Partialprestige", 11) && player.BrokenMicro.unlocked == true) player.BrokenMicro.unlocked = false;
    },
    challenges:{
        11: {
            name: "Microblock",
            challengeDescription: "Nanoprestige bonus multiplier is raised ^0.1, and Point gain is raised to ^0.05.",
            goalDescription: "1e6727 points",
            canComplete: function() {return player.points.gte("1e6727")},
            rewardDescription: "Increase bonus multiplier to Nanoprestige ^1.2",
            unlocked() {return hasUpgrade("Microprestige", 35)},
            onEnter() {
                player.Nanoprestige.points = new Decimal(0)
                player.points = new Decimal(0)
                player.BrokenNano.buyables[11] = new Decimal(0)
			    player.BrokenNano.buyables[12] = new Decimal(0)
			    player.BrokenNano.buyables[13] = new Decimal(0)
                player.BrokenNano.points = new Decimal(0)
            },
        },


    },
    clickables: {
        11: {
            display() {return "Previous page"},
            onClick() {
                player.Microprestige.pageNumber = player.Microprestige.pageNumber.minus(1)
            },
            canClick(){return player.Microprestige.pageNumber.gte(2)},
            unlocked() {return hasAchievement("Unlockers", 51)}

        },
        12: {
            display() {return "Next page"},
            onClick() {
                player.Microprestige.pageNumber = player.Microprestige.pageNumber.plus(1)
            },
            canClick(){return player.Microprestige.pageNumber.lte(1)},
            unlocked() {return hasAchievement("Unlockers", 51)}

        },
    },
    upgrades: {
        11: {
            name: "Micropoint",
            title: "Micropoint",
            description: "Point gain is multiplied by 7.",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(1);

            },
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        12: {
            name: "Micropush",
            title: "Micropush",
            description: "Nanoprestige cost is divided by 3.",
            cost: new Decimal(5),
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        13: {
            name :"Micromint",
            title: "Micromint",
            description: "Nanoprestige cost divided by Nanoprestige's effect.",
            cost: new Decimal(6),
            
            effect() {
                return tmp.Nanoprestige.effect;
            },
            effectDisplay() {return "/"+format(tmp.Nanoprestige.effect)},
            unlocked() {return hasAchievement("Unlockers", 11) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        14: {
            name:"Microhelp",
            title: "Microrecharge",
            description: "Unlock a Microprestige buyable, and you can buy max Microprestige",
            cost: new Decimal(84),
            unlocked() {return hasAchievement("Unlockers", 24) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        21: {
            name:"Microgesture",
            title:"Microgesture",
            description: "Unlock a new set of Nano upgrades, and Nanoprestige effect increased ^2",
            cost: new Decimal(7),
            unlocked() {return hasAchievement("Unlockers", 13) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        22: {
            name:"Microagression",
            title:"Microagression",
            description: "Microprestiges give a bigger boost to point gain, and increase the base of Nanobuff.",
            cost: new Decimal(10),
            unlocked() {return hasAchievement("Unlockers", 15) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
            effect() {
                var eff = new Decimal(10).pow(player.Microprestige.points.plus(1))
                if (hasUpgrade("Microprestige", 31)) eff = eff.pow(2)
                if (hasUpgrade("Miniprestige", 12)) eff = eff.pow(2)
                if (eff.gte("1e1000")) {
                    eff = eff.div("1e1000")
                    eff = eff.pow(0.1)
                    eff = eff.mul("1e1000")
                }
                if (eff.gte("1e10000")) eff = new Decimal("1e10000")
                return eff;
            },
            effectDisplay() {
                var eff = new Decimal(10).pow(player.Microprestige.points.plus(1))
                if (hasUpgrade("Microprestige", 31)) eff = eff.pow(2)
                if (hasUpgrade("Miniprestige", 12)) eff = eff.pow(2)
                if (eff.gte("1e1000")) {
                    eff = eff.div("1e1000")
                    eff = eff.pow(0.1)
                    eff = eff.mul("1e1000")
                }
                if (eff.gte("1e10000")) eff = new Decimal("1e10000")
                return "x" + format(eff) + " to points";
            },

        },
        23: {
            name: "Microstrawman",
            title: "Microstrawman",
            description: "Miniprestiges give a bigger boost to point gain, and unlock new Nanoprestige upgrades.",
            cost: new Decimal(19),
            unlocked() {return hasAchievement("Unlockers", 15) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
            effect() { 
                var eff = new Decimal(1e10).pow(player.Miniprestige.points.plus(1))
                if (hasUpgrade("Microprestige", 32)) eff = eff.pow(1.3)
                if (hasUpgrade("Miniprestige", 12)) eff = eff.pow(2)
                return eff;
            },
            effectDisplay() {
                var eff = new Decimal(1e10).pow(player.Miniprestige.points.plus(1))
                if (hasUpgrade("Microprestige", 32)) eff = eff.pow(1.3)
                if (hasUpgrade("Miniprestige", 12)) eff = eff.pow(2)
                return "x" + format(eff);
            }

        },
        24: {
            name: "Microexpo",
            title: "Microexpo",
            description: "Automatically Microprestige. Microprestige scaling decreased.",
            cost: new Decimal(210),
            unlocked() {return hasAchievement("Unlockers", 25) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}

        },
        31: {
            name: "Microlove",
            title: "Microlove",
            description: "Raise Microagression to ^2.",
            cost: new Decimal(30),
            unlocked() {return hasAchievement("Unlockers", 22) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        32: {
            name: "Microhate",
            title: "Microhate",
            description: "Raise Microstrawman to ^1.3, and multiply Point gain by 2401.",
            cost: new Decimal(42),
            unlocked() {return hasAchievement("Unlockers", 22) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        33: {
            name: "Microshove",
            title: "Microshove",
            description: "Multiply point gain based on Micro upgrades gained.",
            cost: new Decimal(43),
            unlocked() {return hasAchievement("Unlockers", 22) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
            effect() {return new Decimal(1e3).pow(player.Microprestige.upgrades.length)},
            effectDisplay() {return "x" + format(new Decimal(1e3).pow(player.Microprestige.upgrades.length))}
        },
        34: {
            name: "Micronano",
            title: "Micronano",
            description: "Nanoprestiges no longer reset anything, gives 33% progress to breaking Nano, and improves Microbuff.",
            cost: new Decimal(319),
            unlocked() {return hasAchievement("Unlockers", 26) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        41: {
            name: "Microfracture",
            title: "Microfracture",
            description: "Microprestige scaling is decreased based on total Nanoprestige upgrades bought. Nano is 33% more broken.",
            cost: new Decimal(358),
            unlocked() {return hasAchievement("Unlockers", 31) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        42: {
            name: "Microshatter",
            title: "Microshatter",
            description: "Nano. Nano? N̡̅anō͙. N̠̍ā͎͔̠͉̪̉̀̕͞n̢͓̘̗̐̈̆̋͟͡ò̡̢̇.",
            cost: new Decimal(739),
            unlocked() {return hasAchievement("Unlockers", 32) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        43: {
            name: "Microreduction",
            title: "Microreduction",
            description: "Unlock a new buyable.",
            cost: new Decimal(2800),
            unlocked() {return hasAchievement("Unlockers", 32) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        44: {
            name: "Microplummet",
            title: "Microplummet",
            description: "Nanoprestige effect multiplies Nanoprestige gain at a greatly reduced rate.",
            cost: new Decimal(32250),
            unlocked() {return hasAchievement("Unlockers", 32) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
            effect() {
                return tmp.Nanoprestige.effect.plus(10).ln()
            },
            effectDisplay() {return "x" + format(tmp.Nanoprestige.effect.plus(10).ln())}
        },
        15: {
            name: "Microlife",
            title: "Microlife",
            description: "Improve the Break Constant formula by a small amount.",
            cost: new Decimal(85700000),
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        25: {
            name: "Microdeath",
            title: "Microdeath",
            description: "Miniprestige effect on Nanoprestige Fragments is now exponential.",
            cost: new Decimal(112e6),
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        35: {
            name: "Micronerf",
            title: "Micronerf",
            description: "Unlock a Microprestige challenge.",
            cost: new Decimal(118e6),
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        45: {
            name: "Micron",
            title: "Micron",
            description: "Break Constant power is increased by 1.25x.",
            cost: new Decimal("7.21e17"),
            unlocked() {return hasAchievement("Unlockers", 35) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")}
        },
        51: {
            name: "MicroI",
            title: "MicroI",
            description: "Raise Miniexplode ^2401.",
            cost: new Decimal(1e45),
            unlocked() {return hasAchievement("Unlockers", 45) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        
        52:  {
            name: "MicroII",
            title: "MicroII",
            description: "Multiply Microprestige gain by log10(Nanoprestige Fragments)^0.6",
            effect() {
                return player.BrokenNano.points.plus(1).log10().pow(0.6).plus(1)
            },
            effectDisplay() {return "x" + format(upgradeEffect("Microprestige", 52))},
            cost: new Decimal(1e50),
            unlocked() {return hasAchievement("Unlockers", 45) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        53: {
            name: "MicroIII",
            title: "MicroIII",
            description: "Add Capitals to the Miniexplode formula, and multiply Microprestige gain by log10(Break Constant)",
            cost: new Decimal("1e60"),
            unlocked() {return hasAchievement("Unlockers", 45) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        
        54: {
            name: "MicroIV",
            title: "MicroIV",
            description: "Smallprestiges multiply Miniprestige gain.",
            cost: new Decimal("1e70"),
            effect() {
                return player.Smallprestige.points.plus(1)
            },
            effectDisplay() {return format(upgradeEffect("Microprestige", 54)) + "x"},
            unlocked() {return hasAchievement("Unlockers", 45) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        55: {
            name: "Microfinale",
            title: "Microfinale",
            description: "Raise Nanoprestige gain to the power of the log10 of this layer's effect.",
            cost: Decimal.dInf,
            effect() {
                return tmp.Microprestige.effect.plus(10).log10()
            },
            effectDisplay() {return "^"+format(upgradeEffect("Microprestige", 55))},
            unlocked() {return hasAchievement("Unlockers", 54) && (player.Microprestige.pageNumber.equals(1) || player.tab != "Microprestige")},
        },
        61: {
            name: "MicroVI",
            title: "MicroVI",
            description: "Bulk buy 5x more Microbuff, and its base multiplier is the Microprestige effect, which itself is buffed massively.",
            cost() {
                if (!player.CMEnlarge.upgradeOrder.includes("31")) return Decimal.dInf
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal("1e1100")
                if (player.CMEnlarge.upgradeOrder[1] == "32" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e7500")
                if (player.CMEnlarge.upgradeOrder[1] == "33" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e2500")
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal("1e25000")
            },
            unlocked() {return hasAchievement("Unlockers", 51) && (player.Microprestige.pageNumber.equals(2) || player.tab != "Microprestige")},
        },
        62: {
            name: "MicroVII",
            title: "MicroVII",
            description: "Cascade Constant exponent increased by 2, and all Cascade buyable caps are increased by 7.",
            cost() {
                if (!player.CMEnlarge.upgradeOrder.includes("31")) return Decimal.dInf
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal("1e1200")
                if (player.CMEnlarge.upgradeOrder[1] == "32" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e8000")
                if (player.CMEnlarge.upgradeOrder[1] == "33" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e2750")
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal("1e34000")
            },
            unlocked() {return hasAchievement("Unlockers", 51) && (player.Microprestige.pageNumber.equals(2) || player.tab != "Microprestige")},
        },
        63: {
            name: "MicroVIII",
            title: "MicroVIII",
            description: "Break Constant exponent increased based on Micro effect. Keep one BN upgrade on SP per upgrade this row.",
            cost() {
                if (!player.CMEnlarge.upgradeOrder.includes("31")) return Decimal.dInf
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal("1e1500")
                if (player.CMEnlarge.upgradeOrder[1] == "32" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e9000")
                if (player.CMEnlarge.upgradeOrder[1] == "33" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e3250")
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal("1e46000")
            },
            effect() {
                return Decimal.log2(Decimal.log2(tmp.Microprestige.effect.plus(4)))

            },
            effectDisplay() {return "^"+format(upgradeEffect("Microprestige", 63))},
            unlocked() {return hasAchievement("Unlockers", 51) && (player.Microprestige.pageNumber.equals(2) || player.tab != "Microprestige")},
        },
        64: {
            name: "MicroIX",
            title: "MicroIX",
            description: "Decrease CASCADE 11 cost by the log10(log10) of Microprestige's effect.",
            cost() {
                if (!player.CMEnlarge.upgradeOrder.includes("31")) return Decimal.dInf
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal("1e2250")
                if (player.CMEnlarge.upgradeOrder[1] == "32" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e12000")
                if (player.CMEnlarge.upgradeOrder[1] == "33" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e4500")
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal("1e50000")
            },
            effect() {
                return Decimal.log10(Decimal.log10(tmp.Microprestige.effect.plus("1e10")))

            },
            effectDisplay() {return "-"+format(upgradeEffect("Microprestige", 64))},
            unlocked() {return hasAchievement("Unlockers", 51) && (player.Microprestige.pageNumber.equals(2) || player.tab != "Microprestige")},
        },
        65: {
            name: "MicroVII",
            title: "MicroVII",
            description: "Add maximum levels to all CASCADE caps based on the last upgrade's effect.",
            cost() {
                if (!player.CMEnlarge.upgradeOrder.includes("31")) return Decimal.dInf
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal("1e3000")
                if (player.CMEnlarge.upgradeOrder[1] == "32" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e16000")
                if (player.CMEnlarge.upgradeOrder[1] == "33" && player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal("1e5600")
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal("1e58000")
            },
            unlocked() {return hasAchievement("Unlockers", 51) && (player.Microprestige.pageNumber.equals(2) || player.tab != "Microprestige")},
        },
    },
    completedRows() {
        var row1 = hasUpgrade("Microprestige", 11) * hasUpgrade("Microprestige", 12) * hasUpgrade("Microprestige", 13) * hasUpgrade("Microprestige", 14) * hasUpgrade("Microprestige", 15)
        var row2 = hasUpgrade("Microprestige", 21) * hasUpgrade("Microprestige", 22) * hasUpgrade("Microprestige", 23) * hasUpgrade("Microprestige", 24) * hasUpgrade("Microprestige", 25)
        var row3 = hasUpgrade("Microprestige", 31) * hasUpgrade("Microprestige", 32) * hasUpgrade("Microprestige", 33) * hasUpgrade("Microprestige", 34) * hasUpgrade("Microprestige", 35)
        var row4 = hasUpgrade("Microprestige", 41) * hasUpgrade("Microprestige", 42) * hasUpgrade("Microprestige", 43) * hasUpgrade("Microprestige", 44) * hasUpgrade("Microprestige", 45)
        var row5 = hasUpgrade("Microprestige", 51) * hasUpgrade("Microprestige", 52) * hasUpgrade("Microprestige", 53) * hasUpgrade("Microprestige", 54) * hasUpgrade("Microprestige", 55)
        var row6 = hasUpgrade("Microprestige", 61) * hasUpgrade("Microprestige", 62) * hasUpgrade("Microprestige", 63) * hasUpgrade("Microprestige", 64) * hasUpgrade("Microprestige", 65)
        var row7 = hasUpgrade("Microprestige", 71) * hasUpgrade("Microprestige", 72) * hasUpgrade("Microprestige", 73) * hasUpgrade("Microprestige", 74) * hasUpgrade("Microprestige", 75)
        var row8 = hasUpgrade("Microprestige", 81) * hasUpgrade("Microprestige", 82) * hasUpgrade("Microprestige", 83) * hasUpgrade("Microprestige", 84) * hasUpgrade("Microprestige", 85)
        var row9 = hasUpgrade("Microprestige", 91) * hasUpgrade("Microprestige", 92) * hasUpgrade("Microprestige", 93) * hasUpgrade("Microprestige", 94) * hasUpgrade("Microprestige", 95)
        return Math.round(row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9)
    },
    doReset(layer) {
        let keep = [];
        keep.push("pageNumber")
        keep.push("milestones")
        if (hasMilestone("Microprestige", 0)) keep.push("upgrades")
        
        if (layer.row == this.row) return
        else if (layer == "Miniprestige") {
            if (hasAchievement("Miniprestige", 41)) keep.push("upgrades")
            if (hasUpgrade("Miniprestige", 11)) keep.push("upgrades")
            if (hasChallenge("Microprestige", 11)) keep.push("challenges")
            if (hasChallenge("Microprestige", 11)) keep.push("buyables")
            if (hasAchievement("Smallprestige", 21)) keep.push("upgrades")
            if (hasMilestone("BrokenNano", 3)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Smallprestige") {
            if (hasUpgrade("Miniprestige", 11)) keep.push("upgrades")
            if (hasAchievement("Smallprestige", 21)) keep.push("upgrades")
            if (hasAchievement("Partialprestige", 11)) keep.push("challenges")
            layerDataReset(this.layer, keep)

        }
    },
    autoPrestige() {
        return hasUpgrade("Microprestige", 24)
    },
    canBuyMax() {
        return hasUpgrade("Microprestige", 14)
    },
    milestones: {
        0: {
            requirementDescription: "5 rows of Microprestige upgrades",
            effectDescription: "Per milestone, square the effect of Microgains. Keep upgrades on all resets.",
            done() {
                return tmp.Microprestige.completedRows >= 5
            },
        },
        1: {
            requirementDescription: "6 rows of Microprestige upgrades",
            effectDescription: "Per milestone, multiply Capital gain by 1.2. Keep challenges on all resets.",
            done() {
                return tmp.Microprestige.completedRows >= 6


            },

        },

    },
    automate() {
        if (hasUpgrade("Miniprestige", 21)) buyBuyable("Microprestige", 11)
        if (hasUpgrade("Miniprestige", 21)) buyBuyable("Microprestige", 12)
        if (hasUpgrade("Miniprestige", 21)) buyBuyable("Microprestige", 13)
    },
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "resource-display", "prestige-button", "clickables", "upgrades"],
            unlocked() {return hasAchievement("Unlockers", 11)}
        },
        "Buyables": {
            content: ["main-display", "resource-display", "prestige-button", "buyables"],
            unlocked() {return hasAchievement("Unlockers", 44)}          
        },
        "Challenges": {
            content: ["main-display", "resource-display", "prestige-button", "challenges"],
            unlocked() {return hasAchievement("Unlockers", 35)},

        },
        "Milestones": {
            content: ["main-display", "resource-display", "prestige-button", "milestones"],
            unlocked() {return hasAchievement("Unlockers", 51)}
        }




    },
    layerShown(){return true}
})

addLayer("BrokenMicro", {
    name: "BrokenMicro", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Cμ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points: new Decimal(0),
        unlocked: false,
        convertRate: new Decimal(3),
        cascadeRate: new Decimal(0.5),
        row2timer: 0,
        row2auto: false,
        row2max: 400,
        priceReductionCooldown: new Decimal(0),
    }},
    displayRow: 1,
    color: "#BCFFDB",
    requires: new Decimal("1e100"), // Can be a function that takes requirement increases into account
    resource: "Microprestige Fragments", // Name of prestige currency
    baseResource: "Microprestiges", // Name of resource prestige is based on
    baseAmount() {return player.Microprestige.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    passiveGeneration() {
        return 1   
    },
    effect() {
        var pow = new Decimal(4)
        pow = pow.plus(tmp.BrokenMicro.buyables[11].totalAmount.div(100))
        if (hasUpgrade("Microprestige", 62)) pow = pow.plus(2)
        constant = new Decimal(1).plus(Decimal.mul(0.1, player.BrokenMicro.points.plus(1).ln().pow(pow)))
        return constant
    },
    effectDescription() {
        var desc;
        desc = "which provide a Cascade Constant of "
        desc += format(tmp.BrokenMicro.effect) + "x"
        return desc
    },
    checkStuff() {
        if (player.BrokenMicro.points.gte(1)) player.BrokenMicro.unlocked = true;
        if (player.BrokenMicro.unlocked) buyBuyable("BrokenMicro", 11)
        player.BrokenMicro.convertRate = new Decimal(3)
        if (hasMilestone("CMEnlarge", 2)) player.BrokenMicro.convertRate = player.BrokenMicro.convertRate.plus(1)
        player.BrokenMicro.cascadeRate = new Decimal(0.5)
        if (hasMilestone("CMEnlarge", 3)) player.BrokenMicro.cascadeRate = player.BrokenMicro.cascadeRate.plus(0.25)
        player.BrokenMicro.row2max = 400
        if (hasUpgrade("CMEnlarge", 11)) player.BrokenMicro.row2max -= 40 * player.CMEnlarge.upgrades.length
        if (hasUpgrade("Smallprestige", 15)) player.BrokenMicro.row2max -= 40
        if (hasMilestone("CMEnlarge", 0) && player.BrokenMicro.row2auto) player.BrokenMicro.row2timer = player.BrokenMicro.row2timer + 1
        if (hasMilestone("CMEnlarge", 0) && player.BrokenMicro.row2timer >= player.BrokenMicro.row2max) {
            buyBuyable("BrokenMicro", 21)
            buyBuyable("BrokenMicro", 22)
            player.BrokenMicro.row2timer = 0;
        }
        if (player.CMEnlarge.upgradeOrder[2] == "11") {
            player.CMEnlarge.upgradeOrder = []
            player.CMEnlarge.upgrades = []
        }
        if (player.BrokenMicro.priceReductionCooldown.gte(0)) player.BrokenMicro.priceReductionCooldown = player.BrokenMicro.priceReductionCooldown.minus(1)
    },
    clickables: {
        11: {
            display() {
                if (tmp.BrokenMicro.buyables[11].cost.gt(new Decimal(0.25 * Math.pow(2, player.CMEnlarge.milestones.length)))) return "Subtract " + format(new Decimal((0.25 * Math.pow(2, player.CMEnlarge.milestones.length)))) + "s from CASCADE 11 cost."
                else return "Add " + format(new Decimal(0.25 * Math.pow(2, player.CMEnlarge.milestones.length)).div(tmp.BrokenMicro.buyables[11].cost).floor()) + " CASCADE 11 levels."
            },
            onClick() {
                if (tmp.BrokenMicro.buyables[11].cost.gt(new Decimal(0.25 * Math.pow(2, player.CMEnlarge.milestones.length)))) {player.BrokenMicro.resetTime = player.BrokenMicro.resetTime + (0.25 * Math.pow(2, player.CMEnlarge.milestones.length))
                player.BrokenMicro.priceReductionCooldown = new Decimal(10).times(Decimal.pow(1.5, player.CMEnlarge.milestones.length))
                } else if (tmp.BrokenMicro.buyables[11].getMaximum.minus(player.BrokenMicro.buyables[11]).gt(new Decimal(0.25 * Math.pow(2, player.CMEnlarge.milestones.length)).div(tmp.BrokenMicro.buyables[11].cost).floor())){player.BrokenMicro.buyables[11] = player.BrokenMicro.buyables[11].plus(new Decimal(0.25 * Math.pow(2, player.CMEnlarge.milestones.length)).div(tmp.BrokenMicro.buyables[11].cost).floor())
                    player.BrokenMicro.priceReductionCooldown = new Decimal(10).times(Decimal.pow(1.5, player.CMEnlarge.milestones.length))}
            },
            canClick(){
                return player.BrokenMicro.priceReductionCooldown.lt(1)
            }

        },



    },
    bars: {
        buyableReady: {
            direction: RIGHT,
            width:200,
            height:10,
            progress() {
                var prog = 0
                prog = new Decimal(player.BrokenMicro.resetTime).div(tmp.BrokenMicro.buyables[11].cost)
                return prog;
            },
            unlocked() {return hasUpgrade("Microprestige", 34)}
        },
        row2MergeReady: {
            direction: RIGHT,
            width:250,
            height:10,
            progress() {
                var prog = 0
                prog = new Decimal(player.BrokenMicro.row2timer).div(player.BrokenMicro.row2max)
                return prog;
            },
            unlocked() {return hasMilestone("CMEnlarge", 0)}
        }
    },
    infoboxes: {
        minigameInfo: {
            title: "Cascaded Micro",
            body() {
                var cmLore = "Congratulations on unlocking the second minigame, Cascaded Micro! "
                cmLore += "This minigame works much differently to Broken Nano. For one, it's much more idle than the previous layer. "
                cmLore += "It's similar to merge games, where you get one level of the buyable every few seconds. "
                cmLore += "At base, this is 5 seconds plus 0.5 per buyable. It can also never fall below 1.<br> <br>"
                cmLore += "This is currently " + format(tmp.BrokenMicro.buyables[11].cost) + " seconds. <br> <br>"
                cmLore += "You then merge the basic buyable into higher level buyables. "
                cmLore += "This is done at an exchange rate which starts at 3. When you merge, you only decrease the above buyable by the exchange rate. "
                cmLore += "Exchange rate also is what buyable caps are based on, so increasing this is a buff rather than a nerf. <br> <br>"
                cmLore += "The exchange rate is currently " + format(player.BrokenMicro.convertRate) + " per buyable.<br><br>"
                cmLore += "Merging a buyable also gives levels to all previous buyables. This does mean that a buyable on row 3 would give levels to ones on row 2 and 1, "
                cmLore += "and then the buyable on row 2 would give levels to row 1 again."
                return cmLore;
            },

        }
    },
    buyables: {
        11: {
            cost(x) {
                var increase = new Decimal(0.5)
                if (hasMilestone("CMEnlarge", 2)) increase = increase.minus(0.1)
                if (hasMilestone("Smallprestige", 4)) increase = increase.minus(0.1)
                var cost = new Decimal("5").plus(Decimal.mul(x, increase))
                if (hasMilestone("CMEnlarge", 1)) cost = cost.minus(player.CMEnlarge.points.times(3))
                if (hasMilestone("CMEnlarge", 4)) cost = cost.minus(player.CMEnlarge.points.div(2))
                if (hasMilestone("CMEnlarge", 4)) cost = cost.minus(player.BrokenMicro.buyables[21].div(10))
                if (hasMilestone("CMEnlarge", 4)) cost = cost.minus(player.BrokenMicro.buyables[22].div(10))
                var nb31Base = new Decimal(0.75)
                nb31Base = nb31Base.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var nb31Effect = Decimal.pow(tmp.Nanoprestige.buyables[31].totalAmount, nb31Base).div(8)
                var nb32Base = new Decimal(0.75)
                nb32Base = nb32Base.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var nb32Effect = Decimal.pow(player.Nanoprestige.buyables[32], nb32Base)
                if (hasUpgrade("Nanoprestige", 91)) cost = cost.minus(nb31Effect.div(8))
                if (hasUpgrade("Nanoprestige", 93)) cost = cost.minus(nb32Effect.div(5))
                if (hasMilestone("Smallprestige", 0)) cost = cost.minus(10)
                if (hasUpgrade("Miniprestige", 34)) cost = cost.minus(upgradeEffect("Miniprestige", 34))
                if (hasUpgrade("Microprestige", 64)) cost = cost.minus(upgradeEffect("Microprestige", 64))
                if (hasUpgrade("Microprestige", 62)) cost = cost.minus(6)
                costMin = new Decimal(1)
                if (hasUpgrade("CMEnlarge", 51)) costMin = costMin.mul(Decimal.pow(0.9, player.CMEnlarge.upgrades.length))
                if (cost.lt(costMin)) cost = new Decimal(costMin)
                return cost
            },
            title() { return "CASCADE 11"},
            display() {
                var display;
                display = "Multiply Microprestige Fragment gain by x" + format(this.effect())+" and boost Cascade Constant exponent by +" + format(tmp.BrokenMicro.buyables[11].totalAmount.div(100)) + ".<br><br>"
                display += "You have " + format(player.BrokenMicro.buyables[11]) + "/" + format(tmp.BrokenMicro.buyables[11].getMaximum) + "<br>"
                display += "Extra Levels: " + format(tmp.BrokenMicro.buyables[11].totalAmount.minus(player.BrokenMicro.buyables[11])) + "<br>"
                display += "Next in: "+format(Decimal.max(0, this.cost().minus(player.BrokenMicro.resetTime))) + " seconds."
                return display;
            },
            getMaximum() {
                var maximumBuyables = player.BrokenMicro.convertRate.times(3)
                maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points))
                if (hasMilestone("CMEnlarge", 4)) maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points))
                var nb31Base = new Decimal(0.75)
                nb31Base = nb31Base.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var nb31Effect = Decimal.pow(tmp.Nanoprestige.buyables[31].totalAmount, nb31Base)
                if (hasUpgrade("Nanoprestige", 91)) maximumBuyables = maximumBuyables.plus(nb31Effect)
                if (hasMilestone("Smallprestige", 0)) maximumBuyables = maximumBuyables.plus(5)
                if (hasMilestone("Smallprestige", 4)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Smallprestige", 15)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Miniprestige", 34)) maximumBuyables = maximumBuyables.plus(upgradeEffect("Miniprestige", 34))
                if (hasUpgrade("Microprestige", 62)) maximumBuyables = maximumBuyables.plus(7)
                if (hasUpgrade("Microprestige", 65)) maximumBuyables = maximumBuyables.plus(upgradeEffect("Microprestige", 64))
                maximumBuyables = maximumBuyables.times(player.BrokenMicro.convertRate.div(3))
                return Decimal.floor(maximumBuyables);
            },
            canAfford() { 
                return  new Decimal(player.BrokenMicro.resetTime).gte(this.cost()) && player.BrokenMicro.buyables[11].lt(tmp.BrokenMicro.buyables[11].getMaximum)
            
            },
            totalAmount() {
                var amount = new Decimal(player[this.layer].buyables[this.id])
                amount = amount.plus(player.BrokenMicro.buyables[21].times(player.BrokenMicro.cascadeRate))
                amount = amount.plus(player.BrokenMicro.buyables[22].times(player.BrokenMicro.cascadeRate))
                return amount
            },
            buy() {
                player.BrokenMicro.resetTime = 0;
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return true;
            },
            effect() {
                var base = tmp.BrokenMicro.effect
                let eff = new Decimal(base).pow(tmp[this.layer].buyables[this.id].totalAmount)
                return eff
            },
        },
        21: {
            cost(x) {
                var cost = player.BrokenMicro.convertRate
                if (player.BrokenMicro.buyables[22].gt(0)) cost = player.BrokenMicro.convertRate.times(3).plus(1)
                return Decimal.floor(cost);
            },
            title() { return "CASCADE 21"},
            display() {
                var display;
                display = "Exponentiate Nanoprestige gain by " + format(this.effect())+"<br><br>"
                display += "You have " + format(player.BrokenMicro.buyables[21]) + "/" + format(tmp.BrokenMicro.buyables[this.id].getMaximum) + " <br>"
                display += "Requirement: "+format(this.cost()) + " CASCADE I."
                return display;
            },
            getMaximum() {
                var maximumBuyables = player.BrokenMicro.convertRate.times(2)
                if (hasMilestone("CMEnlarge", 1)) maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points))
                if (hasMilestone("CMEnlarge", 4)) maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points.div(2)))
                var nb32Base = new Decimal(0.75)
                nb32Base = nb32Base.plus(Decimal.mul(0.025, player.Nanoprestige.upgrades.length-40))
                var nb32Effect = Decimal.pow(tmp.Nanoprestige.buyables[32].totalAmount, nb32Base)
                if (hasUpgrade("Nanoprestige", 93)) maximumBuyables = maximumBuyables.plus(nb32Effect)
                if (hasMilestone("Smallprestige", 4)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Smallprestige", 15)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Microprestige", 62)) maximumBuyables = maximumBuyables.plus(7)
                if (hasUpgrade("Microprestige", 65)) maximumBuyables = maximumBuyables.plus(upgradeEffect("Microprestige", 64))
                maximumBuyables = maximumBuyables.times(player.BrokenMicro.convertRate.div(3))
                
                return Decimal.floor(maximumBuyables);
            },
            canAfford() {  
                var check;
                check = player[this.layer].buyables[11].gte(this.cost()) && player.BrokenMicro.buyables[21].lt(tmp[this.layer].buyables[this.id].getMaximum)
                return check
             },
            buy() {
                player.BrokenMicro.buyables[11] = player.BrokenMicro.buyables[11].sub(player.BrokenMicro.convertRate)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return true;
            },
            effect() {
                var base = tmp.BrokenMicro.effect.plus(1).log2().plus(1)
                let eff = new Decimal(base).pow(player[this.layer].buyables[this.id])
                return eff
            },
        },
        22: {
            cost(x) {
                var cost = player.BrokenMicro.convertRate
                if (getBuyableAmount("BrokenMicro", 21).gt(0)) cost = player.BrokenMicro.convertRate.times(3).plus(1)
                return Decimal.floor(cost);
            },
            title() { return "CASCADE 22"},
            display() {
                var display;
                display = "Multiply Microprestige gain by " + format(this.effect())+"<br><br>"
                display += "You have " + format(player.BrokenMicro.buyables[22]) + "/" + format(tmp.BrokenMicro.buyables[this.id].getMaximum) + "<br>"
                display += "Requirement: "+format(this.cost()) + " CASCADE 11."
                return display;
            },
            //1e115
            canAfford() {  
                var check
                check = player[this.layer].buyables[11].gte(this.cost()) && player.BrokenMicro.buyables[22].lt(tmp[this.layer].buyables[this.id].getMaximum)
                return check
            },

            getMaximum() {
                var maximumBuyables = player.BrokenMicro.convertRate.times(2)
                if (hasMilestone("CMEnlarge", 1)) maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points))
                if (hasMilestone("CMEnlarge", 4)) maximumBuyables = maximumBuyables.plus(player.BrokenMicro.convertRate.times(player.CMEnlarge.points.div(2)))
                if (hasMilestone("Smallprestige", 2)) maximumBuyables = maximumBuyables.plus(Decimal.mul(player.Smallprestige.milestones.length, 2))
                if (hasMilestone("Smallprestige", 4)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Smallprestige", 15)) maximumBuyables = maximumBuyables.plus(tmp.Smallprestige.smallForcePow.pow(1/2))
                if (hasUpgrade("Miniprestige", 33)) maximumBuyables = maximumBuyables.plus(upgradeEffect("Miniprestige", 33))
                if (hasUpgrade("Microprestige", 62)) maximumBuyables = maximumBuyables.plus(7)
                if (hasUpgrade("Microprestige", 65)) maximumBuyables = maximumBuyables.plus(upgradeEffect("Microprestige", 64))
                maximumBuyables = maximumBuyables.times(player.BrokenMicro.convertRate.div(3))
                return Math.floor(maximumBuyables);
            },
            buy() {
                player.BrokenMicro.buyables[11] = player.BrokenMicro.buyables[11].sub(player.BrokenMicro.convertRate)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return true;
            },
            effect() {
                var base = tmp.BrokenMicro.effect.plus(1)
                if (hasUpgrade("Miniprestige", 33)) base = base.pow(Decimal.log2(player.Miniprestige.buyables[11].plus(2)))
                let eff = new Decimal(base).pow(player[this.layer].buyables[this.id])
                return eff
            },
        },

    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("BrokenMicro", 11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        mult = new Decimal(1)
        return new Decimal(mult)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    tabFormat: {
        "Buyables": {
            content: ["main-display", "resource-display", "clickables", ["bar", "buyableReady"], ["bar", "row2MergeReady"], "buyables", ["infobox", "minigameInfo"]],

        },
    },
    doReset(layer) {
        let keep = [];
        keep.push("row2auto")
        if (layer.row == this.row) return
        if (layer == "CMEnlarge") {
            layerDataReset(this.layer, keep)

        }
        else if (layer == "Smallprestige") {
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },
    layerShown(){
        return hasAchievement("Smallprestige", 41)}
})
addLayer("CMEnlarge", {
    name: "CascadedMicroEnlargement", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Cμe", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points: new Decimal(0),
        unlocked: false,
        upgradeOrder:[],
    }},
    color: "#8DFFCD",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Enlargements", // Name of prestige currency
    baseResource: "total CASCADE 1X levels", // Name of resource prestige is based on
    displayRow: 1,
    tooltipLocked() {return "Max out the Cascade tree once to unlock!"},
    tooltip() {
        var tooltip;
        if (tmp.BrokenMicro.buyables[11].totalAmount.gte(tmp.CMEnlarge.nextAt)) tooltip = "Enlargement Ready!"
        else if (tmp.BrokenMicro.buyables[11].totalAmount.gte(tmp.CMEnlarge.nextAt)) tooltip = "Enlargement Ready!"
        else tooltip = "Enlargement not ready!"
        
        return tooltip
    },
    baseAmount() {
        return tmp.BrokenMicro.buyables[11].totalAmount
    
    }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(1), // Prestige currency exponent
    base: new Decimal(1),
    
    effectDescription() {
        var desc;
        desc = "and you can have a maximum of 5 Enlargements."
        return desc
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.CMEnlarge.points.equals(0)) mult = new Decimal(12)
        if (player.CMEnlarge.points.equals(1)) mult = new Decimal(40)
        if (player.CMEnlarge.points.equals(2)) mult = new Decimal(90)
        if (player.CMEnlarge.points.equals(3)) mult = new Decimal(200)
        if (player.CMEnlarge.points.equals(4)) mult = new Decimal(300)
        if (player.CMEnlarge.points.equals(5)) mult = Decimal.dInf
        mult = mult.div(new Decimal(2).pow(player.CMEnlarge.points))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    upgrades: {
        11: {
            name: "NANO ENLARGEMENT",
            title: "NANO ENLARGEMENT",
            description: "Decrease row 2 merge time by 2 seconds per upgrade, and unlock 5 Nanoprestige upgrades and 4 Nanoprestige milestones.",
            cost() {
                if (hasUpgrade("CMEnlarge", 11)) return 1
                else return new Decimal(player.CMEnlarge.upgrades.length).plus(1)
            },
            onPurchase() {
                player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)
                player.CMEnlarge.upgradeOrder.push("11")
            },
            effectDisplay() {return "-"+format(new Decimal(2).times(player.CMEnlarge.upgrades.length))+"s"},
            style: {
                width: "150px",
                minHeight: "150px",
                marginBottom:"50px"
            },
            branches: ["31", "32", "33"]
        },
        31: {
            name: "MICRO ENLARGEMENT",
            title: "MICRO ENLARGEMENT",
            description: "Raise the amount of the first three Microprestige buyables ^1.05 per upgrade, and unlock 5 Microprestige upgrades.",
            cost() {
                if (!hasUpgrade("CMEnlarge", 31)) return new Decimal(player.CMEnlarge.upgrades.length).plus(1)
                if (player.CMEnlarge.upgradeOrder[1] == "31") return new Decimal(2)
                if (player.CMEnlarge.upgradeOrder[2] == "31") return new Decimal(3)
                if (player.CMEnlarge.upgradeOrder[3] == "31") return new Decimal(4)
            },
            canAfford() {return hasUpgrade("CMEnlarge", 11)},
            onPurchase() {
                player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)
                player.CMEnlarge.upgradeOrder.push("31")
            },
            style: {
                width: "150px",
                minHeight: "150px",
            }
        },
        32: {
            name: "MINI ENLARGEMENT",
            title: "MINI ENLARGEMENT",
            description: "Multiply Miniprestige gain by 2x per Enlargement upgrade, and unlock 4 Miniprestige upgrades.",
            cost() {
                if (!hasUpgrade("CMEnlarge", 32)) return new Decimal(player.CMEnlarge.upgrades.length).plus(1)
                if (player.CMEnlarge.upgradeOrder[1] == "32") return new Decimal(2)
                if (player.CMEnlarge.upgradeOrder[2] == "32") return new Decimal(3)
                if (player.CMEnlarge.upgradeOrder[3] == "32") return new Decimal(4)
            },
            canAfford() {return hasUpgrade("CMEnlarge", 11)},
            onPurchase() {
                player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)
                player.CMEnlarge.upgradeOrder.push("32")
            },
            style: {
                width: "150px",
                minHeight: "150px",
                marginLeft: "10px",
                marginRight: "10px"
            }
        },
        33: {
            name: "SMALL ENLARGEMENT",
            title: "SMALL ENLARGEMENT",
            description: "Multiply Smallprestige exponent by 1.02 per upgrade, and unlock 5 Smallprestige upgrades.",
            cost() {
                if (!hasUpgrade("CMEnlarge", 33)) return new Decimal(player.CMEnlarge.upgrades.length).plus(1)
                if (player.CMEnlarge.upgradeOrder[1] == "33") return new Decimal(2)
                if (player.CMEnlarge.upgradeOrder[2] == "33") return new Decimal(3)
                if (player.CMEnlarge.upgradeOrder[3] == "33") return new Decimal(4)
            
            },
            canAfford() {return hasUpgrade("CMEnlarge", 11)},
            onPurchase() {
                player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)
                player.CMEnlarge.upgradeOrder.push("33")
            },
            style: {
                width: "150px",
                minHeight: "150px",
            }
        },
        51: {
            name: "BUYABLE ENLARGEMENT",
            title: "BUYABLE ENLARGEMENT",
            description: "Decrease minimum C11 time by 0.9x per Expansion upgrade, and unlock a buyable for Nano, Micro, Small, and BN.",
            cost() {return new Decimal(5)},
            canAfford() {return hasUpgrade("CMEnlarge", 31) && hasUpgrade("CMEnlarge", 32) && hasUpgrade("CMEnlarge", 33)},
            onPurchase() {player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)},
            style: {
                width: "150px",
                minHeight: "150px",
                marginTop:"50px",
                marginBottom:"50px",
            },
            branches: ["31", "32", "33"]
        },
        61: {
            name: "EXPANSION",
            title: "EXPANSION",
            description: "<b> This upgrade fundamentally changes both this layer and Cascade! </b><br> <br> Adds another set of buyables to the tree, double Cascade rate, unlock a new sub-layer Expansions with its own upgrade tree, and unlock the NX layer, but remove all increases to buyable caps and add scaling to row 2 buyables.",
            cost() {return new Decimal(6)},
            canAfford() {return hasUpgrade("CMEnlarge", 51)},
            onPurchase() {player.CMEnlarge.points = player.CMEnlarge.points.plus(player.CMEnlarge.upgrades.length)},
            style: {
                width: "250px",
                minHeight: "250px",
            },
            branches: ["51"]
        },


    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    milestones:{
        0: {
            requirementDescription: "1 Enlargement",
            done() {return player.CMEnlarge.points.gte(1)},
            effectDescription: "Increase cap of Cascade 1X buyables by the exchange rate per Enlargement. Automatically merge into Row 2 every 20 seconds, prioritizing CASCADE 21. (It can merge both at once)",
            toggles:[["BrokenMicro", "row2auto"]]
        },
        1: {
            requirementDescription: "2 Enlargements",
            done() {return player.CMEnlarge.points.gte(2)},
            effectDescription: "Increase cap of Cascade 2X buyables by the exchange rate per Enlargement. Reduce Cascade 11 cost by 3 second per Enlargement."
        },
        2: {
            requirementDescription: "3 Enlargements",
            done() {return player.CMEnlarge.points.gte(3)},
            effectDescription: "Increase buyable exchange rate by 1, and buyable caps to compensate. Cascade 11 cost increase is reduced by 0.1 seconds. Autobuy the first Mini buyable."
        },
        3: {
            requirementDescription: "4 Enlargements",
            done() {return player.CMEnlarge.points.gte(4)},
            effectDescription: "Divide Smallprestige costs by 1.3 per Enlargement. Increase Cascade rate by 0.25. Bulk 5x more Micro buyables."
        },
        4: {
            requirementDescription: "5 Enlargements",
            done() {return player.CMEnlarge.points.gte(5)},
            effectDescription: "Apply the first milestone again at full strength, the second at half strength, and reduce Cascade 11 costs by 1/10th of Cascade 2X levels"
        },
    },
    doReset(layer) {
        let keep = [];
        keep.push("unlockOrder")
        keep.push("milestones")
        keep.push("upgrades")
        if (layer.row == this.row) return
        else if (layer == "Miniprestige") {
            keep.push("milestones")
            keep.push("points")
            keep.push("upgrades")
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Smallprestige") {
            keep.push("milestones")
            keep.push("points")
            keep.push("upgrades")
            keep.push("buyables")
            layerDataReset(this.layer, keep)
        } else if (layer == "Partialprestige") {
            layerDataReset(this.layer, keep)


        }
        doReset("Miniprestige")
    },
    layerShown(){
        return hasAchievement("Smallprestige", 41)}
})