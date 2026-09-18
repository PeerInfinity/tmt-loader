addLayer("statistics", {
    name: "Statistics", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 'side', // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        pointbest: new Decimal(0),
    }},
    color: "#FF9999",
    UpgradeCalc() {
        var upgradelength = 0
        for (i in layers) {
            if (i.startsWith('layer')) {
                upgradelength += player[i].upgrades.length
            }
        }
        player.statistics.upgrades = new Decimal(upgradelength)
    },
    MilestoneCalc() {
        var milestonelength = 0
        for (i in layers) {
            if (i.startsWith('layer')) {
                milestonelength += player[i].milestones.length
            }
        }
        player.statistics.milestones = new Decimal(milestonelength)
    },
    pointBestCalc() {
        player.statistics.pointbest = player.statistics.pointbest.max(player.points)
    },
    tabFormat: [
        ["display-text",
        function() { return `You have bought <h2>${player.statistics.upgrades}</h2> upgrades`}
        ], "blank",
        ["display-text",
        function() { return `You has <h2>${player.statistics.milestones}</h2> milestones`}
        ], "blank",
        ["display-text",
        function() { return `Your best Point is <h2>${format(player.statistics.pointbest)}</h2>`}
        ], "blank",
    ],
    layerShown(){return true},
    tooltip(){return ''},
})
addLayer("achievements", {
    name: "Achievements",
    symbol: "A",
    color: "#EEEE99",
    displayRow: 'side',
    resource: "Achievements achieved",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    achievementPowerCalc() {
        player.achievements.points = new Decimal(player.achievements.achievements.length)
    },
    tabFormat: [
        ["display-text",
        function() { return `You have achieved <h2 style='text-shadow: 0px 0px 10px #ff6; color: #ee9; filter: var(--filter)'>${player.achievements.points}</h2> Achievements`}
        ], "blank", "blank",
        "achievements",
    ],
    achievements: {
        rows: 100,
        cols: 5,
        11: {
            name: "Getting Started",
            goalTooltip: "Reach 10 Points",
            doneTooltip: "Reach 10 Points",
            done() { return player.points.gte(10) }
        },
        12: {
            name: "First Upgrade",
            goalTooltip: "Buy first Prestige 1 Upgrade",
            doneTooltip: "Buy first Prestige 1 Upgrade",
            done() { return player.layer1.upgrades.includes(11) }
        },
        13: {
            name: "All of Upgrades",
            goalTooltip: "Buy 3 Prestige 1 Upgrades",
            doneTooltip: "Buy 3 Prestige 1 Upgrades",
            done() { return player.layer1.upgrades.length >= 3 }
        },
        14: {
            name: "Second Prestige",
            goalTooltip: "Reach Prestige 2 (Reward: Point gain x5 when Point is lower than 10000)",
            doneTooltip: "Reach Prestige 2",
            done() { return player.layer2.points.gte(1)}
        },
        15: {
            name: "Million Master",
            goalTooltip: "Reach 1,000,000 Points (Reward: Point gain x1.2)",
            doneTooltip: "Reach 1,000,000 Points (Reward: Point gain x1.2)",
            done() { return player.points.gte(1000000)}
        },
        21: {
            name: "First Milestone",
            goalTooltip: "get first Prestige 2 Milestone",
            doneTooltip: "get first Prestige 2 Milestone",
            done() { return player.layer2.milestones.includes('0')}
        },
        22: {
            name: "Second Row",
            goalTooltip: "Unlock Second row Prestige 1 Upgrade",
            doneTooltip: "Unlock Second row Prestige 1 Upgrade",
            done() { return player.layer2.milestones.includes('1')}
        },
        23: {
            name: "Third Prestige",
            goalTooltip: "Reach Prestige 3a (or 3b)",
            doneTooltip: "Reach Prestige 3a (or 3b)",
            done() { return (player.layer3a.points.gte(1) || player.layer3b.points.gte(1))}
        },
        24: {
            name: "Start of Automation",
            goalTooltip: "Buy First 'Auto Point' Upgrade",
            doneTooltip: "Buy First 'Auto Point' Upgrade",
            done() { return player.layer1.upgrades.includes(23)}
        },
        25: {
            name: "Infinity^0.1",
            goalTooltip: "Reach 1e30 Points (Reward: Point gain x1.5)",
            doneTooltip: "Reach 1e30 Points (Reward: Point gain x1.5)",
            done() { return player.points.gte(1e30)}
        },
        31: {
            name: "Upgrader",
            goalTooltip: "Buy 10 Upgrades",
            doneTooltip: "Buy 10 Upgrades",
            done() { return player.statistics.upgrades >= 10 }
        },
        32: {
            name: "Infinity^0.15",
            goalTooltip: "Reach 1e45 Points",
            doneTooltip: "Reach 1e45 Points",
            done() { return player.points.gte(1e45)}
        },
        33: {
            name: "Age of Automation",
            goalTooltip: "Buy Second 'Auto Point' Upgrade (Reward: Auto Point gain is Doubled)",
            doneTooltip: "Buy Second 'Auto Point' Upgrade (Reward: Auto Point gain is Doubled)",
            done() { return player.layer2.upgrades.includes(23)}
        },
        34: {
            name: "AAAA",
            goalTooltip: "Reach Prestige 4a",
            doneTooltip: "Reach Prestige 4a",
            done() { return player.layer4a.points.gte(1) }
        },
        35: {
            name: "BBBB",
            goalTooltip: "Reach Prestige 4b",
            doneTooltip: "Reach Prestige 4b",
            done() { return player.layer4b.points.gte(1) }
        },
        41: {
            name: "Milestone Collector",
            goalTooltip: "Collect 5 Milestones (Reward: Unlock more Prestige 1 Upgrades)",
            doneTooltip: "Collect 5 Milestones (Reward: Unlock more Prestige 1 Upgrades)",
            done() { return player.statistics.milestones >= 5 }
        },
        42: {
            name: "Extreme Speed",
            goalTooltip: "Reach 1e90 Points",
            doneTooltip: "Reach 1e90 Points",
            done() { return player.points.gte(1e90)}
        },
        43: {
            name: "Maximum Boost",
            goalTooltip: "Reach 1e120 Prestige 2 Points",
            doneTooltip: "Reach 1e120 Prestige 2 Points",
            done() { return player.layer2.points.gte(1e120)}
        },
        44: {
            name: "Maximum Boost II",
            goalTooltip: "Reach 1e50 Prestige 3a Points",
            doneTooltip: "Reach 1e50 Prestige 3a Points",
            done() { return player.layer3a.points.gte(1e50)}
        },
        45: {
            name: "half Infinity",
            goalTooltip: "Reach 1e150 Points",
            doneTooltip: "Reach 1e150 Points",
            done() { return player.points.gte(1e150)}
        }
    }
})
addLayer("layer1#", {
})
addLayer("layer1", {
    name: "Prestige 1", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "1", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 0, position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["layer2"],
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        total: new Decimal(0),
        exponent: new Decimal(1),
        resetTime: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "#FF9999",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Prestige 1 points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    upgradeconfirm(){
        if (player.layer1.upgrades.includes(13)) {player.layer1.exponent = new Decimal(1.2)} else {player.layer1.exponent = new Decimal(1)}
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = player.layer2.points.pow(0.5).add(1).min(1e60)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return player.layer1.exponent
    },
    autogain() {
        if (player.layer1.upgrades.includes(23)) {
            let gainrate = 0.05
            if (player.achievements.achievements.includes(33)) gainrate = 0.1
            player.layer1.points = player.layer1.points.add(getResetGain('layer1').times(gainrate).div(20))
            player.layer1.total = player.layer1.total.add(getResetGain('layer1').times(gainrate).div(20))
        }
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 0 by ${format(player.layer1.points.min(player.layer1.points.pow(0.3).times(1e10)).add(1))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer1.total)} Prestige 1 points`}
        ], "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Point Boost I",
            description: "Multiply Point gain by x2",
            cost: new Decimal(50),
        },
        12: {
            title: "Point Boost II",
            description: "Multiply Point gain by x3",
            cost: new Decimal(300),
        },
        13: {
            title: "Resource Boost",
            description: "Prestige 1 Point gain ^1.2",
            cost: new Decimal(1250),
        },
        21: {
            title: "Point Boost III",
            description: "Multiply Point gain by x4",
            cost: new Decimal(1e7),
            unlocked() {return player.layer2.milestones.includes('1')}
        },
        22: {
            title: "Point Boost IV",
            description: "Multiply Point gain by x8",
            cost: new Decimal(1e10),
            unlocked() {return player.layer2.milestones.includes('1')}
        },
        23: {
            title: "Auto Point",
            description: "Gain 5% of Layer 1 Reset reward per second",
            cost: new Decimal(1e20),
            unlocked() {return player.layer2.milestones.includes('1')}
        },
    },
    layerShown(){return true}
})
addLayer("layer2", {
    name: "Prestige 2", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "2", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 1, position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0)
    }},
    branches: ["layer3a", "layer3b"],
    color: "#FFAA99",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "Prestige 2 points", // Name of prestige currency
    baseResource: "Prestige 1 points", // Name of resource prestige is based on
    baseAmount() {return player.layer1.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1).times(player.layer3a.points.add(1).pow(0.4).min(1e20)).times(player.layer3b.points.add(1).pow(0.4).min(1e20))
        if (player.layer4a.upgrades.includes(11)) {
            mult = mult.times(player.layer4a.points.add(1).pow(0.7))
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (player.layer2.upgrades.includes(22)) {return new Decimal(1.2)} else {return new Decimal(1)}
    },
    autogain() {
        if (player.layer2.upgrades.includes(23)) {
            let gainrate = 0.03
            if (player.achievements.achievements.includes(33)) gainrate = 0.06
            player.layer2.points = player.layer2.points.add(getResetGain('layer2').times(gainrate).div(20))
            player.layer2.total = player.layer2.total.add(getResetGain('layer2').times(gainrate).div(20))
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 1 by ${format(player.layer2.points.pow(0.5).add(1).min(1e60))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer2.total)} Prestige 2 points`}
        ],
        "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Point Boost I",
            description: "Multiply Point gain by x5",
            cost: new Decimal(2),
        },
        12: {
            title: "Point Boost II",
            description: "Multiply Point gain by x3",
            cost: new Decimal(50),
        },
        13: {
            title: "Prestige Boost",
            description: "Prestige 2 Boost affects Point gain",
            cost: new Decimal(500),
        },
        21: {
            title: "Point Boost III",
            description: "Multiply Point gain by x8",
            cost: new Decimal(1e12),
            unlocked() {return player.layer3b.milestones.includes('0')}
        },
        22: {
            title: "Resource Boost",
            description: "Prestige 2 Point gain ^1.2",
            cost: new Decimal(1e15),
            unlocked() {return player.layer3b.milestones.includes('0')}
        },
        23: {
            title: "Auto Point",
            description: "Gain 3% of Layer 1 Reset reward per second",
            cost: new Decimal(1e30),
            unlocked() {return player.layer3b.milestones.includes('0')}
        }
    },
    milestones: {
        0: {
            requirementDescription: "5 Prestige 2 Points",
            effectDescription: "　　Keep all Prestige 1 Upgrades　　",
            done() { return player[this.layer].points.gte(5) }
        },
        1: {
            requirementDescription: "30 Prestige 2 Points",
            effectDescription: "　　Unlock More Prestige 1 Upgrades　　",
            done() { return player[this.layer].points.gte(30) }
        },
    },
    canReset() {
        return this.baseAmount().gte(this.requires)
    },
    layerShown() {
        return player.layer1.unlocked
    },
    layerUnlock() {
        if (this.canReset() || player[this.layer].total.gt(0)) {
            player.layer2.unlocked = true
        }
    },
    tooltipLocked() {
        return `[Locked]   ${format(this.baseAmount())}/${format(this.requires)} ${this.baseResource}`
    }
})
addLayer("layer3a", {
    name: "Prestige 3a", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "3a", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 2, position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["layer4a"],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#FFBB99",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "Prestige 3a points", // Name of prestige currency
    baseResource: "Prestige 2 points", // Name of resource prestige is based on
    baseAmount() {return player.layer2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = player.layer4a.points.add(1).pow(0.7)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (player.layer3b.upgrades.includes(12)) {return new Decimal(1.1)} else {return new Decimal(1)}
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 2 by ${format(player.layer3a.points.add(1).pow(0.4).min(1e20))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer3a.total)} Prestige 3a points`}
        ],
        "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Start Boost",
            description: "Point gain x5 on First 1 second",
            cost: new Decimal(3),
        },
        12: {
            title: "Keep Point I",
            description: "Keep ^0.5 of Prestige 1 Point on Prestige",
            cost: new Decimal(25000),
        },
        13: {
            title: "Keep Point II",
            description: "Keep ^0.4 of Prestige 2 Point on Prestige",
            cost: new Decimal(3000000),
        },
        21: {
            title: "Milestone Boost",
            description: "Boost Point gain based on Milestones",
            cost: new Decimal(1e30),
            effectDisplay() { return format(player.statistics.milestones.pow(2.5).times(10).add(1)) },
            unlocked() {return player.layer4a.milestones.includes('1')}
        },
    },
    milestones: {
        0: {
            requirementDescription: "　150 Prestige 3a Points　",
            effectDescription: "　　Keep all Prestige 2 Upgrades　　",
            done() { return player[this.layer].points.gte(150) }
        },
    },
    canReset() {
        return this.baseAmount().gte(this.requires)
    },
    layerShown() {
        return player.layer2.unlocked
    },
    layerUnlock() {
        if (this.canReset() || player[this.layer].total.gt(0)) {
            player.layer3a.unlocked = true
        }
    },
    tooltipLocked() {
        return `[Locked]   ${format(this.baseAmount())}/${format(this.requires)} ${this.baseResource}`
    }
})
addLayer("layer3b", {
    name: "Prestige 3b", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "3b", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 2, position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["layer4b"],
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#FFBB99",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "Prestige 3b points", // Name of prestige currency
    baseResource: "Prestige 2 points", // Name of resource prestige is based on
    baseAmount() {return player.layer2.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = player.layer4b.points.add(1).pow(0.7)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (player.layer3b.upgrades.includes(12)) {return new Decimal(1.1)} else {return new Decimal(1)}
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 2 by ${format(player.layer3b.points.add(1).pow(0.4).min(1e20))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer3b.total)} Prestige 3b points`}
        ],
        "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 1,
        cols: 3,
        11: {
            title: "Time Boost",
            description: "Multiply Point gain based on Time Played",
            cost: new Decimal(100),
            effectDisplay() {return (new Decimal(player.timePlayed).div(6000).plus(1).log(2).plus(1).pow(2)).toFixed(2)}
        },
        12: {
            title: "Resource Boost",
            description: "Prestige 3a,3b Point gain ^1.1",
            cost: new Decimal(1e6)
        },
        13: {
            title: "Achievement Boost",
            description: "Multiply Point gain based on achieved Achievements",
            cost: new Decimal(1e10),
            effectDisplay() {return (new Decimal(1).add(new Decimal(player['achievements'].achievements.length).pow(1.5).div(5))).toFixed(2)}
        },
    },
    milestones: {
        0: {
            requirementDescription: "　1,000 Prestige 3b Points　",
            effectDescription: "　　Unlock More Prestige 2 Upgrades　　",
            done() { return player[this.layer].points.gte(1000) }
        },
    },
    canReset() {
        return this.baseAmount().gte(this.requires)
    },
    layerShown() {
        return player.layer2.unlocked
    },
    layerUnlock() {
        if (this.canReset() || player[this.layer].total.gt(0)) {
            player.layer3b.unlocked = true
        }
    },
    tooltipLocked() {
        return `[Locked]   ${format(this.baseAmount())}/${format(this.requires)} ${this.baseResource}`
    }
})
addLayer("layer4a", {
    name: "Prestige 4a", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "4a", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 3, position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#EECC99",
    requires: new Decimal(1e12), // Can be a function that takes requirement increases into account
    resource: "Prestige 4a points", // Name of prestige currency
    baseResource: "Prestige 3a points", // Name of resource prestige is based on
    baseAmount() {return player.layer3a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (player.layer4a.upgrades.includes(13)) {return new Decimal(1.2)} else {return new Decimal(1)}
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 3a by ${format(player.layer4a.points.add(1).pow(0.7))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer4a.total)} Prestige 4a points`}
        ],
        "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 1,
        cols: 3,
        11: {
            title: "Prestige Boost",
            description: "Prestige 4a Boost affects Prestige 2",
            cost: new Decimal(3),
        },
        12: {
            title: "Keep Point",
            description: "Keep ^0.35 of Prestige 3a,3b Point on Prestige",
            cost: new Decimal(15),
        },
        13: {
            title: "Resource Boost",
            description: "Prestige 4a Point gain ^1.2",
            cost: new Decimal(10000)
        }
    },
    milestones: {
        0: {
            requirementDescription: "5 Prestige 4a Points",
            effectDescription: "　　Keep all Prestige 3a,3b Upgrades　　",
            done() { return player[this.layer].points.gte(5) }
        },
        1: {
            requirementDescription: "50 Prestige 4a Points",
            effectDescription: "Unlock more Prestige 3a upgrades",
            done() { return player[this.layer].points.gte(50) }
        },
        2: {
            requirementDescription: "10,000,000 Prestige 4a Points",
            effectDescription: "Unlock 1# Layer",
            done() { return player[this.layer].points.gte(10000000) }
        }
    },
    canReset() {
        return this.baseAmount().gte(this.requires)
    },
    layerShown() {
        return player.layer3a.unlocked
    },
    layerUnlock() {
        if (this.canReset() || player[this.layer].total.gt(0)) {
            player.layer4a.unlocked = true
        }
    },
    tooltipLocked() {
        return `[Locked]   ${format(this.baseAmount())}/${format(this.requires)} ${this.baseResource}`
    }
})
addLayer("layer4b", {
    name: "Prestige 4b", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "4b", // This appears on the layer's node. Default is the id with the first letter capitalized
    displayRow: 3, position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#FFCC99",
    requires: new Decimal(1e20), // Can be a function that takes requirement increases into account
    resource: "Prestige 4b points", // Name of prestige currency
    baseResource: "Prestige 3b points", // Name of resource prestige is based on
    baseAmount() {return player.layer3b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        ["display-text",
        function() { return `Boosts Layer 3b by ${format(player.layer4b.points.add(1).pow(0.4))}x`}
        ], "blank",
        "prestige-button",
        "blank",
        ["display-text",
        function() { return `You have made a total of ${format(player.layer4b.total)} Prestige 4b points`}
        ],
        "blank",
        ["toggle", ["c", "beep"]],
        "milestones",
        "blank",
        "blank",
        "upgrades"
    ],
    upgrades: {
        rows: 1,
        cols: 3,
        11: {
            title: "Point Boost",
            description: "Point gain ^1.1",
            cost: new Decimal(2),
        },
    },
    canReset() {
        return this.baseAmount().gte(this.requires)
    },
    layerShown() {
        return player.layer3b.unlocked
    },
    layerUnlock() {
        if (this.canReset() || player[this.layer].total.gt(0)) {
            player.layer4b.unlocked = true
        }
    },
    tooltipLocked() {
        return `[Locked]   ${format(this.baseAmount())}/${format(this.requires)} ${this.baseResource}`
    }
})