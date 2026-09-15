addLayer("M", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#80c0ff",                       // The color for this layer, which affects many elements.
    resource: "Mathematician",            // The name of this layer's main prestige resource.
    row: 3,  
    position: 1000,                               // The row this layer is on (0 is the first row).
    branches:["E"],
    baseResource: "Eternity points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.E.points },  // A function to return the current amount of baseResource.

    requires(){if(player.O.points.gte(1)&&!player.M.points.gte(1)) return new Decimal("1e20")
    else return new Decimal("1e15")}, 
    type: "static",                      
    exponent(){
        if(hasMilestone('O',369))   return 1.9
        else return 1.95 } ,     
    base:1e5,                     // "normal" prestige gain is (currency^exponent).
    
    gainMult() {                            
        mult= new Decimal(1)   
        
        return mult            
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasMilestone('E',1e15) },          // Returns a bool for if this layer's node should be visible in the tree.

    milestones: {
        1: {requirementDescription: "1 Mathematician", effectDescription: "Keep Negative numbers, Infinity challenge, UF upgrade on reset. Unlock new UF upgrade.", done() {return player.M.points.gte(1)},},
        2: {requirementDescription: "2 Mathematician", effectDescription: "Keep IP content on reset.", done() {return player.M.points.gte(2)}},
        3: {requirementDescription: "3 Mathematician", effectDescription: "Factor are cheaper.", done() {return player.M.points.gte(3)}},
        4: {requirementDescription: "4 Mathematician", effectDescription: "Keep UF buyable on row 4 reset .", done() { return player.M.points.gte(4) },},
        },
        challenges:{
            11: {
                name: "Euclid",
                challengeDescription: "Number gain ^0.00002",
                canComplete(){return player.N.points.gte("e9e15")},
                goalDescription: "e9e15 Numbers",
                rewardDescription(){return "MP boost CP gain."},
              unlocked(){return hasMilestone("E", 1e27)},
       
            },
        },
        tabFormat: {
            "Milestones": {
                content: [
                    "main-display",
                    "prestige-button",
                    "blank",
                  
                    "milestones"
                ]
            },
            "Challenges": {
                content: [
                    "main-display",
                    "prestige-button",
                    "blank",
                    "challenges",
                  
               
    
                ]
            },
      
        },
       
})