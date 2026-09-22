addLayer("m", {
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    microtabs: {
        stuff: {
                        "升级": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["upgrades", [1,2,3,4,5,6,7,8,9]]
                    ]
                },
                        "里程碑": {
                            content: [
                                ["blank", "15px"],
                                "milestones"
                            ]
                        },
                },
            },
    upgrades: {
        11: { title: "326",
        description: "获得钥匙 ^2。",
        cost: new EN("2"),

        },
        12: { title: "327",
        description: "获得钥匙 ^4。",
        cost: new EN("2"),
        unlocked() {
            return hasUpgrade("m", 11)
        }
        },
        13: { title: "328",
        description: "获得钥匙 ^8。",
        cost: new EN("2"),
        unlocked() {
            return hasUpgrade("m", 12)
        }
        },
        14: { title: "329",
        description: "获得钥匙 ^16。",
        cost: new EN("2"),
        unlocked() {
            return hasUpgrade("m", 13)
        }
        },
        15: { title: "330",
        description: "获得钥匙 ^32。",
        cost: new EN("2"),
        unlocked() {
            return hasUpgrade("m", 14)
        }
        },
        21: { title: "331",
        description: "获得钥匙 ^64。",
        cost: new EN("3"),
        unlocked() {
            return hasUpgrade("k", 43)
        }
        },
        22: { title: "332",
        description: "获得钥匙 ^128。",
        cost: new EN("3"),
        unlocked() {
            return hasUpgrade("m", 21)
        }
        },
        23: { title: "333",
        description: "获得钥匙 ^256。",
        cost: new EN("3"),
        unlocked() {
            return hasUpgrade("m", 22)
        }
        },
        24: { title: "334",
        description: "获得钥匙 ^512。",
        cost: new EN("3"),
        unlocked() {
            return hasUpgrade("m", 23)
        }
        },
        25: { title: "335",
        description: "获得钥匙 ^1,024 并提升点数获取。",
        cost: new EN("4"),
        unlocked() {
            return hasUpgrade("m", 24)
        }
        },
        31: { title: "336",
        description: "获得钥匙 ^2,048 并再次提升点数获取。",
        cost: new EN("4"),
        unlocked() {
            return hasUpgrade("m", 25)
        }
        },
        32: { title: "337",
        description: "获得钥匙 ^4,096。",
        cost: new EN("5"),
        unlocked() {
            return hasUpgrade("m", 31)
        }
        },
        33: { title: "338",
        description: "获得钥匙 ^8,192。",
        cost: new EN("5"),
        unlocked() {
            return hasUpgrade("m", 32)
        }
        },
        34: { title: "339",
        description: "获得钥匙 ^16,384。",
        cost: new EN("6"),
        unlocked() {
            return hasUpgrade("m", 33)
        }
        },
        35: { title: "340",
        description: "获得钥匙 ^32,768。",
        cost: new EN("7"),
        unlocked() {
            return hasUpgrade("m", 34)
        }
        },
        41: { title: "341",
        description: "获得钥匙 ^65,536。",
        cost: new EN("11"),
        unlocked() {
            return hasUpgrade("k", 55)
        }
        },
        42: { title: "342",
        description: "获得钥匙 ^131,072。",
        cost: new EN("13"),
        unlocked() {
            return hasUpgrade("m", 41)
        }
        },
        43: { title: "343",
        description: "获得钥匙 ^262,144。",
        cost: new EN("15"),
        unlocked() {
            return hasUpgrade("m", 42)
        }
        },
        44: { title: "344",
        description: "获得钥匙 ^524,288。",
        cost: new EN("18"),
        unlocked() {
            return hasUpgrade("m", 43)
        }
        },
        45: { title: "345",
        description: "获得钥匙 ^1,048,576 并提升点数获取。",
        cost: new EN("18"),
        unlocked() {
            return hasUpgrade("m", 44)
        }
        },
        51: { title: "346",
        description: "获得钥匙 ^2,097,152 和光 ^2。",
        cost: new EN("26"),
        unlocked() {
            return hasUpgrade("n", 45)
        }
        },
        52: { title: "347",
        description: "获得钥匙 ^4,194,304 和光 ^2。",
        cost: new EN("32"),
        unlocked() {
            return hasUpgrade("m", 51)
        }
        },
        53: { title: "348",
        description: "获得钥匙 ^8,388,608 和光 ^2。",
        cost: new EN("40"),
        unlocked() {
            return hasUpgrade("m", 52)
        }
        },
        54: { title: "349",
        description: "获得钥匙 ^16,777,216 和光 ^2。",
        cost: new EN("50"),
        unlocked() {
            return hasUpgrade("m", 53)
        }
        },
        55: { title: "350",
        description: "获得光 ^3 并提升点数。",
        cost: new EN("64"),
        unlocked() {
            return hasUpgrade("m", 54)
        }
        },
    /*
      use format(num) whenever displaying a number
    */
   
  },
    name: "金钱", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "💵", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new EN(0),
        auto: false
    }},
    color: "#118C4F",
    requires: new EN("e3.750e9"), // Can be a function that takes requirement increases into account
    resource: "金钱", // Name of prestige currency
    baseResource: "Keys", // Name of resource prestige is based on
    baseAmount() {return player.k.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["l", "i", "h"],
    exponent() {if (hasUpgrade("z", 53)) return new EN(Infinity)
    else return new EN(69)},     
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new EN(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new EN(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    resetsNothing() {return hasUpgrade("o", 25)},
    hotkeys: [
        {key: "m", description: "M：重置获得金钱", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax() { return hasMilestone("m", 1) },
    milestones: {
        1: {requirementDescription: "8 金钱",
         effectDescription: "你可以购买最大数量的金钱。",
            done() { return player.m.points.gte(8)},},
   },
   layerShown(){if (hasUpgrade("z", 53)) return false
    else return (hasUpgrade("l", 45) || player[this.layer].unlocked)},
    autoPrestige() {
        return hasMilestone("o", 2)
    },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("o", 6) && resettingLayer=="o") keep.push("milestones")
        if (hasMilestone("o", 6) && resettingLayer=="o") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("m", keep)
    },
    autoUpgrade() { if (hasUpgrade("o" , 25)) return true},
})