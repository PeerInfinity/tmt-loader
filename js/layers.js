addLayer("+", {
    name: "Positive",
    symbol: "+",
    row: 0,
    side: 1,
    position: 1,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        bestGain: new Decimal(0)
    }},
    color: "#CCC",
    requires: new Decimal(2),
    resource: "Positive Energy",
    midsection: [
        [
            "display-text",
            function () { return `Your best PE Gain is ${player['+'].bestGain.toFixed(3)}` },
            { "color": "#DFDFDF" }
        ],
        [
            "display-text",
            function() { return "Reset on this also resets every layers on negative side."},
            { "color": "red", "font-size": "16px" }
        ]
    ],
    baseResource: "Posibility",
    baseAmount() { return player.points },
    update() {
        tmp['+'].exponent = this.exponent;
    },
    type: "normal",
    get exponent() {
        if (hasUpgrade('+', 14)) return 0.5;
        return 0.4;
    },
    gainMult() {
        mult = new Decimal(1);
        return mult;
    },
    exptList: [
        ['+', 13]
    ],
    gainExp() {
        let expt = new Decimal(1)

        return expt;
    },
    hotkeys: [
        {key: "+", description: "+: Reset for Positive Points", onPress() {
            if (canReset(this.layer)) {
                doReset(this.layer)
            }
        }}
    ],
    layerShown() { return !hasUpgrade('-', 11) },
    onPrestige(n) {
        n = new Decimal(n);
        if (n.lt(1)) return;
        if (n.gt(player[this.layer].bestGain)) player[this.layer].bestGain = n;
        sideReset(0);
    },
    canReset() { return this.layerShown() },
    parentMultList: [
        ['+', 12]
    ],
    pointGen() {
        if (player[this.layer].points.lte(new Decimal(0))) return new Decimal(0);
        let logbase = new Decimal(4);
        if (hasUpgrade('+', 21) && player[this.layer].best.gt(new Decimal(16))) logbase = Decimal.logarithm(logbase, player[this.layer].best).mul(8)
        let base = Decimal.logarithm(player[this.layer].points.add(new Decimal(1)), logbase);
        let minimal = new Decimal(0.1);
        mult = new Decimal(1);
        for (const u of this.parentMultList) {
            if (hasUpgrade(...u)) mult = mult.mul(layers[u[0]].upgrades[u[1]].effect().positive.parent);
        }
        return Decimal.max(base, minimal).mul(mult);
    },
    upgrades: {
        11: {
            title: "Positive Activation",
            description: "Double \"Final\" Posibility Generation, Generate 0.5 Posibility per Second, Locks Negative",
            cost: new Decimal(2),
            effect() { return {
                point: {
                    gen: new Decimal(0.5),
                    final: new Decimal(2)
                }
            }}
        },
        12: {
            title: "Materialization",
            description: "Posibility generation from PE will doubled",
            cost: new Decimal(30),
            effect() { return {
                positive: {
                    parent: new Decimal(2)
                }
            }}
        },
        13: {
            title: "Replicate",
            description: "Best gain of PE will power its gain",
            effectDisplay() {
                return '^' + (new Decimal(1).add(this.effect().positive.expt).toFixed(2))
            },
            cost: new Decimal(80),
            effect() { return {
                positive: {
                    expt: player[this.layer].bestGain.div(new Decimal('1e2')).mul(3)
                }
            }}
        },
        14: {
            title: "Better Processing",
            description: "PE will generated on better formular<br>P^0.4 -> P^0.5",
            cost: new Decimal(120)
        },
        21: {
            title: "Reverse Revolution",
            description: "Log base of P generation will based on best PE",
            cost: new Decimal(200),
            effectDisplay() {
                if (player[this.layer].best.lte(16)) return 'n = 4'
                return 'n = ' + Decimal.logarithm(4, player[this.layer].best).mul(8).toFixed(4);
            }
        }
    }
})

addLayer("-", {
    name: "Negative",
    symbol: "-",
    side: 0,
    row: 0,
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        epsilon: new Decimal(0),
        resetCount: new Decimal(0),
        totalReset: new Decimal(0)
    }},
    color: "#777",
    requires: new Decimal(2),
    resource: "Negative Energy",
    midsection: [
        [
            "display-text",
            function () { return `You resetted for NE ${player['-'].totalReset.toFixed(2)} time(s), effective as ${player['-'].resetCount.toFixed(2)} time(s)` },
            { "color": "#DFDFDF" }
        ],
        [
            "display-text",
            function () {
                if (player['-'].epsilon.lte(0)) return `You have ${player['-'].epsilon.toFixed(2)} epsilon(s), which Multiples NE gain by x1`
                let epsMult = Decimal.logarithm(player['-'].epsilon.add(1), new Decimal(4)).add(new Decimal(1));
                return `You have ${player['-'].epsilon.toFixed(2)} epsilon(s) , which Multiples NE gain by x${epsMult.toFixed(2)}`
            },
            { "color": "#DFDFDF" }
        ],
        [
            "display-text",
            function() { return "Reset on this also resets every layers on Positive side."},
            { "color": "red", "font-size": "16px" }
        ]
    ],
    clickables: {
        11: {
            title: "Self Destruction",
            display() {
                if (hasUpgrade('-', 21)) return `Lose 0.4 NE Resets<br>Convert NE to Epsilon<br>Will gain ${player[this.layer].points.toFixed(2)}ε`;
                return "Lost 0.4 NE Resets<br>Current NE will reset to 0";
            },
            unlocked() { return hasUpgrade('-', 14) },
            canClick() { return player[this.layer].points.gt(0) },
            onClick() {
                player.points = new Decimal(0);
                if (hasUpgrade('-', 21)) player[this.layer].epsilon = player[this.layer].epsilon.add(player[this.layer].points);
                player[this.layer].points = new Decimal(0);
                player[this.layer].resetCount = player[this.layer].resetCount.sub(0.4);
                if (player[this.layer].resetCount.lt(0)) player[this.layer].resetCount = new Decimal(0);
            }
        },
    },
    baseResource: "Posibility",
    baseAmount() { return player.points },
    type: "static",
    exponent: 0.6,
    gainMult() {
        mult = new Decimal(1);
        if (player['-'].epsilon.gt(0)) mult = mult.mul(Decimal.logarithm(player['-'].epsilon.add(1), new Decimal(4)).add(new Decimal(1)));
        return mult;
    },
    gainExp() {
        return new Decimal(1);
    },
    hotkeys: [
        {key: "-", description: "-: Reset for Negative Points", onPress() {
            if (canReset(this.layer)) doReset(this.layer)
        }}
    ],
    layerShown() { return !hasUpgrade('+', 11) },
    onPrestige(n) {
        n = new Decimal(n);
        if (n.lt(1)) return;
        sideReset(1)
        player[this.layer].resetCount = player[this.layer].resetCount.add(1);
        player[this.layer].totalReset = player[this.layer].totalReset.add(1);
    },
    canReset() { return this.layerShown() },
    parentMultList: [
        ['-', 12]
    ],
    pointGen() {
        if (player[this.layer].points.lte(new Decimal(0))) return new Decimal(0);
        let base = Decimal.logarithm(player[this.layer].points.add(new Decimal(1)), new Decimal(4));
        let minimal = new Decimal(0.1);
        mult = new Decimal(1);
        for (const u of this.parentMultList) {
            if (hasUpgrade(...u)) mult = mult.mul(layers[u[0]].upgrades[u[1]].effect().negative.parent);
        }
        return Decimal.max(base, minimal).mul(mult);
    },
    canBuyMax() { return hasUpgrade('-', 13) },
    upgrades: {
        11: {
            title: "Negative Activation",
            description: "Double \"Final\" Posibility Generation, Generate 0.5 Posibility per Second, Locks Positive",
            cost: new Decimal(1),
            effect() { return {
                point: {
                    gen: new Decimal(0.5),
                    final: new Decimal(2)
                }
            }}
        },
        12: {
            title: "Anti-materialization",
            description: "Posibility generation from NE will doubled",
            cost: new Decimal(5),
            effect() { return {
                negative: {
                    parent: new Decimal(2)
                }
            }}
        },
        13: {
            title: "Auto Recovery",
            description: "Can buy max NE, Generate 1.2 P/s per NE Resets",
            cost: new Decimal(10),
            effectDisplay () {
                return this.effect().point.gen.toFixed(2) + ' P/s';
            },
            effect() { return {
                point: {
                    gen: player['-'].resetCount.mul(1.2)
                }
            }}
        },
        14: {
            title: "Self Destruction",
            description: "Add self destruction to NE, reset current NE count with lose 0.4 reset.",
            cost: new Decimal(30)
        },
        21: {
            title: "Reabsorption",
            description: "When Self Destruction was triggered, current NE will converted to Epsilon",
            cost: new Decimal(50)
        }
    }
})

addLayer("∞", {
    name: "Infinity",
    symbol: "∞",
    side: 1,
    row: 1,
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    layerShown() { return hasUpgrade('+', 11) },
    color: "#33f",
    requires: new Decimal(2),
    resource: "Infinity Paradox",
    baseResource: "Positive Energy",
    baseAmount() { return player['+'].points },
    branches: ["+", "∞"],
})

addLayer("ε", {
    name: "Epsilon",
    symbol: "ε",
    side: 0,
    row: 1,
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    layerShown() { return hasUpgrade('-', 11) },
    color: "#f33",
    requires: new Decimal(2),
    resource: "Epsilon Paradox",
    baseResource: "Negative Energy",
    baseAmount() { return player['-'].points },
    branches: ["-", "ε"],
})

addLayer("◎", {
    name: "Inception",
    symbol: "◎",
    side: 0,
    row: 1,
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    layerShown() { return true/*hasUpgrade('∞', 11) || hasUpgrade('ε', 11)*/ },
    color: "#3f3",
    requires: new Decimal(2),
    resource: "Inception",
    baseResource: "Paradox",
    baseAmount() { return player['∞'].points.add(player['ε'].points) },
    branches: ["∞", "◎", "ε"],
})