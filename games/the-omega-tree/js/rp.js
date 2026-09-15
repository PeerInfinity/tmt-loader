addLayer("rp", {
    name: "rebirth-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "RP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: new Decimal(0),
        auto: false,
    }},
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Rebirth</h3><br>" + format(player.rp.points) + " RP"
      },
      passiveGeneration() {
        if (hasAchievement("a", 341123)) return (hasAchievement("a", 342131)?1:0)
            if (hasAchievement("a", 341)) return (hasAchievement("a", 341)?0.05:0)
        },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Rebirth Points, it will reset everything except Achievements, you are getting really far and OP.</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ],
                },
                "Milestones": {
                    content: [
                        ["blank", "15px"],
                        "milestones"
                    ]
                },
            "Clicker": {
                unlocked() {return hasUpgrade('rp', 13)},
                content: [
                    ["blank", "15px"],
                    ["display-text", () => "You have <h2 style='color: #ffc0cb; text-shadow: 0 0 10px #ffc0cb'>" + format(player.rp.power) + "</h2> Rebirth Power, multiplying Divine Points gain by <h2 style='color: #BED8E6; text-shadow: 0 0 10px #AED8E6'> <br>" + format(player.rp.power.max(1).pow(0.3333333333333333333333333333333333)) + "x</h2>. (Before the exponentional calculation)"],
                    ["raw-html", () => `<h4 style="opacity:.5">Rebirth Power Gain is based on Rebirth Points.</h4>`],
                    "clickables",
                    "buyables",
                ]    
            },
            "Challenges": {
                unlocked() {return (hasUpgrade("rp", 71))},
        content: [
            ["blank", "15px"],
            ["challenges", [1]]
            
        ]
    },
},
    },
        clickables: {
            11: {
                title: "Increase your Rebirth Strength",
                display() {
                    let clickRP = new Decimal(1)
                    clickRP = clickRP.times(buyableEffect('rp', 11))
                    clickRP = clickRP.times(upgradeEffect('rp', 14))
                    clickRP = clickRP.times(buyableEffect('rp', 12))
                    clickRP = clickRP.pow(buyableEffect('rp', 13))
                    if (hasUpgrade('rp', 91)) clickRP = clickRP.pow(1.3)
                        if (hasUpgrade('rp', 92)) clickRP = clickRP.times(upgradeEffect('rp',92))
                                                    if (hasUpgrade('rp', 93)) clickRP = clickRP.times(upgradeEffect('rp',93))
                                                        if (hasUpgrade('rp', 94)) clickRP = clickRP.times(upgradeEffect('rp',94))
                                                        return "Click this button to gain " + format(clickRP) + " Rebirth Power"},
                canClick() {return true},
                onClick() {
                    let clickRP = new Decimal(1)
                    clickRP = clickRP.times(buyableEffect('rp', 11))
                    clickRP = clickRP.times(upgradeEffect('rp', 14))
                    clickRP = clickRP.times(buyableEffect('rp', 12))
                    clickRP = clickRP.pow(buyableEffect('rp', 13))
                    if (hasUpgrade('rp', 91)) clickRP = clickRP.pow(1.3)
                        if (hasUpgrade('rp', 92)) clickRP = clickRP.times(upgradeEffect('rp',92))
                            if (hasUpgrade('rp', 93)) clickRP = clickRP.times(upgradeEffect('rp',93))
                                if (hasUpgrade('rp', 94)) clickRP = clickRP.times(upgradeEffect('rp',94))
                    return  player.rp.power = player.rp.power.add(clickRP)
                },
                style: {'background-color':'#ffc0cb'},
            },
        },
        update(multRP) {     
            multRP = new Decimal(1)
            multRP = multRP.times(buyableEffect('rp', 11))
            multRP = multRP.times(buyableEffect('rp', 12))
            multRP = multRP.times(upgradeEffect('rp', 14))
            multRP = multRP.pow(buyableEffect('rp', 13))
            if (hasUpgrade('rp', 91)) multRP = multRP.pow(1.3)
                if (hasUpgrade('rp', 92)) multRP = multRP.times(upgradeEffect('rp',92))
                    if (hasUpgrade('rp', 93)) multRP = multRP.times(upgradeEffect('rp',93))
                        if (hasUpgrade('rp', 94)) multRP = multRP.times(upgradeEffect('rp',94))
            if (hasAchievement('a', 343)) player.rp.power = player.rp.power.add(multRP)
            },
    upgrades: {
        11: {
            title: "Rebirth Evolution (RP11)",
            description: "Cube Energy Gain but remove Light, 20x Divine Points & Divine Perks and ^1.05 Charge Power & Leaf Points",
            cost: new Decimal(1),
                },
    12: { 
        title: "Rebirth Evolution II (RP12)",
                description: "^4 Sacrifice Points Gain but remove Cells, Time Power and Sacrifice Tier scaling is decreased",
                cost: new Decimal(1),
                unlocked() {
                    return hasUpgrade("rp", 11)
                
                }
                },
                13: { 
                    title: "Rebirth Upgrader (RP13)",
                            description: "Unlock a new sub-tab",
                            cost: new Decimal(1),
                            unlocked() {
                                return hasUpgrade("rp", 12)
                            
                            }
                            },
                            14: { 
                                title: "Rebirth Evolution III (RP14)",
                                        description: "1.5x Rebirth Points",
                                        cost: new Decimal(2),
                                        unlocked() {
                                            return hasMilestone("rp", 2)
                                        
                                        },
                                        effect() {
                                            return player.rp.total.add(1).pow("0.5")
                                        },
                                    },
                                        15: { 
                                            title: "Rebirth Evolution IV (RP15)",
                                                    description: "Rebirth Power boosts Rebirth Points.",
                                                    cost: new Decimal(2),
                                                    unlocked() {
                                                        return hasUpgrade("rp", 14)
                                                    
                                                    },
                                                    effect() {
                                                        return player.rp.power.max(1).pow("0.0625")
                                                    },
                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                },
                                                    21: { 
                                                        title: "Rebirth Evolution V (RP21)",
                                                                description: "Rebirth Points boosts Divine Points.",
                                                                cost: new Decimal(50),
                                                                unlocked() {
                                                                    return hasUpgrade("rp", 15)
                                                                
                                                                },
                                                                effect() {
                                                                    return player.rp.total.max(1).pow("15")
                                                                },
                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                },
                                                                22: { 
                                                                    title: "Rebirth Upgrader II (RP22)",
                                                                            description: "10x Rebirth Points",
                                                                            cost: new Decimal(100),
                                                                            unlocked() {
                                                                                return hasUpgrade("rp", 21)
                                                                            
                                                                            }
                                                                            },
                                                                            23: { 
                                                                                title: "Rebirth Evolution VI (RP23)",
                                                                                        description: "Rebirth Power boosts Divine Perks.",
                                                                                        cost: new Decimal(1e3),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("rp", 22)
                                                                                        
                                                                                        },
                                                                                        effect() {
                                                                                            return player.rp.power.max(1).pow("1")
                                                                                        },
                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                        },
                                                                                        24: { 
                                                                                            title: "Rebirth Upgrader III (RP24)",
                                                                                                    description: "^1.3 Rebirth Points",
                                                                                                    cost: new Decimal(2e6),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("rp", 23)
                                                                                                    
                                                                                                    },
                                                                                                    },
                                                                                                    25: { 
                                                                                                        title: "Rebirth Point Explosion (RP25)",
                                                                                                                description: "^1.2 Points",
                                                                                                                cost: new Decimal(7.5e7),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("rp", 24)
                                                                                                                
                                                                                                                },
                                                                                                                },
                                                                                                                31: { 
                                                                                                                    title: "Rebirth Upgrader IV (RP31)",
                                                                                                                            description: "Rebirth Points boosts itself.",
                                                                                                                            cost: new Decimal(1e8),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("rp", 25)
                                                                                                                            
                                                                                                                            },
                                                                                                                            effect() {
                                                                                                                                return player.rp.total.max(1).pow("0.0769")
                                                                                                                            },
                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                            },
                                                                                                                            32: { 
                                                                                                                                title: "Rebirth Point Explosion II (RP32)",
                                                                                                                                        description: "^1.1 Leaf Points",
                                                                                                                                        cost: new Decimal(5e8),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("rp", 31)
                                                                                                                                        
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                    33: { 
                                                                                                                                        title: "Rebirth Upgrader V (RP33)",
                                                                                                                                                description: "Decrease Super Tier scaling and Super Tier boosts Rebirth Points",
                                                                                                                                                cost: new Decimal(1e12),
                                                                                                                                                unlocked() {
                                                                                                                                                    return hasUpgrade("rp", 32)
                                                                                                                                                
                                                                                                                                                },
                                                                                                                                                effect() {
                                                                                                                                                    return player.st.points.max(1).pow("1")
                                                                                                                                                },
                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                                            },
                                                                                                                                            34: { 
                                                                                                                                                title: "Rebirth Upgrader VI (RP34)",
                                                                                                                                                        description: "Sacrifice Tier boosts Rebirth Points",
                                                                                                                                                        cost: new Decimal(1e15),
                                                                                                                                                        unlocked() {
                                                                                                                                                            return hasUpgrade("rp", 33)
                                                                                                                                                        
                                                                                                                                                        },
                                                                                                                                                        effect() {
                                                                                                                                                            return player.sa.points.max(1).pow("1")
                                                                                                                                                        },
                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                                                    },
                                                                                                                                                    35: { 
                                                                                                                                                        title: "Rebirth Point Explosion III (RP35)",
                                                                                                                                                                description: "Rebirth Points boosts Points",
                                                                                                                                                                cost: new Decimal(1e20),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("rp", 34)
                                                                                                                                                                
                                                                                                                                                                },
                                                                                                                                                                effect() {
                                                                                                                                                                    return player.rp.points.max(1).pow("50")
                                                                                                                                                                },
                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                                                            },
                                                                                                                                                            41: { 
                                                                                                                                                                title: "Rebirth Point Explosion IV (RP41)",
                                                                                                                                                                        description: "Divine Points boosts Points",
                                                                                                                                                                        cost: new Decimal(1.5e20),
                                                                                                                                                                        unlocked() {
                                                                                                                                                                            return hasUpgrade("rp", 35)
                                                                                                                                                                        
                                                                                                                                                                        },
                                                                                                                                                                        effect() {
                                                                                                                                                                            return player.dp.points.max(1).pow("50")
                                                                                                                                                                        },
                                                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                                                                    },
                                                                                                                                                                    42: { 
                                                                                                                                                                        title: "Rebirth Evolution VII (RP42)",
                                                                                                                                                                                description: "Rebirth Points boosts Divine Perks.",
                                                                                                                                                                                cost: new Decimal(5e20),
                                                                                                                                                                                unlocked() {
                                                                                                                                                                                    return hasUpgrade("rp", 41)
                                                                                                                                                                                
                                                                                                                                                                                },
                                                                                                                                                                                effect() {
                                                                                                                                                                                    return player.rp.total.max(1).pow("13")
                                                                                                                                                                                },
                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                                                                                                                                                                },
                                                                                                                                                                                43: { 
                                                                                                                                                                                    title: "Rebirth Evolution VIII (RP43)",
                                                                                                                                                                                            description: "RP23 also affects Divine Points.",
                                                                                                                                                                                            cost: new Decimal(5.5e20),
                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                return hasUpgrade("rp", 42)
                                                                                                                                                                                            
                                                                                                                                                                                            },
                                                                                                                                                                                            effect() {
                                                                                                                                                                                                return player.rp.power.max(1).pow("1")
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                        44: { 
                                                                                                                                                                                            title: "Rebirth Evolution IX (RP44)",
                                                                                                                                                                                                    description: "1st Leaf Milestone Charge is better but you still need CP33 to make the time work.",
                                                                                                                                                                                                    cost: new Decimal(8e20),
                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                        return hasUpgrade("rp", 43)
                                                                                                                                                                                                    
                                                                                                                                                                                                    },
                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                        return player.le.opmtime.max(1).pow(1e5)
                                                                                                                                                                                                    },
                                                                                                                                                                                                },
                                                                                                                                                                                                45: { 
                                                                                                                                                                                                    title: "Rebirth Waiter (RP45)",
                                                                                                                                                                                                            description: "Rebirth Points is boosted based on time spent in this reset.",
                                                                                                                                                                                                            cost: new Decimal(1e21),
                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                return hasUpgrade("rp", 44)
                                                                                                                                                                                                            
                                                                                                                                                                                                            },
                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                let RPRT = player.rp.resetTime
                                                                                                                                                                                                                return Decimal.pow(RPRT, 1).times(16.6666666666666666).max(1).min(5000)
                                                                                                                                                                                                                    },
                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x<br>Hardcap after 5m" },
                                                                                                                                                                                                        },
                                                                                                                                                                                                        51: {
                                                                                                                                                                                                            title: "Rebirth Waiter II (RP51)",
                                                                                                                                                                                                              description: "Every Rebirth Buyable 12 you bought also boosts rebirth point gain by +10% and unlocks a new layer.",
                                                                                                                                                                                                              cost: new Decimal("1e25"),
                                                                                                                                                                                                              effect() {
                                                                                                                                                                                                                  let effect = Decimal.pow(1.1, player.rp.buyables[12]).min("10^^100")
                                                                                                                                                                                                                  return effect
                                                                                                                                                                                                              },
                                                                                                                                                                                                              effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                              unlocked() {
                                                                                                                                                                                                                  return hasUpgrade("rp", 45)
                                                                                                                                                                                                              }       
                                                                                                                                                                                                          },
                                                                                                                                                                                                          52: { 
                                                                                                                                                                                                            title: "Rebirth Evolution X (RP52)",
                                                                                                                                                                                                                    description: "25x Rebirth Points. That should be enough for Super Charge Power.",
                                                                                                                                                                                                                    cost: new Decimal(1e28),
                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                        return hasUpgrade("rp", 51)
                                                                                                                                                                                                                    
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                },
                                                                                                                                                                                                                53: { 
                                                                                                                                                                                                                    title: "Rebirth Charger (RP53)",
                                                                                                                                                                                                                            description: "^1.3 Super Charge Power.",
                                                                                                                                                                                                                            cost: new Decimal(2.5e45),
                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                return hasUpgrade("rp", 52)
                                                                                                                                                                                                                            
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                        54: { 
                                                                                                                                                                                                                            title: "Rebirth Charger II (RP54)",
                                                                                                                                                                                                                                    description: "^1.1 Leaf Points",
                                                                                                                                                                                                                                    cost: new Decimal(1e50),
                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                        return hasUpgrade("rp", 53)
                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                55: {
                                                                                                                                                                                                                                    title: "Rebirth Charger III (RP55)",
                                                                                                                                                                                                                                      description: "Every Charge Buyable 11 you bought also boosts super charge power gain by +5%.",
                                                                                                                                                                                                                                      cost: new Decimal("1e58"),
                                                                                                                                                                                                                                      effect() {
                                                                                                                                                                                                                                          let effect = Decimal.pow(1.05, player.cp.buyables[11]).min("10^^100")
                                                                                                                                                                                                                                          return effect
                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                      effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                      unlocked() {
                                                                                                                                                                                                                                          return hasUpgrade("rp", 54)
                                                                                                                                                                                                                                      }       
                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                  61: {
                                                                                                                                                                                                                                    title: "Rebirth Charger IV (RP61)",
                                                                                                                                                                                                                                      description: "Every Charge Buyable 12 you bought also boosts super charge power gain by +5%.",
                                                                                                                                                                                                                                      cost: new Decimal("3e60"),
                                                                                                                                                                                                                                      effect() {
                                                                                                                                                                                                                                          let effect = Decimal.pow(1.05, player.cp.buyables[12]).min("10^^100")
                                                                                                                                                                                                                                          return effect
                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                      effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                      unlocked() {
                                                                                                                                                                                                                                          return hasUpgrade("rp", 55)
                                                                                                                                                                                                                                      }       
                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                  62: {
                                                                                                                                                                                                                                    title: "Rebirth Charger V (RP62)",
                                                                                                                                                                                                                                      description: "Every Charge Buyable 13 you bought also boosts super charge power gain by +10%.",
                                                                                                                                                                                                                                      cost: new Decimal("1e61"),
                                                                                                                                                                                                                                      effect() {
                                                                                                                                                                                                                                          let effect = Decimal.pow(1.1, player.cp.buyables[13]).min("10^^100")
                                                                                                                                                                                                                                          return effect
                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                      effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                      unlocked() {
                                                                                                                                                                                                                                          return hasUpgrade("rp", 61)
                                                                                                                                                                                                                                      }       
                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                  63: { 
                                                                                                                                                                                                                                    title: "Rebirth Charger VI (RP63)",
                                                                                                                                                                                                                                            description: "7.5e22x Super Charge Power",
                                                                                                                                                                                                                                            cost: new Decimal(1e64),
                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                return hasUpgrade("rp", 62)
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        64: { 
                                                                                                                                                                                                                                            title: "Rebirth Evolution XI (RP64)",
                                                                                                                                                                                                                                                    description: "Points boosts Rebirth Points by even more.",
                                                                                                                                                                                                                                                    cost: new Decimal(5e73),
                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                        return hasUpgrade("rp", 63)
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                        return player.points.max(1).log("10")
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect

                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                65: { 
                                                                                                                                                                                                                                                    title: "Rebirth Charger VII (RP65)",
                                                                                                                                                                                                                                                            description: "^1.15 Super Charge Power",
                                                                                                                                                                                                                                                            cost: new Decimal(5e85),
                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                return hasUpgrade("rp", 64)
                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                        71: { 
                                                                                                                                                                                                                                                            title: "Rebirth Grinder (RP71)",
                                                                                                                                                                                                                                                                    description: "Unlocks 2 rebirth challenges.",
                                                                                                                                                                                                                                                                    cost: new Decimal(2.5e89),
                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 65)
                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                72: { 
                                                                                                                                                                                                                                                                    title: "Rebirth Charger VIII (RP72)",
                                                                                                                                                                                                                                                                            description: "1e33x Super Charge Power",
                                                                                                                                                                                                                                                                            cost: new Decimal(3e93),
                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 71)
                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        73: { 
                                                                                                                                                                                                                                                                            title: "Rebirth Evolution XII (RP73)",
                                                                                                                                                                                                                                                                                    description: "Divine Points boosts Rebirth Points.",
                                                                                                                                                                                                                                                                                    cost: new Decimal('5e98'),
                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 72)
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                                                        return player.dp.points.max(1).log("2")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                74: { 
                                                                                                                                                                                                                                                                                    title: "Rebirth Charger IX (RP74)",
                                                                                                                                                                                                                                                                                            description: "Rebirth Power boosts Super Charge Power.",
                                                                                                                                                                                                                                                                                            cost: new Decimal('3e104'),
                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 73)
                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                                                                                                return player.rp.power.max(1).pow("0.0666")
                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                        
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        75: { 
                                                                                                                                                                                                                                                                                            title: "Rebirth Charger X (RP75)",
                                                                                                                                                                                                                                                                                                    description: "^1.05 Leaf Points",
                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e106),
                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 74)
                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                81: { 
                                                                                                                                                                                                                                                                                                    title: "Rebirth Upgrader VII (RP81)",
                                                                                                                                                                                                                                                                                                            description: "350x Rebirth Points & 2,000x Super Charge Power",
                                                                                                                                                                                                                                                                                                            cost: new Decimal(1e149),
                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 75)
                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        82: { 
                                                                                                                                                                                                                                                                                                            title: "Rebirth Upgrader VIII (RP82)",
                                                                                                                                                                                                                                                                                                                    description: "^1.1 Leaf Points.",
                                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e179),
                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 81)
                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                83: { 
                                                                                                                                                                                                                                                                                                                    title: "Rebirth Charger XI (RP83)",
                                                                                                                                                                                                                                                                                                                            description: "1e33x Super Charge Power again.",
                                                                                                                                                                                                                                                                                                                            cost: new Decimal(2.5e180),
                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 82)
                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                        84: { 
                                                                                                                                                                                                                                                                                                                            title: "Rebirth Charger XII (RP84)",
                                                                                                                                                                                                                                                                                                                                    description: "^1.2 Energy",
                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e187),
                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 83)
                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                85: { 
                                                                                                                                                                                                                                                                                                                                    title: "Rebirth Upgrader IX (RP85)",
                                                                                                                                                                                                                                                                                                                                            description: "1e33x Rebirth Points",
                                                                                                                                                                                                                                                                                                                                            cost: new Decimal(2.5e187),
                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 84)
                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                        91: { 
                                                                                                                                                                                                                                                                                                                                            title: "Rebirth Upgrader X (RP91)",
                                                                                                                                                                                                                                                                                                                                                    description: "^1.3 Rebirth Power",
                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e235),
                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 85)
                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                92: { 
                                                                                                                                                                                                                                                                                                                                                    title: "Rebirth Upgrader XI (RP92)",
                                                                                                                                                                                                                                                                                                                                                            description: "Super Charge Power boosts Rebirth Power.",
                                                                                                                                                                                                                                                                                                                                                            cost: new Decimal('1e314'),
                                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 91)
                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                                                                                                                                                                return player.cp2.points.max(1).pow("0.0075")
                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                        
                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                        93: { 
                                                                                                                                                                                                                                                                                                                                                            title: "Rebirth Upgrader XII (RP93)",
                                                                                                                                                                                                                                                                                                                                                                    description: "Super Energy boosts Rebirth Power.",
                                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal('1e316'),
                                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 92)
                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                                                                                                                                                                                        return player.se.points.max(1).pow("0.0075")
                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                                94: { 
                                                                                                                                                                                                                                                                                                                                                                    title: "Rebirth Upgrader XIII (RP94)",
                                                                                                                                                                                                                                                                                                                                                                            description: "Divine Points boosts Rebirth Power & Super Energy and Super Charge Power.",
                                                                                                                                                                                                                                                                                                                                                                            cost: new Decimal('1e361'),
                                                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("rp", 93)
                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                                            effect() {
                                                                                                                                                                                                                                                                                                                                                                                return player.dp.points.max(1).log("10")
                                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                        95: { 
                                                                                                                                                                                                                                                                                                                                                                            title: "Rebirth Charger XIII (RP95)",
                                                                                                                                                                                                                                                                                                                                                                                    description: "^1.5 Energy",
                                                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal("e453"),
                                                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("rp", 94)
                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                        
    },
    challenges: {
        11: {
                name: "No Static Layers",
                challengeDescription: "You can't gain Sacrifice Tier & Super Tier.",
                goalDescription: "1e280 Charge Power",
                rewardDescription: "^1.2 Divine Points and 1,000,000,000x Super Charge Power",
                canComplete: function() {return player.cp.points.gte("e280")},
                unlocked() { return (hasUpgrade('rp', 71)) },
        },
        12: {
            name: "No Major Layers",
            challengeDescription: "You can only get Energy and Points.",
            goalDescription: "1e7,650 Points",
            rewardDescription: "^1.05 Leaf Points and 1,000,000,000x Super Charge Power",
            canComplete: function() {return player.points.gte("e7650")},
            unlocked() { return (hasChallenge('rp', 11)) },
    },
    },
    milestones: {
        1: {
            requirementDescription: "[1] 100 Rebirth Power",
            effectDescription: "Unlock the first rebirth power buyable.",
            done() { return player.rp.power.gte("200") }
        },
        2: {
            requirementDescription: "[2] 5,000 Rebirth Power",
            effectDescription: "Unlock more rebirth point upgrades.",
            done() { return player.rp.power.gte("5e3") }
        },
        3: {
            requirementDescription: "[3] 5 Rebirth Points",
            effectDescription: "Unlocks the second rebirth power buyable.",
            done() { return player.rp.points.gte("5") }
        },
        4: {
            requirementDescription: "[4] 1e12 Rebirth Power",
            effectDescription: "Unlock more divine perk upgrades.",
            done() { return player.rp.power.gte("1e12") }
        },
        5: {
            requirementDescription: "[5] 5,000 Rebirth Points",
            effectDescription: "Unlocks the third rebirth power buyable.",
            done() { return player.rp.points.gte("5e3") }
        },
        6: {
            requirementDescription: "[6] 1,000,000 Rebirth Points",
            effectDescription: "Keep Divine Challenges & Milestones.",
            done() { return player.rp.points.gte("1e6") }
        },
        7: {
            requirementDescription: "[7] 1,000,000,000 Rebirth Points",
            effectDescription: "You can buy max Super Tier and ^1.3 Rebirth Points again",
            done() { return player.rp.points.gte("1e9") }
        },
    },
    buyables: {
        11: {
            title: "Point Buyable 15: Rebirth Grader",
            cost(x) { return new Decimal(2).pow(Decimal.times(x, 1.01).add(1)) },
            display() { if(player.rp.buyables[11].gte(1e30)) return`Strength Rebirth Power (Hardcaps at 1e30x)<br>
                Effect:x${format(this.effect())} (harcapped)<br>
                Level: ${format(player[this.layer].buyables[this.id])}<br>
                Cost: ${format(this.cost())} Rebirth Power`
                else return`Strength Rebirth Power (Hardcaps at 1e30x)<br>
                Effect: x${format(this.effect())} <br>
                Level: ${formatWhole(player[this.layer].buyables[this.id])}<br>
                Cost: ${format(this.cost())} Rebirth Power`}, 
            canAfford() { return player[this.layer].power.gte(this.cost()) },
            buy() {
                player[this.layer].power = player[this.layer].power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {return new Decimal(1.5).pow(x).max(1).min("1e30")},
            
                unlocked() {return hasMilestone('rp', 1)},
            },
            12: {
                title: "Point Buyable 16: Rebirth Grader II",
                cost(x) { return new Decimal(10).pow(Decimal.pow(x, 1.05).add(1)) },
                display() { return` Strength Rebirth Power by more. (Hardcaps at 1e300x) <br>
                    Effect: x${format(this.effect())} <br>
                    Level: ${formatWhole(player[this.layer].buyables[this.id])}<br>
                    Cost: ${format(this.cost())} Rebirth Power`}, 
                canAfford() { return player[this.layer].power.gte(this.cost()) },
                buy() {
                    player[this.layer].power = player[this.layer].power.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {return new Decimal(2).pow(x).max(1).min("1e300")},
                unlocked() {return hasMilestone('rp', 3)},
            },
            13: {
                title: "Point Buyable 17: Rebirth Grader III",
                cost(x) { return new Decimal(2).pow(Decimal.pow(x, 2).add(1)) },
                display() { return` Strength Rebirth Power by even more. <br>
                    Effect: ^${format(this.effect())} <br>
                    Level: ${formatWhole(player[this.layer].buyables[this.id])}<br>
                    Cost: ${format(this.cost())} Rebirth Power`}, 
                canAfford() { return player[this.layer].power.gte(this.cost()) },
                buy() {
                    player[this.layer].power = player[this.layer].power.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                },
                effect(x) {return new Decimal(1.01).pow(x).max(1)},
                unlocked() {return hasMilestone('rp', 5)},
            },
    },
    
            color: "#ADD8E6",
    requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
    resource: "Rebirth Points", // Name of prestige currency
    baseResource: "Divine Points", // Name of resource prestige is based on
    baseAmount() {return player.dp.points}, // Get the current amount of baseResource
    branches: ["dp"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1e-10", // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('rp', 14)) mult = mult.times(1.5)
        if (hasUpgrade('rp', 15)) mult = mult.times(upgradeEffect('rp', 15))
            if (hasUpgrade('dp', 191)) mult = mult.times(upgradeEffect('dp',191))
                if (hasUpgrade('dp', 192)) mult = mult.times(2)
                    if (hasUpgrade('rp', 22)) mult = mult.times(10)
                        if (hasUpgrade('rp', 24)) mult = mult.pow(1.3)
                            if (hasUpgrade('rp', 31)) mult = mult.times(upgradeEffect('rp',31))
                                if (hasMilestone('rp', 7)) mult = mult.pow(1.3)
                                    if (hasUpgrade('rp', 33)) mult = mult.times(upgradeEffect('rp',33))
                                        if (hasUpgrade('rp', 34)) mult = mult.times(upgradeEffect('rp',34))
                                                                                if (hasUpgrade('rp', 45)) mult = mult.times(upgradeEffect('rp',45))
                                                                                    if (hasUpgrade('rp', 51)) mult = mult.times(upgradeEffect('rp',51))
                                                                                        if (hasUpgrade('rp', 52)) mult = mult.times(25)
                                                                                            mult = mult.times(buyableEffect('cp2', 11))
        if (hasUpgrade('cp', 104)) mult = mult.times(upgradeEffect('cp',104))
            if (hasUpgrade('rp', 64)) mult = mult.times(upgradeEffect('rp',64))
                if (hasUpgrade('rp', 73)) mult = mult.times(upgradeEffect('rp',73))
                    if (hasUpgrade('rp', 81)) mult = mult.times(350)
                        if (hasUpgrade('se', 11)) mult = mult.times(upgradeEffect('se',11))
                            if (hasUpgrade('rp', 85)) mult = mult.times(1e33)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    displayRow: 8, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for Rebirth Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("dp", 43) || player[this.layer].unlocked)},
})
