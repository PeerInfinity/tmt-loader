addLayer("sp", {
    name: "super-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        auto: false,
    }},
    passiveGeneration() {
        if (hasAchievement("a", 231)) return (hasAchievement("a", 231)?2:0)
        if (hasMilestone("hp", 6)) return (hasMilestone("hp", 6)?1:0)
        if (hasAchievement("a", 124)) return (hasAchievement("a", 51)?1:0)
        if (hasAchievement("a", 51)) return (hasAchievement("a", 51)?0.05:0)
        },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Super</h3><br>" + format(player.sp.points) + " SP"
      },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Super-Points, it will reset previous currencies.</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ],
                },
            },
            
        },
    upgrades: {
        11: {
            title: "Point Reset I (SP11)",
            description: "6x Points.",
            cost: new Decimal(1),
                },
    12: { 
        title: "Point Reset II (SP12)",
                description: "3x Points",
                cost: new Decimal(3),
                unlocked() {
                    return hasUpgrade("sp", 11)
                
                }
                },
                13: { 
                    title: "Extension (SP13)",
                            description: "Unlocks more Prestige Point Upgrades.",
                            cost: new Decimal(3),
                            unlocked() {
                                return hasUpgrade("sp", 12)
                            
                            }
                            },
                            14: { 
                                title:  "Point Booster (SP14)",
                                        description: "Super-Points boosts Points (Hardcaps at 100,000x)",
                                        cost: new Decimal(35),
                                        effect() {
                                            return player[this.layer].points.add(1).pow("0.5").min("1e5")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                        unlocked() {
                                            return hasUpgrade("sp", 13)
                                        
                                        }
                                        },
                                        15: { 
                                            title: "Point Reset III (SP15)",
                                                    description: "10x Points",
                                                    cost: new Decimal(175),
                                                    unlocked() {
                                                        return hasUpgrade("sp", 14)
                                                    
                                                    }
                                                    },
                                                    21: { 
                                                        title: "Super I (SP21)",
                                                                description: "3x Super-Points",
                                                                cost: new Decimal(2500),
                                                                unlocked() {
                                                                    return hasUpgrade("sp", 15)
                                                                
                                                                }
                                                                },
                                                                22: { 
                                                                    title: "Point Reset IV (SP22)",
                                                                            description: "3x Points",
                                                                            cost: new Decimal(20000),
                                                                            unlocked() {
                                                                                return hasUpgrade("sp", 21)
                                                                            
                                                                            }
                                                                            },
                                                                            23: { 
                                                                                title:  "Point-self II (SP23)",
                                                                                        description: "Super-Points boosts itself.",
                                                                                        cost: new Decimal(1.5e5),
                                                                                        effect() {
                                                                                            return player[this.layer].points.add(1).pow("0.01").min("1e3")
                                                                                        },
                                                                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                        unlocked() {
                                                                                            return hasUpgrade("sp", 22)
                                                                                        
                                                                                        }
                                                                                        },
                                                                                        24: { 
                                                                                            title:  "Super II (SP24)",
                                                                                                    description: "3x Super-Points and unlock a new layer.",
                                                                                                    cost: new Decimal(4e6),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("sp", 23)
                                                                                                    
                                                                                                    }
                                                                                                    },
                                                                                                    25: { 
                                                                                                        title:  "Super to Ultra (SP25)",
                                                                                                                description: "2x Ultra-Points.",
                                                                                                                cost: new Decimal(1e8),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("sp", 24)
                                                                                                                
                                                                                                                }
                                                                                                                },
                                                                                                                31: { 
                                                                                                                    title: "Point Reset V (SP31)",
                                                                                                                            description: "2x Points",
                                                                                                                            cost: new Decimal(5e8),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("sp", 25)
                                                                                                                            
                                                                                                                            }
                                                                                                                            },
                                                                                                                            32: { 
                                                                                                                                title: "Point Reset VI (SP32)",
                                                                                                                                        description: "5x Points",
                                                                                                                                        cost: new Decimal(5e9),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("sp", 31)
                                                                                                                                        
                                                                                                                                        }
                                                                                                                                        },
                                                                                                                                        33: { 
                                                                                                                                            title: "Point Reset VII (SP33)",
                                                                                                                                                    description: "3x Points",
                                                                                                                                                    cost: new Decimal(1e12),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("sp", 32)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                    },
                                                                                                                                                    34: { 
                                                                                                                                                        title: "Point Reset VIII (SP34)",
                                                                                                                                                                description: "2x Points",
                                                                                                                                                                cost: new Decimal(1e13),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("sp", 33)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                35: { 
                                                                                                                                                                    title: "Point Reset IX (SP35)",
                                                                                                                                                                            description: "4x Points",
                                                                                                                                                                            cost: new Decimal(1e14),
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("sp", 34)
                                                                                                                                                                            
                                                                                                                                                                            }
                                                                                                                                                                            },
                                                                                                                                                                            41: { 
                                                                                                                                                                                title:  "Super to Ultra II (SP41)",
                                                                                                                                                                                        description: "1.5x Ultra-Points.",
                                                                                                                                                                                        cost: new Decimal(1e15),
                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                            return hasUpgrade("sp", 35)
                                                                                                                                                                                        
                                                                                                                                                                                        }
                                                                                                                                                                                        },
                                                                                                                                                                                        42: { 
                                                                                                                                                                                            title: "Point Reset X (SP42)",
                                                                                                                                                                                                    description: "2.5x Points",
                                                                                                                                                                                                    cost: new Decimal(1e18),
                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                        return hasUpgrade("sp", 41)
                                                                                                                                                                                                    
                                                                                                                                                                                                    }
                                                                                                                                                                                                    },
                                                                                                                                                                                                    43: { 
                                                                                                                                                                                                        title: "Effectium (SP43)",
                                                                                                                                                                                                                description: "Points boosts Ultra-Points.",
                                                                                                                                                                                                                cost: new Decimal(1e27),
                                                                                                                                                                                                                effect() {
                                                                                                                                                                                                                    return player.points.add(1).pow("0.02")
                                                                                                                                                                                                                },
                                                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                    return hasUpgrade("hp", 12)
                                                                                                                                                                                                                
                                                                                                                                                                                                                }
                                                                                                                                                                                                                },
                                                                                                                                                                                                                44: { 
                                                                                                                                                                                                                    title: "Point Reset XI (SP44)",
                                                                                                                                                                                                                            description: "2x Points, Super-Points and Ultra-Points",
                                                                                                                                                                                                                            cost: new Decimal(1e27),
                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                return hasUpgrade("sp", 43)
                                                                                                                                                                                                                            
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            45: { 
                                                                                                                                                                                                                                title:  "Super to Ultra III (SP45)",
                                                                                                                                                                                                                                        description: "1.75x Ultra-Points.",
                                                                                                                                                                                                                                        cost: new Decimal(2e27),
                                                                                                                                                                                                                                        unlocked() {
                                                                                                                                                                                                                                            return hasUpgrade("sp", 44)
                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        51: { 
                                                                                                                                                                                                                                            title: "Point Reset XII (SP51)",
                                                                                                                                                                                                                                                    description: "10x Points",
                                                                                                                                                                                                                                                    cost: new Decimal(1e56),
                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                        return hasUpgrade("sp", 45)
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    52: { 
                                                                                                                                                                                                                                                        title: "Cells II (SP52)",
                                                                                                                                                                                                                                                                description: "Hyper-Points boosts Points.",
                                                                                                                                                                                                                                                                cost: new Decimal(1e57),
                                                                                                                                                                                                                                                                effect() {
                                                                                                                                                                                                                                                                    return player.hp.points.add(1).pow("0.5").min("1e5")
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                                                                                                                                unlocked() {
                                                                                                                                                                                                                                                                    return hasUpgrade("sp", 51)
                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                53: { title: "More Effects II (SP53)",
        description: "Prestige Upgrade 25 effect is added based on Super-Points.",
        cost: new Decimal(1e58),
        unlocked() {
            return hasUpgrade("sp", 52)
        },
        effect() {
            return player.sp.points.add(1).pow("0.001").min("1.25")
        },
        effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        54: { 
            title: "Point Reset XIII (SP54)",
                    description: "25x Points and 5x Super-Points!",
                    cost: new Decimal(1e85),
                    unlocked() {
                        return hasUpgrade("sp", 53)
                    
                    }
                    },
                    55: { 
                        title: "Point Reset XIV (SP55)",
                                description: "10x Points, 5x Super-Points and 2x Ultra-Points",
                                cost: new Decimal(1e87),
                                unlocked() {
                                    return hasUpgrade("sp", 54)
                                
                                }
                                },
                                61: { 
                                    title: "Point Reset XV (SP61)",
                                            description: "Gain a BIG BOOST of 210x Points!",
                                            cost: new Decimal(1e88),
                                            unlocked() {
                                                return hasUpgrade("sp", 55)
                                            
                                            }
                                            },
                                            62: { 
                                                title: "Point Reset XVI (SP62)",
                                                        description: "5x Points and Ultra-Points",
                                                        cost: new Decimal(1e95),
                                                        unlocked() {
                                                            return hasUpgrade("sp", 61)
                                                        
                                                        }
                                                        },
                                                        63: { 
                                                            title: "Point Reset XVII (SP63)",
                                                                    description: "5x Super-Points and +20% Hyper-Points",
                                                                    cost: new Decimal(1e98),
                                                                    
                                                                    unlocked() {
                                                                        return hasUpgrade("sp", 62)
                                                                    
                                                                    }
                        },
                        64: { 
                            title: "Point Upgrader IV (SP64)",
                                    description: "Every Points-2, you have boosts Super-Point gain by 1.2x",
                                    cost: new Decimal(1e111),
                                    effect() {
                                        let effect = Decimal.pow(1.2, player.pb2.points)
                                        if (hasMilestone('hp', 7)) effect = effect.pow(2.223901)
                                        return effect
                                    },
                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                    unlocked() {
                                        return hasUpgrade("sp", 63)
                                    
                                    }
                                    
},
65: { title: "Discount II (SP65)",
description: "Points-2 is cheaper based on super-points + make HPU42 and PU25 effect better.",
cost: new Decimal(1e112),
effect() {
    return player.sp.points.add(1).pow("0.1")
},
effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
unlocked() {
    return hasUpgrade("sp", 64)
}
},
71: { 
    title: "Point Reset XVIII (SP71)",
            description: "2x Points, Super-Points and Ultra-Points",
            cost: new Decimal(1e130),
            
            unlocked() {
                return hasUpgrade("sp", 65)
            
            }
},
72: { 
    title: "Point Reset XIX (SP72)",
            description: "25x Points, 5x Super-Points and Ultra-Points",
            cost: new Decimal(1e145),
            
            unlocked() {
                return hasUpgrade("sp", 71)
            
            }
},
73: { title: "Sub-Points I (SP73)",
        description: "Every Points-3, you have boosts point gain by +1% compounding.",
        cost: new Decimal(1e148),
        effect() {
            let effect = Decimal.pow(1.01, player.pb3.points)
            if (hasMilestone('hp', 16)) effect = effect.pow(2)
            if (hasMilestone('hp', 24)) effect = effect.pow(2)
            return effect
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("sp", 72)
        }
        },
        74: { 
            title: "Point Reset XX (SP74)",
                    description: "Double Hyper-Point Gain + GAIN A MASSIVE OF 10,000x ULTRA-POINTS AND POINTS",
                    cost: new Decimal(1e195),
                    
                    unlocked() {
                        return hasUpgrade("sp", 73)
                    
                    }
        },
        75: {
            title: "Hyper Staked (SP75)",
        description: "Hyper-Points boosts Ultra-Points.",
        cost: new Decimal(1e220),
        unlocked() {
            return hasUpgrade("sp", 74)
        },
        effect() {
            return player.hp.points.add(1).pow("0.1")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        81: { 
            title: "Risk (SP81)",
                    description: "50x Ultra-Points, 20x Super-Points but divide point gain by 20.",
                    cost: new Decimal(1e271),
                    unlocked() {
                        return hasUpgrade("sp", 75)
                    
                    }
        },
        82: { 
            title: "Point Reset XXI (SP82)",
                    description: "75,000x POINTS, 42x Super-Points and Ultra-Points",
                    cost: new Decimal("1e318"),
                    
                    unlocked() {
                        return hasUpgrade("sp", 81)
                    
                    }
        },
        83: { 
            title: "Point Reset XXII (SP83)",
                    description: "Triple Hyper-Points, 20x Super-Points, Ultra-Points and 400x Points.",
                    cost: new Decimal("1e507"),
                    
                    unlocked() {
                        return hasUpgrade("sp", 82)
                    
                    }
        },
        84: { 
            title: "Point Reset XXIII (SP84)",
                    description: "Been a while. 2x Everything except PP and MP.",
                    cost: new Decimal("1e1953"),
                    
                    unlocked() {
                        return hasUpgrade("sp", 83)
                    
                    }
        },
        85: { 
            title: "The Mega of Super (SP85)",
                    description: "Been a while again. Double Mega-Point Gain",
                    cost: new Decimal("1e3700"),
                    
                    unlocked() {
                        return hasUpgrade("sp", 84)
                    
                    }
        },
        91: { 
            title: "The Super of Resources (SP91)",
                    description: "5x Energy and Light",
                    cost: new Decimal("1e5735"),
                    
                    unlocked() {
                        return hasUpgrade("sp", 85)
                    
                    }
        },
        92: { title: "Mega to Points (SP92)",
                                        description: "Points boosts Mega-Points",
                                        cost: new Decimal("1e10400"),
                                        unlocked() {
                                            return hasUpgrade("sp", 91)
                                        },
                                        effect() {
                                            return player.points.add(1).pow("0.00005")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        93: {
                                            title: "Energilizer (SP93)",
                                        description: "Energy boosts itself.",
                                        cost: new Decimal("1e11680"),
                                        unlocked() {
                                            return hasUpgrade("sp", 92)
                                        },
                                        effect() {
                                            return player.e.points.add(1).pow("0.04")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        94: {
                                            title: "Lightify (SP94)",
                                        description: "Light boosts itself.",
                                        cost: new Decimal("1e11950"),
                                        unlocked() {
                                            return hasUpgrade("sp", 93)
                                        },
                                        effect() {
                                            return player.l.points.add(1).pow("0.05")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
            },
            autoUpgrade() { if (hasAchievement("a" , 54)) return true},
            color: "red",
    requires: new Decimal(1e7), // Can be a function that takes requirement increases into account
    resource: "Super-Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["p"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.333333333333333333, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        if (hasUpgrade('p', 42)) mult = mult.times(upgradeEffect('p', 42))
        if (hasUpgrade('p', 43)) mult = mult.times(3)
        if (hasUpgrade('sp', 21)) mult = mult.times(3)
        if (hasUpgrade('p', 44)) mult = mult.times(3)
        if (hasUpgrade('sp', 24)) mult = mult.times(3)
        if (hasUpgrade('up', 14)) mult = mult.times(4)
        if (hasUpgrade('p', 51)) mult = mult.times(4)
        if (hasUpgrade('p', 52)) mult = mult.times(2)
        if (hasUpgrade('up', 24)) mult = mult.times(3)
        if (hasUpgrade('p', 55)) mult = mult.times(3)
        if (hasUpgrade('p', 61)) mult = mult.times(15)
        if (hasUpgrade('hp', 11)) mult = mult.times(upgradeEffect('hp', 11))
        if (hasUpgrade('sp', 44)) mult = mult.times(2)
        if (hasUpgrade('up', 35)) mult = mult.times(upgradeEffect('up', 35))
        if (hasUpgrade('hp', 13)) mult = mult.times(16)
        if (hasUpgrade('hp', 15)) mult = mult.pow(upgradeEffect('hp', 15))
        if (hasUpgrade('hp', 23)) mult = mult.times(upgradeEffect('hp', 23))
        if (hasUpgrade('hp', 31)) mult = mult.times(upgradeEffect('hp', 31))
        if (hasUpgrade('up', 41)) mult = mult.times(2)
        if (hasUpgrade('hp', 41)) mult = mult.times(upgradeEffect('hp', 41))
        if (hasUpgrade('up', 42)) mult = mult.times(upgradeEffect('up', 42))
        if (hasAchievement('a', 55)) mult = mult.times(2)
        if (hasUpgrade('up', 43)) mult = mult.times(10)
        if (hasUpgrade('p', 62)) mult = mult.times(9)
        if (hasUpgrade('p', 64)) mult = mult.times(2.5)
        if (hasUpgrade('hp', 44)) mult = mult.times(500)
        if (hasUpgrade('p', 65)) mult = mult.times(2)
        if (hasUpgrade('up', 44)) mult = mult.times(3)
        if (hasUpgrade('sp', 54)) mult = mult.times(5)
        if (hasUpgrade('sp', 55)) mult = mult.times(5)
        if (hasAchievement('a', 65)) mult = mult.times(2)
        if (hasUpgrade('p', 71)) mult = mult.times(3)
        if (hasUpgrade('sp', 63)) mult = mult.times(5)
        if (hasUpgrade('p', 73)) mult = mult.times(3)
        if (hasUpgrade('up', 51)) mult = mult.times(5)
        if (hasUpgrade('sp', 64)) mult = mult.times(upgradeEffect('sp', 64))
        if (inChallenge("hp", 11)) mult = mult.pow(0.75)
        if (hasUpgrade('sp', 71)) mult = mult.times(2)
        if (hasMilestone('hp', 5)) mult = mult.times("10")
        if (hasUpgrade('sp', 72)) mult = mult.times(5)
        if (hasMilestone('hp', 8)) mult = mult.times(milestoneEffect('hp', 8))
        if (hasUpgrade('p',84)) mult = mult.times(20)
        if (hasAchievement('a', 75)) mult = mult.times(2)
        if (hasUpgrade('p',92)) mult = mult.times(4)
        if (hasUpgrade('up', 55)) mult = mult.times("10")
        if (hasUpgrade('hp', 55)) mult = mult.times("1000")
        if (hasMilestone('hp', 12)) mult = mult.pow(1.2)
        if (hasUpgrade('sp', 81)) mult = mult.times("20")
            if (hasUpgrade('up', 64)) mult = mult.times(333)
            if (hasAchievement('a', 85)) mult = mult.times(2)
            if (hasUpgrade('sp', 82)) mult = mult.times("42")
            if (hasUpgrade('up', 65)) mult = mult.times(4)
            mult = mult.times(buyableEffect('hp', 11))
            if (hasUpgrade('sp', 83)) mult = mult.times(20)
            if (hasAchievement('a', 95)) mult = mult.times(2)
            if (inChallenge("hp", 22)) mult = mult.pow(0.2)
            if (hasUpgrade('up', 71)) mult = mult.times(10)
            if (hasUpgrade('p', 113)) mult = mult.times("10")
            if (hasUpgrade('p', 115)) mult = mult.times("10")
            if (hasAchievement('a', 105)) mult = mult.times("2")
            if (hasUpgrade('p', 16)) mult = mult.times("20")
            if (hasUpgrade('p', 56)) mult = mult.times("1e10")
            if (hasUpgrade('up', 73)) mult = mult.times(1e9)
            if (hasUpgrade('up', 74)) mult = mult.times("100000")
            if (hasAchievement('a', 115)) mult = mult.times("2")
            mult = mult.times(buyableEffect('hp', 13))
            if (hasAchievement('a', 125)) mult = mult.times("2")
            if (hasUpgrade('p', 86)) mult = mult.times("1000")
            if (hasAchievement('a', 135)) mult = mult.times("2")
            if (hasChallenge('hp', 31)) mult = mult.times(1e6)
            if (hasChallenge('hp', 32)) mult = mult.times(1e6)
            if (hasUpgrade('mp', 32)) mult = mult.times(1e18)
            if (hasUpgrade('sp', 84)) mult = mult.times("2")
            if (hasUpgrade('p', 96)) mult = mult.times(upgradeEffect('p', 96))
            if (hasAchievement('a', 145)) mult = mult.times("2")
            if (hasChallenge('hp', 41)) mult = mult.pow(1.02)
            if (hasAchievement('a', 155)) mult = mult.times("2")
            if (hasUpgrade('mp', 45)) mult = mult.pow(1.02)
            if (hasUpgrade('pb5', 11)) mult = mult.div(upgradeEffect('pb5', 11))
            if (inChallenge("hp", 42)) mult = mult.pow(0.55)
            if (hasChallenge('hp', 51)) mult = mult.times(1000)
            if (hasUpgrade('mp', 62)) mult = mult.times(upgradeEffect('mp', 62))
            if (hasAchievement('a', 165)) mult = mult.times("2")
            if (hasUpgrade('p', 116)) mult = mult.times(upgradeEffect('p', 116))
            if (hasUpgrade('mp', 74)) mult = mult.times(upgradeEffect('mp', 74))
            if (hasUpgrade('hp', 73)) mult = mult.times(upgradeEffect('hp', 73))
            if (hasUpgrade('up', 82)) mult = mult.times(upgradeEffect('up', 82))
            if (hasUpgrade('hp', 81)) mult = mult.times(upgradeEffect('hp', 81))
            if (hasAchievement('a', 175)) mult = mult.times("2")
            if (hasMilestone('sa', 1)) mult = mult.times("5")
            if (hasMilestone('sa', 2)) mult = mult.times("5")
            if (hasMilestone('sa', 3)) mult = mult.times("3")
            if (hasUpgrade('e', 25)) mult = mult.times(upgradeEffect('e',25))
            if (hasMilestone('sa', 8)) mult = mult.times("1e9")
            if (hasMilestone('sa', 9)) mult = mult.times("20")
            if (hasMilestone('sa', 10)) mult = mult.times("7.5")
                                     if (hasUpgrade('e', 43)) mult = mult.times(upgradeEffect('e',43))
                                                              if (inChallenge("sa", 11)) mult = mult.div("10^^308")
                                                              if (hasAchievement('a', 205)) mult = mult.times("10")
                                                              if (hasUpgrade('scp', 104)) mult = mult.pow("1.05")
                         if (hasAchievement('a', 245)) mult = mult.times("10")
                         if (hasMilestone('st', 1)) mult = mult.times(250)
                         if (inChallenge("mp", 21)) mult = mult.div("10^^308")
                                 if (hasUpgrade('cp', 74)) mult = mult.pow("1.075")
                                    if (inChallenge("rp", 12)) mult = mult.div("10^^308")
                                                              return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for Super Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("p", 31) || player[this.layer].unlocked)},
})
