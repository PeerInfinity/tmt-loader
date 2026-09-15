addLayer("cp2", {
    name: "Super Charge Power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SCP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { 
        return {
            unlocked: true,
		    points: new Decimal(0),
        }
    },
    tabFormat: [
        "main-display",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Super Charge</h3><br>" + format(player.cp2.points) + " SCP"
      },
    microtabs: {
        stuff: {
                        "Milestones": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">This layer is similar to Charge Power.<br>1e30 Rebirth Points to start gaining Super Charge Power.</h4>`],
                        "milestones"
                    ],
                },

                "Buyables": {
                unlocked() {return (hasMilestone("cp2", 1))},
                        content: [
                    ["blank", "15px"],
                    "buyables"
                        ]
        },
    },
        },
    layerShown(){
        let visible = false
        if ((hasUpgrade('rp', 52)) || (hasAchievement("a", 321))) visible = true
       return visible
    },
    passiveGeneration() {
        if (hasMilestone('cp2', 1)) return 0.01
        return 0
    },
    milestones: {
    1: {
        requirementDescription: "[1] 1e30 Rebirth Points",
        effectDescription: "Start generating Super Charge Power.",
        done() { return player.rp.points.gte("1e30") }
    },
    2: {
        requirementDescription: "[2] 1 Super Charge Power",
        effectDescription: "25x Super Charge Power.",
        done() { return player.cp2.points.gte("1") }
    },
    3: {
        requirementDescription: "[3] 10 Super Charge Power",
        effectDescription: "15x Super Charge Power.",
        done() { return player.cp2.points.gte("10") }
    },
    4: {
        requirementDescription: "[4] 100 Super Charge Power",
        effectDescription: "^1.3 Super Charge Power.",
        done() { return player.cp2.points.gte("100") }
    },
    5: {
        requirementDescription: "[5] 5,000 Super Charge Power",
        effect() {
            let eff = player.points.add(1).log(10).log(10)
            return eff
        },
        effectDescription() {
            return "Points Boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",5))+"x"}
            ,    done() { return player.cp2.points.gte("5e3")}
            
        },
        6: {
            requirementDescription: "[6] 25,000 Super Charge Power",
            effect() {
                let eff = player.cp.points.max(1).log("1e1000")
                return eff
            },
            effectDescription() {
                return "Charge Power Boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",6))+"x"}
                ,    done() { return player.cp2.points.gte("2.5e4")}
                
            },
            7: {
                requirementDescription: "[7] 300,000 Super Charge Power",
                effect() {
                    let eff = player.cp2.points.add(1).pow(0.04)
                    return eff
                },
                effectDescription() {
                    return "Super Charge Power boosts itself.<br>Currently: " + format(milestoneEffect("cp2",7))+"x"}
                    ,    done() { return player.cp2.points.gte("3e5")}
                    
                },
                8: {
                    requirementDescription: "[8] 1,000,000 Super Charge Power",
                    effect() {
                        let eff = player.rp.points.add(1).pow(0.04)
                        return eff
                    },
                    effectDescription() {
                        return "Rebirth Points boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",8))+"x"}
                        ,    done() { return player.cp2.points.gte("1e6")}
                        
                    },
                    9: {
                        requirementDescription: "[9] 10,000,000 Super Charge Power",
                        effect() {
                            let eff = player.st.points.add(1).pow(1)
                            return eff
                        },
                        effectDescription() {
                            return "Super Tier boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",9))+"x"}
                            ,    done() { return player.cp2.points.gte("1e7")}
                            
                        },
                        10: {
                            requirementDescription: "[10] 5,000,000,000 Super Charge Power",
                            effect() {
                                let eff = player.sa.points.add(1).pow(0.5)
                                return eff
                            },
                            effectDescription() {
                                return "Sacrifice Tier boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",10))+"x"}
                                ,    done() { return player.cp2.points.gte("5e9")}
                                
                            },
                            11: {
                                requirementDescription: "[11] 2e12 Super Charge Power",
                                effect() {
                                    let eff = player.sa.points.add(1).pow(0.5)
                                    return eff
                                },
                                effectDescription() {
                                    return "Sacrifice Tier boosts Super Charge Power by even more.<br>Currently: " + format(milestoneEffect("cp2",11))+"x"}
                                    ,    done() { return player.cp2.points.gte("2e12")}
                                    
                                },
                                12: {
                                    requirementDescription: "[12] 1e15 Super Charge Power",
                                    effectDescription: "Unlocks more charge power upgrades.",
                                    done() { return player.cp2.points.gte("1e15") }
                                },
                                13: {
                                    requirementDescription: "[13] 1e76 Super Charge Power",
                                    effectDescription: "SCPB11 scale slower.",
                                    done() { return player.cp2.points.gte("1e76") }
                                },
                                14: {
                                    requirementDescription: "[14] 1e78 Super Charge Power",
                                    effectDescription: "SCPB12 scale slower.",
                                    done() { return player.cp2.points.gte("1e78") }
                                },
                                15: {
                                    requirementDescription: "[15] 2e78 Super Charge Power",
                                    effectDescription: "SCPB11 scale slower by even more.",
                                    done() { return player.cp2.points.gte("2e78") }
                                },
                                16: {
                                    requirementDescription: "[16] 5e125 Super Charge Power",
                                    effect() {
                                        let eff = player.cp2.points.add(1).pow(0.03)
                                        return eff
                                    },
                                    effectDescription() {
                                        return "Super Charge Power boosts itself by even more.<br>Currently: " + format(milestoneEffect("cp2",16))+"x"}
                                        ,    done() { return player.cp2.points.gte("5e125")}
                                        
                                    },
                                    17: {
                                        requirementDescription: "[17] 1e131 Super Charge Power",
                                        effect() {
                                            let eff = player.sp.points.max(1).log(10)
                                            return eff
                                        },
                                        effectDescription() {
                                            return "Super-Points boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",17))+"x"}
                                            ,    done() { return player.cp2.points.gte("1e131")}
                                            
                                        },
                                        18: {
                                            requirementDescription: "[18] 1e139 Super Charge Power",
                                            effect() {
                                                let eff = player.p.points.max(1).log(10)
                                                return eff
                                            },
                                            effectDescription() {
                                                return "Prestige Points boosts Super Charge Power.<br>Currently: " + format(milestoneEffect("cp2",18))+"x"}
                                                ,    done() { return player.cp2.points.gte("1e139")}
                                                
                                            },
                                            19: {
                                                requirementDescription: "[19] 5e147 Super Charge Power",
                                                effect() {
                                                    let eff = player.points.max(1).log(10)
                                                    return eff
                                                },
                                                effectDescription() {
                                                    return "Points boosts Super Charge Power by even more.<br>Currently: " + format(milestoneEffect("cp2",19))+"x"}
                                                    ,    done() { return player.cp2.points.gte("5e147")}
                                                    
                                                },
                                                20: {
                                                    requirementDescription: "[20] 1e262 Super Charge Power",
                                                    effectDescription: "10,000,000,000x Super Charge Power.",
                                                    done() { return player.cp2.points.gte("1e262") }
                                                },
                                                21: {
                                                    requirementDescription: "[21] 1e272 Super Charge Power",
                                                    effectDescription: "1e12x Super Charge Power.",
                                                    done() { return player.cp2.points.gte("1e272") }
                                                },
                                                22: {
                                                    requirementDescription: "[22] 5e285 Super Charge Power",
                                                    effectDescription: "SCPB12 adds free levels to SCPB11.",
                                                    done() { return player.cp2.points.gte("5e285") }
                                                },
                                                23: {
                                                    requirementDescription: "[23] 1e300 Super Charge Power",
                                                    effectDescription: "100,000,000x Super Charge Power and unlock a new layer.",
                                                    done() { return player.cp2.points.gte("1e300") }
                                                },
                                                24: {
                                                    requirementDescription: "[24] 1.80e308 Super Charge Power",
                                                    effectDescription: "Start generating Super Energy.",
                                                    done() { return player.cp2.points.gte("1.80e308") }
                                                },
},
    color: "#dce1df",
    requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
    resource: "Super Charge Power", // Name of currency
    baseResource: "Rebirth Points", // Name of resource prestige is based on
    baseAmount() {return player.rp.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: "eeeeeeeeeeeeeeeee1e-308",  // Balance is needed. 
            buyables: {
            11: {
                title: "Point Buyable 18: Rebirth Doubler",
                unlocked() { return hasMilestone("cp2", 1) },
                cost(x) {
                    let exp2 = 1.125
                    if (hasMilestone('cp2', 13)) exp2 = 1.1
                    if (hasMilestone('cp2', 15)) exp2 = 1.05
                    return new Decimal("1").mul(Decimal.pow(10, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    if (hasMilestone('cp2', 22)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Super Charge Power" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,12)) + "<br>Effect: Boost Rebirth Points by x" + format(buyableEffect(this.layer, this.id))                    
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Super Charge Power" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Rebirth Points by x" + format(buyableEffect(this.layer, this.id))                },
                canAfford() {
                    return player.cp2.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("1")
                    player.cp2.points = player.cp2.points.sub(this.cost().div(cost))
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {
                    let base1 = new Decimal(2)
                    let base2 = x
                    let expo = new Decimal(1.000)
                    let eff = base1.pow(Decimal.pow(base2, expo))
                    if (hasMilestone('cp2',22)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,12)))}
                    else {return base1.pow(getBuyableAmount(this.layer,this.id))}
                    return eff
                },
            },
            12: {
                title: "Point Buyable 19: Divine Tenfold",
                unlocked() { return hasMilestone("cp2", 1) },
                cost(x) {
                    let exp2 = 1.1
                    if (hasMilestone('cp2', 14)) exp2 = 1.05
                    return new Decimal("1").mul(Decimal.pow(5, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
                },
                display() {
                    return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Super Charge Power" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Divine Points by x" + format(buyableEffect(this.layer, this.id))                },
                canAfford() {
                    return player.cp2.points.gte(this.cost())
                },
                buy() {
                    let cost = new Decimal ("1")
                    player.cp2.points = player.cp2.points.sub(this.cost().div(cost))
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
    gainMult() { // Prestige multiplier
        let mult = new Decimal(1)
        if (hasMilestone('cp2', 2)) mult = mult.times(25)
            if (hasMilestone('cp2', 3)) mult = mult.times(15)
                if (hasMilestone('cp2', 4)) mult = mult.pow(1.3)
                    if (hasMilestone('cp2', 5)) mult = mult.times(milestoneEffect('cp2', 5))
                        if (hasMilestone('cp2', 6)) mult = mult.times(milestoneEffect('cp2', 6))
                            if (hasMilestone('cp2', 7)) mult = mult.times(milestoneEffect('cp2', 7))
                                if (hasMilestone('cp2', 8)) mult = mult.times(milestoneEffect('cp2', 8))                                
                                    if (hasMilestone('cp2', 9)) mult = mult.times(milestoneEffect('cp2', 9))
                                        if (hasMilestone('cp2', 10)) mult = mult.times(milestoneEffect('cp2', 10))
                                            if (hasMilestone('cp2', 11)) mult = mult.times(milestoneEffect('cp2', 11))
                                                if (hasUpgrade('cp', 92)) mult = mult.times(upgradeEffect('cp', 92))
                                                    if (hasUpgrade('cp', 93)) mult = mult.times(upgradeEffect('cp', 93))
                                                        if (hasUpgrade('cp', 94)) mult = mult.times(upgradeEffect('cp', 94))
                                                            if (hasUpgrade('cp', 95)) mult = mult.times(upgradeEffect('cp', 95))
                                                                if (hasUpgrade('cp', 101)) mult = mult.times(upgradeEffect('cp', 101))
                                                                    if (hasUpgrade('cp', 102)) mult = mult.times(upgradeEffect('cp', 102))
                                                                        if (hasUpgrade('cp', 103)) mult = mult.times(upgradeEffect('cp', 103))
                                                                            if (hasUpgrade('rp', 53)) mult = mult.pow(1.3)
                                                                                if (hasUpgrade('rp', 55)) mult = mult.times(upgradeEffect('rp', 55))
                                                                                    if (hasUpgrade('rp', 61)) mult = mult.times(upgradeEffect('rp', 61))
                                                                                        if (hasUpgrade('rp', 62)) mult = mult.times(upgradeEffect('rp', 62))
                                                                                            if (hasUpgrade('rp', 63)) mult = mult.times(7.5e22)
                                                                                                if (hasMilestone('cp2', 16)) mult = mult.times(milestoneEffect('cp2', 16))
                                                                                                    if (hasMilestone('cp2', 17)) mult = mult.times(milestoneEffect('cp2', 17))
                                                                                                        if (hasMilestone('cp2', 18)) mult = mult.times(milestoneEffect('cp2', 18))
                                                                                                            if (hasMilestone('cp2', 19)) mult = mult.times(milestoneEffect('cp2', 19))
                                                                                                                if (hasUpgrade('rp', 65)) mult = mult.pow(1.15)
                                                                                                                    if (hasChallenge('rp', 11)) mult = mult.times(1e9)
                                                                                                                        if (hasChallenge('rp', 12)) mult = mult.times(1e9)
                                                                                                                            if (hasUpgrade('rp', 72)) mult = mult.times(1e33)
                                                                                                                                if (hasUpgrade('rp', 74)) mult = mult.times(upgradeEffect('rp', 74))
                                                                                                                                    if (hasMilestone('cp2', 20)) mult = mult.times(1e10)
                                                                                                                                        if (hasMilestone('cp2', 21)) mult = mult.times(1e12)
                                                                                                                                            if (hasUpgrade('rp', 81)) mult = mult.times(2000)
                                                                                                                                                if (hasMilestone('cp2', 23)) mult = mult.times(1e8)
                                                                                                                                                    if (hasUpgrade('se', 12)) mult = mult.times(upgradeEffect('se',12))
                                                                                                                                                        if (hasUpgrade('rp', 83)) mult = mult.times(1e33)
                                                                                                                                                            if (hasUpgrade('rp', 94)) mult = mult.times(upgradeEffect('rp',94))
                                                                                                                                                            return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    branches: ["rp"],
    row: 9, // Row the layer is in on the tree (0 is the first row)
    displayRow: 8, // Row the layer is in on the tree (0 is the first row)
})