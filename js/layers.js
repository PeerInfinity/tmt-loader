addLayer("l", {
    name: "Layers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    hotkeys: [
        {
            key: "l", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "L: Reset Prestige Points for Layer Points.", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.l.unlocked) doReset("l") },
            unlocked() {return player.l.unlocked || hasUpgrade('p', 23)} // Determines if you can use the hotkey, optional
        }
    ],
    color: "#575757",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    resource: "Layer Points", // Name of prestige currency
    baseResource: "Prestige Points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.35, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        // Achievements
        if (hasAchievement('a', 23)) mult = mult.times(1.5)
        if (hasAchievement('a', 24)) mult = mult.times(2.5)
        // Prestige Upgrades
        // blank for now
        // Power Upgrades
        if (hasUpgrade('w', 14)) mult = mult.times(upgradeEffect('w', 14))
        // Layer Upgrades
        if (hasUpgrade('l', 21)) mult = mult.times(4)
        // Layer Fragment Upgrades
        if (hasUpgrade('lf', 11)) mult = mult.times(2)
        if (getBuyableAmount('lf', 11).gt(0)) mult = mult.times(getBuyableAmount('lf', 11).times(1.1))
        // After Other Effects Upgrades
        if (hasUpgrade('p', 21) && hasUpgrade('p', 25)) mult = mult.times(upgradeEffect('p', 21)/2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 10, // Row the layer is in on the tree (0 is the first row)
    displayRow: 'side',
    layerShown(){return player.l.unlocked || hasUpgrade('p', 23)},
    upgrades: {
        11: {
            title: "Layers...",
            description: "What do they mean? 2x Prestige Points",
            cost: new Decimal(1),
        },
        12: {
            title: "Layer Up!",
            description: "A Fragment of Power. 5x Points and 2.5x Prestige Points!",
            cost: new Decimal(3),
        },
        13: {
            title: "Increment Layer.",
            description: "1.75x Points, Small Increase.",
            cost: new Decimal(5),
        },
        14: {
            title: "Small Layers..",
            description: "2.5x Points, 1.25x Prestige Points, Still Small...",
            cost: new Decimal(10),
        },
        15: {
            title: "Layer+",
            description: "5x Points again aswell as 3x Prestige Points. You'll be needing this.",
            cost: new Decimal(25),
        },
        21: {
            title: "Layer of Power",
            description: "Let there be another Layer, and Quadruple Layer Points!",
            cost: new Decimal(50),
        },
        22: {
            title: "Fragmented Boost",
            description: "Boost Points based on Layer Points",
            unlocked(){if (hasUpgrade('lf', 12)) return true; else return false},
            cost: new Decimal(100),
            effect() {
                let effect = player[this.layer].points.add(1).pow(0.75); if (effect.gt(50)) return 50; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        23: {
            title: "Hardcap Boost",
            description: "Increase the Limit on 'A Nice Boost' and 'More Points'",
            unlocked(){if (hasUpgrade('lf', 12)) return true; else return false},
            cost: new Decimal(250),
        },
        24: {
            title: "Shattered Layers",
            description: "Shatter the limits, LET THERE BE MORE PRESTIGE UPGRADES!",
            unlocked(){if (hasUpgrade('lf', 12)) return true; else return false},
            cost: new Decimal(400),
        },
        25: {
            title: "Layer Boost",
            description: "Slightly Stronger variant of 'Fragmented Boost'",
            unlocked(){if (hasUpgrade('lf', 12)) return true; else return false},
            cost: new Decimal(5000),
            effect() {
                let effect = player[this.layer].points.add(1).pow(0.65); if (effect.gt(75)) return 75; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
    },
})
