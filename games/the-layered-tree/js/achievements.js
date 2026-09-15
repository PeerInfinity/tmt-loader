addLayer("a", {
    name: "Achievements",
    symbol: "A",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0)
    }},
    color: "#F1E41E",
    resource: "Achievements",
    row: 'side',
    layerShown(){return true},
    achievements: {
        rows: 3,
        cols: 5,
        11: {
            name: "Prestige!",
            done() {
                return (hasUpgrade('p', 11))
            },
            tooltip: "Get the first Prestige Upgrade.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        12: {
            name: "Second Row.",
            done() {
                return (hasUpgrade('p', 21))
            },
            tooltip: "Get the First, Second row Prestige Upgrade.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        13: {
            name: "100 Prestige Points!",
            done() {
                return player.p.points.gte(100)
            },
            tooltip: "Get 100 Prestige Points. Reward: 2.5x Points",
            onComplete() {
                addPoints('a', 1)
            },
        },
        14: {
            name: "what",
            done() {
                return player.l.unlocked
            },
            tooltip: "what",
            doneTooltip: "Unlock the Layers Layer..?",
            onComplete() {
                addPoints('a', 1)
            },
        },
        15: {
            name: "Wait Wait, Isn't this a bit TOO strong?",
            done() {
                return (hasUpgrade('l', 12))
            },
            tooltip: "Purchase the second Layer Upgrade.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        21: {
            name: "Another Powerful Upgrade!",
            done() {
                return (hasUpgrade('l', 15))
            },
            tooltip: "Purchase the Fifth Layer Upgrade.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        22: {
            name: "Layers upon Layers.",
            done() {
                return (hasUpgrade('l', 21))
            },
            tooltip: "Unlock another Layer from Layers. This is getting more confusing to say every second...",
            onComplete() {
                addPoints('a', 1)
            },
        },
        23: {
            name: "Me when pow(1.1)",
            done() {
                return (hasUpgrade('lf', 12))
            },
            tooltip: "Get the second upgrade in the Layer Fragments Layer. Reward: 1.5x Layer Points",
            onComplete() {
                addPoints('a', 1)
            },
        },
        24: {
            name: "OH NO THE INFLATION!",
            done() {
                return (hasUpgrade('p', 14))
            },
            tooltip: "Purchase the Fourth Prestige upgrade in the First Row. Reward: 2.5x Layer Points",
            onComplete() {
                addPoints('a', 1)
            },
        },
        25: {
            name: "Slowing Down, Finally",
            done() {
                return (hasUpgrade('lf', 13))
            },
            tooltip: "Third Layer Fragments Upgrade, Inflation is slowing down.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        31: {
            name: "The heck is this?",
            done() {
                return player.w.points.gte(3)
            },
            tooltip: "We aren't powering ANYTHING are we? Moreover, WHERE ARE WE GETTING THIS POWER???",
            onComplete() {
                addPoints('a', 1)
            },
        },
        32: {
            name: "What have you done.",
            done() {
                return (hasUpgrade('w', 15))
            },
            tooltip: "We might be doomed if we get a uncapped boost based on layer fragments.",
            onComplete() {
                addPoints('a', 1)
            },
        },
        33: {
            name: "Lossless Resets",
            done() {
                return (hasUpgrade('lf', 14))
            },
            tooltip: "Somehow never lose Watt and Prestige Upgrades no matter What reset you do. (I have no idea how to fix it so im leaving it ingame for now so have fun!!! please dont spam it i beg please)",
            onComplete() {
                addPoints('a', 1)
            },
        },
    }
})