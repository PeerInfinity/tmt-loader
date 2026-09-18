addLayer("b", { 
    name: "Baristas",
    symbol: "B",
    row: 1, 
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0), 
    }},
    color: "#E67E22", 
    requires: new Decimal(11), 
    resource: "Baristas",
    baseResource: "Coffee Cups",
    baseAmount() { return player.c.points }, // Checks Coffee Cups layer!
    type: "static",
    base: 1.5, 
    exponent: 0.7,

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

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
        // --- STAR MILESTONE 1: AUTOMATED BARISTA HIRING ---
        // Automatically purchases Buyable 11 and Buyable 12 if affordable!
        if (hasMilestone('s', 1)) {
            if (canBuyBuyable('b', 11)) buyBuyable('b', 11);
            if (canBuyBuyable('b', 12)) buyBuyable('b', 12);
        }
        if (hasMilestone('s', 1)) {
            if (canBuyBuyable('b', 13)) buyBuyable('b', 13);
        }
    },
    // This handles the display on the screen
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        "milestones",
        "blank",
        "hr",
        "blank",
        ["display-text", "<h3>Barista Upgrades</h3>"],
        "blank",
        "buyables",
        "blank"
    ],

    // --- MILESTONES BARISTAS ---
    milestones: {
        0: {
            requirementDescription: "1 Barista",
            done() { 
                return player.b.points.gte(1) 
            },
            effectDescription: "Unlock the Barista Efficiency buyable and a new Coffee Cups upgrade.",
        },
        1: {
            requirementDescription: "3 Baristas",
            done() { 
                return player.b.points.gte(3)
            },
            effectDescription: "Unlock the Advanced Technique buyable.",
            unlocked() { return hasMilestone('b', 0) },
        },
        2: {
            requirementDescription: "16 Baristas",
            done() { 
                return player.b.points.gte(16)
            },
            effectDescription: "Unlock the VIP Party? Buyable.",
            unlocked() {return hasMilestone('s', 1)},
        },
    },

    // --- BUYABLES ---
    buyables: {
        rows: 1, 
        cols: 3, 
        
        11: {
            title: "Barista Efficiency",
            cost(x) { 
                let level = x || getBuyableAmount(this.layer, this.id);
                let baseScaling = new Decimal(1.75).pow(level);
                
                if (level.gte(1000)) {
                    let excess = level.sub(1000);
                    baseScaling = baseScaling.times(new Decimal(1.5).pow(excess.pow(1.5)));
                }
                
                return new Decimal(1).times(baseScaling).floor();
            },
            display() { 
                return "Train your baristas to work faster.\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies Beans by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            canAfford() { 
                return player.p.customers.gte(this.cost()) 
            },
            buy() {
               if (!hasMilestone('s', 1)) {
                    player.p.customers = player.p.customers.sub(this.cost());
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let baseEffect = new Decimal(1.25).pow(x);
                
                if (hasUpgrade('c', 43)) {
                    baseEffect = baseEffect.times(upgradeEffect('c', 43));
                }
                
                return baseEffect;
            },
            unlocked() {
                return hasMilestone('b', 0)
            }
        },
        12: {
            title: "Advanced Technique",
            cost(x) { 
                let level = x || getBuyableAmount(this.layer, this.id);
                let baseScaling = new Decimal(1.6).pow(level);
                
                if (level.gte(1000)) {
                    let excess = level.sub(1000);
                    baseScaling = baseScaling.times(new Decimal(1.5).pow(excess.pow(1.5)));
                }
                
                return new Decimal(1).times(baseScaling).floor();
            },
            display() { 
                return "Train your baristas in styling.\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies Milk by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            canAfford() { 
                return player.p.customers.gte(this.cost()) 
            },
            buy() {
                if (!hasMilestone('s', 1)) {
                    player.p.customers = player.p.customers.sub(this.cost());
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(1.20).pow(x);
            },
            unlocked() {
                return hasMilestone('b', 1)
            }
        },
        13: {
            title: "VIP Party?",
            cost(x) { 
                return new Decimal("1e65").times(new Decimal(15).pow(x));
            },
            display() { 
                return "Senior Staff required for these people..\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies VIP Customers by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            effect(x) {
                let level = x || getBuyableAmount(this.layer, this.id);
                let baseBoost = new Decimal(1.25).pow(level);

                if (hasUpgrade('c', 72)) {
                    baseBoost = baseBoost.times(upgradeEffect('c', 72));
                }
                return baseBoost;
            },
            canAfford() { 
                return player.p.customers.gte(this.cost()); 
            },
            buy() {
                player.p.customers = player.p.customers.sub(this.cost());
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { 
                return hasMilestone('b', 2); 
            }
        },
    

    },
    branches: [
        "c", "p", "s"
    ],
    hotkeys: [
        {key: "b", description: "B: Reset for Baristas", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true }
})
