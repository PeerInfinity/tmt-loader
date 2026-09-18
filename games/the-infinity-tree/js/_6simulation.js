addLayer("si", {
    name: "simulation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        layer: new Decimal(0),
        layerGain: new Decimal(0),
        eternity: new Decimal(0),
        pseudoUpgs: [],
    }},
    color: "#F8E165",
    nodeStyle() {return {
        "background": (player.si.unlocked || player.u.points.add(player.u.buyableSpent).gte(2))?"radial-gradient(#F8E165, #8800)":"#bf8f8f" ,
    }},
    branches: [['n', 2]],
    requires: new Decimal(2),
    resource: "simulation", // Name of prestige currency
    baseResource: "universe",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.u.points.add(player.u.buyableSpent) },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        gain = Decimal.pow(10, player.u.points.add(player.u.buyableSpent))
        if (hasUpgrade('si', 31)) gain = gain.times(Decimal.log10(player.si.points.add(10)).pow(1.3))
        return gain
    },
    getNextAt() {
        return NaN
    },
    canReset() {
        return player.u.points.add(player.u.buyableSpent).gte(2)
    },
    prestigeButtonText() {
        return "Build "+format(getResetGain(this.layer))+" simulations based off your universe."
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    doReset(resettingLayer) {
		let keep = [];
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
        if (layers[resettingLayer].row >= 5) player.si.layer = new Decimal(0);
	},

    update() {
        if (hasMilestone('si', 0)) {
            player.si.layerGain = Decimal.pow(10, Decimal.pow(2, Decimal.log10(player.si.points.add(10)))).div(20)
            if (hasUpgrade('si', 11)) player.si.layerGain = player.si.layerGain.times(Decimal.log2(player.si.layer.add(2)))

            if (player.si.layerGain.gte(new Decimal("1.79e308"))) player.si.layerGain = new Decimal("1.79e308")
            player.si.layer = player.si.layer.add(player.si.layerGain)
            if (player.si.layer.gte(new Decimal("1.79e308"))) player.si.layer = new Decimal("1.79e308")
        }  
    },

    automation() {
        if (player.si.autoEternity && hasUpgrade('si', 34) &&  player.si.layer.gte(new Decimal("1.79e308"))) {
            doReset(this.layer)
            player.si.points = decimalZero
            player.si.layer = decimalZero
            player.si.layerGain = decimalZero
            player.si.eternity = player.si.eternity.add(1)
        }
    },

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.u.points.add(player.u.buyableSpent))+" total universe" }
                ],
                ["display-text",
                    function() { return "(You need at least 2 total universe for the prestige button to work)" }, {"color": "#F8E165"}
                ], "blank",
                "milestones"
            ]
        },
        "Simulation": {
            content: [
                "main-display",
                ["display-text",
                    function() { 
                        number = format(new Decimal(10).tetrate(player.si.layer))
                        return 'You have '+number+" simulated number"
                    }, {'color': '#F8E165', 'font-size': '18px'}
                ],
                ["display-text",
                    function() { return "Current Layer: "+format(player.si.layer)+" ("+format(player.si.layerGain)+" layers/tick)" },
                ], "blank",
                ["display-text",
                    function() { return '<b>Simulations</b>' }, {"font-size": "32px", "color": "#F8E165"}
                ], "blank",
                ["row", [["upgrade", '11'], ["upgrade", '12'], ["upgrade", '13'], ["upgrade", '14']]],
                ["row", [["upgrade", '21'], ["upgrade", '22'], ["upgrade", '23'], ["upgrade", '24']]]
            ],
            unlocked() {return hasMilestone('si', 0)}
        },
        "Eternity": {
            content: [
                "main-display",
                ["display-text",
                    function() { 
                        return 'You have '+format(player.si.eternity)+" eternity"
                    }, {'color': '#F8E165', 'font-size': '18px'}
                ], "blank",
                "buyables", "blank",
                ["toggle", ["si", "autoEternity"]],
                ["display-text",
                    function() { return '(Buy \'Eternal Dilation\' to unlock the auto-buyer toggle above)' }
                ], "blank",
                ["display-text",
                    function() { return '<b>Eternal Simulations</b>' }, {"font-size": "32px", "color": "#F8E165"}
                ], "blank",
                ["row", [["upgrade", '31'], ["upgrade", '32'], ["upgrade", '33'], ["upgrade", '34']]],
                ["row", [["upgrade", '41'], ["upgrade", '42'], ["upgrade", '43'], ["upgrade", '44']]]
            ],
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
    },

    milestones: {
        0: {
            requirementDescription: "200 simulation",
            effectDescription: "Unlock a new tab.",
            done() { return player.si.points.gte(200) },
        },
        1: {
            requirementDescription: "300 simulation",
            effectDescription: "Universe formula is better.",
            done() { return player.si.points.gte(300) },
        },
        2: {
            requirementDescription: "400 simulation",
            effectDescription: "Keep Generator Upgrades, Dilation Milestones and Upgrades, and Universe Upgrades on reset.",
            done() { return player.si.points.gte(400) },
        },
        3: {
            requirementDescription: "5,000 simulation",
            effectDescription: "Unlock auto-dilation, and dilation doesn't reset anything.",
            done() { return player.si.points.gte(5000) },
        },
        4: {
            requirementDescription: "20,000 simulation",
            effectDescription: "Unlock auto-universe.",
            done() { return player.si.points.gte(20000) },
        },
        5: {
            requirementDescription: "2,000,000 simulation",
            effectDescription: "Each universe automatically give all universe buyable levels according to cost, then the universe is spent",
            done() { return player.si.points.gte(2e6) },
        },
        6: {
            requirementDescription: "1.00e11 simulation",
            effectDescription: "Gain 20% of simulation every second",
            done() { return player.si.points.gte(1e11) },
        },
    },

    upgrades: {

        //Simulated Number Upgrades

        11: {
            fullDisplay() {
                return "<b>Simulated Automation</b><br>Simulated number gain boost itself.<br><br>Cost: F1,000,000 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("1e6"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("1e6"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        12: {
            fullDisplay() {
                return "<b>Simulated Minimum</b><br>Black Hole is always higher than 1,000.<br><br>Cost: F400,000,000 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("4e8"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("4e8"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        13: {
            fullDisplay() {
                return "<b>Simulated Realities</b><br>Universe gain is boosted by simulated number if you have simulation milestone 2.<br><br>Cost: F5.00e9 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("5e9"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("5e9"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        14: {
            fullDisplay() {
                return "<b>Simulated Dilation</b><br>You gain relativity without dilation, and all dilation upgrades apply without dilating.<br><br>Cost: F1.00e13 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("1e13"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("1e13"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        21: {
            fullDisplay() {
                return "<b>Simulated Travel</b><br>You gain 2 free level on all universe buyables. (Manually respec them after buying this)<br><br>Cost: F3.00e19 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("3e19"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("3e19"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        22: {
            fullDisplay() {
                return "<b>Simulated Universes</b><br>Universe buyables cost is quartered.<br><br>Cost: F1.00e31 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("1e31"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("1e31"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        23: {
            fullDisplay() {
                return "<b>Simulated Space</b><br>Dilation upgrade 2 power is boosted by simulated number.<br><br>Cost: F1.00e43 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("1e43"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("1e43"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },
        24: {
            fullDisplay() {
                return "<b>Final Simulation</b><br>Universe buyable cost is decreased according to simulation. (Limit at x0.1)<br><br>Cost: F1.00e132 simulated number"
            },
            canAfford() {
                return player.si.layer.gte(new Decimal("1e132"))
            },
            pay() {
                return player.si.layer = player.si.layer.div(new Decimal("1e132"))
            },
            unlocked() {return hasMilestone('si', 0)}
        },

        //Eternity Upgrades

        31: {
            fullDisplay() {
                return "<b>Eternal Automation</b><br>Simulation gain is boosted by itself.<br><br>Requirement: 1.00 eternity"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("1"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
        32: {
            fullDisplay() {
                return "<b>Eternal Minimum</b><br>Universe is always higher than 5.<br><br>Requirement: 4.00 eternity"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("4"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
        33: {
            fullDisplay() {
                return "<b>Eternal Reality</b><br>Universe gain is boosted by eternity if you have simulation milestone 2 and upgrade 3.<br><br>Requirement: 10.00 eternity"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("10"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
        34: {
            fullDisplay() {
                return "<b>Eternal Dilation</b><br>Unlock auto-eternity.<br><br>Requirement: 10.00 eternity"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("10"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
        41: {
            fullDisplay() {
                return "<b>Eternal Travel</b><br>You gain free levels for universe buyables depending on simulated number.<br><br>Requirement: 200.00 eternity"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("200"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
        42: {
            fullDisplay() {
                return "<b>Eternal Universe</b><br>You gain free levels for universe buyables depending on eternity.<br><br>Requirement: 500.00 eternity & 15,000 total dark matter"
            },
            canAfford() {
                return player.si.eternity.gte(new Decimal("500")) && player.dm.points.add(player.dm.buyableSpent).gte(new Decimal("15000"))
            },
            pay() {
                return null
            },
            unlocked() {return hasMilestone('si', 0) && (player.si.layer.gte(new Decimal("1.79e308")) || player.si.eternity.gte(1))}
        },
    },

    buyables: {
        11: {
            cost(x) { 
                return decimalZero
            },
            title: "Ascension To Eternity",
            display() {
                return format(new Decimal(10).tetrate(player.si.layer))+" / F1.79e308 simulated number<br><br>Charge up all your simulated number to gain <b>1 eternity</b>.<br><br>(Reset simulation and simulated number, and perform a 'simulation' prestige.)"
            },
            canAfford() { return player.si.layer.gte(new Decimal("1.79e308")) },
            buy() {
                doReset(this.layer)
                player.si.points = decimalZero
                player.si.layer = decimalZero
                player.si.layerGain = decimalZero
                player.si.eternity = player.si.eternity.add(1)
            },
        },
    },

    hotkeys: [
        {key: "i", description: "I: Reset for simulation", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration() { return (hasMilestone('si', 6))?0.2:0 },
})