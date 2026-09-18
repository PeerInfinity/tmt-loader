addLayer("a", {
    name: "Achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "a", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    tooltip() {
      return "Achievements"
    },
    color: "#FFFF00",
    nodeStyle() {return {
        "background": "radial-gradient(#FFFF00, #d5ad83)" ,
    }},
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "Achievement Points",
    resourceSingular: "Achievement Point", 
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown() { return true },
    effect(){
        let acheff = player[this.layer].points.add(1)
        acheff = acheff.pow(0.5)
        acheff = acheff.log2()
        acheff = acheff.add(1)
        return acheff
    },
    effectDescription() {
        let dis = "<br> which multiplies base Faith gain by " + format(tmp.a.effect)
        return dis
    },
    achievements: {
        rows: 23,
        cols: 6,
        11: {
            name: "That.. that's a nerf..",
            doneTooltip: "Here's a point for being bad at math",
            unlocked() {if (hasAchievement("a",11)) return true
            },
            done() {
                if (hasUpgrade("c",12))
                return getPointGen().lt(1)
            },
            onComplete() {
                addPoints("a",1)
            }
        },
        21: {
            name: "Believe",
            tooltip: "Get your first point of Conviction",
            done() {
                return player.c.points.gte(1)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        22: {
            name: "Believe More",
            tooltip: "Get your 100th point of Conviction",
            done() {
                return player.c.points.gte(100)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        23: {
            name: "Believe Moar",
            tooltip: "Get your 1000th point of Conviction",
            done() {
                return player.c.points.gte(1000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        24: {
            name: "Believe Most",
            tooltip: "Get your 5000th point of Conviction",
            done() {
                return player.c.points.gte(5000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        25: {
            name: "Believe Mostester",
            tooltip: "Get your 10000th point of Conviction",
            done() {
                return player.c.points.gte(10000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        26: {
            name: "Auto-Conviction Gain",
            tooltip: "Read the title",
            done() {
                return hasUpgrade("c",41)
            },
            onComplete() {
                addPoints("a",1)
            }
        },
        31: {
            name: "Disregard Females, Accrue Wealth",
            tooltip: "Accrue 100 Gold Coins",
            done() {
                return player.g.points.gte(100)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        32: {
            name: "Disregard Emails, Accrue Self",
            tooltip: "Accrue 1000 Gold Coins",
            done() {
                return player.g.points.gte(1000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        33: {
            name: "Disregard Chainmail, Accrue Stealth",
            tooltip: "Accrue 5000 Gold Coins",
            done() {
                return player.g.points.gte(5000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        34: {
            name: "Disregard Males, Accrue Bookshelf",
            tooltip: "Accrue 10000 Gold Coins",
            done() {
                return player.g.points.gte(10000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        35: {
            name: "Joke Got Old",
            tooltip: "Accrue 50000 Gold Coins",
            done() {
                return player.g.points.gte(50000)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
        36: {
            name: "Auto-Conviction Upgrades",
            tooltip: "Read the title",
            done() {
                return hasUpgrade("c",42)
            },
            onComplete() {
                addPoints("a",1)
            }
        },
        41: {
            name: "World Domination",
            tooltip: "Cult size > 8e9",
            done() {
                return player.g.rec.gte(7.94e9)
            },
            onComplete() {
                addPoints("a",1)
            },
        },
    }
})