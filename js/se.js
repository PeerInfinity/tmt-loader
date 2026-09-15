addLayer("se", {
    name: "Super Energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { 
        return {
            unlocked: true,
		    points: new Decimal(0),
        }
    },
    effect(){
        let e = player[this.layer].total.max("1").pow("25")
        if(e.gt("e1e6")){
            if(hasAchievement("a",2265))e=e.log10().pow(1350).min("ee6")
        }
        return e
      },
      effectDescription(){

},
effectDescription(){
    let s =  "boosting energy gain by x" + format(tmp[this.layer].effect) 
    if(this.effect().gt("1e1239183123")){s=s+" (hardcapped)"}
    else if(this.effect().gt("1e1231234141314")){s=s+" (softcapped)"}
    return s
    /*
      use format(num) whenever displaying a number
    */
   
  },
    tabFormat: [
        "main-display",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    microtabs: {
    stuff: {
        "Upgrades": {
            unlocked() {return (hasAchievement("a", 11))},
    content: [
        ["blank", "15px"],
        ["raw-html", () => `<h4 style="opacity:.5">Very similar to Energy.<br> 1.80e308 Super Charge Power to start gaining Super Energy.</h4>`],
        ["upgrades", [1,2,3,4,5,6,7,8,9,10]]
    ],
    },
},
    },
    tooltip(){
        return "<h3>Super Energy</h3><br>" + format(player.se.points) + " SE"
      },
    layerShown(){
        let visible = false
        if ((hasMilestone('cp2', 23)) || (hasAchievement("a", 345))) visible = true
       return visible
    },
    passiveGeneration() {
        if (hasMilestone('cp2', 24)) return 1
        return 0
    },
    upgrades: {
        11: {
            title: "Back with lights (SEP11)",
            description: "Super Energy boosts Rebirth Points.",
            cost: new Decimal(10),
        effect() {
            return player.se.points.add(1).pow("0.25")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: { 
        title: "Energy is useful again? (SEP12)",
                description: "Super Energy boosts Super Charge Power.",
                cost: new Decimal(25),
                unlocked() {
                    return hasUpgrade("se", 11)
                },
                    effect() {
                        return player.se.points.add(1).pow("0.25")
                    },
                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                }, 
                13: { 
                    title: "Energy is useful again II? (SEP13)",
                            description: "Rebirth Points boosts Super Energy.",
                            cost: new Decimal(100),
                            unlocked() {
                                return hasUpgrade("se", 12)
                            },
                                effect() {
                                    return player.rp.points.add(1).pow("0.0075")
                                },
                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                            }, 
                            14: { 
                                title: "Energy is useful again III? (SEP14)",
                                        description: "Super Charge Power boosts Super Energy.",
                                        cost: new Decimal(1e3),
                                        unlocked() {
                                            return hasUpgrade("se", 13)
                                        },
                                            effect() {
                                                return player.cp2.points.add(1).pow("0.0075")
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                        }, 
                                        15: { 
                                            title: "Energy is useful again IV? (SEP15)",
                                                    description: "^1.3 Super Energy.",
                                                    cost: new Decimal(5e5),
                                                    unlocked() {
                                                        return hasUpgrade("se", 14)
                                                    },
                                                    }, 
                                                    21: { 
                                                        title: "Energy is useful again V? (SEP21)",
                                                                description: "10,000x Super Energy.",
                                                                cost: new Decimal(5e6),
                                                                unlocked() {
                                                                    return hasUpgrade("se", 15)
                                                                },
                                                                },
                                                                22: { 
                                                                    title: "Energy is useful again V? (SEP22)",
                                                                            description: "10,000x Super Energy again.",
                                                                            cost: new Decimal(2.5e11),
                                                                            unlocked() {
                                                                                return hasUpgrade("se", 21)
                                                                            },
                                                                            },
                                                                            23: { 
                                                                                title: "Energy is useful again VI? (SEP23)",
                                                                                        description: "10,000,000x Super Energy.",
                                                                                        cost: new Decimal(1e17),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("se", 22)
                                                                                        },
                                                                                        },
                                                                                        24: { 
                                                                                            title: "Energy is useful again VII? (SEP24)",
                                                                                                    description: "100,000,000x Super Energy.",
                                                                                                    cost: new Decimal(2e26),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("se", 23)
                                                                                                    },
                                                                                                    },
                                                                                                    25: { 
                                                                                                        title: "Energy is useful again VIII? (SEP25)",
                                                                                                                description: "1,000,000,000x Super Energy.",
                                                                                                                cost: new Decimal(5e36),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("se", 24)
                                                                                                                },
                                                                                                                },
                                                                                                                31: { 
                                                                                                                    title: "Energy is useful again IX? (SEP31)",
                                                                                                                            description: "Energy boosts Super Energy.",
                                                                                                                            cost: new Decimal(1e49),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("se", 25)
                                                                                                                            },
                                                                                                                                effect() {
                                                                                                                                    return player.e.points.add(1).log("10")
                                                                                                                                },
                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                            },
                                                                                                                            32: { 
                                                                                                                                title: "Energy is useful again X? (SEP32)",
                                                                                                                                        description: "Rebirth Power boosts Super Energy.",
                                                                                                                                        cost: new Decimal(3e66),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("se", 31)
                                                                                                                                        },
                                                                                                                                            effect() {
                                                                                                                                                return player.rp.power.add(1).pow("0.0075")
                                                                                                                                            },
                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                        },
                                                                                                                                        33: { 
                                                                                                                                            title: "Energy is useful again XI? (SEP33)",
                                                                                                                                                    description: "Points boosts Super Energy.",
                                                                                                                                                    cost: new Decimal(1e75),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("se", 32)
                                                                                                                                                    },
                                                                                                                                                        effect() {
                                                                                                                                                            return player.points.add(1).log("10")
                                                                                                                                                        },
                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                    },
                                                                                                                                                    34: { 
                                                                                                                                                        title: "Energy Fuel (SEP34)",
                                                                                                                                                                description: "Super Points boosts Super Energy.",
                                                                                                                                                                cost: new Decimal(1e87),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("se", 33)
                                                                                                                                                                },
                                                                                                                                                                    effect() {
                                                                                                                                                                        return player.sp.points.add(1).log("10")
                                                                                                                                                                    },
                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                },
                                                                                                                                                                35: { 
                                                                                                                                                                    title: "Energy Fuel II (SEP35)",
                                                                                                                                                                            description: "Ultra Points boosts Super Energy.",
                                                                                                                                                                            cost: new Decimal(1e99),
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("se", 34)
                                                                                                                                                                            },
                                                                                                                                                                                effect() {
                                                                                                                                                                                    return player.up.points.add(1).log("10")
                                                                                                                                                                                },
                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                            },
                                                                                                                                                                            41: { 
                                                                                                                                                                                title: "Energy Fuel III (SEP41)",
                                                                                                                                                                                        description: "Hyper Points boosts Super Energy.",
                                                                                                                                                                                        cost: new Decimal(1e111),
                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                            return hasUpgrade("se", 35)
                                                                                                                                                                                        },
                                                                                                                                                                                            effect() {
                                                                                                                                                                                                return player.hp.points.add(1).log("10")
                                                                                                                                                                                            },
                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                        },
                                                                                                                                                                                        42: { 
                                                                                                                                                                                            title: "Energy Fuel IV (SEP42)",
                                                                                                                                                                                                    description: "Mega Points boosts Super Energy.",
                                                                                                                                                                                                    cost: new Decimal(1e132),
                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                        return hasUpgrade("se", 41)
                                                                                                                                                                                                    },
                                                                                                                                                                                                        effect() {
                                                                                                                                                                                                            return player.mp.points.add(1).log("10")
                                                                                                                                                                                                        },
                                                                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                    },
                                                                                                                                                                                                    43: { 
                                                                                                                                                                                                        title: "Energy Fuel V (SEP43)",
                                                                                                                                                                                                                description: "Sacrifice Tier boosts Super Energy.",
                                                                                                                                                                                                                cost: new Decimal(5e146),
                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                    return hasUpgrade("se", 42)
                                                                                                                                                                                                                },
                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                        return player.sa.points.add(1)
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                },
                                                                                                                                                                                                                44: { 
                                                                                                                                                                                                                    title: "Energy Fuel VI (SEP44)",
                                                                                                                                                                                                                            description: "Sacrifice Points boosts Super Energy.",
                                                                                                                                                                                                                            cost: new Decimal(1e153),
                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                return hasUpgrade("se", 43)
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                effect() {
                                                                                                                                                                                                                                    return player.scp.points.add(1).log(10)
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            45: { 
                                                                                                                                                                                                                                title: "Energy Fuel VII (SEP45)",
                                                                                                                                                                                                                                        description: "Leaf Points boosts Super Energy.",
                                                                                                                                                                                                                                        cost: new Decimal(5e164),
                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                            return hasUpgrade("se", 44)
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                                                return player.le.points.add(1).log(10)
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        51: { 
                                                                                                                                                                                                                                            title: "Energy Fuel VIII (SEP51)",
                                                                                                                                                                                                                                                    description: "Super Tier boosts Super Energy and unlock a new layer (Next update)",
                                                                                                                                                                                                                                                    cost: new Decimal(1e172),
                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                        return hasUpgrade("se", 45)
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                        effect() {
                                                                                                                                                                                                                                                            return player.st.points.add(1)
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                    },
            },
    color: "#9B870C",
    requires: new Decimal("1.80e308"), // Can be a function that takes requirement increases into account
    resource: "Super Energy", // Name of currency
    baseResource: "Super Charge Power", // Name of resource prestige is based on
    baseAmount() {return player.cp2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: "0.04",  // Balance is needed. 
    gainMult() { // Prestige multiplier
        let mult = new Decimal(1)
        if (hasUpgrade('se', 13)) mult = mult.times(upgradeEffect('se',13))
            if (hasUpgrade('se', 14)) mult = mult.times(upgradeEffect('se',14))
                if (hasUpgrade('se', 21)) mult = mult.times(10000)
                    if (hasUpgrade('se', 22)) mult = mult.times(10000)
                        if (hasUpgrade('se', 23)) mult = mult.times(1e7)
                            if (hasUpgrade('se', 24)) mult = mult.times(1e8)
                                if (hasUpgrade('se', 25)) mult = mult.times(1e9)
                                    if (hasUpgrade('se', 31)) mult = mult.times(upgradeEffect('se',31))
                                        if (hasUpgrade('se', 32)) mult = mult.times(upgradeEffect('se',32))
                                            if (hasUpgrade('se', 33)) mult = mult.times(upgradeEffect('se',33))
                                                if (hasUpgrade('se', 34)) mult = mult.times(upgradeEffect('se',34))
                                                    if (hasUpgrade('se', 35)) mult = mult.times(upgradeEffect('se',35))
                                                        if (hasUpgrade('se', 41)) mult = mult.times(upgradeEffect('se',41))
                                                            if (hasUpgrade('rp', 94)) mult = mult.times(upgradeEffect('rp',94))
                                                                if (hasUpgrade('se', 42)) mult = mult.times(upgradeEffect('se',42))
                                                                    if (hasUpgrade('se', 43)) mult = mult.times(upgradeEffect('se',43))
                                                                        if (hasUpgrade('se', 44)) mult = mult.times(upgradeEffect('se',44))
                                                                            if (hasUpgrade('se', 45)) mult = mult.times(upgradeEffect('se',45))
                                                                                if (hasUpgrade('se', 51)) mult = mult.times(upgradeEffect('se',51))
                                                                                return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade('se', 15)) exp = exp.times(1.3)
        return exp
    },
    branches: ["rp", "cp"],
    row: 9, // Row the layer is in on the tree (0 is the first row)
    displayRow: 8, // Row the layer is in on the tree (0 is the first row)
})