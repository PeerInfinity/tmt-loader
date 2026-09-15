addLayer("S", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#ffffff",                       // The color for this layer, which affects many elements.
    resource: "Shapes",            // The name of this layer's main prestige resource.
    row: 4,                                 // The row this layer is on (0 is the first row).

    baseResource: "Infinity",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.I.points },  // A function to return the current amount of baseResource.

    requires: new Decimal("1.8e308"),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.0001,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasMilestone('E',1e287) },          // Returns a bool for if this layer's node should be visible in the tree.

    branches:["I","M"],
    milestones: {
        1: {
            requirementDescription: "1 Shapes",
            effectDescription: "Auto buy IP upgrade. Keep E and MS milestone and NN challenge on reset.",
            done() { return player.S.points.gte(1) }
        },
        2: {
            requirementDescription: "2 Shapes",
            effectDescription: "Keep IP, F, UF milestone on reset.",
            done() { return player.S.points.gte(2) }
        },
        3: {
            requirementDescription: "3 Shapes",
            effectDescription: "Keep MS and UF upgrade on reset.",
            done() { return player.S.points.gte(3) }
        },
        4: {
            requirementDescription: "4 Shapes",
            effectDescription: "You can complete ω 1000 times.",
            done() { return player.S.points.gte(4) }
        },
    },
    resetsNothing(){
        return hasUpgrade('MS',83);
    },

})