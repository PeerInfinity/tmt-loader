addLayer("rb", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked() {return hasUpgrade('r', 34)},                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    color: "#7AFF7D",                       // The color for this layer, which affects many elements.
    resource: "Rebirth points",            // The name of this layer's main prestige resource.
    row: 2,                               // The row this layer is on (0 is the first row).
    symbol:"RB",
    position: 2,
    branches: [['rw',2],['t',2],['s',2],['ri',1],['ap',2]],

    baseResource: "reset points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['r'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e12),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1.25,                    // "normal" prestige gain is (currency^exponent).

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('rb', 22)) mult = mult.times(1/3)
        if (hasUpgrade('p', 14)) mult = mult.times(1/(upgradeEffect('p', 14)))
        return mult
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    canBuyMax() { return hasMilestone("rb", 6) },

    layerShown() {return hasUpgrade('r', 34) || this.layer.points > 0 || hasMilestone(this.layer, 0)},           // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
    milestones: {
        0: {
            requirementDescription: "1st rebirth",
            effectDescription: "Keep reset upgrades and multiplies reset point gain by rebirth points.",
            done() { return player['rb'].points.gte(1) },
            unlocked() { return true},
        },
        1: {
            requirementDescription: "2nd rebirth",
            effectDescription: "Keep prestige upgrades when doing resets.",
            done() { return player['rb'].points.gte(2) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        2: {
            requirementDescription: "3rd rebirth",
            effectDescription: "Unlock another row of ascenion upgrades.",
            done() { return player['rb'].points.gte(3) },
            unlocked() { return hasMilestone('rb', 1)},
        },
        3: {
            requirementDescription: "4th rebirth",
            effectDescription: "Keep reset milestones.",
            done() { return player['rb'].points.gte(4) },
            unlocked() { return hasMilestone('rb', 2)},
        },
        4: {
            requirementDescription: "5th rebirth",
            effectDescription: "Boost ascension points passive gain to 50%.",
            done() { return player['rb'].points.gte(5) },
            unlocked() { return hasMilestone('rb', 3)},
        },
        5: {
            requirementDescription: "8th rebirth",
            effectDescription: "Unlock the 5th ascesion upgrade in row 2.",
            done() { return player['rb'].points.gte(8) },
            unlocked() { return hasMilestone('rb', 4)},
        },
        6: {
            requirementDescription: "12th rebirth",
            effectDescription: "Will allow for max buying rebirth points.",
            done() { return player['rb'].points.gte(12) },
            unlocked() { return hasMilestone('rb', 5)},
        },
        7: {
            requirementDescription: "16th rebirth",
            effectDescription: "Unlock rebirth upgrades.",
            done() { return player['rb'].points.gte(16) },
            unlocked() { return hasMilestone('rb', 6)},
        },
    },

    upgrades: {
        11: {
            title:"Basic strength",
            description: "Get a x15 boost to point gain.",
            cost: new Decimal(16),
            unlocked() { return hasMilestone('rb', 7)},
        },
        21: {
            title:"Prestige strength",
            description: "Will generate 5% of prestige points on reset per second.",
            unlocked() { return hasUpgrade('rb', 11)},
            cost: new Decimal(20),
        },
        22: {
            title:"Ascenion strength",
            description: "Apply 'ascenion power' again but at a reduced rate (/50).",
            unlocked() { return hasUpgrade('rb', 11)},
            cost: new Decimal(20),
        },
        31: {
            title:"Prestige-prestige?",
            description: "Unlocks a new prestige upgrade.",
            unlocked() { return hasUpgrade('rb', 21)}, // change to 21 when starting on rewind
            cost: new Decimal(33),
        },
        32: {
            title:"Rebirth strength",
            description: "Get a x3 boost to rebirth gain.",
            unlocked() { return hasUpgrade('rb', 21) & hasUpgrade('rb', 22)},
            cost: new Decimal(22),
        },
        33: {
            title:"Ascend-ascend?",
            description: "Unlocks a new ascend upgrade.",
            unlocked() { return hasUpgrade('rb', 22)},
            cost: new Decimal(26),
        },
    },
    hotkeys: [
        {
            key: "b", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "B: reset your reset points for rebirth points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.r.unlocked) doReset("rb") },
        },
    ],
    infoboxes: {
        lore: {
            title: "Rebirth",
            body() { return "Welcome to the reset-reset-reset's. Where you don't need to visit the reset tab." },
        },
    },
}),


addLayer("rw", {
    startData() { return {                  // startData is a function that returns default data for a layer.                    // You can add more variables here to add them to your layer.
        points: new Decimal(0), 
        seconds: new Decimal(0), 
        minutes: new Decimal(0), 
        hours: new Decimal(0), 
        unlocked() {return hasUpgrade('p', 31)},           // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    microtabs: {
        stuff: {
            "Time": {
                content: [
                        ["row", ["buyables"]],
                    ["column", [ ["row", [ ["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14], ["upgrade", 15] ]  ],
                                 ["row", [ ["upgrade", 21], ["upgrade", 22], ["upgrade", 23], ["upgrade", 24], ["upgrade", 25] ]  ],
                                 ["row", [ ["upgrade", 31], ["upgrade", 32], ["upgrade", 33], ["upgrade", 34], ["upgrade", 35] ]  ], 
                                 ["row", [ ["upgrade", 41], ["upgrade", 42], ["upgrade", 43], ["upgrade", 44], ["upgrade", 45] ]  ],
                                 ["row", [ ["upgrade", 51], ["upgrade", 52], ["upgrade", 53], ["upgrade", 54], ["upgrade", 55] ]  ],
                                 ["row", [ ["upgrade", 61], ["upgrade", 62], ["upgrade", 63], ["upgrade", 64], ["upgrade", 65] ]  ],
                                 ["row", [ ["upgrade", 71] ]  ]
                     ]],
                ],
            },
            "Expansion": {
                content: [

                ],
                unlocked() {return false}
            },
        }
    },

    color: "#FFD068",                       // The color for this layer, which affects many elements.
    resource: "Rewind points",            // The name of this layer's main prestige resource.
    symbol: "RW",
    row: 2,                                 // The row this layer is on (0 is the first row).
    position: 3, 
    branches: [['s',1],['ri',2],['ap',3]],
    tooltip() {return format(player.rw.points) + " rewind points<br>" + format(player.rw.seconds) + " seconds<br>" + format(player.rw.minutes) + " minutes<br>" + format(player.rw.hours) + " hours"},


    baseResource: "prestige points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['p'].points },  // A function to return the current amount of baseResource.

    requires() { return new Decimal(1e11)},              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.2,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)
        if (hasUpgrade('rw', 61)) mult = mult.times(3)
        if (hasUpgrade('rw', 62)) mult = mult.times(3)
        if (hasUpgrade('rw', 64)) mult = mult.times(3)
        return mult               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    effect() {
        let eff = new Decimal(0)
        eff = eff.add(player['rw'].points.pow(0.7))
        if (hasUpgrade('rw', 11)) eff = eff.times(2)
        if (hasUpgrade('rw', 12)) eff = eff.times(upgradeEffect('rw', 12))
        if (hasUpgrade('rw', 13)) eff = eff.times(3)
        if (hasUpgrade('rw', 14)) eff = eff.times((upgradeEffect('rw', 12).times(1/100).add(1)))
        if (hasUpgrade('rw', 15)) eff = eff.times(3)
        if (hasUpgrade('rw', 32)) eff = eff.times(3)
        if (hasUpgrade('rw', 21)) eff = eff.times(3)
        if (hasUpgrade('rw', 22)) eff = eff.times(3)
        if (hasUpgrade('rw', 24)) eff = eff.times(3)
        if (hasUpgrade('rw', 41)) eff = eff.times(3)
        if (hasUpgrade('rw', 42)) eff = eff.times(3)
        if (hasUpgrade('rw', 44)) eff = eff.times(3)
        if (hasUpgrade('rw', 23) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/300).add(1)))
        if (hasUpgrade('rw', 25) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/900).add(1)))
        if (hasUpgrade('rw', 43) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/2700).add(1)))
        if (hasUpgrade('rw', 45) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/8100).add(1)))
        if (hasUpgrade('rw', 65) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/900).add(1)))
        if (hasUpgrade('rw', 71) &! player.rw.seconds.gte(1.79e308)) eff = eff.times((upgradeEffect('rw', 12).times(1/1).add(1)))
        return eff
    },

    effectDescription () {
        return "which are generating " + format(tmp.rw.effect) + " seconds/sec"
    },

    softcap: new Decimal(1.79e308),
    softcappower: 0.1,

    update(diff) {
        if (player.rw.points > 0) player.rw.seconds = player.rw.seconds.plus(tmp.rw.effect.times(diff))
        if (hasUpgrade('rw', 35)) player.rw.minutes = player.rw.minutes.plus((tmp.rw.effect.times(1/1000)).times(diff))
        if (hasUpgrade('rw', 63)) player.rw.hours = player.rw.hours.plus((tmp.rw.effect.times(1/100000)).times(diff))
    },

    layerShown() {return hasUpgrade('p', 31) || this.layer.points > 0},    // Returns a bool for if this layer's node should be visible in the tree.
 
    buyables: {
        11: {
            cost(x) { return x = new Decimal(60)},
            display() { return "<h3>Convert to minutes</h3><br> " + "turns seconds into minutes <br>" + "Amount purchased:" + getBuyableAmount(this.layer, this.id)},
            canAfford() { return player[this.layer].seconds.gte(this.cost()) },
            unlocked() { return true},
            buy() {
                let increase = new Decimal(1)
                if (hasUpgrade('rw', 31)) increase = increase.times(3)
                if (hasUpgrade('rw', 34)) increase = increase.times(upgradeEffect('rw', 34))
                player[this.layer].seconds = player[this.layer].seconds.sub(this.cost())
                if (hasUpgrade('rw', 33)) player.rw.seconds = player.rw.seconds.add(54)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.rw.minutes = player.rw.minutes.add(increase)
            },
        },

        12: {
            cost() { return new Decimal(60)},
            display() { return "<h3>Convert to hours</h3><br> " + "turns minutes into hours <br>" + "Amount purchased:" + getBuyableAmount(this.layer, this.id)},
            canAfford() { return player[this.layer].minutes.gte(this.cost()) },
            unlocked() { return true},
            buy() {
                let imcrease = new Decimal(1)
                if (hasUpgrade('rw', 51)) imcrease = imcrease.times(3)
                if (hasUpgrade('rw', 34)) imcrease = imcrease.times(upgradeEffect('rw', 34))
                player[this.layer].minutes = player[this.layer].minutes.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.rw.hours = player.rw.hours.add(imcrease)
            },
        },
        13: {
            cost() { return new Decimal(60)},
            display() { return "<h3>oops! i fucked up</h3><br> " + "reset all time currency to 0 (dev thingy)<br>" + "Amount purchased:" + getBuyableAmount(this.layer, this.id)},
            canAfford() { return player[this.layer].seconds.gte(this.cost()) },
            unlocked() { return false},
            buy() {
                player[this.layer].seconds = player[this.layer].seconds.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.rw.seconds = new Decimal(0)
                player.rw.minutes = new Decimal(0)
                player.rw.hours = new Decimal(0)
                player.rw.points = new Decimal(0)

            },
        },
    },

    upgrades: {
        11: {
            title:"sec/sec",
            description: "double second gain",
            cost() {return new Decimal(100)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        12: {
            title:"sec/sec/sec",
            description: "second gain boosted based on seconds",
            cost() {return new Decimal(2000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
            effect() {
                return player['rw'].seconds.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title:"sec/sec/sec/sec",
            description: "triple second gain",
            cost() {return new Decimal(16000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        14: {
            title:"you get the idea by now",
            description: "reapply 'sec/sec/sec' but heavily reduced",
            tooltip:"(effect/100)+1",
            cost() {return new Decimal(45000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
            effectDisplay() { return format(upgradeEffect('rw', 12).times(1/100).add(1))+"x" },

        },
        15: {
            title:"this was already getting to long",
            description: "triple second gain again",
            cost() {return new Decimal(128000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        21: {
            title:"if i tried to continue the joke",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 52)},
            cost() {return new Decimal(4000000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        22: {
            title:"the names would take up the box",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 52)},
            cost() {return new Decimal(32000000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        23: {
            title:"which would be useless",
            description: "reapply 'you get the idea by now' at a reduced rate",
            tooltip: "/3",
            unlocked() {return hasUpgrade('rw', 52)},
            cost() {return new Decimal(100000000)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        24: {
            title:"so sec/sec 10 times is not happening",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 52)},
            cost() {return new Decimal(1.2e9)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        25: {
            title:"sec/sec/sec/sec/sec/sec/sec/sec/sec/sec",
            description: "reapply 'you get the idea by now' at a reduced rate",
            tooltip: "/9",
            unlocked() {return hasUpgrade('rw', 52) && hasUpgrade('rw', 24)},
            cost() {return new Decimal(15e9)},
            currencyInternalName: "seconds",
            currencyDisplayName: "seconds",
            currencyLayer: "rw",
        },
        31: {
            title:"how about minutes?",
            description: "triple minute gain from 'convert to minutes'",
            cost() {return new Decimal(20)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        32: {
            title:"boost minutes with extra steps",
            description: "triple second gain",
            cost() {return new Decimal(100)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        33: {
            title:"60 is just to much",
            description: "only spend 6 seconds when using 'convert to minutes' at a reduced rate",
            tooltip: "/27",
            cost() {return new Decimal(360)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        34: {
            title:"isn't this just min boost min with extra steps?",
            description: "boost minute gain based on hours",
            cost() {return new Decimal(1200)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
            effect() {
                return player['rw'].hours.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        35: {
            title:"min/min",
            description: "automatically gain minutes at a reduced rate of seconds",
            tooltip: "/1000 of second gain",
            cost() {return new Decimal(3600)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        41: {
            title:"min/min/min",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 54)},
            cost() {return new Decimal(16000)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        42: {
            title:"we already did this",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 54)},
            cost() {return new Decimal(90000)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        43: {
            title:"doing min/min forever would be boring",
            description: "reapply 'you get the idea by now' at a reduced rate",
            tooltip: "/27",
            unlocked() {return hasUpgrade('rw', 54)},
            cost() {return new Decimal(200000)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        44: {
            title:"so it's not happening",
            description: "triple second gain",
            unlocked() {return hasUpgrade('rw', 54)},
            cost() {return new Decimal(900000)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        45: {
            title:"i told you it wouldn't",
            description: "reapply 'you get the idea by now' at a reduced rate",
            tooltip: "/81",
            unlocked() {return hasUpgrade('rw', 54) && hasUpgrade('rw', 44)},
            cost() {return new Decimal(3000000)},
            currencyInternalName: "minutes",
            currencyDisplayName: "minutes",
            currencyLayer: "rw",
        },
        51: {
            title:"don't you just love upgrades?",
            description: "triple hour gain from 'convert to hours",
            cost() {return new Decimal(12)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        52: {
            title:"why is there more",
            description: "unlock more upgrades",
            cost() {return new Decimal(150)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        53: {
            title:"hr/hr",
            description: "'isn't this just min boost min with extra steps' is applied to hour gain from 'convert to hours'",
            cost() {return new Decimal(600)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        54: {
            title:"please stop with the extra upgrades.",
            description: "unlock even more upgrades",
            cost() {return new Decimal(1000)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        55: {
            title:"WHY",
            description: "unlock another row of upgrades",
            cost() {return new Decimal(3600)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        61: {
            title:"THERE DOES NOT NEED TO BE",
            description: "triple rewind point gain",
            cost() {return new Decimal(20000)},
            unlocked() {return hasUpgrade('rw', 55)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        62: {
            title:"SO MANY OF THESE",
            description: "triple rewind point gain",
            cost() {return new Decimal(10000)},
            unlocked() {return hasUpgrade('rw', 55)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        63: {
            title:"REWIND UPGRADES",
            description: "automatically gain hours at an extremely reduced rate of seconds.",
            tooltip: "effect/100000",
            cost() {return new Decimal(6000)},
            unlocked() {return hasUpgrade('rw', 55)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        64: {
            title:"THEY DO ABSOLUTELY",
            description: "triple rewind point gain",
            cost() {return new Decimal(30000)},
            unlocked() {return hasUpgrade('rw', 55)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        65: {
            title:"<h2 style='color:#CF2424'>NOTHING</h2>",
            description: "reapply 'you get the idea by now' but at a reduced rate and slightly boost prestige point gain based on rewind points.",
            tooltip: "/9",
            effect() {
                return player.rw.points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost() {return new Decimal(50000)},
            unlocked() {return hasUpgrade('rw', 55)},
            currencyInternalName: "hours",
            currencyDisplayName: "hours",
            currencyLayer: "rw",
        },
        71: {
            title() {return player.rw.seconds.gte(1.79e308)?"<h2 style='color:#CF2424'>NO MORE TIME</h2>":"trust this upgrade"},//"no more 'you get the idea but again' upgrades! I told you to STOP"
            description() {return player.rw.seconds.gte(1.79e308)?"<h3>no more 'you get the idea but again' upgrades, I told you to STOP UPGRADING!</h3>":"reapply 'you get the idea' but 100x BETTER"},
            cost() {return new Decimal(1)},
            unlocked() {return hasUpgrade('rw', 65)},
            style() {return player.rw.seconds.gte(1.79e308)?{"border-radius": "10% / 10%", "width": "300px", "height": "300px"}:{"border-radius": "15% / 15%", "width": "120px", "height": "100px"}},
        },
    },

    hotkeys: [
        {
            key: "w", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "W: reset your prestige points for rewind points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.r.unlocked) doReset("rw") },
        },
    ],

    infoboxes: {
        lore: {
            title: "Rewind",
            body() { return "Time to go back in time! But not really, your just generating time.<br> (haven't gotten the text to work so it's here)<br> Seconds:" + format(player['rw'].seconds) + "<br>Minutes:" + player['rw'].minutes + "<br>Hours:" + player['rw'].hours },
        },
    },
    tabFormat: [
        "main-display",
        ["display-text", function() {return "you have <h2>" + format(player.rw.seconds) + "</h2> seconds<br>you have <h2>" + format(player.rw.minutes) + "</h2> minutes<br>you have <h2>" + format(player.rw.hours) + "</h2>hours <br>"}],
        [],
        "prestige-button",
        "blank",
        ["microtabs","stuff"],
    ]
}),
//    color: "#AAC2FF", /      style() {return  {'background-color': '#2B3156'}},  /             body() { return "hope you like challenges, because that's what most of this layer is." },
addLayer("t", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked() {return hasUpgrade('a', 31) || player['t'].points > 0 || hasMilestone('t', 1)},                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        best: new Decimal(0),
    }},

    color: "#AAC2FF",                       // The color for this layer, which affects many elements.
    resource: "Transcendence points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    symbol: "T",
    position: 1,
    branches: [['s',3],['ri',2],['ap',1]],

    baseResource: "ascenion points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['a'].points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e15),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    passiveGeneration() {
        let generation = new Decimal(0)
        if (hasUpgrade('p', 24)) generation = generation.add(0.1)
        return generation
    },
    doReset(reset) {
        player['r'].points = new Decimal(0)
    },

    layerShown() { return hasUpgrade('a', 31) || player['t'].points > 0 || hasMilestone('t', 1)},          // Returns a bool for if this layer's node should be visible in the tree.


    milestones: {
        0: {
            requirementDescription: "1 trascendence",
            effectDescription: "Unlock first row ascension challenges, you keep ascend challenges on reset.",
            done() { return player['t'].points.gte(1) },
            unlocked() { return (true)},
        },
        1: {
            requirementDescription: "100 trascendence",
            effectDescription: "Unlock first transcendence buyable, and keep reset buyables on reset.",
            done() { return player['t'].points.gte(100) },
            unlocked() { return (true)},
        },
        2: {
            requirementDescription: "1000 total trascendence",
            effectDescription: "Keep ascenion upgrades, and unlock 2 more ascenion upgrades",
            done() { return player['t'].total.gte(1000) },
            unlocked() { return (true)},
        },
    },

    buyables: {
        11: {
            cost(x) { return new Decimal(10).times(x.pow(1.2))},
            display() { return "<h3>Inset name here</h3><br> " + "boost pretige point gain based<br>" + "Amount:" + getBuyableAmount(this.layer, this.id) + "/100" +"<br>Cost:" + format(this.cost()) + "<br>" + format(buyableEffect(this.layer, this.id))+"x" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            unlocked() { return hasMilestone('t', 1)},
            effect() {
                return getBuyableAmount(this.layer, this.id).add(1).pow(0.7)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit() {
                let limit = new Decimal(100)
                return limit
            },
        },
    },

    infoboxes: {
        lore: {
            title: "Transcendence",
            body() { return "Forget reset-reset's. Now it's all about those ascended-ascenions." },
        },
    },
})