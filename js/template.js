
//LAYER
addLayer("T", {
    name: "Test", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    passiveGeneration() {
        return 0
    },
    autoUpgrade() {
        return false
    },
    layerShown(){
        let visible = true
        if (player.L.inchallenge) visible = false
        return visible
     },   
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "test points", // Name of prestige currency
    baseResource: "test points", // Name of resource prestige is based on
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
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
})

//UPGRADE
upgrades: {
    11: {
        title: "Upgrade",
        description: "nothing times nothing",
        cost: new Decimal(1),
        effect() {
            return player.points
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    },
    if (hasUpgrade('T', 11)) gain = gain.times(upgradeEffect("T",11))

    12: {
        title: "Effect",
        description: "nothing times nothing",
        cost: new Decimal(1),
    },
    if (hasUpgrade('T', 12)) gain = gain.times(2)
},

upgrades: {
    
}

//MILESTONE
milestones: {
    1: {
        requirementDescription: "1 Super point",
        effectDescription: "1.5x points",
        done() { return player.S.points.gte(1) }
    },
},

//CLICKABLE
clickables: {
    11: {
        title: "Click",
        canClick() {return true},
        onClick() {return "something"}
    },
},


//BUYABLES
buyables: {
    12: {
        title: "<br>Dressy point thing<br>",
        cost(x) { return new Decimal(30).pow(getBuyableAmount(this.layer, this.id)) },
        display() { return "Boosts Dressy points<br>" + "Costs: " + format(tmp[this.layer].buyables[this.id].cost) + " money <br>Currently: " + format(buyableEffect(this.layer,this.id))+"x" },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect() {return new Decimal(1.75).pow(getBuyableAmount(this.layer, this.id).div(new Decimal(Number(inChallenge("L",11))).times(5).add(1)))},
    },
}

//TABS
tabFormat: {
    "Layerverse": {
        content: [
            "main-display",
            ["display-text",
                function(){
                    return "You have <h2><span style='color:rgb(0, 0, 255); text-shadow: 0px 0px 10px rgb(132, 0, 255); font-family: Lucida Console, Courier New, monospace'>"+ 0 +"</span></h2> Completeted layers"
                }
            ],
                "blank",
                function() {
                    if (player.L.inchallenge == false) {
                        return "prestige-button"
                    }
                    else {
                        return "blank"
                    }
                },
                "blank",
                "blank",
                "upgrades",
                "buyables"
            ],
        },
        "Challenges": {
            content: [
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgb(0, 0, 255); text-shadow: 0px 0px 10px rgb(132, 0, 255); font-family: Lucida Console, Courier New, monospace'>"+ 0 +"</span></h2> Completeted layers"
                    }
                ],  
                    ["display-text",
                    function(){
                        return "<b>NOTE: THESE CHALLENGES WONT SAVE IF YOU EXIT THEM AND NORMAL PROGRESSION WONT SAVE WHEN ENTERING THEM</b>"
                    }
                ],  
                    "blank",
                    "blank",
                    "blank",
                    "challenges",
                ],
            },
        },

bars: {
    hi: {
        direction: RIGHT,
        width: 600,
        height: 60,
        fillStyle: { 'background-color': "green" },
        borderStyle() { return { "border-color": "white" } },
        progress() {
            return 1
        },
        display() {
            return ""
        }
        },
    }
