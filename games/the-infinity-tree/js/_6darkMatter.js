addLayer("dm", {
    name: "dark matter", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        buyableSpent: new Decimal(0),
        cationsEffect: new Decimal(1),
        cationsNerf: new Decimal(1),
        anionsEffect: new Decimal(1),
        anionsNerf: new Decimal(1),
    }},
    color: "#702963",
    nodeStyle() {return {
        "background": (player.dm.unlocked || player.u.points.add(player.u.buyableSpent).gte(10))?"radial-gradient(#702963, #8800)":"#bf8f8f" ,
    }},
    branches: ['sf', 'u'],
    requires: new Decimal(10),
    resource: "dark matter", // Name of prestige currency
    baseResource: "universe",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.u.points.add(player.u.buyableSpent) },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        gain = Decimal.log10(Decimal.log10(player.sf.points.add(10)).add(10)).sub(35).max(0).pow(player.u.points.add(player.u.buyableSpent).div(5))
        if (!isNaN(gain) && player.u.points.add(player.u.buyableSpent).gte(10) && gain.gte(1)) return gain
        else return decimalZero
    },
    getNextAt() {
        return NaN
    },
    canReset() {
        return player.u.points.add(player.u.buyableSpent).gte(10)
    },
    prestigeButtonText() {
        return "Demolish all the stars and light in your universe to gain "+format(getResetGain(this.layer))+" dark matter."
    },
    effectDescription() { 
        return "with "+format(player.dm.points.add(player.dm.buyableSpent))+" dark matter total."
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    doReset(resettingLayer) {
		let keep = [];
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    update() {
        if (getBuyableAmount('dm', 11).gte(1)) player.dm.cationsEffect = Decimal.pow(1000, getBuyableAmount('dm', 11))
        else player.dm.cationsEffect = decimalOne

        if (getBuyableAmount('dm', 12).gte(1)) {
            player.dm.cationsNerf = Decimal.pow(getBuyableAmount('dm', 12).add(1), 2)
            if (hasMilestone('de', 0)) player.dm.cationsNerf = Decimal.pow(10, getBuyableAmount('dm', 12).pow(2).add(1))
        }
        else player.dm.cationsNerf = decimalOne

        if (getBuyableAmount('dm', 12).gte(1)) player.dm.anionsEffect = Decimal.pow(50, getBuyableAmount('dm', 12))
        else player.dm.anionsEffect = decimalOne

        if (getBuyableAmount('dm', 11).gte(1)) player.dm.anionsNerf = Decimal.pow(getBuyableAmount('dm', 11).add(1), 1.5)
        else player.dm.anionsNerf = decimalOne
    },

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { 
                        sf = Decimal.log10(Decimal.log10(player.sf.points.add(10)).add(10)).sub(35).max(0)
                        u = player.u.points.add(player.u.buyableSpent).div(5)
                        return 'Star Fragment translate to '+format(sf)+', and universe translate to '+format(u)+'.<br>Dark matter gain is sf^u.'
                    }, {"color": "#924B85"}
                ],
                ["display-text",
                    function() { return 'You have '+format(player.sf.points)+" star fragment and "+format(player.u.points.add(player.u.buyableSpent))+" total universe" }
                ],
                ["display-text",
                    function() { return "(You need at least 10 total universe for the prestige button to work)" }, {"color": "#924B85"}
                ], "blank",
                "milestones"
            ]
        },
        "Dark Matter": {
            content: [
                "main-display",
                "buyables", "blank",
                ["display-text",
                    function() { return "Star fragment gain ^"+format(player.dm.cationsEffect.div(player.dm.cationsNerf)) }, {"color": "#00FFFF"}
                ],
                ["display-text",
                    function() { return "Space gain ^"+format(player.dm.anionsEffect.div(player.dm.anionsNerf)) }, {"color": "#FF0000"}
                ],
            ],
            unlocked() {return hasMilestone('dm', 0)}
        },
    },

    milestones: {
        0: {
            requirementDescription: "100 eternity & 2 dark matter",
            effectDescription: "Unlock a new tab.",
            done() { return player.si.eternity.gte(100) && player.dm.points.gte(2) },
        },
    },

    buyables: {
        showRespec: true,
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player.dm.points = player.dm.points.add(player.dm.buyableSpent)
            player.dm.buyableSpent = decimalZero
            setBuyableAmount(this.layer, 11, new Decimal(0))
            setBuyableAmount(this.layer, 12, new Decimal(0))
            doReset('si')
            player.si.points = decimalZero
            player.si.layer = decimalZero
            player.si.layerGain = decimalZero
        },
        respecMessage: "Are you sure you want to respec? Ascension to eternity without rewards will be forced.",
        11: {
            cost(x) { 
                return Decimal.pow(5, getBuyableAmount('dm', 11).add(getBuyableAmount('dm', 12)).add(1))
            },
            title: "Cations",
            display() {
                return "<br>Effect: Star fragment gain ^"+format(player.dm.cationsEffect)+".<br>Nerf: Anions effect /"+format(player.dm.anionsNerf)+"<br><br>Cost: "+format(player.dm.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" dark matter<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id))) 
            },
            canAfford() { return player.dm.points.gte(this.cost()) },
            buy() {
                player.dm.points = player.dm.points.sub(this.cost())
                player.dm.buyableSpent = player.dm.buyableSpent.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('si')
                player.si.points = decimalZero
                player.si.layer = decimalZero
                player.si.layerGain = decimalZero
            },
            style: {"background": function() { return "radial-gradient(#00FFFF, #A35C96)"}},
        },
        12: {
            cost(x) { 
                return Decimal.pow(5, getBuyableAmount('dm', 11).add(getBuyableAmount('dm', 12)).add(1))
            },
            title: "Anions",
            display() { return "<br>Effect: Space gain ^"+format(player.dm.anionsEffect)+".<br>Nerf: Cations effect /"+format(player.dm.cationsNerf)+".<br><br>Cost: "+format(player.dm.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" dark matter<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id))) },
            canAfford() { return player.dm.points.gte(this.cost()) },
            buy() {
                player.dm.points = player.dm.points.sub(this.cost())
                player.dm.buyableSpent = player.dm.buyableSpent.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('si')
                player.si.points = decimalZero
                player.si.layer = decimalZero
                player.si.layerGain = decimalZero
            },
            style: {"background": function() { return "radial-gradient(#FF0000, #A35C96)"}},
        },
    },

    hotkeys: [
        {key: "a", description: "A: Reset for dark matter", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
})
