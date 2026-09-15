addLayer("O", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),     
        Goal: new Decimal(0.0001),    
        reward: new Decimal(1),   
    }},

    color: "#ff00ff",                       // The color for this layer, which affects many elements.
    resource: "Ordinal",            // The name of this layer's main prestige resource.
    row: 3,  
    position: -1000,                               // The row this layer is on (0 is the first row).
    branches:["F"],
    baseResource: "Factors",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.F.points },  // A function to return the current amount of baseResource.

    requires(){if (player.M.points.gte(1)&&!player.O.points.gte(1)) return new Decimal("1.8e312")
else return new Decimal("1.8e308")} ,              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.01,                          // "normal" prestige gain is (currency^exponent).
    effect(){
        if(hasChallenge('E',31))return player.O.points.add(1).log(5).add(1).pow(3)
        if(hasMilestone('MS',1.7e30)) return player.O.points.add(1).log(9).add(1).pow(2)
     else if(hasUpgrade('UF',95))  return player.O.points.add(1).log(10).add(1).pow(1.5)
        else return player.O.points.add(1).log(10).add(1)},
    effectDescription(){    
        return "Which make Number Gain ^" + format(tmp.O.effect)
    
},
    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        mult= new Decimal(1)   
        if(challengeCompletions('UF',21)>4) mult = mult.times(player.M.points.add(1).pow(2.5))
        if(hasUpgrade('UF',101))  mult = mult.times(player.M.points.add(1).pow(2))
        return mult        
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        let mult= new Decimal(1)   
        if(hasMilestone('F',1e100))  mult = mult.times(1.5)
        return mult  
    },

    layerShown() { return hasMilestone('E',1e15) },          // Returns a bool for if this layer's node should be visible in the tree.

   milestones: {
    1: {
        requirementDescription: "1 Ordinal",
        effectDescription: "Keep Negative numbers challenge on reset.",
        done() { return player.O.points.gte(1) },
    },
    2: {
        requirementDescription: "2 Ordinal",
        effectDescription: "Keep IP upgrade on reset.",
        done() { return player.O.points.gte(2) },
    },
    4: {
        requirementDescription: "4 Ordinal",
        effectDescription: "Keep I milestone and challenge on reset.",
        done() { return player.O.points.gte(4) },
    },
    6: {
        requirementDescription: "6 Ordinal",
        effectDescription: "Keep UF upgrade on reset, auto buy buyable.",
        done() { return player.O.points.gte(6) },
    },
    9: {
        requirementDescription: "9 Ordinal",
        effectDescription: "Keep IP milestone on reset. Ordinal boost EP gain.",
        done() { return player.O.points.gte(9) },
    },
    100: {
        requirementDescription: "100 Ordinal",
        effectDescription: "Number ^2 and Ordinal boost CP gain.",
        done() { return player.O.points.gte(100) },
    },
    103: {
        requirementDescription: "3 ω completions",
        effectDescription: "Number boost point gain.",
        done() { return challengeCompletions('O',11)>2},
    },
    104: {
        requirementDescription: "150000 Ordinal",
        effectDescription: "Factor are cheaper, Boost or nerf is boost IP instead of NN.",
        done() { return player.O.points.gte(150000)},
    },
    277: {
        requirementDescription: "1e277 Ordinal",
        effectDescription: "Tickspeed effect is better.",
        done() { return player.O.points.gte(1e277)},
    },
    369: {
        requirementDescription: "69 ω completions",
        effectDescription: "Game speed ^1.01. EP x1e8 and Mathematician is cheaper",
        done() { return challengeCompletions('O',11)>68},
    },
    },
    challenges:{
        11: {
            name: "ω",
            completionLimit(){
                let limit=10;
                if(hasChallenge('E',22)) limit=new Decimal(20)
                if(hasMilestone('S',4)) limit=new Decimal(100)
                return limit;
            },
            challengeDescription(){
                if(hasMilestone('S',4))  return "Number gain ^" + player.O.Goal+"<br>You have completed this challenge "+ challengeCompletions('O',11)+"/1000 times." 
               else if(hasChallenge('E',22))  return "Number gain ^" + player.O.Goal+"<br>You have completed this challenge "+ challengeCompletions('O',11)+"/20 times." 
                else return "Number gain ^" + player.O.Goal+"<br>You have completed this challenge "+ challengeCompletions('O',11)+"/10 times." },
            canComplete(){return player.F.points.gte("1.8e308")},
            goalDescription: "1.8e308 Factors",
            rewardDescription(){return "Boost the sixth milestone and Number ^"+format(player.O.reward)},
          unlocked(){return hasUpgrade("UF", 94)},
          onExit(){if( player.F.points.gte("1.8e308")) player.O.Goal= player.O.Goal.div(10000)
        }
        },
    },
    update(diff){
        player.O.reward=new Decimal(1.5).pow(challengeCompletions('O',11))
        if(challengeCompletions('O',11)>=65) player.O.Goal=new Decimal(1).div(new Decimal(player.O.reward.pow(0.78125)).pow(challengeCompletions('O',11)))
        else if(challengeCompletions('O',11)>=50) player.O.Goal=new Decimal(1).div(new Decimal(player.O.reward.pow(0.7)).pow(challengeCompletions('O',11)))
        else  player.O.Goal=new Decimal(1).div(new Decimal(10000).pow(challengeCompletions('O',11)))
    },
    passiveGeneration(){return hasMilestone('E',1e144)? 10 : 0},
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