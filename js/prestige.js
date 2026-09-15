addLayer("p", {
    name: "Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    hotkeys: [
        {
            key: "p", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "P: Reset your Points for Prestige Points", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.p.unlocked) doReset("p") },
            unlocked() {return true} // Determines if you can use the hotkey, optional
        }
    ],
    doReset(resettingLayer) {
        let keep = [];
        if (hasUpgrade('w', 13)) keep.push('upgrades')
        if (layers[resettingLayer].row > this.row && (resettingLayer == "l" || resettingLayer == "w")) { 
            layerDataReset(this.layer, keep);
                
        }
        //anything u place here is for keeping specific things, like if(hasUpgrade('x',99))player.y.upgrades.push(11) if that makes sense
    },
    color: "#0086D1",
    branches: "w",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Prestige Points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        // layer fragments
        if (hasUpgrade('lf', 12)) mult = mult.times(2)
        // layer
        if (hasUpgrade('l', 11)) mult = mult.times(2)
        if (hasUpgrade('l', 12)) mult = mult.times(2.5)
        if (hasUpgrade('l', 14)) mult = mult.times(1.25)
        if (hasUpgrade('l', 15)) mult = mult.times(3)
        // prestige
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
        // power
        if (hasUpgrade('w', 11)) mult = mult.times(1.5)
        if (hasUpgrade('w', 12)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Newly Prestiged",
            description: "The First Upgrade, Point gain increased.",
            cost: new Decimal(1),
        },
        12: {
            title: "A Nice Boost.",
            description: "Point gain increases as you gain more Prestige Points.",
            cost: new Decimal(2),
            effect() {
                let effect = player[this.layer].points.add(1).pow(0.5); if (effect.gt(25) && !hasUpgrade('l', 23)) return 25; else if (effect.gt(75) && hasUpgrade('l', 23)) return 75; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        13: {
            title: "Woah! More Prestige Points?",
            description: "You gain more Prestige Points based on Points.",
            cost: new Decimal(4),
            effect() {
                let effect = player.points.add(1).pow(0.15); if(effect.gt(50)) return 50; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Power",
            description: "More Prestige Points based on Points again but Stronger.",
            unlocked(){if (hasUpgrade('l', 24)) return true; else return false},
            cost: new Decimal(5000),
            effect() {
                let effect = player.points.add(1).pow(0.2); if(effect.gt(100)) return 100; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            title: "Prestige Power!",
            description: "Previous upgrade but even STRONGER.",
            unlocked(){if (hasUpgrade('l', 24)) return true; else return false},
            cost: new Decimal(250000),
            effect() {
                let effect = player.points.add(1).pow(0.25); if(effect.gt(200)) return 200; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        21: {
            title: "Upgrader",
            description: "Doubles Prestige Point Gain",
            cost: new Decimal(7),
            effect() {
               if (!hasUpgrade('p', 21)) return(1); else if (!hasUpgrade('p', 22)) return (2); else if (!hasUpgrade('p', 24)) return (5); else if (!hasUpgrade('p', 25)) return (10); else return (25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        22: {
            title: "Upgrader+",
            description: "Upgrades the Upgrader Upgrade.",
            cost: new Decimal(50),
        },
        23: {
            title: "More Points!",
            description: "Unlocks a new layer + A Nice Boost again But slightly Weaker.",
            cost: new Decimal(250),
            effect() {
                let effect = player[this.layer].points.add(1).pow(0.4); if (effect.gt(20) && !hasUpgrade('l', 23)) return 20; else if (effect.gt(50) && hasUpgrade('l', 23)) return 50; else return (effect)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        24: {
            title: "Upgrader++",
            description: "Upgrade the Upgrader+ Upgrade",
            unlocked(){if (hasUpgrade('l', 24)) return true; else return false},
            cost: new Decimal(500000),
        },
        25: {
            title: "Upgrader+3",
            description: "Upgrade the Upgrader++ upgrade and allow it to Boost Layer Points Half as much.",
            unlocked(){if (hasUpgrade('l', 24)) return true; else return false},
            cost: new Decimal(2500000),
        },
    },
})
