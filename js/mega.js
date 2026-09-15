addLayer("mp", {
    name: "mega-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        auto: false,
    }},
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Mega</h3><br>" + format(player.mp.points) + " MP"
      },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Mega-Points! it will reset EVERYTHING except Achievements.</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ],
                },
                "Milestones": {
                    content: [
                        ["blank", "15px"],
                        "milestones"
                    ]
                },
                "Challenges": {
                    unlocked() {return (hasUpgrade("mp", 31))},
            content: [
                ["blank", "15px"],
                ["challenges", [1,2]]
                
            ]
        },
            },
    
},
passiveGeneration() {
    if (hasAchievement("a", 262)) return (hasAchievement("a", 262)?1:0)
    if (hasMilestone("le", 2)) return (hasMilestone("le", 2)?1:0)
    if (hasAchievement("a", 231)) return (hasAchievement("a", 231)?0.05:0)
    },
    upgrades: {
        11: {
            title: "Extension V (MP11)",
            description: "Unlocks more prestige point upgrades.",
            cost: new Decimal(0.5),
                },
    12: { 
        title: "Buy-able (MP12)",
                description: "HB11 Effect is better.",
                cost: new Decimal(0.5),
                unlocked() {
                    return hasUpgrade("mp", 11)
                
                }
                },
                13: { 
                    title: "Mega Hyperomium (MP13)",
                            description: "Hyper-Points boosts itself.",
                            cost: new Decimal(1),
                            effect() {
                                return player.hp.points.add(1).pow("0.02").min("100")
                            },
                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                            unlocked() {
                                return hasUpgrade("mp", 12)
                            
                            }
                            },
                            14: { 
                                title: "Buy-able II (MP14)",
                                        description: "HB12 cost is cheaper.",
                                        cost: new Decimal(1.5),
                                        unlocked() {
                                            return hasUpgrade("mp", 13)
                                        
                                        }
                                        },
                                        15: { 
                                            title: "Unstable Points (MP15)",
                                                    description: "^1.05 Points",
                                                    cost: new Decimal(2.25),
                                                    unlocked() {
                                                        return hasUpgrade("mp", 14)
                                                    
                                                    }
                                                    },
                                                    21: { 
                                                        title: "Mega of Buyable (MP21)",
                                                                description: "Make the 1st and 3rd hyper-point buyables stronger.",
                                                                cost: new Decimal(7),
                                                                unlocked() {
                                                                    return hasUpgrade("mp", 15)
                                                                
                                                                }
                                                                },
                                                                22: { title: "Mega Based? (MP22)",
                                                                description: "Total Mega-Points boosts Point gain.",
                                                                cost: new Decimal("10"),
                                                                effect() {
                                                                    return player.mp.total.add(1).pow("20")
                                                                },
                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                    unlocked() {
                                                                        return hasUpgrade("mp", 21)
                                                                }
                                                                },
                                                                23: { 
                                                                    title: "Mega of Hyper (MP23)",
                                                                            description: "50x Hyper-Points",
                                                                            cost: new Decimal(15),
                                                                            unlocked() {
                                                                                return hasUpgrade("mp", 22)
                                                                            
                                                                            }
                                                                            },
                                                                            24: { 
                                                                                title: "Mega of Sub-Points (MP24)",
                                                                                        description: "Unlock Points-4",
                                                                                        cost: new Decimal(20),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("mp", 23)
                                                                                        
                                                                                        }
                                                                                        },
                                                                                        25: { 
                                                                                            title: "Unstable Points II (MP25)",
                                                                                                    description: "1e33x POINTS!",
                                                                                                    cost: new Decimal(25),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("mp", 24)
                                                                                                    
                                                                                                    }
                                                                                                    },
                                                                                                    31: {
                                                                                                        title: "The pain continues (MP31)",
                                                                                                        description: "Unlock a mega point challenge",
                                                                                                        cost: new Decimal("1e3000"),
                                                                                                        currencyInternalName: "points",
                                                                                                        currencyDisplayName: "Points",
                                                                                                        unlocked() {return hasUpgrade('mp', 25)},
                                                                                                    },
                                                                                                    32: { 
                                                                                                        title: "Unstable Points III (MP32)",
                                                                                                                description: "1e18x Super-POINTS!",
                                                                                                                cost: new Decimal(75),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("mp", 31)
                                                                                                                
                                                                                                                }
                                                                                                                },
                                                                                                                33: { 
                                                                                                                    title: "Unstable Points IV (MP33)",
                                                                                                                            description: "1e10x Ultra-POINTS!",
                                                                                                                            cost: new Decimal(100),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("mp", 32)
                                                                                                                            
                                                                                                                            }
                                                                                                                            },
                                                                                                                            34: { 
                                                                                                                                title: "Mega Booster (MP34)",
                                                                                                                                        description: "+75% Mega-Points",
                                                                                                                                        cost: new Decimal(125),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("mp", 33)
                                                                                                                                        
                                                                                                                                        }
                                                                                                                                        },
                                                                                                                                        35: { 
                                                                                                                                            title: "Unstable Points V (MP35)",
                                                                                                                                                    description: "100x Hyper-Points",
                                                                                                                                                    cost: new Decimal(175),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("mp", 34)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                    },
                                                                                                                                                    41: { 
                                                                                                                                                        title: "Mega of Hyper (MP41)",
                                                                                                                                                                description: "Kinda Small. 2x Hyper-Points",
                                                                                                                                                                cost: new Decimal(500),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("mp", 35)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                42: { title: "Mega Booster II (MP42)",
                                                                description: "Hyper-Points boosts Mega-Points at a very reduced rate.",
                                                                cost: new Decimal("750"),
                                                                effect() {
                                                                    return player.hp.points.add(1).pow("0.001")
                                                                },
                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                    unlocked() {
                                                                        return hasUpgrade("mp", 41)
                                                                }
                                                                },
                                                                43: { 
                                                                    title: "Unstable Points VI (MP43)",
                                                                            description: "^1.02 Points",
                                                                            cost: new Decimal(750),
                                                                            unlocked() {
                                                                                return hasUpgrade("mp", 42)
                                                                            
                                                                            }
                                                                            },
                                                                            44: { 
                                                                                title: "Mega Booster III (MP44)",
                                                                                        description: "+75% Mega-Points again",
                                                                                        cost: new Decimal(1750),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("mp", 43)
                                                                                        
                                                                                        }
                                                                                        },
                                                                                        45: { 
                                                                                            title: "Unstable Points VII (MP45)",
                                                                                                    description: "^1.02 Super-Points",
                                                                                                    cost: new Decimal(3500),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("mp", 44)
                                                                                                    
                                                                                                    }
                                                                                                    },
                                                                                                    51: { 
                                                                                                        title: "Mega of Sub-Points II (MP51)",
                                                                                                                description: "Unlock Points-5",
                                                                                                                cost: new Decimal(7500),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("mp", 45)
                                                                                                                
                                                                                                                }
                                                                                                                },
                                                                                                                52: { 
                                                                                                                    title: "Unstable Points VIII (MP52)",
                                                                                                                            description: "1e150x Points!",
                                                                                                                            cost: new Decimal(7500),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("mp", 51)
                                                                                                                            
                                                                                                                            }
                                                                                                                            },
                                                                                                                            53: { 
                                                                                                                                title: "Split of Points (MP53)",
                                                                                                                                        description: "Total Mega-Points boosts Hyper-Points",
                                                                                                                                        cost: new Decimal(30000),
                                                                                                                                        effect() {
                                                                                                                                            return player.mp.total.add(1).pow("1.5")
                                                                                                                                        },
                                                                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("mp", 52)
                                                                                                                                        
                                                                                                                                        }
                                                                                                                                        },
                                                                                                                                        54: { 
                                                                                                                                            title: "Unstable Points IX (MP54)",
                                                                                                                                                    description: "^1.02 Ultra-Points",
                                                                                                                                                    cost: new Decimal(75000),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("mp", 53)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                    },
                                                                                                                                                    55: { 
                                                                                                                                                        title: "Split of Points II (MP55)",
                                                                                                                                                                description: "Total Mega-Points boosts Ultra-Points",
                                                                                                                                                                cost: new Decimal(90000),
                                                                                                                                                                effect() {
                                                                                                                                                                    return player.mp.total.add(1).pow("7")
                                                                                                                                                                },
                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("mp", 54)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                 61: { 
                                                                                                                                            title: "The Producer (MP61)",
                                                                                                                                                    description: "Unlocks 3 sub-layers.",
                                                                                                                                                    cost: new Decimal(150000),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("mp", 55)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                    },
                                                                                                                                                    62: { 
                                                                                                                                                        title: "Split of Points III (MP62)",
                                                                                                                                                                description: "Total Mega-Points boosts Super-Points",
                                                                                                                                                                cost: new Decimal(270000),
                                                                                                                                                                effect() {
                                                                                                                                                                    return player.mp.total.add(1).pow("10")
                                                                                                                                                                },
                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("mp", 61)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                63: {
                                                                                                                                                                    title: "Air Mega Booster (MP63)",
                                                                                                                                                                    description: "Every Air you have also boosts mega-point gain by 1.1x",
                                                                                                                                                                    cost: new Decimal(270000),
                                                                                                                                                                    effect() {
                                                                                                                                                                        let effect = Decimal.pow(1.1, player.ai.points).min("10000")
                                                                                                                                                                        return effect
                                                                                                                                                                    },
                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                    unlocked() {
                                                                                                                                                                        return hasUpgrade("mp", 62)
                                                                                                                                                                    
                                                                                                                                                                    }        
                                                                                                                                                                },
                                                                                                                                                                        64: {
                                                                                                                                                                            title: "Air Energy Booster (MP64)",
                                                                                                                                                                            description: "Every Air you have boosts energy gain by 10x",
                                                                                                                                                                            cost: new Decimal(300000),
                                                                                                                                                                            effect() {
                                                                                                                                                                                let effect = Decimal.pow(10, player.ai.points).div(10)
                                                                                                                                                                                return effect
                                                                                                                                                                            },
                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("mp", 63)
                                                                                                                                                                            
                                                                                                                                                                            }      
                                                                                                                                                                        },
                                                                                                                                                                        65: { title: "Discount VI (MP65)",
        description: "Energy will also divide the cost of Points-1, Points-2 and Points-3",
        cost: new Decimal(2500000),
        effect() {
            return player.e.points.add(1).pow("3")
        },
        effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("mp", 64)
        }
        },
        71: { 
            title: "Split of Points IV (MP71)",
                    description: "Energy boosts Ultra-Points",
                    cost: new Decimal(3000000),
                    effect() {
                        return player.e.points.add(1).pow("3")
                    },
                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                    unlocked() {
                        return hasUpgrade("mp", 65)
                    
                    }
                    },
                    72: { 
                        title: "Energy Combuster (MP72)",
                                description: "Mega-Points boosts Energy.",
                                cost: new Decimal(5000000),
                                effect() {
                                    return player.mp.points.add(1).pow("0.5")
                                },
                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                unlocked() {
                                    return hasUpgrade("mp", 71)
                                
                                }
                                },
                                73: { 
                                    title: "Light Combuster (MP73)",
                                            description: "Mega-Points boosts Light.",
                                            cost: new Decimal(1e7),
                                            effect() {
                                                return player.mp.points.add(1).pow("0.333333333333333")
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                            unlocked() {
                                                return hasUpgrade("mp", 72)
                                            
                                            }
                                            },
                                            74: { 
                                                title: "Split of Points V (MP74)",
                                                        description: "Energy boosts Super-Points",
                                                        cost: new Decimal(1e7),
                                                        effect() {
                                                            return player.e.points.add(1).pow("3")
                                                        },
                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                        unlocked() {
                                                            return hasUpgrade("mp", 73)
                                                        
                                                        }
                                                        },
                                                        75: {
                                                            title: "Air Light Booster (MP75)",
                                                            description: "Every Air you have boosts light gain by 10x",
                                                            cost: new Decimal(1.5e7),
                                                            effect() {
                                                                let effect = Decimal.pow(10, player.ai.points).div(10)
                                                                return effect
                                                            },
                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                            unlocked() {
                                                                return hasUpgrade("mp", 74)
                                                            
                                                            }      
                                                        },
                                                        81: { 
                                                            title: "Mega of Sub-Points III (MP81)",
                                                                    description: "Unlock Points-6",
                                                                    cost: new Decimal(6e7),
                                                                    unlocked() {
                                                                        return hasUpgrade("mp", 75)
                                                                    
                                                                    }
                                                                    },
                                                                    82: { title: "Discount VII (MP82)",
                                                                    description: "Energy will divide the cost of Points-1, Points-2 and Points-3 by even more.",
                                                                    cost: new Decimal(2.5e8),
                                                                    effect() {
                                                                        return player.e.points.add(1).pow("1")
                                                                    },
                                                                    effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
                                                                    unlocked() {
                                                                        return hasUpgrade("mp", 81)
                                                                    }
                                                                    },
                                                                    83: {
                                                                        title: "The pain continues II (MP83)",
                                                                        description: "Unlock a 2nd mega point challenge",
                                                                        cost: new Decimal("1e10000"),
                                                                        currencyInternalName: "points",
                                                                        currencyDisplayName: "Points",
                                                                        unlocked() {return hasUpgrade('mp', 82)},
                                                                    },
                                                                    84: { 
                                                                        title: "Unstable Points X (MP84)",
                                                                                description: "Been a while. ^1.02 Hyper-Points",
                                                                                cost: new Decimal(1e27),
                                                                                unlocked() {
                                                                                    return hasUpgrade("mp", 83)
                                                                                
                                                                                }
                                                                                },
                                                                                85: { 
                                                                                    title: "Unstable Points XI (MP85)",
                                                                                            description: "^1.02 Energy & Light",
                                                                                            cost: new Decimal(1e32),
                                                                                            unlocked() {
                                                                                                return hasUpgrade("mp", 84)
                                                                                            
                                                                                            }
                                                                                            },
                                                                                            91: { 
                                                                                                title: "Unstable Points XII (MP91)",
                                                                                                        description: "Been a while again. ^1.05 Mega-Points",
                                                                                                        cost: new Decimal(1e111),
                                                                                                        unlocked() {
                                                                                                            return hasUpgrade("mp", 85)
                                                                                                        
                                                                                                        }
                                                                                                        },
                                                                                                        92: { 
                                                                                                            title: "The Super Leaf (MP92)",
                                                                                                                    description: "2x Leaf",
                                                                                                                    cost: new Decimal("e168"),
                                                                                                                    unlocked() {
                                                                                                                        return hasUpgrade("mp", 91)
                                                                                                                    
                                                                                                                    }
                                                                                                                    },
                                                                                                                    93: { 
                                                                                                                        title: "The Super Leaf II (MP93)",
                                                                                                                                description: "2x Leaf again",
                                                                                                                                cost: new Decimal("e265"),
                                                                                                                                unlocked() {
                                                                                                                                    return hasUpgrade("mp", 92)
                                                                                                                                
                                                                                                                                }
                                                                                                                                },
    },
    milestones: {
        1: {
            requirementDescription() {
                dis = "[1] 2 Total Mega-Points"
                if (hasUpgrade('cp', 31)) dis = dis + " (Charged)"  
                return dis},
            effectDescription() {
                dis = "Keep the first hyper-point upgrade on reset."
                if (hasUpgrade('cp', 31)) dis = dis + "<br>Charge effect: Mega-Points boosts Charge Power & Leaf Points.<br>Currently: " + format(upgradeEffect('cp', 31)) + "x"
                return dis},
            done() { return player.mp.total.gte(2) },
            style(){if (hasUpgrade('cp', 31)) return{'background-color':'#ffad00'}}
        },
        2: {
            requirementDescription(){des = "[2] 5 Total Mega-Points"
                if (hasUpgrade('cp', 52)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Keep the first two hyper-point buyables unlocked on reset."
            if (hasUpgrade('cp', 52)) des = des + "<br> Charge effect: ^1.5 Hyper-Points"
            return des},
            done() { return player.mp.total.gte(5) },
            style(){if (hasUpgrade('cp', 52)) return{'background-color':'#ffad00'}}
        },
        3: {
            requirementDescription(){des = "[3] 50 Total Mega-Points"
                if (hasUpgrade('cp', 61)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Keep all four hyper-point challenges completed."
            if (hasUpgrade('cp', 61)) des = des + "<br> Charge effect: Unlock a new mega-point challenge."
            return des},
            done() { return player.mp.total.gte(50) },
            style(){if (hasUpgrade('cp', 61)) return{'background-color':'#ffad00'}}
        },

        4: {
            requirementDescription(){des = "[4] Finish Mega Challenge 11"
                if (hasUpgrade('cp', 65)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Gain 100% Of Ultra-Points gain per second but the hyper-point buyables does not do anything and give a ^1.11... Points."
            if (hasUpgrade('cp', 65)) des = des + "<br> Charge effect: ^1.01 Charge Power"
            return des},
            done() {return hasChallenge("mp",11)},
            style(){if (hasUpgrade('cp', 65)) return{'background-color':'#ffad00'}}
        },
        5: {
            requirementDescription(){des = "[5] 100 Total Mega-Points"
                if (hasUpgrade('cp', 74)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Automatically buys Hyper-Point Upgrades."
            if (hasUpgrade('cp', 74)) des = des + "<br> Charge effect: ^1.075 Hyper-Points & Super-Points"
            return des},
            done() { return player.mp.total.gte(100) },
            style(){if (hasUpgrade('cp', 74)) return{'background-color':'#ffad00'}}
        },
        6: {
            requirementDescription(){des = "[6] 1 Energy"
                if (hasUpgrade('cp', 83)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Gain 100% of Energy gained on reset per second."
            if (hasUpgrade('cp', 83)) des = des + "<br> Charge effect: ^1.2 Time Power"
            return des},
            done() { return player.e.points.gte(1) },
            style(){if (hasUpgrade('cp', 83)) return{'background-color':'#ffad00'}}
        },
        7: {
            requirementDescription(){des = "[7] 1 Light"
                if (hasUpgrade('dp', 35)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Gain 100% of Light gained on reset per second."
            if (hasUpgrade('dp', 35)) des = des + "<br> Charge effect: ^1.3 Divine Perks but ^0.9 Divine Points"
            return des},
            done() { return player.l.points.gte(1) },
            style(){if (hasUpgrade('dp', 35)) return{'background-color':'#ffad00'}}
        },
        8: {
            requirementDescription() {
                dis = "[8] 1 Cell"
                if (hasUpgrade('cp', 92)) dis = dis + " (Charged)"  
                return dis},
            effectDescription() {
                dis = "Gain 100% of Cells gained on reset per second."
                if (hasUpgrade('cp', 92)) dis = dis + "<br>Charge effect: Divine Points boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 92)) + "x"
                return dis},
            done() { return player.c.points.gte(1) },
            style(){if (hasUpgrade('cp', 92)) return{'background-color':'#ffad00'}}
        },
},
doReset(sa) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[sa].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
    let keptUpgrades = [];

    // Stage 3, track which main features you want to keep - milestones
    let keep = [];
    if (hasMilestone('sa', 6)) keep.push("challenges");
    if (hasMilestone('sa', 11)) keep.push("milestones");
    if (hasAchievement('a', 231)) keep.push("milestones");
    if (hasMilestone('le', 6)) keep.push("challenges");
    if (hasAchievement('a', 251)) keep.push("challenges");
    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
},
    challenges: {
        11: {
                name: "Ultra-less",
                challengeDescription: "You can not get any Ultra-Points and Points-1, Points-2 and Points-3 scales much quicker.",
                goalDescription: "1e315 Points",
                rewardDescription: "Double Mega-Point Gain and reach a milestone.",
                canComplete: function() {return player.points.gte("1e315")},
                unlocked() { return (hasUpgrade('mp', 31)) },
        },
        12: {
            name: "Paradox",
            challengeDescription: "Points-1, Points-2 and Points-3 scales much quicker again, you can't gain prestige points, ultra-points and hyper-point gain is square rooted.",
            goalDescription: "1e58 Hyper-Points",
            rewardDescription: "Double Mega-Point Gain and unlock a new layer.",
            canComplete: function() {return player.hp.points.gte("1e58")},
            unlocked() { return (hasUpgrade('mp', 83)) },
    },
    21: {
        name: "Disable Layers",
        challengeDescription: "You can't gain any resources below Mega-Points.",
        goalDescription: "1e395,000 Points",
        rewardDescription: "^1.01 Mega Points and 1,000,000,000x Charge Power.",
        canComplete: function() {return player.points.gte("e395000")},
        unlocked() { return (hasUpgrade('cp', 61)) },
},
    },
    color: "orange",
    requires: new Decimal("1e1500"), // Can be a function that takes requirement increases into account
    resource: "Mega-Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["hp"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.00075, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1.4)
        if (hasUpgrade('hp', 64)) mult = mult.times(1.15)
        if (hasChallenge('mp', 11)) mult = mult.times(2)
        if (hasUpgrade('mp', 34)) mult = mult.times(1.75)
        if (hasUpgrade('mp', 42)) mult = mult.times(upgradeEffect('mp', 42))
        if (hasUpgrade('mp', 44)) mult = mult.times(1.75)
        if (hasUpgrade('up', 81)) mult = mult.times(1.75)
        if (hasUpgrade('mp', 63)) mult = mult.times(upgradeEffect('mp', 63))
        if (hasUpgrade('hp', 72)) mult = mult.times(1.5)
        if (hasUpgrade('sp', 85)) mult = mult.times(2)
        if (hasChallenge('mp', 12)) mult = mult.times(2)
        if (hasMilestone('sa', 1)) mult = mult.times("5")
        if (hasMilestone('sa', 4)) mult = mult.times("2")
        if (hasUpgrade('e', 24)) mult = mult.times(upgradeEffect('e',24))
        if (hasUpgrade('e', 32)) mult = mult.times(upgradeEffect('e',32))
                if (hasMilestone('sa', 6)) mult = mult.times("4")
                if (hasUpgrade('sp', 92)) mult = mult.times(upgradeEffect('sp', 92))
                if (hasUpgrade('hp', 85)) mult = mult.times(upgradeEffect('hp', 85))
                if (hasUpgrade('up', 91)) mult = mult.times(upgradeEffect('up', 91))
                if (hasUpgrade('hp', 92)) mult = mult.times(upgradeEffect('hp', 92))
                        if (hasMilestone('sa', 9)) mult = mult.times("20")
                        if (hasMilestone('sa', 10)) mult = mult.times("7.5")
                        if (hasUpgrade('scp', 11)) mult = mult.times(2.5)
                        if (hasUpgrade('scp', 12)) mult = mult.times(3)
                        if (hasUpgrade('scp', 13)) mult = mult.times(3)
                        if (hasUpgrade('scp', 14)) mult = mult.times(1.7)
                        if (hasUpgrade('scp', 15)) mult = mult.times(1.5)
                        if (hasUpgrade('scp', 21)) mult = mult.times(3)
                        if (hasUpgrade('scp', 23)) mult = mult.times(3)
                        if (hasUpgrade('scp', 24)) mult = mult.times(3)
                        if (hasUpgrade('scp', 25)) mult = mult.times(2)
                                if (hasUpgrade('scp', 33)) mult = mult.times(1.7)
                                if (hasUpgrade('scp', 35)) mult = mult.times(1.5)
                                        if (hasUpgrade('scp', 41)) mult = mult.times(2)
                                                if (hasUpgrade('scp', 42)) mult = mult.times(2)
                                                if (hasUpgrade('e', 35)) mult = mult.times(upgradeEffect('e',35))
                                                if (hasMilestone('sa', 13)) mult = mult.times("30")
                                                if (hasUpgrade('scp', 43)) mult = mult.times(2.5)
                                                if (hasUpgrade('scp', 44)) mult = mult.times(4)
                                                if (hasUpgrade('scp', 45)) mult = mult.times(1.5)
                                                if (hasUpgrade('scp', 51)) mult = mult.times(2)
                                                if (hasMilestone('sa', 14)) mult = mult.pow("1.02")
                                                if (hasUpgrade('scp', 52)) mult = mult.times(1.8)
                                                if (hasUpgrade('scp', 53)) mult = mult.times(2)
                                                if (hasUpgrade('scp', 55)) mult = mult.times(30)
                                                        if (hasUpgrade('scp', 62)) mult = mult.times(2.25)
                                                        if (hasMilestone('sa', 15)) mult = mult.times("5")
                                                                if (hasUpgrade('scp', 63)) mult = mult.times(10)
                                                                if (hasUpgrade('scp', 64)) mult = mult.times(4)
                                                                if (hasUpgrade('scp', 71)) mult = mult.times(10)
                                                                if (hasUpgrade('scp', 72)) mult = mult.times(50)
                                                                if (hasUpgrade('scp', 81)) mult = mult.times(10)
                                                                if (hasMilestone('sa', 17)) mult = mult.times("5")
                                                                if (hasUpgrade('scp', 83)) mult = mult.times(10)
                                                                if (hasUpgrade('scp', 84)) mult = mult.times(10)
                                                                if (hasMilestone('sa', 18)) mult = mult.times("10")
                                                                if (hasUpgrade('scp', 92)) mult = mult.times(3)
                                                                if (hasUpgrade('scp', 93)) mult = mult.times(10)
                                                                if (hasUpgrade('scp', 94)) mult = mult.times(10)
                                                                if (hasUpgrade('e', 52)) mult = mult.times(25)
                                                                if (hasUpgrade('mp', 91)) mult = mult.pow("1.05")
                                                                if (inChallenge("sa", 12)) mult = mult.pow(0.2)
                                                                if (hasChallenge('sa', 12)) mult = mult.times("5")
                                                                if (hasUpgrade('le', 15)) mult = mult.pow(1.25)
                                                                if (hasUpgrade('le', 24)) mult = mult.times(upgradeEffect('le',24))
                                                                if (hasUpgrade('le', 43)) mult = mult.times(upgradeEffect('le',43))
                                                                mult = mult.times(buyableEffect('le', 11))
                                                                if (hasMilestone('st', 1)) mult = mult.times(250)
                                                                if (hasMilestone('st', 2)) mult = mult.times(1e11)
                                                                if (hasMilestone('st', 4)) mult = mult.times(100)
                                                                if (hasUpgrade('cp', 24)) mult = mult.pow(1.1)
                                                                mult = mult.times(buyableEffect('le', 21))
                                                                if (hasAchievement('a', 275)) mult = mult.times("1e8")
                                                                if (hasChallenge('mp', 21)) mult = mult.pow(1.01)
                                                                if (hasUpgrade('dp', 41)) mult = mult.times(upgradeEffect('dp', 41))
                                                                    if (inChallenge("rp", 12)) mult = mult.div("10^^308")
                                                                    return mult
    },
                autoUpgrade() { if (hasAchievement("a" , 195)) return true},

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Mega Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("p", 115) || player[this.layer].unlocked)},
})
