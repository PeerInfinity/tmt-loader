function vc1CapReached() {
    return player.a.vc1Bought == tmp.a.vc1Cap
}

function vc2CapReached() {
    return player.a.vc2Bought == tmp.a.vc2Cap
}

function vc3CapReached() {
    return player.a.vc3Bought == tmp.a.vc3Cap
}

function vc4CapReached() {
    return player.a.vc4Bought == tmp.a.vc4Cap
}

function inAnyChallenge() {
    return inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)||inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)
}

addLayer("a", {
    tabFormat: {
        Intro: {
            content: [["infobox","introBox"]]
        },
        Challenges: {
            content: [
                ["display-text", function() {
                    unlockReq = "Next challenge unlocks at <h2>"+format(tmp.a.challengeUnlockCon)+"</h2> Unstable Dust.<br>"+
                    "(You have "+format(player.c.ud)+" Unstable Dust)<br><br>"
                    if(player.a.ch4Unlocked) unlockReq = ""
                    return unlockReq
                }],
                ["display-text", function() {
                    additionalText = ""
                    if(player.a.ch2Unlocked) additionalText = "For <b>God's Punishment</b> and the challenges onwards, your Crystal Shards, total Crystal Shards, VC, and EC will be reset. The 7th effect of VC and EC will be nullified."
                    return additionalText
                }],"blank",
                "challenges","blank","blank",
                "milestones"
            ]
        },
        Purification: {
            content: [
                ["display-text", function() {
                    let vcGain = upgradeEffect("c",21)
                    if(inChallenge("dm",22)) vcGain = tmp.c.vcGainDC22
                    if(inChallenge("a",22)) vcGain = tmp.c.vcGainDC22
                    return "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+". (+"+format(vcGain)+"/s)"
                }],"blank",
                ["display-text", function() {
                    let effectText = "which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra VC production."
                    if(inChallenge("a",21)) effectText = "which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra Mentality production."
                    if(inChallenge("a",22)) effectText = "which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra Mentality and Weakling Dust production."
                    if(inChallenge("dm",22)) effectText = "which translates to <h3>+"+format(tmp.a.vppEffect.mul(100))+"</h3>% of extra VC production."
                    return "You have <h2>"+formatWhole(tmp.a.vppCount)+"</h2> Virtuous Purification Power, "+effectText
                }], "blank",
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>1</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc1Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc1)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",11]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.25)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>2</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc2Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc2)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",12]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.4)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>3</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc3Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc3)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",13]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.25)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>4</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc4Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc4)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",14]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.4)'}],
            ],
            unlocked() {return hasChallenge("a",11)}
        }
    },
    name: "Angelic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["c"],
    infoboxes: {
        introBox: {
            title: "",
            body() {
                return "Welcome to the next part of the game! This layer is a continual one dedicated for Virtuous Crystals! "+
                "Now, what you'll be facing are the challenges that will have their own unique condition and requirement.<br><br>"+
                "But worry not! Even though challenges may look tempting, they're actually quite straight forward to complete! "+
                "Once you reached the requirement to unlock them, you're as good to go to attempt them!<br>"+
                "(Each challenge takes about 5-15 minutes, while super challenge may take up to an hour)<br><br>"+
                "Next is the Purification, which will be unlocked when you complete the first challenge here. It was my rough idea "+
                "back when I was designing the Crystals layer (to be exact, it was gonna be a random stat for VC). But now it is moved to here "+
                "and I'm quite happy of how it turned out!"
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        challengeCompletion: 0,
        vc1: new Decimal(0), // Purified VC^1
        vc1Bought: 0,
        vc2: new Decimal(0), // Purified VC^2
        vc2Bought: 0,
        vc3: new Decimal(0), // Purified VC^3
        vc3Bought: 0,
        vc4: new Decimal(0), // Purified VC^4
        vc4Bought: 0,
        vpp: new Decimal(0), // Virtuous Purification Power
        ch2Unlocked: false,
        ch3Unlocked: false,
        ch4Unlocked: false,
        inChTime: 0,
        outChTime: 0,
    }},
    color: "rgb(252, 244, 132)",
    requires: new Decimal(5e14), // Can be a function that takes requirement increases into account
    resource: "Angelic Particles", // Name of prestige currency
    resourceSingular: "Angelic Particle",
    baseResource: "Virtuous Crystals", // Name of resource prestige is based on
    baseAmount() {return player.c.vc}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    update(diff) {
        if(!player.a.unlocked) tmp.a.instantUnlockLayer
        if(!player.a.ch2Unlocked) tmp.a.challenge2Unlock
        if(!player.a.ch3Unlocked) tmp.a.challenge3Unlock
        if(!player.a.ch4Unlocked) tmp.a.challenge3Unlock
        tmp.a.challengeCount
        if(player.a.vc2.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.a.vc1 = player.a.vc1.add(tmp.a.vc1Gain.mul(diff))
        if(player.a.vc3.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.a.vc2 = player.a.vc2.add(tmp.a.vc2Gain.mul(diff))
        if(player.a.vc4.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.a.vc3 = player.a.vc3.add(tmp.a.vc3Gain.mul(diff))
        if(inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)) player.a.inChTime = player.a.inChTime + diff
        if(!inAnyChallenge()) player.a.outChTime = player.a.outChTime + diff
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("c",26)},
    doReset(resettingLayer) {
        
    },

    canReset: false,

    instantUnlockLayer() {
        if(player.c.vc.gte(5e14)) player.a.unlocked = true
        return
    },

    challengeCount() {
        player.a.challengeCompletion = challengeCompletions("a",11)+challengeCompletions("a",12)+challengeCompletions("a",21)+challengeCompletions("a",22)
        return
    },

    challengeUnlockCon() {
        let req = new Decimal("1e140")
        if(tmp.a.challenges[12].unlocked) req = new Decimal("1e240")
        if(tmp.a.challenges[21].unlocked) req = new Decimal("1e432")
        if(challengeCompletions("dm",22) == 1) req = new Decimal("1e500")
        return req
    },

    challenge2Unlock() {
        if(player.c.ud.gte("1e140")) player.a.ch2Unlocked = true
        return
    },

    challenge3Unlock() {
        if(player.c.ud.gte("1e240")) player.a.ch3Unlocked = true
        return
    },

    challenge4Unlock() {
        let req = new Decimal("1e432")
        if(challengeCompletions("dm",22) == 1) req = new Decimal("1e500")
        if(player.c.ud.gte(req)) player.a.ch4Unlocked = true
        return
    },

    // Purification #################################################################################################
    vppCount() {
        let count = player.a.vc1.mul(tmp.a.vc1Mult)
        if(inChallenge("a",12)||inChallenge("dm",12)) count = new Decimal(0)
        if(inChallenge("a",22)) count = count.min(2e10)
        return count
    },

    vppEffect() {
        let eff = tmp.a.vppCount
        if(inChallenge("a",22)){
            eff = eff.pow(0.25).sub(1)
            if(hasUpgrade("w",51)) eff = eff.mul(upgradeEffect("w",51))
        }
        if(inChallenge("dm",22)) eff = eff.pow(0.025).sub(1)
        return eff
    },

    vc1Gain() { // this only triggers when having more than 1 VC^2
        let count = player.a.vc2.mul(tmp.a.vc2Mult)
        return count
    },

    vc2Gain() { // this only triggers when having more than 1 VC^3
        let count = player.a.vc3.mul(tmp.a.vc3Mult)
        return count
    },

    vc3Gain() { // this only triggers when having more than 1 VC^4
        let count = player.a.vc4.mul(tmp.a.vc4Mult)
        return count
    },

    vc1Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",22)) mult = mult.mul(upgradeEffect("c",22))
        if(hasChallenge("a",12)) mult = mult.mul(challengeEffect("a",12))
        if(hasChallenge("a",21)) mult = mult.mul(challengeEffect("a",21))
        if(hasChallenge("a",22)) mult = mult.mul(challengeEffect("a",22))
        return mult
    },

    vc2Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",23)) mult = mult.mul(upgradeEffect("c",23))
        if(hasChallenge("a",21)) mult = mult.mul(challengeEffect("a",21))
        if(hasChallenge("a",22)) mult = mult.mul(challengeEffect("a",22))
        return mult
    },

    vc3Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",24)) mult = mult.mul(upgradeEffect("c",24))
        if(hasChallenge("a",22)) mult = mult.mul(challengeEffect("a",22))
        return mult
    },

    vc4Mult() {
        let mult = new Decimal(1)
        return mult
    },

    vc1Cost() {
        let startCost = new Decimal(2e15)
        if(hasUpgrade("c",63)) startCost = new Decimal(1e16)
        let cost = startCost.mul(Decimal.pow(3,player.a.vc1Bought))
        return cost
    },

    vc2Cost() {
        let startCost = new Decimal(2.5e25)
        if(hasUpgrade("c",63)) startCost = new Decimal(1e26)
        let cost = startCost.mul(Decimal.pow(12,player.a.vc2Bought))
        return cost
    },

    vc3Cost() {
        let startCost = new Decimal(7.5e50)
        if(hasUpgrade("c",63)) startCost = new Decimal(1e52)
        let cost = startCost.mul(Decimal.pow(60,player.a.vc3Bought))
        return cost
    },

    vc4Cost() {
        let startCost = new Decimal(1e130)
        let cost = startCost.mul(Decimal.pow(3600,player.a.vc4Bought))
        return cost
    },

    vc1Cap() {
        let cap = 200
        return cap
    },

    vc2Cap() {
        let cap = 200
        return cap
    },

    vc3Cap() {
        let cap = 200
        return cap
    },

    vc4Cap() {
        let cap = 20
        return cap
    },

    challenges: {
        11: {
            name: "Weakling Nullifier",
            challengeDescription: "Disable the gain of Weakling Dust, the 4th EC effect does nothing.",
            goalDescription: "Reach 1.2e34 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal Purification. Mentality gain ^1.1.",
            canComplete: function() {return player.points.gte(1.2e34)},
            rewardEffect: 1.1
        },
        12: {
            name: "God's Punishment",
            challengeDescription: "Crystal Shards gain is now ^0.5 and disables the gain of EC and its effects. Purified Crystals do nothing.",
            goalDescription: "Reach 1e52 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal<sup>2</sup> Purification. ×3 Purified Virtuous Crystal<sup>1</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.a.outChTime = 0
            },
            onExit() {
                player.a.outChTime = 0
            },
            canComplete: function() {return player.points.gte(1e52)},
            unlocked() {return player.a.ch2Unlocked},
            rewardEffect: 3
        },
        21: {
            name: "Mental Clarity",
            challengeDescription: "Purification Power of both types boosts the gain of Mentality instead of Crystals. Weakling Dust gain is drastically decreased but its effect is now multiplicative. Disable the gain of Unstable Dust.",
            goalDescription: "Reach 1e100 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal<sup>3</sup> Purification. ×3 Purified VC<sup>1</sup> and VC<sup>2</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.a.outChTime = 0
            },
            onExit() {
                player.a.outChTime = 0
            },
            canComplete: function() {return player.points.gte("1e100")},
            unlocked() {return player.a.ch3Unlocked},
            style: {'height':'320px'},
            rewardEffect: 3
        },
        22: {
            name: "Ascension to Heaven",
            challengeDescription() {
                let spcText = "<h3 style='color:rgb(119, 6, 34)'>SUPER CHALLENGE ("+formatWhole(challengeCompletions(this.layer,22)+1)+"/"+formatWhole(tmp.dm.challenges[22].completionLimit)+")</h3><br>"
                let descText = "You're having <b>Mental Clarity</b> again but Purification Power also increases Weakling Dust. Unlocks new upgrades that are exclusive to this challenge. "
                let warningText = "<b style='color:red'>You will lose almost everything!</b>"
                return spcText+descText+warningText
            },
            goalDescription() {
                if(challengeCompletions(this.layer,22) == 0) return "Reach 3e65 Mentality<br>and 4e20 Weakling Dust."
                if(challengeCompletions(this.layer,22) == 1) return "Coming soon..."
            },
            rewardDescription() {
                if(challengeCompletions(this.layer,22) == 0) return "Unlocks Virtuous Crystal<sup>4</sup> Purification. ×5 Purified VC<sup>1</sup>,<br>VC<sup>2</sup> and VC<sup>3</sup> multiplier."
                if(challengeCompletions(this.layer,22) == 1) return "Unlocks VC<sup>4</sup>, ×5 Purified VC<sup>1</sup>,<br>VC<sup>2</sup> and VC<sup>3</sup>."
            },
            completionLimit: 4,
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.c.resetCount = new Decimal(0)
                player.ae = new Decimal(0)
                player.de = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.a.outChTime = 0
                player.w.upgrades = []
                player.c.upgrades = []
                player.c.milestones = [9,25,26]
                if(challengeCompletions("dm",22) == 0) player.dm.ch4Unlocked = false
            },
            onExit() {
                player.w.upgrades = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35]
                player.c.upgrades = [11,12,13,14,21,22,23,31,32,33,34,41,42,43,51,52,53,54,55,61,62]
                player.c.milestones = [0,1,2,3,4,5,6,9,20,21,22,23,24,25,26,40,41,42,43,44,45,46,47,48,70,71,72,73,74,75,76,77,78]
                if(challengeCompletions("a",22) >= 1||challengeCompletions("dm",22) >= 1) player.c.milestones.push(27)
                if(player.a.vc4.gte(1)||player.dm.ec4.gte(1)) player.c.upgrades.push(63)
                player.de = new Decimal(0)
                player.ae = new Decimal(0)
                player.c.resetCount = new Decimal(0)
                player.a.outChTime = 0
            },
            canComplete: function() {
                if(challengeCompletions(this.layer,22) == 0) return player.points.gte(3e65)&&player.w.points.gte(4e20)
                if(challengeCompletions(this.layer,22) == 1) return player.points.gte("9e999")&&player.w.points.gte("9e999")
            },
            unlocked() {return player.a.ch4Unlocked},
            style: {'height':'320px'},
            rewardEffect: 5
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 Challenge Completion",
            effectDescription: "Weakling upgrades are no longer reset when entering/exiting Angelic Challenges.",
            done() {return player.a.challengeCompletion >= 1}
        },
        1: {
            requirementDescription: "2 Challenge Completions",
            effectDescription: "×1e10 Mentality gain when entering Angelic Challenges.",
            done() {return player.a.challengeCompletion >= 2}
        },
        2: {
            requirementDescription: "3 Challenge Completions",
            effectDescription: "×1m Virtuous Crystals gain, and ×1k Evil Crystals gain when entering Angelic challenges.",
            done() {return player.a.challengeCompletion >= 3}
        },
        3: {
            requirementDescription: "4 Challenge Completions",
            effectDescription: "The above effects also apply outside of Angelic challenges.",
            done() {return player.a.challengeCompletion >= 4}
        },
    },

    clickables: {
        11: {
            title() {
                if(vc1CapReached()) return "Capped"
                return "Buy"
            },
            display() {
                if(vc1CapReached()) return ""
                return "Cost: "+format(tmp.a.vc1Cost)+" VC"
            },
            tooltip() {return "Bought: "+formatWhole(player.a.vc1Bought)+"/"+formatWhole(tmp.a.vc1Cap)},
            canClick() {return player.c.vc.gte(tmp.a.vc1Cost)&&!vc1CapReached()},
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc1Cost)
                player.a.vc1 = player.a.vc1.add(1)
                player.a.vc1Bought++
            },
            canAfford() {player.c.vc.gte(tmp.a.vc1Cost)},
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc1Cost)
                player.a.vc1 = player.a.vc1.add(1)
                player.a.vc1Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(tmp.a.clickables[11].canClick) color = color1
                return color
            }}
        },
        12: {
            title() {
                if(vc2CapReached()) return "Capped"
                if(hasChallenge("a",12)) return "Buy"
                return "Locked"
            },
            display() {
                if(vc2CapReached()) return ""
                if(hasChallenge("a",12)) return "Cost: "+format(tmp.a.vc2Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",12)) return "Bought: "+formatWhole(player.a.vc2Bought)+"/"+formatWhole(tmp.a.vc2Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("a",12)) return player.c.vc.gte(tmp.a.vc2Cost)&&!vc2CapReached()
                return false
            },
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc2Cost)
                player.a.vc2 = player.a.vc2.add(1)
                player.a.vc2Bought++
            },
            canAfford() {player.c.vc.gte(tmp.a.vc2Cost)},
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc2Cost)
                player.a.vc2 = player.a.vc2.add(1)
                player.a.vc2Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",12)) color = color2
                if(tmp.a.clickables[12].canClick) color = color1
                return color
            }}
        },
        13: {
            title() {
                if(vc3CapReached()) return "Capped"
                if(hasChallenge("a",21)) return "Buy"
                return "Locked"
            },
            display() {
                if(vc3CapReached()) return ""
                if(hasChallenge("a",21)) return "Cost: "+format(tmp.a.vc3Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",21)) return "Bought: "+formatWhole(player.a.vc3Bought)+"/"+formatWhole(tmp.a.vc3Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("a",21)) return player.c.vc.gte(tmp.a.vc3Cost)&&!vc3CapReached()
                return false
            },
            canAfford() {player.c.vc.gte(tmp.a.vc3Cost)},
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc3Cost)
                player.a.vc3 = player.a.vc3.add(1)
                player.a.vc3Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc3Cost)
                player.a.vc3 = player.a.vc3.add(1)
                player.a.vc3Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",21)) color = color2
                if(tmp.a.clickables[13].canClick) color = color1
                return color
            }}
        },
        14: {
            title() {
                if(vc4CapReached()) return "Capped"
                if(hasChallenge("a",22)) return "Buy"
                return "Locked"
            },
            display() {
                if(vc4CapReached()) return ""
                if(hasChallenge("a",22)) return "Cost: "+format(tmp.a.vc4Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",22)) return "Bought: "+formatWhole(player.a.vc4Bought)+"/"+formatWhole(tmp.a.vc4Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("a",22)) return player.c.vc.gte(tmp.a.vc4Cost)&&!vc4CapReached()
                return false
            },
            canAfford() {player.c.vc.gte(tmp.a.vc4Cost)},
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc4Cost)
                player.a.vc4 = player.a.vc4.add(1)
                player.a.vc4Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc4Cost)
                player.a.vc4 = player.a.vc4.add(1)
                player.a.vc4Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",22)) color = color2
                if(tmp.a.clickables[14].canClick) color = color1
                return color
            }}
        },
    }
}) // Angelic

function effAC4x2() {
    return challengeCompletions("a",22) < 2
}

addLayer("ac4", {
    name: "Angelic Challenge 4",
    symbol: "AC4",
    row: "side",
    position: 1,
    color: "rgb(252, 244, 132)",
    tooltip: "Challenge Effects",
    startData() { return {
        unlocked: true,
    }},
    layerShown() {return inChallenge("a",22)},
    tabFormat: [
        ["display-text","An Exhaustive List of Effects for This Challenge", {'font-size':'22px'}],"blank","h-line","blank",
        ["display-text","• Purification Power's Effect is reduced to ^0.25,<br>disable the gain of Purified Crystals"],"blank",
        ["display-text","• Purification Power is hardcapped at 2e10"],"blank",
        ["display-text","• Weakling Dust gain is severely lowered but it is also<br>affected by Purification Power, unaffected by the nerf"],"blank",
        ["display-text","• Remove ALL upgrades in Weakling and Crystals layer, in which<br>they're not retrievable in this challenge"],"blank",
        ["display-text","• Remove ALL milestones in Crystals except <b>20 Crystal Shards</b>,<br><b>1e18 Unstable Dust</b>, and <b>1e70 Unstable Dust</b>"],"blank",
        ["display-text","• The requirement for some Crystal milestones are significantly increased,<br>while the others are not retrievable in this challenge"],"blank",
        ["display-text","• The description for some of the remaining Crystal milestones are altered"],"blank",
        ["display-text","• Unlocks two new currencies: Angelic Essence and Demonic Essence"],
            ["display-text",function() {
                let desc = `▪︎ <b style='color: rgb(252, 244, 132)'>Angelic Essence</b> (AE) is the main currency for purchasing upgrades,<br> the gain is based on the product of Mentality and Weakling Dust<br>`
                let formula = `[formula: log<sub>10</sub><sup>1.6</sup>(Mentality)×log<sub>10</sub><sup>2.4</sup>(Weakling Dust)]`
                if(hasUpgrade("w",53)) formula = `[formula: log<sub>10</sub><sup>1.6</sup>(Mentality)×log<sub>10</sub><sup>2.6</sup>(Weakling Dust)]`
                if(hasUpgrade("w",54)) formula = `[formula: log<sub>10</sub><sup>1.75</sup>(Mentality)×log<sub>10</sub><sup>2.6</sup>(Weakling Dust)]`
                if(hasUpgrade("w",55)) formula = `[formula: log<sub>10</sub><sup>1.75</sup>(Mentality)×log<sub>10</sub><sup>2.6</sup>(Weakling Dust)×log<sub>5</sub><sup>2.2</sup>(Unstable Dust)]`
                return desc+formula
            }],
            ["display-text","▪︎ <b style='color:rgb(168, 26, 69)'>Demonic Essence</b> (DE) has the division effect on AE,<br>which will begin the gain after 1e9 AE,<br>the gain of DE is based on AE"],
            ["display-text",function() {
                let text = ""
                if(player.de.gte(1000)) text = "▪︎ The effect of Demonic Essence will increase even more<br>upon reaching 1,000 of them"
                return text
            }],"blank",
        ["display-text","• Unlocks new Weakling upgrades based on Angelic Essence and a new layer"],"blank",
        ["display-text",function() {if(effAC4x2()) return "<i style='color:gray'>• ??? (More will be unlocked after 1st completion)</i>"; return "• Crystal Shards gain is ^0.3"}],"blank",
        ["display-text",function() {if(effAC4x2()) return ""; return "• The functionality of Crystal Shards has been replaced and altered"}],
        ["display-text",function() {if(effAC4x2()) return ""; return "<i style='color:gray'>(Modder's note: I was gonna just use the prestige button but it would<br>exit the challenge when doing so, therefore I decided to<br>let it stay this way for the rest of the challenge)</i>"}],["blank",function(){if(effAC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effAC4x2()) return ""; return "• The cost of condensing a Crystal is significantly increased"}],["blank",function(){if(effAC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effAC4x2()) return ""; return "• The effects of VC/EC had been altered entirely"}],["blank",function(){if(effAC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effAC4x2()) return ""; return "• Unlocks new Crystals milestones and upgrades"}],["blank",function(){if(effAC4x2()) return "0px"; return ""}],
        ["display-text","• ..."],"blank",
    ]
}) // DC4 effects
