addLayer("ach", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    tooltip() {return "Achievements"},

    tabFormat: [
        ["display-text",
            function() { return '<b>Achievements will show if their requirements are fullfilled at that time.<br><br>Total Achievements: 29</b>' }
        ], "blank",
        "achievements"
    ],

    achievements: {
        101: {
            name: "Exponential Growth",
            tooltip: "Reach 1e10 Number.",
            image: "images/101.png",
            done() { return player.points.gte(1e10) },
            unlocked() { return player.points.gte(1e10) },
            color: '#DFDFDF',
        },
        102: {
            name: "To Infinity And NOT Beyond",
            tooltip: "Reach 1 Infinity.",
            image: "images/102.png",
            done() { return player.i.points.gte(1) },
            unlocked() { return player.i.points.gte(1) },
        },
        103: {
            name: "Unnecessary Inventions",
            tooltip: "Reach 1 Machine.",
            image: "images/103.png",
            done() { return player.m.points.gte(1) },
            unlocked() { return player.m.points.gte(1) },
        },
        104: {
            name: "Too Many Infinities",
            tooltip: "Automate Infinity.",
            image: "images/104.png",
            done() { return hasUpgrade('i', 13) },
            unlocked() { return hasUpgrade('i', 13) },
        },
        105: {
            name: "To Infinity And YES Beyond",
            tooltip: "Go past the number limit.",
            image: "images/105.png",
            done() { return player.points.gte(new Decimal("1e320")) },
            unlocked() { return player.points.gte(new Decimal("1e320")) },
        },
        106: {
            name: "Everything Is Exponential",
            tooltip: "Reach 1e10 Infinity",
            image: "images/106.png",
            done() { return player.i.points.gte(1e10) },
            unlocked() { return player.i.points.gte(1e10) },
        },
        111: {
            name: "They Are Useful Now",
            tooltip: "Reach 4 Machine",
            image: "images/111.png",
            done() { return player.m.points.gte(4) },
            unlocked() { return player.m.points.gte(4) },
        },
        112: {
            name: "We Time Warp",
            tooltip: "Reach 1 Time",
            image: "images/112.png",
            done() { return player.i.time.gte(1) },
            unlocked() { return player.i.time.gte(1) },
        },
        113: {
            name: "Limitless Void",
            tooltip: "Reach 100 Machines",
            image: "images/113.png",
            done() { return player.m.points.gte(100) },
            unlocked() { return player.m.points.gte(100) },
        },
        114: {
            name: "Speed Is Key",
            tooltip: "Reach 1 Velocity",
            image: "images/114.png",
            done() { return player.v.points.gte(1) },
            unlocked() { return player.v.points.gte(1) },
        },
        115: {
            name: "[Achievement Not Found]",
            tooltip: "[Achievement Not Found]",
            done() { return hasAchievement('ach', 114) },
            unlocked() { return hasAchievement('ach', 114) },
        },
        116: {
            name: "Too Many Spares",
            tooltip: "Reach Infinity Boost ^2,000",
            image: "images/116.png",
            done() { return Decimal.min(player.i.points.add(1), new Decimal(100).times(upgradeEffect('m', 11))).gte(2000) },
            unlocked() { return Decimal.min(player.i.points.add(1), new Decimal(100).times(upgradeEffect('m', 11))).gte(2000) },
        },
        121: {
            name: "Absorbbbbb",
            tooltip: "Reach 1 Black Hole",
            image: "images/121.png",
            done() { return player.bl.points.gte(1) },
            unlocked() { return player.bl.points.gte(1) },
        },
        122: {
            name: "Pull The Switch",
            tooltip: "Reach 1 Electricity",
            image: "images/122.png",
            done() { return player.e.electricity.add(player.e.buyableSpent).gte(1) },
            unlocked() { return player.e.electricity.add(player.e.buyableSpent).gte(1) },
        },
        123: {
            name: "Conquer The Impossible",
            tooltip: "Complete 3 Black Hole Challenge",
            image: "images/123.png",
            done() { return hasChallenge('bl', 11) && hasChallenge('bl', 12) && hasChallenge('bl', 21) },
            unlocked() { return hasChallenge('bl', 11) && hasChallenge('bl', 12) && hasChallenge('bl', 21) },
        },
        124: {
            name: "Reality Fragmentation",
            tooltip: "Reach 1 Space Fragment",
            image: "images/124.png",
            done() { return player.sf.points.gte(1) },
            unlocked() { return player.sf.points.gte(1) },
        },
        125: {
            name: "Back In Shape",
            tooltip: "Complete the Fragments. (Excluding Missing Fragments)",
            image: "images/125.png",
            done() { return hasUpgrade('sf', 31) && hasUpgrade('sf', 42) && hasUpgrade('sf', 53) && hasUpgrade('sf', 44) && hasUpgrade('sf', 35) },
            unlocked() { return hasUpgrade('sf', 31) && hasUpgrade('sf', 42) && hasUpgrade('sf', 53) && hasUpgrade('sf', 44) && hasUpgrade('sf', 35) },
        },
        126: {
            name: "Fully Fixed",
            tooltip: "Complete the Full Fragments. (Including Missing Fragments)",
            image: "images/126.png",
            done() { 
                let checkSubset = (parentArray, subsetArray) => {
                    return subsetArray.every((el) => {
                        return parentArray.includes(el)
                    })
                }

                return checkSubset(player.sf.upgrades, [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45, 51, 52, 53, 54, 55])
            },
            unlocked() {
                let checkSubset = (parentArray, subsetArray) => {
                    return subsetArray.every((el) => {
                        return parentArray.includes(el)
                    })
                }

                return checkSubset(player.sf.upgrades, [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45, 51, 52, 53, 54, 55])
            },
        },
        131: {
            name: "There's Particles Now?",
            tooltip: "Reach 1 Electron",
            image: "images/131.png",
            done() { return player.g.electron.gte(1) },
            unlocked() { return player.g.electron.gte(1) },
        },
        132: {
            name: "No More Empty Space",
            tooltip: "Reach 1 Quarks",
            image: "images/132.png",
            done() { return player.g.quarks.gte(1) },
            unlocked() { return player.g.electron.gte(1) },
        },
        133: {
            name: "Yes More Empty Space",
            tooltip: "Reach 1 Space",
            image: "images/133.png",
            done() { return player.s.points.gte(1) },
            unlocked() { return player.s.points.gte(1) },
        },
        134: {
            name: "ABSORBBBBB",
            tooltip: "Reach 1e12 black hole",
            image: "images/134.png",
            done() { return player.bl.points.gte(1e12) },
            unlocked() { return player.bl.points.gte(1e12) },
        },
        135: {
            name: "When? Where? Why?",
            tooltip: "Reach 1 Dilation",
            image: "images/135.png",
            done() { return player.d.points.gte(1) },
            unlocked() { return player.d.points.gte(1) },
        },
        136: {
            name: "Very Gravicool",
            tooltip: "Reach 1 Relativity",
            image: "images/136.png",
            done() { return player.d.relativity.gte(1) },
            unlocked() { return player.d.relativity.gte(1) },
        },
        141: {
            name: "5D Chess Moment",
            tooltip: "Reach 1 total Universe",
            image: "images/141.png",
            done() { return player.u.points.add(player.u.buyableSpent).gte(1) },
            unlocked() { return player.u.points.add(player.u.buyableSpent).gte(1) },
        },
        142: {
            name: "Your Life Is A Lie?",
            tooltip: "Reach 100 Simulation",
            image: "images/142.png",
            done() { return player.si.points.gte(100) },
            unlocked() { return player.si.points.gte(100) },
        },
        143: {
            name: "That Lasted Forever",
            tooltip: "Reach 1 Eternity",
            image: "images/143.png",
            done() { return player.si.eternity.gte(1) },
            unlocked() { return player.si.eternity.gte(1) },
        },
        144: {
            name: "It Dark Matters",
            tooltip: "Reach 1 total Dark Matter",
            image: "images/144.png",
            done() { return player.dm.points.add(player.dm.buyableSpent).gte(1) },
            unlocked() { return player.dm.points.add(player.dm.buyableSpent).gte(1) },
        },
        145: {
            name: "What Happend To Space?",
            tooltip: "Get the first deterioration milestone",
            image: "images/145.png",
            done() { return hasMilestone('de', 0) },
            unlocked() { return hasMilestone('de', 0) },
        },
    },
})