function getLabPercentages() {
    let total = player.l.beanUnits.add(player.l.milkUnits);
    if (total.eq(0)) return { beans: new Decimal(0), milk: new Decimal(0) };
    
    let rawBeans = player.l.beanUnits.div(total).times(100);
    let rawMilk = player.l.milkUnits.div(total).times(100);

    return {
        beans: new Decimal(rawBeans.toFixed(2)),
        milk: new Decimal(rawMilk.toFixed(2))
    };
};

addLayer("l", { 
    name: "Espresso Lab",
    symbol: "L",
    row: 2,
    position: -1, 
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        
        // 🌟 CUSTOM LAB WALLETS 🌟
        researchPoints: new Decimal(0),
        beanUnits: new Decimal(0), 
        milkUnits: new Decimal(0), 
        
        // Individual recipe level trackers
        macchiatoLevel: new Decimal(0),
        flatWhiteLevel: new Decimal(0),
        cappuccinoLevel: new Decimal(0),
    }},

    
    color: "#9B59B6",
    type: "none",
    update(diff) {
        if (hasMilestone('s', 3)) {
            let maxLevelsThisFrame = new Decimal(25).times(diff);

            // Buyable 11 Automation
            if (canBuyBuyable('l', 11)) {
                let maxAffordable11 = player.points.div(layers.l.buyables[11].cost());
                
                let actualBought11 = Decimal.min(maxLevelsThisFrame, maxAffordable11).floor();

                if (actualBought11.gt(0)) {
                    let totalCost11 = layers.l.buyables[11].cost().times(actualBought11);
                    player.points = player.points.sub(totalCost11);

                    let currentAmt11 = getBuyableAmount('l', 11);
                    setBuyableAmount('l', 11, currentAmt11.add(actualBought11));

                    player.l.researchPoints = player.l.researchPoints.add(actualBought11);
                }
            }

            // Buyable 12  Automation 
            if (canBuyBuyable('l', 12)) {
                let maxAffordable12 = player.c.milk.div(layers.l.buyables[12].cost());
                let actualBought12 = Decimal.min(maxLevelsThisFrame, maxAffordable12).floor();

                if (actualBought12.gt(0)) {
                    let totalCost12 = layers.l.buyables[12].cost().times(actualBought12);
                    player.c.milk = player.c.milk.sub(totalCost12);

                    let currentAmt12 = getBuyableAmount('l', 12);
                    setBuyableAmount('l', 12, currentAmt12.add(actualBought12));

                    player.l.researchPoints = player.l.researchPoints.add(actualBought12);
                }
            }
        }
    },
    
    // --- BASELINE INTERFACE LAYOUT ---
    tabFormat: [
        "blank",
        ["display-text", "<h2>The Espresso Laboratory</h2>"],
        "blank",
        ["display-text", "Welcome to the Lab. Here you will convert massive ingredient reserves into Research Points to test new Coffee Recipes."],
        "blank",
        ["display-text", function() {
            return "🧪 Research Lab Vault: <h3 style='color: #9B59B6; display: inline;'>" + formatWhole(player.l.researchPoints) + " Research Points</h3>"
        }],
        "blank",
        ["display-text", "<h3>Data Extraction Terminals</h3>"],
        "blank",
        ["row", [["buyable", 11], ["buyable", 12]]],
        "blank",
        ["display-text", function() {
            let bUnits = player.l.beanUnits;
            let mUnits = player.l.milkUnits;
            let total = bUnits.add(mUnits);

            if (total.eq(0)) return "Chamber Status: <span style='color: #7F8C8D;'>Empty (Set mixer quantities below to begin blending)</span>";

            let beanPercent = bUnits.times(100).div(total);
            let milkPercent = mUnits.times(100).div(total);

            return "Current Mixture Ratios:<br>" +
                   "🫘 Beans Focus: <h3 style='color: #E67E22; display: inline;'>" + format(beanPercent) + "%</h3> (" + formatWhole(bUnits) + " Units)<br>" +
                   "🥛 Milk Froth:  <h3 style='color: #3498DB; display: inline;'>" + format(milkPercent) + "%</h3> (" + formatWhole(mUnits) + " Units)"
        }],
        "blank",
        ["display-text", "<h4>You need the exact ratio to buy upgrades</h4>"],
        // --- RENDER CATEGORY BUTTON GROUPS ---
        ["display-text", "<h4>Adjust Bean & Milk Density:</h4>"],  
        "blank",
        ["row", [
            ["buyable", 21], ["buyable", 22], 
            "blank", "blank", 
            ["buyable", 23], ["buyable", 24]
        ]],
        "blank",
        ["display-text", function() {
            // The header text only prints if at least one preset button is visible
            if (getBuyableAmount('l', 51).gt(0) || getBuyableAmount('l', 52).gt(0) || getBuyableAmount('l', 53).gt(0)) {
                return "<b>Mixture Presets:</b>";
            }
            return "";
        }],
        ["clickables", [3]],
        ["row", [["buyable", 51], ["buyable", 52], ["buyable", 53]]],
        "blank",
        "hr",
    ],
    
    buyables: {
        rows: 3,
        cols: 3,

        11: {
            title: "Extract Research Data (Beans)",
            cost(x) { 
                return new Decimal(1e10).times(new Decimal(1e3).pow(x)) 
            },
            display() { 
                return "Centrifuge your standard bean reserves into scientific data.\n\n" +
                       "Research Points Minted: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n" +
                       "Cost: " + format(this.cost()) + " Beans\n\n" +
                       "Adds +1 Research Point to your lab vault."
            },
            canAfford() { 
                return player.points.gte(this.cost()) 
            },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            canBuyMax: true, 
            resetsNothing: true, 
            unlocked() { return true }
        },
        12: {
            title: "Extract Research Data (Milk)",
            cost(x) { 
                return new Decimal(1e3).times(new Decimal(1e2).pow(x)) 
            },
            display() { 
                return "Analyze your milk station supply curves for new variables.\n\n" +
                       "Research Points Minted: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n" +
                       "Cost: " + format(this.cost()) + " Milk\n\n" +
                       "Adds +1 Research Point to your lab vault."
            },
            canAfford() { 
                return player.c.milk.gte(this.cost()) 
            },
            buy() {
                player.c.milk = player.c.milk.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            canBuyMax: true,
            resetsNothing: true,
            unlocked() { return true }
        },
        21: {
            title: "🫘 -",
            cost(x) { return new Decimal(0) },
            display() { return "" }, 
            canAfford() { return player.l.beanUnits.gt(0) },
            buy() { 
                player.l.beanUnits = player.l.beanUnits.sub(1)
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        22: {
            title: "🫘 +",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            canAfford() { return player.l.researchPoints.gte(1) },
            buy() { 
                player.l.researchPoints = player.l.researchPoints.sub(1)
                player.l.beanUnits = player.l.beanUnits.add(1) 
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        // MILK MIX ADJUSTMENT BUTTONS
        23: {
            title: "🥛 -",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            canAfford() { return player.l.milkUnits.gt(0) },
            buy() { 
                player.l.milkUnits = player.l.milkUnits.sub(1)
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        24: {
            title: "🥛 +",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            canAfford() { return player.l.researchPoints.gte(1) },
            buy() { 
                player.l.researchPoints = player.l.researchPoints.sub(1)
                player.l.milkUnits = player.l.milkUnits.add(1) 
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        // Pre-Sets
        
        // RECIPE Upgrades
        51: {
            title: "Classic Macchiato",
           cost(x) { 
                let baseCost = new Decimal(1).times(new Decimal(1.2).pow(x)); 

                if (hasUpgrade('w', 14)) {
                    baseCost = baseCost.div(upgradeEffect('w', 14));
                }
                if (hasUpgrade('c', 62)) {
                    baseCost = baseCost.div(upgradeEffect('c', 62));
                }
                if (hasUpgrade('c', 75)) {
                    baseCost = baseCost.div(upgradeEffect('c', 75));
                }
                if (hasUpgrade('p', 35)) {
                    baseCost = baseCost.div(upgradeEffect('p', 35));
                }
                if (hasUpgrade('c', 65)) {
                    baseCost = baseCost.div(upgradeEffect('c', 65));
                }
                return baseCost.floor();
            },
            effect(x) {
                let baseEffect = new Decimal(3).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 63.64% Beans / 36.36% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Beans."
            },
            canAfford() {
                let mix = getLabPercentages();
                
                let exactCombo = mix.beans.eq(63.64) && mix.milk.eq(36.36);
                return exactCombo && player.l.researchPoints.gte(this.cost());
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        },

        52: {
            title: "Velvet Flat White",
                cost(x) { 
                    let baseCost = new Decimal(2).times(new Decimal(1.25).pow(x)); 
                    
                    if (hasUpgrade('w', 14)) {
                        baseCost = baseCost.div(upgradeEffect('w', 14));
                    }
                    if (hasUpgrade('c', 62)) {
                        baseCost = baseCost.div(upgradeEffect('c', 62));
                    }
                    if (hasUpgrade('c', 75)) {
                    baseCost = baseCost.div(upgradeEffect('c', 75));
                    }
                    if (hasUpgrade('p', 35)) {
                    baseCost = baseCost.div(upgradeEffect('p', 35));
                    }
                    if (hasUpgrade('c', 65)) {
                    baseCost = baseCost.div(upgradeEffect('c', 65));
                }
                    return baseCost.floor();
                },
            effect(x) {
                let baseEffect = new Decimal(2.5).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 37.04% Beans / 62.96% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Customers."
            },
            canAfford() {
                let mix = getLabPercentages();
                
                let exactCombo = mix.beans.eq(37.04) && mix.milk.eq(62.96);
                return exactCombo && player.l.researchPoints.gte(this.cost());
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        },

        53: {
            title: "Nitro Cold Brew",
            cost(x) { 
                let baseCost = new Decimal(2).times(new Decimal(1.251).pow(x)); 
                
                if (hasUpgrade('w', 14)) {
                    baseCost = baseCost.div(upgradeEffect('w', 14));
                }
                if (hasUpgrade('c', 62)) {
                    baseCost = baseCost.div(upgradeEffect('c', 62));
                }
                if (hasUpgrade('c', 75)) {
                    baseCost = baseCost.div(upgradeEffect('c', 75));
                }
                if (hasUpgrade('p', 35)) {
                    baseCost = baseCost.div(upgradeEffect('p', 35));
                }
                if (hasUpgrade('c', 65)) {
                    baseCost = baseCost.div(upgradeEffect('c', 65));
                }
                return baseCost.floor();
            },
            effect(x) {
                let baseEffect = new Decimal(4).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 15.94% Beans / 84.06% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Milk."
            },
            canAfford() {
                let mix = getLabPercentages();
                
                let exactCombo = mix.beans.eq(15.94) && mix.milk.eq(84.06);
                return exactCombo && player.l.researchPoints.gte(new Decimal(this.cost()));
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        }
    },
    clickables: {
        31: {
            title: "Preset 1",
            display() { return "63.64% - 36.36%" },
            unlocked() { return getBuyableAmount('l', 51).gt(0) },
            canClick() { return true },
            onClick() {
                let currentAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.add(currentAllocated);

                player.l.beanUnits = new Decimal(7);
                player.l.milkUnits = new Decimal(4);

                let newAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.sub(newAllocated);
                updateTemp();
            },
            style: { "width": "75px", "height": "65px", "min-height": "75px", "margin": "2px" },
        },
        32: {
            title: "Preset 2",
            display() { return "37.04% - 62.96%" },
            unlocked() { return getBuyableAmount('l', 52).gt(0) },
            canClick() { return true },
            onClick() {
                let currentAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.add(currentAllocated);

                player.l.beanUnits = new Decimal(10);
                player.l.milkUnits = new Decimal(17);

                let newAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.sub(newAllocated);
                updateTemp();
            },
            style: { "width": "75px", "height": "65px", "min-height": "75px", "margin": "2px" },
        },
        33: {
            title: "Preset 3",
            display() { return "15.94% - 84.06%" },
            unlocked() { return getBuyableAmount('l', 53).gt(0) },
            canClick() { return true },
            onClick() {
                let currentAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.add(currentAllocated);

                player.l.beanUnits = new Decimal(11);
                player.l.milkUnits = new Decimal(58);

                let newAllocated = player.l.beanUnits.add(player.l.milkUnits);
                player.l.researchPoints = player.l.researchPoints.sub(newAllocated);
                updateTemp();
            },
           style: { "width": "75px", "height": "65px", "min-height": "75px", "margin": "2px" },
        },
    },
    
    branches: [
        "s" 
    ],
    tooltip() {
        // Automatically reads and formats your lab point storage vault
        return formatWhole(player.l.researchPoints) + " Research Points";
    },
    
    // Displays this clean indicator if the player hovers over it before earning Star #1
    tooltipLocked() {
        return "Espresso Lab (Unlock via Star Milestone 1)";
    },

   layerShown() { 
        // 1. If they possess Star Milestone 0, flip your permanent tracker to true!
        if (hasMilestone('s', 0) || player.s.points.gte(1)) {
            player.c.starsUnlocked = true;
        }

        // 2. Returns the permanent switch, keeping the Lab visible (even when progress resets!)
        return player.c.starsUnlocked;
    }
})
