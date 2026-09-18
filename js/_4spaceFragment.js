unlockSF = 0

addLayer("sf", {
    name: "space fragment", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        timeSpent: new Decimal(0),
    }},
    branches: ['v'],
    color: "#419292",
    requires: new Decimal(1e270),
    resource: "space fragment", // Name of prestige currency
    baseResource: "velocity", 
    baseAmount() { return player.v.points },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return unlockSF = 1},

    hotkeys: [
        {key: "s", description: "S: Reset for star fragments", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    update(diff) {
        if (hasUpgrade('v', 31)) {
            unlockSF = 1
        }

        player.sf.timeSpent = player.sf.timeSpent.add(diff)
    },

    getResetGain() {
        mult = Decimal.pow(10, getBuyableAmount('u', 21).add(player.u.freeLevel).times(2).pow(3))
        exp = Decimal.pow(1.1, getBuyableAmount('u', 21).add(player.u.freeLevel))
        exp = exp.times(player.dm.cationsEffect.div(player.dm.cationsNerf))
        if (player.v.points < 1e270) {
            return new Decimal(0)
        } else {
            if (hasUpgrade('sf', 11) && hasUpgrade('sf', 21) && hasUpgrade('sf', 31) && hasUpgrade('sf', 41) && hasUpgrade('sf', 51)) {
                if (hasUpgrade('sf', 12) && hasUpgrade('sf', 22) && hasUpgrade('sf', 32) && hasUpgrade('sf', 42) && hasUpgrade('sf', 52)) {
                    if (hasUpgrade('sf', 11) && hasUpgrade('sf', 12) && hasUpgrade('sf', 13) && hasUpgrade('sf', 14) && hasUpgrade('sf', 15)) {
                        if (hasUpgrade('g', 14)) {
                            return Decimal.log2(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(10)).add(2)).times(Decimal.log2(player.sf.points.add(2))).times(Decimal.log10(Decimal.log10(Decimal.log10(player.i.time.add(10)).add(10)).add(10))).times(player.g.points.pow(0.5).add(1)).pow(Decimal.min(Decimal.log2(player.sf.timeSpent.div(10).add(2)), 5)).add(1).times(mult).pow(exp)
                        } else {
                            return Decimal.log2(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(10)).add(2)).times(Decimal.log2(player.sf.points.add(2))).times(Decimal.log10(Decimal.log10(Decimal.log10(player.i.time.add(10)).add(10)).add(10))).pow(Decimal.min(Decimal.log2(player.sf.timeSpent.div(10).add(2)), 5)).add(1).times(mult).pow(exp)
                        }
                    } else {
                        return Decimal.log2(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(10)).add(2)).times(Decimal.log2(player.sf.points.add(2))).times(Decimal.log10(Decimal.log10(Decimal.log10(player.i.time.add(10)).add(10)).add(10))).add(1).times(mult).pow(exp)
                    }
                } else {
                    return Decimal.log2(Decimal.log10(Decimal.log10(player.v.points.add(10)).add(10)).add(2)).add(1).times(mult).pow(exp)
                }
            } else {
                return new Decimal(1).times(mult).pow(exp)
            }
        }
    },
    getNextAt() {
        return NaN
    },
    canReset() {
        return getResetGain(this.layer) > 0
    },
    prestigeButtonText() {
        return "Reset for +"+format(getResetGain(this.layer))+" space fragments"
    },

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.v.points)+" velocity" }
                ], "blank", 
                "milestones", "blank",
            ]
        },
        "Fragments": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Fragment Descoveries</b>' }, {"font-size": "32px", "color": "#419292"}
                ], "blank",
                ["display-text",
                    function() { if (hasMilestone('sf', 2)) return '(All missing fragments divide your currency by the cost instead of subtracting!)' }, {"font-size": "20px", "color": "#FF0000"}
                ], "blank",
                ["display-text",
                    function() { return 'FRAGMENT COMPLETION:<br>1. Keep Velocity and Black Hole Milestones on all resets, and unlock more milestones.<br>2. Start with 100 velocity and energy for all row 4 resets.<br>3. Electricity cost multiplier is lowered.<br>4. Time and Number ^10, and Velocity Upgrade 5 is better.' }
                ], "blank",
                "upgrades",
            ],
            unlocked() {return hasMilestone('sf', 0)}
        },
        "Completions": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Fragment Completions</b>' }, {"font-size": "32px", "color": "#419292"}
                ], "blank",
                ["display-text",
                    function() { return 'Buy all upgrades in a row/column to unlock more boosts. (Excluding 3rd row/column)' }, {"font-size": "20px", "color": "#FF0000"}
                ], "blank",
                ["infobox", "row1"],
                ["infobox", "row2"],
                ["infobox", "row4"],
                ["infobox", "row5"],
                ["infobox", "column1"],
                ["infobox", "column2"],
                ["infobox", "column4"],
                ["infobox", "column5"],
            ],
            unlocked() {return hasUpgrade('sf', 31) && hasUpgrade('sf', 42) && hasUpgrade('sf', 53) && hasUpgrade('sf', 44) && hasUpgrade('sf', 35)}
        },
    },

    doReset(resettingLayer) {
		let keep = [];
        if (hasMilestone('u', 2)) keep.push("milestones");
        if (hasMilestone('u', 2)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    milestones: {
        0: {
            requirementDescription: "1 space fragment",
            effectDescription: "Unlock a new tab, exponential growth without the 1st number upgrade, and keep the number limit broken on all resets.",
            done() { return player.sf.points.gte(1) || hasMilestone('u', 2) }
        },
        1: {
            requirementDescription: "2 space fragment",
            effectDescription: "Keep black hole challenges and velocity buyable on reset.",
            done() { return player.sf.points.gte(2) || hasMilestone('u', 2) },
            unlocked() {return hasUpgrade('sf', 53) || hasMilestone('u', 2)}
        },
        2: {
            requirementDescription: "3 space fragment",
            effectDescription: "Unlock Missing Star Fragment Upgrades and a new tab.",
            done() { return player.sf.points.gte(3) || hasMilestone('u', 2) },
            unlocked() {return hasUpgrade('sf', 53) || hasMilestone('u', 2)}
        },
        3: {
            requirementDescription: "5 space fragment",
            effectDescription: "Keep black hole upgrades, velocity upgrades and energy buyables on reset.",
            done() { return player.sf.points.gte(5) || hasMilestone('u', 2) },
            unlocked() {return hasUpgrade('sf', 53) || hasMilestone('u', 2)}
        },
    },

    upgrades: {
        rows: 5,
		cols: 5,
        11: {
            fullDisplay() {
                return "<b>Missing Fragment N-11</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e50 number"
            },
            canAfford() {
                return player.points.gte(new Decimal("ee50"))
            },
            pay() {
                return player.points = player.points.div(new Decimal("ee50"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        12: {
            fullDisplay() {
                return "<b>Missing Fragment N-12</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e100 number"
            },
            canAfford() {
                return player.points.gte(new Decimal("ee100"))
            },
            pay() {
                return player.points = player.points.div(new Decimal("ee100"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        13: {
            fullDisplay() {
                return "<b>Simple Boost</b><br>Infinity boost x10, which is not affected by cap.<br><br>Cost: 1e20 number"
            },
            canAfford() {
                return player.points >= 1e20 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.points = player.points.div(1e20)
            },
            unlocked() {return hasMilestone('sf', 0)}
        },
        14: {
            fullDisplay() {
                return "<b>Missing Fragment N-14</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e200 number"
            },
            canAfford() {
                return player.points.gte(new Decimal("ee200"))
            },
            pay() {
                return player.points = player.points.div(new Decimal("ee200"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        15: {
            fullDisplay() {
                return "<b>Missing Fragment N-15</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e2,000 number"
            },
            canAfford() {
                return player.points.gte(new Decimal("ee2000"))
            },
            pay() {
                return player.points = player.points.div(new Decimal("ee2000"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        21: {
            fullDisplay() {
                return "<b>Missing Fragment I-21</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e50 infinity"
            },
            canAfford() {
                return player.i.points.gte(new Decimal("ee50"))
            },
            pay() {
                return player.i.points = player.i.points.div(new Decimal("ee50"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        22: {
            fullDisplay() {
                return "<b>More Infinities</b><br>Infinity gain x1,000,000<br><br>Cost: 100,000 infinity"
            },
            canAfford() {
                return player.i.points >= 1e5 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.i.points = player.i.points.sub(1e5)
            },
            unlocked() {return hasUpgrade('sf', 23)}
        },
        23: {
            fullDisplay() {
                return "<b>Small Yet Immediate</b><br>Infinity gain x1,000<br><br>Cost: 1 infinity"
            },
            canAfford() {
                return player.i.points >= 1 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.i.points = player.i.points.sub(1)
            },
            unlocked() {return hasUpgrade('sf', 13)}
        },
        24: {
            fullDisplay() {
                return "<b>Early Machines</b><br>Machine gain x7<br><br>Cost: 1.00e20 infinity"
            },
            canAfford() {
                return player.i.points >= 1e20 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.i.points = player.i.points.sub(1e20)
            },
            unlocked() {return hasUpgrade('sf', 23)}
        },
        25: {
            fullDisplay() {
                return "<b>Missing Fragment T-25</b><br>This is solely for fragment progression.<br><br>Cost: e1.000e300 time"
            },
            canAfford() {
                return player.i.time.gte(new Decimal("ee300"))
            },
            pay() {
                return player.i.time = player.i.time.div(new Decimal("ee300"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        31: {
            fullDisplay() {
                return "<b>Energy Specify</b><br>Make the energy formula better.<br><br>Cost: 1,000,000 energy"
            },
            canAfford() {
                return player.e.points >= 1e6 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.e.points = player.e.points.sub(1e6)
            },
            unlocked() {return hasUpgrade('sf', 32)}
        },
        32: {
            fullDisplay() {
                return "<b>Time Warping</b><br>Velocity Milestone 4 is x5e295 better.<br><br>Cost: 3 velocity"
            },
            canAfford() {
                return player.v.points >= 3 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(3)
            },
            unlocked() {return hasUpgrade('sf', 33) && hasUpgrade('sf', 22)}
        },
        33: {
            fullDisplay() {
                return "<b>Starting Resources</b><br>Infinity gain x1e40, Time gain x1,000 and Unlock Velocity Milestones 1-4 automatically.<br><br>Cost: 1.00e40 infinity"
            },
            canAfford() {
                return player.i.points >= 1e20 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.i.points = player.i.points.sub(1e20)
            },
            unlocked() {return hasUpgrade('sf', 23)}
        },
        34: {
            fullDisplay() {
                return "<b>Speedy Automation</b><br>Unlock auto-velocity, also time gain ^1.2.<br><br>Cost: 100 velocity"
            },
            canAfford() {
                return player.v.points >= 15 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(15)
            },
            unlocked() {return hasUpgrade('sf', 33) && hasUpgrade('sf', 24)}
        },
        35: {
            fullDisplay() {
                return "<b>Dependent Generation</b><br>When online, generate velocity according to last velocity reset gain.<br><br>Cost: 1.00e9 velocity"
            },
            canAfford() {
                return player.v.points >= 1e9 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(1e9)
            },
            unlocked() {return hasUpgrade('sf', 34)}
        },
        41: {
            fullDisplay() {
                return "<b>Missing Fragment V-41</b><br>This is solely for fragment progression.<br><br>Cost: 1.00e320 velocity"
            },
            canAfford() {
                return player.v.points.gte(new Decimal("1e320"))
            },
            pay() {
                return player.v.points = player.v.points.div(new Decimal("1e320"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        42: {
            fullDisplay() {
                return "<b>Advanced Formula</b><br>Unlock Black Hole Milestones automatically, and makes Velocity Buyable 2 better.<br><br>Cost: 2,000,000 velocity"
            },
            canAfford() {
                return player.v.points >= 2e6 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(2e6)
            },
            unlocked() {return hasUpgrade('sf', 43) && hasUpgrade('sf', 32)}
        },
        43: {
            fullDisplay() {
                return "<b>White Holes</b><br>Infinity gain x1e2000, and each Black Hole Challenge gives a ^2 boost to Number gain.<br><br>Cost: 200,000 velocity"
            },
            canAfford() {
                return player.v.points >= 200000 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(200000)
            },
            unlocked() {return hasUpgrade('sf', 33)}
        },
        44: {
            fullDisplay() {
                return "<b>Wormholes Connection</b><br>Increase Energy gain by Black Hole if you have 'Energy Specify'.<br><br>Cost: 180 black hole"
            },
            canAfford() {
                return player.bl.points >= 180 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.bl.points = player.bl.points.sub(180)
            },
            unlocked() {return hasUpgrade('sf', 43) && hasUpgrade('sf', 34)}
        },
        45: {
            fullDisplay() {
                return "<b>Missing Fragment V-45</b><br>This is solely for fragment progression.<br><br>Cost: 1.00e500 velocity"
            },
            canAfford() {
                return player.v.points.gte(new Decimal("1e500"))
            },
            pay() {
                return player.v.points = player.v.points.div(new Decimal("1e500"))
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        51: {
            fullDisplay() {
                return "<b>Missing Fragment S-51</b><br>This is solely for fragment progression.<br><br>Cost: 10 star fragment"
            },
            canAfford() {
                return player.sf.points.gte(10)
            },
            pay() {
                return player.sf.points = player.sf.points.div(20)
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        52: {
            fullDisplay() {
                return "<b>Missing Fragment S-52</b><br>This is solely for fragment progression.<br><br>Cost: 50 star fragment"
            },
            canAfford() {
                return player.sf.points.gte(50)
            },
            pay() {
                return player.sf.points = player.sf.points.div(50)
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        53: {
            fullDisplay() {
                return "<b>FRAGMENT COMPLETION</b><br>Finish the fragment.<br><br>Cost: 1.00e200 velocity"
            },
            canAfford() {
                return player.v.points >= 1e200 || hasMilestone('u', 2)
            },
            pay() {
                if (!hasMilestone('u', 2)) return player.v.points = player.v.points.sub(1e200)
            },
            unlocked() {return hasUpgrade('sf', 33)}
        },
        54: {
            fullDisplay() {
                return "<b>Missing Fragment S-54</b><br>This is solely for fragment progression.<br><br>Cost: 1,000 star fragment"
            },
            canAfford() {
                return player.sf.points.gte(1000)
            },
            pay() {
                return player.sf.points = player.sf.points.div(1000)
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
        55: {
            fullDisplay() {
                return "<b>Missing Fragment S-55</b><br>This is solely for fragment progression.<br><br>Cost: 10,000 star fragment"
            },
            canAfford() {
                return player.sf.points.gte(10000)
            },
            pay() {
                return player.sf.points = player.sf.points.div(10000)
            },
            unlocked() {return hasMilestone('sf', 2)}
        },
    },

    infoboxes: {
        row1: {
            title: "Row 1 Completion",
            body() { return "The longer you wait, the better the star fragment boosts with a limit." },
            unlocked() {return hasUpgrade('sf', 11) && hasUpgrade('sf', 12) && hasUpgrade('sf', 13) && hasUpgrade('sf', 14) && hasUpgrade('sf', 15)}
        },
        row2: {
            title: "Row 2 Completion",
            body() { return "Number grow double exponentially." },
            unlocked() {return hasUpgrade('sf', 21) && hasUpgrade('sf', 22) && hasUpgrade('sf', 23) && hasUpgrade('sf', 24) && hasUpgrade('sf', 25)}
        },
        row4: {
            title: "Row 4 Completion",
            body() { return "Velocity grow double exponentially when online, and unlock auto-energy." },
            unlocked() {return hasUpgrade('sf', 41) && hasUpgrade('sf', 42) && hasUpgrade('sf', 43) && hasUpgrade('sf', 44) && hasUpgrade('sf', 45)}
        },
        row5: {
            title: "Row 5 Completion",
            body() { return "Increase number double exponential gain by star fragment." },
            unlocked() {return hasUpgrade('sf', 51) && hasUpgrade('sf', 52) && hasUpgrade('sf', 53) && hasUpgrade('sf', 54) && hasUpgrade('sf', 55)}
        },
        column1: {
            title: "Column 1 Completion",
            body() { return "You can get more than 1 space fragment per reset." },
            unlocked() {return hasUpgrade('sf', 11) && hasUpgrade('sf', 21) && hasUpgrade('sf', 31) && hasUpgrade('sf', 41) && hasUpgrade('sf', 51)}
        },
        column2: {
            title: "Column 2 Completion",
            body() { return "Increase space fragment gain by space fragment and time." },
            unlocked() {return hasUpgrade('sf', 12) && hasUpgrade('sf', 22) && hasUpgrade('sf', 32) && hasUpgrade('sf', 42) && hasUpgrade('sf', 52)}
        },
        column4: {
            title: "Column 4 Completion",
            body() { return "Increase number double exponential gain by machine and black hole." },
            unlocked() {return hasUpgrade('sf', 14) && hasUpgrade('sf', 24) && hasUpgrade('sf', 34) && hasUpgrade('sf', 44) && hasUpgrade('sf', 54)}
        },
        column5: {
            title: "Column 5 Completion",
            body() { return "Generate machine depending on star fragment." },
            unlocked() {return hasUpgrade('sf', 15) && hasUpgrade('sf', 25) && hasUpgrade('sf', 35) && hasUpgrade('sf', 45) && hasUpgrade('sf', 55)}
        },
    },

    passiveGeneration() { return (hasMilestone("g", 4))?1:(hasMilestone("g", 4))?0.1:0 },
    deactivated() {return player.de.ruining && player.de.disabled.gte(4)}
})
