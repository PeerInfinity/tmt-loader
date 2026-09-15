addLayer("T", {
    name: "Time", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        mult: new Decimal(1),
        pow: new Decimal(1),
    }},
    passiveGeneration() {
        return new Decimal(1).times(player.T.mult).pow(player.T.pow).times(new Decimal(player.T.points).div(60).floor().add(1).log(1000).add(1)).times(new Decimal(player.T.points).div(60).div(60).floor().add(1).log(500).add(1)).times(new Decimal(player.T.points).div(60).div(60).div(24).floor().add(1).log(250).add(1)).times(new Decimal(player.T.points).div(60).div(60).div(24).div(7).floor().add(1).log(100).add(1)).times(new Decimal(player.T.points).div(60).div(60).div(24).div(7).div(4).floor().add(1).log(50).add(1)).times(new Decimal(player.T.points).div(60).div(60).div(24).div(7).div(4).div(12).floor().add(1).log(10).add(1))
    },
    layerShown(){
        let visible = false
        if (inChallenge("L",13)) visible = true
        if (!inChallenge("L",13)) visible = false
        return visible
     },
    color: "#FF0000",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "Seconds", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: {
            "Time": {
                content: [
                    "main-display",
                    ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).floor()+"</span></h2> Minutes"
                    }
                ],
                    "blank",
                    ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).div(60).floor()+"</span></h2> Hours"
                    }
                ],
                    "blank",
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).div(60).div(24).floor()+"</span></h2> Days"
                    }
                ],
                    "blank",
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).div(60).div(24).div(7).floor()+"</span></h2> Weeks"
                    }
                ],
                "blank",
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).div(60).div(24).div(7).div(4).floor()+"</span></h2> Months"
                    }
                ],
                "blank",
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(255, 0, 0); text-shadow: 0px 0px 10px rgb(255, 0, 76); font-family: Lucida Console, Courier New, monospace'>"+new Decimal(player.T.points).div(60).div(60).div(24).div(7).div(4).div(12).floor()+"</span></h2> Years"
                    }
                ],
                "blank",
                ["display-text",
                    function(){
                        return "Time format: "+formatTime(player.T.points)
                    }
                ],
                    "blank",
                    "blank",
                    "upgrades",
                ],
            },
    },
    upgrades: { 
        11: {
            title: "Waiting",
            description: "Double your seconds",
            cost: new Decimal(10),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(2)
            }
        },
        12: {
            title: "Waiting 2",
            description: "Double your seconds again",
            cost: new Decimal(20),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(2)
            }
        },
        13: {
            title: "Waiting 3",
            description: "Triple your seconds",
            cost: new Decimal(30),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(3)
            }
        },
        14: {
            title: "Waiting 4",
            description: "Triple your seconds again",
            cost: new Decimal(100),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(3)
            }
        },
        15: {
            title: "Waiting 5",
            description: "Quadruple your seconds",
            cost: new Decimal(300),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(4)
            }
        },
        16: {
            title: "Waiting 6",
            description: "Quadruple your seconds again",
            cost: new Decimal(10000),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(4)
            }
        },
        21: {
            title: "That is alot of time",
            description: "1.5x seconds",
            cost: new Decimal(100000),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(1.5)
            }
        },
        22: {
            title: "I dont know what to put here",
            description: "1.6x seconds",
            cost: new Decimal(250000),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(1.6)
            }
        },
        23: {
            title: "Tick tock",
            description: "1.7x seconds",
            cost: new Decimal(500000),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(1.7)
            }
        },
        24: {
            title: "Tock tick",
            description: "^1.1 seconds",
            cost: new Decimal(1e6),   
            onPurchase() {
                return player.T.pow = player.T.pow.times(1.1)
            }
        },
        25: {
            title: "Hello",
            description: "^1.3 seconds",
            cost: new Decimal(3e6),   
            onPurchase() {
                return player.T.pow = player.T.pow.times(1.3)
            }
        },
        26: {
            title: "Acceleration",
            description: "^1.5 seconds",
            cost: new Decimal(2e7),   
            onPurchase() {
                return player.T.pow = player.T.pow.times(1.5)
            }
        },
        31: {
            title: "Eternity",
            description: "1.5x seconds",
            cost: new Decimal(1e13),   
            onPurchase() {
                return player.T.mult = player.T.mult.times(100)
            }
        },
    }
})