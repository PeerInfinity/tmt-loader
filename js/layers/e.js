// =======
// LAYER 1
// =======

// EGG POINTS

addLayer('e', {
	name: 'egg', // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: 'E', // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() { return {
		unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
		resets: new Decimal(0),
		achs: {
			14: false,
		},
	} },
	color: '#F2AD18',
	requires() { // Can be a function that takes requirement increases into account // its now
		cost = new Decimal(5);
		if (hasUpgrade('c', 12)) cost = new Decimal(2);
		return cost;
	},
	onPrestige() {
		player[this.layer].unlocked = true;
		player[this.layer].resets = player[this.layer].resets.add(1);
	},
	doReset(reset) {
		keep = [];
		if (hasMilestone('m', 0) && reset == 'm') keep.push('upgrades');
		if (hasMilestone('c', 0) && reset == 'c') keep.push('upgrades');
		if (layers[reset].row > this.row) layerDataReset('e', keep);
	},
	tabFormat: defaultTab('e'),
	resource: 'egg points', // Name of prestige currency
	baseResource: 'points', // Name of resource prestige is based on
	baseAmount() { return player.points }, // Get the current amount of baseResource
	type: 'normal', // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent() { return 0.5 },
	row: 0, // Row the layer is in on the tree (0 is the first row)
	layerShown() { return true; },
	branches: ['m', 'c'],
	passiveGeneration() { return hasMilestone('c', 1) ? (hasUpgrade('c', 15) ? 10 : 1) : 0; },
	gainMult() { // Calculate the multiplier for main currency from bonuses
		mult = new Decimal(1);

		if (player.c.unlocked) mult = mult.times(tmp.c.effect); // Multiplier Bonus
		if (hasUpgrade('m', 11)) mult = mult.times(upgradeEffect('m', 11)); // Egg Motivation

		if (hasUpgrade('e', 22)) mult = mult.times(upgradeEffect('e', 22)); // Point Softening
		if (hasUpgrade('m', 14)) mult = mult.times(upgradeEffect('m', 14)); // Achievement Boost

		return mult;
	},
	gainExp() { // Calculate the exponent on main currency from bonuses
		exp = new Decimal(1);
		if (hasUpgrade('m', 15)) exp = exp.times(1.1);
		return exp;
	},
	hotkeys: [
		{ key: 'ctrl+s', description: 'Ctrl+S: Save the game', unlocked: true, onPress() {
			save(true);
		} },
		{ key: '-', description: '-: Toggle info mode', unlocked: true, onPress() {
			player.info = !player.info;
		} },
		{ key: 'e', description: 'E: Reset for egg points', onPress() {
			if (canReset(this.layer)) doReset(this.layer);
		} },
	],
	upgrades: {
		11: {
			title: 'Start',
			description: 'Get 1 point per second',
			cost: new Decimal(1),
		},
		12: {
			title: 'Egg Power',
			description: 'Gain more points based on egg points',
			cost: new Decimal(2),
			unlocked() {
				return hasUpgrade('e', 11);
			},
			effect() {
				eff = player.e.points.add(1).pow(0.5);

				eff = softcap(eff, new Decimal(25000), 0.5);

				if (hasUpgrade('c', 14)) eff = eff.times(upgradeEffect('c', 14)); // Multichicken

				return eff;
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x'; }, // Add formatting to the effect
		},
		13: {
			title: 'Triple Generators',
			description: 'Get 3x more points per second',
			cost: new Decimal(10),
			unlocked() {
				return hasUpgrade('e', 11);
			},
		},
		21: {
			title: 'Self-Synergy',
			description: 'Gain more points based on points',
			cost: new Decimal(15),
			unlocked() {
				return hasUpgrade('e', 13);
			},
			effect() {
				return player.points.add(1).pow(0.25);
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x'; }, // Add formatting to the effect
		},
		22: {
			title: 'Point Softening',
			description: 'Gain more egg points based on points',
			cost: new Decimal(50),
			unlocked() {
				return hasUpgrade('e', 12) && hasUpgrade('e', 21);
			},
			effect() {
				return player.points.add(1).pow(0.15);
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x'; }, // Add formatting to the effect
		},
		23: {
			title: 'Secondary Power',
			description: 'Gain more points based amount of upgrades from all layers bought',
			cost: new Decimal(150),
			unlocked() {
				return hasUpgrade('e', 22);
			},
			effect() {
				return Math.pow(getUps(), 0.75);
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + 'x'; }, // Add formatting to the effect
			onPurchase() {
				player[this.layer].achs[14] = true;
			}
		},
	},
});