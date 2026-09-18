addLayer("s", {  
    name: "Stones",  
    symbol: "S",  
    position: 0,  
  
    startData() {  
        return {  
            unlocked: true,  
            points: new Decimal(1),  
        }  
    },  
  
    color: "#808080",  
    requires: new Decimal(10),  
  
    resource: "Stones",  
    baseResource: "Rocks",  
    baseAmount() {  
        return player.points  
    },  
  
    type: "normal",  
    exponent: 0.5,  
  
    gainMult() {  
        mult = new Decimal(1)  
        return mult  
    },  
  
    gainExp() {  
        return new Decimal(1)  
    },  
  
    doReset(resettingLayer) {  
        if (resettingLayer == "c") {  
            let keep = []  
            if (hasUpgrade('c', 12)) keep.push("upgrades")  
            if (hasMilestone('m', 6)) keep.push("challenges")  
            layerDataReset(this.layer, keep)  
        }  
    },  
  
    row: 1,  
  
    passiveGeneration() {  
        if (hasMilestone('m', 3)) {  
            return 0.5  
        }  
    },  
  
    hotkeys: [  
        {key: "s", description: "S: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},  
    ],  
  
    layerShown(){return true},  
  
    upgrades: {  
        11: {  
            title: "The Beginning",  
            description: "Start generating rocks",  
            cost: new Decimal(1)  
        },  
  
        12: {  
            title: "Stone Upgrade 1",  
            description: "Doubles rock gain",  
            cost: new Decimal(2),  
        },  
  
        13: {  
            title: "Stone Upgrade 2",  
            description: "Triples rock gain",  
            cost: new Decimal(3),  
        },  
  
14: {
    title: "Stone Upgrade 3",
    description: "Stones boost Rock gain",
    cost: new Decimal(10),
    effect() {
        let boost = 0
        if (hasUpgrade('s', 23)) boost = boost + 0.25
        if (hasMilestone('m', 3)) boost = boost + 0.07
        if (hasChallenge('s', 21)) boost = boost + 0.05

        let effect = player[this.layer].points.add(1).pow(0.5 + boost)
        let softcap = new Decimal("1e15")

        if (effect.gt(softcap)) {
            effect = softcap.times(
                effect.div(softcap).pow(new Decimal(1).div(3))
            )
        }

        return effect
    },
    effectDisplay() {
        return format(upgradeEffect(this.layer, this.id))+"x"
    }
},
        
        21: {  
            title: "Stone Upgrade 4",  
            description: "2.5x rock gain",  
            cost: new Decimal(30),  
        },  
  
        22: {  
            title: "Stone Upgrade 5",  
            description: "Rocks boost Stone gain",  
            cost: new Decimal(65),  
            effect() {  
                if (hasUpgrade('s', 43)) return player.points.add(1).pow(0.25)  
                else return player.points.add(1).pow(0.15)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            },  
        },  
  
        23: {  
            title: "Stone Upgrade 6",  
            description: "Increases the effect of SU3",  
            cost: new Decimal(250),  
        },  
  
        24: {  
            title: "Stone Upgrade 7",  
            description: "5x Stone gain",  
            cost: new Decimal(1000),  
        },  
  
        31: {  
            title: "Stone Upgrade 8",  
            description: "Here. Have a 1x multiplier. :Troll:",  
            cost: new Decimal(12500),  
        },  
  
        32: {  
            title: "Stone Upgrade 9",  
            description: "Rocks boost itself",  
            cost: new Decimal("1e6"),  
            effect() {  
                return player.points.add(1).pow(0.1)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            },  
        },  
  
        33: {  
            title: "Stone Upgrade 10",  
            description: "Stone points boost itself",  
            cost: new Decimal("1.5e7"),  
            effect() {  
                return player.points.add(1).pow(0.1)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            },  
        },  
  
        41: {  
            title: "Stone Upgrade 11",  
            description: "Doubles rock gain... again.",  
            cost: new Decimal(1e9),  
        },  
  
        42: {  
            title: "Stone Upgrade 12",  
            description: "Double Stone gain.",  
            cost: new Decimal(1.5e11),  
        },  
  
        43: {  
            title: "Stone Upgrade 13",  
            description: "Increase the effects of SU5.",  
            cost: new Decimal(2.5e12),  
        },  
  
        44: {  
            title: "Finally... a new layer.",  
            description: "Unlocks the next 2 layers: Coal and Iron.",  
            cost: new Decimal(5e15),  
        },  
  
        51: {  
            title: "Stone Upgrade 14.",  
            description: "1.5x Rock gain.",  
            cost: new Decimal(1e25),  
            unlocked() {  
                return hasMilestone('m', 4)  
            }  
        },  
  
        52: {  
            title: "Stone Upgrade 15.",  
            description: "1.5x Stone gain.",  
            cost: new Decimal(2.5e27),  
            unlocked() {  
                return hasMilestone('m', 4)  
            }  
        },  
  
        53: {  
            title: "Stone Upgrade 16.",  
            description: "2x Milestone gain.",  
            cost: new Decimal(5e28),  
            unlocked() {  
                return hasMilestone('m', 4)  
            }  
        },  
    },  
  
    challenges: {  
        11: {  
            name: "Stone Challenge 1",  
            challengeDescription: "Rocks are square-rooted",  
            canComplete: function() {return player.points.gte(5000)},  
            goalDescription: "5,000 Points",  
            rewardDescription: "10x stone points gain",  
            unlocked() { return true }  
        },  
  
        12: {  
            name: "Stone Challenge 2",  
            challengeDescription: "Rock gain is cube-rooted",  
            canComplete: function() {return player.points.gte(50000)},  
            goalDescription: "50,000 Points",  
            rewardDescription: "5x stone points gain",  
            unlocked() { return true }  
        },  
  
        21: {  
            name: "Stone Challenge 3",  
            challengeDescription: "Rock gain is rooted to the 5th.",  
            canComplete: function() {return player.points.gte(250000)},  
            goalDescription: "250,000 Points",  
            rewardDescription: "Another boost to SU3.",  
            unlocked() { return true }  
        },  
  
        22: {  
            name: "Stone Challenge 4",  
            challengeDescription: "Rock gain is rooted to the 6th...",  
            canComplete: function() {return player.points.gte(2500000)},  
            goalDescription: "2,500,000 Rocks",  
            rewardDescription: "2x to Milestones. ",  
            unlocked() { return true }  
        },  
    },  
  
    gainMult() {  
        let mult = new Decimal(1)  
        if (hasUpgrade('s', 22)) mult = mult.times(upgradeEffect('s', 22))  
        if (hasUpgrade('s', 24)) mult = mult.times(5)  
        if (hasChallenge('s', 11)) mult = mult.times(10)  
        if (hasChallenge('s', 12)) mult = mult.times(5)  
        if (hasUpgrade('s', 33)) mult = mult.times(upgradeEffect('s', 33))  
        if (hasUpgrade('s', 42)) mult = mult.times(2)  
        if (hasUpgrade('s', 52)) mult = mult.times(1.5)  
        if (hasMilestone('m', 1)) mult = mult.times(2)  
        if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11))  
        if (hasUpgrade('I', 13)) mult = mult.times(upgradeEffect('I', 13))  
        if (hasUpgrade('I', 14)) mult = mult.times(1.25)  
        return mult  
    },  
})  
  
addLayer("m", {  
    name: "Milestones",  
    symbol: "M",  
    position: 1,  
  
    startData() {  
        return {  
            unlocked: true,  
            points: new Decimal(0),  
        }  
    },  
  
    color: "#483D8B",  
    requires: new Decimal(1e10),  
  
    resource: "Milestones",  
    baseResource: "Rocks",  
    baseAmount() {  
        return player.points  
    },  
  
    type: "normal",  
    exponent: 0.1,  
  
    gainMult() {  
        mult = new Decimal(1)  
        if (hasUpgrade('s', 53)) mult = mult.times(2)  
        if (hasUpgrade('I', 14)) mult = mult.times(1.25)  
        if (hasChallenge('s', 22)) mult = mult.times(2)  
  
        return mult  
    },  
  
    gainExp() {  
        return new Decimal(1)  
    },  
  
    row: 0,  
  
    doReset(resettingLayer) {  
        layerDataReset(this.layer, ["points"], ["milestones"])  
    },  
  
    milestones: {  
        1: {  
            requirementDescription: "1 Milestone",  
            effectDescription: "Double Stone gain",  
            done() {  
                return player.m.points.gte(1)  
            }  
        },  
  
        2: {  
            requirementDescription: "50 Milestones",  
            effectDescription: "Double Rock gain",  
            done() {  
                return player.m.points.gte(50)  
            }  
        },  
  
        3: {  
            requirementDescription: "250 Milestones",  
            effectDescription: "Gain 50% of gainable Stone points a second.",  
            done() {  
                return player.m.points.gte(250)  
            }  
        },  
  
        4: {  
            requirementDescription: "2,500 Milestones",  
            effectDescription: "SU3 is upgraded again + new Stone upgrades.",  
            done() {  
                return player.m.points.gte(2500)  
            }  
        },  
  
        5: {  
            requirementDescription: "20,000 Milestones",  
            effectDescription: "1.5x Coal gain (also some new Coal upgrades).",  
            done() {  
                return player.m.points.gte(20000)  
            }  
        },  
  
        6: {  
            requirementDescription: "500,000 Milestones",  
            effectDescription: "Stone challenges are now kept on resets!",  
            done() {  
                return player.m.points.gte(500000)  
            }  
        },  
  
        7: {  
            requirementDescription: "25,000,000 Milestones",  
            effectDescription: "More Coal upgrades (WIP RN. More to come soon!)",  
            done() {  
                return player.m.points.gte(25000000)  
            }  
        },  
    },  
  
    layerShown(){return true},  
})  
  
addLayer("c", {  
    name: "Coal",  
    symbol: "C",  
    position: 0,  
  
    startData() {  
        return {  
            unlocked: true,  
            points: new Decimal(0),  
        }  
    },  
  
    color: "#B87333",  
  
    requires: new Decimal(1e15),  
    resource: "Coal",  
    baseResource: "Stones",  
    baseAmount() {  
        return player.s.points  
    },  
  
    type: "normal",  
    exponent: 0.1,  
  
    row: 2,  
  
    upgrades: {  
        11: {  
            title: "Coal Upgrade 1",  
            description: "Coal multiplies Stone gain.",  
            cost: new Decimal(5),  
            effect() {  
                if (hasUpgrade('I', 11)) return player.c.points.add(1).pow(0.15)  
                else  
                    return player.c.points.add(1).pow(0.2)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            }  
        },  
  
        12: {  
            title: "Coal Upgrade 2",  
            description: "Stone upgrades are no longer lost.",  
            cost: new Decimal(12),  
        },  
  
        13: {  
            title: "Coal Upgrade 3",  
            description: "1.5x to Coal.",  
            cost: new Decimal(25),  
        },  
  
        21: {  
            title: "Coal Upgrade 4",  
            description: "Coal multiplies Coal gain.",  
            cost: new Decimal(50000),  
  
            unlocked() {  
                return hasMilestone('m', 7)  
            },  
  
            effect() {  
                return player.c.points.add(1).pow(0.1)  
            },  
  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            }  
        },  
  
        22: {  
            title: "Coal upgrade 5",  
            description: "Coal multiplies Rock gain.",  
            cost: new Decimal(150000),  
  
            unlocked() {  
                return hasMilestone('m', 7)  
            },  
  
            effect() {  
                return player.c.points.add(1).pow(0.15)  
            },  
  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            }  
        },  
        
        23: {
            title: "Coal Upgrade 6",
            description: "Adds ^0.01 to Rock gain per purchase.",
            cost: new Decimal(250000),
            repeatable: true,
            costScaling: new Decimal(2),
            effect() {
                return new Decimal(0.01).times(player.c.upgrades[23])
            },
            effectDisplay() {
                return "^"+format(upgradeEffect(this.layer, this.id))
            }
        },
    },  
  
    branches: ["s"],  
  
    gainMult() { // Calculate the multiplier for main currency from bonuses  
        let mult = new Decimal(1)  
        if (hasMilestone('m', 4)) mult = mult.times(1.5)  
        if (hasUpgrade('c', 13)) mult = mult.times(1.5)  
        if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21))  
        return mult  
    },  
  
    layerShown(){return hasUpgrade('s', 44)},  
})  
  
addLayer("I", {  
    name: "Iron",  
    symbol: "I",  
    position: 0,  
  
    startData() {  
        return {  
            unlocked: true,  
            points: new Decimal(0),  
        }  
    },  
  
    color: "#f1c40f",  
  
    requires: new Decimal(50),  
    resource: "Iron",  
    baseResource: "Coal",  
    baseAmount() {  
        return player.c.points  
    },  
  
    type: "normal",  
    exponent: 0.55,  
  
    row: 3,  
  
    onPrestige(gain) {  
        layerDataReset('c')  
    },  
  
    upgrades: {  
        11: {  
            title: "Iron Upgrade 1",  
            description: "Small boost to the first Coal upgrade.",  
            cost: new Decimal(1)  
        },  
  
        12: {  
            title: "Iron Upgrade 2",  
            description: "Coal boosts Iron gain.",  
            cost: new Decimal(5),  
            effect() {  
                return player.c.points.add(1).pow(0.2)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            }  
        },  
  
        13: {  
            title: "Iron Upgrade 3",  
            description: "Iron boosts Stone gain.",  
            cost: new Decimal(30),  
            effect() {  
                return player.I.points.add(1).pow(0.1)  
            },  
            effectDisplay() {  
                return format(upgradeEffect(this.layer, this.id))+"x"  
            }  
        },  
  
        14: {  
            title: "Iron Upgrade 4",  
            description: "1.25x multiplier for Rocks, Stones, and Milestones.",  
            cost: new Decimal(75),  
        },  
    },  
  
    branches: ["c"],  
  
    layerShown(){return hasUpgrade('s', 44)},  
})
