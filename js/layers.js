addLayer("l", {
    name: "oxytocin", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},


    color: "#FB006E",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "love", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
        effect() { let eff = new Decimal(1)
                    if(hasUpgrade("l", 11)) eff = eff.mul(2)
                    return eff
                },

    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
            if (hasUpgrade("l",11)) mult=mult.times(2)
        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for love", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true },

         upgrades: {
             rows: 2,
             cols: 3,
             11: {
                      title: "Bonding",
                     description: "Multiplies oxytocin gain by 2, and reduce Love scaling.",
                      cost: new Decimal(1)
            },
            12: {

                    title: "Formation",
                    description: "Multiplies oxytocin gain by 2 again.",
                    cost: new Decimal(1.5),
                    unlocked() { return hasUpgrade("l", 11) },
            },
            13: {   title: "Merge",
                    description: "Multiplies oxytocin gain by 5.",
                    cost: new Decimal(5),
                    unlocked() { return hasUpgrade("l", 12) },
            },
            21: {
                    title: "Romeo's Love",
                    description: "Multiplies oxytocin gain by 10.",
                    cost: 3,
                    CurrencyDisplayName: "Romeos",
                    canAfford() {
                        return player.r.points.gte(this.cost);
                    },
                    pay() {
                        player.r.points = player.r.points.sub(this.cost) }
             },
            22: {
                    fullDisplay() {
                        `<h2>noob</h2><br>
                        </br><p>free up graerte</p>`
                    },
                    cost: 3,
                    CurrencyDisplayName: "Juliets",
                    canAfford() {
                        return player.j.points.gte(this.cost);
                    },
                    pay() {
                        player.j.points = player.j.points.sub(this.cost)
                    },
            },
    },
})

addLayer("r", {
    name: "romeo", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff0000",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Romeos", // Name of prestige currency
    baseResource: "love", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for Romeo", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if(hasUpgrade("l", 11) || player.r.points>=1 || player.j.points>=1){ return true }
    },
    
    upgrades: {
        rows: 1,
        cols: 3,
        11: {
                title: "Rosaline",
                description: "Discover a beautiful girl by the name of Rosaline. x3 oxytocin gain.",
                cost: new Decimal(1)
        },
        12: {
                title: "Mercutio",
                description: "Mercutio is Romeo's close friend. 2x oxytocin gain.",
                cost: new Decimal(2)
        },
    },

milestones: {
    0: {
        requirementDescription: "20 Love",
        effectDescription: "Saves upgrades on a Romeo reset",
        done() { return player.l.points.gte(20) },
    },
    1: {
        requirementDescription: "100 Love",
        effectDescription: "Gives you 100% of pending love a second",
        done() { return player.l.points.gte(100) },
    },
},
branches: ["l"],
    
})

addLayer("j", {
    name: "julliet", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "J", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0099ff",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Julliets", // Name of prestige currency
    baseResource: "love", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "j", description: "J: Reset for Julliet", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if(hasUpgrade("l", 11) || player.j.points>=1 || player.r.points>=1){ return true }
    },
        upgrades: {
            rows: 1,
            cols: 3,
            11: {
                    title: "Paris",
                    description: "Discover a man named Paris. x3 oxytocin gain.",
                    cost: new Decimal(1)
            },
        },

    branches: ["l"],
    
})

addLayer("p", {
    name: "party", 
    symbol: "P", 
    position: 0, 
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},

    color: "#ffff00",
    requires: new Decimal(1000000), 
    resource: "Party", 
    baseResource: "oxytocin", 
    baseAmount() {return player.points}, 
    type: "normal", 
    exponent: 0.5, 
    gainMult() { 
        mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },

    row: 2, 
    hotkeys: [
        {key: "p", description: "P: Reset to Party", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown(){
        if((player.j.points>=1),(player.r.points>=1)){return true}
    },
    upgrades: {
        rows: 1,
        cols: 3,
        11: {
                title: "Exclusive",
                description: "A party which despise the Montagues. x10 oxytocin gain.",
                cost: new Decimal(5)
        },
     },
     milestones: {
         0: {
             requirementDescription: "5 parties",
             effectDescription: "Keeps all Romeo and Juliet upgrades on reset",
             done() { return player.p.points>=5 },
         },
     },
    branches: ["r","j"],
    
})