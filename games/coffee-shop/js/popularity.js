addLayer("p", {
    name: "Popularity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 3,
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        visible: true,
        unlocked: false,
		points: new Decimal(0),
        customers: new Decimal(0),
        vipCustomers: new Decimal(0),
    }},
    color: "#5cd238",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Popularity", // Name of prestige currency
    baseResource: "Coffee Cups", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 1.1, // Base for the exponent of the static formula
    exponent: 1.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { 
        return hasMilestone('s', 0); 
    },
    autoPrestige() {
        return hasMilestone('s', 3); 
    },
    resetsNothing() {
        return hasMilestone('s', 3);
    },

    update(diff) {
        if (player.p.unlocked) { 
            // 1. Calculate your base customer generation
            let customerGain = player.p.points.pow(new Decimal(1.38)); 
            
            // 2. ONLY apply the upgrades meant to boost Customers (13 and 22)
            if (hasUpgrade('p', 13)) customerGain = customerGain.times(upgradeEffect('p', 13))
            if (hasUpgrade('c', 22)) customerGain = customerGain.times(upgradeEffect('c', 22))
            if (hasUpgrade('c', 23)) {customerGain = customerGain.times(upgradeEffect('c', 23))}
            if (hasUpgrade('c', 42)) {customerGain = customerGain.times(upgradeEffect('c', 42))}
            if (hasUpgrade('c', 45)) {customerGain = customerGain.times(upgradeEffect('c', 45))}
            if (buyableEffect('l', 52)) customerGain = customerGain.times(buyableEffect('l', 52))
            if (hasUpgrade('c', 34)) {customerGain = customerGain.times(upgradeEffect('c', 34))}
            if (hasUpgrade('p', 21)) {customerGain = customerGain.times(upgradeEffect('p', 21));}
            if (hasUpgrade('p', 32)) {customerGain = customerGain.times(upgradeEffect('p', 32));}
            if (hasUpgrade('w', 24)) {customerGain = customerGain.times(upgradeEffect('w', 24));}


            // --- THE VIP CONVERSION LOOP ---
            if (hasMilestone('p', 1)) {
                let vipGain = player.p.customers.add(1).pow(0.09).div(5e7);
                
                // 🌟 FIXED: Multiplies the active vipGain variable BEFORE adding it to your wallet!
                if (hasUpgrade('c', 52)) {
                    vipGain = vipGain.times(upgradeEffect('c', 52));
                }
                if (hasUpgrade('c', 53)) {
                    vipGain = vipGain.times(upgradeEffect('c', 53));
                }
                if (buyableEffect('b', 13)) {
                    vipGain = vipGain.times(buyableEffect('b', 13));
                }
                if (hasUpgrade('w', 21)) {
                    vipGain = vipGain.times(upgradeEffect('w', 21));
                }
                if (hasUpgrade('c', 71)) {
                    vipGain = vipGain.times(upgradeEffect('c', 71));
                }
                player.p.vipCustomers = player.p.vipCustomers.add(vipGain.times(diff));
            }

            // 3. Add to total balance
            player.p.customers = player.p.customers.add(customerGain.times(diff));
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() { 
            return "You have <h2 style='color: #3498DB'>" + format(player.p.customers) + "</h2> Customers." 
        }],
        ["display-text", function() { 
            let gainPerSecond = player.p.points.pow(new Decimal(1.38)); 
            
            // Match the math exactly by only checking 13 and 22 here as well
            if (hasUpgrade('p', 13)) gainPerSecond = gainPerSecond.times(upgradeEffect('p', 13))
            if (hasUpgrade('c', 22)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 22))
            if (hasUpgrade('c', 23)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 23))

            if (hasUpgrade('c', 42)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 42))
            if (hasUpgrade('c', 45)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 45))
            if (buyableEffect('l', 52)) {gainPerSecond = gainPerSecond.times(buyableEffect('l', 52))}
            if (hasUpgrade('c', 34)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 34));
            if (hasUpgrade('p', 21)) {gainPerSecond = gainPerSecond.times(upgradeEffect('p', 21));
            if (hasUpgrade('p', 32)) {gainPerSecond = gainPerSecond.times(upgradeEffect('p', 32));}
        }
            return "(+" + format(gainPerSecond) + "/sec)"
        }],
         // --- VIP Customer Display Ticker ---
        ["display-text", function() {
            // 🌟 FIXED: Gated by Star Milestone 1 (2 Stars) since the popularity milestone is deleted!
            if (!hasMilestone('p', 1)) return ""; 
            
            let currentVipGain = player.p.customers.add(1).pow(0.09).div(5e7);
            
            // 🌟 FIXED: Multiplies the correct variable BEFORE hitting the return statement!
            if (hasUpgrade('c', 52)) {
                currentVipGain = currentVipGain.times(upgradeEffect('c', 52));
            }
            if (hasUpgrade('c', 53)) {
                currentVipGain = currentVipGain.times(upgradeEffect('c', 53));
            }
             if (buyableEffect('b', 13)) {
                currentVipGain = currentVipGain.times(buyableEffect('b', 13));
            }
            if (hasUpgrade('w', 21)) {
                currentVipGain = currentVipGain.times(upgradeEffect('w', 21));
            }
            if (hasUpgrade('c', 71)) {
                currentVipGain = currentVipGain.times(upgradeEffect('w', 21));
            }
            
            return "You have <h3 style='color: #F39C12; display: inline;'>" + format(player.p.vipCustomers) + "</h3> VIP Customers (+" + format(currentVipGain) + "/sec)"
        }],
        "milestones",
        "hr",
        "blank",
        ["display-text", "<h3>Customer Upgrades</h3>"],
        "blank",
        "upgrades"
    ],
            // --- Milestones ---
    milestones: {
        0: {
            requirementDescription: "1000 Customers",
            done() { 
                return player.p.customers.gte(1e3) 
            },
            effectDescription: "Unlock bulk-buying for Coffee Cups.",
        },
        1: {
            requirementDescription: "1e50 Customers",
            done() { 
                return player.p.customers.gte(1e50) 
            },
            effectDescription: "Unlock VIP Customers.",
            unlocked() {return hasMilestone('s', 1)},
        },
        2: {
            requirementDescription: "1e583 Customers",
            done() { 
                return player.p.customers.gte("1e583") 
            },
            effectDescription: "1e50x Beans.",
            unlocked() {return hasUpgrade('w', 24)},
        },
    },

    row: 1, 
    hotkeys: [
        {key: "p", description: "P: Reset for Popularity", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    branches: [
        "c", "s"
    ],
    
    upgrades: {
        rows: 3,
        cols: 5,
        11: {
            title: "Loyal Lads",
            description: "Customers multiply Beans.",
            cost: new Decimal(15),
            effect() {
                return player[this.layer].customers.add(1).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            // --- ADD THESE 3 LINES TO CHANGE THE CURRENCY ---
            currencyDisplayName: "Customers",       // The name shown when you hover over the cost
            currencyInternalName: "customers",      // The exact variable name inside startData()
            currencyLayer: "p",                     // The layer ID where this variable lives ("p")
            currencyLocation() { return player.p },
        },
        12: {
            title: "Beans for Days",
            description: "Unlock a new upgrade for Coffee Cups.",
            cost: new Decimal(100),

            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                   
            unlocked() {
                return hasUpgrade('p', 11)
            },
        },
        13: {
            title: "Popularity Boost",
            description: "Being popular attracts more customers.",
            cost: new Decimal(1e3),
            effect() {
                return player[this.layer].points.times(0.5).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },

            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",     
            currencyLayer: "p",                     
            currencyLocation() { return player.p },
            unlocked() {
                return hasUpgrade('p', 12)
            },
        },
        14: {
            title: "We gone viral",
            description: "THEY NEED SOME MILK!!!",
            cost: new Decimal(1.5e5),
            effect() {
                return player[this.layer].customers.add(1).pow(0.21);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 
            unlocked() { return hasUpgrade('c', 41) }, 
        },
        15: {
            title: "Franchise Phenomenon",
            description: "Customers like BEANSS so much now, they boost beans.",
            cost: new Decimal(5e11),
            effect() {
                return player[this.layer].customers.add(1).pow(0.44);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 
            unlocked() { return hasUpgrade('p', 14) },
        },
        21: {
            title: "Elite Word-of-Mouth",
            description: "VIP's multiply Customers",
            cost: new Decimal(1e60),
            effect() {
                return player.p.vipCustomers.add(1).log10().times(2).add(1);
            },
            effectDisplay() { 
                return format(this.effect()) + "x" 
            },
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 
            unlocked() { return hasMilestone('p', 1) },
        },
        22: {
            title: "VIP Endorsement",
            description: "VIP's have discovered BEANZ.",
            cost: new Decimal("1e65"),
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 

            unlocked() { 
                return hasUpgrade('p', 21)
            },
            effect() {
                return player.p.vipCustomers.add(1).pow(0.7);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        23: {
            title: "VIP Supply Logistics",
            description: "VIP's are doing the work for Milk.",
            cost: new Decimal("1e75"), 
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 

            unlocked() { 
                return hasUpgrade('p', 22)
            },
            effect() {
                return player.p.vipCustomers.add(1.22).pow(0.75);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        24: {
            title: "Franchise Royalty",
            description: "Multiply Beans based on first two Barista buyables.",
            cost: new Decimal("1e83"), 
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 

            unlocked() { 
                return hasUpgrade('p', 23)
            },
            effect() {
                let level11 = getBuyableAmount('b', 11);
                let level12 = getBuyableAmount('b', 12);
                let combinedStaffLevels = level11.add(level12);
                
                return new Decimal(1.01).pow(combinedStaffLevels);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        25: {
            title: "The Grand Franchise",
            description: "A VIP Customer bought the Espresso Lab Recipes.",
            cost: new Decimal("1.6e153"), 
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 

            unlocked() { 
                return hasUpgrade('p', 24); 
            },
           effect() {
                let vipLogSteps = player.p.vipCustomers.add(1).log10();
                let baseEffect = new Decimal(1.4).pow(vipLogSteps);
                
                if (hasUpgrade('p', 34)) {
                    baseEffect = baseEffect.times(upgradeEffect('p', 34));
                }
                return baseEffect;
            },
            effectDisplay() { 
                return format(this.effect()) + "x" 
            }
        },
        31: {
            title: "Logistical Infusion",
            description: "Milk gets boosted by Permits.",
            cost: new Decimal("1e255"),
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p", 
            unlocked() { return hasMilestone('s', 3) },
            effect() {
                let permits = player.w.points || new Decimal(0);
                return new Decimal(2.50).pow(permits);
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        32: {
            title: "Mass Market",
            description: "Beans Multiply Customers, crazy right?",
            cost: new Decimal("5e267"), 
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p", 
            unlocked() { return hasUpgrade('p', 31) }, 
            effect() {
                let beans = player.points || new Decimal(0);
                let rawLog = beans.add(1).log10();
                
                return new Decimal(1).add(rawLog.times(0.75));
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        33: {
            title: "Traffic Flow",
            description: "Very basic stuff, Customer x Milk.",
            cost: new Decimal("2.89e289"),
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p", 
            unlocked() { return hasUpgrade('p', 32) }, 
            effect() {
                let customers = player.p.customers || new Decimal(0);
                let customerLog = customers.add(1).log10();
                return new Decimal(1.15).pow(customerLog);
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        34: {
            title: "Lab Marketing",
            description: "Improve upgrade 25.",
            cost: new Decimal("1e375"),
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",
            unlocked() { return hasUpgrade('p', 33) },
            effect() {
                let customers = player.p.customers || new Decimal(0);
                let customerLog = customers.add(1).log10();
                
                return new Decimal(1.09).pow(customerLog.div(1.5));
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        35: {
            title: "ULTRA DIVIDER",
            description: "Divide Lab Upgrade costs once again...",
            cost: new Decimal("1e463"), 
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",
            unlocked() { return hasUpgrade('p', 34) },
            effect() {
                let customers = player.p.customers;
                let customerLog10 = customers.add(1).log10().log10();

                return new Decimal(10).pow(customerLog10);
            },
            effectDisplay() { return "/" + format(this.effect(), 2) },
        },
    }
    
})