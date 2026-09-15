addLayer("bam", {
    name: "", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "<img src='js/Bamboo.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		pHarvest: new Decimal(1),
		pHarMax: new Decimal(1000),
    }},
    color: "#a5f57d",
    requires: new Decimal(20), // Can be a function that takes requirement increases into account
    resource: "Bamboo", // Name of prestige currency
    baseResource: "Knowledge", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	effect() {
		if(hasMilestone('bam',5)) return player[this.layer].points.pow(0.5).add(1).add(tmp.bam.milestones[3].effect).div(softcap((player.bam.points.max(1)), new Decimal(5) , 0.275))
		if(hasMilestone('bam',3)) return player[this.layer].points.pow(0.5).add(1).min(10).add(tmp.bam.milestones[3].effect).min(1.6e4)
		return player[this.layer].points.pow(0.5).add(1).min(10)
	},
	effectSoft(){
		return softcap((player.bam.points.max(1)), new Decimal(5) , 0.275)
	},
	effectDescription(){
		if(hasMilestone('bam',5)) return "multiplying point gain by "+format(tmp[this.layer].effect)+",<br> Softcapped by "+format(tmp.bam.effectSoft)
		return "multiplying point gain by " + format(tmp[this.layer].effect)
	},
	branches: ['s'],
	gainMult() {
        let mult = new Decimal(1)
		if (hasMilestone('bam', 1)) mult = mult.times(player[this.layer].points.sqrt().sqrt().max(1).div(1).min(10))
		if (player.bam.pHarvest<900 & hasMilestone('bam', 2)) mult = mult.times(player[this.layer].pHarvest.sqrt().div(4))
		if (player.bam.pHarvest>=900 & hasMilestone('bam', 2)) mult = mult.times(player[this.layer].pHarMax.sub(player[this.layer].pHarvest)).sqrt().div(4).times(9)
		mult = mult.times(player.mush.mushB.add(1))
		if (getBuyableAmount('s', 21)>0) mult = mult.times(buyableEffect('s', 21))
		if (tmp.st.effect.st3>0) mult = mult.times(tmp.st.effect.st3)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
	upgrades:{
		11:{
			title: "<img src='js/Bamboo.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Simple bed",
			tooltip: "Bamboo seems to be soft enough for rest",
			cost: new Decimal(100),
			description: "Multiplies your knowledge gain by 4"
		},
		12:{
			title: "<img src='js/Bamboo.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Better Harvesting Methods",
			tooltip: "This harvesting seems boring and fruitless, maybe i'm doing it wrong?",
			cost: new Decimal(1000),
			description: "Multiplies your harvest speed by 5",
		},
		13:{
			title: "<img src='js/Bamboo.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Bamboo Synergy",
			tooltip: "I wouldn\'t be where I am now without this plant",
			cost: new Decimal(5e16),
			description: "Harvest Gauge now boost Knowledge Gain (No Nerf Effect Included!)",
			effect(){
				return player.bam.pHarvest.min(900).sqrt().div(4).add(1)
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
			unlocked(){
				if(hasMilestone('st',0)) return true
			},
		},
		14:{
			title: "<img src='js/Bamboo.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Bamboo Decorations",
			tooltip: "Let\'s give this material second life!",
			cost: new Decimal(1e18),
			description: "Bamboo effect boost Wood Effect and Wood Effect hardcap gets increased",
			effect(){
				return tmp.bam.effect.div(1600)
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
			unlocked(){
				if(hasMilestone('st',0)) return true
			},
		},
	},
	bars: {
		Harvest: {
			direction: RIGHT,
			height: 50,
			width: 400,
			progress() {
				return player[this.layer].pHarvest.div(1000)
			},
			fillStyle: {
				"background-color":"#a5f57d"
			},
		}
	},
	milestones: {
		0: {
			requirementDescription: "1 Bamboo",
			effectDescription: "You keep most important upgrades from Laboratory!",
			done() { return player.bam.points.gte(1) }
		},
		1: {
			requirementDescription: "25 Bamboo",
			effectDescription: "Bamboo boosts it's own production",
			done() {return player.bam.points.gte(25) },
			effect() {return player[this.layer].points.add(1).div(5)},
		},
		2: {
			requirementDescription: "500 Bamboo",
			effectDescription: "Unlock ability to Harvest Bamboo",
			done() {return player.bam.points.gte(500) },
		},
		3: {
			requirementDescription: "4000 Bamboo",
			effectDescription: "Bamboo boosts its own effect slightly (Up to 16,000x)",
			done() {return player.bam.points.gte(4000) },
			effect() {return player[this.layer].points.sqrt()},
		},
		4: {
			requirementDescription: "20000 Bamboo",
			effectDescription: "Unlock new Layer",
			done() {return player.bam.points.gte(20000) },
		},
		5: {
			requirementDescription: "2.5e20 Bamboo",
			effectDescription: "Bamboo effect is no longer hardcapped, it will be softcapped instead by: ",
			done() {return player.bam.points.gte(2.5e20) },
			unlocked(){return hasChallenge('st',21)}
		},
	},
	update(diff){
		if (hasUpgrade('bam', 12)) return player.bam.pHarvest = player.bam.pHarvest.add(5).min(1000)
		player.bam.pHarvest = player.bam.pHarvest.add(1).min(1000)
	},
	infoboxes: {
		harv: {
			title: "Harvesting Bamboo ",
			body() {return "Here you have to check if your Bamboo is growing properly. If you wait a little, you will gain more Bamboo. But if Harvest Gauge overfills, Bamboo will rot, negatively impacting your Bamboo gain."},
		},
	},
	tabFormat: {
		"Upgrades": {
			content:["main-display", "resource-display", "prestige-button", "blank", "upgrades"],
			unlocked(){return true},
		},
		"Milestones": {
			content:["main-display", "resource-display", "prestige-button", "blank", "milestones"],
			unlocked(){return true},
		},
		"Harvest": {
			content:["main-display", "resource-display", "prestige-button", "blank", ["bar", "Harvest"],
			"blank",["display-text", function(){return 'Your Harvest Gauge '+format(player.bam.pHarvest)+'/900'}],
			["display-text", function(){if(player.bam.pHarvest>900)return '<h4 style="color: red">Bamboo is decaying!</h4>'}],"blank",["infobox","harv"]],
			unlocked(){return hasMilestone('bam', 2)},
		},
	},
	row: 1,
    hotkeys: [
        {key: "b", description: "b: Reset for Bamboo", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
		if ((hasUpgrade('s', 12) | player.bam.points > 0)&&player.switch.treeSelect==1) return true
		return false
	},
	onPrestige(){
		player.bam.pHarvest = new Decimal(0)
	},
	deactivated(){
		if(inChallenge('st', 12)) return true
		if(inChallenge('st', 22)) return true
	},
	canReset(){
		if(inChallenge('st',12)) return false
		return true
	},
})

addLayer("mush", {
    name: "",
	symbol: "<img src='js/Mush.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 2,
    startData() { return {
		points: new Decimal(0),
		mushA: new Decimal(0),
		mushB: new Decimal(0),
		mushC: new Decimal(0),
        unlocked: true,
    }},
    color() {
		return "#ad6040"
	},
	row: 1,
	branches: ['s'],
	layerShown(){
		if ((hasMilestone('bam', 4)|player.mush.points>0|player.st.total>0)&&player.switch.treeSelect==1) return true
	},
	requires: new Decimal(20),
	resource: "Mushrooms",
    baseResource: "Knowledge", 
    baseAmount() {return player.points},
    type: "normal", 
    exponent: 0.45,
	effect(){
		return {
			bayb: player.mush.points.div(500).times(20),
			chan: player.mush.points.div(50000).times(20),
			hney: player.mush.points.div(1e7).times(20).add(player.w.points.sqrt()).div(25),
			soft: softcap((player.mush.points), new Decimal(5) , 0.1)
		}
	},
	gainMult() {
        let mult = new Decimal(1)
		mult = mult.times(tmp.st.effect.st3).max(1)
		if(player.mush.points>1e7) mult = mult.div(tmp.mush.effect.soft)
        return mult
    },
    gainExp() { 
		if(player.mush.points>1e5) return new Decimal(0.8)
        return new Decimal(1)
    },
	update(diff){
		player.mush.mushA = player.mush.mushA.add(tmp.mush.effect.bayb.times(diff))
		player.mush.mushB = player.mush.mushB.add(tmp.mush.effect.chan.times(diff))
		if(hasUpgrade('w', 11)) player.mush.mushC = player.mush.mushC.add(tmp.mush.effect.hney.times(diff))
	},
	tabFormat: 
		["main-display", "resource-display", "prestige-button", "blank", ["display-text", function(){
			return 'You have <h3 style="color:#4D1F1C">'+format(player.mush.mushA)+'</h3> of Bay Bolete Mushrooms, which increases your point gain.'
		}],["display-text", function(){
			return '(<h3 style="color:#4D1F1C">'+format(tmp.mush.effect.bayb)+'</h3>/sec)'
		}],"blank",["display-text", function(){
			return 'You have <h3 style="color:#FFD64D">'+format(player.mush.mushB)+'</h3> of Chanterelle Mushrooms, which increases your Bamboo gain.'
		}],["display-text", function(){
			return '(<h3 style="color:#FFD64D">'+format(tmp.mush.effect.chan)+'</h3>/sec)'
		}],"blank",["display-text", function(){
			if(hasUpgrade('w', 11))return 'You have <h3 style="color:#D39741">'+format(player.mush.mushC)+'</h3> of Honey Mushrooms, which increases your Wood gain.'
		}],["display-text", function(){
			if(hasUpgrade('w', 11))return '(<h3 style="color:#D39741">'+format(tmp.mush.effect.hney)+'</h3>/sec)'
		}],"blank","blank","blank",["display-text", function(){
			if(player.mush.points>1e5)return 'Your mushroom gain exponent is decreased, because you keep collecting them faster than they can regrow!'
		}],"blank",["display-text", function(){
			if(player.mush.points>1e7)return '<h4 style="color:#FFCCCC">Mushroom Gain has been SOFTCAPPED! by <h3 style="color:#FF8888">'+format(tmp.mush.effect.soft)+'x</h3></h4>'
		}]],
	deactivated(){
		if(inChallenge('st', 22)) return true
	}
})

addLayer("w", {
    name: "", 
	symbol: "<img src='js/Wood.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 3,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
	requires: new Decimal(2e7),
	resource: "Wood",
    baseResource: "Knowledge", 
    baseAmount() {return player.points},
    type: "normal", 
    exponent() {return 0.3},
	effect() {
		if(hasUpgrade('w',22)) return player[this.layer].points.pow(0.5).add(1).times(upgradeEffect('bam',14)).div(tmp.w.effectSoft)
		if(hasUpgrade('bam',14)) return player[this.layer].points.pow(0.5).add(1).min(1250).times(upgradeEffect('bam',14))
		return player[this.layer].points.pow(0.5).add(1).min(250)
	},
	effectSoft(){
		return softcap((player.bam.points.max(1)), new Decimal(5) , 0.05)
	},
	effectDescription(){
		if(hasUpgrade('w',22)) return "multiplying point gain by "+format(tmp[this.layer].effect)+",<br> Softcapped by "+format(tmp.w.effectSoft)
		return "multiplying point gain by " + format(tmp[this.layer].effect)
	},
	gainMult() {
        let mult = new Decimal(1)
		mult = mult.times(player.mush.mushC.sqrt()).add(1)
		if(player.st.sand>0)mult = mult.times(tmp.st.effect.st3).max(1)
		if(getBuyableAmount("s", 11)>0) mult = mult.times(buyableEffect("s", 11))
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    color() {
		return "#995D2C"
	},
	glowColor() {
		return "#EF9800"
	},
	row: 1,
	branches: ['s'],
	layerShown(){
		if ((hasUpgrade('s', 15) | player.w.points > 0)&&player.switch.treeSelect==1) return true
		if (inChallenge('st',12)) return true
	},
	upgrades:{
		11:{
			title: "<img src='js/Mush.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Bizarre Partnership",
			tooltip: "I get carbohydrates, you get water and nutrients",
			cost: new Decimal(100),
			description: "Unlock new type of Mini-Mushroom"
		},
		12:{
			title: "<img src='js/Wood.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Primitive Wood Cutting",
			tooltip: "It's possible to break tree without tools, but it's really hard",
			cost: new Decimal(1500),
			description: "Multiplies your Knowledge gain by 4",
			unlocked(){if(hasUpgrade('w',11)) return true}
		},
		13:{
			title: "<img src='js/Lab0.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Simple Workbench and Tools",
			tooltip: "The Revolution...",
			cost: new Decimal(10000),
			description: "Unlock new Tab in Laboratory (Only Tab!)",
			unlocked(){if(hasUpgrade('w',12)) return true}
		},
		14:{
			title: "<img src='js/Lab0.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Simple Drawer",
			tooltip: "Sadly, I don't have that much hands to hold all of this food",
			cost: new Decimal(7.5e5),
			description: "Unlock new Tab in Laboratory",
			unlocked(){if(hasUpgrade('w',13)) return true}
		},
		15:{
			title: "<img src='js/Lab0.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Wooden kitchen utensils",
			tooltip: "This food is boring, but what if i'll add this and little bit of that?",
			cost: new Decimal(1.5e6),
			description: "Unlock new Tab in Laboratory",
			unlocked(){if(hasUpgrade('w',14)) return true}
		},
		21:{
			title: "<img src='js/Stone.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Wood-based Drill",
			tooltip: "It isn't much, but it's honest work",
			cost: new Decimal(2.5e7),
			description: "Wood Boosts Stone Gain",
			effect(){
				return player.w.points.log(10).max(1)
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
			unlocked(){
				if(hasMilestone('st',0)) return true
			},
		},
		22:{
			title: "<img src='js/Wood.png' style='width:calc(60%);height:calc(60%);margin:10%'></img> Wooden Engineering",
			tooltip: "It moves, but it failed in every automated tasks",
			cost: new Decimal(2.5e10),
			description: "Wood effect will no longer be hardcapped, it will be softcapped instead",
			unlocked(){
				if(hasChallenge('st',21)) return true
			},
		},
	},
	tabFormat:
		["main-display", "resource-display", "prestige-button", "blank", "upgrades"],
	deactivated(){
		if(inChallenge('st', 11)) return true
		if(inChallenge('st', 22)) return true
	},
	canReset(){
		if(inChallenge('st',11)) return false
		return true
	},
})

addLayer("FoodA", {
    name: "", 
	symbol: "<img src='js/Crops.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		wheat: new Decimal(0),
		rice: new Decimal(0),
		corn: new Decimal(0),
		apple: new Decimal(0),
		banana: new Decimal(0),
		grapes: new Decimal(0),
		carrot: new Decimal(0),
		onion: new Decimal(0),
		cabbage: new Decimal(0),
		potato: new Decimal(0),
    }},
	requires: new Decimal(20),
	resource: "Crops",
    baseResource: "Knowledge", 
    baseAmount() {return player.points},
    type: "static", 
    exponent: 0.5,
	gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    color() {
		return "#AD8D22"
	},
	row: 1,
	branches: ['bam','s'],
	layerShown(){
		if (getBuyableAmount('s', 21)>0&&player.switch.treeSelect==1) return true
	},
	canReset(){
		if (player.s.stor.gte(player.s.storMax)) return false
		return true
	},
	clickables:{
		11:{
			title: "Collect Wheat",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.wheat = player.FoodA.wheat.add(1)
			},
		},
		12:{
			title: "Collect Rice",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.rice = player.FoodA.rice.add(1)
			},
		},
		13:{
			title: "Collect Corn",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.corn = player.FoodA.corn.add(1)
			},
		},
		21:{
			title: "Collect Carrots",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.carrot = player.FoodA.carrot.add(1)
			},
		},
		22:{
			title: "Collect Onions",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.onion = player.FoodA.onion.add(1)
			},
		},
		23:{
			title: "Collect Cabbages",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.cabbage = player.FoodA.cabbage.add(1)
			},
		},
		24:{
			title: "Collect Potatos",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.potato = player.FoodA.potato.add(1)
			},
		},
		31:{
			title: "Collect Apples",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.apple = player.FoodA.apple.add(1)
			},
		},
		32:{
			title: "Collect Bananas",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.banana = player.FoodA.banana.add(1)
			},
		},
		33:{
			title: "Collect Grapes",
			canClick(){
				if(player.FoodA.points.gte(1)) return true
			},
			onClick(){
				player.FoodA.points = player.FoodA.points.sub(1)
				player.FoodA.grapes = player.FoodA.grapes.add(1)
			},
		},
	},
	tabFormat:
	["main-display", "resource-display", "prestige-button","blank",["display-text", function(){
		return "<h3>Available space: "+formatWhole(player.s.stor)+"/"+formatWhole(player.s.storMax)+"</h3>"
	}],,"blank",["row", [["clickable", "11"],["clickable", "12"],["clickable", "13"]]], "blank",["display-text", function(){
		return 'You have <h2 style="color:#AD8D22">'+formatWhole(player.FoodA.wheat)+'</h2> Wheat, <h2 style="color:#D3C59F">'+formatWhole(player.FoodA.rice)+'</h2> Rice, <h2 style="color:#F1D84A">'+formatWhole(player.FoodA.corn)+'</h2> Corns'
	}],"blank",["row", [["clickable", "21"],["clickable", "22"],["clickable", "23"],["clickable", "24"]]], "blank",["display-text", function(){
		return 'You have <h2 style="color:#FFA000">'+formatWhole(player.FoodA.carrot)+'</h2> Carrots, <h2 style="color:#A6D71C">'+formatWhole(player.FoodA.onion)+'</h2> Onions, <h2 style="color:#CBE57E">'+formatWhole(player.FoodA.cabbage)+'</h2> Cabbages, <h2 style="color:#987458">'+formatWhole(player.FoodA.potato)+'</h2> Potatos'
	}],"blank",["row", [["clickable", "31"],["clickable", "32"],["clickable", "33"]]],"blank",["display-text", function(){
		return 'You have <h2 style="color:#FF0000">'+formatWhole(player.FoodA.apple)+'</h2> Apples, <h2 style="color:#FFFF00">'+formatWhole(player.FoodA.banana)+'</h2> Bananas, <h2 style="color:#8000FF">'+formatWhole(player.FoodA.grapes)+'</h2> Bunches of Grapes'
	}]],
	resetsNothing() {
		return true
	},
})

addLayer("FoodB", {
    name: "", 
	symbol: "<img src='js/Meat.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 4,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		pig: new Decimal(0),
		cow: new Decimal(0),
		mlk: new Decimal(0),
		chk: new Decimal(0),
		egg: new Decimal(0),
		shp: new Decimal(0),
		wol: new Decimal(0),
		fsh: new Decimal(0),
    }},
	requires: new Decimal(20),
	resource: "Meat",
    baseResource: "Knowledge", 
    baseAmount() {return player.points},
    type: "static", 
    exponent: 0.5,
	gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    color() {
		return "#992A2A"
	},
	row: 1,
	branches: ['w','s'],
	layerShown(){
		if (getBuyableAmount('s', 12)>0&&player.switch.treeSelect==1) return true
	},
	canReset(){
		if (player.s.stor.gte(player.s.storMax)) return false
		return true
	},
	effect(){
		return {
			milk: player.FoodB.cow.times(buyableEffect('s', 12)).div(20000).times(20),
			eggs: player.FoodB.chk.times(buyableEffect('s', 12)).div(40000).times(20),
			wool: player.FoodB.shp.times(buyableEffect('s', 12)).times(20),
		}
	},
	update(diff){
		player.FoodB.mlk = player.FoodB.mlk.add(tmp.FoodB.effect.milk.times(diff))
		player.FoodB.egg = player.FoodB.egg.add(tmp.FoodB.effect.eggs.times(diff))
		player.FoodB.wol = player.FoodB.wol.add(tmp.FoodB.effect.wool.times(diff))
	},
	clickables:{
		11:{
			title: "Hunt the Pig",
			canClick(){
				if(player.FoodB.points.gte(1)) return true
			},
			onClick(){
				player.FoodB.points = player.FoodB.points.sub(1)
				player.FoodB.pig = player.FoodB.pig.add(1)
			},
		},
		12:{
			title: "Hunt the Cow",
			canClick(){
				if(player.FoodB.points.gte(1)) return true
			},
			onClick(){
				player.FoodB.points = player.FoodB.points.sub(1)
				player.FoodB.cow = player.FoodB.cow.add(1)
			},
		},
		13:{
			title: "Hunt the Chicken",
			canClick(){
				if(player.FoodB.points.gte(1)) return true
			},
			onClick(){
				player.FoodB.points = player.FoodB.points.sub(1)
				player.FoodB.chk = player.FoodB.chk.add(1)
			},
		},
		14:{
			title: "Hunt the Sheep",
			canClick(){
				if(player.FoodB.points.gte(1)) return true
			},
			onClick(){
				player.FoodB.points = player.FoodB.points.sub(1)
				player.FoodB.shp = player.FoodB.shp.add(1)
			},
		},
		15:{
			title: "Catch the Fish",
			canClick(){
				if(player.FoodB.points.gte(1)) return true
			},
			onClick(){
				player.FoodB.points = player.FoodB.points.sub(1)
				player.FoodB.fsh = player.FoodB.fsh.add(1)
			},
			unlocked(){
				if (hasUpgrade('s', 25)) return true
			},
		},
	},
	tabFormat:
	["main-display", "resource-display", "prestige-button", "blank",["display-text", function(){
		return "<h3>Available space: "+formatWhole(player.s.stor)+"/"+formatWhole(player.s.storMax)+"</h3>"
	}],"blank", "clickables", "blank",["display-text", function(){
		return 'You have <h2 style="color:#E86C6C">'+formatWhole(player.FoodB.pig)+'</h2> of Pork'
	}],"blank",["display-text", function(){
		return 'You have <h2 style="color:#992A2A">'+formatWhole(player.FoodB.cow)+'</h2> of Beef, which made you <h3 style="color:#DDDDDD">'+format(player.FoodB.mlk)+'</h3>L of Milk   <h3>('+format(tmp.FoodB.effect.milk)+'L/sec)</h3>'
	}],"blank",["display-text", function(){
		return 'You have <h2 style="color:#ffbebe">'+formatWhole(player.FoodB.chk)+'</h2> of Poultry, which made you <h3 style="color:#D8C896">'+format(player.FoodB.egg)+'</h3> Eggs   <h3>('+format(tmp.FoodB.effect.eggs)+'/sec)</h3>'
	}],"blank",["display-text", function(){
		return 'You have <h2 style="color:#CA2D25">'+formatWhole(player.FoodB.shp)+'</h2> of Mutton, which made you <h3 style="color:#ffffff">'+format(player.FoodB.wol)+'</h3> Wool   <h3>('+format(tmp.FoodB.effect.wool)+'/sec)</h3>'
	}],"blank",["display-text", function(){ if (hasUpgrade('s', 25))
		return 'You have <h2 style="color:#67988C">'+formatWhole(player.FoodB.fsh)+'</h2> of Seafood'
	}]],
	resetsNothing() {
		return true
	},
})

addLayer("st", {
    name: "", 
	symbol: "<img src='js/Stone.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 1,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		total: new Decimal(0),
		randRes: new Decimal(0),
		resType: new Decimal(0),
		stShard: new Decimal(0),
		clay: new Decimal(0),
		sand: new Decimal(0),
		chall1Mult: new Decimal(0),
		chall2Mult: new Decimal(0),
		chall3Mult: new Decimal(0),
    }},
	requires: new Decimal(5),
	resource: "Stone",
    baseResource: "Pickaxe Power", 
    baseAmount() {return player.s.PickPow},
    type: "normal", 
    exponent: 0.5,
	gainMult() {
        let mult = new Decimal(1)
		if(hasUpgrade('w',21)) mult = mult.times(upgradeEffect('w',21))
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    color() {
		return "#606A7A"
	},
	glowColor() {
		return "#939DAD"
	},
	row: 2,
	branches: ['w'],
	layerShown(){
		if (getBuyableAmount('s', 22)>0&&player.switch.treeSelect==1) return true
		if(player.switch.treeSelect!=1) return false
	},
	effect(){
		if(inChallenge('st',21)) return{
			st1: new Decimal(1),
			st2: new Decimal(1),
			st3: new Decimal(1),
		}
		return {
			st1: player.st.stShard.add(1).log(2),
			st2: player.st.clay.add(1).log(5),
			st3: player.st.sand.add(1).log(5),
		}
	},
	clickables: {
		11:{
			title: "Mine Stone",
			display(){ return "There is a chance to obtain some resources!"},
			canClick(){
				if(player.st.points.gte(1)) return true
			},
			onClick(){
				player.st.points = player.st.points.sub(1)
				if(player.st.points<=10) player.st.resType = Math.floor(Math.random()*(2-1)+1)
				if(hasChallenge('st',11)) player.st.resType = Math.floor(Math.random()*(3-1)+1)
				if(hasChallenge('st',12)) player.st.resType = Math.floor(Math.random()*(4-1)+1)
				player.st.randRes = Decimal.floor(Math.random()*(11+4)-4)
				if(player.st.resType==1&&player.st.randRes>0)player.st.stShard = player.st.stShard.add((player.st.randRes).add(player.st.points.divide(100)).times(player.st.chall1Mult.add(1)))
				if(player.st.resType==2&&player.st.randRes>0)player.st.clay = player.st.clay.add((player.st.randRes).add(player.st.points.divide(100)).times(player.st.chall2Mult.add(1)))
				if(player.st.resType==3&&player.st.randRes>0)player.st.sand = player.st.sand.add(player.st.randRes).add(player.st.points.divide(100))
			},
			effect(){
				let multi = new Decimal(player.st.randRes)
				return{
					Odlam: multi.add(player.st.points.divide(100)).times(player.st.chall1Mult.add(1)),
					Glina: multi.add(player.st.points.divide(100)).times(player.st.chall2Mult.add(1)),
					Piask: multi.add(player.st.points.divide(100)),
				}
			},
			unlocked(){
				return true
			}
		}
	},
	milestones:{
		0:{
			requirementDescription: "1 Stone Total",
			effectDescription: "You unlock Some new Upgrades in Bamboo and Wood Layer",
			done() { return player.st.total.gte(1) }
		},
		1:{
			requirementDescription: "1000 Stone Total",
			effectDescription: "You unlock new Blueprints!",
			done() { return player.st.total.gte(1000) }
		},
		2:{
			requirementDescription: "15000 Stone Total",
			effectDescription: "You unlock Stone Challenges",
			done() { return player.st.total.gte(15000) }
		},
	},
	challenges: {
		11:{
			name:"Death of Forests",
			challengeDescription: "You can\'t gain any Wood and it\'s upgrades do not work<br>",
			rewardDescription() {
				if (!hasChallenge('st',11)) return "You unlock new Material type in Mines"
				return "Multiplies your Stone Shard gain based on Your challenge points, Currently: "+format(player.st.chall1Mult.add(1))+"x<br>Your Challenge points: "+format(player.st.chall1Mult)
			},
			goalDescription() {return " "+format(new Decimal(10).pow(player.st.chall1Mult.add(9)))+" Knowledge"},
			canComplete(){
				return player.points.gte(1e9)
			},
			onEnter(){
				layerDataReset("bam"),
				layerDataReset("mush"),
				layerDataReset("w"),
				player.points = new Decimal(0)
			},
			onExit(){
				let ChallPoint=player.points.log(10).sub(8).round()
				if(ChallPoint<=player.st.chall1Mult) player.st.chall1Mult = player.st.chall1Mult
				if(ChallPoint>player.st.chall1Mult) player.st.chall1Mult = ChallPoint
			},
			unlocked(){
				return true
			}
		},
		12:{
			name:"Swarm of Bamboo <br>Mites",
			challengeDescription: "You can\'t gain any Bamboo and it\'s upgrades do not work<br>",
			rewardDescription() {
				if (!hasChallenge('st',12)) return "You unlock new Material type in Mines"
				return "Multiplies your Clay gain based on Your challenge points, Currently: "+format(player.st.chall2Mult.add(1))+"x<br>Your Challenge points: "+format(player.st.chall2Mult)
			},
			goalDescription() {return " "+format(new Decimal(10).pow(player.st.chall2Mult.add(6)))+" Knowledge"},
			canComplete(){
				return player.points.gte(1e6)
			},
			onEnter(){
				layerDataReset("bam"),
				layerDataReset("mush"),
				layerDataReset("w"),
				player.points = new Decimal(0)
			},
			onExit(){
				let ChallPoint=player.points.log(10).sub(5).round()
				if(ChallPoint<=player.st.chall2Mult) player.st.chall2Mult = player.st.chall2Mult
				if(ChallPoint>player.st.chall2Mult) player.st.chall2Mult = ChallPoint
			},
			unlocked(){
				if (hasChallenge('st',12)) return true
				if (player.st.total.gte(30000)&&player.st.stShard.gte(1e5)) return true
				return false
			}
		},
		21:{
			name:"Hyper-Erosion",
			challengeDescription: "Stone Materials do nothing<br>",
			rewardDescription() {
				if (!hasChallenge('st',21)) return "You unlock Milestone in Bamboo layer and Upgrade in Wood layer"
				return "Multiplies your Sand gain based on Your challenge points, Currently: "+format(player.st.chall3Mult.add(1))+"x<br>Your Challenge points: "+format(player.st.chall3Mult)
			},
			goalDescription() {return " "+format(new Decimal(10).pow(player.st.chall3Mult.add(15)))+" Knowledge"},
			canComplete(){
				return player.points.gte(1e15)
			},
			onEnter(){
				layerDataReset("bam"),
				layerDataReset("mush"),
				layerDataReset("w"),
				player.points = new Decimal(0)
			},
			onExit(){
				let ChallPoint=player.points.log(10).sub(14).round()
				if(ChallPoint<=player.st.chall3Mult) player.st.chall3Mult = player.st.chall3Mult
				if(ChallPoint>player.st.chall3Mult) player.st.chall3Mult = ChallPoint
			},
			unlocked(){
				if (hasChallenge('st',21)) return true
				if (player.st.total.gte(45000)&&player.st.clay.gte(2.5e5)) return true
				return false
			}
		},
		22:{
			name:"Idiotism",
			challengeDescription: "Row 1 Layers are deactivated, point gain is raised to ^0.75 and Eating Habit Stats are reseted<br>",
			rewardDescription() {
				return "You unlock New Resource Tree"
			},
			goalDescription() {return "10,000,000 Knowledge"},
			canComplete(){
				return player.points.gte(1e7)
			},
			onEnter(){
				layerDataReset("bam"),
				layerDataReset("mush"),
				layerDataReset("w"),
				player.points = new Decimal(0)
				player.s.eat1 = new Decimal(0)
				player.s.eat2 = new Decimal(0)
				player.s.eat3 = new Decimal(0)
				player.s.eat4 = new Decimal(0)
				player.s.eatHap = new Decimal(0)
			},
			unlocked(){
				if (hasChallenge('st',22)) return true
				if (player.st.total.gte(50000)&&player.st.sand.gte(1e5)) return true
				return false
			}
		},
	},
	tabFormat:{
		"Mine":{
			content: ["main-display",["display-text", function(){
				return "Collected total of "+formatWhole(player.st.total)+" Stone"
			}],"blank", ["display-text", function(){
				return "You have "+formatWhole(player.s.PickPow)+" Pickaxe Power"
			}],"blank","prestige-button", "blank", "clickables", "blank",["display-text", function(){ if(player.st.randRes<=0&player.st.randRes>-9&player.st.total!=0)
			return 'You\'ve mined nothing!'
		}],["display-text", function(){ if(player.st.randRes>0&&player.st.resType==1)
			return 'You\'ve mined <h2 style="color:#606A7A">'+format(tmp.st.clickables[11].effect.Odlam)+'</h2> of Stone Shards'
		}],["display-text", function(){ if(player.st.randRes>0&&player.st.resType==2)
			return 'You\'ve mined <h2 style="color:#B0674D">'+format(tmp.st.clickables[11].effect.Glina)+'</h2> of Clay'
		}],["display-text", function(){ if(player.st.randRes>0&&player.st.resType==3)
			return 'You\'ve mined <h2 style="color:#c2b280">'+format(tmp.st.clickables[11].effect.Piask)+'</h2> of Sand Piles'
		}],"blank",["display-text", function(){
			return '<h2 style="color:#606A7A">'+format(player.st.stShard)+'</h2> of Stone Shards, which multiply your Knowledge Gain by <h3>'+format(tmp.st.effect.st1)+'x</h3>'
		}],["display-text", function(){ if(hasChallenge('st',11))
			return '<h2 style="color:#B0674D">'+format(player.st.clay)+'</h2> of Clay, which adds to your Eating habit Bonus by <h3>'+format(tmp.st.effect.st2)+'x</h3>'
		}],["display-text", function(){ if(hasChallenge('st',12))
			return '<h2 style="color:#c2b280">'+format(player.st.sand)+'</h2> of Sand Piles, which multiply your Row 1 Materials Gain by <h3>'+format(tmp.st.effect.st3)+'x</h3>'
		}]]},
		"Milestones":{
			content:["main-display",["display-text", function(){
				return "Collected total of "+formatWhole(player.st.total)+" Stone"
			}],"blank", ["display-text", function(){
				return "You have "+formatWhole(player.s.PickPow)+" Pickaxe Power"
			}],"blank","prestige-button", "blank","milestones"],
			unlocked(){if(hasMilestone('st',0)) return true
			return false}
		},
		"Challenges":{
			content:[["display-text", function(){
				return "<h3 style='color: #FF0000'>Warning!</h3> Challenges causes resets of previous layers!"
			}],"blank" ,["display-text", function(){ 
				if (player.st.challenges[12]==0) return "Next challenge unlocks at 30000 total Stone and 100000 Stone Shards"
				if (player.st.challenges[21]==0) return "Next challenge unlocks at 45000 total Stone and 250000 Clay"
				if (player.st.challenges[22]==0) return "Next challenge unlocks at 50000 total Stone and 100000 Sand"
			}],"blank" ,"challenges"],
			unlocked(){if(hasMilestone('st',2)) return true
			return false}
		},
	},
	resetsNothing() {
		return true
	},
	onPrestige(){
		return player.st.randRes = new Decimal(-10)}
})