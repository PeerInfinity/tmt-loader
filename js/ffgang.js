

addLayer(`fo`, {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // `points` is the internal name for the main resource of the layer.
    }},

    color: `#FF1D1D`,                       // The color for this layer, which affects many elements.
    resource: `Forums`,            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    position: 1,
    baseResource: `cryptic clues`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },  // A function to return the current amount of baseResource.

    requires(){let req = new Decimal(1e16)  
        if (hasAchievement('a', 35)) req = req
        else if (hasAchievement('a', 27)) req = req.pow(2) 
                return req},              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: `static`,                         // Determines the formula used for calculating prestige currency.
    exponent: 1,                          // `normal` prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here. 
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        let mult = new Decimal(0.25)
        let ttp = new Decimal(1.5)
        ttp = ttp.pow(2) 
        if (hasAchievement('a', 35)) mult = mult
        else if (hasAchievement('a', 27)) mult = mult.pow(ttp) 
        ttp = new Decimal (1)
        if (hasMilestone('fo', 8)) if(player.fo.points.gte(25))ttp = ttp.add(new Decimal(0.05).times(new Decimal(player.fo.points).minus(25)))
        if (hasMilestone('fo', 8)) if(player.fo.points.gte(25)) mult = mult.pow(ttp)
        return mult
    },
    branches: [['t', 1]],

    tooltipLocked(){if (!player.fr.unlocked && !hasUpgrade('c', 32)) return 'Reach ' + formatWhole(tmp['fo'].requires) + ' ' + tmp['fo'].baseResource + ' to unlock, but you might also need something else (You have ' + formatWhole(tmp['fo'].baseAmount) + ' ' + tmp['fo'].baseResource + ')'
        return},

    autoPrestige() {return hasMilestone('fo', 8)},

    resetsNothing() {return hasMilestone('fo', 8)},

    effect() {
        eff = player[this.layer].points.pow(3).add(1);
        if (hasUpgrade(`c`, 33) && hasAchievement(`a`, 51)) eff = eff.pow(upgradeEffect(`c`, 33))
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (!player.fr.unlocked) return `boosting your time wasted by `+format(eff)
        if (hasUpgrade('fr', 23)) return `boosting your point gain by `+format(eff)
        return `boosting your time wasted by `+format(eff)

    },

    canReset() {
        if (player.fr.unlocked && !hasUpgrade('fr', 26) && !hasAchievement('a', 26)) return false
        if (hasUpgrade('t', 52) && !hasAchievement('a', 53)) return false
        return(player.c.points.gte(temp.fo.nextAt) && hasUpgrade('c', 32))
        
    },
    /*tabFormat: [
        `main-display`,
        `prestige-button`,
        `blank`,
        `resource-display`,
       `blank`,
        `buyables`,
        `blank`,
        `milestones`,
        `blank`,
        [`display-text`, () => `Upgrades with forum as cost will require them, but never spend them. Because I said so.`],
        `upgrades`,
    ],*/
    hotkeys: [
        {key: `f`, description: `F: Reset for forum`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        if (hasUpgrade(`fr`, 26)) return true
        if (hasAchievement('a', 27) && !hasAchievement('a', 31)) return false
        if (hasUpgrade('t', 21) || player.fo.best.gte(1))return true},            // Returns a bool for if this layer's node should be visible in the tree.

    milestones:{
        0: {
            requirementDescription: `1 forum`,
            effectDescription: `Join a Cookie Clicker forum to understand His motivations <br> You gain more clues, but also more mysteries <br> <i>where does the bite of '87 and Ash Ketchum even come from???</i>`,
            done() { return player.fo.points.gte(1) }
        },
        1: {
            requirementDescription: `2 forums`,
            effectDescription: `Join an ARG forum to understand the lore <br> You gain more clues, but also more questions <br> <i>and they do all of this stuff for fun???</i>`,
            done() { return player.fo.points.gte(2) },
            unlocked() {return (hasMilestone('fo', 0)) },
        },
        2: {
            requirementDescription: `3 forums`,
            effectDescription: `Join a prestige tree forum to understand the game <br> You gain more questions, and also more mysteries <br> <i>Oh. so I <b>had</b> to reset to start the game??</i>`,
            done() { return player.fo.points.gte(3) },
            unlocked() {return (hasMilestone('fo', 1)) },
        },
        3: {
            requirementDescription: `4 forums`,
            effectDescription: `Join an incremental game forum to understand math <br> Keep Mystery challenges on 3rd layer reset <br> <i>What does QoL means? Quarry of Limes? Questions on Lost?</i>`,
            done() { return player.fo.points.gte(4) },
            unlocked() {return (hasMilestone('fo', 2)) },
        },
        4: {
            requirementDescription: `5 forums`,
            effectDescription: `Join an googology forum to understand all those numbers <br> Keep Mystery milestones, and, every upgrade that unlock upgrades or challenges now lightly boosts their respective layers <br> <i>The e was not just a decoration?</i>`,
            done() { return player.fo.points.gte(5) },
            unlocked() {return (hasMilestone('fo', 3)) },
        },
        5: {
            requirementDescription: `6 forums`,
            effectDescription: `Join an google + forum to rekindle with your friends <br> You can do friends reset again, but be kind to them <br> <i>I was too harsh on them, I'll need their help too actually</i>`,
            done() { return player.fo.points.gte(6) },
            unlocked() {return (hasMilestone('fo', 4)) },
        },
        6: {
            requirementDescription: `10 forums`,
            effectDescription: `Join a cookie forum to let your computer remember<br> You now keep clue and mystery upgrades upon forums and friends<br> <i>Oh, I get it, it's because you need to Click on our kittens in every state !</i>`,
            done() { return player.fo.points.gte(10) },
            unlocked() {return (hasMilestone('fo', 5)) },
        },
        7: {
            requirementDescription: `20 forums`,
            effectDescription: `Join a helpdesk forum to share all good things you have<br>Forum layer's effect is now branching out and affects clues, theories and mystery gains too<br> <i>So kind of them to help me with my bank account... wait a minu</i>`,
            done() { return player.fo.points.gte(20) },
            unlocked() {return (hasMilestone('fo', 6)) },
        },
        8: {
            requirementDescription: `25 forums`,
            effectDescription: `Join an Nft forum to gain constant passive income <br> You now gain forums automatically and they reset nothing, but Forums start being softcapped <br> <i>So you mean I could also lose all my money and need to check it every once in a while? Feels scammy</i>`,
            done() { return player.fo.points.gte(25) },
            unlocked() {return (hasMilestone('fo', 7)) },
        },
        9: {
            requirementDescription: `50 forums`,
            effectDescription: `Join a job search forum to ask other people to do work you don't wanna bother with <br> Your mystery buyables are now automated, and cost nothing.<br> <i>The sweet bliss of having nothing to do over there anymore</i>`,
            done() { return player.fo.points.gte(50) },
            unlocked() {return (hasMilestone('fo', 8)) },
        },
    },
    upgrades: {
        11:{
            title: `The road to a billion friends starts with a single buyable`,
            description: `Discover brand new mystery buyables to help you stop being so lonely`,
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+ ` Forums`},
            cost: new Decimal(6),
            unlocked() {return(hasUpgrade('fr', 35)) },
            pay() {return false},
        },
        12:{
            title: `Orlan strikes again`,
            description: `You auto-get mysteries and they reset nothing <br><i>What do you mean you've never heard of him?</i>`,
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost + ` Forums`},
            cost: new Decimal(7),
            unlocked() {return(hasUpgrade('fo', 11)) },
            pay() {return false},
        },
        13:{
            title: `Does this layer ever hands out boosts?`,
            description: `Boosts clue gain based on forums`,
            cost: new Decimal(9),
            pay() {return false},
            unlocked() {return(hasUpgrade('fo', 12)) },
            effect() {
                let eff = new Decimal (player.fo.points)
                eff = new Decimal (3.1415).pow(eff)
                if(hasUpgrade('fr', 22) && hasUpgrade('g', 14) && !inChallenge('t', 13)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br>Currently: `+format(this.effect())+`×<br><br>Requires: `+ this.cost +` Forums`},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
            
        },
        14:{
            title: `Done being challenged`,
            description: `<b>You're so cheap</b>'s effect starts being actually good<br><i>I feel like an idea is coming</i>`,
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+ ` Forums`},
            cost: new Decimal(35),
            unlocked() {return (hasAchievement('a', 36))},
            pay() {return false},
        },
    },
   
})




addLayer(`fr`, {
    startData() { return {                   // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),              // `points` is the internal name for the main resource of the layer.
    }},

    color: `#ED57D9`,                       // The color for this layer, which affects many elements.
    resource: `Friends`,                    // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    position: 2,
    baseResource: `cryptic clues`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },       // A function to return the current amount of baseResource.

    requires(){let req = new Decimal(1e16) 
        if (hasAchievement('a', 35)) req = req
        else if (hasAchievement('a', 26)) req = req.times(1e7) 
        return req},                // The amount of the base needed to  gain 1 of the prestige currency.
                                                // Also the amount required to unlock the layer.

    type: `normal`,                             // Determines the formula used for calculating prestige currency.
    exponent: 0.4,                             // `normal` prestige gain is (currency^exponent).

    gainMult() {                                // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 34)) mult = mult.times(2)
	    if (player.fo.unlocked&& hasUpgrade('fr', 23)) mult = mult.times(temp[`fo`].effect)
        return mult                                       
    },
    gainExp() {                                 // Returns your exponent to your gain of the prestige resource.
        exp = new Decimal(1)
        if (hasAchievement('a', 26)&& !hasUpgrade(`fr`, 26)) exp.times(0.25)
        return exp

    },
    branches: [['t', 1]],
    
    tooltipLocked(){if (!player.fr.unlocked && !hasUpgrade('c', 32)) return 'Reach ' + formatWhole(tmp['fr'].requires) + ' ' + tmp['fr'].baseResource + ' to unlock, but you might also need something else (You have ' + formatWhole(tmp['fr'].baseAmount) + ' ' + tmp['fr'].baseResource + ')'
return},


    update() {
        let max = new Decimal (8000000000)
        if (hasUpgrade(`t`, 25) && !hasUpgrade('t', 45)) max = max.times(2)
        if (hasUpgrade(`t`, 45)) max = max.times(player.fo.points)
        if (player.fr.points.gte(max)) player.fr.points= new Decimal (max);
        player.fr.stohp = max
        tmp.fr.softcap = Decimal.minus(max, player.fr.points)
        tmp.fr.softcapPower = new Decimal(0)
    },

    effect() {
        eff = player[this.layer].points.add(1).pow(0.35);
        return eff
        },

    effectDescription() {
        eff = this.effect();
        return `boosting your theory gain based on your current friends by `+format(eff)

    },

    tabFormat: [
        `main-display`,
        `prestige-button`,
        `blank`,
        `resource-display`,
        [`display-text`, () => `You will not gain any more friends after ` + format(player.fr.stohp) + ` because the planet has a limit`],
        `blank`,
        `buyables`,
        `blank`,
        `upgrades`,
    ],

    canReset() {
        if (player.fo.unlocked && !hasAchievement('a', 27) && !hasMilestone('fo', 5)) return false
        if (hasUpgrade('t', 52) && !hasAchievement('a', 53)) return false
        return (player.c.points.gte(temp.fr.requires) && hasUpgrade(`c`, 32))

    },

    hotkeys: [
        {key: `F`, description: `Shift + f: Reset for Friends`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasUpgrade('m', 14)) pg = pg.add(0.00001)
        if (pg <=0||!temp.fr.canReset) return false 
        else return pg
    },

    layerShown() { 
        if (hasMilestone('fo', 5)) return true
        if (hasAchievement('a', 26) && !hasAchievement('a', 32)) return false        
        if (hasUpgrade('t', 21) || player.fr.best.gte(1))return true},             // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: `You came back?`,
            description: `Theory gain is multiplied by 1e400`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        12:{
            title: `We missed you so much`,
            description: `Mystery gain is boosted by 2eeee4`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        13:{
            title: `We love you so much`,
            description: `clue gain is put to the power of 1e100`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        14:{
            title: `come here pal`,
            description: `question are put to infinity`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        15:{
            title: `it s all gonna be fine`,
            description: `you win now do it now`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        16:{
            title: `come here we said.`,
            description: `do it now you coward reset.`,
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        21:{
            title: `Charlie`,
            description: `Boosts mystery and theory effect by 5x`,
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1)
                return new Decimal(1)} ,
            unlocked() {return(!(hasAchievement(`a`, 26) && !player.fr.unlocked))}
        },
        22:{
            title: `Hector`,
            description: `Boosts every upgrade based on number of current friends and bought friends upgrades`,
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(50)
                return new Decimal(5)} ,
            effect() {
                let eff = new Decimal (player.fr.upgrades.length)
                let softlim = new Decimal (`2e5`)
                let powef = new Decimal (0.5)
                let helpme = new Decimal (0.1)
                powef = powef.add(helpme.times(challengeCompletions('t',12)))
                eff = eff.times(player.fr.points.pow(powef).add(1))
                if(inChallenge('t', 12)) eff = eff.div(eff.times(eff).times(10))
                softlim = softlim.times(new Decimal(challengeCompletions('t',12)).add(1))
                softeff = softcap(eff, new Decimal(softlim), new Decimal(0.25))
                return softeff
            },
            effectDisplay() { if(inChallenge('t', 12)) return '/'+format(upgradeEffect(this.layer, this.id).pow('-1'))
                return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
            unlocked() {return((hasUpgrade('fr', 21) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || hasAchievement(`a`, 26) && hasUpgrade('fr', 24))},
            tooltip: `But only works on pre forum/friends upgrades`,
            style() {
                const style = {};
                if (hasUpgrade(this.layer,this.id) && inChallenge('t', 12)) style[`background-color`] = `#FF1D1D`;
                return style;
              },
        },
        23:{
            title: `Orlan`,
            description() {if (player.fo.unlocked) return `Unlocks Forum layer's effect. What do you mean that's... not that bad<br><i>God damn it Orlan, you're full of wonders</i>`
                else return`Unlocks Forum layer's effect. What do you mean that's useless?<br><i>God damn it Orlan</i>`},
                cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(100000000)
                    return new Decimal(5)} ,
            unlocked() {return(hasUpgrade('fr', 22) && (hasAchievement('a', 27)||hasAchievement('a', 35)))},
        },
        24:{
            title: `Orlan`,
            description() {if(hasUpgrade(`t`, 15)) return `Keep theory challenge on 3rd layer reset. That's still not very useful<br><i>God damn it Orlan, and you didn't think about other challenges?</i>`
                    if(hasAchievement(`a`, 26) && !hasAchievement('a', 35)) return `Keep theory challenge on 3rd layer reset. That's still not very useful<br><i>God damn it Orlan, and you didn't think about other challenges?</i>`
                return`Keep theory challenge on Friends and Forums resets. That's still not very useful<br><i>God damn it Orlan, and you're getting expensive too</i>`},
                cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(5)
                    return new Decimal(250)} ,
            unlocked() {return((hasUpgrade('fr', 23) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement(`a`, 26)&& hasUpgrade('fr', 21) && !hasAchievement(`a`, 35)))},
            tooltip: `Next upgrade is gonna cost you 1000 friends`,
        },
        25:{
            title: `Susie`,
            description: `Unlocks new upgrades here and there<br><i>The S actually stands for New Content</i>`,
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1000000)
                return new Decimal(1000)} ,
                unlocked() {return((hasUpgrade('fr', 24) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement(`a`, 26) && !hasAchievement('a', 35)&& hasUpgrade('fr', 22)))},
        },
        26:{
            title: `Ethan`,
            description: `Unlock Forum layer again (and ability to reset it)<br><i>He fixed your internet after asking nicely</i>`,
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(8e9)
                return new Decimal(10000000)} ,
            unlocked() {return((hasUpgrade('fr', 25) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement(`a`, 26) && !hasAchievement('a', 35)&&hasUpgrade('fr', 25)))},
        },
        32:{
            title: `Orlan`,
            description: `Passively gain 10% of theory on reset <i>God damn Orlan, you're not playing around</i>`,
            cost: new Decimal(8e9),
            unlocked() {return (hasAchievement('a', 33))},
        },
        33:{
            title: `Orlan`,
            description: `Keep theory upgrades on 3rd layer resets <i>That's not fair Orlan, Mystery has been waiting for it longer</i>`,
            cost: new Decimal(16e9),
            unlocked() {return (hasUpgrade('fr', 32))},
        },
        34:{
            title: `Kylian`,
            description() { if (hasUpgrade(`fr`, 34)) return `Completely destroys all softcaps in the game, except for <b>Hector</b>'s and <b>It was always just a dream?</b>'s. As a result, all of the affected formulas will be nerfed <br><i>Wait, all of those things were softcapped?</i>`
                return `Completely destroys all softcaps in the game, except for Hector's and forum'. As a result, all of the affected formulas will be nerfed <br><i>Does not really seem fair, and what's with that cost?</i>`},
            cost: new Decimal(`2.5e11`),
            unlocked() {return (hasUpgrade('fr', 35))},
        },
        35:{
            title: `Ismelda`,
            description: `Unlocks new upgrades in the forum layer<br><i>The I actually stands for Forum Are Very Extraordinary (or J.U.N.E. for short)</i>`,
            cost: new Decimal(1),
            unlocked() {return ((hasUpgrade('fr', 21) && hasAchievement('a', 26)) || (hasAchievement('a', 35) && hasUpgrade('fr', 21)))},
        },
        /*36:{
            title: `Ethan`,
            description: `Unlock Forum layer again(?)<br>Forum scaling acts as if you chose it first<br><i>No flavour texts here, keep going</i>`,
            cost: new Decimal(16e9),
            unlocked() {return (hasUpgrade('fr', 33))},
        },*/

    },
    
})


