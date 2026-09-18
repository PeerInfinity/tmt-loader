unlockedEnergy = 0

addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        electricity: new Decimal(0),
        buyableSpent: new Decimal(0),
    }},
    color: "#DDDD00",
    branches: ['i'],
    requires: new Decimal("1e2500"),
    resource: "energy", // Name of prestige currency
    baseResource: "time",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.i.time },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        exp = decimalOne
        if ((player.d.dilating || hasUpgrade('si', 14)) && hasUpgrade('d', 11)) exp = Decimal.log10(player.g.electron.pow(0.5).add(10))
        if (hasUpgrade('sf', 31)) {
            if (hasUpgrade('sf', 44)) {
                mult = decimalOne
                if (player.bl.points.sub(150) > 0) mult = player.bl.points.sub(150)
                return Decimal.floor(Decimal.log10(player.i.time.pow(5e-2).add(10)).times(mult)).pow(exp)
            } else {
                return Decimal.floor(Decimal.log10(player.i.time.pow(5e-2).add(10))).pow(exp)
            }
        } else {
            return Decimal.floor(Decimal.log10(player.i.time.pow(2.5e-3).add(10))).pow(exp)
        }
    },
    getNextAt() {
        exp = decimalOne
        if ((player.d.dilating || hasUpgrade('si', 14)) && hasUpgrade('d', 11)) exp = Decimal.log10(player.g.electron.pow(0.5).add(10))
        if (hasUpgrade('sf', 31)) {
            if (hasUpgrade('sf', 44)) {
                mult = decimalOne
                if (player.bl.points.sub(150) > 0) mult = player.bl.points.sub(150)
                return Decimal.pow(10, getResetGain(this.layer).add(1).div(mult)).pow(2000).root(exp)
            } else {
                return Decimal.pow(10, getResetGain(this.layer).add(1)).pow(2000).root(exp)
            }
        } else {
            return Decimal.pow(10, getResetGain(this.layer).add(1)).pow(400).root(exp)
        }
    },
    canReset() {
        return getResetGain(this.layer).gte(1) && player.i.time.gte(new Decimal("1e2500"))
    },
    prestigeButtonText() {
        if (getResetGain(this.layer) < 100) return "Reset for +"+format(getResetGain(this.layer))+" energy<br><br>"+format(player.i.time)+" / "+format(getNextAt(this.layer))+" time"
        else return "Reset for +"+format(getResetGain(this.layer))+" energy"
    },
    effectDescription() { 
        if (hasUpgrade('sf', 53)) {
            return 'which has generated '+format(player.e.electricity)+" unspent electricity<br>(Next electricity at "+format(Decimal.pow(7, player.e.electricity.add(player.e.buyableSpent).add(1)))+" energy, total "+format(player.e.electricity.add(player.e.buyableSpent))+" electricity)" 
        } else {
            return 'which has generated '+format(player.e.electricity)+" unspent electricity<br>(Next electricity at "+format(Decimal.pow(8, player.e.electricity.add(player.e.buyableSpent).add(1)))+" energy, total "+format(player.e.electricity.add(player.e.buyableSpent))+" electricity)" 
        }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return unlockedEnergy = 1},

    update() { 
        if (hasUpgrade('sf', 53)) {
            if (!isNaN(Decimal.ln(player.e.points).div(Decimal.ln(7)))) player.e.electricity = Decimal.floor(Decimal.ln(player.e.points).div(Decimal.ln(7))).sub(player.e.buyableSpent)
            else player.e.electricity = new Decimal(0)
        } else {
            if (!isNaN(Decimal.ln(player.e.points).div(Decimal.ln(8)))) player.e.electricity = Decimal.floor(Decimal.ln(player.e.points).div(Decimal.ln(8))).sub(player.e.buyableSpent)
            else player.e.electricity = new Decimal(0)
        }

        if (hasChallenge('bl', 12)) {
            unlockedEnergy = 1
        }
    },

    doReset(resettingLayer) {
        keep = []
        if (hasMilestone('sf', 2) && resettingLayer == 'sf') keep.push("buyables");
        if (hasMilestone('g', 0)) keep.push("buyables");

        if (layers[resettingLayer].row > this.row)  {
            layerDataReset(this.layer, keep);
            player.e.electricity = decimalZero
            if (!hasMilestone('sf', 2) || !resettingLayer == 'sf') player.e.buyableSpent = decimalZero
            if (!hasMilestone('sf', 2) || !resettingLayer == 'sf') setBuyableAmount(this.layer, 11, new Decimal(0))
            if (!hasMilestone('sf', 2) || !resettingLayer == 'sf') setBuyableAmount(this.layer, 12, new Decimal(0))
            player.e.points = decimalZero
            if (hasUpgrade('sf', 53)) player.e.points = new Decimal(100)
        }
    },

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.i.time)+" time" }
                ],
                ["display-text",
                    function() { return "(You need at least 1e2500 time for the prestige button to work)" }, {"color": "#DDDD00"}
                ], "blank",
                ["toggle", ["e", "auto"]],
                ["display-text",
                    function() { return '(Do a specific task to unlock the auto-buyer toggle above)' }
                ], "blank",
            ]
        },
        "Charges": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Electronic Charges</b>' }, {"font-size": "32px", "color": "#DDDD00"}
                ], "blank",
                "buyables", "blank",
            ],
        },
    },

    hotkeys: [
        {key: "e", description: "E: Reset for energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    buyables: {
        showRespec: true,
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player.e.buyableSpent = new Decimal(0)
            setBuyableAmount(this.layer, 11, new Decimal(0))
            setBuyableAmount(this.layer, 12, new Decimal(0))
        },
        respecMessage: "Are you sure you want to respec?",
        11: {
            cost(x) { 
                return Decimal.floor(player.e.buyableSpent.div(6).add(1))
            },
            title: "Primary Charge",
            display() { return "Increase Velocity Buyable 1 and 3 power.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" electricity<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/20" },
            canAfford() { return player.e.electricity.gte(this.cost()) },
            buy() {
                player.e.electricity = player.e.electricity.sub(this.cost())
                player.e.buyableSpent = player.e.buyableSpent.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 20,
        },
        12: {
            cost(x) { 
                return Decimal.floor(player.e.buyableSpent.div(6).add(1))
            },
            title: "Secondary Charge",
            display() { return "Decrease Velocity Buyable 1 and 3 cost.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" electricity<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/20" },
            canAfford() { return player.e.electricity.gte(this.cost()) },
            buy() {
                player.e.electricity = player.e.electricity.sub(this.cost())
                player.e.buyableSpent = player.e.buyableSpent.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasChallenge('bl', 21)},
            purchaseLimit: 20,
        },
    },

    autoPrestige() { return (player.e.auto && hasUpgrade('sf', 41) && hasUpgrade('sf', 42) && hasUpgrade('sf', 43) && hasUpgrade('sf', 44) && hasUpgrade('sf', 45)) },
    resetsNothing() { return hasMilestone("v", 5) },
})

