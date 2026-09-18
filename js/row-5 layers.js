addLayer("tr", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#EFEFEF",                       // The color for this layer, which affects many elements.
    resource() {return (player['tr'].points)? "True resets":  "Expansions"},        // The name of this layer's main prestige resource.
    symbol() {return (player['tr'].points)? "Tr":  "II"},//insert image as replacement for II
    row: 5,                                 // The row this layer is on (0 is the first row).
    position: 1,
    style() {return  {'background-color': '#7F7B7D'}},  

    baseResource: "Reset points",
    baseAmount() { return player['r'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1.79e308),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return false }, // once used as end or past that change to true        

    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
    infoboxes: {
        lore: {
            title() {return (player['tr'].points)? "True resets":  "Expansions"},
            body() { return (player['tr'].points)? "the end of resets" : "you thought this was the final layer? well yes, but it will massively expand the layers."},
        },
    },
})