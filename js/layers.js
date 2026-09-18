addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    canReset() {false},
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Cat Gems", // Name of prestige currency
    baseResource: "Gooby Cats", // Name of resource prestige is based on
    baseAmount() {if(hasUpgrade("p", 11)) return player[this.layer].buyables[11].add(upgradeEffect("p", 11))
                    else return player[this.layer].buyables[11]
        //return player.points
    }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent  
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!player["f"].deactivated) {
            if (hasUpgrade("f", 11)) mult = mult.times(upgradeEffect("f", 11))
            if (hasUpgrade("f", 12)) mult = mult.times(upgradeEffect("f", 12))
            if (hasUpgrade("f", 21)) mult = mult.times(upgradeEffect("f", 21))
            if (hasUpgrade("f", 22)) mult = mult.times(upgradeEffect("f", 22))
        }
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        
        //if (tmp["p"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["p"].buyables["13"].effect.first).div(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    tabFormat: {
        "Milestones": {
            content: [
                "main-display",
                ["display-text",
                    function () {
                        if (hasUpgrade("p", 11))
                            if (player[this.layer].buyables[11].add(upgradeEffect("p", 11)) != 1) return 'I have ' + format(player[this.layer].buyables[11].add(upgradeEffect("p", 11))) + ' Gooby Cats'
                            else return 'I have ' + format(player[this.layer].buyables[11].add(upgradeEffect("p", 11))) + ' Gooby Cat'
                        else
                            if (player[this.layer].buyables[11] != 1) return 'I have ' + format(player[this.layer].buyables[11]) + ' Gooby Cats'
                            else return 'I have ' + format(player[this.layer].buyables[11]) + ' Gooby Cat'
                    },

                    { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                ["prestige-button"],
                "blank",
                "milestones",
                "blank"]

        },
        "Upgrades": {
            content: [
                "main-display",
               
                "blank",
                
                "blank",
                "upgrades"],
                },
        "Buyables": {
            content: [
                "main-display",
                "blank",
                ["display-text",
                function() {
                    mult = new Decimal(1)
                    if (tmp["p"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["p"].buyables["13"].effect.first).div(100)
                    if (tmp["p"].buyables["12"].effect.first > 1) mult = mult.times(Math.sqrt(tmp["p"].buyables["12"].effect.first))
                    if (!player["f"].deactivated) {
                        if (hasUpgrade("f", 11)) mult = mult.times(upgradeEffect("f", 11))
                        if (hasUpgrade("f", 12)) mult = mult.times(upgradeEffect("f", 12))
                        if (hasUpgrade("f", 21)) mult = mult.times(upgradeEffect("f", 21))
                        if (hasUpgrade("f", 22)) mult = mult.times(upgradeEffect("f", 22))
                    }
                    if(hasMilestone("p",0)) return 'Generating ' + format(player[this.layer].buyables[11].add(upgradeEffect("p", 11)) * mult) + ' Gems per second'
                    else return 'Generating 0 Gems per second'
                    },
         
//function () { return 'meow' },
         { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                ["display-text",
                    function() { 
                        return 'Goobys are generating ' + format(getPointGen()) + ' Dollars worth of Goo per second'
             },
             { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                "buyables",
        
        ],  
        },
        
        
    },
    upgrades: {
        11: {
            fullDisplay() { return "<h3>Original Gooby Cat</h3><br>Get Your First Cat<br><br>Cost: 10 Points" }, 
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = 1
                return ret;
                //let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                //if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
                //return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            canAfford(){ return player.points.gte(10) },
            currencyDisplayName: "$",

            
            pay(){ player.points = player.points.sub(10) }
        },
        12: {
            description: "Upgraded Gooby Cat Limit",
            cost: new Decimal(1),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = 2
                
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("p", 11)
            }
        },
        13: {
            description: "Unlock A Third Repeatable Upgrade",
            cost: new Decimal(10),
            //effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
            //    let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
            //    if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
            //    return ret;
            //},
            //effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("p", 12)
            }
        },
        14: {
            description: "Unlock the Farm Plot",
            cost: new Decimal(50),
            effect() { return (42)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("p", 13)
            }
        },
        21: {
            description: "Unlock the Breed Centre",
            cost: new Decimal(300),
            effect() { return (42)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("p", 14)
            }
        },
        
    },
    buyables: {
        11: {
            title: "Gooby Cat", // Optional, displayed at the top in a larger font
        
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(20)) x = x.pow(2).div(25)
                    let cost = Decimal.add(10).times(Decimal.pow(1.1, x))
                return cost.floor()
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if(hasUpgrade("p", 11))
                    if (x.gte(0)) eff.first = x.add(upgradeEffect("p", 11))
                    else eff.first = x.times(-1).pow(0.8).times(-1).add(upgradeEffect("p", 11))
                else
                    if (x.gte(0)) eff.first = x
                    else eff.first = x.times(-1).pow(0.8).times(-1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " $\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                You Currently have " + format(data.effect.first) + " Gooby Cats"
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player.points = player.points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: {'height':'222px'},
        },
        12: {
            title: "Faster Goobys", // Optional, displayed at the top in a larger font
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25)) x = x.pow(2).div(25)
                let cost = Decimal.add(10).times(Decimal.pow(1.13, x))
                return cost.floor()
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (x.gte(0)) eff.first = x.pow(1.1).add(1)
                else eff.first = x.times(-1).pow(1.1).times(-1).add(1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Gems\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Multiplies Goo Value by " + format(data.effect.first) +"\n\
                And Gem Productiuon by " + format(Math.sqrt(tmp["p"].buyables["12"].effect.first))
            },
            unlocked() { return player[this.layer].unlocked }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: {'height':'222px'},
        },
        13: {
            title: "Gems are to Rare!!", // Optional, displayed at the top in a larger font
        
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25)) x = x.pow(2).div(25)
                let cost = Decimal.add(30).times(Decimal.pow(1.15, x))
        
                return cost.floor()
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (x.gte(0)) eff.first = x.times(2)
                else eff.first = x.add(1).times(-1).times(2).times(-1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Gems\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Increases Gem Drop Chance by " + format(data.effect.first) + "%"
            },
            unlocked() { return hasUpgrade("p", 13)}, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: {'height':'222px'},
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Gooby Cat",
            effectDescription: "Begin to Generate Gems",
            done() { return tmp["p"].buyables["11"].effect.first >= 1 }
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    passiveGeneration() {   
        mult = new Decimal(1)
        if (hasMilestone("p", 0)) {
          if (tmp["p"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["p"].buyables["13"].effect.first).div(100)
          if (tmp["p"].buyables["12"].effect.first > 1) mult = mult.times(Math.sqrt(tmp["p"].buyables["12"].effect.first))
            return mult
        }
        else return 0
    },
        



    //automation() {
	//	if (hasMilestone("g", 2)) {
	//		buyBuyable("p", 11);
	//		buyBuyable("p", 12);
    //        buyBuyable("p", 13);
	//	}
	//},
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
   

   
    layerShown(){return true}
})
addLayer("f", {
    name: "Farm", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#966919",
    branches() {
        return ["p"]
    },
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "Fruits", // Name of prestige currency
    baseResource: "Gems", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade(this.layer, 14)) mult = mult.times(upgradeEffect(this.layer, 14))

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "Ten Total Fruits",
           
            done() {return player[this.layer].best.gte(10)}, // Used to determine when to give the milestone
            effectDescription: "keep presitge upgrades on reset",
        },
        1: {
            requirementDescription: "100 Fruits",
            effectDescription: "Gain 10% of your Posible Fruit Per Second",
            unlocked() { return hasMilestone("f", 0) },
            done(){
                if (player["f"].points >= 100) {return true}else{return false}
            },
        },
        2: {
            requirementDescription: "10000 fruits",
            unlocked() { return hasMilestone("f", 1) },
            done() {return player[this.layer].best.gte(10000)}, // Used to determine when to give the milestone
            effectDescription: "auto buy the P buyables",
        },
    },
    upgrades: {
        11: {
            description: "Points and pp go uppp!!",
            cost: new Decimal(1),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        12: {
            description: "points get even larger",
            cost: new Decimal(10),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        13: {
            description: "magicly increased prestige points",
            cost: new Decimal(6900),
            effect() { return (42)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        14: {
            description: "a second pill multiplies points, pprestige points, and gamer bucks earnings!! noice!!",
            cost: new Decimal(42000),
            effect() { return (6.9)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    //hotkeys: [
    //    {key: "g", description: "G: Reset for gamer! points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    //],

    layerShown() {
        if(player.f.deactivated) return false
        else if (hasUpgrade("p", 14)) return true
        else return false
    },
    passiveGeneration() {        
        if (hasMilestone("f", 1)) {
            return 1
        }
        else return 0
    },
    
    
})
addLayer("r", {
    name: "Research Center", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked:false,
		points: new Decimal(0),
    }},
    layerShown() {
        if(player.p.points>=1000) return true ; else{return false}

     },
      resetsNothing: true,
    color: "#FFC0CB",
    requires: new Decimal(1e4), // Can be a function that takes requirement increases into account
    resource: "Theorys", // Name of prestige currency
    baseResource: "gems", // Name of resource prestige is based on
    baseAmount() { return player.p.points }, // Get the current amount of baseResource
    base: 10000,
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "The First Theory",
            done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
            effectDescription: "Unlock Teritory",
        },
    },
    upgrades: {
        14: {
            description: "Point generation go brrrr",
            cost: new Decimal(1000),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                if (ret.gte("1e10")) ret = ret.sqrt().times("10")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        12: {
            description: "points go even zoomer",
            cost: new Decimal(10),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.075:0.5)) 
                if (ret.gte("1e10")) ret = ret.sqrt().times("10")
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        13: {
            description: "Blank Upgrade",
            cost: new Decimal(69),
            effect() { return (42)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        11: {
            description: "a second blank upgrade",
            cost: new Decimal(1),
            effect() { return (6.9)
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    
})
addLayer("t", {
    name: "Teritory", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    layerShown() {
        return hasMilestone("r", 0)

    },
    resetsNothing: true,
    color: "#FFC0CB",
    requires: new Decimal(5e4), // Can be a function that takes requirement increases into account
    resource: "Theorys", // Name of prestige currency
    baseResource: "gems", // Name of resource prestige is based on
    baseAmount() { return player.p.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "The First Theory",
            done() { return player[this.layer].best.gte(1) }, // Used to determine when to give the milestone
            effectDescription: "Unlock Teritory",
        },
    },
    challenges: {
        11: {
            name: "North",
            challengeDescription: "Travel North Towards The Frozen Lands",
            rewardDescription: "Unlock The Frozen Gooby Type",
            onEnter() {
                player.f.deactivated = true
                player.points = decimalZero
                player.p.points = decimalZero
            },
            onExit() {
                player.f.deactivated = false
            },
            goalDescription: "1000000$",
            canComplete: function () { return player.points.gte(1000000) },
        },
        
        21: {
            name: "West",
            challengeDescription: "Travel West Towards The Lush Jungle",
            rewardDescription: "Unlock The Exploring Gooby Type",
            canComplete: function () { return player.points.gte(10000000000000) },
        },
        22: {
            name: "East",
            challengeDescription: "Travel East Towards The High Mountains",
            rewardDescription: "Unlock The Flying Gooby Type",
            canComplete: function () { return player.points.gte(10000000000000) },
        },
        31: {
            name: "South",
            challengeDescription: "Travel South towards The Sea",
            rewardDescription: "Unlock The Aquatic Gooby Type",
            canComplete: function () { return player.points.gte(10000000000000) },
        },
    },
    //upgrades: {
    //    14: {
    //        description: "Point generation go brrrr",
    //        cost: new Decimal(1000),
    //        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
    //            let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24) ? 1.1 : (player[this.layer].upgrades.includes(14) ? 0.75 : 0.5))
    //            if (ret.gte("1e10")) ret = ret.sqrt().times("10")
    //            return ret;
    //        },
    //        effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
    //    },
    //    12: {
    //        description: "points go even zoomer",
    //        cost: new Decimal(10),
    //        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
    //            let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24) ? 1.1 : (player[this.layer].upgrades.includes(14) ? 0.075 : 0.5))
    //            if (ret.gte("1e10")) ret = ret.sqrt().times("10")
    //            return ret;
    //        },
    //        effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
    //    },
    //    13: {
    //        description: "boner pill",
    //        cost: new Decimal(69),
    //        effect() {
    //            return (42)
    //        },
    //        effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
    //    },
    //    11: {
    //        description: "a second pill",
    //        cost: new Decimal(1),
    //        effect() {
    //            return (6.9)
    //        },
    //        effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
    //    },
    //},
    row: "1", // Row the layer is in on the tree (0 is the first row)

})

//
//deactivated:
//if (inChallenge("t", 11)) return true
//else if (inChallenge("t", 21)) return true
//else if (inChallenge("t", 22)) return true
//else if (inChallenge("t", 31)) return true
//else false
//
//    },

addLayer("Fr", {
    name: "Frost", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#4BDC13",
    canReset() { false },
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Ice Gems", // Name of prestige currency
    baseResource: "Frozen Goobies", // Name of resource prestige is based on
    baseAmount() {
        if (hasUpgrade("p", 11)) return player[this.layer].buyables[11].add(upgradeEffect("p", 11))
        else return player[this.layer].buyables[11]
        //return player.points
    }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent  
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!player["f"].deactivated) {
            if (hasUpgrade("f", 11)) mult = mult.times(upgradeEffect("f", 11))
            if (hasUpgrade("f", 12)) mult = mult.times(upgradeEffect("f", 12))
            if (hasUpgrade("f", 21)) mult = mult.times(upgradeEffect("f", 21))
            if (hasUpgrade("f", 22)) mult = mult.times(upgradeEffect("f", 22))
        }
        return mult
    },
    directMult() {
        mult = new Decimal(1)

        //if (tmp["p"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["p"].buyables["13"].effect.first).div(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    tabFormat: {
        "Milestones": {
            content: [
                "main-display",
                ["display-text",
                    function () {
                        if (hasUpgrade("Fr", 11))
                            if (player[this.layer].buyables[11].add(upgradeEffect("Fr", 11)) != 1) return 'I have ' + format(player[this.layer].buyables[11].add(upgradeEffect("Fr", 11))) + ' Gooby Cats'
                            else return 'I have ' + format(player[this.layer].buyables[11].add(upgradeEffect("p", 11))) + ' Gooby Cat'
                        else
                            if (player[this.layer].buyables[11] != 1) return 'I have ' + format(player[this.layer].buyables[11]) + ' Gooby Cats'
                            else return 'I have ' + format(player[this.layer].buyables[11]) + ' Gooby Cat'
                    },

                    { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                ["prestige-button"],
                "blank",
                "milestones",
                "blank"]

        },
        "Upgrades": {
            content: [
                "main-display",

                "blank",

                "blank",
                "upgrades"],
        },
        "Buyables": {
            content: [
                "main-display",
                "blank",
                ["display-text",
                    function () {
                        mult = new Decimal(1)
                        if (tmp["Fr"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["Fr"].buyables["13"].effect.first).div(100)
                        if (tmp["Fr"].buyables["12"].effect.first > 1) mult = mult.times(Math.sqrt(tmp["Fr"].buyables["12"].effect.first))
                        if (!player["f"].deactivated) {
                            if (hasUpgrade("f", 11)) mult = mult.times(upgradeEffect("f", 11))
                            if (hasUpgrade("f", 12)) mult = mult.times(upgradeEffect("f", 12))
                            if (hasUpgrade("f", 21)) mult = mult.times(upgradeEffect("f", 21))
                            if (hasUpgrade("f", 22)) mult = mult.times(upgradeEffect("f", 22))
                        }
                        if (hasMilestone("Fr", 0)) return 'Generating ' + format(player[this.layer].buyables[11].add(upgradeEffect("Fr", 11)) * mult) + ' Gems per second'
                        else return 'Generating 0 Gems per second'
                    },

                    //function () { return 'meow' },
                    { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                ["display-text",
                    function () {
                        return 'Goobys are generating ' + format(getPointGen()) + ' Dollars worth of Goo per second'
                    },
                    { "color": "green", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                "buyables",

            ],
        },


    },
    upgrades: {
        11: {
            fullDisplay() { return "<h3>Original Gooby Cat</h3><br>Get Your First Cat<br><br>Cost: 10 Points" },
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = 1
                return ret;
                //let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                //if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
                //return ret;
            },
            effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
            canAfford() { return player.points.gte(10) },
            currencyDisplayName: "$",


            pay() { player.points = player.points.sub(10) }
        },
        12: {
            description: "Upgraded Gooby Cat Limit",
            cost: new Decimal(1),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = 2

                return ret;
            },
            effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("Fr", 11)
            }
        },
        13: {
            description: "Unlock A Third Repeatable Upgrade",
            cost: new Decimal(10),
            //effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
            //    let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
            //    if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
            //    return ret;
            //},
            //effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("Fr", 12)
            }
        },
        14: {
            description: "Unlock the Farm Plot",
            cost: new Decimal(50),
            effect() {
                return (42)
            },
            effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("Fr", 13)
            }
        },
        21: {
            description: "Unlock the Breed Centre",
            cost: new Decimal(300),
            effect() {
                return (42)
            },
            effectDisplay() { return format(this.effect()) + "x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("Fr", 14)
            }
        },

    },
    buyables: {
        11: {
            title: "Gooby Cat", // Optional, displayed at the top in a larger font

            cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(20)) x = x.pow(2).div(25)
                let cost = Decimal.add(10).times(Decimal.pow(1.1, x))
                return cost.floor()
            },
            effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (hasUpgrade("p", 11))
                    if (x.gte(0)) eff.first = x.add(upgradeEffect("Fr", 11))
                    else eff.first = x.times(-1).pow(0.8).times(-1).add(upgradeEffect("Fr", 11))
                else
                    if (x.gte(0)) eff.first = x
                    else eff.first = x.times(-1).pow(0.8).times(-1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " $\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                You Currently have " + format(data.effect.first) + " Gooby Cats"
            },
            unlocked() { return player[this.layer].unlocked },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.points = player.points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: { 'height': '222px' },
        },
        12: {
            title: "Faster Goobys", // Optional, displayed at the top in a larger font
            cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25)) x = x.pow(2).div(25)
                let cost = Decimal.add(10).times(Decimal.pow(1.13, x))
                return cost.floor()
            },
            effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (x.gte(0)) eff.first = x.pow(1.1).add(1)
                else eff.first = x.times(-1).pow(1.1).times(-1).add(1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Gems\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Multiplies Goo Value by " + format(data.effect.first) + "\n\
                And Gem Productiuon by " + format(Math.sqrt(tmp["p"].buyables["12"].effect.first))
            },
            unlocked() { return player[this.layer].unlocked },
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: { 'height': '222px' },
        },
        13: {
            title: "Gems are to Rare!!", // Optional, displayed at the top in a larger font

            cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                if (x.gte(25)) x = x.pow(2).div(25)
                let cost = Decimal.add(30).times(Decimal.pow(1.15, x))

                return cost.floor()
            },
            effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                if (x.gte(0)) eff.first = x.times(2)
                else eff.first = x.add(1).times(-1).times(2).times(-1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Gems\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Increases Gem Drop Chance by " + format(data.effect.first) + "%"
            },
            unlocked() { return hasUpgrade("Fr", 13) },
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            style: { 'height': '222px' },
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Gooby Cat",
            effectDescription: "Begin to Generate Gems",
            done() { return tmp["Fr"].buyables["11"].effect.first >= 1 }
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    passiveGeneration() {
        mult = new Decimal(1)
        if (hasMilestone("Fr", 0)) {
            if (tmp["Fr"].buyables["13"].effect.first > 1) mult = mult.times(100).add(tmp["Fr"].buyables["13"].effect.first).div(100)
            if (tmp["Fr"].buyables["12"].effect.first > 1) mult = mult.times(Math.sqrt(tmp["Fr"].buyables["12"].effect.first))
            return mult
        }
        else return 0
    },




    //automation() {
    //	if (hasMilestone("g", 2)) {
    //		buyBuyable("p", 11);
    //		buyBuyable("p", 12);
    //        buyBuyable("p", 13);
    //	}
    //},
    //hotkeys: [
    //    { key: "h/", description: "P: Reset for prestige points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    //],



    layerShown() { return hasChallenge("t",11) }
})
