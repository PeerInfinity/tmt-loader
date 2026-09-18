addLayer("d", {
    name: "dilation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        dilating: false,
        relativity: new Decimal(0),
        relativityGain: new Decimal(0),
        dilateSpent: new Decimal(0),
    }},
    color: "#467464",
    branches: ['v', 'e'],
    requires: new Decimal("ee100"),
    resource: "dilation", // Name of prestige currency
    baseResource: "velocity",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.v.points },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        velFormula = Decimal.log10(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(10)).add(10))
        if (hasMilestone('d', 2)) velFormula = Decimal.ln(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(5)).add(10)).div(Decimal.ln(5))

        gain = Decimal.floor(velFormula.sub(1).sub(player.d.points))

        if (!isNaN(gain) && gain.gte(1)) return gain
        else return decimalZero
    },
    getNextAt() {
        nextAt = Decimal.pow(10, Decimal.pow(10, Decimal.pow(10, getResetGain(this.layer).add(2).add(player.d.points))))
        if (hasMilestone('d', 2)) nextAt = Decimal.pow(10, Decimal.pow(10, Decimal.pow(5, getResetGain(this.layer).add(2).add(player.d.points))))

        return nextAt
    },
    canReset() {
        return getResetGain(this.layer).gte(1)
    },
    prestigeButtonText() {
        return "Accerating using your Velocities gives you +"+format(getResetGain(this.layer))+" dilation<br><br>Next: "+format(player.v.points)+" / "+format(getNextAt(this.layer))+" velocity"
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    doReset(resettingLayer) {
		let keep = [];
        if (hasMilestone('si', 2)) keep.push("milestones");
        if (hasMilestone('si', 2)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    update() {
        gain = Decimal.log10(player.v.points.add(10)).times(Decimal.log10(player.e.points.add(10))).pow(0.2)
        if (hasUpgrade('d', 13)) {
            if (hasUpgrade('si', 14)) {
                if (player.d.points.gte(2)) gain = gain.pow(Decimal.log2(player.d.points.add(1)))
            } else {
                if (player.d.dilateSpent.gte(2)) gain = gain.pow(Decimal.log2(player.d.dilateSpent.add(1)))
            }
            if (hasUpgrade('si', 23)) gain = gain.pow(Decimal.log10(player.si.layer.add(10)).pow(0.6))
        }

        if (isNaN(gain)) gain = decimalZero

        if (player.d.dilating || hasUpgrade('si', 14)) player.d.relativityGain = gain
        else player.d.relativityGain = decimalZero

        if (hasMilestone('u', 5)) player.d.relativity = player.d.relativity.add(player.d.relativityGain.times(0.1))
    },
 
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.v.points)+" velocity" }
                ],
                ["display-text",
                    function() { return "(You need at least e1.000e100 velocity for the prestige button to work)" }, {"color": "#467464"}
                ], "blank",
                ["toggle", ["d", "auto"]],
                ["display-text",
                    function() { return '(Get a specific milestone to unlock the auto-buyer toggle above)' }
                ], "blank",
                "milestones", "blank"
            ]
        },
        "Dilation": {
            content: [
                "main-display",
                ["display-text",
                    function() { return 'You have '+format(player.d.relativity)+" relativity" }, {'color': '#FF0000', 'font-size': '18px'}
                ], "blank",
                ["display-text",
                    function() { return 'DILATION EFFECTS:<br>1. Infinity and Machine multiplier always stays at 1<br>2. Number double exponential gain exponent boost always stays at 1<br>3. Velocity Upgrade 5 is useless<br>4. 5th Row and 1st Column of Star Fragments Completions are useless.<br>5. Starting at 1e1.000e10, velocity double exponential growth is single exponential.' }
                ], "blank",
                "buyables", "blank",
                "upgrades", "blank"
            ],
            unlocked() {return hasMilestone('d', 0)}
        },
    },

    milestones: {
        0: {
            requirementDescription: "1e20 space & 1 dilation",
            effectDescription: "Unlock a new tab.",
            done() { return player.s.points.gte(1e20) && player.d.points.gte(1) }
        },
        1: {
            requirementDescription: "100 relativity gain",
            effectDescription: "Keep infinity buyables on all resets.",
            done() { return player.d.relativityGain.gte(100) }
        },
        2: {
            requirementDescription: "300,000 relativity",
            effectDescription: "Make the dilation formula better.",
            done() { return player.d.relativity.gte(300000) }
        },
    },

    buyables: {
        11: {
            cost(x) { 
                return decimalZero
            },
            display() {
                dilationGain = "Gaining <b>"+format(player.d.relativityGain)+" relativity</b> after ending this dilation. (According to velocity and energy)<br><br>"
                dilationDesc = "(Dilating perform a 'star fragment', 'generators' and 'space' reset)"
                cost = decimalOne
                if (hasUpgrade('d', 13)) cost = player.d.points
                if (!(cost.gte(1))) cost = decimalOne

                multiBuy = ""
                if (hasUpgrade('d', 13) && cost.gte(2)) multiBuy = " (Multi-Buy)"

                if (!player.d.dilating) {
                    return "<b>START TIME DILATION</b><br>Cost: "+format(cost)+multiBuy+" dilation<br><br>"+dilationGain+dilationDesc
                } else {
                    if (hasUpgrade('d', 13)) {
                        return "<b>END TIME DILATION</b><br>Spent: "+format(player.d.dilateSpent)+" dilation<br><br>"+dilationGain+dilationDesc
                    } else {
                        return "<b>END TIME DILATION</b><br><br>"+dilationGain+dilationDesc
                    }
                }
            },
            canAfford() { return true },
            buy() {
                if (player.d.dilating) {
                    player.d.relativity = player.d.relativity.add(player.d.relativityGain)
                } else {
                    if (!hasUpgrade('d', 13)) {
                        if (player.d.points.gte(1)) player.d.points = player.d.points.sub(1)
                        else return
                    } else {
                        if (player.d.points.gte(1)) {
                            player.d.points = player.d.points.sub(cost) 
                            player.d.dilateSpent = cost
                        }
                        else return
                    }
                    doReset('sf')
                    doReset('g')
                    doReset('s')
                }
                player.d.dilating = !player.d.dilating
            },
        },
    },

    upgrades: {
        11: {
            fullDisplay() {
                return "<b>Transisters</b><br>When dilating, energy gain is boosted by electrons.<br><br>Cost: 100 relativity"
            },
            canAfford() {
                return player.d.relativity.gte(new Decimal("100"))
            },
            pay() {
                return player.d.relativity = player.d.relativity.div(new Decimal("100"))
            },
        },
        12: {
            fullDisplay() {
                return "<b>Space Terminal</b><br>When dilating, space gain is boosted by relativity gain.<br><br>Cost: 20,000 relativity"
            },
            canAfford() {
                return player.d.relativity.gte(new Decimal("20,000"))
            },
            pay() {                       
                return player.d.relativity = player.d.relativity.div(new Decimal("20,000"))
            },
        },
        13: {
            fullDisplay() {
                return "<b>Time Warp</b><br>You can spend more than 1 dilation on a time dilation, leading to more relativity gain.<br><br>Cost: 400,000 relativity"
            },
            canAfford() {
                return player.d.relativity.gte(new Decimal("400,000"))
            },
            pay() {
                return player.d.relativity = player.d.relativity.div(new Decimal("400,000"))
            },
        },
    },

    hotkeys: [
        {key: "d", description: "D: Reset for dilation", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    autoPrestige() { return player.d.auto && hasMilestone('si', 3) },
    resetsNothing() { return hasMilestone('si', 3) },
})