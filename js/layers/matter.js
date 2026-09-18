function matterGain(matterType) {
	mGain = new Decimal(0);
	if (hasUpgrade("HC", 41)) mGain = mGain.add(1);

	if (matterType === 1) {
		// Matter
		if (!hasUpgrade("HC", 52)) {
			mGain = mGain.div(tmp.AM.buyables[13].effect);
			mGain = mGain.div(tmp.AM.effect);
		}
		if (hasUpgrade("M", 11)) mGain = mGain.times(2);
		mGain = mGain.times(tmp.M.buyables[11].effect);
		if (hasUpgrade("M", 21)) {
			if (hasMilestone("M", 0)) mGain = mGain.times(new Decimal(4).pow(0.7));
			if (hasMilestone("M", 1)) mGain = mGain.times(player.M.points.div(5).add(1).pow(0.2));
			if (hasMilestone("M", 2)) mGain = mGain.times(new Decimal(2).pow(0.7));
		}
		if (hasUpgrade("M", 22)) mGain = mGain.times(4);
		mGain = mGain.times(tmp.M.buyables[12].effect);
	}

	if (matterType === 2) {
		// Antimatter
		if (!hasUpgrade("HC", 51)) {
			mGain = mGain.div(tmp.M.effect);
			mGain = mGain.div(tmp.M.buyables[11].effect);
			mGain = mGain.div(tmp.M.buyables[12].effect);
			if (hasMilestone("M", 0)) mGain = mGain.div(4);
			if (hasMilestone("M", 1)) mGain = mGain.div(player.AM.points.div(5).add(1));
			if (hasMilestone("M", 2)) mGain = mGain.div(2);
		}
		if (hasUpgrade("AM", 11)) mGain = mGain.times(tmp.AM.upgrades[11].effect);
		mGain = mGain.times(tmp.AM.buyables[11].effect);
		mGain = mGain.times(tmp.AM.buyables[12].effect);
		if (hasUpgrade("AM", 24)) mGain = mGain.times(10);
		if (hasUpgrade("AM", 14)) mGain = mGain.pow(1.2);
	}

	if (matterType === 3) {
		// Dark Matter
		mGain = mGain.div(tmp.EM.effect);
		mGain = mGain.div(tmp.HP.effect);
		mGain = mGain.times(tmp.BH.effect);
		mGain = mGain.times(tmp.BH.buyables[12].effect);
		if (hasUpgrade("DM", 11)) mGain = mGain.times(1.5);
		if (hasUpgrade("DM", 12)) mGain = mGain.times(tmp.DM.upgrades[12].effect);
		if (hasUpgrade("DM", 21)) mGain = mGain.times(tmp.DM.upgrades[21].effect);
		if (hasUpgrade("DM", 11)) mGain = mGain.pow(1.1);
		if (hasMilestone("BH", 1)) {
			if (hasUpgrade("DM", 11)) mGain = mGain.times(1.5);
			if (hasUpgrade("DM", 11)) mGain = mGain.pow(1.1);
		}
	}

	if (matterType === 4) {
		// Exotic Matter
		if (hasUpgrade("EM", 11)) mGain = mGain.times(3);
		if (hasUpgrade("EM", 14)) mGain = mGain.times(tmp.EM.upgrades[14].effect);
		if (hasUpgrade("EM", 23)) mGain = mGain.times(tmp.EM.upgrades[23].effect);
		mGain = mGain.pow(tmp.UnsM.effect);
		mGain = mGain.div(tmp.DM.effect);
	}

	// Global
	mGain = mGain.times(tmp.UMF.effect);

	return mGain;
}

function retryMatters() {
	if (
		confirm(
			"Are you sure that you want to reset your matters? This will reset everything related to matters except the completion status of paths (progress within path is still lost)!"
		)
	) {
		layerDataReset("M");
		layerDataReset("AM");
		layerDataReset("DM");
		layerDataReset("EM");
	}
}

addLayer("M", {
	name: "matter",
	resource: "Matter",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	symbol: "M",
	image: "./resources/icons/matter.png",
	row: 3,
	update(diff) {
		if (hasUpgrade("HC", 41)) player.M.points = player.M.points.add(matterGain(1).times(diff));
	},
	effect() {
		let effect = player.M.points.add(1).pow(0.5);
		if (hasUpgrade("AM", 12)) effect = effect.pow(0.6);
		if (hasUpgrade("M", 13)) effect = effect.times(1.2);
		if (hasUpgrade("HC", 51)) effect = effect.pow(0);
		return effect;
	},
	effect2() {
		let effect = player.M.points.div(10000).add(1).pow(0.085);
		if (hasUpgrade("M", 13)) effect = effect.times(1.2);
		return effect;
	},
	effectDescription() {
		return (
			"reducing Antimatter gain /" +
			format(this.effect()) +
			", and boosting Cash, Rebirth Points, Super Rebirth Points, Power and Hyper Essence gain by &times;" +
			format(this.effect2()) +
			"<br>(" +
			format(matterGain(1)) +
			"/sec)"
		);
	},
	tabFormat: ["main-display", "buyables", "blank", "milestones", "upgrades"],
	color: "#2dc0d6",
	nodeStyle: {
		"background-color": "rgb(104, 104, 104)",
	},
	previousTab: "HC",
	branches: ["HC"],
	upgrades: {
		11: {
			title: "Matter Dimensions",
			cost: new Decimal(5),
			description: "Double Matter gain",
		},
		12: {
			title: "Anti-Antimatter",
			cost: new Decimal(10),
			description: "Reduce Antimatter's nerf by /3",
		},
		13: {
			title: '"Normal Upgrade"',
			cost: new Decimal(15),
			description: "Multiply both of Matter's effects by &times;1.2",
		},
		14: {
			title: "Proton",
			cost: new Decimal(60),
			description: "Increase Quarks effect",
			tooltip: "x/10 &#8594; x/3",
		},
		21: {
			title: "Nuclear Fission",
			cost: new Decimal(500),
			description: "Milestones now also multiply Matter gain at a reduced rate",
			effect() {
				let mGain = new Decimal(1);
				if (hasMilestone("M", 0)) mGain = mGain.times(new Decimal(4).pow(0.7));
				if (hasMilestone("M", 1)) mGain = mGain.times(player.M.points.div(5).add(1).pow(0.2));
				if (hasMilestone("M", 2)) mGain = mGain.times(new Decimal(2).pow(0.7));
				return mGain;
			},
			effectDisplay() {
				return "&times;" + format(this.effect());
			},
		},
		22: {
			title: "Neutron",
			cost: new Decimal(3000),
			description: "Quadruple Matter gain",
		},
		23: {
			title: "Up and Down",
			cost: new Decimal(15000),
			description: "Square Quark effect",
		},
		24: {
			title: "Efficient Compression",
			cost: new Decimal(5000000000),
			description: "Reduce both Quark and Atom cost scalings",
			tooltip: "-0.1 to exponent",
		},
	},
	buyables: {
		11: {
			cost(x) {
				let expo = new Decimal(1.16);
				if (hasUpgrade("M", 24)) expo = expo.sub(0.1);
				return new Decimal(5).times(new Decimal(expo).pow(x));
			},
			title: "Create a Quark",
			tooltip: "Base effect: x/10 + 1<br>Base cost: 5&times;1.16<sup>x</sup>",
			display() {
				return (
					"Quarks multiply matter and divide antimatter gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>You have " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					" quarks<br>Currently: &times;/&divide;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return true;
			},
			effect(x) {
				let divisor = new Decimal(10);
				if (hasUpgrade("M", 14)) divisor = divisor.div(3.3333);
				let base = new Decimal(x).div(divisor).add(1);
				if (hasUpgrade("M", 23)) base = base.pow(2);
				return base;
			},
		},
		12: {
			cost(x) {
				let expo = new Decimal(1.2);
				if (hasUpgrade("M", 24)) expo = expo.sub(0.1);
				return new Decimal(1000000).times(new Decimal(expo).pow(x));
			},
			title: "Create an Atom",
			tooltip: "Base effect: (x + 1)<sup>1.6</sup><br>Base cost: 5,000,000&times;1.2<sup>x</sup>",
			display() {
				return (
					"Atoms multiply matter and divide antimatter gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>You have " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					" atomsCurrently: &times;/&divide;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return true;
			},
			effect(x) {
				let divisor = new Decimal(1);
				let base = new Decimal(x).div(divisor).add(1).pow(1.6);
				return base;
			},
		},
	},
	milestones: {
		0: {
			requirementDescription: "100 Matter",
			effectDescription: "Divide Antimatter gain by 4",
			done() {
				return player.M.points.gte(100);
			},
		},
		1: {
			requirementDescription: "1000 Matter",
			effectDescription: "Divide Antimatter gain based on Antimatter",
			done() {
				return player.M.points.gte(1000);
			},
			tooltip: "AM/5 + 1",
		},
		2: {
			requirementDescription: "100000 Matter",
			effectDescription: "Divide Antimatter gain by 2",
			done() {
				return player.M.points.gte(100000);
			},
		},
	},
	layerShown() {
		return hasAchievement("A", 101);
	},
});

addLayer("AM", {
	name: "antimatter",
	resource: "Antimatter",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	symbol: "AM",
	image: "./resources/icons/antimatter.png",
	update(diff) {
		if (hasUpgrade("HC", 41)) player.AM.points = player.AM.points.add(matterGain(2).times(diff));
	},
	effect() {
		let effect = player.AM.points.add(1).pow(0.5);
		if (hasUpgrade("M", 12)) effect = effect.div(3);
		if (hasUpgrade("HC", 52)) effect = effect.pow(0);
		return effect;
	},
	effect2() {
		let effect = player.AM.points.div(10000).add(1).pow(0.07);
		if (hasUpgrade("AM", 13)) effect = effect.pow(1.2);
		return effect;
	},
	effectDescription() {
		return (
			"reducing Matter gain /" +
			format(this.effect()) +
			", and boosting Cash, Rebirth Points, Super Rebirth Points, Power and Hyper Essence gain by &times;" +
			format(this.effect2()) +
			"<br>(" +
			format(matterGain(2)) +
			"/sec)"
		);
	},
	tabFormat: ["main-display", "buyables", "upgrades"],
	color: "#d6442d",
	nodeStyle: {
		"background-color": "black",
		"background-position-x": "9px",
		"background-position-y": "3px",
		border: "white 2px solid",
	},
	branches: ["HC"],
	layerShown() {
		return hasAchievement("A", 101);
	},
	upgrades: {
		11: {
			title: "X Dimension",
			cost: new Decimal(6),
			description: "Multiply Antimatter gain based on Dark Matter and Exotic Matter",
			tooltip: "log<sub>1.5</sub>(DM + EM + 1.5)",
			effect() {
				return player.DM.points.add(player.EM.points.add(1.5)).max(1).log(1.5);
			},
			effectDisplay() {
				return "&times;" + format(this.effect());
			},
		},
		12: {
			title: "Y Dimension",
			cost: new Decimal(20),
			description: "Reduce Matter's division to Antimatter",
			tooltip: "^0.5 &#8594; ^0.3",
		},
		13: {
			title: "Z Dimension",
			cost: new Decimal(35),
			description: "Raise Antimatter's second effect ^1.2",
		},
		14: {
			title: "W Dimension",
			cost: new Decimal(50),
			description: "Raise Antimatter gain ^1.2",
		},
		21: {
			title: "Infinity?",
			cost: new Decimal(100),
			description: "Unlock some Antimatter Buyables",
		},
		22: {
			title: "Discount",
			cost: new Decimal(10000),
			description: "Slow the cost scaling of Antimatter buyables",
			tooltip: "-0.05 to exponent",
		},
		23: {
			title: "T Dimension?",
			cost: new Decimal(1000000),
			description: "Boost the effect of Antimatter Galaxy",
			tooltip: "+0.1 to base",
		},
		24: {
			title: "S Dimension?",
			cost: new Decimal(100000000),
			description: "Multiply Antimatter gain by 10&times;",
		},
	},
	buyables: {
		11: {
			cost(x) {
				let expo = new Decimal(1.1);
				if (hasUpgrade("AM", 22)) expo = expo.sub(0.05);
				return new Decimal(100).pow(new Decimal(expo).pow(x));
			},
			title: "Antimatter Galaxy",
			tooltip: "Base effect: 1.25<sup>x</sup><br>Base cost: 100<sup>(1.1<sup>x</sup>)</sup>",
			display() {
				return (
					"Multiply Antimatter gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("AM", 21);
			},
			effect(x) {
				let base = new Decimal(1.25);
				if (hasUpgrade("AM", 23)) base = base.add(0.1);
				return new Decimal(base).pow(x);
			},
		},
		12: {
			cost(x) {
				let expo = new Decimal(1.15);
				if (hasUpgrade("AM", 22)) expo = expo.sub(0.05);
				return new Decimal(200).pow(new Decimal(expo).pow(x));
			},
			title: "Replicanti Galaxy?",
			tooltip: "Base effect: 1.15<sup>x</sup><br>Base cost: 200<sup>(1.15<sup>x</sup>)</sup>",
			display() {
				return (
					"Multiply Antimatter gain, again<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("AM", 21);
			},
			effect(x) {
				return new Decimal(1.15).pow(x);
			},
		},
		13: {
			cost(x) {
				let expo = new Decimal(1.2);
				if (hasUpgrade("AM", 22)) expo = expo.sub(0.05);
				return new Decimal(500).pow(new Decimal(expo).pow(x));
			},
			title: "Tachyon Galaxy??",
			tooltip: "Base effect: 1.2<sup>x</sup><br>Base cost: 500<sup>(1.2<sup>x</sup>)</sup>",
			display() {
				return (
					"Divide Matter gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: /" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("AM", 21);
			},
			effect(x) {
				return new Decimal(1.2).pow(x);
			},
		},
	},
});

addLayer("DM", {
	name: "dark-matter",
	resource: "Dark Matter",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	symbol: "DM",
	image: "./resources/icons/darkmatter.png",
	update(diff) {
		if (hasUpgrade("HC", 41)) player.DM.points = player.DM.points.add(matterGain(3).times(diff));
	},
	effect() {
		let base = player.DM.points.add(1).pow(0.5);
		if (hasUpgrade("DM", 13)) base = base.pow(2);
		if (hasMilestone("BH", 1) && hasUpgrade("DM", 13)) base = base.pow(2);
		if (hasUpgrade("EM", 12)) base = base.pow(0.6);
		if (hasUpgrade("HC", 53)) base = base.pow(0);
		return base;
	},
	effect2() {
		let effect = player.DM.points.div(100).add(1).max(1).pow(0.001);
		if (hasUpgrade("DM", 13)) effect = effect.pow(2);
		if (hasMilestone("BH", 1) && hasUpgrade("DM", 13)) effect = effect.pow(2);
		return effect;
	},
	effectDescription() {
		return (
			"reducing Exotic Matter gain /" +
			format(this.effect()) +
			", and boosting Cash, Rebirth Points, Super Rebirth Points, Power and Hyper Essence gain by &times;" +
			format(this.effect2()) +
			"<br>(" +
			format(matterGain(3)) +
			"/sec)"
		);
	},
	tabFormat: {
		"Dark Matter": {
			content: ["main-display", "clickables", "buyables", "upgrades"],
		},
		"Black Hole": {
			content: [["layer-proxy", ["BH", ["main-display", "buyables", "milestones"]]]],
			unlocked() {
				return hasUpgrade("DM", 22);
			},
		},
	},
	color: "#303030",
	branches: ["HC"],
	layerShown() {
		return hasAchievement("A", 101);
	},
	upgrades: {
		11: {
			title: "Void Matter",
			description: "Multiply Dark Matter gain 1.5&times; and raise it ^1.1",
			cost: new Decimal(8),
		},
		12: {
			title: "Growing Void",
			description: "Dark Matter boosts it's own gain",
			cost: new Decimal(20),
			tooltip: "log<sub>5</sub>(DM&times;2 + 5)",
			effect() {
				let base = player.DM.points.times(2).add(5).max(1).log(5);
				if (hasMilestone("BH", 1)) base = base.pow(2);
				return base;
			},
			effectDisplay() {
				return "x" + format(this.effect());
			},
		},
		13: {
			title: "Abyssal Gifts",
			description: "Square both of Dark Matter's effects",
			cost: new Decimal(35),
		},
		21: {
			title: "Inflation in Hell",
			description: "Boost Dark Matter gain based on Cash",
			cost: new Decimal(50),
			tooltip: "log<sub>2</sub>($ +10)<sup>0.1</sup>",
			effect() {
				let base = player.points.add(10).max(1).log(10).max(1).pow(0.1);
				if (hasMilestone("BH", 1)) base = base.pow(2);
				return base;
			},
			effectDisplay() {
				return "x" + format(this.effect());
			},
		},
		22: {
			title: "Black Hole",
			description: "Unlock the Black Hole",
			cost: new Decimal(100),
		},
		23: {
			title: "Death Goals",
			description: "Unlock Black Hole milestones",
			cost: new Decimal(1e12),
		},
	},
	buyables: {
		11: {
			cost(x) {
				let y = x;
				if (hasMilestone("BH", 0)) y = y.div(2);
				let expo = new Decimal(2);
				if (y.gte(400)) y = y.div(400).pow(2).times(400);
				return new Decimal(100).times(new Decimal(expo).pow(y));
			},
			title: "Anti Hawking Radiation",
			tooltip: "Base effect: 1.65<sup>x</sup><br>Base cost: 100&times;(2<sup>x</sup>)",
			display() {
				return (
					"Multiply Black Hole's gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("DM", 22);
			},
			effect(x) {
				let base = new Decimal(1.65);
				return new Decimal(base).pow(x);
			},
		},
		12: {
			cost(x) {
				let y = x;
				if (hasMilestone("BH", 0)) y = y.div(2);
				let expo = new Decimal(2);
				expo = expo.add(y.div(7));
				return new Decimal(400).times(new Decimal(expo).pow(y));
			},
			title: "Sacrifice",
			tooltip: "Base effect: 1.2<sup>x</sup><br>Base cost: 400&times;(2<sup>x</sup>)",
			display() {
				return (
					"Multiply Black Hole's gain, again<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("DM", 22);
			},
			effect(x) {
				let y = x;
				let base = new Decimal(1.2);
				return new Decimal(base).pow(y);
			},
		},
	},
	automate() {
		if (hasMilestone("BH", 3)) {
			buyMax("DMatter");
		}
	},
	clickables: {
		11: {
			title: "Buy Max",
			canClick() {
				return true;
			},
			onClick() {
				buyMax("DMatter");
			},
			unlocked() {
				return hasMilestone("BH", 0);
			},
		},
	},
});

addLayer("BH", {
	name: "black-hole",
	resource: "plank volumes of Black Hole",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	update(diff) {
		if (diff >= 0.3) diff = 0.3;
		if (hasUpgrade("DM", 22)) {
			player.BH.points = player.BH.points.add(this.gain().times(diff));
		}
	},
	effect() {
		return player.BH.points.add(1).pow(0.8);
	},
	effectDescription() {
		return (
			"boosting Dark Matter gain &times;" +
			format(this.effect()) +
			", but reduce their own gain /" +
			format(this.nerf()) +
			"<br>(" +
			format(this.gain()) +
			"/sec)"
		);
	},
	color: "#4b0f75",
	gain() {
		let base = new Decimal(2);
		base = base.times(tmp.DM.buyables[11].effect);
		base = base.times(tmp.BH.buyables[11].effect);
		base = base.times(tmp.DM.buyables[12].effect);
		if (hasMilestone("BH", 2)) base = base.pow(1.15);
		base = base.div(this.nerf());
		return base;
	},
	nerf() {
		let base = player.BH.points.add(1).pow(0.5);
		return base;
	},
	buyables: {
		11: {
			cost(x) {
				let y = x;
				if (hasMilestone("BH", 0)) y = y.div(2);
				let expo = new Decimal(1.1);
				return new Decimal(1000).pow(new Decimal(expo).pow(y));
			},
			title: "Big Black Hole",
			tooltip: "Base effect: 3<sup>x</sup><br>Base cost: 1,000<sup>(1.1<sup>x</sup>)</sup>",
			display() {
				return (
					"Multiply Black Hole's gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("DM", 22);
			},
			effect(x) {
				let y = x;
				let base = new Decimal(3);
				return new Decimal(base).pow(y);
			},
		},
		12: {
			cost(x) {
				let y = x;
				if (hasMilestone("BH", 0)) y = y.div(2);
				let expo = new Decimal(1.4);
				return new Decimal(1000000).pow(new Decimal(expo).pow(y));
			},
			title: "Gift from the Abyss",
			tooltip: "Base effect: 5<sup>x</sup><br>Base cost: 1,000,000<sup>(1.4<sup>x</sup>)</sup>",
			display() {
				return (
					"Multiply Dark Matter gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("DM", 22);
			},
			effect(x) {
				let y = x;
				let base = new Decimal(5);
				return new Decimal(base).pow(y);
			},
		},
	},
	milestones: {
		0: {
			unlocked() {
				return hasUpgrade("DM", 23);
			},
			done() {
				return hasUpgrade("DM", 23) && player.BH.points.gte("1e10");
			},
			requirementDescription: "1e10 Black Hole Volume (BHV)",
			effectDescription: "Half the scaling of and unlock Buy Max for all Dark Matter and Black Hole buyables",
		},
		1: {
			unlocked() {
				return hasUpgrade("DM", 23);
			},
			done() {
				return hasUpgrade("DM", 23) && player.BH.points.gte("1e20");
			},
			requirementDescription: "1e20 BHV",
			effectDescription: "The first four Dark Matter upgrades are applied twice",
		},
		2: {
			unlocked() {
				return hasUpgrade("DM", 23);
			},
			done() {
				return hasUpgrade("DM", 23) && player.BH.points.gte("1e65");
			},
			requirementDescription: "1e65 BHV",
			effectDescription: "Raise BHV gain ^1.15",
		},
		3: {
			unlocked() {
				return hasUpgrade("DM", 23);
			},
			done() {
				return hasUpgrade("DM", 23) && player.BH.points.gte("1e80");
			},
			requirementDescription: "1e80 BHV",
			effectDescription: "Automate Dark Matter and Black Hole buyables",
		},
	},
});

addLayer("EM", {
	name: "exotic-matter",
	resource: "Exotic Matter",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			buy1save: new Decimal(0),
			buy2save: new Decimal(0),
			realParticle: new Decimal(0),
			darksave: new Decimal(0),
			exosave: new Decimal(0),
		};
	},
	row: 3,
	symbol: "EM",
	image: "./resources/icons/exomatter.png",
	update(diff) {
		if (hasUpgrade("HC", 41)) player.EM.points = player.EM.points.add(matterGain(4).times(diff));
		if (inChallenge("EM", 12)) player.EM.realParticle = player.EM.realParticle.add(diff);
	},
	effect() {
		let effect = player.EM.points.add(1).pow(0.5);
		if (hasUpgrade("HC", 54)) effect = effect.pow(0);
		return effect;
	},
	effect2() {
		let effect = player.EM.points.div(10000).add(1).pow(0.0006);
		return effect;
	},
	effectDescription() {
		return (
			"reducing Dark Matter gain /" +
			format(this.effect()) +
			", and boosting Cash, Rebirth Points, Super Rebirth Points, Power and Hyper Essence gain by &times;" +
			format(this.effect2()) +
			"<br>(" +
			format(matterGain(4)) +
			"/sec)"
		);
	},
	tabFormat: {
		Exotic: {
			content: ["main-display", "clickables", "buyables", "upgrades"],
		},
		Hypotheory: {
			content: [
				["layer-proxy", ["HP", ["main-display"]]],
				["layer-proxy", ["UnsM", ["main-display", "upgrades"]]],
				"milestones",
			],
		},
		Challenges: {
			content: [
				[
					"display-text",
					"Challenges will reset Exotic Matter, Dark Matter, Hypothetical Particles and Unstable Matter, but will NOT reset any upgrades or milestones (or buyables for challenge 1) in this layer. Entering a Challenge will save the current amount of Dark Matter and Exotic Matter which will be returned after exiting the challenge",
				],
				"blank",
				"challenges",
			],
		},
	},
	color: "#cc59de",
	branches: ["HC"],
	layerShown() {
		return hasAchievement("A", 101);
	},
	upgrades: {
		11: {
			title: "Exotica",
			description: "Triple Exotic Matter gain",
			cost: new Decimal(12),
		},
		12: {
			title: "Light",
			description: "Nerf Dark Matter's nerf to Exotic Matter gain",
			cost: new Decimal(30),
			tooltip: "Effect ^0.6",
		},
		13: {
			title: "Stability",
			description: "Boost Hypothetical Particles production of Unstable Matter",
			cost: new Decimal(100),
			tooltip: "log<sub>10,000</sub> &#8594; log<sub>2,000</sub>",
		},
		14: {
			title: "Neutrality",
			description: "Matter and Antimatter boost Exotic Matter gain",
			cost: new Decimal(500),
			tooltip: "log<sub>1,000,000</sub>(M*AM)",
			effect() {
				return player.M.points.times(player.AM.points).add(1).max(1).log(1000000).add(1);
			},
			effectDisplay() {
				return "&times;" + format(this.effect());
			},
		},
		21: {
			title: "Conjecture",
			description: "Square Hypotheory's (buyable) base effect",
			cost: new Decimal(1e7),
		},
		22: {
			title: "Untitled Upgrade",
			description:
				"Half the scaling of both Exotic Matter buyables and unlock Buy Max for Exotic Matter buyables",
			cost: new Decimal(1e30),
		},
		23: {
			title: "I'm running out of names",
			description: "Exotic Matter boosts it's own gain",
			cost: new Decimal(1.32e81),
			tooltip: "log<sub>1e10</sub>(EM +1e10)",
			effect() {
				return player.EM.points.add(1e10).max(1).log(1e10).add(1);
			},
			effectDisplay() {
				return "&times;" + format(this.effect());
			},
		},
		24: {
			title: "Frogbert",
			description: "Cash boosts Unstable Matter's half-life",
			cost: new Decimal(1e193),
			tooltip: "log<sub>10</sub>(log<sub>10</sub>($ +10) +10)",
			effect() {
				return player.points.add(10).max(1).log(10).add(10).max(1).log(10);
			},
			effectDisplay() {
				return "+" + format(this.effect());
			},
		},
	},
	buyables: {
		11: {
			cost(x) {
				let y = x;
				if (hasUpgrade("EM", 22)) y = y.div(2);
				if (y.gte(250)) y = y.sub(250).pow(2).add(250);
				let expo = new Decimal(1.5);
				return new Decimal(10).times(new Decimal(expo).pow(y));
			},
			title: "Hypotheory",
			tooltip: "Base effect: x<br>Base cost: 10&times;(1.5<sup>x</sup>)",
			display() {
				return (
					"Start producing Hypothetical Particles<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: +" +
					coolDynamicFormat(this.effect(), 2) +
					"/sec"
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			effect(x) {
				let bob = x;
				if (hasUpgrade("EM", 21)) bob = bob.pow(2);
				bob = bob.times(layers.EM.buyables[12].effect());
				if (hasChallenge("EM", 11)) bob = bob.times(layers.EM.challenges[11].effect());
				if (inChallenge("EM", 12)) bob = bob.div(player.EM.realParticle);
				if (hasChallenge("EM", 12)) bob = bob.pow(1.4);
				return bob;
			},
		},
		12: {
			cost(x) {
				let y = x;
				if (hasUpgrade("EM", 22)) y = y.div(2);
				if (y.gte(150)) y = y.sub(150).pow(2).add(150);
				let expo = new Decimal(5);
				return new Decimal("1e25").times(new Decimal(expo).pow(y));
			},
			title: "Theoretical",
			tooltip: "Base effect: 2<sup>x</sup><br>Base cost: 1e25&times;(5<sup>x</sup>)",
			display() {
				return (
					"Multiply the previous buyables effect<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Currently: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			effect(x) {
				let greg = new Decimal(2).pow(x);
				return greg;
			},
		},
	},
	milestones: {
		0: {
			requirementDescription: "500,000 Hypothetical Particles",
			effectDescription: "Raise Unstable Matter gain ^1.05",
			done() {
				return player.HP.points.gte(500000);
			},
			unlocked() {
				return hasUpgrade("EM", 21);
			},
		},
		1: {
			requirementDescription: "5,000,000 Hypothetical Particles",
			effectDescription: "Raise Unstable Matter gain ^1.05, again",
			done() {
				return player.HP.points.gte(5000000);
			},
			unlocked() {
				return hasMilestone("EM", 0);
			},
		},
		2: {
			requirementDescription: "1e24 Exotic Matter",
			effectDescription: "Raise Unstable Matter gain ^1.05, yet again",
			done() {
				return player.EM.points.gte("1e24");
			},
			unlocked() {
				return hasMilestone("EM", 1);
			},
		},
	},
	challenges: {
		11: {
			name: "Unnaproved Existence",
			challengeDescription: "You cannot gain Hypothetical Particles or Unstable Matter",
			onEnter() {
				player.EM.exosave = player.EM.points;
				player.EM.darksave = player.DM.points;
				player.EM.points = new Decimal(0);
				player.DM.points = new Decimal(0);
				player.HP.points = new Decimal(0);
				player.UnsM.points = new Decimal(0);
			},
			goalDescription: "1,000 EM",
			canComplete() {
				return player.EM.points.gte(1000);
			},
			rewardDescription() {
				return "EM boosts Hypothetical Particle gain" + this.rewardEffect();
			},
			effect() {
				return player.EM.points.add("69").max(1).log("69");
			},
			rewardEffect() {
				return "<br>Currently: &times;" + format(this.effect());
			},
			onExit() {
				player.DM.points = player.EM.darksave;
				player.EM.points = player.EM.points.add(player.EM.exosave);
			},
		},
		12: {
			name: "Theorem > Conjecture",
			challengeDescription:
				"There are linearly increasing Real Particles that divide Hypothetical Particle gain<br>Entering this challenge also <i>temporarily</i> resets both Exotic Matter buyables",
			onEnter() {
				player.EM.buy1save = getBuyableAmount("EM", 11);
				player.EM.buy2save = getBuyableAmount("EM", 12);
				player.EM.exosave = player.EM.points;
				player.EM.darksave = player.DM.points;
				setBuyableAmount("EM", 11, new Decimal(0));
				setBuyableAmount("EM", 12, new Decimal(0));
				player.EM.points = new Decimal(0);
				player.DM.points = new Decimal(0);
				player.HP.points = new Decimal(0);
				player.UnsM.points = new Decimal(0);
				player.EM.realParticle = new Decimal(1);
			},
			onExit() {
				setBuyableAmount("EM", 11, player.EM.buy1save);
				setBuyableAmount("EM", 12, player.EM.buy2save);
				player.DM.points = player.EM.darksave;
				player.EM.points = player.EM.points.add(player.EM.exosave);
			},
			goalDescription: "420 Unstable Matter",
			canComplete() {
				return player.UnsM.points.gte("420");
			},
			rewardDescription() {
				return "Raising Hypothetical Particles ^1.4";
			},
		},
	},
	resetsNothing() {
		return true;
	},
	clickables: {
		11: {
			unlocked() {
				return hasUpgrade("EM", 22);
			},
			onClick() {
				buyMax("EMatter");
			},
			title: "Buy Max",
			canClick() {
				return true;
			},
		},
	},
	nodeStyle: {
		"background-color": "rgb(255, 0, 255)",
		"background-position-y": "10px",
		"background-position-x": "3px",
	},
});

addLayer("HP", {
	name: "exotic-matter",
	resource: "Hypothetical Particles",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	symbol: "EM",
	update(diff) {
		if (!inChallenge("EM", 11)) player.HP.points = player.HP.points.add(tmp.EM.buyables[11].effect.times(diff));
	},
	effect() {
		let base = player.HP.points.add(2).max(1).log(2);
		if (hasUpgrade("HC", 54)) base = base.pow(0);
		return base;
	},
	effect2() {
		let log = new Decimal(10000);
		if (hasUpgrade("EM", 13)) log = log.sub(7000);
		let base = player.HP.points.add(1).max(1).log(log);
		if (hasMilestone("EM", 0)) base = base.pow(1.05);
		if (hasMilestone("EM", 1)) base = base.pow(1.05);
		if (hasMilestone("EM", 2)) base = base.pow(1.05);
		return base;
	},
	effectDescription() {
		if (!inChallenge("EM", 12))
			return (
				"producing " +
				format(this.effect2()) +
				" Unstable Matter each second<br>They are also dividing Dark Matter gain by /" +
				format(this.effect()) +
				"<br>(" +
				format(layers.EM.buyables[11].effect()) +
				"/sec)"
			);
		if (inChallenge("EM", 12))
			return (
				"producing " +
				format(this.effect2()) +
				" Unstable Matter each second<br>They are also dividing Dark Matter gain by /" +
				format(this.effect()) +
				"<br>(" +
				format(layers.EM.buyables[11].effect()) +
				"/sec)<br><br>You currently have " +
				format(player.EM.realParticle) +
				" Real Particles"
			);
	},
	color: "#8c617e",
});

function unstableGain() {
	let baseGain = tmp.HP.effect2;
	if (hasUpgrade("UnsM", 13)) baseGain = baseGain.times(tmp.UnsM.upgrades[13].effect);
	return baseGain;
}

addLayer("UnsM", {
	name: "exotic-matter",
	resource: "Unstable Matter",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	symbol: "EM",
	update(diff) {
		let prev;
		if (!inChallenge("EM", 11)) {
			prev = player.UnsM.points;
			player.UnsM.points = player.UnsM.points.add(unstableGain().times(diff));
			if (player.UnsM.points.gt(0))
				player.UnsM.points = player.UnsM.points.sub(player.UnsM.points.div(this.halfLife()).div(2).times(diff));
			if (player.UnsM.points.lt(0)) player.UnsM.points = new Decimal(0);
			if (player.UnsM.points.lt(prev)) player.UnsM.points = prev;
		}
	},
	effect() {
		let base = new Decimal(2).pow(player.UnsM.points);
		if (base.gte(16)) base = base.div(16).pow(0.42).times(16);
		if (base.gte(64)) base = base.div(64).pow(0.0069).times(64);
		if (base.gte(128)) base = base.div(128).pow(0.069).times(128);
		if (base.gte(256)) base = base.div(256).pow(0.069).times(256);
		if (base.gte(512)) base = base.div(512).max(1).log(1e6).add(1).times(512);
		return base;
	},
	effectDescription() {
		if (this.halfLife().lte(1))
			return (
				"raising Exotic Matter gain ^" +
				format(this.effect()) +
				"<br>But they are unstable and decay with a half-life of " +
				formatTime(this.halfLife())
			);
		if (this.halfLife().lte(3600))
			return (
				"raising Exotic Matter gain ^" +
				format(this.effect()) +
				"<br>But they decay with a half-life of " +
				formatTime(this.halfLife()) +
				"<br>The limit to Unstable Matter based on current production and it's half-life is " +
				format(this.halfLife().times(2).times(unstableGain()))
			);
		else
			return (
				"raising Exotic Matter gain ^" +
				format(this.effect()) +
				"<br>But they have a half-life of " +
				formatTime(this.halfLife()) +
				"<br>Their limit is " +
				format(this.halfLife().times(2).times(unstableGain()))
			);
	},
	color: "#7bff00",
	halfLife() {
		let base = new Decimal(1);
		if (hasUpgrade("EM", 24)) base = base.add(tmp.EM.upgrades[24].effect);

		if (hasUpgrade("UnsM", 11)) base = base.times(tmp.UnsM.upgrades[11].effect);
		if (hasUpgrade("UnsM", 12)) base = base.times(3);
		if (hasUpgrade("UnsM", 14)) base = base.times(tmp.UnsM.upgrades[14].effect);

		if (hasUpgrade("UnsM", 13)) base = base.pow(0.5);

		return base;
	},
	upgrades: {
		11: {
			title: "Stability",
			description: "Multiply Unstable Matter's half life based on Unstable Matter",
			cost: new Decimal(1000),
			effect() {
				return player.UnsM.points.add(1).max(1).log(10).add(1);
			},
			effectDisplay() {
				return "x" + format(this.effect());
			},
		},
		12: {
			title: "Labcoats",
			description: "Triple Unstable Matter's half-life",
			cost: new Decimal(3000),
		},
		13: {
			title: "Timewarping",
			description:
				"Root Unstable Matter's half-life length in seconds, but multiply it's gain by the same amount",
			cost: new Decimal(5000),
			effect() {
				if (!hasUpgrade("UnsM", 13)) return tmp.UnsM.halfLife.pow(0.5);
				if (hasUpgrade("UnsM", 13)) return tmp.UnsM.halfLife;
			},
			effectDisplay() {
				return "x" + format(this.effect());
			},
		},
		14: {
			title: "Insanity",
			description: "Exotic Matter now also boosts Unstable Matter's half-life",
			cost: new Decimal(10000),
			effect() {
				return tmp.EM.effect2.pow(1e10).add(10).max(1).log(10).add(10).max(1).log(10);
			},
			effectDisplay() {
				return "x" + format(this.effect());
			},
		},
	},
});

addLayer("UMF", {
	name: "ultimate-matter-fragments",
	resource: "Ultimate Matter Fragments",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	row: 3,
	symbol: "UMF",
	effect() {
		return new Decimal(5).pow(player.UMF.points).div(10).add(1).pow(0.5).sub(0.05);
	},
	effect2() {
		return tmp.M.effect2.times(tmp.AM.effect2).times(tmp.DM.effect2).times(tmp.EM.effect2);
	},
	effectDescription() {
		return (
			"boosting all matters gain &times;" +
			format(tmp.UMF.effect) +
			"<br>Your matters are boosting Cash, Rebirth Points, Super Rebirth Points, Power and Hyper Essence gain by &times;" +
			format(tmp.UMF.effect2)
		);
	},
	tabFormat: ["main-display"],
	color: "#472961",
	branches: ["M", "AM", "DM", "EM"],
	layerShown: false,
	milestones: {
		0: {
			requirementDescription: "1 Ultimate Matter Fragment",
			effectDescription: "Passively gain 0.05% of HRP gained on reset, also automate Unending",
			done() {
				return player.UMF.points.gte(1);
			},
		},
		1: {
			requirementDescription: "2 Ultimate Matter Fragments",
			effectDescription: "All (pre-Hyper) automation now buys max and no longer spends anything",
			done() {
				return player.UMF.points.gte(2);
			},
		},
		2: {
			requirementDescription: "3 Ultimate Matter Fragments",
			effectDescription() {
				return (
					"Matters now also multiply Hyper Rebirth Points and the first Cash Buyables amount at a reduced rate<br>Currently: &times;" +
					format(tmp.UMF.effect2.max(1).log(4).add(1))
				);
			},
			done() {
				return player.UMF.points.gte(3);
			},
			effect() {
				return tmp.UMF.effect2.max(1).log(4).add(1);
			},
		},
		3: {
			requirementDescription: "4 Ultimate Matter Fragments",
			effectDescription:
				"The above milestone now also powers Hyper Cash's last three effects<br>CURRENT ENDGAME",
			done() {
				return player.UMF.points.gte(4);
			},
		},
	},
});
