addLayer("h", {
    name: "hydrogen", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 0, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#B4DCDF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account.
    resource: "hydrogen", // Name of prestige currency.
    baseResource: "vapor", // Name of resource prestige is based on.
    baseAmount() { return player.points }, // Get the current amount of baseResource.
    type: "normal", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.5, // Prestige currency exponent.
    softcap: new Decimal(1e9),
    softcapPower: new Decimal(0.04),
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        if (hasUpgrade("h", 13)) {
            mult = mult.times(upgradeEffect("h", 13))
        }
        if (hasUpgrade("h", 22)) {
            mult = mult.times(0.95)
        }
        if (hasUpgrade('o', 11)) {
            mult = mult.times(upgradeEffect('o', 11))
        }
         if (hasUpgrade('n', 22)) {
            mult = mult.times(upgradeEffect('n', 22))
        }
        if (layerShown("w") && player.w.dew !== 0) {
            mult = mult.times(player.w.dew.plus(1).sqrt())
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    doReset(resettingLayer){
        let keep=[]
        if (hasMilestone("w",0)){
            // keep.push("milestones")
            keep.push("upgrades")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        player.h.upgrades = player.h.upgrades.concat([24])
    },
    upgrades: {
        11: {
            title: "Basic Boost",
            description: "Increases vapor gain by a whopping 2x",
            cost: new Decimal(1),
            effectDisplay() { 
                return "2x" 
            },
        },
        12: {
            title: "Gaseous Vapor",
            description: "Boost vapor based on hydrogen currently owned.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1).pow(0.5).sqrt().mul(2)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() {
                return hasUpgrade("h",11)
            }
        },
        13: {
            title: "Higher Temperature",
            description: "Lowers hydrogen requirement and boosts vapor based on vapor",
            cost: new Decimal(5),
            effect() {
                if (player.points.gte(1000000000)) {
                    return player.points.log(1.0000000000001).cbrt().log10()
                }
                else {
                    return player.points.add(10).log10().pow(0.4)   
                }
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() {
                return hasUpgrade("h",12)
            }
        },
        21: {
            title: "Vapor Inertia",
            description: "Vapor gain slightly increased and raised to the power of ^1.02",
            currencyDisplayName: "hydrogen and 101 vapor",
            canAfford() {
                return player.points.gte(101) && player.h.points.gte(10);
            },
            pay() {
                player.h.points = player.h.points.minus(10)
                player.points = player.points.minus(101)
            },
            cost: new Decimal(10),
            effect() {
                if (hasUpgrade("h", 23)) {
                    return new Decimal(1.02).times(upgradeEffect("h", 23))
                } else {
                    return new Decimal(1.02)
                }
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasUpgrade("h",13)
            }
        },
        22: {
            title: "Gas Heating",
            description: "Use burning of hydrogen to fuel the heating of more vapor but consume hydrogen",
            cost: new Decimal(22),
            currencyDisplayName: "hydrogen and 222 vapor",
            canAfford() {
                return player.points.gte(222) && player.h.points.gte(22);
            },
            pay() {
                player.h.points = player.h.points.minus(22)
                player.points = player.points.minus(222)
            },
            effect() {
                if (hasUpgrade("h", 23)) {
                    return player.h.points.add(1).pow(0.05).times(1.5).times(upgradeEffect("h", 23))
                } else {
                    return player.h.points.add(1).pow(0.05).times(1.5)
                }
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("h",13)
            }
        },
        23: {
            title: "Row Synergy",
            description: "The number of upgrades in row 1 boosts row 2 upgrades",
            cost: new Decimal(50),
            effect() {
                let upgradeCount = new Decimal(0)
                if (hasUpgrade("h", 11)) {
                    upgradeCount = upgradeCount.add(1)
                }
                if (hasUpgrade("h", 12)) {
                    upgradeCount = upgradeCount.add(1)
                }
                if (hasUpgrade("h", 13)) {
                    upgradeCount = upgradeCount.add(1)
                }
                return upgradeCount.times(0.05).add(1)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("h",13)
            }
        },
        24: {
            title: "Nuclear Fusion",
            description: "Successfully test fusion, fueling scientific discovery...",
            cost: new Decimal(95),
            unlocked() {
                return hasUpgrade("h",23) || layerShown("w")
            },
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "h", description: "H: hydrogen", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return true }
})
