addLayer("le", {
    name: "Leaf", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "LP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        opmtime: new Decimal(0),
    }},
    update(t) {
        tick = new Decimal(0.05)
        if (hasUpgrade('cp', 33) && player[this.layer].opmtime.lt(3600)) player[this.layer].opmtime = player[this.layer].opmtime.add(tick)
        },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Leaves</h3><br>" + format(player.le.points) + " LP"
      },
      microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Leaf Points! it will reset EVERYTHING except Achievements but gives various op boosts and you can only gain 1 leaf point at reset (Increased by Upgrades).</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ],
                },
                "Milestones": {
                    content: [
                        ["blank", "15px"],
                        "milestones"
                    ]
                },
                "Buyables": {
                    unlocked() {return (hasUpgrade("le", 45))},
                    content: [
                        ["blank", "15px"],
                        "buyables"
                    ]
                },
            },
        },
        automate() {
            if (hasAchievement('a', 261)) {
                if (layers.le.buyables[11].canAfford()) {
                    layers.le.buyables[11].buy();
                };
            };
            if (hasAchievement('a', 261)) {
                if (layers.le.buyables[12].canAfford()) {
                    layers.le.buyables[12].buy();
                };
            };
            if (hasAchievement('a', 261)) {
                if (layers.le.buyables[13].canAfford()) {
                    layers.le.buyables[13].buy();
                };
            };
            if (hasAchievement('a', 274)) {
                if (layers.le.buyables[21].canAfford()) {
                    layers.le.buyables[21].buy();
                };
            };
        },
        passiveGeneration() {
            if (hasMilestone("dp", 1)) return (hasMilestone("dp", 1)?1:0)
                if (hasAchievement("a", 274)) return (hasAchievement("a", 274)?0.05:0)
            },
        buyables: {
            11: {
                title: "Point Buyable 7: The Leaf Statue",
                unlocked() { return hasUpgrade("le", 45) },
                cost(x) {
                    let exp2 = 1.1
                    if (hasUpgrade('le', 54)) exp2 = 1.05
                    return new Decimal("1e600").mul(Decimal.pow(1000, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    if (hasUpgrade('le', 51)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Mega-Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,12)) + "<br>Effect: Boost Mega-Points and Time Power by x" + format(buyableEffect(this.layer, this.id))
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Mega-Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Mega-Points and Time Power by x" + format(buyableEffect(this.layer, this.id))
                },
                canAfford() {
                    return player.mp.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("1e600")
                    player.mp.points = player.mp.points.sub(this.cost().div(cost))
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {
                    let base1 = new Decimal(2)
                    let base2 = x
                    let expo = new Decimal(1.000)
                    let eff = base1.pow(Decimal.pow(base2, expo))
                    if (hasUpgrade('le',51)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,12)))}
                    else {return base1.pow(getBuyableAmount(this.layer,this.id))}
                    return eff
                },
            },
            12: {
                title: "Point Buyable 8: The Leaf Statue II",
                unlocked() { return hasMilestone("le", 7) },
                cost(x) {
                    let exp2 = 1.2
                    if (hasUpgrade('le', 54)) exp2 = 1.1
                    return new Decimal("1e2900").mul(Decimal.pow(1000, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    if (hasUpgrade('le', 63)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Energy" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,13)) + "<br>Effect: Boost Energy and Light by x" + format(buyableEffect(this.layer, this.id))
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Energy" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Energy and Light by x" + format(buyableEffect(this.layer, this.id))
                },
                canAfford() {
                    return player.e.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("1e2900")
                    player.e.points = player.e.points.sub(this.cost().div(cost))
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {
                    let base1 = new Decimal(10)
                    let base2 = x
                    let expo = new Decimal(1.000)
                    let eff = base1.pow(Decimal.pow(base2, expo))
                    if (hasUpgrade('le',63)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,13)))}
                    else {return base1.pow(getBuyableAmount(this.layer,this.id))}
                    return eff
                },
            },
            13: {
                title: "Point Buyable 9: The Leaf Statue III",
                unlocked() { return hasUpgrade("le", 51) },
                cost(x) {
                    let exp2 = 1.1
                    if (hasUpgrade('le', 54)) exp2 = 1.05
                    return new Decimal("1e13").mul(Decimal.pow(10, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    if (hasMilestone('st', 9)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Leaf Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,21)) + "<br>Effect: Boost Leaf Points by x" + format(buyableEffect(this.layer, this.id))
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Leaf Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Leaf Points by x" + format(buyableEffect(this.layer, this.id))
                },
                canAfford() {
                    return player.le.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("1e13")
                    player.le.points = player.le.points.sub(this.cost().div(cost))
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {
                    let base1 = new Decimal(2)
                    let base2 = x
                    let expo = new Decimal(1.000)
                    let eff = base1.pow(Decimal.pow(base2, expo))
                    if (hasMilestone('st',9)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,21)))}
                    else {return base1.pow(getBuyableAmount(this.layer,this.id))}
                    return eff
                },
            },
            21: {
                title: "Point Buyable 12: The Leaf Statue IV",
                unlocked() { return hasUpgrade("cp", 25) },
                cost(x) {
                    let exp2 = 1.1
                    return new Decimal("e1e4").mul(Decimal.pow(1e10, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Energy" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Mega-Points by x" + format(buyableEffect(this.layer, this.id))
                },
                canAfford() {
                    return player.e.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("e1e4")
                    player.e.points = player.e.points.sub(this.cost().div(cost))
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {
                    let base1 = new Decimal(10)
                    let base2 = x
                    let expo = new Decimal(1.000)
                    let eff = base1.pow(Decimal.pow(base2, expo))
                    return eff
                },
            },
        },
    upgrades: {
        11: {
            title: "The Overpowered Upgrader (LP11)",
            description: "Points massively boosts itself but remove Points-1 to Points-6.",
            cost: new Decimal(1),
            effect() {
                return player.points.add(1).pow("0.125")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                },
    12: { 
        title: "The Sacrifice Worker (LP12)",
                description: "Time Power, Cells and Sacrifice Points are boosted based on Sacrifice Tier.",
                cost: new Decimal(1),
                unlocked() {
                    return hasUpgrade("le", 11)
                },
                    effect() {
                        return player.sa.points.add(1).pow("1")
                    },
                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                },                                                                                                                                                         
            13: { 
                title: "The Energy Worker (LP13)",
                        description: "^1.25 Energy & Light.",
                        cost: new Decimal(2),
                        unlocked() {
                            return hasUpgrade("le", 12)
                        },
                        },
                        14: { 
                            title: "The Sacrifice Worker II (LP14)",
                                    description: "^1.25 Sacrifice Points, Cells and ^1.3 Time Power.",
                                    cost: new Decimal(4),
                                    unlocked() {
                                        return hasUpgrade("le", 13)
                                    },
                                    },
                                    15: { 
                                        title: "The Mega Point Grind (LP15)",
                                                description: "^1.25 Mega-Points.",
                                                cost: new Decimal(4),
                                                unlocked() {
                                                    return hasUpgrade("le", 14)
                                                },
                                                },  
                                                21: { 
                                                    title: "The Leaf Booster (LP21)",
                                                            description: "Sacrifice Points boosts Leaf Point gain at a reduced rate.",
                                                            cost: new Decimal(8),
                                                            unlocked() {
                                                                return hasUpgrade("le", 15)
                                                            },
                                                            effect() {
                                                                return player.scp.points.add(1).pow("0.001")
                                                            },
                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                            }, 
                                                            22: { 
                                                                title: "The Leaf Booster II (LP22)",
                                                                        description: "Cells boosts Leaf Point gain at a very reduced rate.",
                                                                        cost: new Decimal(32),
                                                                        unlocked() {
                                                                            return hasUpgrade("le", 21)
                                                                        },
                                                                        effect() {
                                                                            return player.c.points.add(1).pow("0.001")
                                                                        },
                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                        },    
                                                                        23: { 
                                                                            title: "The Leaf Booster III (LP23)",
                                                                                    description: "Time Power boosts Leaf Point gain at a reduced rate.",
                                                                                    cost: new Decimal(40),
                                                                                    unlocked() {
                                                                                        return hasUpgrade("le", 22)
                                                                                    },
                                                                                    effect() {
                                                                                        return player.tp.points.add(1).pow("0.001")
                                                                                    },
                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                    },     
                                                                                    24: { 
                                                                                        title: "The Leaf Booster IV (LP24)",
                                                                                                description: "Total Leaf Points boosts Sacrifice Point, Time Power, Cells and Mega-Points.",
                                                                                                cost: new Decimal(90),
                                                                                                unlocked() {
                                                                                                    return hasUpgrade("le", 23)
                                                                                                },
                                                                                                effect() {
                                                                                                    return player.le.total.add(1).pow("5")
                                                                                                },
                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                }, 
                                                                                                25: { 
                                                                                                    title: "The Sacrifice Worker III (LP25)",
                                                                                                            description: "Sacrifice Points boosts Cells at a reduced rate.",
                                                                                                            cost: new Decimal(450),
                                                                                                            unlocked() {
                                                                                                                return hasUpgrade("le", 24)
                                                                                                            },
                                                                                                            effect() {
                                                                                                                return player.scp.points.add(1).pow("0.1")
                                                                                                            },
                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                            }, 
                                                                                                            31: { 
                                                                                                                title: "The Sacrifice Worker IV (LP31)",
                                                                                                                        description: "Sacrifice Points boosts Time Power at a reduced rate.",
                                                                                                                        cost: new Decimal(2700),
                                                                                                                        unlocked() {
                                                                                                                            return hasUpgrade("le", 25)
                                                                                                                        },
                                                                                                                        effect() {
                                                                                                                            return player.scp.points.add(1).pow("0.05")
                                                                                                                        },
                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                        },  
                                                                                                                        32: { 
                                                                                                                            title: "The Sacrifice Worker V (LP32)",
                                                                                                                                    description: "Cells boosts Time Power at a reduced rate.",
                                                                                                                                    cost: new Decimal(2700),
                                                                                                                                    unlocked() {
                                                                                                                                        return hasUpgrade("le", 31)
                                                                                                                                    },
                                                                                                                                    effect() {
                                                                                                                                        return player.c.points.add(1).pow("0.25")
                                                                                                                                    },
                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                    },  
                                                                                                                                    33: { 
                                                                                                                                        title: "The Sacrifice Worker VI (LP33)",
                                                                                                                                                description: "Time Power boosts Cells at a reduced rate.",
                                                                                                                                                cost: new Decimal(2700),
                                                                                                                                                unlocked() {
                                                                                                                                                    return hasUpgrade("le", 32)
                                                                                                                                                },
                                                                                                                                                effect() {
                                                                                                                                                    return player.tp.points.add(1).pow("0.25")
                                                                                                                                                },
                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                },     
                                                                                                                                                34: { 
                                                                                                                                                    title: "The Sacrifice Worker VII (LP34)",
                                                                                                                                                            description: "Time Power boosts Sacrifice Points.",
                                                                                                                                                            cost: new Decimal(3e4),
                                                                                                                                                            unlocked() {
                                                                                                                                                                return hasUpgrade("le", 33)
                                                                                                                                                            },
                                                                                                                                                            effect() {
                                                                                                                                                                return player.tp.points.add(1).pow("0.5")
                                                                                                                                                            },
                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                            },
                                                                                                                                                            35: { 
                                                                                                                                                                title: "The Sacrifice Worker VIII (LP35)",
                                                                                                                                                                        description: "Time Power boosts itself.",
                                                                                                                                                                        cost: new Decimal(5e4),
                                                                                                                                                                        unlocked() {
                                                                                                                                                                            return hasUpgrade("le", 34)
                                                                                                                                                                        },
                                                                                                                                                                        effect() {
                                                                                                                                                                            return player.tp.points.add(1).pow("0.03125")
                                                                                                                                                                        },
                                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                        }, 
                                                                                                                                                                        41: { 
                                                                                                                                                                            title: "The Sacrifice Worker IX (LP41)",
                                                                                                                                                                                    description: "Cells boosts itself.",
                                                                                                                                                                                    cost: new Decimal(5e4),
                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                        return hasUpgrade("le", 35)
                                                                                                                                                                                    },
                                                                                                                                                                                    effect() {
                                                                                                                                                                                        return player.c.points.add(1).pow("0.0625")
                                                                                                                                                                                    },
                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                    },
                                                                                                                                                                                    42: { 
                                                                                                                                                                                        title: "The Sacrifice Worker X (LP42)",
                                                                                                                                                                                                description: "Sacrifice Points boosts itself.",
                                                                                                                                                                                                cost: new Decimal(1e5),
                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                    return hasUpgrade("le", 41)
                                                                                                                                                                                                },
                                                                                                                                                                                                effect() {
                                                                                                                                                                                                    return player.scp.points.add(1).pow("0.125")
                                                                                                                                                                                                },
                                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                },   
                                                                                                                                                                                                43: {
                                                                                                                                                                                                    title: "Sacrifice Tier Grinder (LP43)",
                                                                                                                                                                                                      description: "Every Sacrifice Tier you have boosts time power, cells, sacrifice-point and mega-point gain by 2x",
                                                                                                                                                                                                      cost: new Decimal(4e5),
                                                                                                                                                                                                      effect() {
                                                                                                                                                                                                          let effect = Decimal.pow(2, player.sa.points).min("1e2213232113")
                                                                                                                                                                                                          return effect
                                                                                                                                                                                                      },
                                                                                                                                                                                                      effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                      unlocked() {
                                                                                                                                                                                                          return hasUpgrade("le", 42)
                                                                                                                                                                                                      }       
                                                                                                                                                                                                  },   
                                                                                                                                                                                                  44: { 
                                                                                                                                                                                                    title: "The Leaf Point Inflation (LP44)",
                                                                                                                                                                                                            description: "^1.3 Leaf Points.",
                                                                                                                                                                                                            cost: new Decimal(3e6),
                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                return hasUpgrade("le", 43)
                                                                                                                                                                                                            },
                                                                                                                                                                                                            },
                                                                                                                                                                                                            45: { 
                                                                                                                                                                                                                title: "The Leaf Point Upgrader (LP45)",
                                                                                                                                                                                                                        description: "Unlocks a leaf buyable.",
                                                                                                                                                                                                                        cost: new Decimal(5e8),
                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                            return hasUpgrade("le", 44)
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                        }, 
                                                                                                                                                                                                                        51: { 
                                                                                                                                                                                                                            title: "The Leaf Repeatable Booster (LP51)",
                                                                                                                                                                                                                                    description: "LB12 increases LB11 amount and unlocks a new leaf buyable.",
                                                                                                                                                                                                                                    cost: new Decimal(1e17),
                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                        return hasUpgrade("le", 45)
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                    },  
                                                                                                                                                                                                                                    52: { 
                                                                                                                                                                                                                                        title: "Super Tier Divider (LP52)",
                                                                                                                                                                                                                                                description: "Sacrifice Tier divides Super Tier cost and 50x Leafs.",
                                                                                                                                                                                                                                                cost: new Decimal(1e19),
                                                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                                                    return hasUpgrade("le", 51)
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                effect() {
                                                                                                                                                                                                                                                    return player.sa.points.add(1).pow("1")
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                effectDisplay() { return "/" +format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
                                                                                                                                                                                                                                                },  
                                                                                                                                                                                                                                                53: { 
                                                                                                                                                                                                                                                    title: "Buyable Scale (LP53)",
                                                                                                                                                                                                                                                            description: "Decrease the scale of CB13.",
                                                                                                                                                                                                                                                            cost: new Decimal(1e28),
                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                return hasUpgrade("le", 52)
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                            },  
                                                                                                                                                                                                                                                            54: { 
                                                                                                                                                                                                                                                                title: "Buyable Scale II (LP54)",
                                                                                                                                                                                                                                                                        description: "Decrease the scale of LB11 & LB12 and LB13.",
                                                                                                                                                                                                                                                                        cost: new Decimal(1e30),
                                                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                                                            return hasUpgrade("le", 53)
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        },   
                                                                                                                                                                                                                                                                        55: { 
                                                                                                                                                                                                                                                                            title: "Sacrifice Scale (LP55)",
                                                                                                                                                                                                                                                                                    description: "Decrease the scale of Sacrifice Tier & Super Tier.",
                                                                                                                                                                                                                                                                                    cost: new Decimal(1e33),
                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                        return hasUpgrade("le", 54)
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    },                    
                                                                                                                                                                                                                                                                                    61: { 
                                                                                                                                                                                                                                                                                        title: "The Leaf Grinder (LP61)",
                                                                                                                                                                                                                                                                                                description: "Sacrifice Tier boosts Leaf Point.",
                                                                                                                                                                                                                                                                                                cost: new Decimal(1e34),
                                                                                                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                                                                                                    return hasUpgrade("le", 55)
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                                                                        return player.sa.points.add(1).pow("1")
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                }, 
                                                                                                                                                                                                                                                                                                62: { 
                                                                                                                                                                                                                                                                                                    title: "The Charge Composter (LP62)",
                                                                                                                                                                                                                                                                                                            description: "Leaf Points boosts Charge Power.",
                                                                                                                                                                                                                                                                                                            cost: new Decimal(1e45),
                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                return hasUpgrade("le", 61)
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                effect() {
                                                                                                                                                                                                                                                                                                                    return player.le.points.add(1).pow("0.05")
                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                            }, 
                                                                                                                                                                                                                                                                                                            63: { 
                                                                                                                                                                                                                                                                                                                title: "The Leaf Burner (LP63)",
                                                                                                                                                                                                                                                                                                                        description: "LB13 adds free levels to LB12.",
                                                                                                                                                                                                                                                                                                                        cost: new Decimal(1e70),
                                                                                                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                                                                                                            return hasUpgrade("le", 62)
                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                        },  
                                                                                                                                                                                                                                                                                                                        64: { 
                                                                                                                                                                                                                                                                                                                            title: "The Leaf Chain (LP64)",
                                                                                                                                                                                                                                                                                                                                    description: "Charge Power boosts Leaf Points.",
                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e87),
                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("le", 63)
                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                        effect() {
                                                                                                                                                                                                                                                                                                                                            return player.cp.points.add(1).pow("0.05")
                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                    65: { 
                                                                                                                                                                                                                                                                                                                                        title: "The Leaf Chain II (LP65)",
                                                                                                                                                                                                                                                                                                                                                description: "Leaf Points boosts Points.",
                                                                                                                                                                                                                                                                                                                                                cost: new Decimal(1e105),
                                                                                                                                                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                                                                                                                                                    return hasUpgrade("le", 64)
                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                                                                                                                        return player.le.total.add(1).pow("15")
                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                                                                }, 
                                                                                                                                                                                                                                                                                                                                                71: { 
                                                                                                                                                                                                                                                                                                                                                    title: "The Leaf Chain III (LP71)",
                                                                                                                                                                                                                                                                                                                                                            description: "Log(10) Points boosts Leaf Points.",
                                                                                                                                                                                                                                                                                                                                                            cost: new Decimal(1e109),
                                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("le", 65)
                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                                                                                                                                                                return player.points.add(1).log("10")
                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                                                                            }, 
                                                                                                                                                                                                                                                                                                                                                            72: { 
                                                                                                                                                                                                                                                                                                                                                                title: "The Leaf Chain IV (LP72)",
                                                                                                                                                                                                                                                                                                                                                                        description: "Decrease the Super Tier cost scale by even more.",
                                                                                                                                                                                                                                                                                                                                                                        cost: new Decimal(1e135),
                                                                                                                                                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                                                                                                                                                            return hasUpgrade("le", 71)
                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                        },                                                                                            
                                                                                                                                                                                                                                                                                                                                                                        },      
                                                                                                                                                                                                                                                                                                                                                                        73: { 
                                                                                                                                                                                                                                                                                                                                                                            title: "The Charge Upgrader (LP73)",
                                                                                                                                                                                                                                                                                                                                                                                    description: "Charge Power boosts Energy & Light and Cells.",
                                                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal("1e375"),
                                                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("le", 72)
                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                                                                                                                                                        return player.cp.points.add(1).pow("1")
                                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                                                                                                                                    },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                    },
            milestones: {
                1: {
                    requirementDescription() {
                        dis = "[1] 1 Leaf Points"
                        if (hasUpgrade('rp', 44)) dis = dis + " (Charged)"
                        else if (hasUpgrade('cp', 33)) dis = dis + " (Charged)"
                        return dis},
                    effectDescription() {
                        dis = "3x Time Power, 10x Cells and 25x Sacrifice Points."
                        if (hasUpgrade('rp', 44)) dis = dis + "<br>Charge effect: Points is boosted by even more based on time since you charged this milestone. (hardcap at 1h) <br>Time: "+formatTime(player[this.layer].opmtime)+" Currently: " + format(upgradeEffect('rp', 44)) + "x"
                        else if (hasUpgrade('cp', 33)) dis = dis + "<br>Charge effect: 1,000,000,000x Charge Power and Points is boosted based on time since you charged this milestone. (hardcap at 1h) <br>Time: "+formatTime(player[this.layer].opmtime)+" Currently: " + format(upgradeEffect('cp', 33)) + "x"
                        return dis},
                    done() { return player.le.points.gte(1) },
                    style(){if (hasUpgrade('cp', 33)) return{'background-color':'orange'}}
                },
                2: {
                    requirementDescription() {
                        dis = "[2] 2 Total Leaf Points"
                        if (hasUpgrade('cp', 54)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "Gain 100% Mega-Points on reset per second."
                        if (hasUpgrade('cp', 54)) dis = dis + "<br>Charge effect: Sacrifice Points boosts Charge Power.<br>Currently: " + format(upgradeEffect('cp', 54)) + "x"
                        return dis},
                    done() { return player.le.total.gte(2) },
                    style(){if (hasUpgrade('cp', 54)) return{'background-color':'#ffad00'}}
                },
                3: {
                    requirementDescription(){des = "[3] 10 Total Leaf Points"
                        if (hasUpgrade('cp', 63)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "Gain 100% Sacrifice Points & Time Power on reset per second and 3x Leafs."
                    if (hasUpgrade('cp', 63)) des = des + "<br> Charge effect: ^1.01 Leaf Points and ^1.02 Charge Power"
                    return des},
                    done() { return player.le.total.gte(10) },
                    style(){if (hasUpgrade('cp', 63)) return{'background-color':'#ffad00'}}
                },
                4: {
                    requirementDescription(){des = "[4] 100 Total Leaf Points"
                        if (hasUpgrade('cp', 72)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "Autobuy Sacrifice + Time Upgrades, 3x Leafs and the amount of CB12 bought increases the CB11 amount"
                    if (hasUpgrade('cp', 72)) des = des + "<br> Charge effect: ^1.05 Energy, Light and Cells"
                    return des},
                    done() { return player.le.total.gte(100) },
                    style(){if (hasUpgrade('cp', 72)) return{'background-color':'#ffad00'}}
                },
                5: {
                    requirementDescription(){des = "[5] 1,000 Total Leaf Points"
                        if (hasUpgrade('cp', 81)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "You can bulk buy Sacrifice Tiers and 3x Leafs."
                    if (hasUpgrade('cp', 81)) des = des + "<br> Charge effect: ^1.2 Sacrifice Points"
                    return des},
                    done() { return player.le.total.gte(1000) },
                    style(){if (hasUpgrade('cp', 81)) return{'background-color':'#ffad00'}}
                },
                6: {
                    requirementDescription(){des = "[6] 10,000 Total Leaf Points"
                        if (hasUpgrade('cp', 85)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "The amount of CB13 bought increases CB12 amount, 3x Leafs and keep Mega-Point challenges"
                    if (hasUpgrade('cp', 85)) des = des + "<br> Charge effect: ^1.2 Energy"
                    return des},
                    done() { return player.le.total.gte(1e4) },
                    style(){if (hasUpgrade('cp', 85)) return{'background-color':'#ffad00'}}
                },
                7: {
                    requirementDescription(){des = "[7] 1,000,000,000 Total Leaf Points"
                        if (hasUpgrade('dp', 42)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "Keep Sacrifice Milestones & Challenges and unlock another leaf buyable"
                    if (hasUpgrade('dp', 42)) des = des + "<br> Charge effect: ^1.1 Divine Points"
                    return des},
                    done() { return player.le.total.gte(1e9) },
                    style(){if (hasUpgrade('dp', 42)) return{'background-color':'#ffad00'}}
                },
                8: {
                    requirementDescription() {
                        dis = "[8] 1e13 Total Leaf Points"
                        if (hasUpgrade('cp', 94)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "Unlock a new layer."
                        if (hasUpgrade('cp', 94)) dis = dis + "<br>Charge effect: Sacrifice Points boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 94)) + "x"
                        return dis},
                    done() { return player.le.total.gte(1e13) },
                    style(){if (hasUpgrade('cp', 94)) return{'background-color':'#ffad00'}}
                },
    },
    doReset(st) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[st].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        if (hasAchievement('a', 251)) keptUpgrades.push(11);
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        if (hasMilestone('st', 8)) keep.push("milestones");
        if (hasMilestone('dp', 1)) keep.push("milestones");
        if (hasAchievement('a', 293)) keep.push("milestones");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    autoUpgrade() { if (hasAchievement("a" , 261)) return true},
    color: "#66FF00",
    requires: new Decimal("e410"), // Can be a function that takes requirement increases into account
    resource: "Leaf Points", // Name of prestige currency
    baseResource: "Sacrifice Points", // Name of resource prestige is based on
    baseAmount() {return player.scp.points}, // Get the current amount of baseResource
    branches: ["sa"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: "eeeeeeeeeeeeeeee1e-21093", // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('mp', 92)) mult = mult.times(2)
        if (hasUpgrade('mp', 93)) mult = mult.times(2)
        if (hasMilestone('le', 3)) mult = mult.times(2)
        if (hasUpgrade('le', 21)) mult = mult.times(upgradeEffect('le',21))
        if (hasUpgrade('le', 22)) mult = mult.times(upgradeEffect('le',22))
        if (hasUpgrade('le', 23)) mult = mult.times(upgradeEffect('le',23))
        if (hasMilestone('le', 4)) mult = mult.times(3)
        if (hasMilestone('le', 5)) mult = mult.times(3)
        if (hasMilestone('le', 6)) mult = mult.times(3)
        if (hasUpgrade('le', 44)) mult = mult.pow(1.3)
        if (hasUpgrade('e', 73)) mult = mult.times(upgradeEffect('e',73))
        if (hasMilestone('st', 1)) mult = mult.times(10)
        if (hasMilestone('st', 2)) mult = mult.times(10)
        if (hasMilestone('st', 2)) mult = mult.times(5)
        mult = mult.times(buyableEffect('le', 13))
        if (hasUpgrade('le', 52)) mult = mult.times(50)
        if (hasMilestone('st', 4)) mult = mult.times(100)
        if (hasMilestone('st', 5)) mult = mult.times(5)
        if (hasMilestone('st', 6)) mult = mult.times(3)
        if (hasUpgrade('le', 61)) mult = mult.times(upgradeEffect('le',61))
        mult = mult.times(buyableEffect('cp', 12))
        if (hasUpgrade('le', 64)) mult = mult.times(upgradeEffect('le',64))
        if (hasUpgrade('cp', 22)) mult = mult.times(upgradeEffect('cp',22))
        if (hasUpgrade('le', 71)) mult = mult.times(upgradeEffect('le',71))
        if (hasUpgrade('cp', 23)) mult = mult.times(upgradeEffect('cp',23))
        if (hasUpgrade('cp', 25)) mult = mult.times(1e9)
        if (hasUpgrade('cp', 31)) mult = mult.times(upgradeEffect('cp',31))
        if (hasUpgrade('cp', 34)) mult = mult.times(upgradeEffect('cp',34))
        if (hasUpgrade('cp', 41)) mult = mult.times(upgradeEffect('cp',41))
        if (hasUpgrade('dp', 11)) mult = mult.times(1e9)
        if (hasUpgrade('cp', 53)) mult = mult.pow(1.05)
        if (hasUpgrade('cp', 55)) mult = mult.pow(1.01)
        if (hasUpgrade('cp', 62)) mult = mult.times(upgradeEffect('cp',62))
        if (hasUpgrade('cp', 63)) mult = mult.pow(1.01)
        if (hasUpgrade('cp', 64)) mult = mult.times(upgradeEffect('cp',64))
        if (hasUpgrade('cp', 71)) mult = mult.times(upgradeEffect('cp',71))
        if (hasUpgrade('dp', 14)) mult = mult.times(upgradeEffect('dp',14))
        if (hasUpgrade('dp', 22)) mult = mult.times(1e9)
        if (hasUpgrade('cp', 84)) mult = mult.times(1e9)
            if (hasChallenge('dp', 11)) mult = mult.pow(1.02)
                if (hasUpgrade('dp', 43)) mult = mult.pow(1.25)
                                                                                                                                                            if (hasAchievement('a', 293)) mult = mult.times("1e8")
                                                                                                                                                                if (hasUpgrade('rp', 11)) mult = mult.pow(1.05)
                                                                                                                                                                    if (hasUpgrade('rp', 32)) mult = mult.pow(1.1)
                                                                                                                                                                        if (hasUpgrade('rp', 54)) mult = mult.pow(1.1)
                                                                                                                                                                            if (inChallenge("rp", 12)) mult = mult.div("10^^308")
                                                                                                                                                                                if (hasChallenge('rp', 12)) mult = mult.pow(1.05)
                                                                                                                                                                                    if (hasUpgrade('rp', 75)) mult = mult.pow(1.05)
                                                                                                                                                                                        if (hasUpgrade('rp', 82)) mult = mult.pow(1.1)
                                                                                                                                                                            return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for Leaf", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasMilestone("sa", 26) || player[this.layer].unlocked)},
})
