addLayer("c", {
    name: "Coffee Cups", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        milk: new Decimal(0), // Tracks the number of Milk the player has
        milkTabUnlocked: false,
    }},
    color: "#56514b",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Coffee Cups", // Name of prestige currency
    baseResource: "Beans", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.375, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    autoPrestige() {
        // 🌟 SAFETY UPGRADE: Turn off autoPrestige if they have passive generation active!
        // This ensures the engine doesn't accidentally run both systems at once.
        if (hasMilestone('s', 2)) return false; 
        if (hasMilestone('s', 1)) return true;
        return false;
    },
    
    canBuyMax() { 
        let hasUnlockMilestone = hasMilestone('s', 0) || hasMilestone('p', 0);
        let automationIsOff = !hasMilestone('s', 1) && !hasMilestone('s', 2);
        return hasUnlockMilestone && automationIsOff; 
    },

    // 🌟 THE STAR 3 ERA PASSIVE GENERATION ENGINE 🌟
    // Automatically runs smoothly every single game frame tick!
    passiveGeneration() {
         if (hasMilestone('s', 2)) {
            let basePassive = new Decimal(23);
            
            // 🌌 WAREHOUSE OVERCLOCK: If you buy Upgrade 12, ADD the scaling factor cleanly!
            if (hasUpgrade('w', 12)) {
                basePassive = basePassive.add(upgradeEffect('w', 12));
            }
            if (hasUpgrade('c', 61)) {
                basePassive = basePassive.add(upgradeEffect('c', 61));
            }
            if (hasUpgrade('w', 22)) {
                basePassive = basePassive.times(upgradeEffect('w', 22));
            }
            if (hasUpgrade('c', 63)) {
                basePassive = basePassive.times(upgradeEffect('c', 63));
            }
            if (hasUpgrade('w', 25)) {
                basePassive = basePassive.times(upgradeEffect('w', 25));
            }
            return basePassive;
        }
        
        return new Decimal(0); // Locked out during the early game layers
    },
    canReset() {
        // If passive generation is active (Star Milestone 2 / 3 Stars), 
        // hard-lock manual resets to FALSE instantly.
        if (hasMilestone('s', 2)) return false;

        // Otherwise, allow standard manual resets if they have enough Beans!
        return player.points.gte(getNextAt("c"));
    },
    resetsNothing() { 
        return hasMilestone('s', 0); 
    },
    
    update(diff) {
       if (player.c.milkTabUnlocked) {  
            
            let milkGain = player.points.add(1).pow(0.125)
            
            if (hasUpgrade('c', 25)) {milkGain = milkGain.times(upgradeEffect('c', 25))}
            if (buyableEffect('b', 12))milkGain = milkGain.times(buyableEffect('b', 12))

            if (hasUpgrade('c', 44)) {milkGain = milkGain.times(upgradeEffect('c', 44))}
            if (hasUpgrade('p', 14)) {milkGain = milkGain.times(upgradeEffect('p', 14))}
            if (buyableEffect('l', 53)) milkGain = milkGain.times(buyableEffect('l', 53))
            if (hasUpgrade('c', 51)) milkGain = milkGain.times(upgradeEffect('c', 51))
            if (hasUpgrade('p', 23)) {milkGain = milkGain.times(upgradeEffect('p', 23))}
            if (hasUpgrade('w', 13)) {milkGain = milkGain.times(upgradeEffect('w', 13))}
            if (hasUpgrade('p', 31)) {milkGain = milkGain.times(upgradeEffect('p', 31))}
            if (hasUpgrade('p', 33)) milkGain = milkGain.times(upgradeEffect('p', 33))
            if (hasUpgrade('c', 73)) milkGain = milkGain.times(upgradeEffect('c', 73))
            player.c.milk = player.c.milk.add(milkGain.times(diff));
        }
        
    },

    tabFormat: {
        // Tab 1
        "Brewing": {
            content: [
                "main-display",
                function() {
                    if (hasMilestone('s', 2)) return ""; 
                    return "prestige-button";
                },
                "blank",
                "hr",
                "blank",
                ["display-text", "<h3>Coffee Cups Upgrades</h3>"],
                "blank",
                ["upgrades", [1, 2, 3, 6]]  // Upgrades that will show
            ]
        },
        // Tab 2
        "Milk Station": {
            unlocked() { return player.c.milkTabUnlocked }, 
            content: [
                "main-display",
                "blank",
                ["display-text", function() {
                    let milkGain = player.points.add(1).pow(0.125);
                    if (hasUpgrade('c', 25)) milkGain = milkGain.times(upgradeEffect('c', 25));
                    milkGain = milkGain.times(buyableEffect('b', 12));
                    return "You have <h2 style='color: #FDFEFE; text-shadow: 0 0 5px #BDC3C7;'>" + format(player.c.milk) + "</h2> Milk."
                }],
                
                ["display-text", function() {
                    let milkGain = player.points.add(1).pow(0.125)
                    
                     if (hasUpgrade('c', 25)) milkGain = milkGain.times(upgradeEffect('c', 25))
                    milkGain = milkGain.times(buyableEffect('b', 12))

                    if (hasUpgrade('c', 44)) milkGain = milkGain.times(upgradeEffect('c', 44))
                    if (hasUpgrade('p', 14)) milkGain = milkGain.times(upgradeEffect('p', 14))
                    if (buyableEffect('l', 53)) {milkGain = milkGain.times(buyableEffect('l', 53))}
                    if (hasUpgrade('c', 51)) milkGain = milkGain.times(upgradeEffect('c', 51));
                    if (hasUpgrade('p', 23)) milkGain = milkGain.times(upgradeEffect('p', 23));
                    if (hasUpgrade('w', 13)) milkGain = milkGain.times(upgradeEffect('w', 13));
                    if (hasUpgrade('p', 31)) milkGain = milkGain.times(upgradeEffect('p', 31));
                    if (hasUpgrade('p', 33)) milkGain = milkGain.times(upgradeEffect('p', 33));
                    if (hasUpgrade('c', 73)) milkGain = milkGain.times(upgradeEffect('c', 73));
                    if (hasUpgrade('w', 24)) {milkGain = milkGain.times(upgradeEffect('w', 24));}
                    return "(+" + format(milkGain) + "/sec)"
                }],
                "blank",
                "hr",
                "blank",
                ["display-text", "<h3>Milk Upgrades</h3>"],
                "blank",
                ["upgrades", [4, 5, 7]]
            ]
        }
    },
    
    row: 0,
    hotkeys: [
        {key: "c", description: "C: Reset for Coffee Cups", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer) {
        if (resettingLayer == "s" || resettingLayer == "w") {
            player.c.points = new Decimal(0);         // Coffee Cups
            player.c.milk = new Decimal(0);           // Clear Milk back to 0
            player.c.milkTabUnlocked = false;         // Lock the Milk Station tab
            player.c.upgrades = [];                   // Ppurchased upgrades array 
            return;                                   
        }
        if (layers[resettingLayer].row > this.row) {
            player.c.points = new Decimal(0); 
            player.c.upgrades = player.c.upgrades.filter(upg => String(upg).startsWith('4') || String(upg).startsWith('5'));
        }
    },
    
    upgrades: {
        rows: 7, 
        cols: 5, 
        // --- COFFEE CUPS UPGRADES ---
        11: {
            title: "Larger Cups",
            description: "Increase Beans based on Coffee Cups.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1).pow(0.84)
            },
         effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Normal Cups",
            description: "x2 Beans.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('c', 11) },
        },
        13: {
            title: "CoFFee BeAnS",
            description: "Cups = Beans.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).pow(1.12)
            },
            unlocked() { return hasUpgrade('c', 12) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Caffeine Rush",
            description: "You need this now.. x4 Beans.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('c', 13) },
        },
        15: {
            title: "Beans Go Brrr",
            description: "Beans multiply Beans.",
            cost: new Decimal(6),
            effect() {
                let baseEffect = player.points.add(1).pow(0.41);
                
                if (baseEffect.gt("1e400")) {
                    let excess = baseEffect.div("1e400");
                    baseEffect = new Decimal("1e400").times(excess.pow(0.1));
                }
                return baseEffect;
            },
            effectDisplay() { 
                let rawEffect = player.points.add(1).pow(0.41);
                if (rawEffect.gt("1e400")) {
                    return "<span style='color: #cd0b0b; font-weight: bold;'>" + format(this.effect()) + "x (softcapped)</span>";
                }
                return format(this.effect()) + "x"; 
            },
            unlocked() { return hasUpgrade('c', 14) },
        },
        21: {
            title: "Premium Roast",
            description: "Gain 5x more Beans.",
            cost: new Decimal(11),
            
            unlocked() {
                return hasUpgrade('p', 12)
            },
        },
        22: {
            title: "Expert Supervision",
            description: "Barista Efficiency level boosts Customers.",
            cost: new Decimal(12), 
            effect() {
                let trainingLevel = getBuyableAmount('b', 11);
                return trainingLevel.times(0.25).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() { 
                return hasMilestone('b', 0); 
            },
        },
        23: {
            title: "Cup of the Day",
            description: "Coffee Cups multiply Customers.",
            cost: new Decimal(13),
            effect() {
                return player[this.layer].points.times(0.2).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            
            unlocked() {
                return hasUpgrade('c', 22)
            },
        },
        24: {
            title: "Milk Steamers",
            description: "Unlocks Milk, it is based on Beans.",
            cost: new Decimal(15), 
            onPurchase() {
                player.c.milkTabUnlocked = true;
            },
            unlocked() { return hasUpgrade('c', 23) },
        },
        25: {
            title: "Expert Frothing",
            description: "Baristas boost Milk.",
            cost: new Decimal(18),  
            effect() {
                return player.b.points.times(0.5).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() { 
                return hasUpgrade('c', 41) 
            },
        },
        31: {
            title: "Caffeine Lab Synergy",
            description: "Total Research Points multiply Beans.",
            cost: new Decimal(92),
            unlocked() { return hasMilestone('s', 1) }, // 🌟 Requires Star Milestone 1 (2 Stars)
            effect() { 
                 let totalRPCreated = getBuyableAmount('l', 11).add(getBuyableAmount('l', 12));
                return new Decimal(1.05).pow(totalRPCreated);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        32: {
            title: "Crowd Catalysis",
            description: "Customers boost Bean gain.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('c', 31) },
            effect() { 
                return player.p.customers.add(1).pow(0.08); 
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        33: {
            title: "BEANZ TAKE OVER",
            description: "Beans multiply Beans.",
            cost: new Decimal(120),
            unlocked() { return hasUpgrade('c', 32) },
            effect() {
                return player.points.add(1).pow(0.045)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            
        },
        34: {
            title: "Scientific Franchise",
            description: "Customers are multiplied by Classic Macchiato recipe level.",
            cost: new Decimal(166),
            unlocked() { return hasUpgrade('c', 33) },
            effect() {
                let macchLevel = getBuyableAmount('l', 51);
                return macchLevel.times(2).add(1); 
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        35: {
            title: "The Grand Espresso",
            description: "Every upgrade purchased x1.12 boost Espresso Lab Recipes.",
            cost: new Decimal(208),
            unlocked() { return hasUpgrade('c', 34) },
            effect() {
                let totalUpgs = (player.c.upgrades?.length || 0) + 
                                (player.p.upgrades?.length || 0) + 
                                (player.b.upgrades?.length || 0);
                return new Decimal(1.12).pow(totalUpgs);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        61: {
            title: "ULTIMATE VIP Brewing",
            description: "VIP's boost passive Coffee Cup generation per OoM.",
            cost: new Decimal(4e3), 
            unlocked() { return hasMilestone('s', 3) },
            effect() {
                let vips = player.p.vipCustomers || new Decimal(0);
                let vipOoM = vips.add(1).log10();
                
                if (hasUpgrade('c', 61)) return vipOoM;
                return new Decimal(0);
            },
            effectDisplay() { return "+" + format(this.effect(), 2) + "/s" },
        },
        62: {
            title: "Caffeinated Brainstorming",
            description: "Coffee Cups divide Lab Upgrade costs.",
            cost: new Decimal(1.5e4),
            unlocked() { return hasUpgrade('c', 61) },
            effect() {
                let cupsLog = player.c.points.add(1).log10();

                return new Decimal(1.5).pow(cupsLog);
            },
            effectDisplay() { return " /" + format(this.effect()) },
        },
        63: {
            title: "Self-Refilling Cups",
            description: "Coffee Cups boost itself.",
            cost: new Decimal(2e5),
            unlocked() { return hasUpgrade('c', 62) },
            effect() {
                let cups = player.c.points;
                let cupsLog = cups.add(1).log10();
                
                return cupsLog.pow(1.12);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        64: {
            title: "Extra Spicy Beans",
            description: "1e20x Beans.",
            cost: new Decimal(3e6),
            unlocked() { return hasUpgrade('c', 63) },
            effect() {
                return new Decimal("1e20");
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        65: {
            title: "MATRIX DIVIDER",
            description: "Divide Lab Upgrade costs one last time...",
            cost: new Decimal(3e10),
            unlocked() { return hasUpgrade('c', 64) },
            effect() {
                let cups = player.c.points;
                let cupsLog2 = cups.add(1).log2();
        
                return new Decimal(1.28).pow(cupsLog2);
            },
            effectDisplay() { return "/" + format(this.effect(), 2) },
        },
        
        // --- MILK UPGRADES ---
        41: {
            title: "Condensed Creamer",
            description: "Milk multiplies Beans.",
            cost: new Decimal(250),
            effect() {
                let baseEffect = player.c.milk.add(1).pow(0.4);
                if (baseEffect.gt("1e150")) {
                    let excess = baseEffect.div("1e150");
                    baseEffect = new Decimal("1e150").times(excess.pow(0.1));
                }
                return baseEffect;
            },
            effectDisplay() { 
                let rawEffect = player.c.milk.add(1).pow(0.4);
                
                if (rawEffect.gt("1e150")) {
                    return "<span style='color: #cd0b0b; font-weight: bold;'>" + format(this.effect()) + "x (softcapped)</span>";
                }
                return format(this.effect()) + "x"; 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 24) } 
        },
        42: {
            title: "Creamy Froth",
            description: "Milk multiplies Customers.",
            cost: new Decimal(2e4),
            effect() {
                return player[this.layer].milk.add(1).pow(0.18);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 41) }
        },
        43: {
            title: "Pasteurization",
            description: "Milk multiplies the effectiveness of Barista Efficiency.",
            cost: new Decimal(2.5e5),
            effect() {
                return player[this.layer].milk.add(1).pow(0.025);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 42) }
        },
        44: {
            title: "Chilled Tanks",
            description: "Customers multiply Milk.",
            cost: new Decimal(5e6),
            effect() {
                 return player.p.customers.add(1).pow(0.22);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 43) }
        },
        45: {
            title: "You may order now!",
            description: "Milk multiplies Customers.",
            cost: new Decimal(2e9),
            effect() {
                return player[this.layer].milk.add(1).pow(0.30);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 44) }
        },
        
        51: {
            title: "Milk Chemistry",
            description: "Milk multiplied by Baristas.",
            cost: new Decimal(1e49), 
            unlocked() { 
                return hasMilestone('s', 1); 
            },
            effect() {
                return player.b.points.pow(1.75).add(1.25);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasMilestone('s', 1) }
        },
        52: {
            title: "Premium Marketing",
            description: "Milk boosts VIP Customers.",
            cost: new Decimal("1e98"), 
            
            effect() {
                let baseMilkGen = player.points.add(1).pow(0.09);
                return baseMilkGen.add(1).log10().times(0.5).add(1);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasMilestone('p', 1) }
        },
        53: {
            title: "Elites like Milk",
            description: "Milk boosts VIP Customers again.",
            cost: new Decimal("1e108"), 
            
            effect() {
                let baseMilkGen = player.points.add(1).pow(0.64);
                return baseMilkGen.add(1).log10().times(0.55).add(1);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 52) }
        },
        54: {
            title: "What makes Beans + Milk?",
            description: "Milk multiplies Beans.",
            cost: new Decimal("4.5e145"),
            effect() {
                return player[this.layer].milk.add(1.25).pow(0.055);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 53) }
        },
        55: {
            title: "The Grand Macchiato",
            description: "Milk floods the Espresso Lab Recipes.",
            cost: new Decimal("1e183"), 
            unlocked() { 
                return hasUpgrade('c', 54);
            },
            effect() {
                let milkExponentSteps = player.c.milk.add(1).log10();
                let baseEffect = new Decimal(1.055).pow(milkExponentSteps);
                
                if (hasUpgrade('c', 74)) {
                    baseEffect = baseEffect.times(upgradeEffect('c', 74));
                }
                return baseEffect;
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            effectDisplay() { 
                return format(this.effect()) + "x" 
            }
        },
        71: {
            title: "Premium Blending",
            description: "Milk boosts VIP Customers.",
            cost: new Decimal("1e426"), 
            
            effect() {
                let baseMilkGen = player.points.add(1).pow(0.45);
                return baseMilkGen.add(1).log10().times(0.5).add(1);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasMilestone('s', 3) }
        },
        72: {
            title: "Automation Tuning",
            description: "How can Milk boost a VIP Party?",
            cost: new Decimal("4.61e461"),
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            unlocked() { return hasUpgrade('c', 71) }, 
            effect() {
                let milk = player.c.milk || new Decimal(0);
                let milkLog = milk.add(1).log10();

                return new Decimal(1.05).pow(milkLog);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            
        },
        73: {
            title: "No milk = no Coffee?",
            description: "Coffee Cups boost Milk",
            cost: new Decimal("1e563"),
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            unlocked() { return hasUpgrade('c', 72) },
            effect() {
                let cups = player.c.points;

                return new Decimal(1.25).pow(cups.add(1).pow(0.27));
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        74: {
            title: "Lab Infusion",
            description: "Improve upgrade 25.",
            cost: new Decimal("1e579"), 
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            unlocked() { return hasUpgrade('c', 73) },
            effect() {
                let milk = player.c.milk;
                
                return new Decimal(1.05).pow(milk.add(1).log10().div(1.5));
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        75: {
            title: "ULTIMATE DIVIDER",
            description: "Divide Lab Upgrade costs again...",
            cost: new Decimal("1e800"),
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            unlocked() { return hasUpgrade('c', 74) },
            effect() {
                let milk = player.c.milk;
                let milkLog10 = milk.add(1).log10().log10();

                return new Decimal(10).pow(milkLog10);
            },
            effectDisplay() { return "/" + format(this.effect(), 2) },
        },
        
        
    },
    
})
        
    
