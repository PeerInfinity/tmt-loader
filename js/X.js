addLayer("X", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#198964",                       // The color for this layer, which affects many elements.
    resource: "???",            // The name of this layer's main prestige resource.
    row: 10,                                 // The row this layer is on (0 is the first row).

    baseResource: "Number",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.N.points },  // A function to return the current amount of baseResource.

    requires: new Decimal("ee100"),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1,                          // "normal" prestige gain is (currency^exponent).
base:1,
    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasUpgrade('N',72)||player.X.points.gte(1) },          // Returns a bool for if this layer's node should be visible in the tree.

    branches:["N"],
  
       
    tabFormat: {
       
        "Info": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
              
                ["display-text",function(){
                    let s=""
                    s+="Your point and number gain ^^" + new Decimal(1).minus(player.X.points.times(0.05))+" and ^" +  new Decimal(1).minus(player.X.points.times(0.05))+" but every ??? will rewrite the tree ."
      
                  
              
                    return s
                  }],
           

            ]
        },
  
    },
  

})
