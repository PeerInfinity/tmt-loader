unlocked = false

addLayer("u", {
    name: "universe", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        buyableSpent: new Decimal(0),
        freeLevel: new Decimal(0),
        buyableCost() {
            cost = decimalOne
            if (hasUpgrade('si', 22)) cost = cost.div(4)
            if (hasUpgrade('si', 24)) cost = cost.div(Decimal.min(10, Decimal.floor(Decimal.pow(2, Decimal.log10(player.si.points.div(1e5).add(10))))))
            return cost
        },
    }},
    color: "#534FE7",
    nodeStyle() {return {
        "background": (player.u.unlocked || player.s.points.gte(1e26))?"radial-gradient(#0000FF, #A020F0)":"#bf8f8f" ,
    }},
    branches: ['sf', 's', 'd', 'g'],
    requires: new Decimal(1e26),
    resource: "universe", // Name of prestige currency
    baseResource: "space",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.s.points },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    effectDescription() { 
        return "with "+format(player.u.points.add(player.u.buyableSpent))+" universes total."
    },
    getResetGain(canMax) {
        if (hasMilestone('si', 1)) {
            if (hasUpgrade('si', 13)) {
                if (hasUpgrade('si', 33)) {
                    gain = Decimal.floor(Decimal.ln(Decimal.log10(player.s.points.add(10)).times(Decimal.log2(player.si.layer.add(2))).times(player.si.eternity.pow(2)).add(20)).div(Decimal.ln(20))).sub(player.u.points).sub(player.u.buyableSpent)
                } else {
                    gain = Decimal.floor(Decimal.ln(Decimal.log10(player.s.points.add(10)).times(Decimal.log2(player.si.layer.add(2))).add(20)).div(Decimal.ln(20))).sub(player.u.points).sub(player.u.buyableSpent)
                }
            } else {
                gain = Decimal.floor(Decimal.ln(Decimal.log10(player.s.points.add(10)).add(20)).div(Decimal.ln(20))).sub(player.u.points).sub(player.u.buyableSpent)
            }
        } else {
            gain = Decimal.floor(Decimal.ln(Decimal.log10(player.s.points.add(10)).add(26)).div(Decimal.ln(26))).sub(player.u.points).sub(player.u.buyableSpent)
        }
        if (!isNaN(gain) && gain.gte(1) && player.s.points.gte(1e26)) return gain.max(1)
        else return decimalZero
    },
    getNextAt(canMax) {
        resetGain = getResetGain(this.layer).add(1).min(1)
        if (canMax) resetGain = getResetGain(this.layer).add(1)
        
        if (hasMilestone('si', 1)) {
            if (hasUpgrade('si', 13)) {
                if (hasUpgrade('si', 33)) {
                    nextAt = Decimal.pow(10, Decimal.pow(20, resetGain.add(player.u.points).add(player.u.buyableSpent)).div(Decimal.log2(player.si.layer.add(2))).div(player.si.eternity.pow(2)))
                } else {
                    nextAt = Decimal.pow(10, Decimal.pow(20, resetGain.add(player.u.points).add(player.u.buyableSpent)).div(Decimal.log2(player.si.layer.add(2))))
                }
            } else {
                nextAt = Decimal.pow(10, Decimal.pow(20, resetGain.add(player.u.points).add(player.u.buyableSpent)))
            }
        } else {
            nextAt = Decimal.pow(10, Decimal.pow(26, resetGain.add(player.u.points).add(player.u.buyableSpent)))
        }
        return nextAt
    },
    canReset() {
        return getResetGain(this.layer).gte(1)
    },
    prestigeButtonText() {
        if (player.u.points.add(player.u.buyableSpent).gte(10) || player.dm.total.gte(1) || hasUpgrade('si', 34)) return "Sacrifise your space to gain "+format(getResetGain(this.layer))+" universe<br><br>Current Space: "+format(player.s.points)
        else return "Sacrifise your space to gain "+format(getResetGain(this.layer))+" universe<br><br>Next: "+format(player.s.points)+" / "+format(getNextAt(this.layer))+" space"
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    update() {
        if (player.u.points.add(player.u.buyableSpent).gte(1)) {
            unlocked = true
        }

        if (hasUpgrade('si', 32) && !player.u.points.add(player.u.buyableSpent).gte(6)) player.u.points = new Decimal(6).sub(player.u.buyableSpent)

        lvlTmp = decimalZero
        if (hasUpgrade('si', 21)) {
            lvlTmp = new Decimal(2)
            if (hasUpgrade('si', 41)) {
                lvlTmp = Decimal.log10(player.si.layer.add(10)).add(2)
                if (hasUpgrade('si', 41)) {
                    lvlTmp = player.si.eternity.add(Decimal.log10(player.si.layer.add(10))).add(2)
                }
            }
        }  
        player.u.freeLevel = lvlTmp
    },

    automation() {
        if (player.u.points.gte(player.u.buyableCost())) {
            player.u.points = player.u.points.sub(player.u.buyableCost())
            player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
            if (!getBuyableAmount('u', 11).gte(750)) setBuyableAmount('u', 11, getBuyableAmount('u', 11).add(1))
            if (!getBuyableAmount('u', 12).gte(750)) setBuyableAmount('u', 12, getBuyableAmount('u', 11).add(1))
            if (!getBuyableAmount('u', 13).gte(750)) setBuyableAmount('u', 13, getBuyableAmount('u', 11).add(1))
            if (!getBuyableAmount('u', 21).gte(750)) setBuyableAmount('u', 21, getBuyableAmount('u', 11).add(1))
            if (!getBuyableAmount('u', 22).gte(750)) setBuyableAmount('u', 22, getBuyableAmount('u', 11).add(1))
        }
    },

    doReset(resettingLayer) {
		let keep = ["milestones"];
        if (hasMilestone('si', 2)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) {
            layerDataReset(this.layer, keep);
        }
	},
 
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.s.points)+" space" }
                ], 
                ["display-text",
                    function() { return "(You need at least 1.00e26 space for the prestige button to work)" }, {"color": "#534FE7"}
                ], "blank",
                ["toggle", ["u", "auto"]],
                ["display-text",
                    function() { return '(Get a specific milestone to unlock the auto-buyer toggle above)' }
                ], "blank",
                "milestones", "blank"
            ]
        },
        "Exploration": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Alternative Universes</b>' }, {"font-size": "32px", "color": "#534FE7"}
                ],
                ["display-text",
                    function() { return 'The \'Sell All\' button buys max of that buyable.' }
                ], "blank",
                "buyables", "blank",
                "upgrades",
            ]
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 velocity",
            effectDescription: "Get all velocity milestones and keep them on reset, and unlock auto-velocity early.",
            done() { return player.v.points.gte(1) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
        1: {
            requirementDescription: "1 black hole",
            effectDescription: "Get all black hole milestones and keep them on reset, and unlock auto-velocity early.",
            done() { return player.bl.points.gte(1) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
        2: {
            requirementDescription: "1 star fragment",
            effectDescription: "Get all star fragment milestones, make all non-missing upgrades affordable and keep them on reset.",
            done() { return player.sf.points.gte(1) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
        3: {
            requirementDescription: "1 electron",
            effectDescription: "Get all generators milestones and keep them on reset.",
            done() { return player.g.electron.gte(1) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
        4: {
            requirementDescription: "1 space",
            effectDescription: "Get all space milestones and keep them on reset, and space boost is 100x better",
            done() { return player.sf.points.gte(1) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
        5: {
            requirementDescription: "1e100 relativity gain",
            effectDescription: "Gain relativity depending on relativity gain.",
            done() { return player.d.relativityGain.gte(1e100) && player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() {return player.u.points.add(player.u.buyableSpent).gte(1)}
        },
    },

    buyables: {
        showRespec: true,
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player.u.points = player.u.points.add(player.u.buyableSpent)
            player.u.buyableSpent = new Decimal(0)
            setBuyableAmount('u', 11, decimalZero)
            setBuyableAmount('u', 12, decimalZero)
            setBuyableAmount('u', 13, decimalZero)
            setBuyableAmount('u', 21, decimalZero)
            setBuyableAmount('u', 22, decimalZero)
        },
        respecMessage: "Are you sure you want to respec?",
        11: {
            cost(x) { return player.u.buyableCost() },
            title: "The Reality",
            display() { return "<b>[NUMBER BOOSTER]</b><br><br>Multiply gain and exponent exponential gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id).pow(1.5)))+", and exponent double exponential gain by "+format(Decimal.pow(2, getBuyableAmount(this.layer, this.id)))+".<br><br>Cost: "+format(player.u.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" universe<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/750 (+"+format(player.u.freeLevel)+")" },
            canAfford() { return player.u.points.gte(this.cost()) },
            buy() {
                player.u.points = player.u.points.sub(player.u.buyableCost())
                player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {"background": function() { return "radial-gradient(#4BDC13, #534FE7)"}},
            sellAll() {
                while (player.u.points.gte(player.u.buyableCost())) {
                    player.u.points = player.u.points.sub(player.u.buyableCost())
                    player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit: 750,
        },
        12: {
            cost(x) { return player.u.buyableCost() },
            title: "Distant Universe",
            display() { return "<b>[INFINITY BOOSTER]</b><br><br>Multiply gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id).times(2).pow(3)))+", exponent gain by "+format(Decimal.pow(1.2, getBuyableAmount(this.layer, this.id)))+", and exponent time gain by "+format(Decimal.pow(2, getBuyableAmount(this.layer, this.id)))+".<br><br>Cost: "+format(player.u.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" universe<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/750 (+"+format(player.u.freeLevel)+")" },
            canAfford() { return player.u.points.gte(this.cost()) },
            buy() {
                player.u.points = player.u.points.sub(player.u.buyableCost())
                player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {"background": function() { return "radial-gradient(#FF00FF, #534FE7)"}},
            sellAll() {
                while (player.u.points.gte(player.u.buyableCost())) {
                    player.u.points = player.u.points.sub(player.u.buyableCost())
                    player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit: 750,
        },
        13: {
            cost(x) { return player.u.buyableCost() },
            title: "Mutation Universe",
            display() { return "<b>[VELOCITY BOOSTER]</b><br><br>Multiply gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id).times(2).pow(3)))+", exponent gain by "+format(Decimal.pow(1.2, getBuyableAmount(this.layer, this.id)))+", and exponent double exponential gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id)))+".<br><br>Cost: "+format(player.u.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" universe<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/750 (+"+format(player.u.freeLevel)+")" },
            canAfford() { return player.u.points.gte(this.cost()) },
            buy() {
                player.u.points = player.u.points.sub(player.u.buyableCost())
                player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade('u', 11)},
            style: {"background": function() { return "radial-gradient(#BBBB00, #534FE7)"}},
            sellAll() {
                while (player.u.points.gte(player.u.buyableCost())) {
                    player.u.points = player.u.points.sub(player.u.buyableCost())
                    player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit: 750,
        },
        21: {
            cost(x) { return player.u.buyableCost() },
            title: "Fragmentation Universe",
            display() { return "<b>[STAR FRAGMENT BOOSTER]</b><br><br>Multiply gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id).times(2).pow(3)))+", exponent gain by "+format(Decimal.pow(1.1, getBuyableAmount(this.layer, this.id)))+".<br><br>Cost: "+format(player.u.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" universe<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/750 (+"+format(player.u.freeLevel)+")" },
            canAfford() { return player.u.points.gte(this.cost()) },
            buy() {
                player.u.points = player.u.points.sub(player.u.buyableCost())
                player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade('u', 12)},
            style: {"background": function() { return "radial-gradient(#419292, #534FE7)"}},
            sellAll() {
                while (player.u.points.gte(player.u.buyableCost())) {
                    player.u.points = player.u.points.sub(player.u.buyableCost())
                    player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit: 750,
        },
        22: {
            cost(x) { return player.u.buyableCost() },
            title: "Production Universe",
            display() { return "<b>[GENERATOR BOOSTER]</b><br><br>Multiply gain by "+format(Decimal.pow(10, getBuyableAmount(this.layer, this.id).times(2).pow(3)))+", exponent gain by "+format(Decimal.pow(1.1, getBuyableAmount(this.layer, this.id)))+".<br><br>Cost: "+format(player.u.points)+" / "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" universe<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/750 (+"+format(player.u.freeLevel)+")" },
            canAfford() { return player.u.points.gte(this.cost()) },
            buy() {
                player.u.points = player.u.points.sub(player.u.buyableCost())
                player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade('u', 13)},
            style: {"background": function() { return "radial-gradient(#DD3652, #534FE7)"}},
            sellAll() {
                while (player.u.points.gte(player.u.buyableCost())) {
                    player.u.points = player.u.points.sub(player.u.buyableCost())
                    player.u.buyableSpent = player.u.buyableSpent.add(player.u.buyableCost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit: 750,
        },
    },

    upgrades: {
        11: {
            fullDisplay() {
                return "Unlock Mutation Universe.<br><br>Cost: 1.00e25 velocity"
            },
            canAfford() {
                return player.v.points.gte(new Decimal("e25"))
            },
            pay() {
                return player.v.points = player.v.points.div(new Decimal("e25"))
            },
        },
        12: {
            fullDisplay() {
                return "Unlock Fragmentation Universe.<br><br>Cost: 100 star fragment"
            },
            canAfford() {
                return player.sf.points.gte(new Decimal("100"))
            },
            pay() {
                return player.sf.points = player.sf.points.div(new Decimal("100"))
            },
        },
        13: {
            fullDisplay() {
                return "Unlock Production Universe.<br><br>Cost: 1.00e10 generators"
            },
            canAfford() {
                return player.g.points.gte(new Decimal("1e10"))
            },
            pay() {
                return player.g.points = player.g.points.div(new Decimal("1e10"))
            },
        },
    },

    hotkeys: [
        {key: "u", description: "U: Reset for universe", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    autoPrestige() { return (player.u.auto && hasMilestone("si", 4)) },
})