function vcEffectsList(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Virtuous Crystals.</div>"
	let effectsLocked = [
		"<div style='color: gray;'>◇ Next unlocks at 1 Virtuous Crystal.</div>",
        lockPre+"3"+lockPost,
		lockPre+"5"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"30"+lockPost,
		lockPre+"50"+lockPost,
		lockPre+formatWhole(500)+lockPost,
		lockPre+formatWhole(5000)+lockPost,
		lockPre+formatWhole(1e5)+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToCrystalShards))+" Crystal Shards gained on reset.<br>",
        "<div style='padding: 10px'>◆ Keep all of Weakling upgrades<br>on reset.</div>",
        "<div style='padding: 10px'>◆ Unlock automation for<br><b>Mentality Strengthen</b><br>and <b>Weakling Strengthen</b>.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToMentality))+" Mentality gain.<br></div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToWeakling))+" Weakling Dust gain.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Virtuous Crystal upgrades.</div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorvc,formatWhole(tmp.c.vcToEffectiveVC))+" effective Virtuous Crystals to the VC effects.<div style='color: rgb(167, 167, 167)'>(based on the amount of VC upgrades)</div></div>",
		"<div style='padding: 10px'>◆ The 4th and 5th effects are "+colorText("b",tmp.c.colorvc,formatWhole(tmp.c.vcEff4Eff5Enhance.sub(1).mul(100)))+"% stronger.</div>",
		"<div style='padding: 10px'>◆ A quarter of the total VC also adds into the effective VC count.<div style='color: rgb(167, 167, 167)'>(You have "+colorText("b",tmp.c.colorvc,formatWhole(player.c.totalvc))+" total VC)</div></div>"
	]
	let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

function ecEffectsList(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Evil Crystals.</div>"
	let effectsLocked = [
		"<div style='color: gray;'>◇ Next unlocks at 1 Evil Crystal.</div>",
        lockPre+"5"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"25"+lockPost,
		lockPre+"40"+lockPost,
		lockPre+"50"+lockPost,
		lockPre+formatWhole(500)+lockPost,
		lockPre+formatWhole(5000)+lockPost,
		lockPre+formatWhole(1e5)+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorec,format(new Decimal(tmp.c.ecToUD)))+" Unstable Dust gain.<br>",
        "<div style='padding: 10px'>◆ Unlock new milestones for<br>Unstable Dust.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToWeaklingEffect))+" to the Weakling Dust effect.<br></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" to the cost of condensing Crystals.<br></div>",
		"<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorec,format(tmp.c.ecToVCEffects))+" to the first 5 effects on Virtuous Crystals.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Evil Crystal upgrades.</div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToEffectiveEC))+" effective Evil Crystals to the EC effects.<div style='color: rgb(167, 167, 167)'>(based on the amount of EC upgrades)</div></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,format(tmp.c.ecToCostIncreaseExp))+" to the exponent on the 4th effect.</div>",
		"<div style='padding: 10px'>◆ A quarter of the total EC also adds into the effective EC count.<div style='color: rgb(167, 167, 167)'>(You have "+colorText("b",tmp.c.colorec,formatWhole(player.c.totalec))+" total EC)</div></div>"
	]
	if(hasUpgrade("c",32)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" and ^"+format(tmp.c.crystalCostExp)+" to the cost of condensing Crystals.<br></div>"
	if(hasMilestone("c",77)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" and ^"+colorText("b",tmp.c.colorec,format(tmp.c.crystalCostExp))+" to the cost of condensing Crystals.<br></div>"
	if(player.c.ec.gte(1e4)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" (softcapped) and ^"+colorText("b",tmp.c.colorec,format(tmp.c.crystalCostExp))+" to the cost of condensing Crystals.<br></div>"
	let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

function vcEcMani(vc, ec) { //unused because there's more advanced way to control milestones
    player.c.vc = new Decimal(vc)
    player.c.ec = new Decimal(ec)
	return ""
}

function crystalTypeDecider() {
	if(player.c.vc.add(player.c.ec).eq(0)&&!(hasMilestone("c",45)||hasMilestone("c",75))&&!inChallenge("dm",22)) {
		player.c.vc = player.c.vc.add(1)
		return
	}
    if(player.c.vc.add(player.c.ec).eq(0)&&!(hasMilestone("c",56)||hasMilestone("c",88))&&inChallenge("dm",22)) {
		player.c.ec = player.c.ec.add(1)
		return
	}
	let rng = Math.floor(Math.random()*100)
	let thshold = 50
    if(inChallenge("dm",22)) thshold = 80
	if(hasUpgrade("c",21)) thshold = 101 // always gets ec
	if(hasUpgrade("c",41)) thshold = -1 // always gets vc
	if(rng >= thshold) player.c.vc = player.c.vc.add(tmp.c.vcGain)
	else player.c.ec = player.c.ec.add(tmp.c.ecGain)
	return
}

function vcuCount() {
	player.c.vcu = new Decimal(0)
	for(let id = 11; id <= 24; id++)
		if(hasUpgrade("c",id)) player.c.vcu = player.c.vcu.add(1)
	return
}

function ecuCount() {
	player.c.ecu = new Decimal(0)
	for(let id = 11; id <= 24; id++)
		if(hasUpgrade("c",id)) player.c.ecu = player.c.ecu.add(1)
	return
}

function totalVCCalc() {
	player.c.totalvc = player.c.vc
	if(hasUpgrade("c",11)) player.c.totalvc = player.c.totalvc.add(50)
	if(hasUpgrade("c",12)) player.c.totalvc = player.c.totalvc.add(100)
	if(hasUpgrade("c",13)) player.c.totalvc = player.c.totalvc.add(1000)
	if(hasUpgrade("c",14)) player.c.totalvc = player.c.totalvc.add(1e4)
	if(hasUpgrade("c",21)) player.c.totalvc = player.c.totalvc.add(1e9)
	if(hasUpgrade("c",22)) player.c.totalvc = player.c.totalvc.add(1e35)
	if(hasUpgrade("c",23)) player.c.totalvc = player.c.totalvc.add(1e65)
	if(hasUpgrade("c",24)) player.c.totalvc = player.c.totalvc.add(0)
	if(hasUpgrade("c",53)) player.c.totalvc = player.c.totalvc.add(50000)
	if(player.a.vc1Bought > 0)
		for(let count = 0; count < player.a.vc1Bought; count++) {
			let baseCost = new Decimal(2e15)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(3,count)))
		}
	if(player.a.vc2Bought > 0)
		for(let count = 0; count < player.a.vc2Bought; count++) {
			let baseCost = new Decimal(2.5e25)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(12,count)))
		}
	if(player.a.vc3Bought > 0)
		for(let count = 0; count < player.a.vc3Bought; count++) {
			let baseCost = new Decimal(7.5e50)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(60,count)))
		}
	if(player.a.vc4Bought > 0)
		for(let count = 0; count < player.a.vc4Bought; count++) {
			let baseCost = new Decimal(1e130)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(360,count)))
		}
	return
}

function totalECCalc() {
	player.c.totalec = player.c.ec
	if(hasUpgrade("c",31)) player.c.totalec = player.c.totalec.add(50)
	if(hasUpgrade("c",32)) player.c.totalec = player.c.totalec.add(100)
	if(hasUpgrade("c",33)) player.c.totalec = player.c.totalec.add(1200)
	if(hasUpgrade("c",34)) player.c.totalec = player.c.totalec.add(1e4)
	if(hasUpgrade("c",41)) player.c.totalec = player.c.totalec.add(1e9)
	if(hasUpgrade("c",42)) player.c.totalec = player.c.totalec.add(1e36)
	if(hasUpgrade("c",43)) player.c.totalec = player.c.totalec.add(Decimal.pow(10,100/1.5))
	if(hasUpgrade("c",44)) player.c.totalec = player.c.totalec.add(0)
	if(hasUpgrade("c",53)) player.c.totalec = player.c.totalec.add(50000)
	if(player.dm.ec1Bought > 0)
		for(let count = 0; count < player.dm.ec1Bought; count++) {
			let baseCost = new Decimal(5e15)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(3,count)))
		}
	if(player.dm.ec2Bought > 0)
		for(let count = 0; count < player.dm.ec2Bought; count++) {
			let baseCost = new Decimal(1e26)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(12,count)))
		}
	if(player.dm.ec3Bought > 0)
		for(let count = 0; count < player.dm.ec3Bought; count++) {
			let baseCost = new Decimal(1e52)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(60,count)))
		}
	if(player.dm.ec4Bought > 0)
		for(let count = 0; count < player.dm.ec4Bought; count++) {
			let baseCost = new Decimal(1e130)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(3600,count)))
		}
	return
}

addLayer("c", {
    tabFormat: {
        Milestones: {
            content:[
            ["display-text", function() {
                let mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shard"+(player.c.points.eq(1)?"":"s")+"<br>"
                if(hasUpgrade("c",55)) mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards, which multiplies the base of Weakling Dust by "+layerText("h2","c",formatWhole(tmp.c.effect))+".<br>"
                return mainText
            }], ["blank","8px"],
            ["display-text", function() {
                let subText = ""
                if(inChallenge("dm",22)) subText = "You have made a total of "+layerText("h2","c",formatWhole(player.c.resetCount))+" reset"+(player.c.resetCount.eq(1)?"":"s")+" in this layer.<br><br>"
                return subText
            }],
            ["display-text", function() {
                let gainText = ""
                let csBaseGain = (player.w.points.gte(tmp.c.requires)?player.w.points.div(tmp.c.requires).pow(tmp.c.exponent):new Decimal(0))
                if(hasUpgrade("c",55)||hasUpgrade("c",91)) gainText = "You are gaining "+colorText("b",tmp.c.color,formatWhole(csBaseGain.mul(tmp.c.gainMult).floor().div(2)))+" Crystal Shards per second.<br><br>"
                return gainText
            }],
            "prestige-button",
            "blank",
            ["display-text",
                function() {
                let text = "You have <h2><b>"+format(player.c.ud)+"</b></h2> Unstable Dust, "+
                "which are dividing "+layerText("b","w","Weakling Dust")+" gain by <h3><b>"+format(player.c.ude)+"</b></h3>"+
                ((hasMilestone("c",22)&&player.c.ud.gte(1e6)&&!inChallenge("dm",22))?tmp.c.udEffect2Desc:".")
                if(hasMilestone("c",22)&&inChallenge("dm",22)) text = "You have <h2><b>"+format(player.c.ud)+"</b></h2> Unstable Dust, "+
                "which are multiplying "+layerText("b","w","Weakling Dust")+" gain by <h3><b>"+format(player.c.ude)+"</b>.</h3>"
                return text
            }],
            ["display-text",
                function() {
                let text = "Starting from 1.00e500 Unstable Dust, its effects will drastically increase to ^2!"
                if(player.c.ud.lt("1e500")) text = ""
                return text
            }],
            ["blank","10px"],
            ["display-text", function() {
                let wdBase = (player.w.points.gt(0)?1:0)
                return "You have <b style='color: "+tmp.w.color+"; text-shadow:0px 0px 10px;'>"+format(player.w.points)+"</b> Weakling Dust."+
                " (+"+format(tmp.w.passiveGeneration.mul(tmp.w.gainMult).mul(wdBase))+"/s)"
            }],
            "blank",
            ["microtabs","goals"]
            ],
            style: {'touch-action':'manipulation'}
        },
        Crystals: {
            unlocked() {return hasMilestone("c",9)},
            content: [["infobox","introBox"],
            ["display-text", function() {
                let mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shard"+(player.c.points.eq(1)?"":"s")+"<br><br>"
                if(hasUpgrade("c",55)) mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards, which multiplies the base of Weakling Dust by "+layerText("h2","c",formatWhole(tmp.c.effect))+".<br>"
                if(inChallenge("dm",22)) mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shard"+(player.c.points.eq(1)?"":"s")+"<br>"
                return mainText
            }], ["blank","8px"],
            ["display-text", function() {
                let subText = ""
                if(hasMilestone("c",8)) subText = "You have had the deal with The Demon "+layerText("h2","c",formatWhole(player.c.dealCount))+" time"+(player.c.dealCount.eq(1)?"":"s")+".<br><br>"
                return subText
            }],
            ["display-text", function() {
                let gainText = ""
                let csBaseGain = (player.w.points.gte(tmp.c.requires)?player.w.points.div(tmp.c.requires).pow(tmp.c.exponent):new Decimal(0))
                if(hasUpgrade("c",55)||hasUpgrade("c",91)) gainText = "You are gaining "+colorText("b",tmp.c.color,formatWhole(csBaseGain.mul(tmp.c.gainMult).floor().div(2)))+" Crystal Shards per second.<br><br>"
                return gainText
            }],
            ["clickables",[1]],
            "blank", "blank",
            ["row", [
                ["column", [
                    "blank",
                    ["display-text", function() {
                        let currencyDisplay = colorText("h2",tmp.c.colorvc,formatWhole(player.c.vc))
                        let addText = "" // additional text
                        if(hasUpgrade("c",11)) addText = "<br>(Multiplier: ×"+formatWhole(upgradeEffect("c",11))+")"
                        if(hasUpgrade("c",21)) addText = "<br>You are gaining "+colorText("b",tmp.c.colorvc,formatWhole(upgradeEffect("c",21)))+" VC per second."
                        return "You have "+currencyDisplay+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+"."+
                        "<br>They have the following effects:"+addText
                    }],
                    "blank",
                    ["h-line","300px"],
                    "blank",
                    ["display-text", function() {                   
                        let stat = vcEffectsList()
                        if(!inChallenge("dm",22)) {
                            if(hasMilestone("c",40)) {stat = vcEffectsList(new Decimal(0),new Decimal(1))}
                            if(hasMilestone("c",41)) {stat = vcEffectsList(new Decimal(0),new Decimal(2))}
                            if(hasMilestone("c",42)) {stat = vcEffectsList(new Decimal(0),new Decimal(2),true)}
                        }
                        if(inChallenge("dm",22)) stat = ""
                        return stat
                    }],
                    ["row",[
                        ["display-text", function() {
                            let stat = ""
                            if(!inChallenge("dm",22)) {
                                if(hasMilestone("c",42)) stat = vcEffectsList(new Decimal(2),new Decimal(3),true)
                            }
                            if(inChallenge("dm",22)) {
                                if(hasMilestone("c",50)) stat = vcEffectsListDC22(new Decimal(0),new Decimal(1),true)
                            }
                            return stat
                        }, function() {if(inChallenge("dm",22)) return {'display':'block', 'width': '200px'}; return {}}],
                        ["blank",function() {
                            if(inChallenge("dm",22)) return ["12px", "17px"]
                            return []
                        }],
                        ["clickable",21]
                    ]],
                    ["display-text", function() {
                        let stat = ""
                        if(!inChallenge("dm",22)) {
                            let start = 42, end = 47, offset = 3
                            for(let id = start; id <= end; id++)
                                if(hasMilestone("c",id)) stat = vcEffectsList(new Decimal(offset),new Decimal(id-start+offset))
                            if(hasMilestone("c",48)) stat = vcEffectsList(new Decimal(3),new Decimal(9),true)
                        }
                        if(inChallenge("dm",22)) {
                            let start = 50, end = 58, offset = 1
                            for(let id = start; id <= end; id++)
                                if(hasMilestone("c",id)) stat = vcEffectsListDC22(new Decimal(offset),new Decimal(id-start+offset))
                            if(hasMilestone("c",59)) stat = vcEffectsListDC22(new Decimal(1),new Decimal(10),true)
                        }
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px',
                    'background-color': 'rgba(18, 187, 40, 0.25)',
                }],
                ["column", [
                    "blank",
                    ["display-text", function() {
                    let currencyDisplay = colorText("h2",tmp.c.colorec,formatWhole(player.c.ec))
                    let addText = "" // additional text
                    if(hasUpgrade("c",31)) addText = "<br>(Multiplier: ×"+formatWhole(upgradeEffect("c",31))+")"
                    if(hasUpgrade("c",71)) addText = "<br>(Multiplier: ×"+formatWhole(tmp.c.ecGain.floor())+")"
                    if(hasUpgrade("c",41)||hasMilestone("c",89)) addText = "<br>You are gaining "+colorText("b",tmp.c.colorec,formatWhole(upgradeEffect("c",41)))+" EC per second."
                    return "You have "+currencyDisplay+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+"."+
                    "<br>They have the following effects:"+addText
                    }],
                    "blank",
                    ["h-line","300px"],
                    "blank",
                    ["display-text", function() {
                        let stat = ecEffectsList()
                        if(!inChallenge("dm",22)) {
                            let start = 70, end = 77, offset = 0
                            for(let id = start; id <= end; id++)
                                if(hasMilestone("c",id)) stat = ecEffectsList(new Decimal(offset),new Decimal(id-(start-1)+offset))
                            if(hasMilestone("c",78)) stat = ecEffectsList(new Decimal(0),new Decimal(9),true)
                        }
                        if(inChallenge("dm",22)) {
                            stat = ecEffectsListDC22()
                            let start = 80, end = 88, offset = 0
                            for(let id = start; id <= end; id++)
                                if(hasMilestone("c",id)) stat = ecEffectsListDC22(new Decimal(offset),new Decimal(id-(start-1)+offset))
                            if(hasMilestone("c",89)) stat = ecEffectsListDC22(new Decimal(0),new Decimal(10),true)
                        }
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px', 
                    'background-color': 'rgba(217, 55, 250, 0.2)'
                }]
            ]], ["blank","30px"]
        ]},
        Upgrades: {
            unlocked() {return hasMilestone("c",45)||hasMilestone("c",75)||inChallenge("dm",22)||inChallenge("a",22)},
            content: [
                ["display-text", function() {
                    return "You have condensed "+colorText("h3",tmp.c.color,formatWhole(player.c.total))+" Crystal Shards in total.<br><br>"+
                    "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+"."
                }], "blank",
                ["row",[
                    ["display-text", "↑", {'font-size':'100px','color': 'rgb(18, 187, 41)','text-shadow':'0px 0px 10px'}],
                    ["blank",["40px","10px"]],
                    ["v-line","250px"],
                    ["blank",["40px","10px"]],
                    ["display-text", function() {
                        if(inChallenge("dm",22)) return colorText("h1","rgba(211, 13, 13, 0.8)","You have been disconnected<br>from the virtue...")
                        if(inChallenge("a",22)) return colorText("h1","rgba(220, 228, 153, 0.8)","Complete more trials...")
                        if(!hasMilestone("c",45)) return colorText("h1","rgba(18, 187, 40, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[1,2]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(18, 187, 40, 0.25)'}],
                "blank",
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorec,formatWhole(player.c.ec))+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+"."
                }],"blank",
                ["row",[
                    ["display-text", "↓", {'font-size':'100px', 'color': 'rgb(217, 55, 250)','text-shadow':'0px 0px 10px'}],
                    ["blank",["40px","10px"]],
                    ["v-line","250px"],
                    ["blank",["40px","10px"]],
                    ["display-text", function() {
                        if(inChallenge("dm",22)&&!tmp.c.upgrades[71].unlocked) return colorText("h1","rgba(104, 101, 101, 0.8)","Upgrades are gone<br>without a trace...")
                        if(inChallenge("a",22)) return colorText("h1","rgba(220, 228, 153, 0.5)","The Evil is banished...")
                        if(!hasMilestone("c",75)&&!inChallenge("dm",22)) return colorText("h1","rgba(217, 55, 250, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[3,4,7,8]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(217, 55, 250, 0.2)'}],
                "blank",
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.color,formatWhole(player.c.points))+" Crystal Shard"+(player.c.points.eq(1)?"":"s")+"."
                }], "blank",
                ["row",[
                    ["display-text", function() {
                        if(inChallenge("dm",22)&&!tmp.c.upgrades[91].unlocked) return colorText("h1","rgba(104, 101, 101, 0.8)","Search around and<br>look for the clue...")
                        if(inChallenge("a",22)) return colorText("h1","rgba(220, 228, 153, 0.8)","And come back here...")
                        if(!tmp.c.upgrades[51].unlocked&&!tmp.c.upgrades[61].unlocked&&!inChallenge("dm",22)) return colorText("h1","rgba(209, 31, 31, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[5,6,9,10]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(209, 31, 31, 0.2)'}],
                "blank"
            ]
        },
        "The Demon": {
            unlocked() {return hasMilestone("c",7)&&inChallenge("dm",22)},
            content: [["infobox","credits"],["infobox","demonLore0"],["infobox","demonLore1"]],
            buttonStyle: {'background':'rgba(206, 5, 5, 0.75)'}
        }
    },
    microtabs: {
        goals: {
            "Crystal Shards": {
                unlocked: true,
                content: [["milestones", [0,1,2,3,4,5,6,7,8,9]]]
            },
            "Unstable Dust": {
                unlocked: true,
                content: [["milestones", [20,21,22,23,24,25,26,27]]]
            }
        }
    },
    name: "Crystals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["w"],
    infoboxes: {
        introBox: {
            title() {
                let title = ""
                if(inChallenge("dm",22)){
                    title = "Nope"
                    if(hasMilestone("c",7)) title = "A Stable Void"
                    if(hasMilestone("c",8)) title = "Crystals Revamped"
                }
                return title
            },
            body() {
                let desc = `Welcome to the major mechanic of this layer! 
                In here, you can finally start to make Crystals using the Crystal Shards you have! 
                To obtain one of them, you'd need 20 Crystal Shards to do so!<br><br>
                During this process you may obtain `+colorText("b",tmp.c.colorvc,"Virtuous Crystals")+
                " or <br>"+colorText("b",tmp.c.colorec,"Evil Crystals")+`, in which they will aid (or harm) 
                your progress in various ways!<br><br>
                Combining a Crystal, regardless of the type, will perform a reset of this layer! You will also gain a `+
                colorText("b",tmp.c.colorvc,"Virtuous Crystal")+` for your first combination.<br><br>
                <div style='color: rgb(167, 167, 167)'>(Abbriviations - VC: Virtuous Crystals, EC: Evil Crystals)</div>`
                if(inChallenge("a",22)) {
                    desc = `<i>The moment you stepped into here, you were immediately faced<br>
                        with a barrier that are made from the forcefield...<br><br>
                        It was so powerful and absolute that you got pushed back
                        for quite some yards after just touching it just a little...
                        Maybe it isn't a good idea to investigate yet...</i>`
                }
                if(inChallenge("dm",22)) {
                    desc = `<i>The second you step into here, you immediately feel<br>
                        a strong presence of spacetime turbulence...<br><br>
                        It feels as if you'll be torn apart
                        and consumed by it<br>anytime soon...
                        Maybe it isn't a good idea to investigate yet...</i>`
                    if(hasMilestone("c",7))
                        desc = `The space had stabilized but nothing is here. "What could that presence be and why does it need my Crystal Shards?"
                        You had this question<br>in mind.<br><br>
                        But now, knowing that it's useless to think of these question that leads to nowhere,
                        you decided not to think too much and keep working on what you're familiar with, and to get more
                        <b style='color:rgb(209, 31, 31)'>Crystal Shards</b> along the way.`
                    if(hasMilestone("c",8))
                        desc = `Because you had the deal with The Demon, the cost of getting a Crystal had bumped up to 
                        <u>100 Crystal Shards</u>, and will steaily increase by 4% every trade!<br><br>
                        VC/EC also play the entirely different role here, with EC helping your progress and VC do the opposite instead.
                        But nevertheless, you need their help in order to pro- <i style='color:gray'>escape here</i>!
                        <br><br>
                        <div style='color:rgb(230, 109, 204)'>
                        (The chance of getting a VC/EC is now altered to 20%/80%. Also, you're guaranteed to get EC on your first deal!)</div>`
                }
                return desc
            }
        },
        credits: {
            title: "Credits",
            body: "Special thanks to <b style='color:rgb(166, 205, 207)'>Uchigatana</b> for polishing some of the wordings for the lore!"
        },
        demonLore0: {
            title: "A Stablizing Space",
            body() {
                let loreText = `As you gather more and more <b style='color:rgb(209, 31, 31)'>Crystal Shards</b>, 
                you realized that the spacetime here is stablizing,
                in fact it happened so quickly that you feel like what had happened was just a bad dream.<br><br>
                Suddenly, you felt an intense amount of pressure surrounding you, the aura was so strong that
                it generated a lot of downforce, forcing you to kneel down at this unknown presence.
                Even so, out of some reason, you decided to not give in and keep the stance.<br><br>
                Finally, after a while, that pressure had softened by a lot, a voice immediately followed:<br>
                <div style='color:rgb(236, 19, 19)'>Interesting, very interesting...
                The way you did not bow down to very my presence... It's been centuries since anyone dared to attempt that~<br>
                I see the power within you, your potential, and those Crystal Shards~ You know I like those shiny things right?
                so bring me more of those shards and I'll see you here again~</div><br>
                The pressure then quickly disappear followed by that alluring voice, and the space you're in is now nothing but an empty void.`,
                unlockText = "<br><br><div style='color:gray'>Next piece of story unlocks at 100 Crystal Shards.</div>"
                if(hasMilestone("c",8)) unlockText = ""
                return loreText+unlockText
            }
        },
        demonLore1: {
            title: "The Deal from The Demon",
            body() {let loreText = `<div style='color:rgb(236, 19, 19)'>
            Trials after trials, toutures after tortures, you finally made it here.<br>
            Greetings, I'm the almighty existence in this challenge,<br>the one they call "The Demon".<br><br>
            How do you like my creation so far? Did you enjoy your time here?
            Why not let us sit down and have a nice cup of tea?
            No? I can see you're not pleased with your current situation... Don't make such a long face!<br><br>
            What? You said you wanna complete the challenge? Don't you know who you're talking to?
            And the expression you are making, it kinda pisses me off!<br><br>
            <i style='color:gray'>The Demon takes a few deep breaths</i><br>Ok, ok, maybe I got too carried away.
            How about it, let's have a deal, a deal you'd definitely like, a deal that's captivating,
            one that you will never find again in your life!
            You wanna hear it? That's what I'm talking about! I promise it won't disappoint you!<br><br>
            So, here's the deal: Since the "machine" (what you called the "button") of condesing Crystals no longer works,
            how about you trade those shiny <b>Crystal Shards</b> with me and I'll give you the Crystals you need?<br><br>
            Now that's the face I'd like to see! So bright and shiny just like those shards on your hand!
            You shall treasure those shards no more and give them <b>ALL</b> to me...<br><br>
            Hehehe, I can tell that you're starting to regret it, but refusing is no use since I've planted a seed in you ;)
            You have so much potential as one of us~ Now, the time has come for you to
            <b style='color:rgb(160, 17, 17)'>WORK FOR ME ETERNALLY</b><br><br>
            Oh, and one last thing to tell you... the cost of the deal also increases every time you have a trade with me, isn't that nice? ;)</div>`,
            unlockText = "<br><div style='color:gray'>Next piece of story unlocks at 100 Evil Crystals.</div>"
            if(hasMilestone("c",88)) unlockText = ""
            return loreText+unlockText
            },
            unlocked() {return hasMilestone("c",8)}
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        resetCount: new Decimal(0),
        dealCount: new Decimal(0), // The deal you had done with The Demon (DC22 exclusive)
        ud: new Decimal(0), // Unstable Dust (UD)
        ude: new Decimal(0), // UD Effect
        autoStrengthen: false,
        vc: new Decimal(0), // Virtuous Crystals
        ec: new Decimal(0), // Evil Crystals
        vcu: new Decimal(0), // VC Upgrades
        ecu: new Decimal(0), // EC Upgrades
        totalvc: new Decimal(0),
        totalec: new Decimal(0)
    }},
    color: "rgb(209, 31, 31)",
    colorvc: "rgb(18, 187, 41)", // color for Virtuous Crystals
    colorec: "rgb(217, 55, 250)", // color for Evil Crystals
    requires() {
        let req = new Decimal(2e10)
        if(inChallenge("dm",22)){
            req = Decimal.pow(8,52.5)
            if(hasMilestone("c",21)) req = req.div(tmp.c.udNerfCSReq).max(2e10)
            if(hasMilestone("c",23)) req = req.div(tmp.c.resetsToDEReq).max(2e10)
        }
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "Crystal Shards", // Name of prestige currency
    resourceSingular: "Crystal Shard",
    baseResource: "Weakling Dust", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        if(inChallenge("dm",22)) return 0.021
        if(inChallenge("a",12)||inChallenge("dm",12)) return 0.035
        return 0.07
    }, // Prestige currency exponent

    effect() {
        let eff = player.c.points.div(1e11).max(1).pow(0.25).div(1.6).max(1)
        if(hasUpgrade("c",61)) eff = eff.pow(upgradeEffect("c",61))
        return eff.floor()
    },

    passiveGeneration() {
        let gain = new Decimal(0)
        if(hasUpgrade("c",55)||hasUpgrade("c",91)) gain = new Decimal(0.5)
        if(inChallenge("a",21)&&player.a.inCh3Time < 0.5) gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasMilestone("c",40)) mult = mult.mul(tmp.c.vcToCrystalShards)
        if(hasUpgrade("c",13)) mult = mult.mul(upgradeEffect("c",13))
        if(hasUpgrade("c",62)) mult = mult.mul(tmp.c.weaklingToCS)
        if(inChallenge("a",12)||inChallenge("dm",12)) mult = mult.pow(0.5)
        if(inChallenge("dm",22)) {
            if(hasMilestone("c",82)) mult = mult.mul(tmp.c.ecToCS)
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    csToWeakling() {
        let mult = Decimal.pow(10,player.c.points.max(1).log10().div(5.8))
        return mult
    },

    weaklingToCS() {
        let mult = Decimal.pow(10,player.w.points.max(1).log10().mul(1.8).div(100))
        return mult
    },

    mwConvert() {
        let mult = getBuyableAmount("w",11).add(1).pow(1.2)
        return mult
    },

    wmConvert() {
        let mult = Decimal.log10(player.w.points.add(1)).add(1)
        return mult
    },

    resetsToWSCount() {
        let count = player.c.resetCount.min(tmp.c.resetsToWSCountCap)
        return count
    },

    resetsToWSCountCap() {
        let cap = new Decimal(30)
        if(hasUpgrade("c",92)) cap = cap.add(10)
        return cap
    },

    resetsToDE() {
        let mult = player.c.resetCount.pow(0.5).max(1)
        return mult
    },

    resetsToDEReq() {
        let mult = player.c.resetCount.pow(0.4).max(1)
        if(hasMilestone("c",6)) mult = mult.pow(2.4)
        if(hasMilestone("c",23)) mult = mult.pow(3)
        return mult
    },

    // UD Session ########################################################################################
    udBase() {
        let base = new Decimal(0)
        if(player.w.points.gte(2e10)&&!inChallenge("a",21)) base = player.w.points.div(2e10).sub(1)
        if(inChallenge("dm",22)) base = base.pow(0.5)
        return base
    },

    udBaseEffect() {
        let effectiveUD = player.c.ud
        let sftcap = new Decimal("1e475")
        if(hasMilestone("c",27)) effectiveUD = effectiveUD.div(sftcap).pow(2).mul(sftcap)
        let eff = effectiveUD.add(1).pow(0.5)
        if(hasMilestone("c",23)) eff = eff.pow(1.2)
        if(hasUpgrade("c",51)) eff = eff.pow(0.9)
        if(hasUpgrade("w",32)) eff = eff.div(upgradeEffect("w",32)).max(1)
        if(hasChallenge("dm",11)) eff = eff.pow(challengeEffect("dm",11))
        return eff
    },

    udEffect1() {
        let eff = tmp.c.udBaseEffect
        if(hasMilestone("c",22)&&inChallenge("dm",22)) eff = eff.pow(0.5)
        return eff
    },

    udEffect2() {
        let eff = tmp.c.udBaseEffect.pow(0.4)
        return eff
    },

    udEffect2Desc() {
        return " and <b>Mentality</b> gain by <h3><b>"+format(tmp.c.udEffect2)+"</b></h3>."
    },

    udGainMult() {
        let mult = new Decimal(1)
        if(hasMilestone("c",70)) mult = mult.mul(tmp.c.ecToUD)
        if(hasMilestone("c",24)) mult = mult.mul(tmp.c.crystalsToUD)
        if(hasUpgrade("c",52)) mult = mult.mul(upgradeEffect("c",52))
        return mult
    },

    udNerfWeaklingEffect() {
        let mult = player.c.ud.max(0).pow(0.2).mul(3.3).add(1)
        if(inChallenge("dm",11)) mult = new Decimal(1)
        return mult
    },

    udNerfWSCost() {
        let mult = player.c.ud.max(0).pow(0.1).add(1)
        if(hasUpgrade("w",75)) mult = mult.pow(upgradeEffect("w",75))
        return mult
    },

    udNerfCSReq() {
        let mult = player.c.ud.max(0).pow(0.25).add(1)
        return mult
    },

    udNerfCrystalCost() {
        let mult = player.c.ud.max(1).log10().div(10).max(1).pow(10/6)
        if(hasUpgrade("c",93)) mult = mult.pow(upgradeEffect("c",93))
        return mult
    },

    // Crystal | Crystal Shards Session ########################################################################################
    crystalsToWeakling() { // Crystal Shards
        let mult = player.c.points.max(1).log10().mul(6.4).max(1.5)
        return mult
    },

    crystalsToMentality() {
        let mult = player.c.points.max(1).log10().mul(3.1).max(1.2)
        return mult
    },

    crystalsToDE() {
        let mult = player.c.points.max(1).log10().mul(3.1).max(1.5)
        return mult
    },

    crystalsToWeaklingDC22() {
        let mult = player.c.points.max(1).mul(100).pow(0.48).mul(1000).max(1000)
        return mult
    },

    crystalsToUD() {
        let mult = new Decimal(1)
        let vc = player.c.vc
        let ec = player.c.ec
        if(hasMilestone("c",24)) mult = mult.mul(vc.add(ec)).pow(0.4).mul(2)
        return mult
    },

    crystalBaseCost() {
        let base = new Decimal(20), rand = Math.random()*900+100
        if(inChallenge("dm",22)) {
            base = new Decimal(rand)
            if(hasMilestone("c",7)) base = new Decimal(100)
            if(hasMilestone("c",55)) base = base.add(tmp.c.vcToCostIncrease)
        }
        if(hasMilestone("c",73)) base = base.add(tmp.c.ecToCostIncrease)
        return base
    },

    crystalCost() {
        let cost = tmp.c.crystalBaseCost
        if(player.c.dealCount.gte(1)) cost = cost.mul(Decimal.pow(1.04,player.c.dealCount))
        if(hasMilestone("c",24)&&inChallenge("dm",22)) cost = cost.div(tmp.c.udNerfCrystalCost)
        if(hasUpgrade("c",32)||hasMilestone("c",77)) cost = cost.pow(tmp.c.crystalCostExp)
        return cost.floor()
    },

    crystalCostExp() {
        let exp = new Decimal(1.2)
        if(hasMilestone("c",77)) exp = exp.add(tmp.c.ecToCostIncreaseExp)
        return exp
    },

    crystalsQuantity() {
        let amount = tmp.c.crystalBaseCost.div(20).pow(0.5)
        if(hasUpgrade("c",53)) amount = amount.mul(upgradeEffect("w",25))
        return amount.floor()
    },

    // EC Session ########################################################################################
    ecGain() {
        let gain = new Decimal(1)
        if(hasMilestone("c",58)) gain = gain.div(tmp.c.vcToEC)
        if(hasUpgrade("c",31)) gain = gain.mul(upgradeEffect("c",31))
        if(hasUpgrade("c",32)) gain = gain.mul(tmp.c.crystalsQuantity)
        if(hasUpgrade("c",71)) gain = gain.mul(upgradeEffect("c",71))
        return gain
    },

    ecGainAC22() {
        let gain = new Decimal(0)
        return gain
    },

    ecGainDC22() {
        let gain = new Decimal(0)
        return gain
    },

    ecToUD() { // Effect 1
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.mul(2).add(1).pow(0.5)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToWeaklingEffect() { // Effect 3
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.sub(1).max(0).pow(0.9).div(0.6666).add(1.404)
        if(inChallenge("a",11)) mult = new Decimal(1)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToCostIncrease() { // Effect 4
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addCost = effectiveEC.sub(24).max(0)
        let sftcap = 10000
        if(effectiveEC.gte(sftcap)) addCost = addCost.div(sftcap).pow(2/3).mul(sftcap)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return addCost
    },

    ecToVCEffects() { // Effect 5
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.sub(40).max(0).pow(0.25).add(1.2).pow(0.2)
        if(hasUpgrade("c",33)) mult = mult.pow(upgradeEffect("c",33))
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToEffectiveEC() { // Effect 7
        ecuCount()
        //hasMilestone("c",78)
        if (true) totalECCalc()
        let effectiveECInc = new Decimal(10)
        let ten = new Decimal(10)
        if(player.c.ecu.gte(3)) effectiveECInc = effectiveECInc.mul(ten.pow(player.c.ecu.sub(2).mul(1.096)))
        if (hasMilestone("c",78)) effectiveECInc = effectiveECInc.add(player.c.totalec.div(4))
        if(inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)||inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)) effectiveECInc = new Decimal(0)
        return effectiveECInc.floor()
    },

    ecToCostIncreaseExp() { // Effect 8 added to 3
        let effectiveEC = player.c.ec
        if(hasMilestone("c",77)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addExp = effectiveEC.div(5000).max(1).log10().div(20).add(0.05)
        if(inChallenge("a",12)) addExp = new Decimal(0)
        return addExp
    },

    // VC Session ########################################################################################
    vcGain() {
        let gain = new Decimal(1)
        if(hasUpgrade("c",11)) gain = gain.mul(upgradeEffect("c",11))
        if(hasUpgrade("c",32)) gain = gain.mul(tmp.c.crystalsQuantity)
        return gain
    },

    vcGainAC22() {
        let gain = new Decimal(0)
        return gain
    },

    vcGainDC22() {
        let gain = new Decimal(0)
        return gain
    },

    vcToCrystalShards() { // Effect 1
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.add(1).pow(0.5).max(1)
        if(hasUpgrade("c",12)) mult = mult.pow(2)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToMentality() { // Effect 4
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.sub(1).max(0).pow(1.2).div(3).add(1).max(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(hasMilestone("c",47)) mult = mult.mul(tmp.c.vcEff4Eff5Enhance)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToWeakling() { // Effect 5
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.sub(10).max(0).pow(1.5).div(7.5).add(1).max(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(hasMilestone("c",47)) mult = mult.mul(tmp.c.vcEff4Eff5Enhance)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToEffectiveVC() { // Effect 7
        vcuCount()
        //hasMilestone("c",48)
        if (true) totalVCCalc()
        let effectiveVCInc = new Decimal(10)
        let ten = new Decimal(10)
        if(player.c.vcu.gte(3)) effectiveVCInc = effectiveVCInc.mul(ten.pow(player.c.vcu.sub(2).mul(1.096)))
        if(hasMilestone("c",48)) effectiveVCInc = effectiveVCInc.add(player.c.totalvc.div(4))
        if(inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)||inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)) effectiveVCInc = new Decimal(0)
        return effectiveVCInc.floor()
    },

    vcEff4Eff5Enhance() { // Effect 8
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.pow(0.15).max(1)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    // VC Session (DC22) ########################################################################################
    vcToAEBase() { // Effect 4 in DC22
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.mul(1.25).pow(0.85).max(1)
        return mult
    },

    vcToECEffects() { // Effect 5 in DC22
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.div(10).max(1).pow(0.25).mul(1.25)
        return mult
    },

    vcToCostIncrease() { // Effect 6 in DC22
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.sub(14).mul(3).max(0)
        return mult
    },

    vcToAEEffect() { // Effect 8 in DC22
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.pow(0.6).div(1.8).max(1)
        return mult
    },

    vcToEC() { // Effect 9 in DC22
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.pow(0.3).mul(1.1).max(1)
        return mult
    },

    // EC Session (DC22) ########################################################################################
    bulkBuyCount() { // Effect 1 in DC22
        let bulk = 5
        if(hasMilestone("c",85)) bulk = bulk+parseInt(tmp.c.ecToBulkCount)
        return bulk
    },

    ecToCS() { // Effect 3 in DC22
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.add(1).pow(1/3).max(1)
        if(hasMilestone("c",54)) mult = mult.div(tmp.c.vcToECEffects).max(1)
        if(hasUpgrade("c",72)) mult = mult.pow(upgradeEffect("c",72))
        return mult
    },

    ecToDE() { // Effect 4 in DC22
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.add(1).pow(1.25).mul(1.8).max(1)
        if(hasMilestone("c",54)) mult = mult.div(tmp.c.vcToECEffects).max(1)
        if(hasUpgrade("c",72)) mult = mult.pow(upgradeEffect("c",72))
        return mult
    },

    ecToWeakling() { // Effect 5 in DC22
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.mul(1.25).pow(1.75).mul(25).max(1)
        if(hasMilestone("c",54)) mult = mult.div(tmp.c.vcToECEffects).max(1)
        if(hasUpgrade("c",72)) mult = mult.pow(upgradeEffect("c",72))
        return mult
    },

    ecToBulkCount() { // Effect 6 in DC22
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addedBulk = effectiveEC.sub(18).max(0).div(2).floor().min(20)
        return addedBulk
    },

    ecToWSBaseMult() { // Effect 8 in DC22
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addedMult = effectiveEC.sub(55).div(5).floor().max(0).mul(0.02).min(1.52)
        return addedMult
    },

    // ############################################################################################################

    update(diff) {
        player.c.ude = tmp.c.udEffect1
        player.c.ud = tmp.c.udBase.mul(tmp.c.udGainMult)
        if(hasUpgrade("c",21)&&!inChallenge("a",12)&&!inChallenge("a",21)&&!inChallenge("dm",21)&&!inChallenge("a",22)&&!inChallenge("dm",22)) player.c.vc = player.c.vc.add(upgradeEffect("c",21).mul(diff))
        if(hasUpgrade("c",41)&&!inChallenge("dm",12)&&!inChallenge("a",21)&&!inChallenge("dm",21)&&!inChallenge("a",22)&&!inChallenge("dm",22)) player.c.ec = player.c.ec.add(upgradeEffect("c",41).mul(diff))
        if(inChallenge("a",12)&&player.a.inChTime > 0.5) player.c.vc = player.c.vc.add(upgradeEffect("c",21).mul(diff))
        if(inChallenge("dm",12)&&player.dm.inChTime > 0.5) player.c.ec = player.c.ec.add(upgradeEffect("c",41).mul(diff))
        if((inChallenge("a",21)||inChallenge("a",22)||inChallenge("dm",21)||inChallenge("dm",22))&&(player.a.inChTime > 0.5||player.dm.inChTime > 0.5)) {
            if(hasUpgrade("c",21)) player.c.vc = player.c.vc.add(upgradeEffect("c",21).mul(diff))
            if(hasUpgrade("c",41)||hasMilestone("c",89)) player.c.ec = player.c.ec.add(upgradeEffect("c",41).mul(diff))
        }
        if(hasUpgrade("c",91)) player.c.resetCount = player.c.resetCount.add(upgradeEffect("c",91).mul(diff))
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Condense into Crystal Shards", 
        onPress(){
            if (canReset(this.layer)) doReset(this.layer)
        }},
    ],
    layerShown(){return hasUpgrade("w", 25)||hasMilestone("c",0)||hasMilestone("c",9)},

    doReset(resettingLayer) {
        player.c.ud = new Decimal(0)
    },

    resetsNothing() {return hasUpgrade("c",54)},

    canReset() {
        if(inChallenge("dm",22)||inChallenge("a",22)) return false
        return (!hasUpgrade("c",55)&&player.w.points.gte(2e10))
    },
    
    milestones: {
        0: {
            requirementDescription: "1 Crystal Shard",
            effectDescription() {
                if(inChallenge("dm",22)) return "Demonic Essence gain ×5."
                return "Triples Weakling Dust gain."
            },
            done() {return player.c.points.gte(1)},
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",0)
            }
        },
        1: {
            requirementDescription: "2 Crystal Shards",
            effectDescription() {
                let descText = "Quadruples Mentality gain."
                if(inChallenge("dm",22)) descText = "Buying <b>Weakling Strengthen</b> no longer cost Weakling Dust."
                return descText
            },
            done() {return player.c.points.gte(2)},
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",0)
            }
        },
        2: {
            requirementDescription: "3 Crystal Shards",
            effectDescription() {
                let descText = "<b>Mentality Strengthen</b> boosts Weakling Dust gain.<br>"
                let effText = "Currently: ×"+format(tmp.c.mwConvert)+"."
                if(inChallenge("dm",22)) {
                    descText = "Gain a free purchase of <b>Weakling Strengthen</b> for every<br>Crystal Shards reset, up to "+formatWhole(tmp.c.resetsToWSCountCap)+" of them.<br>"
                    effText = "Currently: +"+formatWhole(tmp.c.resetsToWSCount)+"."
                }
                return descText+effText
            },
            done() {return player.c.points.gte(3)},
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",1)
            }
        },
        3: {
            requirementDescription: "4 Crystal Shards",
            effectDescription() {
                let descText = "Triples Mentality gain."
                let effText = ""
                if(inChallenge("dm",22)) {
                    descText = "Boosts Demonic Essence gain based on Crystal Shards resets.<br>"
                    effText = "Currently: ×"+format(tmp.c.resetsToDE)+"."
                }
                return descText+effText
            },
            done() {return player.c.points.gte(4)},
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",2)
            }
        },
        4: {
            requirementDescription: "5 Crystal Shards",
            effectDescription() {
                let desc = "Boosts Mentality and Weakling Dusts based on Crystal Shards.<br>"
                let effText = "Currently: ×"+format(tmp.c.crystalsToMentality)+" to Mentality, ×"+format(tmp.c.crystalsToWeakling)+" to Weakling Dust."
                if(inChallenge("dm",22)) {
                    desc = "Boosts Demonic Essence and Weakling Dusts based on Crystal Shards.<br>"
                    effText = "Currently: ×"+format(tmp.c.crystalsToDE)+" to Demonic Essence, ×"+format(tmp.c.crystalsToWeaklingDC22)+" to Weakling Dust."
                }
                return desc+effText
            },
            done() {return player.c.points.gte(5)},
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",3)
            }
        },
        5: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "20 Crystal Shards resets"
                return "7 Crystal Shards"
            },
            effectDescription() {
                let desc = "Triples Weakling Dust gain, again."
                let effText = ""
                if(inChallenge("dm",22)) {
                    desc = "Divides the requirement of Demonic Essence to perform a reset<br>based on Crystal Shards resets.<br>"
                    effText = "Currently: /"+format(tmp.c.resetsToDEReq)+"."
                    if(hasMilestone("c",23)) {
                        desc = "Divides the requirement of Weakling Dust to perform a reset<br>based on Crystal Shards resets.<br>"
                        effText = "Currently: /"+format(tmp.c.resetsToDEReq)+"."
                    }
                }
                return desc+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.resetCount.gte(20)
                return player.c.points.gte(7)
            },
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",4)
            }
        },
        6: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "25 Crystal Shards resets"
                return "10 Crystal Shards"
            },
            effectDescription() {
                let desc = "Boosts Mentality based on Weakling Dusts.<br>"
                let effText = "Currently: ×"+format(tmp.c.wmConvert)+"."
                if(inChallenge("dm",22)) {
                    desc = "Strengthens the effect of the previous milestone."
                    effText = ""
                }
                return desc+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.resetCount.gte(25)
                return player.c.points.gte(10)
            },
            unlocked() {
                if(!inChallenge("dm",22)) return true
                return hasMilestone("c",5)
            }
        },
        7: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "30 Crystal Shards resets"
                return ""
            },
            effectDescription() {
                let desc = ""
                let effText = ""
                if(inChallenge("dm",22)) {
                    desc = "Performing a Crystal Shards reset no longer requires Demonic Essence.<br>Unlocks <b style='color:rgba(211, 13, 13, 0.8)'>The Demon</b> subtab."
                    effText = ""
                }
                return desc+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.resetCount.gte(30)
                return false
            },
            unlocked() {
                if(!inChallenge("dm",22)) return false
                return hasMilestone("c",6)
            }
        },
        8: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "100 Crystal Shards"
                return ""
            },
            effectDescription() {
                let desc = ""
                let effText = ""
                if(inChallenge("dm",22)) {
                    desc = "Unlocks a new story in <b style='color:rgba(211, 13, 13, 0.8)'>The Demon</b> subtab."
                    effText = ""
                }
                return desc+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.points.gte(100)
                return false
            },
            unlocked() {
                if(!inChallenge("dm",22)) return false
                return hasMilestone("c",6)
            }
        },
        9: {
            requirementDescription: "20 Crystal Shards",
            effectDescription: "Unlocks <b>Crystals</b> tab.",
            done() {return player.c.points.gte(20)},
        },
        20: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "5e9 Unstable Dust"
                return "100 Unstable Dust"
            },
            effectDescription() {
                let descText = "Alleviates the Weakling Dust effect based on Unstable Dust.<br>"
                let effText = "Currently: /"+format(tmp.c.udNerfWeaklingEffect)+"."
                if(inChallenge("dm",22)) {
                    descText = "<b>Weakling Strengthen</b> is slightly cheaper based on Unstable Dust.<br>"
                    effText = "Currently: /"+format(tmp.c.udNerfWSCost)+"."
                    if(hasUpgrade("w",75)) descText = "<b>Weakling Strengthen</b> is cheaper based on Unstable Dust.<br>"
                }
                return descText+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.ud.gte(5e9)
                return player.c.ud.gte(100)&&!inChallenge("dm",22)&&!inChallenge("a",22)
            },
            unlocked() {
                if(inChallenge("a",22)) return false
                return true
            }
        },
        21: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "1e32 Unstable Dust"
                return "50,000 Unstable Dust"
            },
            effectDescription() {
                let descText = "<b>Weakling Strengthen</b> is slightly cheaper based on Unstable Dust.<br>"
                let effText = "Currently: /"+format(tmp.c.udNerfWSCost)+"."
                if(inChallenge("dm",22)) {
                    descText = "Divides the requirement of getting Crystal Shards based on Unstable Dust.<br>"
                    effText = "Currently: /"+format(tmp.c.udNerfCSReq)+"."
                }
                return descText+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.ud.gte(1e32)
                return player.c.ud.gte(50000)&&!inChallenge("a",22)
            },
            unlocked() {
                if(inChallenge("dm",22)) return player.c.ec.gte(1)
                if(inChallenge("a",22)) return false
                return true
            }
        },
        22: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "2e27 Unstable Dust"
                return "1,000,000 Unstable Dust"
            },
            effectDescription() {
                let descText = "Adds the 2nd effect to Unstable Dust.<br><i>this only applies when exceeding 1m Unstable Dust.</i>"
                let effText = ""
                if(inChallenge("dm",22)) {
                    descText = "Unstable Dust now multiplies Weakling Dust instead, but with reduced effect."
                    effText = ""
                }
                return descText+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.ud.gte(2e27)&&hasMilestone("c",52)
                return player.c.ud.gte(1e6)&&!inChallenge("a",22)
            },
            unlocked() {
                if(inChallenge("dm",22)) return hasMilestone("c",52)
                if(inChallenge("a",22)) return false
                return true
            }
        },
        23: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "3e41 Unstable Dust"
                return "1e9 Unstable Dust"
            },
            effectDescription() {
                let descText = "Unstable Dust effects ^1.2."
                let effText = ""
                if(inChallenge("dm",22)) {
                    descText = "Change the effect of the milestone <b>20 Crystal Shards Resets</b><br>and have it greatly enhanced."
                    effText = ""
                }
                return descText+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.ud.gte(3e41)
                return player.c.ud.gte(1e9)&&!inChallenge("a",22)
            },
            unlocked() {
                if(inChallenge("dm",22)) return hasMilestone("c",86)
                if(inChallenge("a",22)) return false
                return hasMilestone("c",71)
            }
        },
        24: {
            requirementDescription() {
                if(inChallenge("dm",22)) return "1e45 Unstable Dust"
                return "1e12 Unstable Dust"
            },
            effectDescription() {
                let descText = "Boosts Unstable Dust gain based on the sum of Virtuous Crystals and Evil Crystals.<br>"
                let effText = "Currently: ×"+format(tmp.c.crystalsToUD)+"."
                if(inChallenge("dm",22)) {
                    descText = "Divides the requirement of condensing Crystals based on Unstable Dust.<br>"
                    effText = "Currently: /"+format(tmp.c.udNerfCrystalCost)+"."
                }
                return descText+effText
            },
            done() {
                if(inChallenge("dm",22)) return player.c.ud.gte(1e45)
                return player.c.ud.gte(1e12)&&!inChallenge("a",22)
            },
            unlocked() {
                if(inChallenge("dm",22)) return hasMilestone("c",87)
                if(inChallenge("a",22)) return false
                return hasMilestone("c",71)
            }
        },
        25: {
            requirementDescription: "1e18 Unstable Dust",
            effectDescription() {
                if(inChallenge("dm",22)) return "<i style='color:rgba(104, 101, 101, 0.8)'>You shall seek... the place where it was originated...</i>"
                if(inChallenge("a",22)) return "<i style='color:rgba(121, 116, 88, 0.8)'>The God's Trial... began...</i>"
                return "Unlocks a new row of Weakling Upgrades."
            },
            done() {return player.c.ud.gte(1e18)},
            unlocked() {return hasMilestone("c",71)||inChallenge("dm",22)||inChallenge("a",22)}
        },
        26: {
            requirementDescription: "1e70 Unstable Dust",
            effectDescription() {
                if(inChallenge("a",22)) return "Unlocks automation for <b>Mentality Strengthen</b> and <b>Weakling Strengthen</b>."
                return "Unlocks two new layers."
            },
            done() {return player.c.ud.gte(1e70)},
            toggles() {if(inChallenge("a",22)) return [["c","autoStrengthen"]]},
            style() {if(inChallenge("a",22)) return {'height':'90px'}},
            unlocked() {return hasMilestone("c",71)||inChallenge("dm",22)||inChallenge("a",22)}
        },
        27: {
            requirementDescription: "1e500 Unstable Dust",
            done() {return player.c.ud.gte("1e500")},
            unlocked: false
        },
        40: {
            requirementDescription: "1 Virtuous Crystal",
            done() {return player.c.vc.gte(1)&&!inChallenge("dm",22)},
        },
        41: {
            requirementDescription: "3 Virtuous Crystals",
            done() {return player.c.vc.gte(3)&&!inChallenge("dm",22)},
        },
        42: {
            requirementDescription: "5 Virtuous Crystals",
            done() {return player.c.vc.gte(5)&&!inChallenge("dm",22)},
        },
        43: {
            requirementDescription: "10 Virtuous Crystals",
            done() {return player.c.vc.gte(10)&&!inChallenge("dm",22)},
        },
        44: {
            requirementDescription: "30 Virtuous Crystals",
            done() {return player.c.vc.gte(30)&&!inChallenge("dm",22)},
        },
        45: {
            requirementDescription: "50 Virtuous Crystals",
            done() {return player.c.vc.gte(50)&&!inChallenge("dm",22)},
        },
        46: {
            requirementDescription: "500 Virtuous Crystals",
            done() {return player.c.vc.gte(500)&&!inChallenge("dm",22)},
        },
        47: {
            requirementDescription: "5,000 Virtuous Crystals",
            done() {return player.c.vc.gte(5000)&&!inChallenge("dm",22)},
        },
        48: {
            requirementDescription: "100,000 Virtuous Crystals",
            done() {return player.c.vc.gte(100000)&&!inChallenge("dm",22)},
        },
        50: {
            requirementDescription: "0 Virtuous Crystals",
            done() {return inChallenge("dm",22)},
        },
        51: {
            requirementDescription: "1 Virtuous Crystal",
            done() {return player.c.vc.gte(1)&&inChallenge("dm",22)},
        },
        52: {
            requirementDescription: "3 Virtuous Crystals",
            done() {return player.c.vc.gte(3)&&inChallenge("dm",22)},
        },
        53: {
            requirementDescription: "6 Virtuous Crystals",
            done() {return player.c.vc.gte(6)&&inChallenge("dm",22)},
        },
        54: {
            requirementDescription: "10 Virtuous Crystals",
            done() {return player.c.vc.gte(10)&&inChallenge("dm",22)},
        },
        55: {
            requirementDescription: "15 Virtuous Crystals",
            done() {return player.c.vc.gte(15)&&inChallenge("dm",22)},
        },
        56: {
            requirementDescription: "20 Virtuous Crystals",
            done() {return player.c.vc.gte(20)&&inChallenge("dm",22)},
        },
        57: {
            requirementDescription: "33 Virtuous Crystals",
            done() {return player.c.vc.gte(33)&&inChallenge("dm",22)},
        },
        58: {
            requirementDescription: "50 Virtuous Crystals",
            done() {return player.c.vc.gte(50)&&inChallenge("dm",22)},
        },
        59: {
            requirementDescription: "100 Virtuous Crystals",
            done() {return player.c.vc.gte(100)&&inChallenge("dm",22)},
        },
        70: {
            requirementDescription: "1 Evil Crystal",
            done() {return player.c.ec.gte(1)&&!inChallenge("dm",22)},
        },
        71: {
            requirementDescription: "5 Evil Crystals",
            done() {return player.c.ec.gte(5)&&!inChallenge("dm",22)},
        },
        72: {
            requirementDescription: "10 Evil Crystals",
            done() {return player.c.ec.gte(10)&&!inChallenge("dm",22)},
        },
        73: {
            requirementDescription: "25 Evil Crystals",
            done() {return player.c.ec.gte(25)&&!inChallenge("dm",22)},
        },
        74: {
            requirementDescription: "40 Evil Crystals",
            done() {return player.c.ec.gte(40)&&!inChallenge("dm",22)},
        },
        75: {
            requirementDescription: "50 Evil Crystals",
            done() {return player.c.ec.gte(50)&&!inChallenge("dm",22)},
        },
        76: {
            requirementDescription: "500 Evil Crystals",
            done() {return player.c.ec.gte(500)&&!inChallenge("dm",22)},
        },
        77: {
            requirementDescription: "5,000 Evil Crystals",
            done() {return player.c.ec.gte(5000)&&!inChallenge("dm",22)},
        },
        78: {
            requirementDescription: "100,000 Evil Crystals",
            done() {return player.c.ec.gte(100000)&&!inChallenge("dm",22)},
        },
        80: {
            requirementDescription: "1 Evil Crystal",
            done() {return player.c.ec.gte(1)&&inChallenge("dm",22)},
        },
        81: {
            requirementDescription: "2 Evil Crystals",
            done() {return player.c.ec.gte(2)&&inChallenge("dm",22)},
        },
        82: {
            requirementDescription: "4 Evil Crystals",
            done() {return player.c.ec.gte(4)&&inChallenge("dm",22)},
        },
        83: {
            requirementDescription: "6 Evil Crystals",
            done() {return player.c.ec.gte(6)&&inChallenge("dm",22)},
        },
        84: {
            requirementDescription: "10 Evil Crystals",
            done() {return player.c.ec.gte(10)&&inChallenge("dm",22)},
        },
        85: {
            requirementDescription: "20 Evil Crystals",
            done() {return player.c.ec.gte(20)&&inChallenge("dm",22)},
        },
        86: {
            requirementDescription: "40 Evil Crystals",
            done() {return player.c.ec.gte(40)&&inChallenge("dm",22)},
        },
        87: {
            requirementDescription: "60 Evil Crystals",
            done() {return player.c.ec.gte(60)&&inChallenge("dm",22)},
        },
        88: {
            requirementDescription: "100 Evil Crystals",
            done() {return player.c.ec.gte(100)&&inChallenge("dm",22)},
        },
        89: {
            requirementDescription: "1,000 Evil Crystals",
            done() {return player.c.ec.gte(1000)&&inChallenge("dm",22)},
        },
    },
    clickables: {
        11: {
            title() {
                if(inChallenge("dm",22)) {
                    if(hasMilestone("c",8)) return "<h2>Trade "+formatWhole(tmp.c.crystalCost)+
                    " Crystal Shards to get "+(hasUpgrade("c",32)?formatWhole(tmp.c.crystalsQuantity):formatWhole(1))+
                    " Crystal"+((tmp.c.crystalsQuantity.eq(1)||!hasUpgrade("c",32))?"":"s")+"<br></h2>"
                    if(hasMilestone("c",7)) return "<h2>Reach 100 Crystal Shards<br>to continue</h2>"
                }   
                return "<h2>Condense "+formatWhole(tmp.c.crystalCost)+" Crystal Shards into "+
                (hasUpgrade("c",32)?formatWhole(tmp.c.crystalsQuantity):formatWhole(1))+" Crystal"+
                ((tmp.c.crystalsQuantity.eq(1)||!hasUpgrade("c",32))?"":"s")+"<br></h2>"
            },
            display() {
                if(inChallenge("dm",22)&&hasMilestone("c",7)&&!hasMilestone("c",8)) return ""
                return "<h3>Note: This forces a Crystal Shards reset.</h3>"
            },
            onClick() {
                player.c.points = player.c.points.sub(tmp.c.crystalCost)
                crystalTypeDecider()
                if(inChallenge("dm",22)) {
                    let keep = []
                    player.c.resetCount = player.c.resetCount.add(1)
                    player.c.dealCount = player.c.dealCount.add(1)
                    if(hasMilestone("c",81)) keep.push("upgrades")
                    layerDataReset("w",keep)
                    player.de = new Decimal(0)
                    player.ae = new Decimal(0)
                }
                else doReset("c", force=true)
            },
            onHold() { // QOL for mobile players
                if(player.c.points.lt(tmp.c.crystalCost)) return
                player.c.points = player.c.points.sub(tmp.c.crystalCost)
                crystalTypeDecider()
                if(inChallenge("dm",22)) {
                    let keep = []
                    player.c.resetCount = player.c.resetCount.add(1)
                    player.c.dealCount = player.c.dealCount.add(1)
                    if(hasMilestone("c",81)) keep.push("upgrades")
                    layerDataReset("w",keep)
                    player.de = new Decimal(0)
                    player.ae = new Decimal(0)
                }
                else doReset("c", force=true)
            },
            canClick() {
                return (player.c.points.gte(tmp.c.crystalCost)&&(!hasUpgrade("c",21)||!hasUpgrade("c",41)))
            },
            unlocked: true,
            style: {'width': '400px', 'height': '100px','touch-action':'manipulation'}
        },
        
        21: { // a replication of toggle but with unlock condition
            title() {
                if(getClickableState("c",21)==1) return "ON"
                return "OFF"
            },
            unlocked() {return hasMilestone("c",42)||hasMilestone("c",50)},
            canClick: true,
            onClick() {
                if(getClickableState("c",21)==1) {
                    setClickableState("c",21,0)
                    player.c.autoStrengthen = false
                }
                else {
                    setClickableState("c",21,1)
                    player.c.autoStrengthen = true
                    if(hasMilestone("c",27)) player.a.outChTime = 0
                }
            },
            style: {'width': "45px", 'min-height': "45px", "background-color": 'rgb(18, 187, 41)'}
        }
    },
    upgrades: {
        11: {
            title: "Faith",
            description: "Increase the gain of Virtuous Crystals based on total Crystal Shards.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(50)
            },
            effect() {
                let eff = player.c.total.pow(0.2).div(1.15).max(1).floor()
                if(hasUpgrade("c",63)) eff = player.c.total.pow(0.22).div(1.35).max(1).floor()
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",11)
            }},
            unlocked() {return (hasMilestone(this.layer,45)||inChallenge("dm",21))&&!inChallenge("dm",22)&&!inChallenge("a",22)}
        },
        12: {
            title: "Empowerment",
            description: "Significantly increase the first VC effect.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(100)
            },
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",12)
            }},
            unlocked() {return (hasUpgrade(this.layer,11)||inChallenge("dm",21))}
        },
        13: {
            title: "Enchantment",
            description: "Crystal Shards boosts its own gain.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1000)
            },
            effect() {
                let eff = player.c.points.pow(0.14).max(1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",13)
            }},
            unlocked() {return (hasUpgrade(this.layer,12)||inChallenge("dm",21))}
        },
        14: {
            title: "Benediction",
            description: "<i>Mentality Strengthen</i> no longer costs anything, and its base is improved based on VC.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(10000)
            },
            effect() {
                let eff = new Decimal(0.05)
                let mult = new Decimal(0.04)
                eff = eff.add(mult.mul(player.c.vc.max(1).log10()))
                if(hasUpgrade("w",35)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",14)
            }},
            unlocked() {return (hasUpgrade(this.layer,13)||inChallenge("dm",21))}
        },
        21: {
            title: "Construction",
            description: "Automatically gains VC based on its own gain multiplier.<br>You will no longer gain VC by Crystal condensation.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            tooltip: "When having Destruction at the same time, ×10 the effect of this upgrade and disable the Crystals button.",
            cost: new Decimal(1e9),
            effect() {
                let eff = tmp.c.crystalsQuantity.div(20)
                if(hasUpgrade("c",11)) eff = eff.mul(upgradeEffect("c",11))
                if(hasUpgrade("c",21)&&hasUpgrade("c",41)) eff = eff.mul(10)
                if(hasChallenge("a",11)&&!inChallenge("a",21)&&!inChallenge("a",22)) eff = eff.mul(tmp.a.vppEffect.add(1))
                if((hasMilestone("dm",2)&&(inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)||(inChallenge("dm",22)&&false)))||(hasMilestone("dm",3)&&!inAnyChallenge())) eff = eff.mul(1e3)
                if((hasMilestone("a",2)&&(inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)))||(hasMilestone("a",3)&&!inAnyChallenge())) eff = eff.mul(1e6)
                if(inChallenge("dm",12)) eff = new Decimal(0)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"/s"
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",21)
            }},
            unlocked() {return (hasUpgrade(this.layer,14)||inChallenge("dm",21))}
        },
        22: {
            title: "Purity",
            description: "You gain 5% more multiplier on Purified VC<sup>1</sup> for every bought Purified VC<sup>1</sup>.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1e35),
            effect() {
                let eff = Decimal.pow(1.05,player.a.vc1Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",22)
            }},
            unlocked() {return (player.a.vc2.gte(5))&&!inChallenge("dm",22)&&!inChallenge("a",22)}
        },
        23: {
            title: "Purity<sup>2</sup>",
            description: "You gain 4% more multiplier on Purified VC<sup>2</sup> for every bought Purified VC<sup>2</sup>.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1e65),
            effect() {
                let eff = Decimal.pow(1.04,player.a.vc2Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",23)
            }},
            unlocked() {return hasChallenge("a",21)&&!inChallenge("dm",22)&&!inChallenge("a",22)}
        },
        24: {
            title: "Purity<sup>3</sup>",
            description: "You gain 3% more multiplier on Purified VC<sup>3</sup> for every bought Purified VC<sup>3</sup>.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1e100),
            effect() {
                let eff = Decimal.pow(1.03,player.a.vc3Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("vc","c",24)
            }},
            unlocked() {return false}
        },
        31: {
            title: "Disbelief",
            description: "Increase the gain of Evil Crystals based on total Crystal Shards.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(50)
            },
            effect() {
                let eff = player.c.total.pow(0.22).div(1.35).max(1).floor()
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            style: {"background"() {
                if(inChallenge("dm",22)) return upgradeButtonStyle("dc22","c",31)
                return upgradeButtonStyle("ec","c",31)
            }},
            unlocked() {
                if(inChallenge("dm",22)||inChallenge("a",22)) return false
                return (hasMilestone(this.layer,75))
            }
        },
        32: {
            title: "Rebellion",
            description: "You can condense multiple Crystals at once, but the cost will increase drastically.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(100)
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",32)
            }},
            unlocked() {return (hasUpgrade(this.layer,31)||inChallenge("dm",21))}
        },
        33: {
            title: "Degradation",
            description: "Significantly increase the fifth EC effect.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1200)
            },
            effect() {
                let eff = new Decimal(4)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",33)
            }},
            unlocked() {return (hasUpgrade(this.layer,32)||inChallenge("dm",21))}
        },
        34: {
            title: "Imprecation",
            description: "<i>Weakling Strengthen</i> no longer costs anything, and its base is improved based on EC.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(10000)
            },
            effect() {
                let eff = new Decimal(0.05)
                let mult = new Decimal(0.025)
                eff = eff.add(mult.mul(player.c.ec.max(1).log10()))
                if(hasUpgrade("w",35)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",34)
            }},
            unlocked() {return (hasUpgrade(this.layer,33)||inChallenge("dm",21))}
        },
        41: {
            title: "Destruction",
            description: "Automatically gains EC based on its own gain multiplier.<br>You will no longer gain EC by Crystal condensation.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            tooltip: "When having Construction at the same time, ×10 the effect of this upgrade and disable the Crystals button.",
            cost: new Decimal(1e9),
            effect() {
                let eff = tmp.c.crystalsQuantity.div(20)
                if(hasUpgrade("c",31)) eff = eff.mul(upgradeEffect("c",31))
                if((hasUpgrade("c",21)&&hasUpgrade("c",41))||hasMilestone("c",89)) eff = eff.mul(10)
                if(hasUpgrade("c",73)) eff = eff.mul(upgradeEffect("c",73))
                if(hasChallenge("dm",11)&&!inChallenge("a",21)&&!inChallenge("a",22)) eff = eff.mul(tmp.dm.eppEffect.add(1))
                if((hasMilestone("dm",2)&&(inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)||(inChallenge("dm",22)&&false)))||(hasMilestone("dm",3)&&!inAnyChallenge())) eff = eff.mul(1e6)
                if((hasMilestone("a",2)&&(inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)))||(hasMilestone("a",3)&&!inAnyChallenge())) eff = eff.mul(1e3)
                if(inChallenge("a",12)) eff = new Decimal(0)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"/s"
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",41)
            }},
            unlocked() {return (hasUpgrade(this.layer,34)||inChallenge("dm",21))}
        },
        42: {
            title: "Impurity",
            description: "You gain 5% more multiplier on Purified EC<sup>1</sup> for every bought Purified EC<sup>1</sup>.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(1e36),
            effect() {
                let eff = Decimal.pow(1.05,player.dm.ec1Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",42)
            }},
            unlocked() {
                if(inChallenge("dm",22)) return hasUpgrade("c",41)
                if(inChallenge("a",22)) return false
                return (player.dm.ec2.gte(5))
            }
        },
        43: {
            title: "Impurity<sup>2</sup>",
            description: "You gain 4% more multiplier on Purified EC<sup>2</sup> for every bought Purified EC<sup>2</sup>.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: Decimal.pow(10,100/1.5),
            effect() {
                let eff = Decimal.pow(1.04,player.dm.ec2Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",43)
            }},
            unlocked() {
                if(inChallenge("dm",22)) return hasUpgrade("c",42)
                if(inChallenge("a",22)) return false
                return hasChallenge("dm",21)
            }
        },
        44: {
            title: "Impurity<sup>3</sup>",
            description: "You gain 3% more multiplier on Purified EC<sup>3</sup> for every bought Purified EC<sup>3</sup>.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(1e100),
            effect() {
                let eff = Decimal.pow(1.03,player.dm.ec2Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",44)
            }},
            unlocked() {return false}
        },
        51: {
            title: "Fogging",
            description: "Unstable Dust effect is now ^0.9.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1000)
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",51)
            }},
            unlocked() {return ((hasUpgrade(this.layer,12)&&hasUpgrade(this.layer,32))||inChallenge("dm",21))}
        },
        52: {
            title: "Grinding",
            description: "Crystal Shards boost Unstable Dust at a greatly reduced rate.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(50000)
            },
            effect() {
                let eff = player.c.points.max(1).log10().mul(2.1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",52)
            }},
            unlocked() {return ((hasUpgrade(this.layer,13)&&hasUpgrade(this.layer,33))||inChallenge("dm",21))}
        },
        53: {
            costCS: new Decimal(5e6),
            costVC: new Decimal(50000),
            costEC: new Decimal(50000),
            fullDisplay() {
                let title = "<h3>Foaming</h3>"
                let description = "Change the description for <b>Crystalize</b>."
                let cost = "Cost: "+formatWhole(tmp.c.upgrades[53].costCS)+" Crystal Shards, "+formatWhole(tmp.c.upgrades[53].costVC)+" VC and<br>"+formatWhole(tmp.c.upgrades[53].costEC)+" EC"
                return title+"<br>"+description+"<br><br>"+cost
            },
            canAfford() {
                if(inChallenge("dm",21)) {
                    tmp.c.upgrades[53].costCS = new Decimal("9.99e9,999")
                    tmp.c.upgrades[53].costVC = new Decimal("9.99e9,999")
                    tmp.c.upgrades[53].costEC = new Decimal("9.99e9,999")
                }
                let csCost = player.c.points.gte(tmp.c.upgrades[53].costCS)
                let vcCost = player.c.vc.gte(tmp.c.upgrades[53].costVC)
                let ecCost = player.c.ec.gte(tmp.c.upgrades[53].costEC)
                return (csCost&&vcCost&&ecCost)
            },
            pay() {
                player.c.points = player.c.points.sub(tmp.c.upgrades[53].costCS)
                player.c.vc = player.c.vc.sub(tmp.c.upgrades[53].costVC)
                player.c.ec = player.c.ec.sub(tmp.c.upgrades[53].costEC)
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",53,true)
            }},
            unlocked() {return ((hasUpgrade(this.layer,14)&&hasUpgrade(this.layer,34))||inChallenge("dm",21))}
        },
        54: {
            title: "Clarity",
            description: "Mentality and Weakling layer are no longer reset by condensing Crystal and Crystal Shards.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(5e12)
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",54)
            }},
            unlocked() {return (hasUpgrade(this.layer,41)&&hasUpgrade(this.layer,41))}
        },
        55: {
            title: "Distillation",
            description: "Gain 50% of Crystal Shards on reset. Adds an effect to Crystal Shard.",
            tooltip: "This will also disable the prestige button of Crystal Shards.",
            cost: new Decimal(1e15),
            style: {"background"() {
                return upgradeButtonStyle("c","c",55)
            }},
            unlocked() {return (hasUpgrade(this.layer,54)||inChallenge("dm",21))}
        },
        61: {
            title: "Defragmentation",
            description: "Drastically improve the Crystal Shards effect.",
            cost: new Decimal(1e51),
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",61)
            }},
            unlocked() {
                if(inChallenge("dm",22)||inChallenge("a",22)) return false
                return (player.a.vc2.gte(5)||player.dm.ec2.gte(5))
            }
        },
        62: {
            title: "Dissolution",
            description: "Crystal Shards and Weakling Dust boost each other.",
            tooltip() {return "Currently: ×"+format(tmp.c.weaklingToCS)+" to Crystal Shards.<br>×"+format(tmp.c.csToWeakling)+" to Weakling Dust."},
            cost: new Decimal(1e88),
            style: {"background"() {
                return upgradeButtonStyle("c","c",62)
            }},
            unlocked() {
                if(inChallenge("dm",22)||inChallenge("a",22)) return false
                return hasChallenge("dm",21)
            }
        },
        63: {
            title: "Equalize",
            description: "<i>Faith</i> and <i>Disbelief</i> has the exact same gain, but the price for Purified VCs will also increase.",
            cost: new Decimal(1e160),
            style: {"background"() {
                return upgradeButtonStyle("c","c",63)
            }},
            unlocked() {
                if(inChallenge("dm",22)||inChallenge("a",22)) return false
                return hasChallenge("dm",22)&&hasChallenge("a",22)
            }
        },
        64: {
            title: "Sublimation",
            description: "Boosts Mentality based on Crystal Shards.",
            cost: new Decimal(1e160),
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("c","c",64)
            }},
            unlocked() {return false}
        },
        // DC22 Exclusive #######################################################################################################
        71: {
            title: "Did ya feel familiar with this?",
            description: "Increase the gain of Evil Crystals based on total Crystal Shards.",
            cost: new Decimal(100),
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            effect() {
                let eff = player.c.total.pow(0.22).div(1.35).max(1).floor()
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",71)
            }},
            unlocked() {return hasMilestone("c",88)}
        },
        72: {
            title: "Bliss",
            description: "Enhance the effects of Evil Crystals.",
            cost: new Decimal(150),
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",72)
            }},
            unlocked() {return hasUpgrade("c",71)}
        },
        73: {
            title: "ECchange",
            description: "Increase the speed of EC generation based on EC.",
            cost: new Decimal(2000),
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            effect() {
                let eff = player.c.ec.max(1).log(5).div(2).max(1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("ec","c",73)
            }},
            unlocked() {return hasUpgrade("c",93)}
        },
        91: {
            title: "Liberation",
            description: "Reclaim the generation of Crystal Shards. Generate Crystal Shards reset passively too.",
            tooltip: "This will also disable the Crystals button under Weakling layer.",
            effect() {
                let eff = new Decimal(5)
                return eff
            },
            effectDisplay() {
                return formatWhole(this.effect())+"/s"
            },
            cost: new Decimal(5e20),
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            style: {"background"() {
                return upgradeButtonStyle("dc22","c",91)
            }},
            unlocked() {return hasMilestone("c",56)}
        },
        92: {
            title: "Dedication",
            description: "Raise the cap of the 3rd Crystal Shards Milestone by 10.",
            cost: new Decimal(1e21),
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            style: {"background"() {
                return upgradeButtonStyle("dc22","c",92)
            }},
            unlocked() {return hasUpgrade("c",91)}
        },
        93: {
            title: "Salvation",
            description: "Enhance the effect of the 5th Unstable Dust milestone.",
            cost: new Decimal(1e27),
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            effect() {
                let eff = new Decimal(1.75)
                return eff
            },
            effectDisplay() {
                return "^"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("dc22","c",93)
            }},
            unlocked() {return hasMilestone("c",57)}
        },
    }
}) // Crystals
