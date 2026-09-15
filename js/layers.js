addLayer("a", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "a", // This appears on the layer's node. Default is the id with the first letter capitalized
    color: "#F5754E",
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tooltip:"Achievements",
    resource: "achievements", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
layerShown(){return true},
update (diff){
player.a.points = new Decimal(player.a.achievements.length).add(
  );
},
achievements: {
  11:{
  name: "Upgraded",
  done() {return hasUpgrade("p",11)},
  tooltip:"Get PU11."
  },
    12:{
  name: "First prestige layer.",
  done() {return player.pr.points.gte(1)},
  tooltip:"Get 1000 prestige point."
  },
  13: {
    name: "large-candied-danger",
    done() {return player.c.points.gte(1)},
    tooltip:"Get 1 colour."
  },
  14: {
    name: "A little late, don't you think?",
    done(){return player.points.gte(5e10)
    },
    tooltip: "Get 5e10 points."
  }
},
})
addLayer("p", {
    name: "point", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tabFormat: [
      ["display-text", () => `You have ${format(player.points)} points<br><br>`],
      "upgrades",
      "blank",
      "buyables",
      ],
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
 
    layerShown(){return true},
        doReset(layer){
      if(layer=="p")return
        let keep = []
        if (layer=="pr") {
        if (hasMilestone("pr", 0)) keep.push("upgrades")
      }
           if (layer=="c") {
        if (hasMilestone("c", 0)) keep.push("upgrades")
      }
          layerDataReset("p", keep)
        },
    
        upgrades: {
        11: {
    title: "New tree game fr??",
    description: "Double your point gain.",
    cost: new Decimal(10),
    
    currencyDisplayName: "points",
    
    currencyInternalName: "points",
        },
                12: {
    title: "Booster!",
    description: "Boost point gain based on points.",
    cost: new Decimal(25),
    
    currencyDisplayName: "points",
    
    currencyInternalName: "points",
    
        effect() {
        return player.points.add(1).pow(0.2)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    tooltip:"Points+1^0.2",
        },
          13: {
    title: "Wow, they are useful!",
    description: "Boost point gain based on achievements, and unlock a new layer.",
    cost: new Decimal(75),
    
    currencyDisplayName: "points",
    
    currencyInternalName: "points",
    
        effect() {
     return player.a.points.add(1).pow(1.5);
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    tooltip:"Achievements+1^1.5"
        },
   21: {
     title: "Point Upgrade 28",
     description: "Multiply point gain by 2.8.",
     cost: new Decimal(2e12),
         currencyDisplayName: "points",
    
    currencyInternalName: "points",
    unlocked(){return hasMilestone("c", 0)}
   },
22: {
  title: "#AdvyOut",
  description: "Advy is out, and so you get x2 Prestige Point multiplier.",
  cost: new Decimal(1e13),
      currencyDisplayName: "points",
    
    currencyInternalName: "points",
    unlocked(){ return hasMilestone("c", 0)}
},
23: {
  title: "Prestiged Upgrades",
  description: "Unlock 2 new Prestige Upgrades, and multiply Point Gain based on Points. (again.)",
 cost: new Decimal(2.5e13),
     effect() {
        return player.points.add(10).log(10)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
    currencyDisplayName: "points",
    
    currencyInternalName: "points",
    unlocked(){ return hasMilestone("c", 0)}
  
 
}
        
    },
  
    
})
addLayer("pr", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(500),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.2,                          // "normal" prestige gain is (currency^exponent).

        gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('pr', 21)) mult = mult.times(upgradeEffect('pr', 21))
        	      if (hasUpgrade('pr', 22)) mult = mult.times(upgradeEffect('pr',22))
        	      if (hasUpgrade('pr',23)) mult = mult.times(3)
        	      if (hasUpgrade('c', 12)) mult = mult.times(3)
        	      if (hasUpgrade('p', 22)) mult = mult.times(2)
        	      if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c',22))
	
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasUpgrade('p',13)||player.pr.total.gte(1)},          // Returns a bool for if this layer's node should be visible in the tree.
    
    branches: ['p'],

    upgrades: {
  11: {
    title: "New layer?",
    description: "Ah, new boosts. Multiply point gain by 4.",
    cost: new Decimal(1)
  },
   12: {
    title: "Me when generic:",
    description: "So much genericness. Multiply point gain based on Prestige Points.",
    cost: new Decimal(2),
        effect() {
        return player[this.layer].points.add(3).pow(0.35)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    tooltip:"PP+1^0.3"
    },
     13: {
    title: "Unique stuff?",
    description: "Boost point gain based on prestige upgrades.",
    cost: new Decimal(4),
    },
    21: {
       title: "Goofy upgrade again...",
       description: "Boost Prestige Point gain based on Prestige Points.",
       cost: new Decimal(6),
           effect() {
        return player[this.layer].points.add(1).pow(0.2)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    },
    22: {
      title: "Um, is this upgrade not repetitive?",
      description: "Boost Prestige Point gain based on Achievements.",
      cost: new Decimal(10),
          effect() {
     return player.a.points.add(1).pow(1.3);
    },
effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  // Add formatting to the effect
    },
    23: {
    title: "Why?",
    description: "Multiply Prestige Point gain by 3, and unlock a new layer.(colours)",
      cost: new Decimal(75)
    },
    31: {
      title: "It was broken, now it's fixed!",
      description: "Multiply point gain based on Prestige Point.",
      cost: new Decimal(4e6),
      effect() {
        return player[this.layer].points.add(10).log(10)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },  // Add formatting to the effect
        unlocked(){ return hasUpgrade("p", 23)}
    },
    32: {
      title: "Challenged.",
      description: "Unlock 1 colour challenge and multiply point gain by 4.",
      cost: new Decimal(2e7),
          unlocked(){ return hasUpgrade("p", 23)}
    },
    33: {
      title: "Generic Upgrade Time!",
      description: "Multiply point gain by 4.5, and unlock 3 new colour upgrades.",
      cost: new Decimal(3e8),
         unlocked(){ return hasChallenge("c", 11)}
    }
    },
    milestones: {
      0: {
        requirementDescription: "25 total prestige points.",
        effectDescription: "Nice QoL, keep point upgrades on Prestige Point resets.",
        done() {return player.pr.points.gte(25)}
      }
    }
})
addLayer("c", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#0000FF",                       // The color for this layer, which affects many elements.
    resource: "colours",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(4e7),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1.75,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return (hasUpgrade('pr', 23)) || player.c.total.gte(1)},          // Returns a bool for if this layer's node should be visible in the tree.
    
    branches: ['p'],

    upgrades: {
        11: {
          title: "Red.",
          description: "Multiply point gain by 4.",
          cost: new Decimal(1)
         
        },
        12: {
          title: "Orange.",
          description: "Multiply Prestige Point gain by 3.",
          cost: new Decimal(3)
        },
        13: {
          title: "Yellow.",
          description: "Uh, multiply point gain based on Colours.",
          cost: new Decimal(4),
              effect() {
        return player[this.layer].points.add(1).pow(1.35)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21: {
          title: "Green.",
          description: "Multiply point gain based on points.",
          cost: new Decimal(10),
                effect() {
        return player.points.add(3).log(1.9)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
    unlocked(){ return hasUpgrade("pr", 33)}
        },
        22:{
          title: "Blue",
          description: "Multiply prestige point gain based on Points.",
          cost: new Decimal(11),
                effect() {
        return player.points.add(10).log(15)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
     unlocked(){ return hasUpgrade("pr", 33)}
        },
        23: {
          title: "Violet.",
          description: "I need a boost! Multiply point gain by 24.",
          cost: new Decimal(12),
              unlocked(){ return hasUpgrade("pr", 33)}
        }
        
        
    },
    milestones: {
      0: {
        requirementDescription: "5 colours.",
        effectDescription: "Unlock 3 point upgrades, and keep Point Upgrades on Colour resets.",
           done() {return player.c.points.gte(5)}
      }
    },
    challenges: {
    11: {
        name: "He stood rooted to the ground.",
        challengeDescription: "Points are ^0.5.",
        goalDescription: "Reach 1e8 points.",
        rewardDescription: "Point gain is x100, and unlock a new PU.",
        canComplete: function() {return player.points.gte("1e8")},
        unlocked(){return hasUpgrade("pr",32)}
    },
    }
})