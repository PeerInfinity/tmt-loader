addLayer("c", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    branches: ["p"],

    color: "#CC8800",                       // The color for this layer, which affects many elements.
    resource: "c points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
    canBuyMax() {return true},
    hotkeys: [
        {key: "c", description: "c: select " + THIRDPOINTS + " layer if unlocked", onPress(){if (player.c.unlocked === true) showTab('c')}},
        {key: "C", description: "C: Reset for " + THIRDPOINTS + " if able", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: THIRDPOINTS,
            body: THIRDPOINTS + " themed tab for now!  Will maybe be focused on the milestones.  Working on fleshing out concepts and a theme.<br/><br/>"
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
        "milestones"
    ],
    baseResource: FIRSTPOINTS,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.p.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(100),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.9,                          // "normal" prestige gain is (currency^exponent).

    directMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11))
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        let gExp = new Decimal(1)
//        if (hasUpgrade('c', 11)) gExp = gExp.times(upgradeEffect('c', 11))
        return gExp
    },
        // explained in b.js
    layerShown() { return player[this.layer].unlocked | player.p.points.gte(70) ? true : "ghost"},
    softcap: new Decimal(99),
    softcapPower: decimalZero,

    upgrades: {
        11: {
            title: "B boost",
            description: SECONDPOINTS + " boost " + THIRDPOINTS + " gain!",
            cost: new Decimal(5),
            effect() {
                let boost = player.b.points.add(1).pow(0.15)
                hasUpgrade(this.layer, "12") ? boost = boost.times(1.5) : false
                return boost
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "B boost boost",
            description: SECONDPOINTS + " boost " + THIRDPOINTS + " gain more!",
            cost: new Decimal(30),
            effectDisplay() { return "1.5x" }, // Add formatting to the effect
        },
        // Look in the upgrades docs to see what goes here!
    },
    buyables: {
        11: {
            getAmt() {
                amt=new Decimal(100)
                if(hasChallenge("d",12)) {amt = amt.div(challengeEffect("d",12)) }
                return amt
            },
            display() {
                return "set C points to: " + this.getAmt()
            },
            cost(x) {return new Decimal(100)},
            canAfford() {return player[this.layer].points.gte(this.getAmt())},
            buy() {player[this.layer].points = new Decimal(this.getAmt())}
        },

    },

    milestones: {
        0: {
            requirementDescription: "10 total C points",
            effectDescription: "Passively generate .01x your P points on reset per second",
            done() {return player.c.points.gte(10)}
        },
        1: {
            requirementDescription: "20 total C points",
            effectDescription: "Keep the first 3 \"p\" upgrades",
            done() {return player.c.points.gte(20)},
            unlocked() {return hasMilestone(this.layer, "0")}
            
        }
    },
})