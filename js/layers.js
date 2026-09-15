addLayer("r", {
    name: "reset", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#c5c5c5",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "reset points", // Name of reset currency
    baseResource: "points", // Name of resource reset is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    passiveGeneration() {


        if (hasUpgrade('reb', 15)) return 0.35
        if (hasUpgrade('reb', 12)) return 0.20
        if (hasUpgrade('p', 23)) return 0.10
        if (hasUpgrade('p', 21)) return 0.05
        return 0
    },
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Reset currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('r', 24)) mult = mult.times(2)
        if (hasUpgrade('r', 33)) mult = mult.times(2)
        if (hasUpgrade('p', 11)) mult = mult.times(2)
        if (hasUpgrade('p', 12)) mult = mult.times(2)
        if (hasUpgrade('p', 24)) mult = mult.times(2)
        if (hasUpgrade('p', 31)) mult = mult.times(1.5)
        if (hasUpgrade('reb', 11)) mult = mult.times(3)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for reset points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "A New Tree Games!",
            description: "Generate points, if you like points",
            cost: new Decimal(1),
        },
        12: {
            title: "Pointer",
            description: "+1 point gain",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('r', 11) }
        },
        13: {
            title: "Nothing",
            description: "+0 point gain :D",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('r', 12) }
        },
        14: {
            title: "PointerS",
            description: "x2 points gain",
            tooltip: "x2",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade('r', 13) }
        },
        15: {
            title: "Pointest",
            description: "+1 point gain",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade('r', 14) }
        },
        21: {
            title: "A New Row",
            description: "+0.01 point gain",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('r', 15) }
        },
        22: {
            title: "Generatorless",
            description: "+1 point gain, but sadly you can't play Generator Incremental",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('r', 21) }
        },
        23: {
            title: "Making Points",
            description: "x2 points gain, again",
            tooltip: "x2",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade('r', 22) }
        },
        24: {
            title: "Reset Point Stocks",
            description: "x2 reset points.",
            tooltip: "x2",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade('r', 23) },
        },
        25: {
            title: "Second Rower",
            description: "Master the second row, x3 point gain!!",
            tooltip: "x3",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('r', 24) }
        },
        31: {
            title: "Sharp Point",
            description: "Reset Points boost Points<br>(Upgrade prices increase greatly after this)",
            cost: new Decimal(55),
            tooltip: "(RP+1)^0.5",
            unlocked() { return hasUpgrade('r', 25) },
            effect() {
                let eff = player.r.points.add(1).pow(0.5)
                return eff
            },

            effectDisplay() { return format(this.effect()) + "x" },
        },
        32: {
            title: "Comedy = Tragedy + Time",
            description: "Points boost points",
            cost: new Decimal(500),
            tooltip: "(P+1)^0.05",
            unlocked() { return hasUpgrade('r', 31) },
            effect() {
                let eff = player.points.add(1).pow(0.05)
                return eff
            },

            effectDisplay() { return format(this.effect()) + "x" },
        },
        33: {
            title: "What Have You Done",
            description: "x2 reset points",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('r', 32) },
        },
        34: {
            title: "It's Over",
            description: "But is it over?",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('r', 33) },
        },
        35: {
            title: "Prestige",
            description: "Give the entire factory up",
            cost: new Decimal(1500),
            unlocked() { return hasUpgrade('r', 34) },
        },
        41: {
            title: "Use The Radiation",
            description: "x1.1 prestige point gain",
            cost: new Decimal(2000),
            unlocked() { return hasUpgrade('r', 35) && hasUpgrade('p', 13)}
        },
        42: {
            title: "Invent",
            description: "x1.1 prestige point gain",
            cost: new Decimal(3500),
            unlocked() { return hasUpgrade('r', 41) && hasUpgrade('p', 13)}
        },
        43: {
            title: "Destroy!!",
            description: "x1.25 prestige point gain",
            cost: new Decimal(5000),
            unlocked() { return hasUpgrade('r', 42) && hasUpgrade('p', 13) }
        }
    },
    autoUpgrade() { return hasUpgrade('reb', 13) },
    layerShown(){return true}
    
})

addLayer("p", {
    name: "prestige",
    symbol: "P",
    position: 1,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        resets: new Decimal(0)
    }},
    color: "#00ff6e",
    branches: ["r"],
    requires: new Decimal(1500), // Can be a function that takes requirement increases into account
    resource: "prestige points",
    baseResource: "reset points",
    baseAmount() {return player.r.points},
    type: "normal",
    exponent: 0.5,

    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "upgrades"],
            unlocked() { return true }
        },
        "Milestones": {
            content: ["milestones"],
            unlocked() { return hasUpgrade('p', 14) }
        }
    },

    gainMult() {
        mult = new Decimal(1)
        if (hasUpgrade('r', 41)) mult = mult.times(1.1)
        if (hasUpgrade('r', 42)) mult = mult.times(1.1)
        if (hasUpgrade('r', 43)) mult = mult.times(1.25)
        if (hasMilestone('p', 1)) mult = mult.times(2)   
        if (hasUpgrade('p', 15)) mult = mult.times(1.25)
        if (hasUpgrade('p', 22)) mult = mult.times(1.25)
        if (hasUpgrade('reb', 11)) mult = mult.times(2)
        if (hasUpgrade('reb', 22)) mult = mult.times(0.6)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (player.musicTrack === undefined) player.musicTrack = 1
        if (player.musicTrack === 1 && player.p.points.gte(5)) {
            player.musicTrack = 2
            if (typeof updateMusicSource === "function") updateMusicSource()
        }
        if (player.musicTrack === 2 && player.p.points.gte(100)) {
            player.musicTrack = 3
            if (typeof updateMusicSource === "function") updateMusicSource()
        }
    },
    canReset() {
        return hasUpgrade('r', 35)
    },
    doReset(layer) {
        if (layer === "p") {
            player.p.resets = player.p.resets.add(1)
        }
    },
    passiveGeneration() {
        if (hasUpgrade('reb', 12)) return 0.05
        return 0
    },
    milestones: {
        0: {
            requirementDescription: "5 prestige points",
            effectDescription: "x3 points gain",
            tooltip: "Applied after Reset and before Prestige multipliers",
            done() { return player.p.points.gte(5) && hasUpgrade('p', 14) },
            unlocked() { return hasUpgrade('p', 14) }
        },
        1: {
            requirementDescription: "15 prestige points",
            effectDescription: "x2 prestige point gain",
            tooltip: "Applied after Reset multipliers and before Prestige upgrade multipliers",
            done() { return player.p.points.gte(15) && hasMilestone('p', 0) },
            unlocked() { return hasUpgrade('p', 14) && hasMilestone('p', 0) }
        },
        2: {
            requirementDescription: "500 prestige points",
            effectDescription: "x1.5 rebirth point gain",
            done() { return player.p.points.gte(500) && hasMilestone('p', 1) && hasUpgrade('reb', 21) },
            unlocked() { return hasUpgrade('reb', 21) && hasMilestone('p', 1) }
        }
    },
    upgrades: {
        11: {
            title: "Your Finally Here",
            description: "x2 points gain, x2 reset points gain",
            tooltip: "After all multipliers before Prestige",
            cost: new Decimal(1),
        },
        12: {
            title: "The Tree Revolving",
            description: "x3 reset points",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade('p', 11) },
        },
        13: {
            title: "Add Radiation!",
            description: "3 new Reset upgrades",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('p', 12) }
        },
        14: {
            title: "Prestige Milestones",
            description: "Unlock prestige milestones and 2 of them",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade('p', 13) }
        },
        15: {
            title: "Prestige Rook",
            description: "x1.25 prestige point gain",
            tooltip: "Applied after Reset and Prestige Milestone multipliers",
            cost: new Decimal(7),
            unlocked() { return hasUpgrade('p', 14) }
        },
        21: {
            title: "Afford Conveyors",
            description: "Get 5% of Reset points per second",
            tooltip: "Points * 0.05<br>Further levels are prioritized",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('p', 15) }
        },
        22: {
            title: "Out of Stock",
            description: "Lie to Consumers",
            tooltip: "Real effect: x1.25 prestige point gain",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade('p', 21) }
        },
        23: {
            title: "Make Campaigns",
            description: "Spread more Propaganda, 10% of Reset points per second",
            tooltip: "Points * 0.10<br>Further levels are prioritized",
            cost: new Decimal(30),
            unlocked() { return hasUpgrade('p', 22) }
        },
        24: {
            title: "Own Prison",
            description: "Imprison the Suspicious",
            tooltip: "Real effect: x2 reset point gain",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('p', 23) }
        },
        25: {
            title: "Efficient Legality",
            description: "RID of Protestors",
            tooltip: "Real effect: You become soulless. Rebirth",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('p', 24) }
        },
        31: {
            title: "Uranium Creation",
            description: "x1.5 reset point gain",
            tooltip: "Applied after all other multipliers before Rebirth",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('p', 25) && hasUpgrade('reb', 14) }
        },
        32: {
            title: "'Free' the Imprisoned",
            description: "RID of the Suspicious",
            tooltip: "x1.1 rebirth point gain",
            cost: new Decimal(450),
            unlocked() { return hasUpgrade('p', 31) && hasUpgrade('reb', 14) }
        }
    },
    layerShown(){return hasUpgrade('r', 35) || hasAchievement('ach', 14)}
})

addLayer("reb", {
    name: "Rebirth",
    symbol: "Re",
    position: 2,
    row: 1,
    color: "#4287ff",
    resource: "rebirth points",
    baseResource: "prestige points",
    baseAmount() { return player.p.points },
    requires: new Decimal(200),
    type: "normal",
    exponent: 0.5,
    branches: ["p"],
    hotkeys: [
        {key: "b", description: "B: Reset for rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (player.musicTrack === undefined) player.musicTrack = 1
        if (player.reb.points.gte(5) && player.musicTrack !== 4) {
            player.musicTrack = 4
            if (typeof updateMusicSource === "function") updateMusicSource()
        }
    },
    gainMult() {
        mult = new Decimal(1)
        if (hasUpgrade('reb', 22)) mult = mult.times(1.5)
        if (hasUpgrade('reb', 23)) mult = mult.times(1.25)
        if (hasUpgrade('p', 32)) mult = mult.times(1.1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    doReset(layer) {
        if (layer === "reb") {
            layerDataReset('p', ["milestones"])
        }
    },
    tabFormat: {
        "Upgrades": {
            content: ["main-display", "prestige-button", "upgrades", "infoboxes"],
            unlocked() { return true }
        },
        "Milestones": {
            content: ["milestones"],
            unlocked() { return hasUpgrade('reb', 21) }
        }
    },
    infoboxes: {
        info: {
            title: "Info",
            body() { return "Congratulations on making it to the Rebirth layer. This layer introduces optional upgrades that usually give you a boost, but decrease a specific currency." },
        }
    },
    milestones: {
        0: {
            requirementDescription: "50 rebirth points",
            effectDescription: "x1.5 rebirth point gain",
            done() { return player.reb.points.gte(50) && hasUpgrade('reb', 21) },
            unlocked() { return hasUpgrade('reb', 21) }
        }
    },
    upgrades: {
        11: {
            title: "ReStart",
            description: "x2 prestige points, x3 reset points, x4 points",
            tooltip: "Welcome back.",
            cost: new Decimal(1),
        },
        12: {
            title: "ReAuto",
            description: "Generate 20% of your reset points per second, Generate 5% of your prestige points per second",
            tooltip: "Points * 0.20<br>Prestige Points * 0.05<br>Further levels are prioritized",
            cost: new Decimal(1),
            unlocked() { return hasUpgrade('reb', 11) },
        },
        13: {
            title: "ReUpgrade",
            description: "Automatically buy your reset point upgrades",
            tooltip: "Every tick",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('reb', 12) },
        },
        14: {
            title: "ReDo",
            description: "Unlock 2 new prestige upgrades",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('reb', 13) }
        },
        15: {
            title: "ReFire",
            description: "Get 35% of your reset points per second",
            tooltip: "Points * 0.35<br>Further levels are prioritized",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('reb', 14) }
        },
        21: {
            title: "ReMile",
            description: "Unlock 1 milestone in prestige and rebirth",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade('reb', 15) }
        },
        22: {
            title: "ReInvent-D",
            description: "x1.5 rebirth point gain, x0.6 prestige point gain",
            tooltip: "Not required for progress. Applied after all prestige multipliers...",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('reb', 21) }
        },
        23: {
            title: "ReDestroy",
            description: "x1.25 rebirth point gain",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('reb', 21) } // intentional
        }
    },
    layerShown() { return hasUpgrade('p', 25) || hasAchievement('ach', 17) }
})

addLayer("ach", {
    name: "Achievements",
    tooltip: "Achievements",
    symbol: "A",
    position: 0,
    row: "side",
    color: "#fff203",
    layerShown() { return true },

    infoboxes: {
        info: {
            title: "Info",
            body() { return "These are achievements. They are achievements. You achieve them by playing the game, and therefore you achieve the achievements. Good luck achieving these achievements" },
        }
    },
    
    achievements: {
        11: {
            name: "Reset",
            tooltip: "Reset once.",
            image: "resources/images/achievements/11.png",
            done() { return player.r.points.gte(1) },
        },
        12: {
            name: "Pointing",
            tooltip: "Get 1K points.",
            image: "resources/images/achievements/12.png",
            done() { return player.points.gte(1000) },
        },
        13: {
            name: "Rad Reset",
            tooltip: "Have 100 reset points",
            image: "resources/images/achievements/13.png",
            done() { return player.r.points.gte(100) },
        },
        14: {
            name: "Progress!",
            tooltip: "Give the factory up once.",
            image: "resources/images/achievements/14.png",
            done() { return player.p.points.gte(1) },
        },
        15: {
            name: "Progress?",
            tooltip: "Give the factory up 3 times",
            image: "resources/images/achievements/15.png",
            done() { return player.p.resets.gte(3) }
        },
        16: {
            name: "Your Fired",
            tooltip: "Start automating Reset points",
            image: "resources/images/achievements/16.png",
            done() { return hasUpgrade('p', 21) }
        },
        17: {
            name: "Soulless",
            tooltip: "Rebirth",
            image: "resources/images/achievements/17.png",
            done() { return player.reb.points.gte(1) }
        },
        18: {
            name: "Potato",
            tooltip: "Automate Reset point upgrades",
            image: "resources/images/achievements/18.png",
            done() { return hasUpgrade('reb', 13) }
        }
    },
})

addLayer("sb", {
    name: "Savebank",
    tooltip: "Savebank",
    symbol: "SB",
    position: 1,
    row: "side",
    color: "#ff07ea",
    layerShown() { return true },
    infoboxes: {
        info: {
            title: "Info",
            body() { return "This is a savebank. It allows you to go to various points of progress in the game. BEWARE, as one click sets the progress, so you can accidentally go ahead or backwards. I use these to debug the game, as my save also gets corrupted while editing and playing" },
        }
    },

    clickables: {
        11: {
           display() { return "Prestige" },
           tooltip() { return "The first reset layer, other than Reset Points."},
           canClick() { return true },
           color() { return "#00ff6e" },
            onClick() {
                layerDataReset('r')
                player.p.points = new Decimal(1)
                player.p.resets = new Decimal(1)
                player.reb.points = new Decimal(0)
                player.r.upgrades = []
                player.p.upgrades = []
                player.reb.upgrades = []
                player.achievements = ['11', '12', '13', '14']
                player.p.milestones = []
            }
        },
        12: {
           display() { return "Rebirth" },
           tooltip() { return "A greater reset layer above Prestige."},
           canClick() { return true },
           color() { return "#4287ff" },
            onClick() {
                layerDataReset('r')
                player.p.points = new Decimal(0)
                player.p.resets = new Decimal(0)
                player.reb.points = new Decimal(1)
                player.r.upgrades = []
                player.p.upgrades = []
                player.reb.upgrades = []
                player.achievements = ['11', '12', '13', '14', '15', '16']
                player.p.milestones = ['0', '1']
            }
        }
    }
})

