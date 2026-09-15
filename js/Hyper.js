addLayer("H", {
    name: "Hyper", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        effboost: new Decimal(1),
        layerview: 0,
    }},
    layerShown(){
        let visible = false
        if (hasChallenge('S', 11) || player.H.unlocked) visible = true
        if (player.L.inchallenge) visible = false
        if (player.layerview != player.H.layerview) visible = false
       return visible
     },   
    effect() {
        Heff = player[this.layer].points.add(1).log(1.5).times(player.H.effboost).add(1)
        return Heff
        },
        effectDescription() {
            Heff = this.effect();
            return "that are boosting Dressy point gain AND super gain by "+format(Heff.add(1))+"x."
        },
    passiveGeneration() {
        if (hasUpgrade("L",32)) return 0.1
        if (hasUpgrade('L',23)) return 0.05
        return 0
    },
    autoUpgrade() {
        if (hasUpgrade("L",32)) {return true}
        else {return false}
    },
    branches: ["H", "M"], 
    color: "#38ffa4",
    requires: new Decimal(25), // Can be a function that takes requirement increases into account
    resource: "Hyper", // Name of prestige currency
    baseResource: "Super", // Name of resource prestige is based on
    baseAmount() {return player.S.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('D', 35)) mult = mult.times(1.5)
        if (getBuyableAmount("M",14).gte(0)) mult = mult.times(buyableEffect("M",14))	
        //if (hasUpgrade('Ma', 14)) mult = mult.times(Math.E)
        if (hasUpgrade('L', 21)) mult = mult.times(upgradeEffect('L', 21))
        if (hasUpgrade('L', 15)) mult = mult.times(1.5)
        if (hasUpgrade('L', 22)) mult = mult.times(player.points.add(1).log(100).add(1))
        if (hasChallenge("L",15)) mult = mult.times(1.25)
        if (player.C.currentcharm == "hyper") mult = mult.times(2.5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ], 
    milestones: {
        1: {
            requirementDescription: "1 Hyper point",
            effectDescription: "Gain 15% of dressy point reset, 1% of super reset, autobuy dressy point upgrades and ^1.1 points",
            done() { return player.H.points.gte(1) }
        },
        2: {
            requirementDescription: "3 Hyper points",
            effectDescription: "Gain 5% of super reset instead of the 1%",
            done() { return player.H.points.gte(3) }
        },
        3: {
            requirementDescription: "10 Hyper points",
            effectDescription: "Unlock a challenge",
            done() { return player.H.points.gte(10) },
        },
        4: {
            requirementDescription: "25 Hyper points",
            effectDescription: "Unlock 3 dressy upgrades",
            done() { return player.H.points.gte(25) && hasChallenge("H",11)  },
            unlocked() {return hasChallenge("H",11)},
        },
    }, 
    challenges: {
        11: {
            name: "Automation is what you want?",
            challengeDescription: "0.25x dressy points AND 0.5x super points",
            rewardDescription: "Autobuy super upgrades and more milestones",
            goalDescription: "1000 super",
            canComplete: function() {return player.S.points.gte(1000)},
            unlocked() {return hasMilestone("H",3)},
        },
    },
    upgrades: {
        11: {
            title: "Never expected this to be here",
            description: "The hyper effect is 2x better",
            onPurchase() {return player.H.effboost = player.H.effboost.times(2)},
            cost: new Decimal(100),
            unlocked() {return getBuyableAmount("M",15).gte(3)},
        },
    },
})