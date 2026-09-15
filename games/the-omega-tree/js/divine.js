addLayer("dp", {
    name: "divine-points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        perks: new Decimal(0),
        auto: false,
    }},
    passiveGeneration() {
        if (hasAchievement("a", 341)) return (hasAchievement("a", 341)?1:0)
            if (hasAchievement("a", 321)) return (hasAchievement("a", 321)?0.05:0)
        },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    automate() {
        if (hasAchievement('a', 304)) {
            if (layers.dp.buyables[11].canAfford()) {
                layers.dp.buyables[11].buy();
            };
        };
    },
    autoUpgrade() { if (hasAchievement("a" , 322)) return true},

    doReset(rp) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[rp].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
        if (hasAchievement('a', 293)) keptUpgrades.push(12);
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        if (hasMilestone('rp', 6)) keep.push("milestones");
        if (hasMilestone('rp', 6)) keep.push("challenges");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    tooltip(){
        return "<h3>Divine</h3><br>" + format(player.dp.points) + " DP"
      },
    microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Divine-Points! it will reset most of the stuff except Achievements and this layer has a new mechanic.</h4>`],
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
                    unlocked() {return (hasUpgrade("dp", 25))},
            content: [
                ["blank", "15px"],
                ["challenges", [1]]
                
            ]
        },
            "Upgrade Tree": {
                unlocked() {return hasUpgrade('dp', 31)},
                content: [
                    ["blank", "15px"],
                    ["display-text", () => "You have <h2 style='color: #00008b; text-shadow: 0 0 10px #00008b'>" + format(player.dp.perks) + "</h2> Divine Perks."],
                    "clickables",
                    ["upgrades", [10,11,12,13,14,15,16,17,18,19,20,21]]
                ]    
            },
    "Buyables": {
    unlocked() {return (hasUpgrade("dp", 131))},
            content: [
        ["blank", "15px"],
        "buyables"
            ]
        },
    },
},
    upgrades: {
        11: {
            title: "Charglization (DP11)",
            description: "^1.2 Charge Power and 1,000,000,000x Leaf Points",
            cost: new Decimal(1),
                },
    12: { 
        title: "Power Off (DP12)",
                description: "^1.25 Energy & Light but remove Air.",
                cost: new Decimal(1),
                unlocked() {
                    return hasUpgrade("dp", 11)
                
                }
                },
                13: { 
                    title: "Power On (DP13)",
                            description: "^1.1 Charge Power since Air decreased its amount. (Have 2 DP for when getting CPU71 to get a Divine upgrade)",
                            cost: new Decimal(2),
                            unlocked() {
                                return hasUpgrade("dp", 12)
                            
                            }
                            },
                            14: { 
                                title: "Point Chain (DP14)",
                                        description: "Total Divine Points boosts Charge Power & Leaf Points.",
                                        cost: new Decimal(2),
                                        unlocked() {
                                            return hasUpgrade("cp", 71)
                                        
                                        },
                                        effect() {
                                            return player.dp.total.add(1).pow("10")
                                        },
                                        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                        },
                                        15: { 
                                            title: "Point Chain II (DP15)",
                                                    description: "Leaf Points boosts Divine Points.",
                                                    cost: new Decimal(5),
                                                    unlocked() {
                                                        return hasUpgrade("dp", 14)
                                                    
                                                    },
                                                    effect() {
                                                        return player.le.points.max(1).pow("0.001")
                                                    },
                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                    },
                                                    21: { 
                                            title: "Point Chain III (DP21)",
                                                    description: "Charge Power boosts Divine Points.",
                                                    cost: new Decimal(15),
                                                    unlocked() {
                                                        return hasUpgrade("dp", 15)
                                                    
                                                    },
                                                    effect() {
                                                        return player.cp.points.max(1).pow("0.001")
                                                    },
                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                    },
                                                    22: { 
                                                        title: "Divine Booster (DP22)",
                                                                description: "1,000,000,000x Charge Power & Leaf Points",
                                                                cost: new Decimal(125),
                                                                unlocked() {
                                                                    return hasUpgrade("dp", 21)
                                                                
                                                                }
                                                                },
                                                                23: { 
                                                                    title: "Point Chain IV (DP23)",
                                                                            description: "Super Tier boosts Divine Points",
                                                                            cost: new Decimal(125),
                                                                            unlocked() {
                                                                                return hasUpgrade("dp", 22)
                                                                            
                                                                            },
                                                                            effect() {
                                                                                return player.st.points.max(1).pow("1")
                                                                            },
                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                            },
                                                                            24: { 
                                                                                title: "Divine Unlocker (DP24)",
                                                                                        description: "Unlocks more charge power upgrades",
                                                                                        cost: new Decimal(5e3),
                                                                                        unlocked() {
                                                                                            return hasUpgrade("dp", 23)
                                                                                        
                                                                                        }
                                                                                        },
                                                                                        25: { 
                                                                                            title: "Point Chain V (DP25)",
                                                                                                    description: "Divine Points boosts itself and unlocks a challenge.",
                                                                                                    cost: new Decimal(5e9),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("cp", 91)
                                                                                                    
                                                                                                    },
                                                                                                    effect() {
                                                                                                        return player.dp.total.max(1).pow("0.125")
                                                                                                    },
                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                    },
                                                                                                    31: { 
                                                                                                        title: "Divine Unlocker II (DP31)",
                                                                                                                description: "Unlock a new sub-tab",
                                                                                                                cost: new Decimal(5e11),
                                                                                                                unlocked() {
                                                                                                                    return hasUpgrade("dp", 25)
                                                                                                                
                                                                                                                }
                                                                                                                },
                                                                                                                32: { 
                                                                                                                    title: "Divine Increaser (DP32)",
                                                                                                                            description: "Divine Points boost Divine Perks",
                                                                                                                            cost: new Decimal(5e12),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("dp", 31)
                                                                                                                            
                                                                                                                            },
                                                                                                                            effect() {
                                                                                                                                return player.dp.total.max(1).pow("0.1")
                                                                                                                            },
                                                                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                            },
                                                                                                                            33: { 
                                                                                                                                title: "Divine Booster (DP33)",
                                                                                                                                        description: "10x Divine Points & Divine Perks",
                                                                                                                                        cost: new Decimal(1e14),
                                                                                                                                        unlocked() {
                                                                                                                                            return hasUpgrade("dp", 32)
                                                                                                                                        
                                                                                                                                        }
                                                                                                                                        },
                                                                                                                                        34: { 
                                                                                                                                            title: "Divine Increaser II (DP34)",
                                                                                                                                                    description: "Log(1e1,000) Points boosts Divine Perks.",
                                                                                                                                                    cost: new Decimal(5e19),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("dp", 33)
                                                                                                                                                    
                                                                                                                                                    },
                                                                                                                                                    effect() {
                                                                                                                                                        return player.points.max(1).log("1e1000")
                                                                                                                                                    },
                                                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                                                                                    },
                                                                                                                                                    35: { 
                                                                                                                                                        title: "Divine Charger (DP35)",
                                                                                                                                                                description: "Charge the 7th mega-point milestone",
                                                                                                                                                                cost: new Decimal(1e23),
                                                                                                                                                                unlocked() {
                                                                                                                                                                    return hasUpgrade("dp", 34)
                                                                                                                                                                
                                                                                                                                                                }
                                                                                                                                                                },
                                                                                                                                                                41: {
                                                                                                                                                                    title: "Divine Charger II (DP41)",
                                                                                                                                                                    description: "Charge the 7th sacrifice milestone.",
                                                                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                                                                    currencyInternalName: "perks",
                                                                                                                                                                    currencyLayer: "dp",
                                                                                                                                                                    cost: new Decimal(1e33),
                    
                                                                                                                                                                effect() {
                                                                                                                                                                    return player.dp.perks.max(1).pow("20")
                                                                                                                                                                },
                                                                                                                                                                    unlocked() {return hasUpgrade('dp', 35)},
                                                                                                                                                                },
                                                                                                                                                                42: {
                                                                                                                                                                    title: "Divine Charger III (DP42)",
                                                                                                                                                                    description: "Charge the 7th leaf point milestone.",
                                                                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                                                                    currencyInternalName: "perks",
                                                                                                                                                                    currencyLayer: "dp",
                                                                                                                                                                    cost: new Decimal(2e33),
                                                                                                                                                                    unlocked() {return hasUpgrade('dp', 41)},
                                                                                                                                                                },
                                                                                                                                                                43: { 
                                                                                                                                                                    title: "Divine Charger IV (DP43)",
                                                                                                                                                                            description: "Charge the 7th super tier milestone and unlock a new layer.",
                                                                                                                                                                            cost: new Decimal(1e25),
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("dp", 42)
                                                                                                                                                                            
                                                                                                                                                                            }
                                                                                                                                                                            },
                                                                                                                101: {
                                                                                                                    title: "Divine Currencier (DUT11)",
                                                                                                                    description: "Generate 1 Divine Perks per second.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(0),
                                                                                                                    unlocked() {return hasUpgrade('dp', 31)},
                                                                                                                },
                                                                                                                111: {
                                                                                                                    title: "Divine Choice (DUT21)",
                                                                                                                    description: "10x Divine Perks but lock DUT22",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(10),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 151)) return true
                                                                                                                        else if (hasUpgrade('dp', 112)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasUpgrade('dp', 101)},
                                                                                                                },
                                                                                                                112: {
                                                                                                                    title: "Divine Choice II (DUT22)",
                                                                                                                    description: "Super Tier boosts Divine Perks but lock DUT21",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(250),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 151)) return true
                                                                                                                        else if (hasUpgrade('dp', 111)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    effect() {
                                                                                                                        return player.st.points.max(1)
                                                                                                                            },
                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                                                                                                                    unlocked() {return hasUpgrade('dp', 101)},
                                                                                                                },
                                                                                                                121: {
                                                                                                                    title: "Divine Choice III (DUT31)",
                                                                                                                    description: "5x Divine Points but lock DUT32",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(2500),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 161)) return true
                                                                                                                        else if (hasUpgrade('dp', 122)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasUpgrade('dp', 111) || hasUpgrade('dp', 112)},
                                                                                                                },
                                                                                                                122: {
                                                                                                                    title: "Divine Choice IV (DUT32)",
                                                                                                                    description: "^1.15 Charge Power and 3x Divine Points but lock DUT31",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1.5e4),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 161)) return true
                                                                                                                        else if (hasUpgrade('dp', 121)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasUpgrade('dp', 111) || hasUpgrade('dp', 112)},
                                                                                                                },
                                                                                                                131: {
                                                                                                                    title: "Divine Buyablizer (DUT41)",
                                                                                                                    description: "Unlocks a divine buyable.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(3e4),
                                                                                                                    unlocked() {return hasUpgrade('dp', 121) || hasUpgrade('dp', 122)},
                                                                                                                },
                                                                                                                141: {
                                                                                                                    title: "Divine Choice V (DUT51)",
                                                                                                                    description: "Sacrifice Tier boosts Divine Perks but lock DUT52",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(5e5),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 181)) return true
                                                                                                                        else if (hasUpgrade('dp', 142)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    effect() {
                                                                                                                        return player.sa.points.max(1)
                                                                                                                            },
                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                                                                                                                    unlocked() {return hasUpgrade('dp', 131)},
                                                                                                                },
                                                                                                                142: {
                                                                                                                    title: "Divine Choice VI (DUT52)",
                                                                                                                    description: "Divine Perks boosts itself but lock DU51",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e9),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 181)) return true
                                                                                                                        else if (hasUpgrade('dp', 141)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    effect() {
                                                                                                                        return player.dp.perks.max(1).pow(0.2)
                                                                                                                            },
                                                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                                                                                                                    unlocked() {return hasUpgrade('dp', 131)},
                                                                                                                },
                                                                                                                151: {
                                                                                                                    title: "Divine Locker (DUT61)",
                                                                                                                    description: "You can buy both DUT21 and DUT22.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(2.5e9),
                                                                                                                    unlocked() {return hasUpgrade('dp', 141) || hasUpgrade('dp', 142)},
                                                                                                                },
                                                                                                                161: {
                                                                                                                    title: "Divine Locker II (DUT71)",
                                                                                                                    description: "You can buy both DUT31 and DUT32.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e10),
                                                                                                                    unlocked() {return hasUpgrade('dp', 151)},
                                                                                                                },
                                                                                                                171: {
                                                                                                                    title: "Divine Choice VII (DUT81)",
                                                                                                                    description: "Divine Perks boosts Divine Points but lock DUT82 and DUT83",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(7.5e12),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 201)) return true
                                                                                                                        else if (hasUpgrade('dp', 172)) return false
                                                                                                                        else if (hasUpgrade('dp', 173)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                effect() {
                                                                                                                    return player.dp.perks.max(1).pow(0.05)
                                                                                                                        },
                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                                                                                                                    unlocked() {return hasUpgrade('dp', 161)},
                                                                                                                },
                                                                                                                172: {
                                                                                                                    title: "Divine Choice VIII (DUT82)",
                                                                                                                    description: "30,000x Divine Perks but lock DUT81 and DUT83",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e16),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 201)) return true
                                                                                                                        else if (hasUpgrade('dp', 171)) return false
                                                                                                                        else if (hasUpgrade('dp', 173)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasUpgrade('dp', 161)},
                                                                                                                },
                                                                                                                173: {
                                                                                                                    title: "Divine Choice IX (DUT83)",
                                                                                                                    description: "120x Divine Perks but lock DUT81 and DUT82",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(2e10),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 201)) return true
                                                                                                                        else if (hasUpgrade('dp', 171)) return false
                                                                                                                        else if (hasUpgrade('dp', 172)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasUpgrade('dp', 161)},
                                                                                                                },
                                                                                                                181: {
                                                                                                                    title: "Divine Locker III (DUT91)",
                                                                                                                    description: "You can buy both DUT51 and DUT52.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e20),
                                                                                                                    unlocked() {return hasUpgrade('dp', 171) || hasUpgrade('dp', 172)|| hasUpgrade('dp', 173)},
                                                                                                                },
                                                                                                                191: {
                                                                                                                    title: "Divine Choice X (DUT101)",
                                                                                                                    description: "Log(Log(10)) Points boosts Rebirth Points",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e40),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 211)) return true
                                                                                                                        else if (hasUpgrade('dp', 192)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                effect() {
                                                                                                                    return player.points.add(1).log(10).log(10)
                                                                                                                        },
                                                                                                                effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                                                                                                                    unlocked() {return hasMilestone('rp', 4)},
                                                                                                                },
                                                                                                                192: {
                                                                                                                    title: "Divine Choice XI (DUT102)",
                                                                                                                    description: "2x Rebirth Points",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e40),
                                                                                                                    canAfford() {
                                                                                                                        if (hasUpgrade('dp', 211)) return true
                                                                                                                        else if (hasUpgrade('dp', 191)) return false
                                                                                                                        else return true
                                                                                                                    },
                                                                                                                    unlocked() {return hasMilestone('rp', 4)},
                                                                                                                },
                                                                                                                201: {
                                                                                                                    title: "Divine Locker IV (DUT111)",
                                                                                                                    description: "You can buy all three DUT81, DUT82 and DUT83.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e70),
                                                                                                                    unlocked() {return hasUpgrade('dp', 191) || hasUpgrade('dp', 192)},
                                                                                                                },
                                                                                                                211: {
                                                                                                                    title: "Divine Locker V (DUT121)",
                                                                                                                    description: "You can buy both DUT101 and DUT102.",
                                                                                                                    currencyDisplayName: "Divine Perks",
                                                                                                                    currencyInternalName: "perks",
                                                                                                                    currencyLayer: "dp",
                                                                                                                    cost: new Decimal(1e75),
                                                                                                                    unlocked() {return hasUpgrade('dp', 201)},
                                                                                                                },
    },
    update(multP) {
        multP = new Decimal(0.05)
        if (hasUpgrade('dp', 111)) multP = multP.times(10)
        if (hasUpgrade('dp', 112)) multP = multP.times(upgradeEffect('dp', 112))
        if (hasUpgrade('dp', 32)) multP = multP.times(upgradeEffect('dp', 32))
        if (hasUpgrade('dp', 33)) multP = multP.times(10)
        if (hasUpgrade('dp', 141)) multP = multP.times(upgradeEffect('dp', 141))
        if (hasUpgrade('dp', 142)) multP = multP.times(upgradeEffect('dp', 142))
        if (hasUpgrade('dp', 172)) multP = multP.times(3e4)
        if (hasUpgrade('dp', 173)) multP = multP.times(120)
        if (hasUpgrade('dp', 34)) multP = multP.times(upgradeEffect('dp', 34))
        if (hasUpgrade('dp', 35)) multP = multP.pow(1.3)
            if (hasUpgrade('rp', 11)) multP = multP.times(20)
                if (hasUpgrade('rp', 23)) multP = multP.times(upgradeEffect('rp', 23))
                    if (hasUpgrade('rp', 42)) multP = multP.times(upgradeEffect('rp', 42))
        if (hasUpgrade('dp', 101)) player.dp.perks = player.dp.perks.add(multP)
    },
    clickables: {
        11: {
            display() {
                return "Respec Divine Perk Tree, but you won't get your Divine Perks back. And it'll cause a Divine reset. You can click this while you can reset to gain DP."
            },
            unlocked() {
                return hasUpgrade("dp", 31)
            },
            canClick() {
                return canReset(this.layer)
            },
            onClick() {
                player.dp.upgrades.length
                for(let i = 0; i < player.dp.upgrades.length; i++) { 
                    if (+player.dp.upgrades[i] > 96) { 
                        player.dp.upgrades.splice(i, 1); 
                        i--; 
                    }
                }
                if (canReset(this.layer)) doReset(this.layer)
            },
            style: {'min-height':'30px',
                    'width':'480px',
                    'border-radius':'5%'},
        },
    },
    buyables: {
    11: {
        title: "Point Buyable 14: The Tree Upgrader",
        unlocked() { return hasUpgrade("dp", 131) },
        cost(x) {
            let exp2 = 1.1
            return new Decimal("1e3").mul(Decimal.pow(10, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Divine Perks" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Divine Points by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player.dp.perks.gte(this.cost())
        },
        buy() {
            let cost = new Decimal ("1e3")
            player.dp.perks = player.dp.perks.sub(this.cost().div(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(2)
            let base2 = x
            let expo = new Decimal(1.000)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
},
    milestones: {
1: {
    requirementDescription: "[1] 10 Total Divine Points",
    effectDescription: "Gain 100% of Leaf Points on reset per second and keep Leaf Milestones.",
    done() { return player.dp.total.gte("10") }
},
2: {
    requirementDescription: "[2] 100 Total Divine Points",
    effectDescription: "Automatically buy Charge Power Buyables and keep Super Tier Milestones on reset.",
    done() { return player.dp.total.gte("100") }
},
3: {
    requirementDescription: "[3] 10,000,000,000 Total Divine Points",
    effectDescription: "1.5x Divine Points.",
    done() { return player.dp.total.gte("1e10") }
},
    },
    challenges: {
        11: {
                name: "Currencies Degrader",
                challengeDescription: "You can't gain Sacrifice Tier, Time Power and Cells.",
                goalDescription: "1e157,000 Points",
                rewardDescription: "5x Divine Points and ^1.02 to Charge Power & Leaf Points.",
                canComplete: function() {return player.points.gte("e157000")},
                unlocked() { return (hasUpgrade('dp', 25)) },
        },
    },
    color: "#00008b",
    requires: new Decimal("1.80e308"), // Can be a function that takes requirement increases into account
    resource: "Divine Points", // Name of prestige currency
    baseResource: "Charge Power", // Name of resource prestige is based on
    baseAmount() {return player.cp.points}, // Get the current amount of baseResource
    branches: ["cp", "st", "le"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.001, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('dp', 15)) mult = mult.times(upgradeEffect('dp',15))
                if (hasUpgrade('dp', 21)) mult = mult.times(upgradeEffect('dp',21))
                                if (hasUpgrade('dp', 23)) mult = mult.times(upgradeEffect('dp',23))
                                if (hasUpgrade('cp', 75)) mult = mult.times(upgradeEffect('cp',75))
                                if (hasUpgrade('cp', 91)) mult = mult.pow(1.3)
                                if (hasUpgrade('dp', 25)) mult = mult.times(upgradeEffect('dp',25))
                                if (hasChallenge('dp', 11)) mult = mult.times(5)
                                    if (hasMilestone('dp', 3)) mult = mult.times(1.5)
                                if (hasUpgrade('dp', 122)) mult = mult.times(3)
                                mult = mult.times(buyableEffect('dp', 11))
                                if (hasUpgrade('dp', 33)) mult = mult.times(10)
                                    if (hasUpgrade('dp', 121)) mult = mult.times(5)
                                if (hasUpgrade('dp', 171)) mult = mult.times(upgradeEffect('dp',171))
                                if (hasUpgrade('dp', 35)) mult = mult.pow(0.9)
                                if (hasUpgrade('dp', 42)) mult = mult.pow(1.1)
                                    if (hasUpgrade('dp', 42)) mult = mult.pow(1.1)
                                        if (hasUpgrade('rp', 11)) mult = mult.times(20)
                                            if (hasAchievement('a', 295)) mult = mult.times(player.rp.power.max(1).pow(0.333333333333333333333333333333333))
                                                if (hasUpgrade('rp', 21)) mult = mult.times(upgradeEffect('rp',21))                
                                                    if (hasUpgrade('rp', 43)) mult = mult.times(upgradeEffect('rp',43))
                                                        mult = mult.times(buyableEffect('cp2', 12))
                                if (hasAchievement('a', 325)) mult = mult.times("1e9")                        
                                    if (hasChallenge('rp', 11)) mult = mult.pow(1.2)
                                    return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 8, // Row the layer is in on the tree (0 is the first row)
    displayRow: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "D", description: "D: Reset for Divine Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("cp", 45) || player[this.layer].unlocked)},
})
