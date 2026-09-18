addLayer("c", {
	name: "chips", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() { return {
		unlocked: true,
		points: new Decimal(0),
	}},
	color: "#623412",
	requires: new Decimal(10), // Can be a function that takes requirement increases into account
	resource: "chips", // Name of prestige currency
	baseResource: "cookies", // Name of resource prestige is based on
	baseAmount() { return player.points }, // Get the current amount of baseResource
	type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent: 0.5, // Prestige currency exponent
	gainMult() { // Calculate the multiplier for main currency from bonuses
		let mult = new Decimal(1);
		
		if(player.m.unlocked) mult = mult.times(tmp.m.effect);
		if(hasUpgrade("c", 22)) mult = mult.times(upgradeEffect("c", 22));
		
		return mult;
	},
	gainExp() { // Calculate the exponent on main currency from bonuses
		let exp = new Decimal(1);
		
		if(hasUpgrade("c", 21)) exp = exp.times(1.20);
		
		return exp;
	},
	row: 0, // Row the layer is in on the tree (0 is the first row)
	hotkeys: [
		{key: "c", description: "C: Reset for chocolate chips", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
	],
	layerShown(){return true},
	upgrades: {
		rows: 2,
		cols: 4,
		11: {
			title: "Oven",
			description: "Buy an oven with a chip, what a steal.",
			cost() { return new Decimal(1) },
		},
		12: {
			title: "Sugar Rush",
			description: "Bake faster with sugar, don't ask about the oven.",
			cost() { return new Decimal(1) },
			effect() {
				let eff = player.c.points.plus(1).pow(2/5);
				
				if(hasUpgrade("c", 14)) eff = eff.pow(1.5);
				
				return eff;
			},
			unlocked() { return hasUpgrade("c", 11) },
			effectDisplay() { return format(tmp.c.upgrades[12].effect)+"x" },
		},
		13: {
			title: "Motivation",
			description: "Seeing all those cookies motivates you.",
			cost() { return new Decimal(4) },
			effect() {
				let eff = player.points.plus(1).log10().plus(1);
				return eff;
			},
			unlocked() { return hasUpgrade("c", 12) },
			effectDisplay() { return format(tmp.c.upgrades[13].effect)+"x" },
		},
		14: {
			title: "Sugarier Chips",
			description: "Sugar rush harder. Exactly 50% harder.",
			cost() { return new Decimal(10) },
			unlocked() { return hasUpgrade("c", 13) },
			effectDisplay() { return "Sugar Rush^1.50" },
		},
		21: {
			title: "Better Searching",
			description: "Better cookie to chip conversion.",
			cost() { return new Decimal(100) },
			unlocked() { return hasUpgrade("c", 14)/*&&hasUpgrade("m", 13)*/ },
			effectDisplay() { return "Chips^1.20" },
		},
		22: {
			title: "Rushed Searching",
			description: "Cookies boost chip gain.",
			cost() { return new Decimal(400) },
			effect() {
				let eff = player.points.plus(1).log10().plus(1).pow(0.5);
				return eff;
			},
			unlocked() { return hasUpgrade("c", 21) },
			effectDisplay() { return format(tmp.c.upgrades[22].effect)+"x" },
		},
	},
});

addLayer("g", {
	name: "grand",
	symbol: "G",
	position: 0,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		dough: new Decimal(0),
		total: new Decimal(0),
		pseudoUpgs: [],
		first: 0,
		auto: false,
	}},
	color: "#add8e6",
	requires() { return player.c.unlocked ? new Decimal(1/0):new Decimal(600) },
	resource: "grandmas",
	baseResource: "cookies",
	baseAmount() { return player.points },
	type: "static",
	branches: ["c"],
	row: 1,
	exponent() { return 1.2 },
	base() { return 3 },
	gainMult() {
		let mult = new Decimal(1);
		
		//if(hasUpgrade("m", 12)) mult = mult.div(upgradeEffect("m", 12));
		
		return mult;
	},
	canBuyMax() { return false },
	hotkeys: [
		{key: "g", description: "Press G to perform a grandma reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
	layerShown() { return player.c.unlocked },
	automate() {},
	resetsNothing() { return false },
	addToBase() {
		let base = new Decimal(0);
		return base;
	},
	multiplyBase() {
		let base = new Decimal(1);
		return base;
	},
	exponentiateBase() {
		let base = new Decimal(1);
		return base;
	},
	effectBase() {
		let base = new Decimal(2);
		
		// Addition
		//base = base.plus(tmp.m.addToBase);
		
		// Multiplication
		//base = base.times(tmp.m.multiplyBase);
		
		// Exponentiation
		//base = base.pow(tmp.m.exponentiateBase);
		
		// Tetration
		// JK
		
		return base;
	},
	update(diff) {
		if (player.g.unlocked) player.g.dough = player.g.dough.plus(tmp.g.effect.times(diff));
	},
	doughExp() {
		let exp = new Decimal(1);
		
		
		
		return exp;
	},
	doughEff() {
		return player.g.dough.plus(1).pow(this.doughExp).log10().times(3);
	},
	effect() {
		return Decimal.pow(tmp.g.effectBase, player.g.points);
	},
	effectDescription() {
		return "which are generating "+format(tmp.g.effect)+" Dough/sec";
	},
	doReset(resettingLayer) {
		let keep = [];
		if (layers[resettingLayer].row > this.row) layerDataReset("g", keep);
	},
	tabFormat: [
		"main-display",
		"prestige-button", "blank",
		[
			"display-text",
			function() { 
				return 'You have ' + format(player.g.dough) + ' Dough';
			},
			{},
		], "blank", "blank", "buyables",
		"blank", 
		"upgrades",
	],
	upgrades: {
		rows: 1,
		cols: 1,
	},
	buyables: {
		rows: 1,
		cols: 1,
		11: {
			title: "Plain Cookie",
        		cost(x) { return new Decimal(1).mul(x) },
        		display() { return "Tastes bland, boosts cookie production." },
        		canAfford() { return player[this.layer].points.gte(this.cost()) },
       			buy() {
            			player[this.layer].points = player[this.layer].points.sub(this.cost());
            			setBuyableAmount(this.layer, this.id, getBuyableAmt(this.layer, this.id).add(1));
        		},
    		},
	},
});

addLayer("m", {
	name: "mice",
	symbol: "M",
	position: 1,
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		pseudoUpgs: [],
		first: 0,
		auto: false,
	}},
	color: "#e0e0e0",
	requires: new Decimal(50),
	resource: "mice",
	baseResource: "chips",
	baseAmount() { return player.c.points },
	type: "static",
	branches: ["c"],
	row: 1,
	exponent() { return 1.3 },
	base() { return 4 },
	gainMult() {
		let mult = new Decimal(1);
		
		if(hasUpgrade("m", 12)) mult = mult.div(upgradeEffect("m", 12));
		
		return mult;
	},
	canBuyMax() { return false },
	hotkeys: [
		{key: "m", description: "Press M to perform a booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
	layerShown() { return player.c.unlocked },
	automate() {},
	resetsNothing() { return false },
	addToBase() {
		let base = new Decimal(0);
		if(hasUpgrade("m", 13)) base = base.plus(upgradeEffect("m", 13));
		return base;
	},
	multiplyBase() {
		let base = new Decimal(1);
		return base;
	},
	exponentiateBase() {
		let base = new Decimal(1);
		return base;
	},
	effectBase() {
		let base = new Decimal(2);
		
		// Addition
		base = base.plus(tmp.m.addToBase);
		
		// Multiplication
		//base = base.times(tmp.m.multiplyBase);
		
		// Exponentiation
		//base = base.pow(tmp.m.exponentiateBase);
		
		// Tetration
		// JK
		
		return base;
	},
	effect() {
		return Decimal.pow(tmp.m.effectBase, player.m.points);
	},
	effectDescription() {
		return "which are boosting Chip gain by "+format(tmp.m.effect)+"x";
	},
	doReset(resettingLayer) {
		let keep = [];
		if (layers[resettingLayer].row > this.row) layerDataReset("m", keep);
	},
	upgrades: {
		rows: 1,
		cols: 4,
		11: {
			title: "Cookie Clickers",
			description: "Best mice now boost cookie generation.",
			cost() { return new Decimal(1) },
			effect() {
				let eff = player.m.best.plus(1).log10().plus(1).pow(3);
				
				return eff;
			},
			effectDisplay() { return format(tmp.m.upgrades[11].effect)+"x" },
		},
		12: {
			title: "Cookie Cursors",
			description: "Cookies divide mouse price.",
			cost() { return new Decimal(3) },
			effect() {
				let eff = player.points.plus(1).log10().plus(1).log10().plus(1);
				
				return eff;
			},
			unlocked() { return hasUpgrade("m", 11) },
			effectDisplay() { return format(tmp.m.upgrades[12].effect)+"x" },
		},
		13: {
			title: "Pre-Cursors",
			description: "Mice add to their base.",
			effect() {
				let eff = player.m.points.times(1/25);
				return eff;
			},
			cost() { return new Decimal(4) },
			unlocked() { return hasUpgrade("m", 12) },
			effectDisplay() { return format(tmp.m.upgrades[13].effect)+"x" },
		},
		14: {
			title: "Post-Cursors",
			description: "New chip upgrades.",
			cost() { return new Decimal(5) },
			unlocked() { return hasUpgrade("m", 13) },
		},
	},
});







/*11: {
	title: "Primary Space Building",
	costExp() { 
		let exp = 1.35;
		if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
		return exp;
	},
	cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
		let base = tmp.s.buildingBaseCosts[this.id];
		if (x.eq(0)) return new Decimal(0);
		return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
    },
	freeLevels() {
		let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
		if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[11+1]||0);
		return levels;
	},
	effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
		let eff = Decimal.pow(x.plus(1).plus(tmp.s.freeSpaceBuildings).times(tmp.s.buildingPower), player.s.points.sqrt()).times(x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).max(1).times(4)).max(1);
		if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 21));
		return eff;
    },
	display() { // Everything else displayed in the buyable button after the title
		let data = tmp[this.layer].buyables[this.id]
		return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x"+("*"+format(tmp.s.buildScalePower))+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
		Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
		"+(tmp.nerdMode?("Formula: level^sqrt(spaceEnergy)*level*4"):(" Space Energy boosts Point gain & Prestige Point gain by " + format(data.effect) +"x"))
    },
    unlocked() { return player[this.layer].unlocked }, 
    canAfford() {
		return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
	},
	buy() { 
		cost = tmp[this.layer].buyables[this.id].cost
		player.g.power = player.g.power.sub(cost)
		player.s.spent = player.s.spent.plus(1);
		player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
	},
	target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
	buyMax() {
		if (!this.canAfford() || !this.unlocked()) return;
		let target = this.target();
		player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
		player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
	}, 
	style: {'height':'100px'},
	sellOne() {
		let amount = getBuyableAmount(this.layer, this.id)
		if (!hasMilestone("q", 5) || amount.lt(1)) return;
		setBuyableAmount(this.layer, this.id, amount.sub(1))
		player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
	},
	canSellOne() { return hasMilestone("q", 5) },
	autoed() { return player.s.autoBld && hasMilestone("q", 7) },
},*/
