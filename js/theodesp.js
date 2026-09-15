

addLayer(`d`, {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // `points` is the internal name for the main resource of the layer.
    }},

    color: `#000099`,                       // The color for this layer, which affects many elements.
    resource: `despair points`,            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: `questions`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(100),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: `normal`,                         // Determines the formula used for calculating prestige currency.
    exponent: 0.00000000000000000000000000000001,                          // `normal` prestige gain is (currency^exponent).
   
    hotkeys: [
        {key: `d`, description: `D: Reset for Despair`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    doReset(resettingLayer) {
        let keep = [];
            keep.push(`upgrades`)
            keep.push(`challenges`)
            if (layers[resettingLayer].row > this.row) layerDataReset(`d`, keep)
    },

    canReset() {
        return(hasChallenge(`m`, 14) && hasUpgrade(`c`, 22) &&player.points.gte(100))
    },

    layerShown() { 
        
        if (hasUpgrade(`c`, 22) && hasChallenge(`m`, 14))  return true 
        if(hasChallenge(`d`, 11))  return false
        if (hasUpgrade(`d`, 11))  return true
        return false},            // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: `You`,
            cost: new Decimal(1),
        },
        12:{
            title: `Need`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 11)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        13:{
            title: `Out`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 12)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        14:{
            title: `Of`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 13)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        21:{
            title: `Cookie`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 14)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },

        22:{
            title: `Time?`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 21)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        23:{
            title: `Just`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 22)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        24:{
            title: `Prestige`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 23)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },

        31:{
            title: `Here`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 24)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        32:{
            title: `Then`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 31)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        33:{
            title: `(Upgrades`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 32)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        34:{
            title: `Not`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 33)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        41:{
            title: `Unlimited`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 34)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        42:{
            title: `Though...`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 41)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        43:{
            title: `Sorry!)`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 42)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style}
        },
        44:{
            title: `See?`,
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 43)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 29)) style[`background-color`] = `#004400`; return style},
        },
    },
    challenges: {
            11: {
                name: `A freebie, if you're patient that is`,
                challengeDescription: `Permanent Cookie Time`,
                goalDescription:`get 1000 questions and leave this challenge<br>IF IT'S NOT YELLOW IT'S NOT OVER`,
                rewardDescription:`finally get that new layer.`,
                canComplete: function() {return player.points.gte(1000)},
                unlocked() {return(hasUpgrade('d', 11))}
            },
        
    },
})





addLayer('t', {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // `points` is the internal name for the main resource of the layer.
    }},

    color: `#6FAE20`,                       // The color for this layer, which affects many elements.
    resource: `Theories`,            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: `cryptic clues`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e12),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: `normal`,                         // Determines the formula used for calculating prestige currency.
    exponent: 0.25,                          // `normal` prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        mult = mult.times(buyableEffect('t', 11))
	    if (player.fo.unlocked&& hasMilestone('fo', 7)) mult = mult.times(temp[`fo`].effect)
        if (hasUpgrade(`t`, 51) && !hasUpgrade("c", 41)) mult = mult.div(100)
        if (hasBuyable(`g`, 11) && buyableEffect('t', 21).gte(10)) mult = mult.times(buyableEffect('t', 21).div(10).pow(2))
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    branches: [[`c`, 0]],

    doReset(resettingLayer) {
        let holdonu = []; //make new array to track extra upgrades you want to keep
        if (hasUpgrade(`t`, 25) && !hasUpgrade('fr', 33)) holdonu.push(25);
        let holdonc = [];
        if (hasUpgrade('fr', 24)) holdonc.push(11);
        let keptChallenges = {};
        if (hasUpgrade('fr', 24)) keptChallenges[11] = challengeCompletions(this.layer, 11);
        if (hasUpgrade('fr', 24)) keptChallenges[12] = challengeCompletions(this.layer, 12);
        
    
        let keep = [];
            if (hasUpgrade('fr', 33) && !(resettingLayer==`g` && !hasUpgrade('g', 13))) keep.push(`upgrades`)
            if (layers[resettingLayer].row > this.row) layerDataReset('t', keep)
            if (!hasUpgrade('fr', 33) && layers[resettingLayer].row > this.row) player.t.upgrades.push(...holdonu) 
        for (const [id, completions] of Object.entries(keptChallenges)) {
            player[this.layer].challenges[id] = completions;
            }
    },
    baf: new Decimal(0),
    cfb: new Decimal(0),
    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasUpgrade('fr', 32)) pg = pg.add(0.1)
        pg = pg.times(buyableEffect('t', 21))
        if (pg.lte(0) || !temp.t.canReset) return false 
        if (hasBuyable(`g`, 11) && pg.gte(1)) return 1
        else return pg
    },

    effect() {
        eff = player[this.layer].points.add(1).pow(0.375)
        if (hasChallenge('t', 11)) eff = eff.times(3.21)
        if (hasUpgrade('fr', 21)) eff = eff.times(5)
        if (inChallenge('t', 11)) eff = eff.pow(0)
        softeff = softcap(eff, new Decimal(1e512), new Decimal(0.25))               
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (hasChallenge('t', 11)) return `<b>generously</b> boosting your question gain based on your current theories by `+format(eff)
        return `boosting your question gain based on your current theories by `+format(eff)

    },

    canReset() {
        if (inChallenge(`m`, 14)) return false
        if (player.c.points > 1e12) return true

    },

    hotkeys: [
        {key: 't', description: `T: Reset for Theory`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        
        return(hasChallenge('d', 11) || player.fo.unlocked ||player.fr.unlocked)},            // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        12:{
            title: `Hang in there, we're gonna do this Cookie in`,
            description: `First nerf on Cookie Time`,
            cost: new Decimal(1),
        },
        13:{
            title: `It's time to get faster`,
            description: `Boosts <b>No. No it's not.</b>'s formula`,
            unlocked() {return(hasUpgrade('t', 12)) },
            cost: new Decimal(1),
        },
        14:{
            title: `Back to basics`,
            description: `Unlock a buyable`,
            unlocked() {return(hasUpgrade('t', 13)) },
            cost: new Decimal(20),
            tooltip: `First level will cost you 5 theories`
        },
        15:{
            title: `A vertical...`,
            description: `Unlock a theory challenge to keep the content coming your way`,
            unlocked() {return(hasUpgrade('t', 41)) },
            cost: new Decimal(1e86),
            currencyDisplayName: `Cryptic clues`,
            currencyInternalName: `points`,
            currencyLayer: `c`,
        },
        21:{
            title: `Soon, soon he'll be a Good Boy again`,
            description: `Second nerf on Cookie Time and unlocks two new layers`,
            cost: new Decimal(1000),
        },
        23:{
            title: `A little more might be needed`,
            description: `Your clues boost your clues`,
            effect() {
                let eff = player.c.points.pow(0.1).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+`x` }, // Add formatting to the effect
            unlocked() {return(hasChallenge('t', 11)) },
            cost: new Decimal(2500),
        },
        24:{
            title: `Would a little boost help?`,
            description: `A small but trustworthy 100x boost to question gain and 10x gain to clues gain`,
            unlocked() {return(hasUpgrade('t', 23)) },
            cost: new Decimal(5000),
        },
        25:{
            title: `...layer of...`,
            description: `<i>If I'm online friends with someone and friends irl, doesn't it counts as two friends?</i><br>Friends limit is doubled`,
            unlocked() {return (hasUpgrade('t', 15) || hasUpgrade('t', 25))},
            cost: new Decimal(5),
            tooltip: `Will not actually cost you the forums, but you still need to have them for some reason`,
            currencyDisplayName: `Forums`,
            currencyInternalName: `points`,
            currencyLayer: `fo`,
            pay() {return false},
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+ ` Forums`},
            onPurchase(){
                if(hasUpgrade(`t`, 45)) player.t.upgrades.splice(player.t.upgrades.indexOf(45), 1)
            },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 41)&&hasUpgrade(`t`, 45)) style[`background-color`] = `#004400`; return style},
        },
        31:{
            title: `A new theory`,
            description: `Unlocks a new buyable`,
            unlocked() {return(hasUpgrade('m', 14)) },
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1e28)
                return new Decimal(1e12)} ,
        },
        32:{
            title: `It's like you're never gonna figure out those clues`,
            description: `Mysteries just keep on coming<br>Finally completely annihilate the jump in cost at 4 mysteries`,
            unlocked() {return(hasUpgrade('t', 31)) },
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1e45)
                return new Decimal(1e17)} ,
        },
        34:{
            title: `Is it finally grinding time?`,
            description: `Double Friends gain`,
            unlocked() {return(hasUpgrade('m', 31)) },
            cost: new Decimal(1e30),
        },
        35:{
            title: `...upgrades though`,
            description: `Unlocks yet another theorem buyable<br><i>The T actually stands for buyable</i>`,
            unlocked() {return(hasUpgrade('t', 25)||hasUpgrade('t', 45)) },
            tooltip: `Really precise cost for some reason`,
            cost: new Decimal(1.24578954541236541235496957865245e65),
        },
        41:{
            title: `Going back is not easy`,
            description: `To help with the forums, unlock a new layer`,
            unlocked() {return(hasUpgrade('t', 34)) },
            cost: new Decimal(1e55),
        },
        42:{
            title: `Out with the chores`,
            description: `Automate <b>It was always just a dream?</b>'s purchase and it cost nothing<br><i>Where did that idea go again?</i>`,
            unlocked() {return(hasUpgrade('t', 41)) },
            cost: new Decimal(5e102),
        },
        43:{
            title: `Buy a cork board from Orlan`,
            description: `Theory upgrades boost <b>They're insane and it's all in their head?</b>'s base<br><i>It's on the tip of my tongue</i>`,
            unlocked() {return(hasUpgrade('t', 42)) },
            cost: new Decimal(5e103),
            effect() {
                let eff = Decimal.mul(player.t.upgrades.length, 0.1)
                if(hasUpgrade('fr', 22) && hasUpgrade('g', 14) && !inChallenge('t', 13)) eff=eff.plus(upgradeEffect('fr', 22).log(1e10))
                return eff
            },
            onPurchase(){
                setBuyableAmount('t', 11, new Decimal(0))
            },
            effectDisplay() { return format( upgradeEffect(this.layer, this.id)) + `+` }, // Add formatting to the effect
        },
        45:{
            title: `Not so alone anymore`,
            description: `<i>Is it really the same friend if it's a different forum?</i><br>Friends limit is multiplied by your number of forums<br><i>There's my idea !</i>`,
            unlocked() {return(hasUpgrade('t', 43)) },
            cost: new Decimal(1e110),
            onPurchase(){
                if (hasAchievement('a', 41)) return
                if(hasUpgrade(`t`, 25)) player.t.upgrades.splice(player.t.upgrades.indexOf(25), 1)
                tmp.t.baf = tmp.t.baf.add(1)
            },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 41)&&hasUpgrade(`t`, 25)) style[`background-color`] = `#004400`; return style},
            effectDisplay() { return format( player.fo.points) + `x` }, // Add formatting to the effect
        },
        51:{
            title: `Unearth a greater mystery`,
            description(){if(hasUpgrade('c', 41)) return "Trade <b>ABSOLUTELY NOTHING</b> for a x100 mutliplier on Clue gains and unlock a new layer <i>Will I ever truly get that next upgrade?</i>"
                return`Trade a x100 multiplier on Theory points for a x100 mutliplier on Clue gains and unlock a new layer <i>Will I ever truly get that next upgrade?</i>`},
            cost: new Decimal(1e284),
            tooltip(){if (hasUpgrade('c', 41)) return "I am an upgrade description that knows how to keep up with the trends."
                return
            },
            unlocked() {return(player.t.points.gte(1e283) || hasAchievement(`a`, 52))},
        },
        52:{
            title: `Ladies and Gentlemen, we got him`,
            description: `Cookie Time finally does a boost instead of a nerf`,
            cost() { if (hasAchievement('a', 53) && hasUpgrade('m', 31) && hasAchievement('a', 55)) return new Decimal("1e30008").div(Decimal.pow(10, Decimal.log(player.t.points.add(1).log(10).add(1), 1.15)).pow(663.4))
                if (hasAchievement('a', 53)) return new Decimal("1e30008") 
                return new Decimal(1e308)},
            onPurchase(){
                if (hasAchievement('a', 53)) return
                if(tmp.t.cfb.equals(0)) setTimeout(() => { doPopup(style= `default`, text = `I won't go down without a fight`, title = `He answered`, timer = 3, color = `#aa5a0b`) , doReset('t', true)}, 2000);
                if(tmp.t.cfb.equals(1)) setTimeout(() => { doPopup(style= `default`, text = `As if I would let you do that`, title = `He yelled`, timer = 3, color = `#aa5a0b`) , doReset('t', true)}, 2000);
                if(tmp.t.cfb.equals(2)) setTimeout(() => { doPopup(style= `default`, text = `Stop touching this thing`, title = `He growled`, timer = 3, color = `#aa5a0b`) , player.t.points = player.t.points.times(0) , doReset('t', true)}, 2000);
                if(tmp.t.cfb.equals(3)) setTimeout(() => { doPopup(style= `default`, text = `What did I just tell you`, title = `He replied`, timer = 3, color = `#aa5a0b`) , player.t.points = player.t.points.times(0) , doReset('t', true)}, 2000);
                if(tmp.t.cfb.equals(4)) setTimeout(() => { doPopup(style= `default`, text = `See if you cross me again like that`, title = `He rebuted`, timer = 3, color = `#aa5a0b`) , player.t.points = player.t.points.times(0) , player.m.points = player.m.points.times(0) , doReset('t', true)}, 2000);
                setTimeout(() => { player.t.upgrades.splice(player.t.upgrades.indexOf(52), 1) , tmp.t.cfb = tmp.t.cfb.add(1) }, 5000);

            },
        },
        53:{
            title: `Ladies and Gentlemen,  we in fact do not got him`,
            description: `Total Global conspiracy boosts Mystery gain <br><i>So I could finally get that upgrade, and all of a sudden it breaks? how convenient</i>`,
            cost: new Decimal("1e310"),
            unlocked() {return(hasAchievement(`a`, 53))},
        },
        54:{
            title: `The other half of a cure`,
            description: `<i>Don't ask me what we're gonna cure, I'm pretty sure they just wanted some attention and reassurance.</i><br>Global conspiracies gain is slightly boosted. <i><br>Although now you're gonna have to find what to cure<i>`,
            cost: new Decimal("1e375"),
            unlocked() {return(hasUpgrade(`c`, 41))},
        },

    },
    buyables: {
        11: {
            title: `It was always just a dream?`,
            unlocked() { return hasUpgrade('t', 14) },
            cost(x) {
                let base= new Decimal (5)
                base = base.add(buyableEffect('t', 12))
                return new Decimal(5).mul(base.pow(x)).div(buyableEffect(`m`, 21)).floor()
            },
            display() {
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` theories` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: Boost Theory gain by x` + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                if (new Decimal.add(player.t.buyables[11], player.t.buyables[12]).add(player.t.buyables[21]).gte(tmp.g.clickables[11].limit) && player.g.clickables[11]==1) return false
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (!(hasUpgrade(`t`, 42) && !player.g.clickables[11]==1))player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            tooltip() { 
                let softcap = new Decimal (`1e15`)
                let push = new Decimal (`1e5`)
                push = push.pow(getBuyableAmount('t', 12))
                softcap = softcap.times(push)
                return`Will definitely get softcapped past x`+format(softcap)
        
            },
            effect(x) {
                let softlim = new Decimal (`1e15`)
                let push = new Decimal (`1e5`)
                push = push.pow(getBuyableAmount('t', 12))
                softlim = softlim.times(push)
                let base1 = new Decimal(3)
                let base2 = x
                base1 = base1.add(buyableEffect('t', 12))
                let eff = base1.pow(base2)
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff
            },
        },
        12: {
            title: `They're insane and it's all in their head?`,
            unlocked() { return hasUpgrade('t', 31) },
            cost(x) {
                let base= new Decimal (1e12)
                cost = new Decimal(1e12).mul(base.pow(x)).div(buyableEffect(`m`, 21))
                cost = softcap(cost, new Decimal("1e300"), 2)
                return(cost.floor())
            },
            display() {
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` theories` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: Boost first buyable's effect and cost per purchase's base by +` + format(buyableEffect(this.layer, this.id)) + `<br>And also pushes back its softcap by `+ format(Decimal.pow(1e5, getBuyableAmount(this.layer, this.id))) +`<br>Although this will reset the first buyable's level`
            },
            canAfford() {
                if (new Decimal.add(player.t.buyables[11], player.t.buyables[12]).add(player.t.buyables[21]).gte(tmp.g.clickables[11].limit) && player.g.clickables[11]==1) return false
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (!(hasBuyable(`g`, 21) && !player.g.clickables[11]==1)) player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).times(0))
            },
            effect(x) {
                let base1 = new Decimal(1)
                if (hasUpgrade('t', 43)) base1 = base1.add(upgradeEffect('t', 43))
                let base2 = x
                let eff = base1.mul(base2)

                return eff
            },
        },
        21: {
            title: `The hero was actually a bad guy?`,
            unlocked() { return hasUpgrade('t', 35) },
            cost(x) {
                let base= new Decimal (1e25)
                cost = new Decimal(1e25).mul(base.pow(x)).div(buyableEffect(`m`, 21))
                cost = softcap(cost, new Decimal("1e300"), 2)
                return(cost.floor())
            },
            display() { let myseff = new Decimal(buyableEffect(this.layer, this.id)).pow(2)
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` theories` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: Boost passive theorem generation by x` + format(buyableEffect(this.layer, this.id)) + `<br>Also boosts the mystery layer's effect by x` + format(myseff)
            },
            canAfford() {
                if (new Decimal.add(player.t.buyables[11], player.t.buyables[12]).add(player.t.buyables[21]).gte(tmp.g.clickables[11].limit) && player.g.clickables[11]==1) return false
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (!(hasBuyable(`g`, 21) && !player.g.clickables[11]==1)) player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(4)
                let base2 = x
                let eff = base1.pow(base2)
                return eff
            },
        },
    },
    
    contbug : new Decimal(0),

    update(){
        if(hasUpgrade('t', 52) && !hasAchievement('a', 53) && tmp.t.contbug==0){ tmp.t.contbug = tmp.t.contbug.add(1), setTimeout(() => {tmp.t.contbug = tmp.t.contbug.minus(1); if(hasUpgrade('t', 52)) player.t.upgrades.splice(player.t.upgrades.indexOf(52), 1)}, 6000)};
        
        if(hasUpgrade('t', 42) && !player.g.clickables[11]==1){
            if(tmp.t.buyables[11].canAfford) setBuyableAmount(`t`, 11, player.t.points.add(1).div(5).mul(buyableEffect('m', 21)).log(buyableEffect('t', 12).add(5)).floor().add(1))}
        if(hasBuyable('g', 21) && !player.g.clickables[11]==1){
            if(tmp.t.buyables[12].canAfford)  {buyAm = new Decimal(player.t.points.add(1))
                buyAm = softcap(buyAm, new Decimal('1e300'), 0.5)
                buyAm = buyAm.div(1e12).mul(buyableEffect('m', 21)).log(1e12).floor().add(1)
                setBuyableAmount(`t`, 12, buyAm)
                setBuyableAmount('t', 11, new Decimal(0))}}
        if(hasBuyable('g', 21) && !player.g.clickables[11]==1){
            if(tmp.t.buyables[21].canAfford)   {buyAm = new Decimal(player.t.points.add(1))
                buyAm = softcap(buyAm, new Decimal('1e300'), 0.5)
                buyAm = buyAm.div(1e25).mul(buyableEffect('m', 21)).log(1e25).floor().add(1)
                setBuyableAmount(`t`, 21, buyAm)}}
    },
    challenges: {
        11: {
            name: `Ness is comic?`,
            challengeDescription: `No more mystery or theory layers bonuses for the likes of you`,
            goalDescription:`get 1e7 cryptic clues while in Cookie time`,
            rewardDescription:`Theory layer's boost's formula is much more generous`,
            canComplete: function() {return player.c.points.gte(1e7)&&hasUpgrade('c', 22)},
            unlocked() {return(hasAchievement('a', 25)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 39)) style[`background-color`] = `#004400`; return style}
        },
        12: {
            name: `The characters are<br> actually the seven deadly sins??`,
            challengeDescription: `You ate Hector's favourite snack, he's gonna be tired of you for a while`,
            goalDescription:`get 1e40 questions while in Cookie time`,
            rewardDescription: function() {return `Hector's effect is boosted and its softcap's pushed back. <i>Oh that's<br>not gonna help with future<br>completions.</i><br>Completions: ${challengeCompletions('t',12)}/5`},            
            canComplete: function() {return player.points.gte(1e40)&&hasUpgrade('c', 22)},
            completionLimit:5,
            unlocked() {return(hasUpgrade('t', 15))},
            tooltip:`Fifth completion will unlock a forum upgrade`
        },
        13: {
            name: `test`,
            challengeDescription: `test`,
            goalDescription:`test`,
            rewardDescription: function() {return `test`},            
            canComplete: function() {return false},
            unlocked() {return false},
            countsAs: [11, 12],
            onExit() {if(player.g.clickables[12]==1) {player.g.clickables[12]=0, startChallenge('m', 15)}},
        },
    },
})

//Those two movies are actually set in the same world



