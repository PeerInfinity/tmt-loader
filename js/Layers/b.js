addLayer("b", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    branches: ["p"],

    color: "#00C0FF",                       // The color for this layer, which affects many elements.
    resource: "b points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    hotkeys: [
        {key: "b", description: "b: select " + SECONDPOINTS + " layer if unlocked", onPress(){if (player.b.unlocked === true) showTab('b')}},
        {key: "B", description: "B: Reset for " + SECONDPOINTS + " if able", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: SECONDPOINTS,
            body: SECONDPOINTS + " themed tab for now!  or something.  Have fun?<br/><br/>"
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        ["blank", "50px"],
        "buyables",
        ["blank", "50px"],
        "upgrades"
    ],


    baseResource: "Prestige Points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.p.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(50),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
                                            // NOTE modifiers to gain actually reduce the amount of baseResource required, 
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        newExp = new Decimal(1)
        if(inChallenge("d",12)) {newExp = new Decimal(0.5)}
        return newExp
    },
        //if you have >= 1 b point OR >= 30 Prestige points it is visible.  Otherwise it's a ghost
    layerShown() { return player[this.layer].unlocked | player.p.points.gte(30) ? true : "ghost"},  // could be false instead of ghost, ghost makes it take up space whether it can be seen or not



    upgrades: {
        11: {
            title: "Keep upgrade \"B\"",
            description: "Sick of buying it every prestige?",
            cost: new Decimal(10),
        },
        12: {
            title: "Increase effect of upgrade \"B\"",
            description: "Getting stronger!",
            effect() {return new Decimal(1.5)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost: new Decimal(100),
        },
    },
})