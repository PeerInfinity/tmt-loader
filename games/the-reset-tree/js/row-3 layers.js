addLayer("ap", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#BE2A00",                       // The color for this layer, which affects many elements.
    resource: "Apocolypse points",            // The name of this layer's main prestige resource.
    symbol: "Ap",
    row: 3,                                 // The row this layer is on (0 is the first row).
    position: 1,
    style() {return  {'background-color': '#400F00'}}, 
    branches: ['d'], 

    baseResource: "transcendence points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['t'].points },  // A function to return the current amount of baseResource.

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
            title: "Apocolypse",
            body() { return "reseting yourself is fun, but why not reset the entire world? in the totally humane way of causing the apocolypse several trillion times over!" },
        },
    },
}),

addLayer("s", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked() {return player.rw.seconds.gte(1.79e308)},                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#00BE7A",                       // The color for this layer, which affects many elements.
    resource: "singularity points",            // The name of this layer's main prestige resource.
    symbol: "S",
    row: 3,                                 // The row this layer is on (0 is the first row).
    position: 3,
    branches: ['rf'],
    

    baseResource: "rewind points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['rw'].points },  // A function to return the current amount of baseResource.

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

    layerShown() {return player.rw.seconds.gte(1.79e308)},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
    infoboxes: {
        lore: {
            title: "Singularity",
            body() { return "who knew generating so much time could cause a singularity to form?" },
        },
    },
}),

addLayer("ri", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#7CCA00",                       // The color for this layer, which affects many elements.
    resource: "Reincarnation points",            // The name of this layer's main prestige resource.
    symbol: "Ri",
    row: 3,                                 // The row this layer is on (0 is the first row).
    position: 2,
    style() {return  {'background-color': '#1E4B00'}},  
    branches: ['s','ap','tr','d','rf'],

    baseResource: "Rebirth points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['rb'].points },  // A function to return the current amount of baseResource.

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
            title: "Reincarnation",
            body() { return "isn't this just rebirth-rebirth?" },
        },
    },
})