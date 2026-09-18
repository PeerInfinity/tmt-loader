addLayer("s", { 
    name: "Restaurant Stars",
    symbol: "S",
    row: 2, 
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        starsUnlocked: false,
    }},
    color: "#F1C40F",
    requires: new Decimal(1e50),
    resource: "Stars",
    baseResource: "Beans",
    baseAmount() { return player.points }, 
    type: "static",

   requires() { 
        return this.cost(player.s.points); 
    },
    cost(x) {
        let currentStars = new Decimal(x);

        if (currentStars.eq(0)) return new Decimal("1e50");
        if (currentStars.eq(1)) return new Decimal("5e130");
        if (currentStars.eq(2)) return new Decimal("1e950");
        if (currentStars.eq(3)) return new Decimal("1e1115");
        if (currentStars.eq(4)) return new Decimal("1e2450");

        return new Decimal(1e309); 
    },

    update(diff) {
        // ---  STAR MILESTONE 0 AUTOMATION  ---
        if (hasMilestone('s', 0)) {
            
            // buy Row 1 Coffee Upgrades
            for (let i = 11; i <= 15; i++) {
                if (canAffordUpgrade('c', i) && !hasUpgrade('c', i)) {
                    buyUpgrade('c', i);
                }
            }

            // buy Row 2 Coffee Upgrades
            for (let j = 21; j <= 25; j++) {
                if (canAffordUpgrade('c', j) && !hasUpgrade('c', j)) {
                    buyUpgrade('c', j);
                }
            }
            
        }
        // buy Row 1-2 Milk, Row 3 Coffee and Row 1-2 Popularity Upgrades
        if (hasMilestone('s', 2)) {
            for (let h= 31; h <= 35; h++) {
                if (canAffordUpgrade('c', h) && !hasUpgrade('c', h)) {
                    buyUpgrade('c', h);
                }
            }
            for (let i = 41; i <= 45; i++) {
                if (canAffordUpgrade('c', i) && !hasUpgrade('c', i)) {
                    buyUpgrade('c', i);
                }
            }
            for (let j = 51; j <= 55; j++) {
                if (canAffordUpgrade('c', j) && !hasUpgrade('c', j)) {
                    buyUpgrade('c', j);
                }
            }
            for (let k = 11; k <= 15; k++) {
                if (canAffordUpgrade('p', k) && !hasUpgrade('p', k)) {
                    buyUpgrade('p', k);
                }
            }
            for (let l = 21; l <= 25; l++) {
                if (canAffordUpgrade('p', l) && !hasUpgrade('p', l)) {
                    buyUpgrade('p', l);
                }
            }

            if (canBuyBuyable('b', 11)) buyBuyable('b', 11);
            if (canBuyBuyable('b', 12)) buyBuyable('b', 12);
            
        }
        
    },
    unlocked() {
        return player.points.gte(1e50) || player.s.points.gte(1);
    },

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

    canBuyMax: false,
    resetsNothing: false,

    // --- VISUAL INTERFACE GRID ---
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            let activeMultiplier = new Decimal(1.03).pow(player.s.points);
            return "Current Stars are shining: <h3 style='color: #F1C40F; display: inline;'>^" + format(activeMultiplier) + "</h3> Beans."
        }],
        "blank",
        "hr",
        "blank",
        "milestones"
    ],

    milestones: {
        0: {
            requirementDescription: "⭐ 1 Coffee Shop Star",
            done() { return player.s.points.gte(1) },
            effectDescription: `- Unlock The Espresso Lab <br> - Auto-Buy Row 1-2 Coffee Cups <br> - ^0.03 Beans per Star <br> - Bulk-Buy Coffee Cups, Popularity, and Baristas <br> - Coffee Cups no longer spend Beans`,
        },
        1: {
            requirementDescription: "⭐⭐ 2 Coffee Shop Stars",
            done() { return player.s.points.gte(2) },
            effectDescription: "- A ton of new upgrades everywhere <br> - New Milestones for Popularity and Baristas <br> - Auto-Buy first two Barista Buyables <br> - Auto-Collect Coffee Cups",
            unlocked() {return hasMilestone('s', 0)},
        },
        2: {
            requirementDescription: "⭐⭐⭐ 3 Coffee Shop Stars",
            done() { return player.s.points.gte(3) },
            effectDescription: "- Unlock Warehouse <br> - A lot more Automation <br> - Turn Coffee Cups Passive",
            unlocked() {return hasMilestone('s', 1)},
        },
        3: {
            requirementDescription: "⭐⭐⭐⭐ 4 Coffee Shop Stars",
            done() { return player.s.points.gte(4) },
            effectDescription: "- Unlock the Ultimate Upgrades on almost every layer <br> - Auto-Collect Popularity and Baristas <br> - Auto-Buy Bean and Milk Data" ,
            unlocked() {return hasMilestone('s', 2)},
        },
        4: {
            requirementDescription: "⭐⭐⭐⭐⭐ 5 Coffee Shop Stars",
            done() { return player.s.points.gte(5) },
            effectDescription: "- Unlock the next layer of the game. (Coming Soon!)",
            unlocked() {return hasMilestone('s', 3)},
        }
    },

    hotkeys: [
        {key: "s", description: "S: Reset for Stars", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: [ 
    ],

    layerShown() { 
         return player.c.points.gte(38) || player.s.points.gte(1);
    } 
})
