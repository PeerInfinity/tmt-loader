addLayer("s", {
    name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#676767",
    branches: ['bl'],
    requires: new Decimal(1000),
    resource: "space", // Name of prestige currency
    baseResource: "black hole",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.bl.points },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    effectDescription() { 
        mult = new Decimal(100)
        if (hasMilestone('u', 4)) mult = mult.times(100)
        return "which are generating "+format(Decimal.min(player.s.points, 1e19).times(mult))+" / "+format(mult.times(1e19))+" black hole per second."
    },
    getResetGain() {
        gain = player.bl.points.div(1000)

        if (hasUpgrade('d', 12) && (player.d.dilating || hasUpgrade('si', 14))) gain = gain.times(player.d.relativityGain.pow(0.9))
        gain = gain.pow(player.dm.anionsEffect.div(player.dm.anionsNerf))

        if (!isNaN(gain) && gain.gte(1)) return gain
        else return decimalZero
    },
    getNextAt() {
        return NaN
    },
    canReset() {
        return getResetGain(this.layer).gte(1)
    },
    prestigeButtonText() {
        return "Releashing your Black Holes gives you +"+format(getResetGain(this.layer))+" space"
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    update() {
        mult = new Decimal(10)
        if (hasMilestone('u', 4)) mult = mult.times(100)
        player.bl.points = player.bl.points.add(Decimal.min(player.s.points, mult.times(1e20)).times(mult))
    },
 
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.bl.points)+" black holes" }
                ], "blank",
                "milestones", "blank"
            ]
        },
        "Celestials": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Celestial Construtions</b>' }, {"font-size": "32px", "color": "#676767"}
                ], "blank",
                "buyables", "blank"
            ],
            unlocked() {return hasMilestone('s', 0)}
        }, 
    },

    doReset(resettingLayer) {
		let keep = ["buyables"];
        if (hasMilestone('u', 4)) keep.push("milestones");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    milestones: {
        0: {
            requirementDescription: "1e75 Star Fragment & 1e16 Generator",
            effectDescription: "Unlock a new tab.",
            done() { return (player.sf.points.gte(1e75) && player.g.points.gte(1e16)) || hasMilestone('u', 4) }
        },
        1: {
            requirementDescription: "1e20 Space",
            effectDescription: "Gain 20% of space every second.",
            done() { return player.s.points.gte(1e20) || hasMilestone('u', 4) }
        },
    },

    buyables: {
        11: {
            cost(x) { 
                //Space Cost
                return new Decimal(10)
            },
            title() { return "Asteroid ("+getBuyableAmount('s', 11)+"/1)"},
            display() { 
                return "Unlock 1 extra number buyables.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" space + 1.00e15 quarks<br><br>(Buying this resets Generators, Electrons and Quarks)" 
            },
            canAfford() { 
                return player.s.points.gte(this.cost()) && player.g.quarks.gte(1e15)
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                player.g.lastQuarks = decimalZero
                player.g.quarksGain = decimalZero
                player.g.quarks = decimalZero
                player.g.points = decimalZero
                player.g.lastElectron = decimalZero
                player.g.electronGain = decimalZero
                player.g.electron = decimalZero
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1,
        },
        12: {
            cost(x) { 
                //Space Cost
                return new Decimal(1e22)
            },
            title() { return "Planet ("+getBuyableAmount('s', 12)+"/1)"},
            display() { 
                return "Unlock 1 extra infinity buyables.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" space + 8.00e19 quarks<br><br>(Buying this resets Generators, Electrons and Quarks)" 
            },
            canAfford() { 
                return player.s.points.gte(this.cost()) && player.g.quarks.gte(8e19)
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                player.g.lastQuarks = decimalZero
                player.g.quarksGain = decimalZero
                player.g.quarks = decimalZero
                player.g.points = decimalZero
                player.g.lastElectron = decimalZero
                player.g.electronGain = decimalZero
                player.g.electron = decimalZero
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1,
        },
        21: {
            cost(x) { 
                //Space Cost
                return new Decimal("1e1000")
            },
            title() { return "Star ("+getBuyableAmount('s', 21)+"/1)"},
            display() { 
                return "Unlock 1 extra velocity buyables.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" space + e1.000e16 quarks<br><br>(Buying this resets Generators, Electrons and Quarks)" 
            },
            canAfford() { 
                return player.s.points.gte(this.cost()) && player.g.quarks.gte("ee16")
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                player.g.lastQuarks = decimalZero
                player.g.quarksGain = decimalZero
                player.g.quarks = decimalZero
                player.g.points = decimalZero
                player.g.lastElectron = decimalZero
                player.g.electronGain = decimalZero
                player.g.electron = decimalZero
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1,
        },
    },

    hotkeys: [
        {key: "p", description: "P: Reset for space", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration() { return (hasMilestone('s', 1))?0.2:0 },
})