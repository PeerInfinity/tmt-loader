addLayer("ach", {
    startData() {return {
        unlocked: true,
        points: new Decimal(0),
        secret: new Decimal(0)
    }},
    symbol: "<small>ACH</small>",
    color: "#E4DF54",
    layerShown: true,
    type: "none",
    resource: "Achievements",
    row: "side",
    tooltip: "Achievements",
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}},
        "milestone"() {return {"width":"600px"}},
        "achievement"() {return {"width":"60px", "height":"60px", "visibility":"visible"}},
    },
    microtabs: {
        index: {
            "Normal": {
                content: ["blank", "achievements"]
            },

            "Secret": {
                content: ["blank", "milestones"]
            }
        }
    },
    tabFormat: [
        ["display-text", function() {return `You have <h2 style="color: ${temp.ach.color}; text-shadow: 0 0 10px ${temp.ach.color}">${formatWhole(player.ach.points)}/37</h2> Achievements and <h2 style="color: ${temp.ach.color}; text-shadow: 0 0 10px ${temp.ach.color}">${formatWhole(player.ach.secret)}/3</h2> Secret Achievments`}],
        "blank",
        ["microtabs", "index"]
    ],
    achievements: {
        11: {
            name: "MX-1",
            done() {return player.money.points.gte("e50")},
            tooltip: "Reach 1.00e50 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        12: {
            name: "MX-2",
            done() {return player.money.points.gte("e125")},
            tooltip: "Reach 1.00e125 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        13: {
            name: "MX-3",
            done() {return player.money.points.gte("1.8e308")},
            tooltip: "Reach 1.80e308 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        14: {
            name: "MX-4",
            done() {return player.money.points.gte("e1000")},
            tooltip: "Reach 1.00e1000 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        15: {
            name: "MX-5",
            done() {return player.money.points.gte("e6500")},
            tooltip: "Reach 1.00e6500 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        16: {
            name: "MX-6",
            done() {return player.money.points.gte("e150,000")},
            tooltip: "Reach 1e150,000 Money",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true}
        },

        21: {
            name: "GPX-1",
            done() {return player.universe.godParticles.gte(1000)},
            tooltip: "Reach 1,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)}
        },

        22: {
            name: "GPX-2",
            done() {return player.universe.godParticles.gte(10000)},
            tooltip: "Reach 10,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)},
        },

        23: {
            name: "GPX-3",
            done() {return player.universe.godParticles.gte(100000)},
            tooltip: "Reach 100,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)}
        },

        24: {
            name: "GPX-4",
            done() {return player.universe.godParticles.gte("e6")},
            tooltip: "Reach 1,000,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)}
        },

        25: {
            name: "GPX-5",
            done() {return player.universe.godParticles.gte("e7")},
            tooltip: "Reach 10,000,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)}
        },

        26: {
            name: "GPX-6",
            done() {return player.universe.godParticles.gte("e8")},
            tooltip: "Reach 100,000,000 God Particles",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(10)}
        },

        31: {
            name: "LPX-1",
            done() {return player.LPrestige.prestigeTimes().gte(10)},
            tooltip: "Prestige layers 10 times",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(16)}
        },

        32: {
            name: "LPX-2",
            done() {return player.LPrestige.prestigeTimes().gte(30)},
            tooltip: "Prestige layers 30 times",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(16)}
        },

        33: {
            name: "LPX-3",
            done() {return player.LPrestige.prestigeTimes().gte(65)},
            tooltip: "Prestige layers 65 times",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(16)}
        },

        34: {
            name: "LPX-4",
            done() {return player.LPrestige.prestigeTimes().gte(125)},
            tooltip: "Prestige layers 125 times",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(16)}
        },

        41: {
            name: "BSTX-1",
            done() {return player.booster.points.gte(25)},
            tooltip: "Reach 25 Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(19)}
        },

        42: {
            name: "BSTX-2",
            done() {return player.booster.points.gte(50)},
            tooltip: "Reach 50 Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(19)}
        },

        43: {
            name: "BSTX-3",
            done() {return player.booster.points.gte(200)},
            tooltip: "Reach 200 Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(19)}
        },

        44: {
            name: "BSTX-4",
            done() {return player.booster.points.gte(4000)},
            tooltip: "Reach 4,000 Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(19)}
        },

        45: {
            name: "BSTX-5",
            done() {return player.booster.points.gte(65000)},
            tooltip: "Reach 65,000 Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(19)}
        },

        51: {
            name: "ABSTX-1",
            done() {return player.booster.altered.heavy.add(player.booster.altered.golden).gte(10)},
            tooltip: "Reach 10 Total Altered Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(35)}
        },

        52: {
            name: "ABSTX-2",
            done() {return player.booster.altered.heavy.add(player.booster.altered.golden).gte(35)},
            tooltip: "Reach 35 Total Altered Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(35)}
        },

        53: {
            name: "ABSTX-3",
            done() {return player.booster.altered.heavy.add(player.booster.altered.golden).gte(100)},
            tooltip: "Reach 100 Total Altered Boosters",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(35)}
        },

        61: {
            name: "SX-1",
            done() {return player.sorbet.points.gte("e100")},
            tooltip: "Reach 1.00e100 Globs",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(45)}
        },

        62: {
            name: "SX-2",
            done() {return player.sorbet.points.gte("e1000")},
            tooltip: "Reach 1.00e1000 Globs",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(45)}
        },

        63: {
            name: "SX-3",
            done() {return player.sorbet.points.gte("e10000")},
            tooltip: "Reach 1e10,000 Globs",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(45)}
        },

        64: {
            name: "SX-4",
            done() {return player.sorbet.points.gte("e100000")},
            tooltip: "Reach 1e100,000 Globs",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(45)}
        },

        71: {
            name: "CX-1",
            done() {return player.colin.points.gte(10)},
            tooltip: "Reach 10 \"Motivation\"",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(81)}
        },

        72: {
            name: "CX-2",
            done() {return player.colin.points.gte(50)},
            tooltip: "Reach 50 \"Motivation\"",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(81)}
        },

        73: {
            name: "CX-3",
            done() {return player.colin.points.gte(125)},
            tooltip: "Reach 125 \"Motivation\"",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(81)}
        },

        81: {
            name: "CDX-1",
            done() {return player.colin.distance.gte(10000)},
            tooltip: "Reach 10 Kilometers of Distance",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(91)}
        },

        82: {
            name: "CDX-2",
            done() {return player.colin.distance.gte(1000000)},
            tooltip: "Reach 1 Megameter of Distance",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(91)}
        },

        83: {
            name: "CDX-3",
            done() {return player.colin.distance.gte("e9")},
            tooltip: "Reach 1 Gigameter of Distance",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(91)}
        },

        89: {
            name: "<angerRed><i>CDX-9</i></angerRed>",
            done() {return player.colin.distance.gte(new Decimal("e9").times(149.597871).times(63239.74).times("eee122"))},
            tooltip: "Reach e1.000e122 Multiverses of Distance",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(91)}
        },

        991: {
            name: "ENDX-1",
            done() {return player.universe.points.gte(80)},
            tooltip: "Complete Chapter 1 (Gooey Economics)",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return true},
            style() {return {"margin-top":"25px"}}
        },

        1001: {
            name: "CHAL-1",
            done() {return player.universe.challengesDone.gte(1)},
            tooltip: "Complete 1 Challenge",
            onComplete() {player.ach.points = player.ach.points.add(1)},
            unlocked() {return player.universe.points.gte(81)}
        }
    },
    milestones: {
        11: {
            done() {return player.secrets[0] == true},
            requirementDescription: "Nothing Happened?",
            effectDescription() {
                if (player.secrets[0] !== true) {
                    return "???"
                } else {
                    return "You touched the changelog but nothing happened. I heard something click nearby and maybe you should check that out... (Coming Soon)"
                }
            },
            onComplete() {player.ach.secret = player.ach.secret.add(1)}
        }
    },
    update() {
    }
})