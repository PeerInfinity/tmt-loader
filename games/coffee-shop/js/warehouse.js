addLayer("w", { // "w" for Supply Warehouse
    name: "Warehouse",
    symbol: "W",
    row: 2, 
    position: 1, // Symmetrically mirrors the Espresso Lab on the left wing!
    
    startData() { return {
        unlocked: false,
        points: new Decimal(0), // Your core Warehouse Permits currency!
    }},

    color: "#1ABC9C", // Signature Corporate Teal
    resource: "Warehouse Permits",
    
    // 🌟 NATIVE TMT SIMPLICITY 🌟
    type: "static", 
    requires: new Decimal("1e1000"), // Costs exactly 1e1000 Beans for the first point!
    exponent() {
        let baseExponent = new Decimal(2.72); // Your original baseline scaling factor
        
        // If they bought the clean Upgrade 15, divide the core exponent natively!
        if (hasUpgrade('w', 15)) {
            baseExponent = baseExponent.div(upgradeEffect('w', 15));
        }
        return baseExponent;
    },
    baseResource: "Beans",
    baseAmount() { return player.points },
    resetsNothing() {
        return hasMilestone('s', 3);
    },

    // Reveals itself visually when the player reaches the Star 3 barrier
    layerShown() { 
        return player.s.points.gte(3) || player.w.unlocked; 
    },
    hotkeys: [
        {key: "w", description: "W: Reset for Warehouse Permits", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax: true,

    // 🎨 CLASSIC TMT DASHBOARD BUILDER
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        "hr",
        "blank",
        ["display-text", "<h3>Warehouse Logistical Upgrades</h3>"],
        "blank",
        "upgrades" 
    ],

    upgrades: {
        rows: 2,
        cols: 5,
        
        11: {
            title: "Lab Logistics",
            description: "Beans are boosted by RP (Research Points).",
            cost: new Decimal(3),
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                return new Decimal(1.05).pow(labPoints);
            },
            effectDisplay() { return format(this.effect()) + "x Beans" },
        },
        12: {
            title: "Moree Coffee Cups",
            description: "Each Warehouse Upgrade you own adds +6/s to Coffee Cups",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade('w', 11) },
            effect() {
                let upgCount = player.w.upgrades ? player.w.upgrades.length : 0;
                
                if (hasUpgrade('w', 12)) return new Decimal(upgCount).times(6);
                return new Decimal(0);
            },
            effectDisplay() { return "+" + formatWhole(this.effect()) + "/s" },
        },
        13: {
            title: "Quantum Pumping",
            description: "RP boosts Milk.",
            cost: new Decimal(7),
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                

                return new Decimal(1.07).pow(labPoints);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasUpgrade('w', 12) },
        },
        14: {
            title: "Boxes -> Lab",
            description: "Permits divide Lab Upgrade costs.",
            cost: new Decimal(9), 
            effect() {
                let permits = player.w.points;
                let permitsLog = permits.add(1).log10();
                
                // 1. Calculate your original baseline formula
                let baseEffect = new Decimal(2.8).pow(permitsLog);
                
                // 🌌 WIRE THE OVERCLOCK: Directly multiply the overall dividing effect by Upgrade 23!
                if (hasUpgrade('w', 23)) {
                    baseEffect = baseEffect.times(upgradeEffect('w', 23));
                }
                
                return baseEffect;
            },
             effectDisplay() { return " /" + format(this.effect()) },
            unlocked() { return hasUpgrade('w', 13) },
        },
         15: {
            title: "Optimization",
            description: "RP divides Permit exponent.",
            cost: new Decimal(10), 
            
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                let rawLog = labPoints.add(1).log10();
                
                return new Decimal(1).add(rawLog.times(0.01));
            },
            effectDisplay() { return " /" + format(this.effect(), 3) },
            unlocked() { return hasUpgrade('w', 14) },
        },
        21: {
            title: "Chemical Prestige",
            description: "RP boosts VIP Customers.",
            cost: new Decimal(12),
            unlocked() { return hasMilestone('s', 3) },
             effect() {
                let labPoints = player.l.researchPoints ? new Decimal(player.l.researchPoints) : new Decimal(0);
                let rpLog = labPoints.add(1).log10();
                
                return new Decimal(3.50).pow(rpLog);
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        22: {
            title: "Coffee Belts Rollin'",
            description: "Just x3/s Coffee Cups ",
            cost: new Decimal(13),
            unlocked() { return hasUpgrade('w', 21) },
            effect() {
                if (hasUpgrade('w', 22)) return new Decimal(3);
                return new Decimal(1);
            },
            effectDisplay() { return format(this.effect(),0) + "x" },
        },
        23: {
            title: "Synergistic Overhaul",
            description: "Boosts Upgrade 14's power based on Permits.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade('w', 22) },
             effect() {
                return player.w.points.add(1).pow(1.01);
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
        24: {
            title: "Mass Logistics",
            description: "Multiply Milk & Customers by 1e20x.",
            cost: new Decimal(18),
            unlocked() { return hasUpgrade('w', 23) }, 
            effect() {
                return new Decimal("1e20");
            },
            effectDisplay() { return format(this.effect(),0) + "x" },
        },
        25: {
            title: "Industrial Cups",
            description: "Coffee Cups go to the next level.",
            cost: new Decimal(22),
            unlocked() { return hasUpgrade('w', 24) },
            effect() {
                let permits = player.w.points || new Decimal(0);
                
                return new Decimal(1.50).pow(permits);
            },
            effectDisplay() { return format(this.effect(), 2) + "x" },
        },
    },

     

    branches: ["s"] // Visual link lines vector mapped to the central Stars spine node
});
