addLayer("p", {
    name: "Pens", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🖊️", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        progress: new Decimal(1),
    }},
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []
      
            if(hasMilestone("k", 0))keep.push(11, 12, 13, 14, 15, 21)
            if(hasMilestone("k", 1))keep.push(31, 32, 33, 34, 35, 41)
            if(hasMilestone("d", 0))keep.push(11, 12, 13, 14, 15, 21, 31, 32, 33, 34, 35, 41)
            if(hasMilestone("y", 0))keep.push(11, 12, 13, 14, 15, 21, 31, 32, 33, 34, 35, 41)
            layerDataReset(this.layer) 

            player[this.layer].upgrades = keep
            player["p"].progress = new Decimal(0)
    },
    
    color: "#7CB9E8",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Pens", // Name of prestige currency
    baseResource: "Pencils", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exponent = 0.5
        if (hasUpgrade("k", 32)) exponent = 0.7
        if(hasUpgrade("d", 33)) exponent = 2
        if(hasUpgrade("w", 23)) exponent = 0.3
        return exponent
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('r', 12)) mult = mult.times(upgradeEffect('r', 12))
        if (hasUpgrade('p', 32)) mult = mult.times(10)
        if (hasUpgrade('o', 11)) mult = mult.times(10)
        if (hasUpgrade('k', 11)) mult = mult.times(2)
        if (hasUpgrade("k", 35)) mult = mult.times(upgradeEffect("k", 35))
        if (hasUpgrade('k', 12)) mult = mult.times(2)
        if (hasUpgrade('d', 11)) mult = mult.times(5)
        if (hasUpgrade('d', 31)) mult = mult.times(1e100)
        if (hasUpgrade('o', 25)) mult = mult.times("1e5000000")
        if (hasUpgrade('d', 32)) mult = mult.times(1e25)
        mult = mult.times(buyableEffect("w", 11))
        if (hasUpgrade("k", 14)) mult = mult.times(upgradeEffect("k", 14))
        if (hasUpgrade("w", 14)) mult = mult.times(buyableEffect("w", 11))
        if (hasUpgrade("k", 55)) mult = mult.times(1e30)
        if (hasUpgrade("m", 15)) mult = mult.times(upgradeEffect("m", 15))
        if (hasUpgrade("m", 13)) mult = mult.times(upgradeEffect("m", 13))
        if (hasUpgrade('k', 13)) mult = mult.times(100)
        if (hasUpgrade('y', 11)) mult = mult.times(100)
        if (hasUpgrade('d', 14)) mult = mult.times(1e100)
        if (hasUpgrade('p', 34)) mult = mult.pow(1.1)
        if (hasUpgrade('p', 35)) mult = mult.times(upgradeEffect("p", 35))
        if (hasUpgrade('d', 12)) mult = mult.pow(1.01)
        return mult
    },
    passiveGeneration() {
        if (hasUpgrade("p", 15)) return 0.1
        if (hasMilestone("k", 2)) return 1
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for Pens", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: {
        "Main": {
                content: [
                ["display-text",
                'School 1', { "color": "LightBlue", "font-size": "32px", "text-shadow": "0px 0px 20px LightBlue"}],
                "blank",
                "blank",
                "main-display",
                "blank",
                "resource-display",
                "blank",
                "prestige-button",
                "blank",
                ["infobox", "main"],
                ["infobox", "main2"],
             ],
            },
            "Upgrades": {
                content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
               "upgrades",
             ],
             unlocked() {return player.r.points.gte(1)},
            },
         },
    upgrades:{
        11: {
            title: "Doubled",
            description: "x2 to ✏️ gain",
            cost: new Decimal(1),
        },
        12: {
            unlocked() {return hasUpgrade(this.layer, 11)},
            title: "Useful PP",
            description: "✏️ get boost based on PP",
            cost: new Decimal(3),
            effect() {
                hardcap = new Decimal("1e6")
                if (hasUpgrade("k", 31)) hardcap = new Decimal("1e100")
                if (hasUpgrade("k", 53)) hardcap = new Decimal("1e300")
                if (hasUpgrade("o", 12)) hardcap = new Decimal("1e1e5")
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return player[this.layer].points.add(1).pow(0.5).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            unlocked() {return hasUpgrade(this.layer, 12)},
            title: "Useful points",
            description: "PP get boost based on ✏️",
            cost: new Decimal(5),
            effect() {
                hardcap = new Decimal("100")
                if (hasUpgrade("k", 31)) hardcap = new Decimal("1e15")
                if (hasUpgrade("k", 54)) hardcap = new Decimal("1e200")
                if (hasUpgrade("o", 12)) hardcap = new Decimal("1e1e5")
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return player.points.add(1).pow(0.15).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            unlocked() {return hasUpgrade(this.layer, 13)},
            title: "Just points multi",
            description: "x5 to ✏️ gain",
            cost: new Decimal(20),
        },
        15: {
            unlocked() {return hasUpgrade(this.layer, 14)},
            title: "Automation",
            description: "You gain 10% of your PP gain per second",
            cost: new Decimal(50),
        },
        21: {
            unlocked() {
                if (hasUpgrade(this.layer, 21)) return false
                else return hasUpgrade(this.layer, 15)
            },
            title: "2nd row",
            description: "unlock 2nd row of PP upgrades",
            cost: new Decimal(50),
        },
        31: {
            unlocked() {return hasUpgrade(this.layer, 21)},
            title: "Useful points 2",
            description: "✏️ get boost based on points",
            cost: new Decimal(100),
            effect() {
                hardcap = new Decimal("100")
                if (hasUpgrade("k", 31)) hardcap = new Decimal("1e15")
                if (hasUpgrade("k", 54)) hardcap = new Decimal("1e200")
                if (hasUpgrade("o", 12)) hardcap = new Decimal("1e1e5")
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return player.points.add(1).pow(0.1).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        32: {
            unlocked() {return hasUpgrade(this.layer, 21)},
            title: "Just PP multi",
            description: "x10 to PP gain",
            cost: new Decimal(300),
        },
        33: {
            unlocked() {return hasUpgrade(this.layer, 21)},
            title: "Ultimate points",
            description: "✏️ ^1.1",
            cost: new Decimal(3000),
        },
        34: {
            unlocked() {return hasUpgrade(this.layer, 21)},
            title: "Ultimate PP",
            description: "PP ^1.1",
            cost: new Decimal(10000),
        },
        35: {
            unlocked() {return hasUpgrade(this.layer, 21)},
            title: "PP buff",
            description: "PP boost PP gain",
            cost: new Decimal(50000),
            effect() {
                hardcap = new Decimal("100")
                if (hasUpgrade("k", 31)) hardcap = new Decimal("1e15")
                if (hasUpgrade("o", 12)) hardcap = new Decimal("1e1e5")
                if (hasUpgrade("d", 32)) hardcap = hardcap.times(1e20)
                return player.points.add(1).pow(0.1).min(hardcap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
    infoboxes: {
        main: {
            title: "Your first infobox!",
            body() { return "<b>Welcome to The School Tree</b>.<br>This is an infobox!. They will help everwhere in the game. Read the infobox below me and click on 'Upgrades' at the top to start through the school system!"},
        },
        main2: {
            title: "Pens!", 
            body() { return "Welcome! Click the blue button to get 1 Pen! You can spend Pens on upgrades. Try getting to over 100,000 Pens!"},
        },
    }
})
