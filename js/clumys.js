addLayer(`c`, {
    name: `Cryptic Clues`, // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: `CC`, // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: `#175ABD`,
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: `Cryptic Clues`, // Name of prestige currency
    baseResource: `questions`, // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: `normal`, // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    softcap() {if(!hasUpgrade('fr', 34))return new Decimal(`1e7`)
                else return new Decimal (`e1e7`)},
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('m', 2) && resettingLayer==`m`) keep.push(`upgrades`)
            if (hasMilestone('fo', 6) && (resettingLayer=='fo'|| resettingLayer=='fr'))keep.push(`upgrades`)
            if (hasMilestone('fo', 6) && hasUpgrade('g', 13) && resettingLayer=='g')keep.push(`upgrades`)
            if (hasBuyable('g', 21) && resettingLayer=='t')keep.push('upgrades')
            if (layers[resettingLayer].row > this.row) layerDataReset(`c`, keep)
        },


    repare: new Decimal (0),
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('m', 11)) mult = mult.add(1)
        if (hasChallenge('m', 11)) mult = mult.add(9)
        if (hasChallenge('m', 12)) mult = mult.add(90)
        if (hasUpgrade('c', 14)) mult = mult.times(upgradeEffect('c', 14))
        if (player.m.unlocked) mult = mult.times(temp[`m`].effect)
        if (hasMilestone('fo', 0)) mult = mult.times(5)
        if (hasMilestone('fo', 1)) mult = mult.pow(1.25)
        if (hasUpgrade('t', 23)) mult = mult.times(upgradeEffect('t', 23)) 
        if (hasUpgrade('t', 24)) mult = mult.times(10)       
        if (hasMilestone('fo', 4) && hasUpgrade(`c`, 23)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade(`c`, 24)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade(`c`, 25)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade(`c`, 26)) mult = mult.times(1.5)
        if (hasUpgrade('fo', 13)) mult = mult.times(upgradeEffect('fo', 13))
	    if (player.fo.unlocked && hasMilestone('fo', 7)) mult = mult.times(temp[`fo`].effect)
        if (hasBuyable(`g`, 11) && hasUpgrade('c', 31 )) mult = mult.times(upgradeEffect('c', 31).pow(2))
        if (hasBuyable(`g`, 11) && hasAchievement('a', 39)) mult = mult.times(upgradeEffect('c', 31).log(10).add(1).pow(2))
        if (hasBuyable(`g`, 12)) mult = mult.times(tmp['g'].effect)

        if (inChallenge('m',12 )) mult = mult.pow(0.5)
        if (inChallenge('m',13 )) mult = mult.pow(0.5)
        return mult
    },

    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasChallenge('m', 13)) pg = pg.add(1)
        if (hasUpgrade('c', 31 )) pg = pg.times(upgradeEffect('c', 31))
        if (hasAchievement('a', 39)) pg = pg.times(upgradeEffect('c', 31).log(10).add(1))
        if (pg.lte(0)) return false
        if (hasBuyable(`g`, 11) && pg.gte(1)) return 1 
        return pg
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
     //   if (hasUpgrade(`m`, 31)) exp = exp.add(1)
        return exp

    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: `c`, description: `C: Reset for Cryptic Clues`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    branches: [[`m`, 1], [`d`, 1]],

    upgrades:{
        11:{
            title: `Start playing`,
            description: `Gain a question every second`,
            cost: new Decimal(1),
        },
        12:{
            title: `Wonder what my name means`,
            description: `Triple your questions gain`,
            cost: new Decimal(3),
            unlocked() {return (hasUpgrade('c', 11))},
        },
        13:{
            title: `Ask nicely what my name means`,
            description: `Boost questions based on clues`,
            cost: new Decimal(10),
            unlocked() {return(hasUpgrade('c', 12))},
            effect() {
                if (!hasUpgrade('fr', 34)) {let softlim = new Decimal (`1e15`)
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff= player[this.layer].points.add(1).pow(0.5)
                if(hasUpgrade('c',15)) eff = eff.times(upgradeEffect('c', 15))
                if(hasUpgrade('fr', 22)) eff = eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.3))
                return softeff}
                weff = player.c.points.add(1) .pow(0.1)
                softweff = softcap(weff, new Decimal(1e256), new Decimal(0.25))               
                if(hasUpgrade('c',15)) softweff = softweff.times(upgradeEffect('c', 15))
                if(hasUpgrade('fr', 22)) softweff = softweff.times(upgradeEffect('fr', 22))
                return softweff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        },
        14:{
            title: `Ask harshly what my name means`,
            description: `Boost clues based on questions`,
            cost: new Decimal(25),
            unlocked() {return(hasUpgrade('c', 13)) },
            effect() {
                let eff = player.points.add(1).pow(0.15)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        },
        15:{
            title: `...back to the previous layer`,
            description: `Boost questions based on clues by boosting third upgrade`,
            cost: new Decimal(50),
            unlocked() {if (hasUpgrade('m', 11) && hasUpgrade('c', 14)) return true
                return((player.fo.unlocked || player.fr.unlocked) &&hasUpgrade(`c`, 14))},
            effect() {
                if (!hasUpgrade('fr', 34)){let softlim = new Decimal (`1e6`)
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player[this.layer].points.add(1).pow(0.35)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.7))
                if(hasUpgrade('c',33)) softeff = softeff.times(upgradeEffect('c', 33))
                return softeff}
                weff = player.c.points.add(1).pow(0.1)
                softweff = softcap(weff, new Decimal(1e256), new Decimal(0.25))
                if(hasUpgrade('fr', 22)) softweff=softweff.times(upgradeEffect('fr', 22))
                return softweff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        },
        21:{
            title: `But wouldn't that imply that...?`,
            description: `Boost questions based on questions`,
            cost: new Decimal(250),
            unlocked() {return(hasUpgrade('c', 15))},
            effect() {
                if (!hasUpgrade('fr', 34)) {let softlim = new Decimal (`2e6`)
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player.points.add(1).pow(0.26)                
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff}
                weff = player.points.add(1).pow(0.05)
                return weff

            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        },
        22:{
            title: `Cookie time`,
            description: `Nerf question gain for the Greater Good and reset clues and question`,
            cost: new Decimal(1e7),
            unlocked() {
                if(inChallenge('m', 11) && !inChallenge('m', 15)) return false
                return((player.m.best.gte(4) && hasUpgrade('c', 21)) || (hasAchievement(`a`, 13) && hasUpgrade('c', 21)))},
            effect() {
                let eff = new Decimal (0.1)
                if(hasUpgrade('t', 12)) eff = eff.times(2.5)
                if(hasUpgrade('t', 21)) eff = eff.times(2)
                if(hasUpgrade('t', 52)) eff = eff.times(2.5)
                return eff
            },
            onPurchase() { 
                player.c.points = new Decimal(1)
                player.points = new Decimal(1)
            },
        },
        23:{
            title: `Cookie thyme`,
            description: `Nerf question gain for the Greater Good, reset clues and questions`,
            cost: new Decimal(1e7),
            unlocked() {
                return ((inChallenge('m', 11) && !inChallenge('m', 15)) && hasUpgrade('c', 21))},

        },
        24:{
            title: `That's the...`,
            description: `Unlock another mystery challenge`,
            cost: new Decimal(1e10),
            unlocked() {
                if (inChallenge('m', 12) && !inChallenge('m', 15)) return false
                return(hasAchievement('a', 14) && hasUpgrade('c', 21))},
        },
        25:{
            title: `That's the...`,
            description: `Unlock another mystery challenge`,
            cost: new Decimal(1e8),
            unlocked() {return (inChallenge('m', 12) && hasUpgrade('c', 21) && !inChallenge('m', 15))},
        },
        26:{
            title: `...next layer over there?`,
            description: `Unlock more content`,
            cost: new Decimal(1e9),
            unlocked() {if (hasChallenge('m', 12) && (hasUpgrade('c', 21))) return true
                        return((player.fo.unlocked ||player.fr.unlocked) &&hasUpgrade('c', 21))},
        },
        31:{
            title: `No. No it's not.`,
            description: `Unlock another mystery challenge <br> And get a boost on passive clue gain based on clue upgrades bought`,
            cost: new Decimal(1e12),
            unlocked() {if (hasUpgrade('c', 26) && hasChallenge('m', 13)) return true
            return((player.fo.unlocked ||player.fr.unlocked) && hasUpgrade('c', 26))},
            effect() {
                let eff = new Decimal (`1.69`)
                eff = eff.pow(player[this.layer].upgrades.length).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                if (hasUpgrade('t', 13)) return eff
                eff = new Decimal.add(player[this.layer].upgrades.length, 1)
                if(hasUpgrade('fr', 22) && hasUpgrade('g', 14) && !inChallenge('t', 13)) weff=weff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        
        },
        32:{
            title: `They're all in on it, and I'll prove it`,
            description: `Give you the opportunity to do friends and forums resets. It's time to choose.`,
            cost: new Decimal(1e15),
            unlocked() {
                if (inChallenge('m', 14)) return false
                return(hasUpgrade('c', 22) && hasAchievement('a', 25))},
        },
        33:{
            title() {if(!hasUpgrade(`fr`, 34)) return`How long has it been since the last upgrade here?`
            if(hasAchievement('a', 51))return `The now useful upgrade`
            if(!tmp.c.repare.gte(100)) return `The now useless upgrade`},
            description() {if(!hasUpgrade(`fr`, 34)) return `Boost questions based on clues based on friends by pushing the fifth upgrade's softcap.<br><i>It's starting to be a bit convoluted</i>`
                            if(hasAchievement('a', 51))return `You fixed me, many thanks dear player. <br> I will now boost forum's effect based on forums`
                            if(!tmp.c.repare.gte(100)) return `That's not fair, I was just made ! <br> I can't do anything anymore, help me, I need to feel your touch`},
            cost: new Decimal(1e122),
            unlocked() {return hasUpgrade('fo', 14)},
            effect() {if (!hasUpgrade('fr', 34)){
                let eff = new Decimal (player.fr.points.plus(1))
                eff = eff.log(3).pow(7).plus(1)
                return eff}
                if(hasAchievement('a', 51)) {
                    let eff = new Decimal(player.fo.points.log(6).add(1))                
                    if(hasUpgrade('fr', 22) && hasUpgrade('g', 14) && !inChallenge('t', 13)) eff=eff.plus(upgradeEffect('fr', 22).log(1e10))
                    return eff
                }
                return false},
            onClick(){if (!hasUpgrade('fr', 34)) return
            tmp.c.repare = tmp.c.repare.add(1)},
            colormaker(){if(!hasUpgrade('fr', 34))color = `#77BF5F`},
            effectDisplay() { if (!hasUpgrade('fr', 34)) return format(upgradeEffect(this.layer, this.id))+`x` 
            if(hasAchievement('a', 51)) return `^` + format(upgradeEffect(this.layer, this.id))
            return tmp.c.repare + `%`}, // Add formatting to the effect
            style() {const style = {}; if (hasUpgrade(`fr`, 34) && !tmp.c.repare.gte(100) && hasUpgrade(`c`, 33)) style[`background-color`] = tmp.c.colormaker; return style}
        },
        41:{
            title: `How long do you think have I been waiting for you to notice me?`,
            description: `Get one half of a cure, and removes <b>Unearth a greater mystery</b>'s downside.`,
            cost: new Decimal("1e500"),
            unlocked() {
                return(hasBuyable('g', 12))},
        },
    },

    colormaker(){if(!hasUpgrade('fr', 34)|| tmp.c.repare.gte(100)||hasAchievement(`a`, 51))return `#77BF5F`
                c1 = Decimal.sub(255, Decimal.div(136, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase() 
                if(c1.length == 1) c1 = `0` + c1
                c2 = Decimal.sub(255, Decimal.div(64, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase()
                if(c2.length == 1) c2 = `0` + c2
                c3 = Decimal.sub(255, Decimal.div(160, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase()
                if(c3.length == 1) c3 = `0` + c3
                c = `#` + c1 + c2 + c3
            return c},
})




addLayer(`m`, {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // `points` is the internal name for the main resource of the layer.
    }},

    color: `#DBA571`,                       // The color for this layer, which affects many elements.
    resource: `mysteries`,            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: `questions`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1000),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: `static`,                         // Determines the formula used for calculating prestige currency.
    exponent: 2,                          // `normal` prestige gain is (currency^exponent).
    repare: new Decimal(0),
    hotkeys: [
        {key: `m`, description: `M: Reset for Mystery`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
   
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('fo', 3)) keep.push(`challenges`)
            if (hasMilestone('fo', 4)) keep.push(`milestones`)
            if (hasMilestone('fo', 6) && resettingLayer=='fo')keep.push(`upgrades`)
            if (hasMilestone('fo', 6) && resettingLayer=='fr')keep.push(`upgrades`)
            if (hasMilestone('fo', 6) && resettingLayer=='g' && hasUpgrade('g', 13))keep.push(`upgrades`)            
            if (layers[resettingLayer].row > this.row) layerDataReset(`m`, keep)
    },

    effect() {
        let ueff = new Decimal (1)
        if(hasUpgrade(`m`, 11)) ueff = ueff.times(2)
        eff = player[this.layer].best.add(1).pow(0.75)
        let qEff = player.m.total.pow(0.6725).plus(1)
        eff = eff.times(qEff)
        if (hasMilestone(`fo`, 4)) eff = eff.times(ueff)
        if (hasUpgrade('fr', 21)) eff = eff.times(5)
        if (hasUpgrade('m', 32)) eff = eff.pow(3)
        eff = eff.times(new Decimal(buyableEffect('t', 21)).pow(2))
        if (inChallenge('t', 11)) eff= eff.pow(0)
        return eff
        },
    effectDescription() {
        eff = this.effect();
        return ` boosting your clue gain based on your max and current mysteries by `+format(eff)

    },

    autoPrestige() {return hasUpgrade('fo', 12)},

    resetsNothing() {return hasUpgrade('fo', 12)},

    canBuyMax() {
        return(hasMilestone('m', 1))

    },

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let price= new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 32)) price = price.times(0.00001)
        else if (player.m.points.gte(4)) price = price.times(1e10)
        if (hasUpgrade('m', 13)) price = price.times(0.01)
        if (hasMilestone('fo', 2)) price = price.times(0.001)
	    if (player.fo.unlocked&& hasMilestone('fo', 7)) price = price.div(temp[`fo`].effect)
        price = price.div(buyableEffect('m', 11))

        return price
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        let price =  new Decimal(1)
        if (hasChallenge('m', 14)) price = price.add(1)
        price = price.add(buyableEffect('m', 12))
        if (hasChallenge('m', 14)) price = price.pow(3)
        if (hasMilestone('fo', 0)) price = price.pow(2)
        if (hasUpgrade('t', 53)) price = price.mul(player.g.total.pow(2))
        return price
    },

    layerShown() { 
        if(hasUpgrade('c', 14)||player.m.best.gte(1)||hasUpgrade('m', 11)|| player.fo.unlocked ||player.fr.unlocked) return true},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11:{
            title: `If you take those clues you get...`,
            description: `greatly boosts clues gain and new clue upgrades`,
            cost: new Decimal(1),
        },
        12:{
            title: `Can I get another one?`,
            description: `Boost questions based on questions`,
            cost: new Decimal(4),
            unlocked() {return(hasUpgrade('c', 22) || hasUpgrade('m', 12) || hasChallenge('m', 11) || player.fr.unlocked || player.fo.unlocked)},
            effect() {
                if(!hasUpgrade('fr', 34)){let eff= player.points.add(1).pow(0.05)
                let softlim = new Decimal(1e15)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff}0
                poww = new Decimal(0.01).times(player.g.chalto.times(2).add(1))
                weff = player.points.add(1).pow(poww)
                softweff = softcap(weff, new Decimal("1e512"), new Decimal(0.25))
                if(hasUpgrade('fr', 22) && hasUpgrade('g', 14) && !inChallenge('t', 13)) weff=weff.times(upgradeEffect('fr', 22))
                return weff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
        },
        13:{
            title: `I wanna make more clue upgrades`,
            description: `Make yourself check the achievements and get more mysteries`,
            cost: new Decimal(4),
            unlocked() {return((hasChallenge('m', 11) && hasUpgrade('m', 12))||player.fr.unlocked || player.fo.unlocked)},
        },
        14:{
            title: `Can you ever afk here?`,
            description: `Gain a modest passive 0.001% of friends on reset every second <br><i>Courtesy of Orlan</i>`,
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(225)
                return new Decimal(29)} ,
            unlocked() {return(hasUpgrade('m', 13) && hasUpgrade('fr', 25))},
            tooltip: `Next one will be on Theory layer`,
        },
        31:{
            title() {if(!hasUpgrade(`fr`, 34)) return `I had to come back here again?`
                        return `I had to come back here again ,again?`},
            description() {if(hasAchievement('a', 55)) return "Thanks for everything. I'll help you fight Cookie. <b>Ladies and Gentlemen, we got him</b>'s price is now reduced based on theories. I also unlocked a challenge somewhere."
                if(!hasUpgrade(`fr`, 34)) return `The start of clue upgrades' softcap gets squared`
                if(hasUpgrade('t', 54) && hasUpgrade('c', 41)) return "I'm feeling better already. But just in cas, would you kindly give me a forehead kiss? Clicking on me a few times should do the trick"
                if(hasUpgrade('c', 41)) return `You know what, I'm starting to feel a little bit better actually, could I get a second?`            
                if(hasUpgrade('t', 54)) return "Do you think you're being funny right now? You're having fun? Heal me already instead of toying with me you brute. Don't even think about getting a secret achievement from this"
                return `What am I supposed to do with my life now?`},
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(3700)
                return new Decimal(37)} ,
            onClick(){if (!hasUpgrade('fr', 34)) return
            tmp.m.repare = tmp.m.repare.add(1)},
            unlocked() {return(hasUpgrade('t', 32))},
            tooltip() {return`Next one will be on Theory layer`},
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 55)) style[`background-color`] = `#004400`; return style}
        },
        32:{
            title: `That looks a bit pricey`,
            description: `Mystery effect finally gets good`,
            cost: new Decimal(185),
            unlocked() {return(hasUpgrade('m', 31))},
            tooltip: `Next one will be on Theory layer`,
        },
        33:{
            title: `What use is a buyable that can never be bought?`,
            description: `Unlock another mystery buyable`,
            cost: new Decimal(550),
            unlocked() {return(hasUpgrade('fo', 14))},
            tooltip: `Too expensive for you? You might need a clue then?`,
        },
    },

    challenges: {
        11: {
            name: `A waste of time`,
            challengeDescription: `Get questions^0.8 <br> Or just use it to get out of <b>Cookie Time</b>`,
            goalDescription:`get 1e7 questions.`,
            rewardDescription:`clue base gets boosted`,
            canComplete: function() {return player.points.gte(1e7)},
            unlocked() {if(hasAchievement('a', 13)) return true},
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 19)) style[`background-color`] = `#004400`; return style}
        },
        12: {
            name: `Yet somehow worse <br>than the previous one`,
            challengeDescription: `Get clue^0.5`,
            goalDescription:`get 100 questions while having <b>Cookie time</b>`,
            rewardDescription:`clue base gets boosted... again`,
            canComplete: function() { return player.points.gte(100)&&hasUpgrade('c', 22)},
            unlocked() {return(hasUpgrade('c', 24) || inChallenge('m',12 ) || hasChallenge('m', 12) || player.fr.unlocked || player.fo.unlocked)
            },
        },
        13: {
            name: `That doesn't seem <br>like a new layer`,
            challengeDescription: `Get questions AND clues^0.5`,
            goalDescription:`get 10 000 questions.`,
            rewardDescription:`what base gets boosted? <br> <br> None, get 100% of clue gain every second though`,
            canComplete: function() {return player.points.gte(10000)},
            unlocked() {return(hasUpgrade('c', 26) || inChallenge('m', 13) || hasChallenge('m', 13) || player.fr.unlocked || player.fo.unlocked)}
        },
        14: {
            name: `I need to nerf that`,
            challengeDescription: `get questions^0.8`,
            goalDescription:`get 1e11 questions while in <b>Cookie time</b>.`,
            rewardDescription:`get a new milestone and boost mystery gain<br> But at a cost`,
            canComplete: function() {return player.points.gte(1e11)&&hasUpgrade('c', 22)},
            unlocked() { if(hasChallenge('m', 14)) return false
                return(inChallenge('m', 14) || hasUpgrade('c', 31) || player.fr.unlocked || player.fo.unlocked)}
        },
        15: {
            name: `Testing`,
            challengeDescription: `test`,
            goalDescription:`test`,
            rewardDescription:`test`,
            canComplete: function() {return false},
            unlocked() {return false},
            countsAs: [11, 12, 13],
            onExit() {if(player.g.clickables[12]==1) {player.g.clickables[12]=0, startChallenge('t', 13)}},
        },
    },

    milestones: {
        0: {
            requirementDescription: `4 mysteries`,
            effectDescription: `No more mysteries. For now`,
            done() { return player.m.points.gte(4) },
            unlocked() {return(hasMilestone('m', 0))}
        },
        1: {
            requirementDescription: `Get the third mystery upgrade and 4 mysteries`,
            effectDescription: `You can buy max mysteries`,
            done() { return (hasUpgrade('m', 13))&& player.m.points.gte(4) },
            unlocked() {return(hasMilestone('m', 0) || hasMilestone('m', 1))}
        },
        2: {
            requirementDescription: `4th challenge completed`,
            effectDescription: `Keep clue upgrades on mystery resets`,
            done() { return hasChallenge('m', 14) },
            unlocked() {return (hasMilestone('m', 1) || hasMilestone('m', 2))}
        },
    },
    buyables: {
        11: {
            title: `You're so cheap`,
            unlocked() { return hasUpgrade('fo', 11) },
            cost(x) {
                let base= new Decimal (2)
                return new Decimal(2).mul(base.pow(x)).div(buyableEffect(`m`, 21)).floor()
            },
            display() {
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` mysteries` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: Divide mystery cost by ` + format(buyableEffect(this.layer, this.id)) + `<br> based on forums`
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(player.fo.points)
                let base2 = x
                let powa = new Decimal (3)
                if (hasUpgrade(`fo`, 14)) powa = powa.add(player.fo.points).times(0.75)
                base1 = base1.pow(powa)
                let eff = new Decimal (base1.pow(base2))
                if (hasChallenge('g', 11)) eff = eff.pow(Decimal.plus(challengeCompletions('g', 11), 1))
                return eff
            },
        },
        12: {
            title: `You can be cheaper`,
            unlocked() { return hasUpgrade('fo', 11) },
            cost(x) {
                let base= new Decimal (5)
                return new Decimal(5).mul(base.pow(x)).div(buyableEffect(`m`, 21)).floor()
            },
            display() {
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` mysteries<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: Add ` + format(buyableEffect(this.layer, this.id)) + ` to mystery exponent base`
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(`0.1`)
                let base2 = x
                let eff = new Decimal (base1.times(base2))
                return eff
            },
        },
        21: {
            title: `You can be cheapest`,
            unlocked() { return hasUpgrade('m', 33) },
            cost(x) {
                let base= new Decimal (100)
                return new Decimal(10).mul(base.pow(x)).div(buyableEffect(`m`, 21)).floor()
            },
            display() {
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` mysteries<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: All second layer buyables get their cost divided by ` + format(buyableEffect(this.layer, this.id)) + `. Even this one`
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(`10`)
                let base2 = x
                let eff = new Decimal (base1.pow(base2))
                return eff
            },
        },
    },
    update(){
        if(hasMilestone('fo', 9)){
            if(tmp.m.buyables[11].canAfford) setBuyableAmount(`m`, 11, player.m.points.add(1).div(2).mul(buyableEffect('m', 21)).log(2).floor().add(1))
            if(tmp.m.buyables[12].canAfford) setBuyableAmount(`m`, 12, player.m.points.add(1).div(5).mul(buyableEffect('m', 21)).log(5).floor().add(1))
            if(tmp.m.buyables[21].canAfford) setBuyableAmount(`m`, 21, player.m.points.add(1).div(10).mul(buyableEffect('m', 21)).log(100).floor().add(1))

        
            }
        



    },
})



