addLayer("d", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#4C1976",                       // The color for this layer, which affects many elements.
    resource: "Dimentional rift points",            // The name of this layer's main prestige resource.
    symbol: "Dr",
    row: 4,                                 // The row this layer is on (0 is the first row).
    position: 1,
    style() {return  {'background-color': '#14022F'}},  
    branches: ['tr', 'rf'],

    baseResource: "singularity points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['s'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return false },          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
    infoboxes: {
        lore: {
            title: "Dimensional rifts",
            body() { return "One dimension to reset is far too few. Time to use the singualarities to reach other dimensions." },
        },
    },
}),

addLayer("rf", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#F8FF11",                       // The color for this layer, which affects many elements.
    resource: "Reformation points",            // The name of this layer's main prestige resource.
    symbol: "Rf",
    row: 4,                                 // The row this layer is on (0 is the first row).
    position: 2,
    style() {return  {'background-color': '#363605'}},  
    branches: ['tr'],

    baseResource: "Apocolypse points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['ap'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return false },          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
    infoboxes: {
        lore: {
            title: "Reformation",
            body() { return "ok, on second thought maybe causing the apocolypse an unfathomable number of times was a bad idea. Who could have guessed? " },
        },
    },
})