addLayer("up", {
    name: "ultra-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() {
        if (hasAchievement("a", 231)) return (hasAchievement("a", 231)?2:0)
        if (hasAchievement("a", 191)) return (hasAchievement("a", 191)?1:0)
        if (hasMilestone("mp", 4)) return (hasMilestone("mp", 4)?1:0)
        if (hasAchievement("a", 121)) return (hasAchievement("a", 121)?0.05:0)
        },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Ultra</h3><br>" + format(player.up.points) + " UP"
      },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Ultra-Points, it will let you unlock 3 sub-layers for a boost to points and they are still unlocked if u do the next row reset.</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ],
                },
            },
        },
    upgrades: {
        11: {
            title: "The Time I (UP11)",
            description: "Unlocks a sub-layer on row 2.",
            cost: new Decimal(1),
                },
    12: { 
        title: "The Time II (UP12)",
                description: "Unlock another sub-layer on row 2.",
                cost: new Decimal(4),
                unlocked() {
                    return hasUpgrade("up", 11)
                
                }
                },
                13: { 
                    title: "Pointer I (UP13)",
                            description: "7.5x Points",
                            cost: new Decimal(10),
                            unlocked() {
                                return hasUpgrade("up", 12)
                            
                            }
                            },
                            14: { 
                                title: "Pointer II (UP14)",
                                        description: "4x Super-Points",
                                        cost: new Decimal(15),
                                        unlocked() {
                                            return hasUpgrade("up", 13)
                                        
                                        }
                                        },
                                        15: { 
                                            title: "Point-self III (UP15)",
                                                    description: "Points boosts itself at a very reduced rate yet again.",
                                                    cost: new Decimal(35),
                                                    effect() {
                                                        return player.points.add(1).pow("0.01").min("1e3")
                                                    },
                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                    unlocked() {
                                                        return hasUpgrade("up", 14)
                                                    
                                                    }
                                                    },
                                                    21: { 
                                                        title: "The Time III (UP21)",
                                                                description: "Unlock the third sub-layer on row 2.",
                                                                cost: new Decimal(150),
                                                                unlocked() {
                                                                    return hasUpgrade("up", 15)
                                                                
                                                                }
                                                                },
                                                                22: { 
                                                                    title: "More Points (UP22)",
                                                                            description: "3x Ultra-Points.",
                                                                            cost: new Decimal(250),
                                                                            unlocked() {
                                                                                return hasUpgrade("up", 21)
                                                                            
                                                                            }
                                                                            },
                                                                            23: { 
                                                                                title: "Pointer III (UP23)",
                                                                                        description: "2x Points.",
                                                                                        cost: new Decimal(400),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("up", 22)
                                                                                        
                                                                                        }
                                                                                        },
                                                                                        24: { 
                                                                                            title: "Pointer IV (UP24)",
                                                                                                    description: "3x Super-Points.",
                                                                                                    cost: new Decimal(1500),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("up", 23)
                                                                                                    
                                                                                                    }
                                                                                                    },
                                                                                                    25: { 
                                                                                                        title: "More Points II (UP25)",
                                                                                                                description: "1.5x Ultra-Points.",
                                                                                                                cost: new Decimal(2000),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("up", 24)
                                                                                                                
                                                                                                                }
                                                                                                                },
                                                                                                                31: { 
                                                                                                                    title: "Pointer V (UP31)",
                                                                                                                            description: "3x Points.",
                                                                                                                            cost: new Decimal(6000),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("up", 25)
                                                                                                                            
                                                                                                                            }
                                                                                                                            },
                                                                                                                            32: { 
                                                                                                                                title: "Pointer VI (UP32)",
                                                                                                                                        description: "3x Points and Ultra-Points.",
                                                                                                                                        cost: new Decimal(25000),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("up", 31)
                                                                                                                                        
                                                                                                                                        }
                                                                                                                                        },
                                                                                                                                        33: { 
                                                                                                                                            title: "More Points III (UP33)",
                                                                                                                                                    description: "1.5x Ultra-Points.",
                                                                                                                                                    cost: new Decimal(25000),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("up", 32)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                    },
                                                                                                                                                    34: { 
                                                                                                                                                        title: "Extension II (UP34)",
                                                                                                                                                                description: "Unlock 1 new prestige upgrade.",
                                                                                                                                                                cost: new Decimal(100000),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("up", 33)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                35: { 
                                                                                                                                                                    title: "Ultra-Points are now worth (UP35)",
                                                                                                                                                                            description: "Ultra Points boosts Super-Points",
                                                                                                                                                                            cost: new Decimal(1.111111111111111111111111111e11),
                                                                                                                                                                            effect() {
                                                                                                                                                                                return player[this.layer].points.add(1).pow("0.1").min("1e3")
                                                                                                                                                                            },
                                                                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("up", 34)
                                                                                                                                                                            
                                                                                                                                                                            }
                                                                                                                                                                            },
                                                                                                                                                                            41: { 
                                                                                                                                                                                title: "Pointer VII (UP41)",
                                                                                                                                                                                        description: "10x Points, 2x Super-Points and Ultra-Points.",
                                                                                                                                                                                        cost: new Decimal(1e20),
                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                            return hasUpgrade("up", 35)
                                                                                                                                                                                        
                                                                                                                                                                                        }
                                                                                                                                                                                        },
                                                                                                                                                                                        42: { 
                                                                                                                                                                                            title: "Ultra-Points are now worth II (UP42)",
                                                                                                                                                                                                    description: "Ultra Points boosts Super-Points again",
                                                                                                                                                                                                    cost: new Decimal(1e24),
                                                                                                                                                                                                    effect() {
                                                                                                                                                                                                        return player[this.layer].points.add(1).pow("0.07")
                                                                                                                                                                                                    },
                                                                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                        return hasUpgrade("up", 41)
                                                                                                                                                                                                    
                                                                                                                                                                                                    }
                                                                                                                                                                                                    },
                                                                                                                                                                                                    43: { 
                                                                                                                                                                                                        title: "Pointer VIII (UP43)",
                                                                                                                                                                                                                description: "10x Points and Super-Points.",
                                                                                                                                                                                                                cost: new Decimal(2.5e26),
                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                    return hasUpgrade("up", 42)
                                                                                                                                                                                                                
                                                                                                                                                                                                                }
                                                                                                                                                                                                                },
                                                                                                                                                                                                                44: { 
                                                                                                                                                                                                                    title: "Pointer IX (UP44)",
                                                                                                                                                                                                                            description: "3x Points, Super-Points and Ultra-Points",
                                                                                                                                                                                                                            cost: new Decimal(2e35),
                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                return hasUpgrade("up", 43)
                                                                                                                                                                                                                            
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            45: { 
                                                                                                                                                                                                                                title: "Pointer X (UP45)",
                                                                                                                                                                                                                                        description: "Gain a BIG boost of 150x Points!",
                                                                                                                                                                                                                                        cost: new Decimal(1e41),
                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                            return hasUpgrade("up", 44)
                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        51: { 
                                                                                                                                                                                                                                            title: "Pointer XI (UP51)",
                                                                                                                                                                                                                                                    description: "40x Points, 5x Super-Points and 3x Ultra-Points.",
                                                                                                                                                                                                                                                    cost: new Decimal(3e45),
                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                        return hasUpgrade("up", 45)
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    52: { title: "Sub-Points II (UP52)",
        description: "Every Points-2, you have boosts point gain by +25% compounding.",
        cost: new Decimal(1e66),
        effect() {
            let effect = Decimal.pow(1.25, player.pb2.points)
            if (hasMilestone('hp', 17)) effect = effect.pow(3.1063)
            return effect
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("up", 51)
        }
        },
        53: { 
            title: "Pointer XII (UP53)",
                    description: "100x Points.",
                    cost: new Decimal(1e77),
                    unlocked() {
                        return hasUpgrade("up", 52)
                    
                    }
                    },
                    54: { 
                        title: "Pointer XIII (UP54)",
                                description: "20x Points.",
                                cost: new Decimal(5e77),
                                unlocked() {
                                    return hasUpgrade("up", 53)
                                
                                }
                                },
                                55: { 
                                    title: "Pointer XIV (UP55)",
                                            description: "10x Points, Super-Points and Ultra-Points.",
                                            cost: new Decimal(5e77),
                                            unlocked() {
                                                return hasUpgrade("up", 54)
                                            
                                            }
                                            },
                                            61: { 
                                                title: "Pointer XV (UP61)",
                                                        description: "GAIN A HUGE BOOST OF 10,000x POINTS and Double Hyper-Point Gain.",
                                                        cost: new Decimal(1e100),
                                                        unlocked() {
                                                            return hasUpgrade("up", 55)
                                                        
                                                        }
                                                        },
                                                        62: { 
                                                            title: "Pointer XVI (UP62)",
                                                                    description: "10x Points",
                                                                    cost: new Decimal(1e108),
                                                                    unlocked() {
                                                                        return hasUpgrade("up", 61)
                                                                    
                                                                    }
                                                                    },
                                                                    63: { 
                                                                        title: "Pointer XVII (UP63)",
                                                                                description: "Triple Hyper-Points Gain",
                                                                                cost: new Decimal(1e133),
                                                                                unlocked() {
                                                                                    return hasUpgrade("up", 62)
                                                                                
                                                                                }
                                                                                },
                                                                                64: { 
                                                                                    title: "Pointer XVIII (UP64)",
                                                                                            description: "Triple Hyper-Point Gain again, 33x Ultra-Points, 333x Super-Points and A INSANITY BOOST OF 120,000,000x POINTS!!!!!",
                                                                                            cost: new Decimal(1e144),
                                                                                            unlocked() {
                                                                                                return hasUpgrade("up", 63)
                                                                                            
                                                                                            }
                                                                                            },
                                                                                            65: { 
                                                                                                title: "Pointer XIX (UP65)",
                                                                                                        description: "Double Hyper-Point, Triple Ultra-Points, 4x Super-Points and 5x Points",
                                                                                                        cost: new Decimal(5e155),
                                                                                                        unlocked() {
                                                                                                            return hasUpgrade("up", 64)
                                                                                                        
                                                                                                        }
                                                                                                        },
                                                                                                        71: { 
                                                                                                            title: "Pointer XX (UP71)",
                                                                                                                    description: "Double Hyper-Point again, 10x Ultra-Points, Super-Points and Points",
                                                                                                                    cost: new Decimal(1e298),
                                                                                                                    unlocked() {
                                                                                                                        return hasUpgrade("up", 65)
                                                                                                                    
                                                                                                                    }
                                                                                                                    },
                                                                                                                    72: { 
                                                                                                                        title: "Pointer XXI (UP72)",
                                                                                                                                description: "GAIN A ULTIMATE BOOST OF 1e18x POINTS!!!",
                                                                                                                                cost: new Decimal("1e402"),
                                                                                                                                unlocked() {
                                                                                                                                    return hasUpgrade("up", 71)
                                                                                                                                
                                                                                                                                }
                                                                                                                                },
                                                                                                                                73: { 
                                                                                                                                    title: "Pointer XXII (UP73)",
                                                                                                                                            description: "GAIN A ULTIMATE BOOST OF 1,000,000,000x SUPER-POINTS AND ULTRA-POINTS!!!",
                                                                                                                                            cost: new Decimal("1e544"),
                                                                                                                                            unlocked() {
                                                                                                                                                return hasUpgrade("up", 72)
                                                                                                                                            
                                                                                                                                            }
                                                                                                                                            },
                                                                                                                                            74: { 
                                                                                                                                                title: "Pointer XXIII (UP74)",
                                                                                                                                                        description: "Gain a big boost of 100,000x Points, Super-Points and Ultra-Points.",
                                                                                                                                                        cost: new Decimal("1e565"),
                                                                                                                                                        unlocked() {
                                                                                                                                                            return hasUpgrade("up", 73)
                                                                                                                                                        
                                                                                                                                                        }
                                                                                                                                                        },  
                                                                                                                                                        75: { 
                                                                                                                                                            title: "Buy (UP75)",
                                                                                                                                                                    description: "Unlock a new buyable on hyper-points.",
                                                                                                                                                                    cost: new Decimal("1e710"),
                                                                                                                                                                    unlocked() {
                                                                                                                                                                        return hasUpgrade("up", 74)
                                                                                                                                                                    
                                                                                                                                                                    }
                                                                                                                                                                    },   
                                                                                                                                                                    81: { 
                                                                                                                                                                        title: "Ultra-Mega (UP81)",
                                                                                                                                                                                description: "+75% Mega-Points",
                                                                                                                                                                                cost: new Decimal("1e1120"),
                                                                                                                                                                                unlocked() {
                                                                                                                                                                                    return hasUpgrade("up", 75)
                                                                                                                                                                                
                                                                                                                                                                                }
                                                                                                                                                                                },    
                                                                                                                                                                                82: {
                                            title: "Air Super Booster (UP82)",
                                            description: "Been a while. Every Air you have boosts super-point gain by 1e12x",
                                            cost: new Decimal("1e2250"),
                                            effect() {
                                                let effect = Decimal.pow(1e12, player.ai.points)
                                                return effect
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                            unlocked() {
                                                return hasUpgrade("up", 81)
                                            
                                            }      
                                        },                                                                                                                                      
                                        83: {
                                            title: "Air Point Booster (UP83)",
                                            description: "Every Air you have boosts point gain by 1e15x",
                                            cost: new Decimal("1e2285"),
                                            effect() {
                                                let effect = Decimal.pow(1e15, player.ai.points)
                                                return effect
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                            unlocked() {
                                                return hasUpgrade("up", 82)
                                            
                                            }      
                                        },              
                                        84: { title: "Energetic Points III (UP84)",
                                        description: "Ultra-Points boosts Energy & Light",
                                        cost: new Decimal("1e3605"),
                                        unlocked() {
                                            return hasUpgrade("up", 83)
                                        },
                                        effect() {
                                            return player.up.points.add(1).pow("0.0004")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },     
                                        85: { title: "Energetic Points IV (UP85)",
                                        description: "Hyper-Points boosts Energy & Light",
                                        cost: new Decimal("1e3950"),
                                        unlocked() {
                                            return hasUpgrade("up", 83)
                                        },
                                        effect() {
                                            return player.hp.points.add(1).pow("0.002")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        91: { title: "Mega-itself (UP91)",
                                        description: "Mega-Points boosts itself.",
                                        cost: new Decimal("1e5440"),
                                        unlocked() {
                                            return hasUpgrade("up", 85)
                                        },
                                        effect() {
                                            return player.mp.points.add(1).pow("0.04")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        }, 
                                        92: { title: "Mega-itself (UP92)",
                                        description: "Points-3 boosts Energy & Light",
                                        cost: new Decimal("1e6200"),
                                        unlocked() {
                                            return hasUpgrade("up", 91)
                                        },
                                        effect() {
                                            return player.pb3.points.add(1).pow("1")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        93: { title: "Energy Boost III (UP93)",
                                        description: "15x Light and 200x Energy",
                                        cost: new Decimal("1e7290"),
                                        unlocked() {
                                            return hasUpgrade("up", 92)
                                        },       
                                        },                                                                                                                                                                           
            },
            autoUpgrade() { if (hasAchievement("a" , 54)) return true},
    color: "pink",
    requires: new Decimal(2.5e7), // Can be a function that takes requirement increases into account
    resource: "Ultra-Points", // Name of prestige currency
    baseResource: "Super-Points", // Name of resource prestige is based on
    baseAmount() {return player.sp.points}, // Get the current amount of baseResource
    branches: ["sp", "hp", "pb4", "pb5", "pb6"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        if (hasUpgrade('sp', 25)) mult = mult.times(2)
        if (hasUpgrade('p', 52)) mult = mult.times(1.5)
        if (hasUpgrade('up', 22)) mult = mult.times(3)
        if (hasUpgrade('sp', 41)) mult = mult.times(1.5)
        if (hasUpgrade('up', 25)) mult = mult.times(1.5)
        if (hasUpgrade('up', 32)) mult = mult.times(3)
        if (hasUpgrade('up', 33)) mult = mult.times(1.5)
        if (hasUpgrade('p', 61)) mult = mult.times(5)
        if (hasUpgrade('hp', 11)) mult = mult.times(upgradeEffect('hp', 11))
        if (hasUpgrade('sp', 43)) mult = mult.times(upgradeEffect('sp', 43))
        if (hasUpgrade('sp', 44)) mult = mult.times(2)
        if (hasUpgrade('sp', 45)) mult = mult.times(1.75)
        if (hasUpgrade('hp', 14)) mult = mult.times(upgradeEffect('hp', 14))
        if (hasUpgrade('hp', 22)) mult = mult.times(upgradeEffect('hp', 22))
        if (hasUpgrade('hp', 33)) mult = mult.times(upgradeEffect('hp', 33))
        if (hasUpgrade('up', 41)) mult = mult.times(2)
        if (hasUpgrade('hp', 35)) mult = mult.times(upgradeEffect('hp', 35))
        if (hasUpgrade('p', 62)) mult = mult.times(6)
        if (hasUpgrade('up', 44)) mult = mult.times(3)
        if (hasUpgrade('sp', 55)) mult = mult.times(2)
        if (hasUpgrade('hp', 45)) mult = mult.times(50)
        if (hasUpgrade('sp', 62)) mult = mult.times(5)
        if (hasUpgrade('p', 71)) mult = mult.times(2)
        if (hasUpgrade('p', 73)) mult = mult.times(3)
        if (hasUpgrade('up', 51)) mult = mult.times(3)
        if (inChallenge("hp", 11)) mult = mult.pow(0.75)
        if (hasUpgrade('sp', 71)) mult = mult.times(2)
        if (hasMilestone('hp', 5)) mult = mult.times("10")
        if (hasUpgrade('sp', 72)) mult = mult.times(5)
        if (hasUpgrade('p',84)) mult = mult.times(2)
        if (hasUpgrade('p',93)) mult = mult.times(5)
        if (hasUpgrade('sp', 74)) mult = mult.times("10000")
        if (hasUpgrade('up', 55)) mult = mult.times("10")
        if (hasUpgrade('sp', 75)) mult = mult.times(upgradeEffect('sp', 75))
        if (hasUpgrade('sp', 81)) mult = mult.times("50")
        if (hasMilestone('hp', 13)) mult = mult.pow(1.25)
        if (hasUpgrade('up', 64)) mult = mult.times(33)
        if (hasUpgrade('sp', 82)) mult = mult.times("42")
        if (hasUpgrade('up', 65)) mult = mult.times(3)
        mult = mult.times(buyableEffect('hp', 11))
        if (hasUpgrade('sp', 83)) mult = mult.times(20)
        if (hasMilestone('hp', 21)) mult = mult.times(milestoneEffect('hp', 21))
        if (inChallenge("hp", 22)) mult = mult.pow(0.2)
        if (hasUpgrade('up', 71)) mult = mult.times(10)
        if (hasUpgrade('p', 113)) mult = mult.times("10")
        if (hasUpgrade('p', 115)) mult = mult.times("10")
        if (hasUpgrade('p', 16)) mult = mult.times("20")
        if (hasUpgrade('p', 56)) mult = mult.times("1e10")
        if (hasMilestone('p', 76)) mult = mult.times(milestoneEffect('p', 76))
        if (hasUpgrade('up', 73)) mult = mult.times(1e9)
        if (hasUpgrade('up', 74)) mult = mult.times("100000")
        mult = mult.times(buyableEffect('hp', 13))
        if (hasUpgrade('p', 86)) mult = mult.times("1000")
        if (hasUpgrade('pb4', 11)) mult = mult.div(upgradeEffect('pb4', 11))
        if (inChallenge("mp", 11)) mult = mult.div("1e123123")
        if (hasChallenge('hp', 31)) mult = mult.times(1e6)
        if (hasChallenge('hp', 32)) mult = mult.times(1e6)
        if (hasUpgrade('mp', 33)) mult = mult.times(1e10)
        if (hasUpgrade('sp', 84)) mult = mult.times("2")
        if (inChallenge("hp", 42)) mult = mult.pow(0.55)
        if (hasUpgrade('mp', 54)) mult = mult.pow(1.02)
        if (hasUpgrade('mp', 55)) mult = mult.times(upgradeEffect('mp', 55))
        if (hasChallenge('hp', 51)) mult = mult.times(1000)
        if (hasUpgrade('mp', 71)) mult = mult.times(upgradeEffect('mp', 71))
        if (hasUpgrade('p', 121)) mult = mult.times(upgradeEffect('p', 121))
        if (hasUpgrade('hp', 73)) mult = mult.times(upgradeEffect('hp', 73))
        if (hasUpgrade('hp', 75)) mult = mult.times(upgradeEffect('hp', 75))
        if (hasUpgrade('hp', 82)) mult = mult.times(upgradeEffect('hp', 82))
        if (inChallenge("mp", 12)) mult = mult.div("1e123123")
        if (hasMilestone('sa', 1)) mult = mult.times("5")
        if (hasMilestone('sa', 2)) mult = mult.times("5")
        if (hasMilestone('sa', 3)) mult = mult.times("3")
     if (hasUpgrade('e', 25)) mult = mult.times(upgradeEffect('e',25))
                 if (hasAchievement('a', 185)) mult = mult.times("1e5")
                 if (hasMilestone('sa', 8)) mult = mult.times("1e9")
                         if (hasMilestone('sa', 9)) mult = mult.times("20")
                         if (hasMilestone('sa', 10)) mult = mult.times("7.5")
                         if (hasUpgrade('e', 42)) mult = mult.times(upgradeEffect('e',42))
                         if (inChallenge("sa", 11)) mult = mult.div("10^^308")
                         if (hasAchievement('a', 205)) mult = mult.times("10")
                         if (hasUpgrade('e', 64)) mult = mult.pow("1.05")
                         if (hasAchievement('a', 245)) mult = mult.times("10")
                         if (hasMilestone('st', 1)) mult = mult.times(250)
                         if (hasUpgrade('cp', 52)) mult = mult.pow("1.05")
                         if (inChallenge("mp", 21)) mult = mult.div("10^^308")
                                     if (inChallenge("rp", 12)) mult = mult.div("10^^308")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for Ultra Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("sp", 24) || player[this.layer].unlocked)},
})
