addLayer("d", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    branches: ["b","c"],

    color: "#FF22AA",                       // The color for this layer, which affects many elements.
    resource: "D points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    hotkeys: [
        {key: "d", description: "d: select " + FOURTHPOINTS + " layer if unlocked", onPress(){if (player.d.unlocked === true) showTab('d')}},
        {key: "D", description: "D: Reset for " + FOURTHPOINTS + " if able", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: FOURTHPOINTS,
            body: FOURTHPOINTS + " themed tab for now!  Focused on Challenges.<br/><br/>"
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        ["blank", "50px"],
        "buyables",
        ["blank", "50px"],
        "upgrades",
        ["blank", "50px"],
        "challenges"
    ],
    baseResource: "<br />" + SECONDPOINTS + "/" + THIRDPOINTS,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points.gt(0) ? player.b.points.divide(player.c.points) : decimalZero },  // A function to return the current amount of baseResource.

    requires: new Decimal(2),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.
    canReset: function() {
        return player.c.points.gt(0) & player.b.points.divide(player.c.points).gte(1) ? true : false
    },
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.3,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return player[this.layer].unlocked | player.c.points.gte(60) ? true : "ghost"},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11: {
            title: "D boost",
            description: FOURTHPOINTS + " boost " + BASEPOINTS + " gain",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        
        31: {
            title: "Win the Game!",
            description: "You can do it",
            cost: new Decimal(1000),
        },
    },

    challenges: {
        11: {
                name: "Challenge 01",
                challengeDescription: "Restrictions: " + BASEPOINTS + " gain ^0.2",
                rewardDescription: "causes P layer to reset nothing, and unlocks more challenges that may do nothing!",
                canComplete: function() {return player.p.points.gte(1000)},
                unlocked: function() {return true},
                completionLimit: 1,
                rewardEffect: function() {return inChallenge('d',12) ? false : hasChallenge('d', 11)},
                goalDescription: function() {return inChallenge(this.layer, this.id) ? this.canComplete() ? "Complete now!" : "Need " + new Decimal(1000).sub(player.p.points).ceil() + " more P points to complete" : "reach 1000 " + BASEPOINTS},
                onExit: function() {showTab('p')},
                onEnter: function() {showTab('p')},
        },
        12: {
            name: "Challenge 02",
            challengeDescription: "Restrictions: " + FIRSTPOINTS + " and " + SECONDPOINTS + " gain ^0.5 and PP boost disabled. Also previous challenge reward disabled for fun too!",
            rewardDescription: "reduces the " + THIRDPOINTS + " rebuyable button by a factor of 10 (this is a buff)",
            canComplete: function() {return player.b.points.gte(1000)},
            unlocked: function() {return hasChallenge(this.layer, 11)},
            completionLimit: 1,
            rewardEffect: function() {return 10},
            goalDescription: function() {return inChallenge(this.layer, this.id) ? this.canComplete() ? "Complete now!" : "Need " + new Decimal(1000).sub(player.b.points).ceil() + " more " + SECONDPOINTS +" to complete" : "reach 1000 "+ SECONDPOINTS + "."},
            onExit: function() {showTab('p')},
            onEnter: function() {showTab('p')},
        },
        21: {
            name: "Challenge 03",
            challengeDescription: "Nothing yet",
            rewardDescription: "Nothing Yet",
            canComplete: function() {return true},
            unlocked: function() {return hasChallenge(this.layer, 11)},
            completionLimit: 1,
            rewardEffect: function() {return 1},
            goalDescription: function() {return "this doesn't do anything"},
            onExit: function() {showTab('p')},
            onEnter: function() {showTab('p')},
        },
        22: {
            name: "Challenge 04",
            challengeDescription: "Nothing yet",
            rewardDescription: "Nothing Yet",
            canComplete: function() {return true},
            unlocked: function() {return hasChallenge(this.layer, 21)},
            completionLimit: 1,
            rewardEffect: function() {return 1},
            goalDescription: function() {return "this doesn't do anything"},
            onExit: function() {showTab('p')},
            onEnter: function() {showTab('p')},
        },
    },
})