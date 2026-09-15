addLayer("hp", {
    name: "hyper-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Hyper</h3><br>" + format(player.hp.points) + " HP"
      },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Hyper-Points!<br> This has more unique stuff.</h4>`],
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
                    unlocked() {return (hasUpgrade("hp", 52))},
            content: [
                ["blank", "15px"],
                ["challenges", [1,2,3,4,5,6]]
                
            ]
                },
                "Buyables": {
                unlocked() {return (hasUpgrade("p", 112))},
                        content: [
                    ["blank", "15px"],
                    "buyables"
                        ]
        },
    },
        },
        
        challenges: {
            11: {
                    name: "Harder",
                    challengeDescription: "Points, Super-Points and Ultra-Points is decreased to ^0.75.",
                    goalDescription: "1e80 Points",
                    rewardDescription: "Double Hyper-Point Gain and reach a milestone.",
                    canComplete: function() {return player.points.gte("1e80")},
                    unlocked() { return (hasUpgrade('hp', 53)) },
            },
            12: {
                name: "Less Sub-Points",
                challengeDescription: "Points-1, Points-2 and Points-3 cost scaling is 10% higher",
                goalDescription: "1e200 Points",
                rewardDescription: "Double Hyper-Point Gain and reach a milestone again.",
                canComplete: function() {return player.points.gte("1e200")},
                unlocked() { return (hasUpgrade('hp', 53)) },
            },
        21: {
            name: "Point-less",
            challengeDescription: "Points gain is decreased to ^0.1!",
            goalDescription: "1e24 Ultra-Points",
            rewardDescription: "Double Hyper-Point Gain and reach a milestone again.",
            canComplete: function() {return player.up.points.gte("1e24")},
            unlocked() { return (hasUpgrade('hp', 53)) },
        },
    22: {
        name: "Point-fall",
        challengeDescription: "Every normal resource below Hyper-Points is reduced to ^0.2.",
        goalDescription: "1e33 Points",
        rewardDescription: "Double Hyper-Point Gain and reach a milestone.",
        canComplete: function() {return player.points.gte("1e33")},
        unlocked() { return (hasUpgrade('hp', 53)) },
    },
31: {
    name: "Less Sub-Points 2",
    challengeDescription: "Points-1, Points-2 and Points-3 cost scaling is 20% higher",
    goalDescription: "1e1,000 Points",
    rewardDescription: "4x Hyper-Point Gain, 1,000,000x Super-Points and Ultra-Points and ^1.01 Points.",
    canComplete: function() {return player.points.gte("e1000")},
    unlocked() { return (hasChallenge('mp', 11)) },
},
32: {
    name: "Less Sub-Points 3",
    challengeDescription: "Points-1, Points-2 and Points-3 cost scaling is 40% higher",
    goalDescription: "1e1,000 Points",
    rewardDescription: "8x Hyper-Point Gain, 1,000,000x Super-Points and Ultra-Points and ^1.01 Points again.",
    canComplete: function() {return player.points.gte("1e1000")},
    unlocked() { return (hasChallenge('hp', 31)) },
},
41: {
    name: "Point-less 2",
    challengeDescription: "Points gain is decreased to ^0.01!",
    goalDescription: "100,000 Points",
    rewardDescription: "4x Hyper-Point Gain, ^1.02 Super-Points",
    canComplete: function() {return player.points.gte("1e5")},
    unlocked() { return (hasChallenge('hp', 32)) },
},
42: {
    name: "Harder 2",
    challengeDescription: "Points, Super-Points and Ultra-Points is decreased to ^0.55.",
    goalDescription: "1e615 Points",
    rewardDescription: "4x Hyper-Point Gain and 100,000x Points.",
    canComplete: function() {return player.points.gte("1e615")},
    unlocked() { return (hasChallenge('hp', 41)) },
},
51: {
    name: "Less Sub-Points 4",
    challengeDescription: "Points-1, Points-2 and Points-3 cost scaling is 80% higher",
    goalDescription: "1e2,000 Points",
    rewardDescription: "16x Hyper-Point Gain, 1,000x Super-Points, Ultra-Points and Points.",
    canComplete: function() {return player.points.gte("1e2000")},
    unlocked() { return (hasChallenge('hp', 42)) },
},
        },
    upgrades: {
        11: { title: "Cells (HP11)",
        description: "Points boosts Ultra-Points, Super-Points and itself.",
        cost: new Decimal(1),
        effect() {
            return player.points.add(1).pow("0.04")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    12: { 
        title: "Extension III (HP12)",
                description: "Unlocks more Super-Point Upgrades.",
                cost: new Decimal(1),
                unlocked() {
                    return hasUpgrade("hp", 11)
                
                }    
            },
                13: { 
                    title: "Achievementarist (HP13)",
                            description: "Gain 16x Super-Points from achievements.",
                            cost: new Decimal(2),
                            unlocked() {
                                return hasUpgrade("hp", 12)
                            
                            }                                                           
                        },
                        14: { title: "Achievementarist II (HP14)",
        description: "Ultra-Points boosts itself.",
        cost: new Decimal(2),
        unlocked() {
            return hasUpgrade("hp", 13)
        },
        effect() {
            return player.up.points.add(1).pow("0.02").min("1e3")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: { title: "Hype (HP15)",
        description: "Hyper-Points boosts Super-Points.",
        cost: new Decimal(2),
        unlocked() {
            return hasUpgrade("hp", 14)
        },
        effect() {
            return player.hp.points.add(1).pow("0.04").min("1.4")
        },
        effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        21: { title: "Super Prestige Points? (HP21)",
        description: "Prestige Upgrade 25 effect is added based on Ultra-Points.",
        cost: new Decimal(3),
        unlocked() {
            return hasUpgrade("hp", 15)
        },
        effect() {
            return player.up.points.add(1).pow("0.03").min("2.5")
        },
        effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
            22: { title: "Timer I (HP22)",
        description: "Points-1 boosts Ultra-Points.",
        cost: new Decimal(4),
        unlocked() {
            return hasUpgrade("hp", 21)
        },
        effect() {
            return player.pb.points.add(1).pow("1").min("1e3")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        23: { title: "Timer II (HP23)",
        description: "Points-2 boosts Super-Points.",
        cost: new Decimal(5),
        unlocked() {
            return hasUpgrade("hp", 22)
        },
        effect() {
            return player.pb2.points.add(1).pow("2").min("1e6")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        24: { title: "Timer III (HP24)",
        description: "Points-3 boosts Points.",
        cost: new Decimal(7),
        unlocked() {
            return hasUpgrade("hp", 23)
        },
        effect() {
            return player.pb3.points.add(1).pow("3").min("1e9")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        25: { 
            title: "More Effects (HP25)",
                    description: "Prestige upgrade 25 effect is even better.",
                    cost: new Decimal(20),
                    unlocked() {
                        return hasUpgrade("hp", 24)
                    
                    }                                                           
                },
                31: { title: "Timer IV (HP31)",
        description: "Points-1 boosts Super-Points.",
        cost: new Decimal(20),
        unlocked() {
            return hasUpgrade("hp", 25)
        },
        effect() {
            return player.pb.points.add(1).pow("2").min("1e6")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        32: { title: "Timer V (HP32)",
        description: "Points-2 boosts Points.",
        cost: new Decimal(20),
        unlocked() {
            return hasUpgrade("hp", 31)
        },
        effect() {
            return player.pb2.points.add(1).pow("3").min("1e9")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        33: { title: "Timer VI (HP33)",
        description: "Points-3 boosts Ultra-Points.",
        cost: new Decimal(20),
        unlocked() {
            return hasUpgrade("hp", 32)
        },
        effect() {
            return player.pb3.points.add(1).pow("1").min("1e9")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        34: { title: "Timer VII (HP34)",
        description: "Points-1 boosts Points.",
        cost: new Decimal(50),
        unlocked() {
            return hasUpgrade("hp", 33)
        },
        effect() {
            return player.pb.points.add(1).pow("3").min("1e9")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        35: { title: "Timer VIII (HP35)",
        description: "Points-2 boosts Ultra-Points.",
        cost: new Decimal(50),
        unlocked() {
            return hasUpgrade("hp", 34)
        },
        effect() {
            return player.pb2.points.add(1).pow("1").min("1e3")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        41: { title: "Timer IX (HP41)",
        description: "Points-3 boosts Super-Points.",
        cost: new Decimal(50),
        unlocked() {
            return hasUpgrade("hp", 35)
        },
        effect() {
            return player.pb3.points.add(1).pow("2").min("1e6")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        42: { title: "Point Upgrader III (HP42)",
        description: "Every Hyper Point Upgrade boosts point gain by 1.5x",
        cost: new Decimal("500"),
        effect() {
            let effect = Decimal.pow(1.5, player[this.layer].upgrades.length)
            if (hasUpgrade('hp', 44)) effect = effect.pow(1.70951129)
            if (hasUpgrade('sp', 65)) effect = effect.pow(1.584962500721)
            if (hasUpgrade('hp', 53)) effect = effect.pow(1.4649735207)
            if (hasMilestone('hp', 7)) effect = effect.pow(1.113282)
            if (hasMilestone('hp', 14)) effect = effect.pow(0)
            return effect
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("hp", 41)
        }
        },
        43: { 
            title: "Points of Power I (HP43)",
                    description: "Gain a unimaginable boost of 50,000x POINTS!!!",
                    cost: new Decimal(2.5e3),
                    unlocked() {
                        return hasUpgrade("hp", 42)
                    
                    }                                                           
                },
                44: { 
                    title: "Points of Power II (HP44)",
                            description: "Gain a HUGE boost of 500x Super-Points! + make HP42 and PU25 effect better",
                            cost: new Decimal(2.5e3),
                            unlocked() {
                                return hasUpgrade("hp", 43)
                            
                            }                                                           
                        },
                        45: { 
                            title: "Points of Power III (HP45)",
                                    description: "Gain a BIG boost of 50x Ultra-Points!",
                                    cost: new Decimal(3e4),
                                    unlocked() {
                                        return hasUpgrade("hp", 44)
                                    
                                    }                                                           
                                },
                                51: { 
                                    title: "Points of Power IV (HP51)",
                                            description: "Triple Hyper-Point gain.",
                                            cost: new Decimal(7.5e4),
                                            unlocked() {
                                                return hasUpgrade("hp", 45)
                                            
                                            }                                                           
                                        },
                                        52: { title: "Cells III (HP52)",
                                        description: "Super-Points boosts Points again.",
                                        cost: new Decimal(1e6),
                                        unlocked() {
                                            return hasUpgrade("hp", 51)
                                        },
                                        effect() {
                                            return player.sp.points.add(1).pow("0.05").min("1e30")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        53: { 
                                            title: "Extension IV (HP53)",
                                                    description: "Unlock Challenges + make PU25, HP42 effect a bit better.",
                                                    cost: new Decimal(1.5e7),
                                                    unlocked() {
                                                        return hasUpgrade("hp", 52)
                                                    
                                                    }    
                                                },
                                                54: { 
                                                    title: "Points of Power IV (HP54)",
                                                            description: "GAIN A ULTIMATE BOOST OF 500,000x POINTS!!!",
                                                            cost: new Decimal(1e13),
                                                            unlocked() {
                                                                return hasUpgrade("hp", 53)
                                                            
                                                            }    
                                                        },
                                                        55: { 
                                                            title: "Points of Power V (HP55)",
                                                                    description: "Gain a Big BOOST OF 1,000x Super-Points!",
                                                                    cost: new Decimal(1e16),
                                                                    unlocked() {
                                                                        return hasUpgrade("hp", 54)
                                                                    
                                                                    }    
                                                                },
                                                                61: { title: "Point Upgrader IV (HP61)",
        description: "Every Points-1 boosts point gain by 3.5x",
        cost: new Decimal("2e26"),
        effect() {
            let effect = Decimal.pow(3.5, player.pb.points)
            return effect
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("hp", 55)
        }
        },
        62: { title: "Cells IV (HP62)",
                                        description: "Points boosts itself at a very reduced rate.",
                                        cost: new Decimal(1e58),
                                        unlocked() {
                                            return hasUpgrade("hp", 61)
                                        },
                                        effect() {
                                            return player.points.add(1).pow("0.002").min("1e3")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        63: { title: "Point Upgrader V (HP63)",
                                        description: "Every Points-2 boosts point gain by 2.5x",
                                        cost: new Decimal("1e78"),
                                        effect() {
                                            let effect = Decimal.pow(2.5, player.pb2.points)
                                            return effect
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                        unlocked() {
                                            return hasUpgrade("hp", 62)
                                        }
                                        },
                                        64: { 
                                            title: "Points of Mega (HP64)",
                                                    description: "+15% Mega-Points",
                                                    cost: new Decimal(1e96),
                                                    unlocked() {
                                                        return hasUpgrade("hp", 63)
                                                    
                                                    }    
                                                },
                                                65: { title: "Discount IV (HP65)",
        description: "Points-1 cost is divided by once more based on Ultra-Points",
        cost: new Decimal(1e134),
        effect() {
            return player.up.points.add(1).pow("1")
        },
        effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("hp", 64)
        }
        },
        71: { title: "Discount V (HP71)",
        description: "Ultra-Points will divide the cost of Points-1, Points-2 and Points-3",
        cost: new Decimal(1e228),
        effect() {
            return player.up.points.add(1).pow("0.1")
        },
        effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("hp", 65)
        }
        },
        72: { 
            title: "Points of Mega II (HP72)",
                    description: "+50% Mega-Points",
                    cost: new Decimal(1e265),
                    unlocked() {
                        return hasUpgrade("hp", 71)
                    
                    }    
                },
                73: { title: "Split of Points VI (HP73)",
                                        description: "Light boosts Points, Super-Points and Ultra-Points",
                                        cost: new Decimal("1e323"),
                                        unlocked() {
                                            return hasUpgrade("hp", 72)
                                        },
                                        effect() {
                                            return player.l.points.add(1).pow("1")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        74: {
                                            title: "Air Hyper Booster (HP74)",
                                            description: "Every Air you have boosts hyper-point gain by 1,000x",
                                            cost: new Decimal("3.333e333"),
                                            effect() {
                                                let effect = Decimal.pow(1000, player.ai.points)
                                                return effect
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                            unlocked() {
                                                return hasUpgrade("hp", 73)
                                            
                                            }      
                                        },
                                        75: {
                                            title: "Air Ultra Booster (HP75)",
                                            description: "Every Air you have boosts ultra-point gain by 10,000,000,000x",
                                            cost: new Decimal("1e345"),
                                            effect() {
                                                let effect = Decimal.pow(1e10, player.ai.points)
                                                return effect
                                            },
                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                            unlocked() {
                                                return hasUpgrade("hp", 74)
                                            
                                            }      
                                        },
                                        81: { title: "Split of Points VII (HP81)",
                                        description: "Ultra-Points boosts Super-Points",
                                        cost: new Decimal("1e410"),
                                        unlocked() {
                                            return hasUpgrade("hp", 75)
                                        },
                                        effect() {
                                            return player.up.points.add(1).pow("0.01")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        82: { title: "Split of Points VIII (HP82)",
                                        description: "Super-Points boosts Points and Ultra-Points",
                                        cost: new Decimal("1e420"),
                                        unlocked() {
                                            return hasUpgrade("hp", 81)
                                        },
                                        effect() {
                                            return player.sp.points.add(1).pow("0.001")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        83: { title: "Energetic Points (HP83)",
                                        description: "Points boosts Energy & Light",
                                        cost: new Decimal("1e535"),
                                        unlocked() {
                                            return hasUpgrade("hp", 82)
                                        },
                                        effect() {
                                            return player.points.add(1).pow("0.0002")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        84: { title: "Energetic Points II (HP84)",
                                        description: "Super-Points boosts Energy & Light",
                                        cost: new Decimal("1e550"),
                                        unlocked() {
                                            return hasUpgrade("hp", 83)
                                        },
                                        effect() {
                                            return player.sp.points.add(1).pow("0.0002")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        85: { title: "Mega to Points II (HP85)",
                                        description: "Hyper-Points boosts Mega-Points",
                                        cost: new Decimal("1e800"),
                                        unlocked() {
                                            return hasUpgrade("hp", 84)
                                        },
                                        effect() {
                                            return player.hp.points.add(1).pow("0.001")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
                                        91: { title: "Discount VIII (HP91)",
        description: "Hyper-Points will divide the cost of Points-4, Points-5 and Points-6",
        cost: new Decimal("1e1050"),
        effect() {
            return player.hp.points.add(1).pow("10")
        },
        effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("hp", 85)
        }
        },
        92: { title: "Sub-Power (HP92)",
                                        description: "Points-4 boosts Mega-Points",
                                        cost: new Decimal("1e1060"),
                                        unlocked() {
                                            return hasUpgrade("hp", 91)
                                        },
                                        effect() {
                                            return player.pb4.points.add(1).pow("1")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
                                        },
    },
    doReset(mp) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[mp].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        if (hasMilestone('mp', 1)) keptUpgrades.push(11);
    
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        if (hasMilestone('sa', 10)) keep.push("milestones");
        if (hasMilestone('mp', 3)) keep.push("challenges");
        if (hasMilestone('sa', 3)) keep.push("challenges");
        if (hasAchievement('a', 231)) keep.push("challenges");
        if (hasAchievement('a', 231)) keep.push("milestones");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },  
    autoUpgrade() { if (hasAchievement("a" , 141)) return true},
    color: "white",
    requires: new Decimal(2e22), // Can be a function that takes requirement increases into account
    resource: "Hyper-Points", // Name of prestige currency
    baseResource: "Super-Points", // Name of resource prestige is based on
    baseAmount() {return player.sp.points}, // Get the current amount of baseResource
    branches: ["mp"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.0625, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        if (hasUpgrade('hp', 51)) mult = mult.times(3)
        if (hasUpgrade('sp', 63)) mult = mult.times(1.2)
        if (hasUpgrade('p', 75)) mult = mult.times(1.2)
        if (hasChallenge('hp', 11)) mult = mult.times(2)
        if (hasChallenge('hp', 12)) mult = mult.times(2)
        if (hasUpgrade('p', 105)) mult = mult.times(4.2)
        if (hasUpgrade('sp', 74)) mult = mult.times(2)
        if (hasUpgrade('up', 61)) mult = mult.times(2)
        if (hasUpgrade('up', 63)) mult = mult.times(3)
        if (hasUpgrade('up', 64)) mult = mult.times(3)
        if (hasUpgrade('up', 65)) mult = mult.times(2)
        if (hasMilestone('hp', 15)) mult = mult.times("2")
        if (hasChallenge('hp', 21)) mult = mult.times(2)
        if (hasUpgrade('sp', 83)) mult = mult.times(3)
        if (hasChallenge('hp', 22)) mult = mult.times(2)
        if (hasUpgrade('up', 71)) mult = mult.times(2)
        if (hasUpgrade('p', 115)) mult = mult.times("1.5")
        if (hasUpgrade('p', 36)) mult = mult.times(3)
        if (hasUpgrade('p', 66)) mult = mult.pow(1.05)
        if (hasUpgrade('mp', 13)) mult = mult.times(upgradeEffect('mp', 13))
        if (hasUpgrade('p', 86)) mult = mult.times("5")
        if (hasUpgrade('mp', 23)) mult = mult.times(50)
        if (hasUpgrade('pb4', 11)) mult = mult.times(upgradeEffect('pb4', 11))
        if (hasChallenge('hp', 31)) mult = mult.times(4)
        if (hasChallenge('hp', 32)) mult = mult.times(8)
        if (hasUpgrade('mp', 35)) mult = mult.times(100)
        if (hasUpgrade('sp', 84)) mult = mult.times("2")
        if (hasUpgrade('mp', 41)) mult = mult.times(2)
        if (hasChallenge('hp', 41)) mult = mult.times(4)
        if (hasUpgrade('pb5', 11)) mult = mult.times(upgradeEffect('pb5', 11))
        if (hasChallenge('hp', 42)) mult = mult.times(4)
        if (hasUpgrade('mp', 53)) mult = mult.times(upgradeEffect('mp', 53))
        if (hasChallenge('hp', 51)) mult = mult.times(16)
        if (hasUpgrade('hp', 74)) mult = mult.times(upgradeEffect('hp', 74))
        if (hasUpgrade('pb6', 11)) mult = mult.times(upgradeEffect('pb6', 11))
        if (inChallenge("mp", 12)) mult = mult.pow(0.5)
        if (hasMilestone('sa', 1)) mult = mult.times("5")
        if (hasMilestone('sa', 2)) mult = mult.times("5")
        if (hasMilestone('sa', 3)) mult = mult.times("3")
        if (hasMilestone('sa', 4)) mult = mult.times("50")
        if (hasUpgrade('e', 23)) mult = mult.times(upgradeEffect('e',23))
        if (hasUpgrade('e', 31)) mult = mult.times(upgradeEffect('e',31))
        if (hasAchievement('a', 185)) mult = mult.times("1e5")
        if (hasMilestone('sa', 8)) mult = mult.times("1e9")
        if (hasUpgrade('mp', 84)) mult = mult.pow(1.02)
        if (hasMilestone('sa', 9)) mult = mult.times("20")
        if (hasMilestone('sa', 10)) mult = mult.times("7.5")
        if (hasUpgrade('e', 41)) mult = mult.times(upgradeEffect('e',41))
        if (inChallenge("sa", 11)) mult = mult.div("10^^308")
        if (hasAchievement('a', 205)) mult = mult.times("10")
        if (hasUpgrade('e', 55)) mult = mult.times(upgradeEffect('e',55))
        if (hasMilestone('sa', 23)) mult = mult.pow("1.05")
        if (hasAchievement('a', 245)) mult = mult.times("10")
        if (hasMilestone('st', 1)) mult = mult.times(250)
        if (hasUpgrade('cp', 52)) mult = mult.pow("1.5")
        if (inChallenge("mp", 21)) mult = mult.div("10^^308")
        if (hasUpgrade('cp', 74)) mult = mult.pow("1.075")
            if (inChallenge("rp", 12)) mult = mult.div("10^^308")
        return mult
    },
    passiveGeneration() {
        if (hasAchievement("a", 231)) return (hasAchievement("a", 231)?2:0)
        if (hasMilestone("sa", 5)) return (hasMilestone("sa", 5)?1:0)
        if (hasAchievement("a", 181)) return (hasAchievement("a", 181)?0.05:0)

        },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for Hyper Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("p", 61) || player[this.layer].unlocked)},
    milestones: {
        1: {
            requirementDescription(){des = "[1] 1e80 Points"
                if (hasUpgrade('cp', 24)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Gain 100% of Prestige Points on reset per second & automatically buys super-point and ultra-point upgrades."
            if (hasUpgrade('cp', 24)) des = des + "<br> Charge effect: ^1.1 Mega-Points"
            return des},
            done() { return player.points.gte(1e80) },
            style(){if (hasUpgrade('cp', 24)) return{'background-color':'#ffad00'}}
        },
        2: {
            requirementDescription(){des = "[2] 5,000 Hyper-Points"
                if (hasUpgrade('cp', 51)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "You can buy max Points-1, Points-2 and Points-3."
            if (hasUpgrade('cp', 51)) des = des + "<br> Charge effect: Light & Cell Effect softcaps are weaker."
            return des},
            done() { return player.hp.points.gte(5e3) },
            style(){if (hasUpgrade('cp', 51)) return{'background-color':'#ffad00'}}
        },
        3: {
            requirementDescription(){des = "[3] Finish Hyper Challenge 11"
                if (hasUpgrade('cp', 55)) des = des + " (Charged)"
                return des},
            effectDescription() {des = "Points-1, Points-2 and Points-3 are automated and they no longer reset anything."
            if (hasUpgrade('cp', 55)) des = des + "<br> Charge effect: ^1.01 Points and Leaf Points."
            return des},
            done() {return hasChallenge("hp",11)},
            style(){if (hasUpgrade('cp', 55)) return{'background-color':'#ffad00'}}
        },
4: {
    requirementDescription: "[4] 100,000,000 Hyper-Points",
    effect() {
        let eff = player.up.points.add(1).pow(0.2)
        return eff
    },
    effectDescription() {
        return "Ultra-Points boosts Points.<br>Currently: " + format(milestoneEffect("hp",4))+"x"}
        ,    done() { return player.hp.points.gte("1e8")}
        
    },
    5: {
        requirementDescription: "[5] 450,000,000 Hyper-Points",
        effectDescription: "1,000x Points, 10x Super-Points and Ultra-Points",
        done() { return player.hp.points.gte(4.5e8) }
},
6: {requirementDescription: "[6] Finish Hyper Challenge 12",
             effectDescription: "Gain 100% of super-points on reset per second",
                done() {return hasChallenge("hp",12)}},
    7: {
        requirementDescription: "[7] 5,000,000,000 Hyper-Points",
        effectDescription: "PU25, SP64 and HP42 Effects are better",
        done() { return player.hp.points.gte(5e9) }
    },
    8: {
        requirementDescription: "[8] 25,000,000,000 Hyper-Points",
        effect() {
            let eff = player.hp.points.add(1).pow(0.33333333333333333)
            return eff
        },
        effectDescription() {
            return "Hyper-Points boosts Super-Points.<br>Currently: " + format(milestoneEffect("hp",8))+"x"}
            ,    done() { return player.hp.points.gte("2.5e10")}
            
        },
        9: {
            requirementDescription: "[9] 75,000,000,000 Hyper-Points",
            effectDescription: "^1.01 Points",
            done() { return player.hp.points.gte(7.5e10) }
        },
        10: {
            requirementDescription: "[10] 4e13 Hyper-Points",
            effectDescription: "^1.05 Points!",
            done() { return player.hp.points.gte(3e13) }
        },
        11: {
            requirementDescription: "[11] 2e15 Hyper-Points",
            effectDescription: "^1.05 Points again",
            done() { return player.hp.points.gte(2e15) }
        },
        12: {
            requirementDescription: "[12] 5e16 Hyper-Points",
            effectDescription: "^1.2 Super-Points!!",
            done() { return player.hp.points.gte(5e16) }
        },
        13: {
            requirementDescription: "[13] 2e18 Hyper-Points",
            effectDescription: "^1.25 Ultra-Points!!",
            done() { return player.hp.points.gte(2e18) }
        },
        14: {
            requirementDescription: "[14] 1e19 Hyper-Points",
            effectDescription: "Gain ^1.25 Points but nullify PU25 & HP42 effects.",
            done() { return player.hp.points.gte(1e19) }
        },
        15: {
            requirementDescription: "[15] 1e500 Points",
            effectDescription: "2x Hyper-Points",
            done() { return player.points.gte("1e500") }
    },
    16: {
        requirementDescription: "[16] 1e23 Hyper-Points",
        effectDescription: "SP73 Effect is better and ^1.05 Points.",
        done() { return player.hp.points.gte(1e23) }
    },
    17: {requirementDescription: "[17] Finish Hyper Challenge 21",
             effectDescription: "UP52 Effect is better",
                done() {return hasChallenge("hp",21)}},
18: {
    requirementDescription: "[18] 1e27 Hyper-Points",
    effectDescription: "HB11 Effect is doubled",
    done() { return player.hp.points.gte(1e27) }
},
19: {
    requirementDescription: "[19] 1e620 Points",
    effectDescription: "^1.1 Points",
    done() { return player.points.gte("1e620") }
},
20: {
requirementDescription: "[20] 1e36 Hyper-Points",
effectDescription: "HB11 Effect is increased by +50%",
done() { return player.hp.points.gte(1e36) }
},
21: {
    requirementDescription: "[21] 1e37 Hyper-Points",
    effect() {
        let eff = player.hp.points.add(1).pow(0.2)
        return eff
    },
    effectDescription() {
        return "Hyper-Points boosts Ultra-Points.<br>Currently: " + format(milestoneEffect("hp",21))+"x"}
        ,    done() { return player.hp.points.gte("1e37")}
        
    },
    22: {
        requirementDescription: "[22] 1e38 Hyper-Points",
        effectDescription: "HB11 is cheaper.",
        done() { return player.hp.points.gte(1e38) }
    },
    23: {
        requirementDescription: "[23] 2e38 Hyper-Points",
        effect() {
            let eff = player.hp.points.add(1).pow(0.333333333333333333333)
            return eff
        },
        effectDescription() {
            return "Hyper-Points boosts Points again.<br>Currently: " + format(milestoneEffect("hp",23))+"x"}
            ,    done() { return player.hp.points.gte("2e38")}
            
        },
        24: {requirementDescription: "[24] Finish Hyper Challenge 22",
             effectDescription: "SP73 Effect is better again",
                done() {return hasChallenge("hp",22)}},
                25: {
                    requirementDescription: "[25] 1e42 Hyper-Points",
                    effectDescription: "^1.05 Points",
                    done() { return player.hp.points.gte("1e42") }
                },
                26: {
                    requirementDescription: "[26] 5e57 Hyper-Points",
                    effectDescription: "^1.01 Points",
                    done() { return player.hp.points.gte("5e57") }
                },
    },
buyables: {
    11: {
        title: "Point Buyable 1: Point Repetable I",
        unlocked() { return hasUpgrade("p", 112) },
        cost(x) {
            let exp2 = 1.1
            if (hasMilestone('hp', 22)) exp2 = 1.01
            if (hasMilestone('mp', 4)) exp2 = 1e308
            return new Decimal("1e500").pow(Decimal.pow(1.025, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Points, Super-Points and Ultra-Points by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player.points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal ("1e500")
            player.points = player.points.sub(this.cost().div(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(2)
            let base2 = x
            if (hasMilestone('hp', 18)) base2 = x.mul(new Decimal(2))
            if (hasMilestone('hp', 20)) base2 = x.mul(new Decimal(3))
            if (hasUpgrade('mp', 12)) base2 = x.mul(new Decimal(4))
            if (hasUpgrade('mp', 21)) base2 = x.mul(new Decimal(5))
            if (hasMilestone('mp', 4)) base2 = x.mul(new Decimal(0))
            let expo = new Decimal(1.000)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
    12: {
        title: "Point Buyable 2: Point Repetable II",
        unlocked() { return hasUpgrade("p", 115) },
        cost(x) {
            let exp2 = 1.1
            if (hasUpgrade('mp', 14)) exp2 = 1.01
            if (hasMilestone('mp', 4)) exp2 = 1e308
            return new Decimal("1e900").pow(Decimal.pow(1.025, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Super-Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Points by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player.sp.points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal ("1e900")
            player.sp.points = player.sp.points.sub(this.cost().div(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(50)
            
            let base2 = x
            if (hasMilestone('mp', 4)) base2 = x.mul(new Decimal(0))
            let expo = new Decimal(1.000)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
    13: {
        title: "Point Buyable 3: Point Repetable III",
        unlocked() { return hasUpgrade("up", 75) },
        cost(x) {
            let exp2 = 1.025
            if (hasMilestone('mp', 4)) exp2 = 1e308
            return new Decimal("1e2000").pow(Decimal.pow(1.025, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Points, Super-Points and Ultra-Points by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player.points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal ("1e2000")
            player.points = player.points.sub(this.cost().div(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(10)
            let base2 = x
            if (hasUpgrade('mp', 21)) base2 = x.mul(new Decimal(2))
            if (hasMilestone('mp', 4)) base2 = x.mul(new Decimal(0))
            let expo = new Decimal(1.000)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
},
})
