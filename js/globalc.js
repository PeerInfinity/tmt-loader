
addLayer(`g`, {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // `points` is the internal name for the main resource of the layer.
        chalon: new Decimal(0),
        chalto: new Decimal(0),
        buyon: false,
        buyto: false,
        buytre: false,
    }},

    color: `#EDD258`,                       // The color for this layer, which affects many elements.
    resource: `Global Conspiracy`,            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    branches: [['m', 1]],

    position: 0,
    upach: false,

    update() {
        autobuyUpgrades('g')
    },

    effect() {
        eff = player[this.layer].points.add(1).log(2).add(1).pow(2);
        eff = eff.pow(player.g.chalon.times(3).add(1))
        return eff
        },

    effectDescription() {
        eff = this.effect();
        return `multiplying question gain by `+format(eff)

    },

    canReset(){if(hasUpgrade('t', 52) && !hasAchievement('a', 53)) return false
        return(player.m.points.gte(temp.g.requires))
    },

    baseResource: `mysteries`,                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.m.points },  // A function to return the current amount of baseResource.

    requires() {return new Decimal(1623)},              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: `normal`,                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // `normal` prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)
        if(hasUpgrade('t', 54)) mult = mult.times(1.25)
        return mult               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    upgrades: {
        11:{ 
            title: `First Milestone`,
            description() {if (player.g.unlocked) return `Unlock this layer's effect.<br><i><b>They</b> don't want you to have any help</i>`
                return `Unlock this layer's effect.`
            },
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost +` Global conspiracies`},
            cost: new Decimal(1),
            onPurchase() {player.g.points = player.g.points.add(upgradeCost(this.layer, this.id))
                doPopup(style= `default`, text = this.title, title = `"Milestone" reached`, timer = 3, color = `#EDD258`)
            },
        },
        12:{ 
            title: `I swear these used to look different`,
            description() {return `Unlock this layer's ugprades.<br><i><b>They</b> will apparently let you have some help. But at a cost, how dastardly</i>`},
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+` Global conspiracies`},
            cost: new Decimal(5),
            onPurchase() {player.g.points = player.g.points.add(upgradeCost(this.layer, this.id))
                doPopup(style= `default`, text = this.title, title = `"Milestone" reached`, timer = 3, color = `#EDD258`)
            },
            unlocked() {return hasUpgrade('g', 11)},

        },
        13:{ 
            title: `I think we were all tired of this`,
            description() {return `All layer 3 QoL also applies to Global conspiracy layer.<br><i><b>They</b> will apparently let you relax a bit. This one is not that bad actually</i>`},
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+` Mysteries`},
            cost: format(new Decimal(100000)),
            currencyDisplayName: `Mysteries`,
            currencyInternalName: `points`,
            currencyLayer: `m`,
            unlocked() {return hasUpgrade('g', 12)}, 
            onPurchase() {doPopup(style= `default`, text = this.title, title = `"Milestone" reached`, timer = 3, color = `#EDD258`)
            },
        },
        14:{ 
            title: `Is it a bird? Is it a plane?`,
            description() {return `<i>No actually that's just Hector again<i> Hector's effect is multiplied by 10 and applied again to any upgrades that didn't get his boost.<br><i><b>They</b> might have made an enemy of him</i>`},
            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br><br>Requires: `+ this.cost+` Mysteries`},
            cost: format(new Decimal(1e9)),
            currencyDisplayName: `Mysteries`,
            currencyInternalName: `points`,
            currencyLayer: `m`,
            unlocked() {return player.g.chalto.gte(1)}, 
            onPurchase() {doPopup(style= `default`, text = this.title, title = `"Milestone" reached`, timer = 3, color = `#EDD258`)
            },
        },
    },

    challenges: {

        11: {
            name: `The first buyable`,
            completionLimit: 10,
           // completionGoal: new Decimal(10).power(challengeCompletions('g', this.id).add(1)),
            challengeDescription: `Get a taste of the same reality except darker, almost orwellian`,
            goalDescription: function(){ let goal = new Decimal(10).pow(Decimal.add(1, challengeCompletions('g', this.id)))
                return `get `+format(goal)+` Global Conspiracies and then get the hell out`},
            rewardDescription: function() {return `Mystery layer's <b>You're so cheap</b> base is raised to the power of ${challengeCompletions('g',11)+1}`},
            canComplete: function() {return player.g.points.gte(new Decimal(10).pow(Decimal.add(1, challengeCompletions('g', this.id))))},
            unlocked() {return(hasAchievement('a', 53))},
            onComplete(){let goal = new Decimal(10).pow(challengeCompletions('g', this.id))
                player.g.points = player.g.points.minus(goal)},
            onEnter(){if(this.canComplete('g', 11)) completeChallenge('g')},
            onExit(){if (getBuyableAmount(this.layer, 11).gte(2)) setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).mul(0).add(1))
                if(getBuyableAmount(this.layer, 11).equals(0)) { player.g.buyon = false, tmp.g.upach = true}
                if(getBuyableAmount(this.layer, 12).gte(2)) setBuyableAmount(this.layer, 12, getBuyableAmount(this.layer, 12).mul(0).add(1))
                if(getBuyableAmount(this.layer, 12).equals(0)) { player.g.buyto = false, tmp.g.upach = true}
                if(getBuyableAmount(this.layer, 21).gte(2)) setBuyableAmount(this.layer, 21, getBuyableAmount(this.layer, 21).mul(0).add(1))
                if(getBuyableAmount(this.layer, 21).equals(0)) { player.g.buytre = false, tmp.g.upach = true}
            },
            reseter : false,
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement(`a`, 42)) style[`background-color`] = `#004400`; return style}

            
      },
      
      12: {
            name: `They're all AIs I know it`,
            completionLimit: 10,
           // completionGoal: new Decimal(10).power(challengeCompletions('g', this.id).add(1)),
            challengeDescription: `Get a taste of the same reality except more futurist, almost cyberpunkish`,
            goalDescription: function(){ let goal = new Decimal(10).pow(Decimal.add(1, challengeCompletions('g', this.id)))
                return `get `+format(goal)+` Global Conspiracies and then get the hell out`},
            rewardDescription: function() {return `Mystery layer's <b>You're so cheap</b> base is raised to the power of ${challengeCompletions('g',11)+1}`},
            canComplete: function() {return player.g.points.gte(new Decimal(10).pow(Decimal.add(1, challengeCompletions('g', this.id))))},
            unlocked() {return(false)},
            onComplete(){let goal = new Decimal(10).pow(challengeCompletions('g', this.id))
                player.g.points = player.g.points.minus(goal)},
            onEnter(){if(this.canComplete('g', 11)) completeChallenge('g')},
            onExit(){if (getBuyableAmount(this.layer, 11).gte(2)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).mul(0).add(1))
                if(getBuyableAmount(this.layer, 11).equals(0)) { tmp.g.buyables[11].bought = false, tmp.g.upach = true}
            },
            reseter : false
            
      },

    },
    clickables: {
        11: {
            title: `The first challenge`,
            display() {
                if(player.g.clickables[this.id]==0){return `Click here to do a <b>Global Conspiracies</b> reset and enter a challenge world.<br>In this world your <b>Theory</b> buyables are limited, all theory buyable automation is restricted.<br>Effect: <b>Global conspiracy</b>'s layer effect is raised by `+ player.g.chalon.times(3).add(1)}
                if(!player.g.clickables[this.id]==0 && player.g.chalon==11){return `Click here to do a <b>Global Conspiracies</b> reset and exit the challenge world.<br>In this world your <b>Theory</b> buyables are limited, all theory buyable automation is restricted.<br>I think you've had enough now.`}
                return (`Click here to do a <b>Global Conspiracies</b> reset and exit the challenge world.<br>In this world your <b>Theory</b> buyables are limited, all theory buyable automation is restricted.<br>You can have a maximum of ` +tmp.g.clickables[this.id].limit + ` <b>Theory</b> buyables<br>Reach ` + tmp.g.clickables[this.id].goal + ` theories to be able to complete the challenge.`)},
            canClick(){return true},
            onClick(){
                if(player.g.clickables[this.id]==1 && player.t.points.gte(tmp.g.clickables[this.id].goal) && player.g.chalon.lt(11)) player.g.chalon = player.g.chalon.add(1)
                if(player.g.clickables[this.id]==1)player.g.clickables[this.id]=0
                else player.g.clickables[this.id]=1
                doReset('g', 1)},
            unlocked(){return(!challengeCompletions('g', 11)==0)},
            limit() {return(new Decimal(10).minus(player.g.chalon).times(3))},
            goal() {return (new Decimal(1e10).pow(player.g.chalon).times(1e110))}
           
    },
    12: {
        title: `They're making it harder but just for me personally`,
        display() {
            if(player.g.clickables[this.id]==0){return `Click here to do a <b>Global Conspiracies</b> reset and enter a challenge world.<br>In this world you are stuck in every layer 2 challenge, except the fourth mystery challenge and the despair challenge.<br>Effect: <b>Can I get another one?</b> upgrade is raised by `+ player.g.chalto.times(2).add(1)}
            return (`Click here to do a <b>Global Conspiracies</b> reset and exit the challenge world.<br>In this world you are stuck in every layer 2 challenge, except the fourth mystery challenge and the despair challenge. Reach ` + format(tmp.g.clickables[this.id].goal) + ` questions to be able to complete the challenge.`)},
        canClick(){return true},
        onClick(){
            if(player.g.clickables[this.id]==1 && player.points.gte(tmp.g.clickables[this.id].goal)) player.g.chalto = player.g.chalto.add(1)
            if(player.g.clickables[this.id]==1)player.g.clickables[this.id]=0
            else player.g.clickables[this.id]=1
            doReset('g', 1)
            if(player.g.clickables[this.id]==1) {startChallenge('t', 13), startChallenge('m', 15)}
            },
        unlocked(){return hasAchievement('a', 55)},
        goal() {return (new Decimal(1e5).pow(player.g.chalto).times(1e10))},
       
},


},
    buyables: {
        11: {
            title: `The first upgrade`,
            unlocked() { return hasUpgrade('g', 12) },
            cost() { return new Decimal(5) },
            display() {if(inChallenge('g', 11)) return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: <i>A passive generation that goes beyond 100% is nonsense.</i><br> Hardcap all passive generation at 100% and anything that multiplies it past the hardcap gets squared and applied to gain`
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + hasBuyable(`g`, 11) + `<br>Effect: <i>A passive generation that goes beyond 100% is nonsense.</i><br> Hardcap all passive generation at 100% and anything that multiplies it past the hardcap gets squared and applied to gain`
            },
            canAfford() { if (inChallenge('g', 11) && player.g.buyon) return true
                return player[this.layer].points.gte(this.cost()) },
            buy() {
                if(!(inChallenge('g', 11) && player.g.buyon))player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (getBuyableAmount(this.layer, this.id).equals(9)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).mul(0))
                else setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.g.buyon = true
            },
            purchaseLimit() {if (inChallenge('g', 11)) return new Decimal(10)
                return new Decimal(1)},
        },

        12: {
            title: `Grab your tinfoil hats`,
            unlocked() { return hasAchievement('a', 54) },
            cost() { return new Decimal(format(2500)) },
            display() {if(inChallenge('g', 11)) return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: <i><b>THEY</b> are everywhere.</i><br> This layer's effect now also affect clue gain.`
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + hasBuyable(`g`, this.id) + `<br>Effect: <i><b>THEY</b> are everywhere.</i><br> This layer's effect now also affect clue gain.`
            },
            canAfford() { if (inChallenge('g', 11) && player.g.buyto) return true
                return player[this.layer].points.gte(this.cost()) },
            buy() {
                if(!(inChallenge('g', 11) && player.g.buyto))player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (getBuyableAmount(this.layer, this.id).equals(9)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).mul(0))
                else setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.g.buyto = true
            },
            purchaseLimit() {if (inChallenge('g', 11)) return new Decimal(10)
                return new Decimal(1)},
        },

        21: {
            title: `First they'll do everything for us...`,
            unlocked() { return false },
            cost() { return new Decimal(format(50000)) },
            display() {if(inChallenge('g', 11)) return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + getBuyableAmount(this.layer, this.id) + `<br>Effect: <i><b>THEY</b> will try to become irreplaceable.</i><br>Clue upgrades are now kept on theory reset, and the two other theory buyables are now also atomated.`
                return `Cost: ` + format(tmp[this.layer].buyables[this.id].cost) + ` Global conspiracies` + `<br>Bought: ` + hasBuyable(`g`, this.id) + `<br>Effect: <i><b>THEY</b> will try to become irreplaceable.</i><br>Clue upgrades are now kept on theory reset, and the two other theory buyables are now also atomated.`
            },
            canAfford() { if (inChallenge('g', 11) && player.g.buytre) return true
                return player[this.layer].points.gte(this.cost()) },
            buy() {
                if(!(inChallenge('g', 11) && player.g.buytre))player[this.layer].points = player[this.layer].points.sub(this.cost())
                if (getBuyableAmount(this.layer, this.id).equals(9)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).mul(0))
                else setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1)), player.g.buytre = true
            },
            purchaseLimit() {if (inChallenge('g', 11)) return new Decimal(10)
                return new Decimal(1)},
        },
    },

    layerShown() {if(hasUpgrade('t', 51) || player.g.unlocked) return true
    },             // Returns a bool for if this layer's node should be visible in the tree.

    
    hotkeys: [
        {key: `g`, description: `g: Reset for Global Conspiracies`, onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
})
//            fullDisplay() {return `<h3>`+this.title+`</h3><br>`+tmp[this.layer].upgrades[this.id].description+`<br>Currently: ×`+format(this.effect())+`<br><br>Requires: `+ this.cost},
