addLayer('m', {
	name: 'multiplier', // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: 'M', // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		resets: new Decimal(0),
		achs: {
			21: false,
		},
	} },
	color: '#495FBA',
	requires() { // Can be a function that takes requirement increases into account // its now
		cost = new Decimal(100);
		return cost;
	},
	onPrestige() {
		player[this.layer].resets = player[this.layer].resets.add(1);
	},
	doReset(reset) {
		keep = [];
		if (layers[reset].row > this.row) layerDataReset('m', keep);
	},
	canBuyMax() { return false },
	tabFormat: defaultTab('m'),
	resource: 'multipliers', // Name of prestige currency
	baseResource: 'egg points', // Name of resource prestige is based on
	baseAmount() { return player.e.points }, // Get the current amount of baseResource
	type: 'static', // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent() {
		exp = 1.3;
		return exp;
	},
	base() { return 5 },
	row: 1, // Row the layer is in on the tree (0 is the first row)
	layerShown() { return player.e.unlocked },
	gainMult() { // Calculate the multiplier for main currency from bonuses
		mult = new Decimal(1);
		return mult;
	},
	gainExp() { // Calculate the exponent on main currency from bonuses
		return new Decimal(1);
	},
	effBase() {
		base = new Decimal(2);
		if (hasUpgrade('m', 13)) base = base.add(upgradeEffect('m', 13));
		return base;
	},
	effect() {
		mult = tmp.m.effBase.pow(player.m.points);
		return mult;
	},
	effectDescription() {
		return `which are multiplying point gain by ${format(tmp[this.layer].effect)}x`;
	},
	hotkeys: [
		{ key: 'm', description: 'M: Reset for multipliers', onPress() { if (canReset(this.layer)) doReset(this.layer) }, unlocked() { return player[this.layer].unlocked } },
	],
	milestones: {
		0: {
			requirementDescription: '3 multipliers',
			effectDescription: 'Keep egg upgrades on multiplier reset',
			done() { return player.m.points.gte(3) }
		},
	},
	upgrades: {
		11: {
			title: 'Egg Motivation',
			description: 'Total multipliers boost egg point production at a reduced rate',
			cost: new Decimal(3),
			effect() {
				return player[this.layer].total.add(1).pow(0.35);
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x' },
		},
		12: {
			title: 'Egg Create',
			description: 'Multipliers boost chicken effect',
			cost: new Decimal(5),
			unlocked() { return hasUpgrade('m', 11) },
			effect() {
				return player[this.layer].points.add(1).log(15).add(1);
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x' },
		},
		13: {
			title: 'Boost Multiply',
			description: 'Egg points boost multiplier base',
			cost: new Decimal(6),
			unlocked() { return hasUpgrade('m', 12) },
			effect() {
				return player.e.points.add(30).log(10).add(1).log(20).add(1).log(50);
			},
			effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}` },
		},
		14: {
			title: 'Achievement Boost',
			description: 'Number of achievements boosts egg point gain',
			cost: new Decimal(8),
			unlocked() {
				return hasUpgrade('m', 13);
			},
			effect() {
				eff = player.a.points.add(1).pow(0.65);
				return eff;
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x'; }, // Add formatting to the effect
			onPurchase() {
				player[this.layer].achs[21] = true;
			}
		},
		15: {
			title: 'Additional Points',
			description: 'Point and egg point gain ^1.1',
			cost: new Decimal(9),
			unlocked() {
				return hasUpgrade('m', 14);
			},
		},
	},
});