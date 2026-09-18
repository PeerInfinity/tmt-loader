function ec1CapReached() {
    return player.dm.ec1Bought == tmp.dm.ec1Cap
}

function ec2CapReached() {
    return player.dm.ec2Bought == tmp.dm.ec2Cap
}

function ec3CapReached() {
    return player.dm.ec3Bought == tmp.dm.ec3Cap
}

function ec4CapReached() {
    return player.dm.ec4Bought == tmp.dm.ec4Cap
}

function vcEffectsListDC22(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Virtuous Crystals.</div>"
	let effectsLocked = [
		"",
		lockPre+"1"+" Virtuous Crystal.</div>",
		lockPre+"3"+lockPost,
		lockPre+"6"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"15"+lockPost,
		lockPre+"20"+lockPost,
		lockPre+"33"+lockPost,
		lockPre+"50"+lockPost,
        lockPre+"100"+lockPost,
	]
	let effects = [
		"◆ Unlock automation for<br><b>Weakling Strengthen</b>.<br>",
        "<div style='padding: 10px'>◆ Improve the gain formula of Angelic Essence.</div>",
        "<div style='padding: 10px'>◆ Angelic Essence also divide<br>Weakling Dust gain.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToAEBase))+" Angelic Essence gain.</div>",
		"<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToECEffects))+" to all effects on Evil Crystals<br>except the 1st effect.<br></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorvc,formatWhole(tmp.c.vcToCostIncrease))+" to the base cost of condensing Crystals.</div>",
		"<div style='padding: 10px'>◆ Unlock Crystal Shards upgrades.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToAEEffect))+" to the first effect of Angelic Essence.</div>",
		"<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToEC))+" to Evil Crystals gain.</div>",
        "<div style='padding: 10px'>◆ Reclaim the generation of Virtuous Crystals.</div>",
	]
    if(hasMilestone("c",85)) effects[4] =  "<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToECEffects))+" to all effects on Evil Crystals<br>except the 1st and the 6th.<br></div>"
	if(hasMilestone("c",87)) effects[4] =  "<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToECEffects))+" to all effects on Evil Crystals<br>except the 1st, the 6th and the 8th.<br></div>"
    let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

function ecEffectsListDC22(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Evil Crystals.</div>"
	let effectsLocked = [
		"<div style='color: gray;'>◇ Next unlocks at 1 Evil Crystal.</div>",
        lockPre+"2"+lockPost,
		lockPre+"4"+lockPost,
		lockPre+"6"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"20"+lockPost,
		lockPre+"40"+lockPost,
		lockPre+"60"+lockPost,
		lockPre+"100"+lockPost,
        lockPre+"1,000"+lockPost,
	]
	let effects = [
		"◆ Unlock Automation for <b>Demonic Strengthen</b>.<div style='padding:7px'>Currently: "+formatWhole(tmp.c.bulkBuyCount)+" per second.</div>",
        "<div style='padding: 10px'>◆ Keep all of Weakling upgrades<br>on reset.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToCS))+" Crystal Shards gained on reset.<br></div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToDE))+" Demonic Essence gain.<br></div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToWeakling))+" Weakling Dust gain.<br></div>",
        "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToBulkCount))+" to the speed of 1st effect,<br>up to 25/s.</div>",
		"<div style='padding: 10px'>◆ Unlock a new milestone for Unstable Dust.</div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,format(tmp.c.ecToWSBaseMult))+" to the multiplier of <b>Weakling Strengthen</b> per purchase,<br>up to ×4 total.</div>",
		"<div style='padding: 10px'>◆ Unlock Evil Crystal upgrades.</div>",
        "<div style='padding: 10px'>◆ Reclaim the generation of<br>Evil Crystals.</div>",
	]
	if(hasMilestone("c",85)) effects[0] = "◆ Unlock Automation for <b>Demonic Strengthen</b>.<div style='padding:7px'>Currently: "+colorText("b",tmp.c.colorec,formatWhole(tmp.c.bulkBuyCount))+" per second.</div>"
	let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

addLayer("dm", {
    tabFormat: {
        Intro: {
            content: [["infobox","introBox"]]
        },
        Challenges: {
            content: [
                ["display-text", function() {
                    unlockReq = "Next challenge unlocks at <h2>"+format(tmp.dm.challengeUnlockCon)+"</h2> Unstable Dust.<br>"+
                    "(You have "+format(player.c.ud)+" Unstable Dust)<br><br>"
                    if(player.dm.ch4Unlocked) unlockReq = ""
                    return unlockReq
                }],
                ["display-text", function() {
                    additionalText = ""
                    if(player.dm.ch2Unlocked) additionalText = "For <b>Virtue Eradication</b> and the challenges onwards, your Crystal Shards, total Crystal Shards, VC, and EC will be reset. The 7th effect of VC and EC will be nullified."
                    return additionalText
                }],"blank",
                "challenges","blank","blank",
                "milestones"
            ]
        },
        Purification: {
            content: [
                ["display-text", function() {
                    let ecGain = upgradeEffect("c",41)
                    if(inChallenge("dm",22)) ecGain = tmp.c.ecGainDC22
                    if(inChallenge("a",22)) ecGain = tmp.c.ecGainDC22
                    return "You have "+colorText("h3",tmp.c.colorec,formatWhole(player.c.ec))+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+". (+"+format(ecGain)+"/s)"
                }],"blank",
                ["display-text", function() {
                    let effectText = "which translates to <h3>+"+formatWhole(tmp.dm.eppEffect.mul(100))+"</h3>% of extra EC production."
                    if(inChallenge("a",21)) effectText = "which translates to <h3>+"+format(tmp.dm.eppEffect.mul(100))+"</h3>% of extra Mentality production."
                    if(inChallenge("a",22)) effectText = "which translates to <h3>+"+format(tmp.dm.eppEffect.mul(100))+"</h3>% of extra Mentality and Weakling Dust production."
                    if(inChallenge("dm",22)) effectText = "which translates to <h3>+"+format(tmp.dm.eppEffect.mul(100))+"</h3>% of extra EC production."
                    return "You have <h2>"+formatWhole(tmp.dm.eppCount)+"</h2> Evil Purification Power, "+effectText
                }], "blank",
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>1</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec1Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec1)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",11]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.2)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>2</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec2Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec2)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",12]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.35)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>3</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec3Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec3)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",13]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.2)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>4</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec4Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec4)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",14]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.35)'}],
            ],
            unlocked() {return hasChallenge("dm",11)}
        }
    },
    name: "Demonic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["c"],
    infoboxes: {
        introBox: {
            title: "",
            body() {
                return "Welcome to the next part of the game! This layer is a continual one dedicated for Evil Crystals! "+
                "The description are pretty much the same as Angelic so you can read that part once you unlocked it :)<br>"+
                "<i>(And ironically, these two layers have the same structure, just working with a different type of Crystal)</i>"
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        challengeCompletion: 0,
        ec1: new Decimal(0), // Purified EC^1
        ec1Bought: 0,
        ec2: new Decimal(0), // Purified EC^2
        ec2Bought: 0,
        ec3: new Decimal(0), // Purified EC^3
        ec3Bought: 0,
        ec4: new Decimal(0), // Purified EC^4
        ec4Bought: 0,
        epp: new Decimal(0), // Evil Purification Power
        ch2Unlocked: false,
        ch3Unlocked: false,
        ch4Unlocked: false,
        inChTime: 0
    }},
    color: "rgb(168, 26, 69)",
    requires: new Decimal(1e15), // Can be a function that takes requirement increases into account
    resource: "Demonic Particles", // Name of prestige currency
    resourceSingular: "Demonic Particle",
    baseResource: "Evil Crystals", // Name of resource prestige is based on
    baseAmount() {return player.c.ec}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    update(diff) {
        if(!player.dm.unlocked) tmp.dm.instantUnlockLayer
        if(!player.dm.ch2Unlocked) tmp.dm.challenge2Unlock
        if(!player.dm.ch3Unlocked) tmp.dm.challenge3Unlock
        if(!player.dm.ch4Unlocked) tmp.dm.challenge4Unlock
        tmp.dm.challengeCount
        if(player.dm.ec2.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.dm.ec1 = player.dm.ec1.add(tmp.dm.ec1Gain.mul(diff))
        if(player.dm.ec3.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.dm.ec2 = player.dm.ec2.add(tmp.dm.ec2Gain.mul(diff))
        if(player.dm.ec4.gte(1)&&!inChallenge("dm",22)&&!inChallenge("a",22)) player.dm.ec3 = player.dm.ec3.add(tmp.dm.ec3Gain.mul(diff))
        if(inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)) player.dm.inChTime = player.dm.inChTime + diff
        if(inChallenge("a",22)||inChallenge("dm",22)){
            player.ae = player.ae.add(aeGain().mul(diff))
            player.de = player.de.add(deGain().mul(diff))
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("c",26)},
    doReset(resettingLayer) {

    },

    canReset: false,

    instantUnlockLayer() {
        if(player.c.ec.gte(1e15)) player.dm.unlocked = true
        return
    },

    challengeCount() {
        player.dm.challengeCompletion = challengeCompletions("dm",11)+challengeCompletions("dm",12)+challengeCompletions("dm",21)+challengeCompletions("dm",22)
        return
    },

    challengeUnlockCon() {
        let req = new Decimal("1e140")
        if(tmp.dm.challenges[12].unlocked) req = new Decimal("1e240")
        if(tmp.dm.challenges[21].unlocked) req = new Decimal("1e432")
        if(challengeCompletions("a",22) == 1) req = new Decimal("1e512")
        return req
    },

    challenge2Unlock() {
        if(player.c.ud.gte("1e140")) player.dm.ch2Unlocked = true
        return
    },

    challenge3Unlock() {
        if(player.c.ud.gte("1e240")) player.dm.ch3Unlocked = true
        return
    },

    challenge4Unlock() {
        let req = new Decimal("1e432")
        if(challengeCompletions("a",22) == 1) req = new Decimal("1e512")
        if(player.c.ud.gte(req)) player.dm.ch4Unlocked = true
        return
    },

    // Purification
    eppCount() {
        let count = player.dm.ec1.mul(tmp.dm.ec1Mult)
        if(inChallenge("a",12)||inChallenge("dm",12)) count = new Decimal(0)
        if(inChallenge("a",22)) count = count.min(2e10)
        return count
    },

    eppEffect() {
        let eff = tmp.dm.eppCount
        if(inChallenge("a",22)){
            eff = eff.pow(0.25).sub(1)
            if(hasUpgrade("w",52)) eff = eff.mul(upgradeEffect("w",52))
        }
        if(inChallenge("dm",22)) eff = eff.pow(0.025).sub(1)
        return eff
    },

    ec1Gain() { // this only triggers when having more than 1 EC^2
        let count = player.dm.ec2.mul(tmp.dm.ec2Mult)
        return count
    },

    ec2Gain() { // this only triggers when having more than 1 EC^2
        let count = player.dm.ec3.mul(tmp.dm.ec3Mult)
        return count
    },

    ec3Gain() { // this only triggers when having more than 1 EC^2
        let count = player.dm.ec4.mul(tmp.dm.ec4Mult)
        return count
    },

    ec1Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",42)) mult = mult.mul(upgradeEffect("c",42))
        if(hasChallenge("dm",12)) mult = mult.mul(challengeEffect("dm",12))
        if(hasChallenge("dm",21)) mult = mult.mul(challengeEffect("dm",21))
        if(hasChallenge("dm",22)) mult = mult.mul(challengeEffect("dm",22))
        return mult
    },

    ec2Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",43)) mult = mult.mul(upgradeEffect("c",43))
        if(hasChallenge("dm",21)) mult = mult.mul(challengeEffect("dm",21))
        if(hasChallenge("dm",22)) mult = mult.mul(challengeEffect("dm",22))
        return mult
    },

    ec3Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",44)) mult = mult.mul(upgradeEffect("c",44))
        if(hasChallenge("dm",22)) mult = mult.mul(challengeEffect("dm",22))
        return mult
    },

    ec4Mult() {
        let mult = new Decimal(1)
        return mult
    },

    ec1Cost() {
        let startCost = new Decimal(5e15)
        let cost = startCost.mul(Decimal.pow(3,player.dm.ec1Bought))
        return cost
    },

    ec2Cost() {
        let startCost = new Decimal(1e26)
        let cost = startCost.mul(Decimal.pow(12,player.dm.ec2Bought))
        return cost
    },

    ec3Cost() {
        let startCost = new Decimal(1e52)
        let cost = startCost.mul(Decimal.pow(60,player.dm.ec3Bought))
        return cost
    },

    ec4Cost() {
        let startCost = new Decimal(1e130)
        let cost = startCost.mul(Decimal.pow(3600,player.dm.ec4Bought))
        return cost
    },

    ec1Cap() {
        let cap = 200
        return cap
    },

    ec2Cap() {
        let cap = 200
        return cap
    },

    ec3Cap() {
        let cap = 200
        return cap
    },

    ec4Cap() {
        let cap = 20
        return cap
    },

    challenges: {
        11: {
            name: "Weakling Amplifier",
            challengeDescription: "Weakling Dust effect is now ^2. The 4th, 5th, 8th VC effects, and 1st UD milestone are disabled.",
            goalDescription: "Reach 1e11 Weakling Dust.",
            rewardDescription: "Unlocks Evil Crystal Purification. The UD Effect is further reduced to ^0.7.",
            canComplete: function() {return player.w.points.gte(1e11)},
            rewardEffect: 0.7
        },
        12: {
            name: "Virtue Eradication",
            challengeDescription: "Crystal Shards gain is now ^0.5 and disables the gain of VC and its effects. Purified Crystals do nothing.",
            goalDescription: "Reach 5e31 Weakling Dust.",
            rewardDescription: "Unlocks Evil Crystal<sup>2</sup> Purification. ×3 Purified Evil<br>Crystal<sup>1</sup> multiplier.",
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
            canComplete: function() {return player.w.points.gte(5e31)},
            unlocked() {return player.dm.ch2Unlocked},
            rewardEffect: 3
        },
        21: {
            name: "Chains & Constraints",
            challengeDescription: "Weakling Dust gain is now squared, but you only have the first two rows of Weakling Upgrades and the 2nd row of Crystal upgrades of each type. (<b>Distillation</b> is also kept)",
            goalDescription: "Reach 2e90 Weakling Dust.",
            rewardDescription: "Unlocks Evil Crystal<sup>3</sup> Purification. ×3 Purified EC<sup>1</sup> and EC<sup>2</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.a.outChTime = 0
                player.w.upgrades = [11,12,13,14,15,21,22,23,24,25]
                player.c.upgrades = [21,22,41,42,55,61]
            },
            onExit() {
                player.w.upgrades = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35]
                player.c.upgrades = [11,12,13,14,21,22,31,32,33,34,41,42,51,52,53,54,55,61]
                if(player.a.vc3.gte(8)||player.dm.ec3.gte(9)) player.c.upgrades.push(23,43,62)
                if(player.a.vc4.gte(1)||player.dm.ec4.gte(1)) player.c.upgrades.push(63)
                player.a.outChTime = 0
            },
            canComplete: function() {return player.w.points.gte(2e90)},
            unlocked() {return player.dm.ch3Unlocked},
            rewardEffect: 3
        },
        22: {
            name: "An Escape from Hell",
            challengeDescription() {
                let spcText = "<h3 style='color:rgb(119, 6, 34)'>SUPER CHALLENGE ("+formatWhole(challengeCompletions(this.layer,22)+1)+"/"+formatWhole(tmp.dm.challenges[22].completionLimit)+")</h3>"
                let descText = "<br>Disable the gain of Mentality. Unlocks new upgrades that are exclusive to this challenge. "
                let warningText = "<b style='color:red'>You will lose almost everything!</b>"
                return spcText+descText+warningText
            },
            goalDescription() {
                if(challengeCompletions(this.layer,22) == 0) return "Reach 2.58e47 Weakling Dust."
                if(challengeCompletions(this.layer,22) == 1) return "Coming soon..."
            },
            rewardDescription() {
                if(challengeCompletions(this.layer,22) == 0) return "Unlocks Evil Crystal<sup>4</sup> Purification. ×5 Purified EC<sup>1</sup>, EC<sup>2</sup><br>and EC<sup>3</sup> multiplier."
                if(challengeCompletions(this.layer,22) == 1) return "Unlocks EC<sup>4</sup>, ×5 Purified EC<sup>1</sup>, EC<sup>2</sup> and EC<sup>3</sup>."
            },
            completionLimit: 4,
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.c.resetCount = new Decimal(0)
                player.c.dealCount = new Decimal(0)
                player.ae = new Decimal(0)
                player.de = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
                player.a.outChTime = 0
                player.w.upgrades = []
                player.c.upgrades = []
                player.c.milestones = [9,25,26]
                if(challengeCompletions("a",22) == 0) player.a.ch4Unlocked = false
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
                if(challengeCompletions(this.layer,22) == 0) return player.w.points.gte(Decimal.pow(8,52.5))
                return getPointGen().gte(1)
            },
            unlocked() {return player.dm.ch4Unlocked},
            rewardEffect: 5
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 Challenge Completion",
            effectDescription: "Weakling upgrades are no longer reset when entering/exiting Demonic Challenges.",
            done() {return player.dm.challengeCompletion >= 1}
        },
        1: {
            requirementDescription: "2 Challenge Completions",
            effectDescription: "×2e10 Weakling Dust gain when entering Demonic Challenges.",
            done() {return player.dm.challengeCompletion >= 2}
        },
        2: {
            requirementDescription: "3 Challenge Completions",
            effectDescription: "×1m Evil Crystals gain, and ×1k Virtuous Crystals gain when entering Demonic challenges.",
            done() {return player.dm.challengeCompletion >= 3}
        },
        3: {
            requirementDescription: "4 Challenge Completions",
            effectDescription: "The above effects also apply outside of Demonic challenges.",
            done() {return player.dm.challengeCompletion >= 4}
        },
    },

     clickables: {
        11: {
            title() {
                if(ec1CapReached()) return "Capped"
                return "Buy"
            },
            display() {
                if(ec1CapReached()) return ""
                return "Cost: "+format(tmp.dm.ec1Cost)+" VC"
            },
            tooltip() {return "Bought: "+formatWhole(player.dm.ec1Bought)+"/"+formatWhole(tmp.dm.ec1Cap)},
            canClick() {return player.c.ec.gte(tmp.dm.ec1Cost)&&!ec1CapReached()},
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec1Cost)
                player.dm.ec1 = player.dm.ec1.add(1)
                player.dm.ec1Bought++
            },
            canAfford() {player.c.ec.gte(tmp.dm.ec1Cost)},
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec1Cost)
                player.dm.ec1 = player.dm.ec1.add(1)
                player.dm.ec1Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(tmp.dm.clickables[11].canClick) color = color1
                return color
            }}
        },
        12: {
            title() {
                if(ec2CapReached()) return "Capped"
                if(hasChallenge("dm",12)) return "Buy"
                return "Locked"
            },
            display() {
                if(ec2CapReached()) return ""
                if(hasChallenge("dm",12)) return "Cost: "+format(tmp.dm.ec2Cost)+" EC"
                return ""
            },
            tooltip() {
                if(hasChallenge("dm",12)) return "Bought: "+formatWhole(player.dm.ec2Bought)+"/"+formatWhole(tmp.dm.ec2Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("dm",12)) return player.c.ec.gte(tmp.dm.ec2Cost)&&!ec2CapReached()
                return false
            },
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec2Cost)
                player.dm.ec2 = player.dm.ec2.add(1)
                player.dm.ec2Bought++
            },
            canAfford() {player.c.ec.gte(tmp.dm.ec2Cost)},
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec2Cost)
                player.dm.ec2 = player.dm.ec2.add(1)
                player.dm.ec2Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(hasChallenge("dm",12)) color = color2
                if(tmp.dm.clickables[12].canClick) color = color1
                return color
            }}
        },
        13: {
            title() {
                if(ec3CapReached()) return "Capped"
                if(hasChallenge("dm",21)) return "Buy"
                return "Locked"
            },
            display() {
                if(ec3CapReached()) return ""
                if(hasChallenge("dm",21)) return "Cost: "+format(tmp.dm.ec3Cost)+" EC"
                return ""
            },
            tooltip() {
                if(hasChallenge("dm",21)) return "Bought: "+formatWhole(player.dm.ec3Bought)+"/"+formatWhole(tmp.dm.ec3Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("dm",21)) return player.c.ec.gte(tmp.dm.ec3Cost)&&!ec3CapReached()
                return false
            },
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec3Cost)
                player.dm.ec3 = player.dm.ec3.add(1)
                player.dm.ec3Bought++
            },
            canAfford() {player.c.ec.gte(tmp.dm.ec3Cost)},
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec3Cost)
                player.dm.ec3 = player.dm.ec3.add(1)
                player.dm.ec3Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(hasChallenge("dm",21)) color = color2
                if(tmp.dm.clickables[13].canClick) color = color1
                return color
            }}
        },
        14: {
            title() {
                if(ec4CapReached()) return "Capped"
                if(hasChallenge("dm",22)) return "Buy"
                return "Locked"
            },
            display() {
                if(ec4CapReached()) return ""
                if(hasChallenge("dm",22)) return "Cost: "+format(tmp.dm.ec4Cost)+" EC"
                return ""
            },
            tooltip() {
                if(hasChallenge("dm",22)) return "Bought: "+formatWhole(player.dm.ec4Bought)+"/"+formatWhole(tmp.dm.ec4Cap)
                return ""
            },
            canClick() {
                if(hasChallenge("dm",22)) return player.c.ec.gte(tmp.dm.ec4Cost)&&!ec4CapReached()
                return false
            },
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec4Cost)
                player.dm.ec4 = player.dm.ec4.add(1)
                player.dm.ec4Bought++
            },
            canAfford() {player.c.ec.gte(tmp.dm.ec4Cost)},
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec4Cost)
                player.dm.ec4 = player.dm.ec4.add(1)
                player.dm.ec4Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(hasChallenge("dm",22)) color = color2
                if(tmp.dm.clickables[14].canClick) color = color1
                return color
            }}
        },
    }
}) // Demonic

function effDC4x2() {
    return challengeCompletions("dm",22) < 2
}

addLayer("dc4", {
    name: "Demonic Challenge 4",
    symbol: "DC4",
    row: "side",
    position: 1,
    color: "rgb(168, 26, 69)",
    tooltip: "Challenge Effects",
    startData() { return {
        unlocked: true,
    }},
    layerShown() {return inChallenge("dm",22)},
    tabFormat: [
        ["display-text","An Exhaustive List of Effects for This Challenge", {'font-size':'22px'}],"blank","h-line","blank",
        ["display-text","• Mentality gain is disabled"],"blank",
        ["display-text","• Because of this, Weakling Dust gain is disabled<br>until an upgrade is purchased"],"blank",
        ["display-text","• The requirement for Crystal Shards is significantly increased"],"blank",
        ["display-text","• Unstable Dust gain is square rooted"],"blank",
        ["display-text","• Remove ALL upgrades in Weakling and Crystals layer, in which<br>they're not retrievable in this challenge"],"blank",
        ["display-text","• Remove ALL milestones in Crystals except <b>20 Crystal Shards</b>,<br><b>1e18 Unstable Dust</b>, and <b>1e70 Unstable Dust</b>"],"blank",
        ["display-text","• The requirement for some Crystal milestones are significantly increased,<br>while the others are not retrievable in this challenge"],"blank",
        ["display-text","• Purification Power's Effect is severely lowered,<br>disable the gain of Purified Crystals"],"blank",
        ["display-text","• The description for some of the remaining Crystal milestones are altered"],"blank",
        ["display-text","• Unlocks two new currencies: Demonic Essence and Angelic Essence"],
            ["display-text","▪︎ <b style='color:rgb(168, 26, 69)'>Demonic Essence</b> (DE) is the main currency for purchasing upgrades<br>"],
            ["display-text","▪︎ <b style='color: rgb(252, 244, 132)'>Angelic Essence</b> (AE) has the division effect on DE,<br>which will begin the gain after 1,000,000 DE,<br>the growth of AE is based on DE"],
            ["display-text",function() {
                let text = ""
                if(player.ae.gte(1000)) text = "▪︎ The effect of Angelic Essence will increase even more<br>upon reaching 1,000 of them"
                return text
            }],"blank",
        ["display-text","• Unlocks new Weakling upgrades and buyables based on Demonic Essence"],"blank",
        ["display-text",function() {if(effDC4x2()) return "<i style='color:gray'>• ??? (Unlocks after 1st completion)</i>"; return "• Crystal Shards gain is ^0.3"}],"blank",
        ["display-text",function() {if(effDC4x2()) return ""; return "• The functionality of Crystal Shards has been replaced and altered"}],
        ["display-text",function() {if(effDC4x2()) return ""; return "<i style='color:gray'>(Modder's note: I was gonna just use the prestige button but it would<br>exit the challenge when doing so, therefore I decided to<br>let it stay this way for the rest of the challenge)</i>"}],["blank",function(){if(effDC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effDC4x2()) return ""; return "• The cost of condensing a Crystal is significantly increased"}],["blank",function(){if(effDC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effDC4x2()) return ""; return "• The effects of VC/EC had been altered entirely"}],["blank",function(){if(effDC4x2()) return "0px"; return ""}],
        ["display-text",function() {if(effDC4x2()) return ""; return "• Unlocks new Crystals milestones and upgrades"}],["blank",function(){if(effDC4x2()) return "0px"; return ""}],
        ["display-text","• ..."],"blank",
    ]
}) // DC4 effects
