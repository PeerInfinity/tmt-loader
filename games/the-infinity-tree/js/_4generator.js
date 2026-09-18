addLayer("g", {
    name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        electron: new Decimal(0),
        electronGain: new Decimal(0),
        lastElectron: new Decimal(0),
        quarks: new Decimal(0),
        quarksGain: new Decimal(0),
        lastQuarks: new Decimal(0),
    }},
    color: "#DD3652",
    branches: ['e'],
    requires: new Decimal("ee256"),
    resource: "generator", // Name of prestige currency
    baseResource: "energy",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.e.points },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    effectDescription() { 
        if (!hasUpgrade('g', 13)) return "which are boosting nothing."
        else return "which are boosting number double exponent gain by ^"+format(Decimal.log10(player.g.points.add(10)).times(2))+"."
    },
    getResetGain() {
        mult = Decimal.pow(10, getBuyableAmount('u', 22).add(player.u.freeLevel).times(2).pow(3))
        exp = Decimal.pow(1.1, getBuyableAmount('u', 22).add(player.u.freeLevel))
        if (hasMilestone('g', 1)) {
            if (hasMilestone('g', 2)) {
                if (hasMilestone('g', 6)) {
                    mult = 1
                    if (hasUpgrade('g', 11)) {
                        if (!isNaN(Decimal.log10(player.g.quarks.add(10)).add(10))) mult = Decimal.pow(2, Decimal.log10(player.g.quarks.add(10)).add(1))
                    }
                    if (hasUpgrade('g', 12) && !player.g.points.gte(new Decimal("ee16"))) {
                        gain = Decimal.log2(Decimal.log10(Decimal.log10(player.e.points.add(10)).add(10)).times(Decimal.pow(1.8, Decimal.log10(player.sf.points.add(10)).pow(0.95))).add(2)).sub(7).add(Decimal.log2(Decimal.log10(player.g.electron.add(10)).add(2))).times(mult).times(player.g.points.root(2).add(1))
                    } else {
                        gain = Decimal.log2(Decimal.log10(Decimal.log10(player.e.points.add(10)).add(10)).times(Decimal.pow(1.8, Decimal.log10(player.sf.points.add(10)).pow(0.95))).add(2)).sub(7).add(Decimal.log2(Decimal.log10(player.g.electron.add(10)).add(2))).times(mult)
                    }
                } else {
                    gain = Decimal.log2(Decimal.log10(Decimal.log10(player.e.points.add(10)).add(10)).times(Decimal.log2(player.sf.points.add(2)).pow(1.4)).add(2)).sub(7).add(Decimal.log2(Decimal.log10(player.g.electron.add(10)).add(2)))
                }
            } else {
                gain = Decimal.log2(Decimal.log10(Decimal.log10(player.e.points.add(10)).add(10)).add(2)).sub(7).add(Decimal.log2(Decimal.log10(player.g.electron.add(10)).add(2)))
            }
        } else {
            gain = Decimal.log2(Decimal.log10(Decimal.log10(player.e.points.add(10)).add(10)).add(2)).sub(7)
        }

        if (!isNaN(gain) && gain.gte(1)) return gain.times(mult).pow(exp)
        else return decimalZero
    },
    getNextAt() {
        return NaN
    },
    canReset() {
        return getResetGain(this.layer).gte(1) && player.e.points.gte(new Decimal("ee256"))
    },
    prestigeButtonText() {
        return "Reset for +"+format(getResetGain(this.layer))+" generator"
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
 
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.e.points)+" energy" }
                ],
                ["display-text",
                    function() { 
                        return "(You need at least e1.000e256 energy for the prestige button to work)" }, {"color": "#DD3652"}
                ], "blank",
                "milestones", "blank"
            ]
        },
        "Particles": {
            content: [
                "main-display",
                ["display-text",
                    function() {
                        if (!hasMilestone('g', 6)) return 'You have '+format(player.g.electron)+" electron" 
                        else return 'You have '+format(player.g.electron)+" electron and "+format(player.g.quarks)+" quarks." 
                    }, { "font-size": "18px", "color": "#DD3652" }
                ], "blank",
                "buyables", "blank",
                "upgrades",
            ]
        },
        
    },

    doReset(resettingLayer) {
		let keep = [];
        if (hasMilestone('u', 3)) keep.push("milestones");
        if (hasMilestone('si', 2)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    update() {
        player.g.electronGain = player.g.points.times(100).pow(10)

        if (hasMilestone('g', 3)) player.g.electron = player.g.electron.add(player.g.lastElectron.div(1000))
        if (hasMilestone('g', 5)) player.g.electron = player.g.electron.add(player.g.electronGain.div(2500))
        if (hasMilestone('g', 7)) player.g.electron = player.g.electron.add(player.g.electronGain.div(10))

        static = player.g.quarks
        if (getBuyableAmount('i', 21).gte(1)) static = static.div(Decimal.log10(Decimal.log10(Decimal.log10(player.i.time.add(10)).add(10)).add(10)).pow(0.5).times(Decimal.pow(10, getBuyableAmount('i', 21).sub(1))).pow(Decimal.pow(1.1, getBuyableAmount('i', 21).sub(1))))
        gain = player.g.points.add(Decimal.log10(player.g.electron.add(10))).div(50).sub(static)

        if (gain.gte(0)) player.g.quarksGain = gain
        else player.g.quarksGain = decimalZero

        if (hasMilestone('g', 7)) player.g.quarks = player.g.quarks.add(player.g.quarksGain)
    },

    buyables: {
        11: {
            cost(x) { 
                return decimalZero
            },
            title: "Electron",
            display() {
                if (hasMilestone('g', 7)) gainDesc = "Gain is <b>Automated</b>."
                else gainDesc = "Gain <b>"+format(player.g.electronGain)+" Electron."
                return "Use your Generators to generate Electrons.<br><br>"+gainDesc+"<br><br>(Doing so reset your Generators, and perform a Generator Prestige.)<br><br>Non-Static Resource"
            },
            canAfford() { return true },
            buy() {
                player.g.lastElectron = player.g.electronGain
                player.g.electron = player.g.electron.add(player.g.electronGain)
                player.g.points = decimalZero
                doReset(this.layer)
            },
        },
        12: {
            cost(x) { 
                return decimalZero
            },
            title: "Quarks",
            display() {
                if (hasMilestone('g', 7)) gainDesc = "Gain is <b>Automated</b>."
                else gainDesc = "Gain <b>"+format(player.g.quarksGain)+" Quarks."
                return "Use your Generators to generate Quarks.<br><br>"+gainDesc+"<br><br>(Doing so reset your Generators and Electrons, and perform a Generator Prestige.)<br><br>Static Resource"
            },
            canAfford() { return true },
            buy() {
                player.g.lastQuarks = player.g.quarksGain
                player.g.quarks = player.g.quarks.add(player.g.quarksGain)
                player.g.points = decimalZero
                player.g.lastElectron = decimalZero
                player.g.electronGain = decimalZero
                player.g.electron = decimalZero
                doReset(this.layer)
            },
            unlocked() {return hasMilestone('g', 6)},
        },
    },

    milestones: {
        0: {
            requirementDescription: "1e20 Electron",
            effectDescription: "Keep energy buyables on all resets.",
            done() { return player.g.electron.gte(1e20) || hasMilestone('u', 3) }
        },
        1: {
            requirementDescription: "3 Generator",
            effectDescription: "Keep black hole upgrades and challenges on all resets, and increase generator gain by electron.",
            done() { return player.g.points.gte(3) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 0)},
        },
        2: {
            requirementDescription: "18 Generator",
            effectDescription: "Keep velocity upgrades and buyables on all resets, and increase generator gain by star shard.",
            done() { return player.g.points.gte(18) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 1)},
        },
        3: {
            requirementDescription: "1e37 Electron",
            effectDescription: "Generate electron depending on last electron gain.",
            done() { return player.g.electron.gte(1e37) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 2)},
        },
        4: {
            requirementDescription: "50 Generator",
            effectDescription: "Generate 10% of Generator and Star Fragment every second.",
            done() { return player.g.points.gte(50) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 3)},
        },
        5: {
            requirementDescription: "1e45 Electron",
            effectDescription: "Generate electron depending on current electron gain with worse effect.",
            done() { return player.g.electron.gte(1e45) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 4)},
        },
        6: {
            requirementDescription: "1e48 Electron",
            effectDescription: "Unlock Quarks, and Generator Milestone 3 is better.",
            done() { return player.g.electron.gte(1e48) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 5)},
        },
        7: {
            requirementDescription: "1e113 Electron",
            effectDescription: "Generate 1000% of Quarks, 100% of Electron, Generator and Star Fragment every second.",
            done() { return player.g.electron.gte(1e113) || hasMilestone('u', 3) },
            unlocked() {return hasMilestone('g', 6)},
        },
    },

    upgrades: {
        11: {
            fullDisplay() {
                return "<b>Nucleur Energy</b><br>Increase Generator gain by Quarks.<br><br>Cost: 5 quarks"
            },
            canAfford() {
                return player.g.quarks >= 5
            },
            pay() {
                return player.g.quarks = player.g.quarks.sub(5)
            },
            unlocked() {return hasMilestone('g', 6)}
        },
        12: {
            fullDisplay() {
                return "<b>Synergy Energy</b><br>Increase Generator gain by Generator. (Hardcap at ee16)<br><br>Cost: 30 quarks"
            },
            canAfford() {
                return player.g.quarks >= 30
            },
            pay() {
                return player.g.quarks = player.g.quarks.sub(30)
            },
            unlocked() {return hasMilestone('g', 6)}
        },
        13: {
            fullDisplay() {
                return "<b>Access Granted</b><br>Unlock Generator boost.<br><br>Cost: 1,000,000 quarks"
            },
            canAfford() {
                return player.g.quarks >= 1e6
            },
            pay() {
                return player.g.quarks = player.g.quarks.sub(1e6)
            },
            unlocked() {return hasMilestone('g', 6)}
        },
        14: {
            fullDisplay() {
                return "<b>Over And Over</b><br>Increase Star Fragment gain by Generator.<br><br>Cost: 1.00e10 quarks<br>Requirement: 1.00 total universe"
            },
            canAfford() {
                return player.g.quarks.gte(1e10) && player.u.points.add(player.u.buyableSpent).gte(1)
            },
            pay() {
                return player.g.quarks = player.g.quarks.sub(1e10)
            },
            unlocked() {return hasMilestone('g', 6)}
        },
    },

    hotkeys: [
        {key: "g", description: "G: Reset for generator", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration() { return (hasMilestone("g", 4))?1:(hasMilestone("g", 4))?0.1:0 },
    deactivated() {return player.de.ruining && player.de.disabled.gte(2)}
})