addLayer("lf", {
    name: "Layer Fragments", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        fragments: new Decimal(0),
		points: new Decimal(0),
    }},
    update(diff) {
        let fragmentGain = tmp.lf.fragmentGain
        fragmentGain = fragmentGain.mul(diff)
        player.lf.fragments = player.lf.fragments.add(fragmentGain)
    },
    fragmentGain(){
        if (hasUpgrade('lf', 11) || player.lf.fragments.gt(0)) return player.lf.points.add(1).pow(0.5); else return new Decimal(0)
    },
    hotkeys: [
        {
            key: "f", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "F: Reset Layer Points for Layer Fragments.", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.lf.unlocked) doReset("lf") },
            unlocked() {return player.lf.unlocked || hasUpgrade('l', 21)} // Determines if you can use the hotkey, optional
        }
    ],
    color: "#757575",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "Layer Fragments", // Name of prestige currency
    baseResource: "Layer Points", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.35, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        // prestige Upgrades
        // Blank
        // Power Upgrades
        if (hasUpgrade('w', 15)) mult = mult.times(upgradeEffect('w', 15))
        // Layer Upgrades
        // Blank
        // Layer Fragment Upgrades
        // Blank
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 11, // Row the layer is in on the tree (0 is the first row)
    displayRow: 'side',
    layerShown(){return player.lf.unlocked || hasUpgrade('l', 21)},
    buyables: {
        11: {
            cost(x){return new Decimal(5).pow(x)},
            title: 'Fragment Power',
            display(){return 'Increase Layer Point Gain by 1.1x'},
            unlocked(){if (hasUpgrade('lf', 11)) return true; else return false},
            canAfford(){return player.lf.fragments.gte(this.cost())},
            buy(){
                player.lf.fragments = player.lf.fragments.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "Fragmented Layers",
            description: "2x Layer Points Begin Fragment Generation",
            cost: new Decimal(1),
        },
        12: {
            title: "Fragmented Points",
            description: "^1.1 Points, 2x Prestige Points More layer Upgrades, Inflate.",
            cost: new Decimal(2),
        },
        13: {
            title: "Proper Layers",
            description: "Finally unlock a layer that ISN'T a Side Layer!",
            cost: new Decimal(25),
        },
        14: {
            title: "Upgrades Kept",
            description: "Keep Watt Upgrades on Layer Resets",
            cost: new Decimal(1250),
        },
    },

})
