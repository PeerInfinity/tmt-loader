addLayer("ach", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🏆", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFF00",
    nodeStyle() {return {
        "background": "radial-gradient(#FFFF00, #dce28a)" ,
    }},
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "achievements points", // Name of prestige currency
    baseResource: "achievementspoints", // Name of resource prestige is based on
    baseAmount() {return player.ach.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    row: 'side', // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat: {
        "Achievements": {
            content: ['main-display','achievements'],
        },
        "Milestones": {
            content: ['milestones'],
        },
    },
    achievements: {
        rows: 10,
        cols: 6,
        11: {
            name: "Let's start",
            tooltip: "Get 1 alpha point. Reward: 1 AP.",
            done() {
                return player.A.points.gte(1)
            },
            onComplete() {
                addPoints("ach",1)
            }
        },
        12: {
            name: "Nice",
            tooltip: "Get 1 alpha upgrade. Reward: 1 AP.",
            done() {
                return player.A.upgrades.length > 0
            },
            onComplete() {
                addPoints("ach",1)
            }
        },
        13: {
            name: "No way you got 4 digits !",
            tooltip: "Get 1000 alpha points. Reward: 1 AP.",
            done() {
                return player.A.points.gte(1000)
            },
            onComplete() {
                addPoints("ach",1)
            }
        },
        14: {
            name: "Enough boost ?",
            tooltip: "Get 10 Bap(Buyable 2). Reward: 2 AP.",
            done() {
                return getBuyableAmount('A',12).gte(10)
            },
            onComplete() {
                addPoints("ach",2)
            }
        },
        15: {
            name: "1M ?????",
            tooltip: "Get 1M alpha points. Reward: 2 AP.",
            done() {
                return player.A.points.gte(1e6)
            },
            onComplete() {
                addPoints("ach",2)
            }
        },
        16: {
            name: "Wait... what is this thing ?",
            tooltip: "Unlock a New Layer. Reward: 3 AP.",
            done() {
                return player.A.points.gte(1e9)
            },
            onComplete() {
                addPoints("ach",3)
            }
        },
        21: {
            name: "That's more than us...",
            tooltip: "Get 1e10 alpha points. Reward: 5 AP.",
            done() {
                return player.A.points.gte(1e10)
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",5)
            }
        },
        22: {
            name: "Are we really going further ?",
            tooltip: "Get 4 beta upgrades. Reward: 5 AP.",
            done() {
                return player.B.upgrades.length >= 4
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",5)
            }
        },
        23: {
            name: "Is that a gift ?",
            tooltip: "Get 2 beta milestone. Reward: 7 AP. | And x23 points gain.",
            done() {
                return hasMilestone('B',1)
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",7)
            }
        },
        24: {
            name: "Second gift because I don't have ideas",
            tooltip: "Get 10 beta upgrades. Reward: 7 AP. | And x11 alpha gain.",
            done() {
                return player.B.upgrades.length >= 10
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",7)
            }
        },
        25: {
            name: "1De...",
            tooltip: "Get 1e33 alpha points. Reward: 7 AP",
            done() {
                return player.A.points.gte(1e33)
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",7)
            }
        },
        26: {
            name: "Oh ?",
            tooltip: "Get 1 Beta Boost Reward: 8 AP",
            done() {
                return getBuyableAmount('B',11) >= 1
            },
            unlocked() {return hasAchievement('ach',16)},
            onComplete() {
                addPoints("ach",8)
            }
        },
        31: {
            name: "Too much of a beta for me sorry",
            tooltip: "Get 1e50 Beta points Reward: 10 AP",
            done() {
                return player.B.points.gte(1e50)
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",10)
            }
        },
        32: {
            name: "γ",
            tooltip: "Get a gamma: 10 AP",
            done() {
                return player.G.points.gte(1)
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",10)
            }
        },
        33: {
            name: "Gammmmmmmmmma",
            tooltip: "Get 2 gamma upgrades: 10 AP",
            done() {
                return player.G.upgrades.length >= 2
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",10)
            }
        },
        34: {
            name: "γ + γ",
            tooltip: "Get 1 Gamma Milestone: 12 AP",
            done() {
                return player.G.milestones.length >= 1
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",12)
            }
        },
        35: {
            name: "Betatest terminated",
            tooltip: "Get 1e1111 beta points: 10 AP",
            done() {
                return player.B.points.gte("1e1111")
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",10)
            }
        },
        36: {
            name: "Yo what ?",
            tooltip: "Get 1e10K alpha points: 12 AP",
            done() {
                return player.A.points.gte("1e10000")
            },
            unlocked() {return hasAchievement('ach',26)},
            onComplete() {
                addPoints("ach",12)
            }
        },
        41: {
            name: "Half way maybe ?",
            tooltip: "Get 1e500 gamma points: 15 AP",
            done() {
                return player.G.points.gte("1e500")
            },
            unlocked() {return hasAchievement('ach',36)},
            onComplete() {
                addPoints("ach",15)
            }
        },
        42: {
            name: "Deltaaaa",
            tooltip: "Get 1 Delta reset: 15 AP",
            done() {
                return player.D.points.gte("1")
            },
            unlocked() {return hasAchievement('ach',36)},
            onComplete() {
                addPoints("ach",15)
            }
        },
        43: {
            name: "Duplication Power",
            tooltip: "Get 1 Duplicates: 15 AP",
            done() {
                return player.D.duplicates.gte("100")
            },
            unlocked() {return hasAchievement('ach',36)},
            onComplete() {
                addPoints("ach",15)
            }
        },
        44: {
            name: "Duplications for real",
            tooltip: "Get 1 Duplications: 18 AP",
            done() {
                return getBuyableAmount('D',11).gte(1)
            },
            unlocked() {return hasAchievement('ach',36)},
            onComplete() {
                addPoints("ach",18)
            }
        },
        45: {
            name: "Never enough Duplicates",
            tooltip: "Get 1e50 Duplicates: 18 AP",
            done() {
                return player.D.duplicates.gte(1e50)
            },
            unlocked() {return hasAchievement('ach',36)},
            onComplete() {
                addPoints("ach",18)
            }
        },
        46: {
            name: "That's sick !",
            tooltip: "Get 1e500K points: 20 AP",
            done() {
                return player.points.gte("1e500000")
            },
            unlocked() {return hasAchievement('ach',46)},
            onComplete() {
                addPoints("ach",20)
            }
        },
        51: {
            name: "So what ?",
            tooltip: "Get 20 delta Upgrade: 20 AP",
            done() {
                return getUpgradeCount('D') >= 20
            },
            unlocked() {return hasAchievement('ach',46)},
            onComplete() {
                addPoints("ach",20)
            }
        },
        52: {
            name: "A tree inside a Tree",
            tooltip: "Unlock the Upgrade-Tree: 22 AP",
            done() {
                return hasUpgrade('D',46)
            },
            unlocked() {return hasAchievement('ach',46)},
            onComplete() {
                addPoints("ach",22)
            }
        },
    },
    milestones: {
        0: {
            requirementDescription: "... Achievements points",
            effectDescription: "Coming soon...",
            done() { return player.ach.points.gte(50000) },
            style: {'width': '750px'},
        },
    },
}),

addLayer("stat", {
    name: "Statistics", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ST", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: decimalZero,
    }},
    tooltip() {
      return "Statistics"
    },
    color: "#FFFFFF",
    requires: decimalZero, // Can be a function that takes requirement increases into account
    resource: "points", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown() { return true },
    tabFormat: {
        "Main": {
        content:[
            "blank",
        ["raw-html", 
            function () {
                let data = player
            //_______________________________________________________________
                if (player.tab == "stat") {
                let inf = "(inspired by Plague Tree)<br><br>"
                let currency = "___________CURRENCY___________<br></br>"
                let po = "You have "+format(data.points)+" points <br><br>"
                let a = data.A.unlocked?"You have "+format(data.A.points)+" alpha points<br><br>":""
                let b = data.B.unlocked?"You have "+format(data.B.points)+" beta points<br><br>":""
                let g = data.G.unlocked?"You have "+format(data.G.points)+" gamma points<br><br>":""
                let d = data.D.unlocked?"You have "+format(data.D.points)+" delta points<br><br>":""
                let total = "___________TOTAL___________<br><br>"
                let ta = data.A.unlocked?"Total alpha: "+format(data.A.total)+"<br><br>":""
                let tb = data.B.unlocked?"Total beta: "+format(data.B.total)+"<br><br>":""
                let tg = data.G.unlocked?"Total gamma: "+format(data.G.total)+"<br><br>":""
                let td = data.D.unlocked?"Total delta: "+format(data.D.total)+"<br><br>":""
                let tdd = data.D.unlocked?"Total Duplicates: "+format(data.D.totalDuplicates)+"<br><br>":""
                return inf+currency+po+a+b+g+d+total+ta+tb+tg+td+tdd
                }
            }],
            ]
        },
        "Info": {
            content:[
                "blank",["raw-html", "Adding Buyables only Affect the buyable it as been added to, and not the one down the chain (if there is one)<br><br>"
                    +"On the Upgrade-Tree upgrades: <br>"+"Requirement white --> not enough currency<br> Requirement green --> enought currency<br>"
                    +"Also, if multiples upgrades are on the same row, the price will change if you already have one on the same row"
                ]],
        },
    },
})
