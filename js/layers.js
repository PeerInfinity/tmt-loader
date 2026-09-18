
addLayer("t", {
    name: "Trees", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},

    color: "#38e75e",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Trees", // Name of prestige currency
    baseResource: "Seeds", // Name of resource prestige is based on
    baseAmount() {return player.$.seeds}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.7, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)

        if (hasUpgrade("$", 13)) {
            mult = mult.times(3)
        }

        if (hasUpgrade("$", 22)) {
            mult = mult.times(2)
        }

        if (hasUpgrade("$", 32)) {
            mult = mult.times(1.25)
        }

        if (hasUpgrade("$", 122)) {
            mult = mult.times(2)
        }

        if (hasUpgrade("$", 41)) {
            mult = mult.times(5)
        }
        if (hasMilestone("r", 2)) {mult = mult.times(tmp.r.skillEffect)}
        if (hasUpgrade("r", 13)) {mult = mult.times(tmp.r.skillEffect)}
        if (hasUpgrade("d", 13)) {mult = mult.times(3)}
        if (hasUpgrade("d", 14)) {mult = mult.times(tmp.d.upgrades[14].effect)}

        mult = mult.times(tmp.r.effect)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    doReset(Trees) {
        if (layers[Trees].row > 0) {
            let keep = []
            let kept = []
            if (hasMilestone("r", 6)) {keep.push("upgrades")}

            layerDataReset(this.layer, keep) 
            player[this.layer].upgrades.push(kept)
        }
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for trees", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    infoboxes: {
        Help: {
            title() {return "Welcome to Trees!"},
            body() {return "This layer completes the first Cycle of Resources, Trees > Money > Seeds! [yes theres more cycles, be scared], be sure to avoid neglecting any of them, for a matter of fact, i wouldnt recommend for you to buy the first Tree Upgrade(tm) yet! go buy some Money Upgrades first!"}
                
        },
    },

    upgrades: {
        11: {
            title() {return "Root Motivator"},
            description() {return "A Nice general boost! 1.8x Seeds, 1.5x Money, 2x Apples"},
            cost: 1
        },

        12: {
            unlocked() { return hasUpgrade("t", 11) },
            title() {return "Composting!"},
            description() {return "Use some tree waste on your trees, Apparently they give more apples now, 2x Apples Again"},
            cost: 5
        },

        13: {
            unlocked() { return hasUpgrade("t", 12) },
            title() {return "Money Talks"},
            description() {return "Did you max out your Money Upgrades yet? if not this should help you, 5x Money"},
            cost: 15
        },

        14: {
            unlocked() { return hasUpgrade("t", 13) },
            title() {return "Who said we were done with you?"},
            description() {return "Unlock 4 More Seed Upgrades, youre not getting the next layers yet!"},
            cost: 100
        },

        21: {
            unlocked() { return hasUpgrade("$", 114) },
            title() {return "These are getting annoying..."},
            description() {return "Automatically grow Sprouts"},
            cost: 2500
        },

        22: {
            unlocked() { return hasUpgrade("t", 21) },
            title() {return "Tree Spurts"},
            description() {return "Keep the first Row of Seed Upgrades, noticed a pattern yet?"},
            cost: 7500
        },

        23: {
            unlocked() { return hasUpgrade("t", 22) },
            title() {return "Rebellious Sprouts"},
            description() {return "Some Sprouts decide to grow into full on Trees! Gain 1% of Trees youd gain/s (yes were automating this first)"},

            cost: 15000
        },

        24: {
            unlocked() { return hasUpgrade("t", 23) },
            title() {return "These were annoying"},
            description() {return "Also Automate Hyper-Sprouts, and 2x Money for your troubles"},
            cost: 25000
        },
    },

    passiveGeneration() {
        Gain = new Decimal(0)
        
        if (hasUpgrade("t", 23)) { 
            Gain = Gain.plus(0.01)
        if (hasMilestone("r", 3)) {
            Gain = Gain.plus(0.04)
        }
            if (hasUpgrade("$", 41)) { 
                Gain = new Decimal(0.4)
            }
        }
        return Gain
    },
    
    autoUpgrade() {
        if (hasMilestone("r", 3)) {
        return true
        }
        
        return false
    },
    

    effect() {
        mult = player.t.points
        return mult
    },
    
    effectDescription() {
        return "Which are generating "+format(tmp.t.effect)+" Base Apples per Second [Before Boosts]"
    },
    
    layerShown(){return true}
})

addLayer("$", {
    name: "Money", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "$", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        seeds: new Decimal(0),
        rotpenalty: new Decimal(0.99),
        stamp: Date.now(),
        stamp2: Date.now(),
        updatedtime: Date.now(),
        seedGain: new Decimal(2),
        CentResetSeedGain: new Decimal(0),
        NextGain: new Decimal(0),
        seedCD: 4500,
    }},

    doReset(Trees) {
        keep = []
        keepUpgrades = []
        
        if (layers[Trees].row > 0) { 
            layerDataReset(this.layer, keep) 
        }

        if (layers[Trees].symbol != "T") {return}

        if (hasUpgrade("$", 11)) {keepUpgrades.push(11)}
        if (hasUpgrade("$", 12)) {keepUpgrades.push(12)}
        if (hasUpgrade("$", 13)) {keepUpgrades.push(13)}
        if (hasUpgrade("$", 14)) {keepUpgrades.push(14)}

        if (hasUpgrade("$", 114)) {keepUpgrades.push(114)}

        if (hasUpgrade("t", 22)) {keepUpgrades.push(101), keepUpgrades.push(102), keepUpgrades.push(103), keepUpgrades.push(104)}

        if (hasUpgrade("$", 21)) {keepUpgrades.push(21)}
        if (hasUpgrade("$", 22)) {keepUpgrades.push(22)}
        if (hasUpgrade("$", 23)) {keepUpgrades.push(23)}
        if (hasUpgrade("$", 24)) {keepUpgrades.push(24)}

        if (hasUpgrade("$", 31)) {keepUpgrades.push(31)}
        if (hasUpgrade("$", 32)) {keepUpgrades.push(32)}
        if (hasUpgrade("$", 33)) {keepUpgrades.push(33)}
        if (hasUpgrade("$", 34)) {keepUpgrades.push(34)}
        if (hasUpgrade("$", 41)) {keepUpgrades.push(41)}
        if (hasUpgrade("$", 34)) {if (hasUpgrade("$", 122)) {keepUpgrades.push(122)}}

        layerDataReset(this.layer, keep)
        player[this.layer].upgrades = keepUpgrades
    },

    branches: ["t"],
    color: "#259116",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Money", // Name of prestige currency

    baseResource: "Apples", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.35, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)

        return mult
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        Exp = new Decimal(1)

        if (hasUpgrade("$", 12)) {
            Exp = Exp.plus(0.8605)
        }

        if (hasUpgrade("d", 12)) {
            Exp = Exp.plus(0.05)
        }

        return Exp
    },
    
    automate() {
        if (hasMilestone("r", 5)) {
            buyUpgrade("$", 11)
            buyUpgrade("$", 12)
            buyUpgrade("$", 13)
            buyUpgrade("$", 14)
            buyUpgrade("$", 21)
            buyUpgrade("$", 22)
            buyUpgrade("$", 23)
            buyUpgrade("$", 24)
            buyUpgrade("$", 31)
            buyUpgrade("$", 32)
            buyUpgrade("$", 33)
            buyUpgrade("$", 34)
            buyUpgrade("$", 41)
        }
    },

    directMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("t", 11)) {mult = mult.times(1.5)}
        if (hasUpgrade("t", 13)) {mult = mult.times(5)}
        if (hasUpgrade("$", 21)) {mult = mult.times(tmp.$.upgrades[21].effect)}
        if (hasUpgrade("$", 24)) {mult = mult.times(3)}
        if (hasUpgrade("$", 121)) {mult = mult.times(tmp.$.upgrades[121].effect)}
        if (hasUpgrade("t", 24)) {mult = mult.times(2)}
        if (hasMilestone("r", 2)) {mult = mult.times(tmp.r.skillEffect)}
        if (hasUpgrade("d", 14)) {mult = mult.times(2)}
        mult = mult.times(tmp.d.effect)

        return mult
    },

    rotCalc() {
        if (hasMilestone ("r", 5)) {return new Decimal(1)}
        rotpenalty = new Decimal(0.99)
        if (hasUpgrade("$", 112)) {rotpenalty = new Decimal(0.997)}
        if (hasUpgrade("$", 23)) {rotpenalty = rotpenalty.plus(0.001)}

        return rotpenalty
    },

    seedDivision() {

        seeds = player.$.seeds

        if (!player.$.seeds.times(player.$.rotpenalty).lt(1)) {
        seeds = player.$.seeds.times(player.$.rotpenalty)
        }

        if (player.$.seeds.times(player.$.rotpenalty).lt(1)) {
        if (!player.$.seeds.times(player.$.rotpenalty).lt(0.001) || (hasMilestone("r", 1) && player.$.seeds.times(player.$.rotpenalty).lt(0.001)))  {
        seeds = new Decimal(1)
        }
        }

        return seeds

    },
    
    seedReset() {
        MultiplyBy = new Decimal(1)
        toGain = player.$.points.pow(0.5)

        if (hasUpgrade("$", 104)) {
        MultiplyBy = MultiplyBy.times(tmp.$.upgrades[104].effect)
        }

	    if (hasUpgrade("t", 11)) {MultiplyBy = MultiplyBy.times(2.1)}
	    if (hasUpgrade("t", 22)) {MultiplyBy = MultiplyBy.times(1.5)}
	    if (hasUpgrade("$", 113)) {MultiplyBy = MultiplyBy.times(0.5)}
	    if (hasUpgrade("$", 24)) {MultiplyBy = MultiplyBy.times(0.8)}
        if (hasUpgrade("$", 31)) {MultiplyBy = MultiplyBy.times(1.25)}
        if (hasUpgrade("d", 15)) {MultiplyBy = MultiplyBy.times(tmp.d.upgrades[15].effect)}


        toGain = toGain.times(MultiplyBy)
        NextGain = player.$.points.pow(0.5).mul(MultiplyBy).plus(1).floor().div(MultiplyBy).pow(2)
        
        if (toGain.gte(new Decimal(1000000))) {toGain = new Decimal(1000000)}
        
        return [toGain, NextGain]
    },
    
    autoClick() {
        if (player.$.stamp + player.$.seedCD < Date.now()) {
        if (!player.$.seeds.lt(1)) {
            if (hasUpgrade("t", 21) || hasMilestone("r", 1)) {
                seeds = player.$.seeds.plus(player.$.seedGain)
                stamp = Date.now();
                return [seeds, stamp]
            }

            return false
        } else {return false}
        } else {return false}
    },

    autoClick2() {
        if (player.$.stamp2 + player.$.seedCD*5 < Date.now()) {
        if (!player.$.seeds.lt(1)) {
            if (hasUpgrade("t", 24)) {
                seeds = player.$.seeds.plus(player.$.seedGain.times(10))
                stamp2 = Date.now();
                return [seeds, stamp2]
            }

            return false
        } else {return false}
        } else {return false}
    },

    seedGain() {
        seedGain = new Decimal(2)

        if (hasUpgrade("$", 101)) {
        seedGain = seedGain.plus(1)
        }

        if (hasUpgrade("$", 104)) {
        seedGain = seedGain.times(tmp.$.upgrades[104].effect)
        }

        if (hasUpgrade("$", 11)) {
        seedGain = seedGain.times(1.85)
        }

        if (hasUpgrade("$", 22)) {
        seedGain = seedGain.times(1.5)
        }

        if (hasUpgrade("$", 13)) {
        seedGain = seedGain.div(1.25)
        } 
        if (hasUpgrade("$", 14)) {
        seedGain = seedGain.times(tmp.$.upgrades[14].effect)
        }

        if (hasUpgrade("$", 24)) {seedGain = seedGain.times(0.8)}
        if (hasUpgrade("$", 31)) {seedGain = seedGain.times(1.25)}

        if (hasUpgrade("t", 11)) {seedGain = seedGain.times(1.25)}
        if (hasUpgrade("$", 113)) {seedGain = seedGain.times(4)}
        if (hasUpgrade("$", 122)) {seedGain = seedGain.times(4.5)}
        if (hasUpgrade("d", 11)) {seedGain = seedGain.times(2)}
        if (hasUpgrade("d", 15)) {seedGain = seedGain.times(tmp.d.upgrades[15].effect)}

        return seedGain
    },

    sproutspeed() {
        seedCD = 4500

        if (hasUpgrade("$", 102)) {
        seedCD = seedCD - 1000
        }

        if (hasUpgrade("$", 103)) {
        seedCD = seedCD - 1000
        }

        if (hasUpgrade("$", 113)) {
        seedCD = seedCD - 1000
        }

        if (hasUpgrade("$", 34)) {
        seedCD = seedCD - 1250
        }

        if (hasUpgrade("$", 122)) {
        seedCD = seedCD * 2.5
        }

        if (hasUpgrade("d", 11)) {
        seedCD = seedCD / 1.5
        }

        if (hasMilestone("r", 1)) {
        seedCD = seedCD / 2
        }

        return seedCD
    },

    update() {
        player.$.seeds = tmp.$.seedDivision
        player.$.updatedtime = Date.now()
        player.$.seedGain = tmp.$.seedGain
        player.$.seedCD = tmp.$.sproutspeed
        player.$.CentResetSeedGain = tmp.$.seedReset[0]
        player.$.NextGain = tmp.$.seedReset[1]
        player.$.rotpenalty = tmp.$.rotCalc

        if (tmp.$.autoClick != false) {
        player.$.seeds = tmp.$.autoClick[0]
        player.$.stamp = tmp.$.autoClick[1]
        }

        if (tmp.$.autoClick2 != false) {
        player.$.seeds = tmp.$.autoClick2[0]
        player.$.stamp2 = tmp.$.autoClick2[1]
        }

        if (hasUpgrade("$", 34)) {
            buyUpgrade("$", 122)
        }

        // Stop Softlocks:

        if (player.$.seeds.lt(0.1) && player.$.points.lt(1) && player.points.lt(1.1)) {
           player.points = new Decimal(1)
        }
    },
    

    upgrades: {
        11: {
            title() {return "Just buy a new Pot"},
            description() {return "Multiply Sprout effectiveness by 1.5x"},
            cost: 5
        },

        12: {
            unlocked() { return hasUpgrade("$", 11) },
            title() {return "Throw money at the formula"},
            description() {return "Increase Money gain exponent [0.35 > 0.65]"},
            cost: 10
        },

        13: {
            unlocked() { return hasUpgrade("$", 12) },
            title() {return "Think about the trees!"},
            description() {return "Multiply Tree gain by 3x, Divide sprout effectiveness by 1.25"},
            cost: 50
        },

        14: {
            unlocked() { return hasUpgrade("$", 13) },
            title() {return "Potplex"},
            description() {return "Multiply Sprout Seed Gain based on Money"},
            tooltip() {return "Log2(Money/5) + 1"},
            effect() {
                let boost = player.$.points.plus(5).times(0.2).log(2).plus(1)
                return boost
            },

            effectDisplay() {
                return format(tmp.$.upgrades[14].effect) +"x"
            },

            cost: 350
        },

        21: {
            unlocked() { return hasUpgrade("$", 114) },
            title() {return "Stock Market"},
            description() {return "Money boosts Money, its that shrimple"},
            tooltip() {return "Log10(Money)^0.8 + 1"},
            effect() {
                let boost = player.$.points.plus(10).log(10).pow(0.8).plus(1)
                return boost
            },

            effectDisplay() {
                return format(tmp.$.upgrades[21].effect) +"x"
            },

            cost: 10000
        },

        22: {
            unlocked() { return hasUpgrade("$", 21) },
            title() {return "Florality"},
            description() {return "Expand your area, 2x Trees, 1.5x Seeds, Should help you with Tree Upgrades"},

            cost: 25000
        },

        23: {
            unlocked() { return hasUpgrade("$", 22) },
            title() {return "Seed Protocol"},
            description() {return "Unlock two more Seed Upgrades, -0.001x Seeds lost due to Rotpenalty"},

            cost: 100000
        },

        24: {
            unlocked() { return hasUpgrade("$", 23) },
            title() {return "Greed."},
            description() {return "3x Money, 0.8x Seeds"},

            cost: 1000000
        },

        
        31: {
            unlocked() { return hasUpgrade("$", 24) },
            title() {return "This upgrade is filler"},
            description() {return "Atleast you get 1.25x Seeds!"},

            cost: 5000000
        },

        32: {
            unlocked() { return hasUpgrade("$", 31) },
            title() {return "This upgrade is filler II"},
            description() {return "Atleast you get 1.25x Trees!"},

            cost: new Decimal(10).pow(7).times(2.5)
        },
        
        33: {
            unlocked() { return hasUpgrade("$", 32) },
            title() {return "This upgrade is filler III"},
            description() {return "Atleast you get 1.25x Money!"},

            cost: new Decimal(10).pow(7).times(10)
        },

        34: {
            unlocked() { return hasUpgrade("$", 33) },
            title() {return "SPROUTS GO BRRRRRRR"},
            description() {return "-1.25s Sprout Cooldown, Keep and Automate Seed 'hefty sprouts' (you're not getting away from the 2.5x)"},

            cost: new Decimal(10).pow(7).times(25)
        },

        41: {
            unlocked() { return hasUpgrade("$", 34) },
            title() {return "Its Time."},
            description() {return "The final push for the next layer!, 40% Trees/s"},

            cost: new Decimal(10).pow(8).times(5)
        },

        // All Upgrades past this point are Seed Upgrades

        101: {
            title() {return "Just Plant More"},
            description() {return "+1 Seeds per Sprout"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 2,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        102: {
            unlocked() { return hasUpgrade("$", 101) },
            title() {return "Plantation Mania I"},
            description() {return "-1s Sprout Cooldown"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 3,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        
        103: {
            unlocked() { return hasUpgrade("$", 102) },
            title() {return "Plantation Mania II"},
            description() {return "-1s Sprout Cooldown"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 4,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        104: {
            unlocked() { return hasUpgrade("$", 102) },
            title() {return "Because Seed boost Seed"},
            description() {return "Seeds boosts general Seed Multiplier (Includes Sprout). You should be able to get your first Tree now!"},
            tooltip() {return "Log3(Seeds/2)^1.5 + 1"},
            effect() {
                let boost = player.$.seeds.plus(6).times(0.5).log(3).pow(1.5)
                return boost
            },

            effectDisplay() {
                return format(tmp.$.upgrades[104].effect) +"x"
            },

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 4.7,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        111: {
            unlocked() { return hasUpgrade("$", 104) && hasUpgrade("t", 14)},
            title() {return "The Big One (tm)"},
            description() {return "Unlock Hyper Sprouts, They copy Sprout's seed gain, but its cooldown is 5x bigger and gives 10x as many Seeds"},
            tooltip() {return "gci reference?"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 2250,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        112: {
            unlocked() { return hasUpgrade("$", 111)},
            title() {return "Can we address the elephant in the room?"},
            description() {return "🐘, yes. Reduce Seed rot from 0.99x per tick to 0.997x"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 8000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        113: {
            unlocked() { return hasUpgrade("$", 112)},
            title() {return "MORE. SPROUT. FASTER."},
            description() {return "get your hands on some freaky genetically modified seeds, -1s Sprout Cooldown, but 0.5x Seeds and 4x Sprout Seed Gain"},
            tooltip() {return "Noticed the seedflation yet?"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 20000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        114: {
            unlocked() { return hasUpgrade("$", 113) },
            title() {return "Way too many Upgrades"},
            description() {return "Unlock new Tree and Money Upgrades, This upgrade resists Resets"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 100000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        121: {
            unlocked() { return hasUpgrade("$", 113) && hasUpgrade("$", 23) },
            title() {return "Branded Farms"},
            description() {return "Seeds boost Money gain at a Very Reduced Rate"},
            tooltip() {return "Log4(Seeds)"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 500000,

            effect() {
                let boost = player.$.seeds.plus(6).log(4)
                return boost
            },

            effectDisplay() {
                return format(tmp.$.upgrades[121].effect) +"x"
            },

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },

        122: {
            unlocked() { return hasUpgrade("$", 121) && hasUpgrade("$", 23) },
            title() {return "Hefty Sprouts"},
            description() {return "2x Trees, 4.5x Sprout Seed Gain but 2.5x Sprout Cooldown"},

            currencyDisplayName: "Seeds",
            currencyInternalName: "seeds",
            currencyLayer: "$",
            cost: 1000000,

            
            style() { 
           
            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#aa781c'}
            }

            },
            
        },
    },


    bars: {
        bigBar: {
            direction: RIGHT,
            width: 175,
            height: 25,
            
            fillStyle() {return {"background-color": ("#7fce26")} },
            baseStyle() {return {"background-color": ("#659c1d")} },
            textStyle() {return {"color": ("#a1ec4b"), "font-family": "'Comic Neue', cursive", "-webkit-text-stroke": "1px black"}  },
            borderStyle() {return {"border-color": ("#659c1d")}},

            progress() { return (player.$.stamp + player.$.seedCD - player.$.updatedtime) / player.$.seedCD },
            display() { return format((player.$.stamp + player.$.seedCD - player.$.updatedtime)/1000) + 's / ' +format(player.$.seedCD/1000)+ 's'},
        },

        bigBar2: {
            unlocked() { return hasUpgrade("$", 111)},
            direction: RIGHT,
            width: 175,
            height: 25,
            
            fillStyle() {return {"background-color": ("#7fce26")} },
            baseStyle() {return {"background-color": ("#659c1d")} },
            textStyle() {return {"color": ("#a1ec4b"), "font-family": "'Comic Neue', cursive", "-webkit-text-stroke": "1px black"}  },
            borderStyle() {return {"border-color": ("#659c1d")}},

            progress() { return (player.$.stamp2 + (player.$.seedCD*5) - player.$.updatedtime) / (player.$.seedCD*5) },
            display() { return format((player.$.stamp2 + player.$.seedCD*5 - player.$.updatedtime)/1000) + 's / ' +format(player.$.seedCD*5/1000)+ 's'},
        },
    },

    clickables: {
        11: {
            
            title() {return "Grow a sprout"},
            display() {return "+" +format(player.$.seedGain)+ " Seeds with a " +format(player.$.seedCD/1000)+ " Second Cooldown, (Requires a seed)"},
            style() {

                if (player.$.seeds.lt(1)) {
                return {'background-color': ('#bf8f8f')}
                } else {
                return {"background-color": ("#7fce26")}
                }
            },
            canClick() {
                if (player.$.stamp + player.$.seedCD < Date.now()) {
                if (!player.$.seeds.lt(1)) {
                    return true
                } else {return false}
                } else {return false}
            },

            onClick() {
                player.$.stamp = Date.now();
                player.$.seeds = player.$.seeds.plus(player.$.seedGain)
            }
        },

        12: {
            display() {return "Reset for +" +format(player.$.CentResetSeedGain)+ " Seeds <br> Next at " +format(player.$.NextGain)+ " Cents"},
            style() {
                if (!player.$.CentResetSeedGain.lt(1)) {
                    
                return {

                height: "75px",
                width: "170px",
                "font-size": "12px",
                'background-color': '#aa781c'

                }} else {

                return {

                height: "75px",
                width: "170px",
                "font-size": "12px",
                'background-color': '#bf8f8f'
                
                }}
            },
            
            canClick() {
                if (!player.$.CentResetSeedGain.lt(1)) {
                    return true
                } else {
                    return false}
            },

            onClick() {
                player.$.points = new Decimal(0),
                player.$.seeds = player.$.seeds.plus(player.$.CentResetSeedGain),
                player.$.CentResetSeedGain = new Decimal(0),
                player.$.NextGain = new Decimal(0)
            }
        },

        13: {
            unlocked() {return hasUpgrade("$", 111)},
            title() {return "Grow a HYPER sprout"},
            display() {return "+" +format(player.$.seedGain.times(10))+ " Seeds with a " +format(player.$.seedCD*5/1000)+ " Second Cooldown, (Requires 1k seeds)"},
            style() {

                if (player.$.seeds.lt(1000)) {
                return {'background-color': ('#bf8f8f')}
                } else {
                return {"background-color": ("#c026ce")}
                }
            },
            canClick() {
                if (player.$.stamp2 + player.$.seedCD * 5 < Date.now()) {
                if (!player.$.seeds.lt(1000)) {
                    return true
                } else {return false}
                } else {return false}
            },

            onClick() {
                player.$.stamp2 = Date.now();
                player.$.seeds = player.$.seeds.plus(player.$.seedGain.times(10))
            }
        },
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Money", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    	tabFormat: ["main-display",
		"prestige-button",
		"blank",
        ["upgrades", 4],

        ["display-text",
			function() {return "<font color='#8d6d30'><h2>--- Seeds ---</h2></font>"},
				{}],
        "blank",
        "microtabs",

		["display-text",
			function() {return 'You have <h2>' + format(player.$.seeds) + '</h2> Seeds'},
				{}],
        ["display-text",
			function() {
                if (hasMilestone("r", 5)) {return ""}
                return 'Seeds above 1 Rot at a rate of ' + player.$.rotpenalty + 'x per Tick'
            },
				{}],
		"blank",

		"milestones", ["clickable", 12], "blank", "blank", "blank",
        ["row", [["clickable", 11], ["clickable", 13]], ],
        "blank", 
        ["row", [["bar", "bigBar"], ["bar", "bigBar2"]], ],
         "blank",
        ["row", [["upgrade", 101], ["upgrade", 102], ["upgrade", 103], ["upgrade", 104]] ],
        ["row", [["upgrade", 111], ["upgrade", 112], ["upgrade", 113], ["upgrade", 114]] ],
        ["row", [["upgrade", 121], ["upgrade", 122], ["upgrade", 123], ["upgrade", 124]] ],

        ],

    layerShown(){return true}
})

addLayer("r", {
    name: "Rank", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🏅", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        skill: new Decimal(0),
        combinedpower: new Decimal(0),
        unlockOrder: 0

    }},
    
    update() {
        if (hasMilestone("r", 2)) {
        buyUpgrade("t", 23)
        }
    },

    increaseUnlockOrder: ["d"],
    color: "#c9b827",
    requires() { 
        Require = new Decimal(10).pow(7).times(2.5)
        if (player.r.unlockOrder > 0 && !player.d.unlocked0) {Require = Require.times(10000000)}

        return Require
    }, 
    
    resource: "Rank", // Name of prestige currency
    baseResource: "Trees", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    branches: ["t"],
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "R", description: "r: Reset for Rank", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    infoboxes: {
        Hey1: {
            title() {return "Hey!"},
            body() {return "Good job on reaching the second row! But you have a choice to make, Both of these resets are pretty simple but either you pick to Rank Up (This layer) which is a more Passive Reset that focuses on Milestone and Automation or you choose Destruction which is well, more Destructive, its less forgiving and its currency based, Destruction focuses on Boosting the Cycle Layers instead of automating them, the one you pick last will be 1,000,000x Harder [needs 1Mx more trees]"}
                
        },
    },
    
    upgrades: {
        11: {
            unlocked() { return hasMilestone("r", 4) },
            title() {return "Practice"},
            description() {return "Double Skill Gain"},

            currencyDisplayName: "Skill",
            currencyInternalName: "skill",
            currencyLayer: "r",
            cost: 10000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#1c9aaa'}
            }

            },
        },

        12: {
            unlocked() { return hasUpgrade("r", 11) },
            title() {return "Practiced Practice"},
            description() {return "Double Combined Power"},

            currencyDisplayName: "Skill",
            currencyInternalName: "skill",
            currencyLayer: "r",
            cost: 25000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#1c9aaa'}
            }

            },
        },

        13: {
            unlocked() { return hasUpgrade("r", 12) },
            title() {return "Tree Lover"},
            description() {return "Skill boosts Trees Twice"},

            currencyDisplayName: "Skill",
            currencyInternalName: "skill",
            currencyLayer: "r",
            cost: 100000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#1c9aaa'}
            }

            },
        },

        14: {
            unlocked() { return hasMilestone("r", 5) },
            title() {return "Why so Skilled?"},
            description() {return "Skill Gain is based on Rank^3 instead of Rank^2"},

            currencyDisplayName: "Skill",
            currencyInternalName: "skill",
            currencyLayer: "r",
            cost: 350000,

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#1c9aaa'}
            }

            },
        },

        15: {
            unlocked() { return hasUpgrade("r", 14) },
            title() {return "P2W"},
            description() {return "Boosts Skill based on Money"},
            tooltip() {return "Log100(Money)^1.5"},

            currencyDisplayName: "Skill",
            currencyInternalName: "skill",
            currencyLayer: "r",
            cost: 7500000,

            effect() {
                let boost = player.$.points.plus(100).log(100).pow(1.5)
                return boost
            },

            effectDisplay() {
                return format(tmp.r.upgrades[15].effect) +"x"
            },

            style() { 

            if (canAffordUpgrade(this.layer, this.id) && !hasUpgrade(this.layer, this.id)){
                return {'background-color': '#1c9aaa'}
            }

            },
        },
    },
    
    combinedpowerCalc() {
        CombinedPower = player.$.seeds.plus(8).log(8).pow(1.5)
        CombinedPower = CombinedPower.times(player.$.points.plus(2).log(2))
        CombinedPower = CombinedPower.times(player.t.points.plus(1).pow(0.2))
        if (hasMilestone("r", 4)) {
            CombinedPower = CombinedPower.times(100)
        }
        if (hasUpgrade("r", 12)) {
            CombinedPower = CombinedPower.times(2)
        }

        return CombinedPower
    },
    
    skillEffect() {
        let SkillEffect = player.r.skill.plus(10).log(3)
        if (hasMilestone("r", 4)) {
            SkillEffect = SkillEffect.pow(2)
        }
        if (hasMilestone("r", 6)) {
            SkillEffect = SkillEffect.times(1.5)
        }
        return SkillEffect
    },

    skillGain() {

        let SkillGain = player.r.points.pow(2)

        if (hasUpgrade("r", 14)) {
            SkillGain = player.r.points.pow(3)
        }
        
        if (hasMilestone("r", 4)) {
            SkillGain = SkillGain.times(player.r.combinedpower.pow(0.3))
        }
        if (hasUpgrade("r", 11)) {
            SkillGain = SkillGain.times(2)
        }
        if (hasUpgrade("r", 15)) {
            SkillGain = SkillGain.times(player.$.points.plus(100).log(100).pow(1.5))
        }
        
        return SkillGain
    },

    update(diff) {
        if (hasMilestone("r", 2) && !hasUpgrade("t", 23)) {
            player.t.upgrades = ["23"]
        }
        
        player.r.combinedpower = tmp.r.combinedpowerCalc

        if (hasMilestone("r", 2)) {
            if (!player.r.skill.plus(tmp.r.skillGain.times(diff)).lt(player.r.combinedpower)) {
                if (player.r.skill.gte(player.r.combinedpower)) {
                return
                }

                player.r.skill = player.r.combinedpower
            }
            player.r.skill = player.r.skill.plus(tmp.r.skillGain.times(diff))
        }

    },

    milestones: {
        1: {
            requirementDescription: "Rank 1 - F Tier",
            effectDescription: "These are still pretty annoying, Automate Sprout but not Hyper-Sprout and they are 2x Faster, also QoL but you can never have <1 Seeds",
            done() { return player.r.points.gte(1) }
        },

        2: {
            requirementDescription: "Rank 2 - E Tier",
            effectDescription: "Solo Levelling? Unlock Skill (Rank^2/s), Auto-Buy Rebellious Sprouts for Free [1% Tree Generation/s]",
            done() { return player.r.points.gte(2) }
        },

        3: {
            requirementDescription: "Rank 3 - D Tier",
            effectDescription: "Why not automate the automated?. 5% Prestige Tree/s base instead of 1%, Auto-buy all Tree Upgrades",
            done() { return player.r.points.gte(3) }
        },

        4: {
            requirementDescription: "Rank 4 - C Tier",
            effectDescription: "Combined Power more like Combined Motivator, Combined Power boosts Skill (CP^0.3)x and multiply Combined Power gain by 100x, Square Skill Boost AND unlock Skill Upgrades",
            done() { return player.r.points.gte(4) }
        },

        5: {
            requirementDescription: "Rank 5 - B Tier",
            effectDescription: "Seed Rot, be GONE!. Completelly removes the Seed Rot feature and auto-buy Money Upgrades, Also unlock 2 new Skill Upgrades",
            done() { return player.r.points.gte(5) }
        },

        6: {
            requirementDescription: "Rank 6 - B+ Tier",
            effectDescription: "Slightly Boost Skill Gain (1.5x), Keeps Tree Upgrades instead of Auto Buying them",
            done() { return player.r.points.gte(6) }
        },
    },

    effect() {
        mult = player.r.points.plus(1).pow(2)
        return mult
    },
    
    effectDescription() {
        return "Which are multiplying Trees by "+format(tmp.r.effect)+"x"
    },
    
    layerShown(){
        if (!player.t.points.lt(100000)) {return true}
        if (player.r.unlocked) {return true}
        return false
    },
    
    
    tabFormat: [
    ["infobox", "Hey1"],
    "main-display",
    "prestige-button",
    "blank",
	["display-text",
		function() {if (!hasMilestone("r", 2)) {return ""} return 'You have <font color="#7affcc"><h2> ' + format(player.r.skill) + '</font></h2> Skill'},
			{}],
    ["display-text",
	function() {if (!hasMilestone("r", 2)) {return ""}return '(<font color="#7affcc">+' + format(tmp.r.skillGain) + '/s</font>)'},
		{}],
    ["display-text",
	function() {if (!hasMilestone("r", 2)) {return ""}return 'Which boosts Apples, Trees and Money by ' + format(tmp.r.skillEffect) + 'x'},
		{}],
    "blank",
    ["display-text",
	function() {if (!hasMilestone("r", 2)) {return ""}return 'You have <h3> <font color="#f1b55b">' + format(player.r.combinedpower) + '</h3> <font color="#ff0000">Co<font color="#ff9900">mb<font color="#fffb00">in<font color="#00ff15">ed <font color="#00ffea">Po<font color="#002fff">we<font color="#ae00ff">r<font color="#ffffff">, you can´t have more <font color="#00ff9d">Skill</font> than Combined Power'},
	{}],
    ["display-text",
	function() {if (!hasMilestone("r", 2)) {return ""}return '<font color="#ff0000">Co<font color="#ff9900">mb<font color="#fffb00">in<font color="#00ff15">ed <font color="#00ffea">Po<font color="#002fff">we<font color="#ae00ff">r<font color="#ffffff"> = Log8(Seeds)^1.5*Log2(Money)*Trees^0.2'},
	{}],
    "blank",
    "milestones",
    "blank",
    "blank",
    "upgrades"
    ]

}),

addLayer("d", {
    name: "Destruction", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        unlockOrder: 0
    }},

    color: "#9b2222",
    requires() { 
        Require = new Decimal(10).pow(7).times(2.5)
        if (player[this.layer].unlockOrder > 0 && player["r"].unlocked ) {Require = Require.times(10000000)}

        return Require
    }, 
    resource: "Power", // Name of prestige currency
    baseResource: "Trees", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.7, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("d", 13)) {mult = mult.times(2)}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    
    increaseUnlockOrder: ["r"],
    branches: ["t"],
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "P", description: "P: Destruct for Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    infoboxes: {
        Hey: {
            title() {return "Hey!"},
            body() {return "Good job on reaching the second row! But you have a choice to make, Both of these resets are pretty simple but either you pick to perform a Destruction (This layer) which is well, more Destructive, its less forgiving and its currency based, Destruction focuses on Boosting the Cycle Layers instead of automating them, or you choose to Rank Up which is a more Passive Reset that focuses on Milestone and Automation, the one you pick last will be 1,000,000x Harder [needs 1Mx more trees] <h3>(TIP: if you choose destruction first, its heavily recommended you get >2 Power for your first Reset)"}
                
        },
    },

    upgrades: {
        11: {
            title() {return "Cached Seeds"},
            description() {return "Sprout Cooldown /1.5, 2x Seeds"},
            cost: 1,
        },
        
        12: {
            unlocked() { return hasUpgrade("d", 11) },
            title() {return "Empowered Monopoly"},
            description() {return "Increase Money Gain exponent before multipliers by +0.05"},
            cost: 1,
        },

        13: {
            unlocked() { return hasUpgrade("d", 12) },
            title() {return "Power Infused Trees"},
            description() {return "3x Trees, 2x Power"},
            cost: 5,
        },

        14: {
            unlocked() { return hasUpgrade("d", 13) },
            title() {return "Synergized Greens"},
            description() {return "Money boosts Trees at a HEAVILY reduced rate, also 2x Money"},
            tooltip() {return "(Money/1m)^0.08, Caps out at 100x"},
            cost: 10,

                effect() {
                let boost = player.$.points.plus(1000000).div(1000000).pow(0.08)
                if (boost.gte(100)) {boost = 100}
                return boost
            },

            effectDisplay() {
                return format(tmp.d.upgrades[14].effect) +"x"
            },
        },

        15: {
            unlocked() { return hasUpgrade("d", 14) },
            title() {return "Genetically Modified Apple Seeds"},
            description() {return "Apples boost Seeds at a very reduced rate"},
            tooltip() {return "log4(Apples)"},
            cost: 25,

                effect() {
                let boost = player.points.plus(5).log(4)
                return boost

            },

            effectDisplay() {
                return format(tmp.d.upgrades[15].effect) +"x"
            },
        },

        16: {
            unlocked() { return hasUpgrade("d", 15) },
            title() {return "Empowered Challenges"},
            description() {return "Unlock the first Empowered Challenge, The faster you are the more Momentum Score you get, Momentum Score boosts Power"},
            cost: 75,
        },
    },

    effect() {
        mult = player.d.points.plus(3).pow(1.4).log(3)
        return mult
    },
    
    effectDescription() {
        return "Which is multiplying Money by "+format(tmp.d.effect)+"x"
    },
    
    layerShown(){
        if (!player.t.points.lt(100000)) {return true}
        if (player.d.unlocked) {return true}
        return false
    }
})