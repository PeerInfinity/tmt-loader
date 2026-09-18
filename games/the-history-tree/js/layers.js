


addLayer("a", {
    name: "Year 1 (2015)", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y1", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff0000",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Knowledge", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["y1"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.66, // Prestige currency exponent
    softcap: new Decimal(1e6), 
    softcapPower(){return new Decimal(1).div(player.points.add(10).log(1e34))
    },
    milestones: {
            0: {requirementDescription: "1e10 Knowledge",
                done() {return player[this.layer].best.gte(1e10)}, // Used to determine when to give the milestone
                effectDescription: "Get a boost on everything in this layer",
                effect() {
                    return player[this.layer].points.add(1).pow(0.07)
                },
                effect() {
                    return player.points.add(1).pow(0.12)
                },
            },
            1: {requirementDescription: "1e450 Knowledge",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(1e450)},
                effectDescription: "Year 2 prestiges resets nothing",
                },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('a', 13)) mult = mult.times(upgradeEffect('a',13))
        if (hasUpgrade('a', 31)) mult = mult.times(upgradeEffect('a',21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "1", description: "1: Reset for Knowledge", onPress(p){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() {
        return hasMilestone("c", 0)
        },
        
    autoPrestige() {
         return hasMilestone("c", 0)
        },
    doReset(resettingLayer) {
         let keep = []
         if (hasMilestone("c", 0)) keep.push("upgrades")
         if (hasMilestone("c", 0)) keep.push("milestones")
         if (layers[resettingLayer].row > this.row) layerDataReset("a", keep)
        },
                  
    layerShown(){return true},
    
    upgrades:{
        11: {
            title: "Origin",
            description: "Gain 2.4x more points per second.",
            cost: new Decimal(1),
            unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
                branches: [12],
        },
        12: {
            unlocked() { return (hasUpgrade(this.layer, 11))},
            title: "Inspiration I",
            description: "Gain more points based on your knowledge points.",
            cost: new Decimal(2),
            effect() {
                let power_a12 = new Decimal(Math.log(player[this.layer].points.add(1).pow(0.49))).times(100).add(1)
                return power_a12
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
            
        },
        13: {
            unlocked() { return (hasUpgrade(this.layer, 12))},
            title: "Synergy",
            description: "Gain more knowledge based on your points.",
            cost: new Decimal(100),
            effect() {
                let power_a13 = new Decimal(Math.log(player.points.add(1).pow(0.21))).add(1)
                if (hasAchievement('b', 13)) power_a13 = player.points.add(2).pow(0.21)
                softcap(power_a13, new Decimal(1e30), new Decimal(1).div(Math.log(power_a13)))
                return power_a13
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        14: {
            unlocked() { return (hasUpgrade(this.layer, 12))},
            title: "Optimisation I",
            description: "Gain more knowledge and points synergized together.",
            cost: new Decimal(1000),
            effect() {
                return player.points.add(1).pow(0.55)
            },
            effect() {
                return player[this.layer].points.add(1).pow(0.27)
            },
        },
        21: {
            unlocked() { return (hasUpgrade(this.layer, 14))},
            title: "Project Stellosphere",
            description: "Gain more points based on best Stars you have (Which can be obtained in Year 2016).",
            cost: new Decimal(7500),
            effect() {
                let power_a21 = new Decimal (2).pow(player.c.best).pow(0.2)
                if (hasChallenge('c', 12)) power_a21 = power_a21.times(player.points.add(1)).pow(0.1)
                if (hasUpgrade('a', 31)) power_a21 = power_a21.times(upgradeEffect('a', 31))
                softcap(power_a21, new Decimal(1e10), new Decimal(1).div(power_a21.pow(0.3)))
                return power_a21
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        22: {
            unlocked() { return (hasUpgrade(this.layer, 21))},
            title: "Village Searching",
            description: "Gain more knowledge based on your achievements.",
            cost: new Decimal(1e7),
            effect() {
                let power_a22 = new Decimal (2).pow(player.b.points).pow(0.2)
                if (hasChallenge('c', 12)) power_a22 = power_a22.times(player.points.add(1)).pow(0.1)
                softcap(power_a22, new Decimal(1e10), new Decimal(1).div(power_a22.pow(0.3)))
                return power_a22
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        23: {
            unlocked() { return (hasUpgrade(this.layer, 22))},
            title: "Premiere",
            description: "Gain more points based on your Y2-challenge completion.",
            cost: new Decimal(1e15),
            effect() {
                let power_a23 = new Decimal (2).pow(Object.values(player.c.challenges).reduce((a,b) => a+b)).pow(6)
                softcap(power_a23, new Decimal(1e10), new Decimal(1).div(Math.log(power_a23)))
                return power_a23
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        24: {
            unlocked() { return (hasUpgrade(this.layer, 23))},
            title: "Loyalty I",
            description: "Star boosts are stronger based on your knowledge.",
            cost: new Decimal(1e27),
            effect() {
                let power_a24 = new Decimal (1).times(player.a.points).pow(0.1).add(1)
                softcap(power_a24, new Decimal(1e10), new Decimal(1).div(Math.log(power_a24)))
                return power_a24
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        31: {
            unlocked() { return (hasUpgrade(this.layer, 24))},
            title: "Stronger spaceship",
            description: "Upgrade 'Project Stellosphere' is stronger based on your Stars, and can now boost Knowledge gain.",
            cost: new Decimal(1e34),
            effect() {
                let power_a31 = new Decimal (1).times(2).pow(player.c.points)
                softcap(power_a31, new Decimal(1e4), new Decimal(1).div(Math.log(Math.log(power_a31.add(10)))))
                return power_a31
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        32: {
            unlocked() { return (hasUpgrade(this.layer, 24))},
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal(1e6969),
            effect() {
                let power_a32 = new Decimal (1).times(player.a.points).pow(0.1).add(1)
                softcap(power_a32, new Decimal(1e10), new Decimal(1).div(Math.log(power_a32)))
                return power_a32
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        33: {
            unlocked() { return (hasUpgrade(this.layer, 24))},
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal(1e6969),
            effect() {
                let power_a33 = new Decimal (1).times(player.a.points).pow(0.1).add(1)
                softcap(power_a33, new Decimal(1e10), new Decimal(1).div(Math.log(power_a33)))
                return power_a33
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        34: {
            unlocked() { return (hasUpgrade(this.layer, 24))},
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal(1e6969),
            effect() {
                let power_a34 = new Decimal (1).times(player.a.points).pow(0.1).add(1)
                softcap(power_a34, new Decimal(1e10), new Decimal(1).div(Math.log(power_a34)))
                return power_a34
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
    },
    
})
addLayer("b", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    resource: "achievement power", 
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    effect(){
        return Decimal.pow(1.1, player[this.layer].points)
    },
    effectDescription(){
        return "multiplying point gain by " + format(tmp[this.layer].effect)
        /*
          use format(num) whenever displaying a number
        */
      },
    achievementPopups: true,
    achievements: {
        11: {
            name: "2015 - The knowledge is growing",
            done() {return (hasUpgrade('a', 11))},  // This one is a freebie
            goalTooltip: "Get your first upgrade.", // Shows when achievement is not completed
            onComplete() {
                player.b.points = player.b.points.add(1) 
            },
        },
        12: {
            name: "Stellosphere",
            done() {return (hasUpgrade('a', 14))},  // This one is a freebie
            goalTooltip: "Get your 4th upgrade.", // Shows when achievement is not completed
            onComplete() {
                player.b.points = player.b.points.add(1) 
            },
        },
        13: {
            name: "Scientific Notation",
            done() {return player.points.gte(1e6)},  // This one is a freebie
            goalTooltip: "Get 1,000,000 points. Reward: add 1 to the base of point gain.", // Shows when achievement is not completed
            onComplete() {
                player.b.points = player.b.points.add(1)
            },
        },
        21: {
            name: "Happy New Year!",
            done() {return player.c.points.gte(1)},  // This one is a freebie
            goalTooltip: "Get 1 star. Reward: add 1 to the base of the upgrade 'Synergy'.", // Shows when achievement is not completed
            onComplete() {
                player.b.points = player.b.points.add(1)
            },
        },
    },
},)
addLayer("c", {
    name: "Year 2 (2016)", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y2", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0080ff",
    requires: new Decimal(6e6), // Can be a function that takes requirement increases into account
    branches: ["y2"],
    resource: "Stars", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2.44, // Prestige currency exponent
    softcap: new Decimal(8), 
        softcapPower: new Decimal(0.22),
    effect(){
        let effect1 = new Decimal (1)
        if (player.c.points >= 1) effect1 = effect1.times(2).pow(player.c.points)
        if (hasChallenge('c', 11)) effect1 = effect1.times(player.c.points).pow(3)
        if (hasUpgrade('a', 24)) effect1 = effect1.times(upgradeEffect('a', 24))
        if (inChallenge('c', 11)) effect1 = Math.sqrt(effect1)
        if (inChallenge('c', 12)) effect1 = Math.sqrt(effect1)
        return effect1

  /*
    you should use this.layer instead of <layerID>
    Decimal.pow(num1, num2) is an easier way to do
    num1.pow(num2)
  */
    },
    effectDescription(){
        return "multiplying point gain by " + format(tmp[this.layer].effect)
        /*
          use format(num) whenever displaying a number
        */
      },
    canBuyMax() {
        return hasChallenge("c", 12)
        },
        
    milestones: {
            0: {requirementDescription: "5 Stars",
                done() {return player[this.layer].best.gte(5)}, // Used to determine when to give the milestone
                effectDescription: "Year 2 prestiges resets nothing, and gain 1% of the points you get every second.",
                effect() {
                    return player[this.layer].points.add(1).pow(0.22)
                },
                effect() {
                    return player.points.add(1).pow(0.21)
                },
            },
            1: {requirementDescription: "14 Stars",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(14)},
                effectDescription: "Get a boost on the layer boost formula",
                },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "2", description: "2: Reset for Stars", onPress(p){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            unlocked() {return player[this.layer].best.gte(1)},
            title: "Stargazing",
            description: "Gain more knowledge based on your Stars.",
            cost: new Decimal(7),
            effect() {
                return player[this.layer].points.add(1).pow(player.c.points).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        12: {
            unlocked() { return (hasUpgrade(this.layer, 11))},
            title: "Star Projector",
            description: "Gain even more points based on your Stars.",
            cost: new Decimal(10),
            effect() {
                return player.points.add(1).log(player.c.points.pow(0.1)).add(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        13: {
            unlocked() { return (hasUpgrade(this.layer, 12))},
            title: "Primary 4",
            description: "Further boost point gain based on your effect of 'Stargazing'.",
            cost: new Decimal(13),
            effect() {
                return new Decimal(3).times(upgradeEffect('c', 11).pow(4.8)).add(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
    },
    challenges: {
        11: {
            name: "Degenerate Era",
            challengeDescription: "The effect of stars have been square rooted.",
            canComplete: function() {return player.points.gte(1e22)},
            goalDescription: '1e22 points',
            rewardDescription: 'Get a boost on Star boost formula.'
        },
        12: {
            name: "Alpha Decay",
            challengeDescription: "All effects from the previous challenges + Point gain is squared",
            canComplete: function() {return player.points.gte(1e17)},
            goalDescription: '1e17 points',
            rewardDescription: 'The upgrade "Village Searching" uses a better formula and you can now buy max Stars.'
        },
    },
    layerShown(){return true},
})