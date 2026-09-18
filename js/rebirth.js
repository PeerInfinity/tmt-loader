addLayer("r", {
    name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		  points: new Decimal(0),
      best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
    }},
    color: "#1bace7",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "rebirth points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("r", 0)) mult = mult.times(1.5)
        if (hasUpgrade("r", 32)) mult = mult.times(1.5)
        if (hasUpgrade("p", 11)) mult = mult.times(1.5)
        if (hasUpgrade("p", 13)) mult = mult.times(1.25)
        if (hasUpgrade("p",14)) mult = mult.plus(1)
        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
      upgrades: {
    rows: 3,
    cols: 4,
    11: {
        title: "Begin",
        description: "Start Getting points every second.",
        cost: new Decimal(1),
        unlocked() {return hasMilestone("r", 0) }
        
        
        

    },
    12: {
        title: "Double",
        description: "Double points per second!",
        cost: new Decimal(1),
        unlocked() { return hasUpgrade("r", 11) },
        
        
    },
    13: {
        title: "Double 2",
        description: "Double points per second again!",
        cost: new Decimal(2),
        unlocked() { return hasUpgrade("r", 12) },
        
     
    },
    14: {
        title: "Triple",
        description: "This time, Triple your point gain",
        cost: new Decimal(5),
        unlocked() { return hasUpgrade("r", 13) },
        
    },
    21: {
        title: "Rebirth Points",
        description: "Rebirth Points Mutliply Points (little bit)",
        cost: new Decimal(7),
        effect() {
            return player[this.layer].points.add(1).pow(0.1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() { return hasUpgrade("r", 14) },

    },
    22: {
        title: "Double x10 ",
        description: "Points Double, but with X10 (EQUALS 20 TIMES Multi)!!!",
        cost: new Decimal(20),
        unlocked() { return hasUpgrade("r", 21) },
        
        
        
        
    },
    23: {
        title: "Double x10 2 ",
        description: "Points Double, but with X10 (EQUALS 20 TIMES Multi) A-GAIN!!!",
        cost: new Decimal(75),
        unlocked() { return hasUpgrade("r", 22) },
        
       
    },
    24: {
        title: "Point Booster (Rebirth Points 2)",
        description: "Boost Points Based on Rebirth Points(More)",
        cost: new Decimal(650),
        effect() {
          let eff = player.r.points.plus(1).pow(0.2);
          return eff;
        },
          
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() { return hasUpgrade("r", 23) },
    },
    31: {
        title: "Prestige Point Multiplication",
        description: "Rebirth Points Boost Prestige Points (X2)",
        cost: new Decimal(2500),
        unlocked() { return hasMilestone("p", 1)&&hasUpgrade("r", 24) },
    },
    32: {
        title: "Super Boost",
        description: "50% Boost to Prestige Upgrade",
        cost: new Decimal(3000),
        unlocked() { return hasUpgrade("r", 24) },

    },
},
    upgrades2: {
    rows: 100,
    cols: 9,
      
    11: {
        title: "Point Upgrade 1",
        description: "Multiply Points/sec by x1.1",
        cost: new Decimal(500),
        
    },
    12: {
        title: "Point Upgrade 2",
        description: "Multiply Points/sec by x1.1",
        cost: new Decimal(750),

    },
    13: {
        title: "Point Upgrade 3",
        description: "Multiply Points/sec by x1.1",
        cost: new Decimal(1125),
        
    },
    },
    buyables: {
  11: {
            cost(x) { return new Decimal(1.12).pow(x) },
            effect(x) { return new Decimal(1).add(x || getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            title() {
                return format(getBuyableAmount(this.layer, this.id), 0) + "<br/>Time Multiplier"
            },
            display() {
                return "which are boosting your point gain by ×" + format(tmp[this.layer].buyables[this.id].effect) + ".\n\
                    Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Rebirth Points"
            },
            buy() {
                let base = new Decimal(1)
                let growth = 1.12
                let max = Decimal.affordGeometricSeries(player[this.layer].points, base, growth, getBuyableAmount(this.layer, this.id))
                let cost = Decimal.sumGeometricSeries(max, base, growth, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                
            },
        },

  },
milestones: {
    0: {
    requirementDescription: "1 Rebirth Point",
    effectDescription: "Unlock First Upgrade and Milestones",
    done() { return player.r.best.gte(1) },

    },
    1: {
    requirementDescription: "15 Rebirth Points",
    effectDescription: "Will increase rebirth points by a multiplier",
    done() { return player.r.best.gte(15) },
    unlocked() { return hasMilestone("r", 0) },

    },

    2: {
    requirementDescription: "1000 Rebirth Points",
    effectDescription: "Unlock a Challenge",
    done() { return player.r.best.gte(1000) },
    unlocked() { return false},
    },


},
/*challenges: {
    11: {
    name: "Restart",
    challengeDescription: "Get 500000 Rebirth Points",
    canComplete: function() {return player.points.gte(5000000)},
    goalDescription: "Once Completed, will multiply everything by 3",
    unlocked() {return hasMilestone("r", 2) },
    },
    
},*/
infoboxes: {
    Added: {
       title: "Multiplier Upgrades",
       body() {return "In the Upgrades Tab, On the Bottom, There are Upgrades for Mulitpliers" }, 
       style: {"border-color": "#ff0000ff"},
    }
},
tabFormat: {
    "Main": {
    content:[
        function() {if (player.tab == "r") return "main-display"},
        "prestige-button",
        function() {if (player.tab == "r") return "resource-display"},
        "blank",
        ["microtabs", "AllUpgrades"],
        "buyables",
        ],
},
    "Milestones": {
    content:[
        function() {if (player.tab == "r") return "main-display"},
        "prestige-button",
        function() {if (player.tab == "r") return "resource-display"},
        "blank",
        "milestones",
        ],
    },
    "Challenges (WIP)": {
    content:[
        function() {if (player.tab == "r") return "main-display"},
        "prestige-button",
        function() {if (player.tab == "r") return "resource-display"},
        "blank",
        ["display-text",
            function() {return "(There Are Challenges You Can Complete When You Have A Milestone)"},
        ],
        "challenges",
        ],
    },
},
microtabs: {
    AllUpgrades: {
        "Upgrades": {
            content: [
                "blank",
                "upgrades",
                function () {if (player.tab == "r" && player.subtabs.r.mainTabs == "Main" && player.subtabs.r.AllUpgrades == "Upgrades") return ["upgrades",[11,12,13,14,21,22,23,24,31,32]]},
                "blank"
            ],
            
        },
    },
},
})
addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
        best: new Decimal(0),
			  total: new Decimal(0),
			  pseudoUpgs: [],
    }},
    color: "#fbff08",
    requires: new Decimal(250000), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
      branches: ["r"],
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasMilestone("p", 31)) mult = mult.times(1.5)
        if (hasUpgrade("r", 31)) mult = mult.times(2)
        if (hasUpgrade("r", 32)) mult = mult.times(1.5)
         
        return mult
    },
    canBuyMax() { return hasMilestone("p", 2) },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.r.unlocked},
      
  upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Pure Double",
            description: "Purely Double Rebirth and Points Gain",
            cost: new Decimal(1),
            unlocked() { return hasMilestone("p", 0) },

        },
        12: {
            title: "Little Rebirth Boost",
            description: "Rebirth Point Gain is Boosted A Little Bit",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("p", 11) },
        },
        13: {
            title: "Gain",
            description: "Base Rebirth Gain is Increased",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade("p", 12) },
        },
        21: {
            title: "Points and Rebirth",
            description: "Both Rebirth Points and Normal Point Gain are Increased Based On Prestige Points",
            cost: new Decimal(14),
            effect() {
              let eff = player.p.points.plus(1).pow(0.4);
              return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return hasUpgrade("p", 21)}
        },
        22: {
            title: "Unlock Rebirth Multipler Upgrades",
            description: "Multi. Upgrades for Point Multiply",
            unlocked() { return false},
        },


    },

    milestones: {
        0: {
        requirementDescription: "1 Prestige Point",
        effectDescription: "Unlock Prestige Upgrades and Milestones",
        done() { return player.p.best.gte(1) },


        },
        1: { 
        requirementDescription: "2 Prestige Points",
        effectDescription: "Unlock a New Rebirth Upgrade Prepared",
        done() { return player.p.best.gte(2) },
        unlocked() { return hasMilestone("p", 0) },

        },

        2:  {       
        requirementDescription: "10 Prestige Points",
        effectDescription: "Can Buy Max",
        done() { return player.p.best.gte(10) },
        unlocked() { return hasMilestone("p", 0) },
    },
},
})
addLayer("m", {
    name: "money", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
			  total: new Decimal(0),
			  pseudoUpgs: [],
			  first: 0,
			  auto: false,
    }},
    color: "#0ce005", 
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "money", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["p"],
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        
        return mult
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for money", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.unlocked},
      resetsNothing() {return true},
      passiveGeneration() { return true?1:0 },
      upgrades: {
        
      11: {
        title: "Points",
            description: "Points Boost Itself For Every Zero With It Slowly Increasing",
            cost: new Decimal(100000),
            unlocked() { return true },
            effect() {
              let eff = player.points.plus(1).log10().plus(1);
              return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
      },
      12: {
        title: "",
            description: "Points Booster",
            cost: new Decimal(275000),
            unlocked() { return hasUpgrade("m", 101) },
      },
      101: {
        title: "Points Buyable 1",
            description: "Points Booster",
            cost: new Decimal(250000),
            unlocked() { return true },
      },
      102: {
        title: "Points Buyable 1",
            description: "Points Booster",
            cost: new Decimal(275000),
            unlocked() { return hasUpgrade("m", 101) },
      },
      103: {
        title: "Points Buyable 1",
            description: "Points Booster",
            cost: new Decimal(300000),
            unlocked() { return hasUpgrade("m", 102) },
      },
    },
  
  
})
addLayer("ur", {
    name: "ultra rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
        best: new Decimal(0),
			  total: new Decimal(0),
			  pseudoUpgs: [],
			  first: 0,
			  auto: false,
    }},
    color: "#775cff", 
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "ultra rebirths", // Name of prestige currency
    baseResource: "rebirth points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
      branches: ["m"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        
        return mult
    },
    canBuyMax() { return hasMilestone("ur", 2) },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "shift+u", description: "U: Reset for ultra rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.r.unlocked&&player.p.unlocked},
      effect() {
        return player.ur.points.plus(1).pow(0.25)
      },
      effectDescription(){
        return "multiplying point gain by " + format(tmp.ur.effect)
      },
})
addLayer("up", {
    name: "ultra prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
            power: new Decimal(0),
            best: new Decimal(0),
			  total: new Decimal(0),
			  pseudoUpgs: [],
			  first: 0,
			  auto: false,
    }},
    color: "#f58f0bff", 
    requires: new Decimal(150), // Can be a function that takes requirement increases into account
    resource: "ultra prestige", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["m"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        
        return mult
    },
    canBuyMax() { return hasMilestone("up", 2) },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "shift+p", description: "P: Reset for ultra prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.unlocked},
  
})
addLayer("pp", {
    name: "point power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
			unlocked: true,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			power: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
			auto: false,
		}},
    color: "#ffffffff", 
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "point power", // Name of prestige currency
    baseResource: "point power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        branches: ["ur", "up"],
    exponent: 0.01, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "shift+p", description: "P: Reset for ultra prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
      resetsNothing() {return true},
      passiveGeneration() { return true?1:0 },
        effect() {
            let eff = player.pp.points.pow(0.5);
      
              return eff;
        },
        effectDescription() {
			return "which are boosting points by +x"+format(tmp.pp.effect)
        }
  
})