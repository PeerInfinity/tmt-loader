addLayer("HC", {
	name: "hyper-rebirth",
	tabFormat: {
		Hyper: {
			content: [
				"main-display",
				"prestige-button",
				"resource-display",
				"blank",
				["layer-proxy", ["C", ["main-display"]]],
				"blank",
				"milestones",
			],
		},
		Paths: {
			content: [
				["display-text", "Starting a path doubles the cost of all unstarted paths"],
				"blank",
				"clickables",
				"blank",
				["upgrade-tree", [[11, 12, 13, 14], [21, 22, 23, 24], [31, 32, 33, 34], [41]]],
			],
		},
		Matter: {
			content: [
				["layer-proxy", ["M", ["main-display"]]],
				["layer-proxy", ["AM", ["main-display"]]],
				["layer-proxy", ["DM", ["main-display"]]],
				["layer-proxy", ["EM", ["main-display"]]],
				"blank",
				"h-line",
				"blank",
				["layer-proxy", ["UMF", ["main-display"]]],
				["upgrade-tree", [[51, 52, 53, 54]]],
				["layer-proxy", ["UMF", ["milestones"]]],
			],
		},
	},
	symbol: "HR",
	image: "./resources/icons/hyper_rebirth.png",
	row: "3",
	resource: "Hyper Rebirth Points",
	color: "#21b592",
	type: "custom",
	update(diff) {
		let hypEss = new Decimal(1);
		hypEss = hypEss.times(
			player.points
				.add(10)
				.max(1)
				.log(10)
				.pow(0.6)
				.times(player.SR.points.add(1).pow(0.4))
				.times(player.P.points.add(10).max(1).log(10))
				.pow(0.25)
		);
		if (hasUpgrade("HC", 33)) hypEss = hypEss.times(tmp.C.effect[3]);
		if (hypEss === null || hypEss === undefined) hypEss = new Decimal(1);
		hypEss = hypEss.times(tmp.UMF.effect2);
		player.HC.hyperNumberBase = hypEss;
		if (hypEss.gte(2500)) hypEss = hypEss.div(2500).pow(0.2).times(2500);
		player.HC.hyperNumber = hypEss;
		if (hasMilestone("UMF", 0))
			player.HC.points = player.HC.points.add(this.getResetGain().times(0.0005).times(diff));
		player.HC.total = player.HC.total.add(this.getResetGain().times(0.0005).times(diff));
	},
	effect() {
		let totalitism = player.HC.total;
		if (totalitism.gte(50000)) totalitism = totalitism.div(50000).pow(0.25).times(50000);
		if (totalitism.gte(500000)) totalitism = totalitism.div(50000).pow(0.25).times(500000);
		return [
			new Decimal(3).pow(totalitism.add(1)).div(3),
			totalitism.add(25).div(25).pow(0.5),
			new Decimal(2).pow(totalitism.add(2).div(2)).div(2),
		];
	},
	effectDescription() {
		return (
			"multiplying Cash gain by " +
			formatWhole(this.effect()[0]) +
			", SRP gain by " +
			format(this.effect()[1]) +
			", and Power Pylon effectiveness by " +
			format(this.effect()[2]) +
			"<br>Based on total HRP"
		);
	},
	baseAmount() {
		return player.HC.hyperNumberBase;
	},
	baseResource: "Hyper Essence",
	branches: ["SR", "P"],
	layerShown() {
		return hasAchievement("A", 75);
	},
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			hyperNumber: new Decimal(1),
			hyperCash: new Decimal(0),
			total: new Decimal(0),
			paths: [],
			hyperNumberBase: new Decimal(1),
		};
	},
	getResetGain() {
		let base = player.HC.hyperNumber.add(1).div(25).pow(1.6).floor();
		if (hasMilestone("UMF", 2)) base = base.times(tmp.UMF.effect2.max(1).log(4).add(1));
		return base;
	},
	getNextAt() {
		return this.getResetGain().add(1).pow(0.625).times(25).floor();
	},
	requires: new Decimal(25),
	canReset() {
		return player.HC.hyperNumber.gte(25) && hasUpgrade("SR", 21);
	},
	prestigeNotify() {
		return this.canReset() && !hasMilestone("UMF", 0);
	},
	prestigeButtonText() {
		if (!this.getResetGain().gte(1024))
			return (
				"Go Hyper for " +
				formatWhole(this.getResetGain(), 0) +
				" Hyper Rebirth Points" +
				"<br><br>Next at " +
				formatWhole(this.getNextAt(), 0) +
				" Hyper Essence"
			);
		if (this.getResetGain().gte(1024))
			return "Reset for " + formatWhole(this.getResetGain(), 2) + " Hyper Rebirth Points";
	},
	milestones: {
		0: {
			requirementDescription: "1 Total HRP",
			effectDescription:
				"The Machine is now permanently unlocked, keep Cash Upgrades v2 on Hyper Rebirth, unlock Hyper Cash, and keep all buyables, upgrades and automation unlocked",
			done() {
				return player.HC.total.gte(1);
			},
		},
		1: {
			requirementDescription: "6 Total HRP",
			effectDescription: "All Buyables (including Pylons) automation is 10&times; as effective",
			done() {
				return player.HC.total.gte(6);
			},
		},
		2: {
			requirementDescription: "18 Total HRP",
			effectDescription: "Keep challenges on Hyper Reset",
			done() {
				return player.HC.total.gte(18);
			},
		},
		3: {
			requirementDescription: "42 Total HRP",
			effectDescription: "Automate all pre-Hyper upgrades except the final Super Rebirth Upgrade",
			done() {
				return player.HC.total.gte(42);
			},
		},
		4: {
			requirementDescription: "90 Total HRP",
			effectDescription: "Super Rebirth resets nothing",
			done() {
				return player.HC.total.gte(90);
			},
		},
		5: {
			requirementDescription: "130 Total HRP",
			effectDescription: "Automatically Super Rebirth",
			done() {
				return player.HC.total.gte(130);
			},
		},
	},
	upgrades: {
		11: {
			cost() {
				base = new Decimal(1);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 1)));
				return base;
			},
			onPurchase() {
				player.HC.paths.push(1);
			},
			title: "The Basic Path",
			description: "Multiply Cash gain 10,000&times;",
		},
		21: {
			cost() {
				base = new Decimal(2);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 1)));
				return base;
			},
			description: "Multiply Rebirth Point gain 10,000&times;",
			branches: [11, 31],
			canAfford() {
				return hasUpgrade("HC", 11);
			},
			title: "Cubic",
		},
		31: {
			cost() {
				base = new Decimal(3);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 1)));
				return base;
			},
			description: "Start with 12 Super Rebirth Points, and reduce SRP base cost by /1e9",
			canAfford() {
				return hasUpgrade("HC", 21);
			},
			title: "Permanance",
			onPurchase() {
				if (player.SR.points.lte(12)) player.SR.points = new Decimal(12);
			},
		},

		12: {
			cost() {
				base = new Decimal(1);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 2)));
				return base;
			},
			onPurchase() {
				player.HC.paths.push(2);
			},
			title: "The Machine's Path",
			description: "Start with Power unlocked and Power Pylons are twice as effective",
		},
		22: {
			cost() {
				base = new Decimal(2);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 2)));
				return base;
			},
			description: "Power Pylons become 5&times; more effective",
			branches: [12, 32],
			canAfford() {
				return hasUpgrade("HC", 12);
			},
			title: "Power Core",
		},
		32: {
			cost() {
				base = new Decimal(3);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 2)));
				return base;
			},
			description:
				"You start with all Power Pylons unlocked, keep all Power milestones on Hyper Rebirth, and reduce Power Pylon scaling",
			canAfford() {
				return hasUpgrade("HC", 22);
			},
			title: "Maintainment",
		},

		13: {
			cost() {
				base = new Decimal(1);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 3)));
				return base;
			},
			onPurchase() {
				player.HC.paths.push(3);
			},
			title: "The Hyper Path",
			description: "Multiply Hyper Cash gain based on Cash",
			tooltip: "log<sub>10</sub>($ + 10)<sup>0.4</sup>",
			effectDisplay() {
				return "&times;" + format(player.points.add(10).max(1).log(10).pow(0.4));
			},
		},
		23: {
			cost() {
				base = new Decimal(2);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 3)));
				return base;
			},
			description: "Multiply Hyper Cash gain by 10&times;",
			branches: [13, 33],
			canAfford() {
				return hasUpgrade("HC", 13);
			},
			title: "Hypercube",
		},
		33: {
			cost() {
				base = new Decimal(3);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 3)));
				return base;
			},
			description: "Hyper Cash also boosts RP, SRP and Hyper Essence",
			tooltip: "RP: &times;(HC + 1)<br>SRP: &timesl(log<sub>10</sub>(log<sub>10</sub>(HC+10) +10))<br>HE: &times;(HC<sup>0.1</sup>/3 +1)",
			canAfford() {
				return hasUpgrade("HC", 23);
			},
			title: "Ultra Cash",
		},

		14: {
			cost() {
				base = new Decimal(1);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 4)));
				return base;
			},
			onPurchase() {
				player.HC.paths.push(4);
			},
			title: "The Combined Path",
			description: "Multiply Cash, Power, and Rebirth Points gain by 100&times;",
		},
		24: {
			cost() {
				base = new Decimal(2);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 4)));
				return base;
			},
			description: "Multiply Cash gain and Power Pylon efficiency effect by 200&times;",
			branches: [14, 34],
			canAfford() {
				return hasUpgrade("HC", 14);
			},
			title: "Elemental",
		},
		34: {
			cost() {
				base = new Decimal(3);
				base = base.times(new Decimal(2).pow(findIndex(player.HC.paths, 4)));
				return base;
			},
			description: "Reduce Rebirth Points, Super Rebirth Points, and Power Pylons cost by /100,000, and increase both of the Cash Buyables' bases",
			canAfford() {
				return hasUpgrade("HC", 24);
			},
			title: "Cheapening",
		},

		41: {
			title: "The Matter Combustor",
			cost: new Decimal(40),
			description: "Unlock the Matter Paths",
			canAfford() {
				return hasUpgrade("HC", 31) && hasUpgrade("HC", 32) && hasUpgrade("HC", 33) && hasUpgrade("HC", 34);
			},
			branches: [31, 32, 33, 34],
		},

		51: {
			cost: new Decimal("1.5e12"),
			currencyDisplayName: "Matter",
			currencyInternalName: "points",
			currencyLayer() {
				return "M";
			},
			title: "Matter Annihilation",
			onPurchase() {
				player.UMF.points = player.UMF.points.add(1);
			},
			description: "Disable Matter's nerf to Antimatter, and gain an Ultimate Matter Fragment",
		},
		52: {
			cost: new Decimal("5e11"),
			currencyDisplayName: "Antimatter",
			currencyInternalName: "points",
			currencyLayer() {
				return "AM";
			},
			title: "Antimatter Annihilation",
			onPurchase() {
				player.UMF.points = player.UMF.points.add(1);
			},
			description: "Disable Antimatter's nerf to Matter, and gain an Ultimate Matter Fragment",
		},
		53: {
			cost: new Decimal("1e260"),
			currencyDisplayName: "Black Hole Volume",
			currencyInternalName: "points",
			currencyLayer() {
				return "BH";
			},
			title: "Dark Matter Annihilation",
			onPurchase() {
				player.UMF.points = player.UMF.points.add(1);
			},
			description: "Disable Dark Matter's nerf to Exotic Matter, and gain an Ultimate Matter Fragment",
		},
		54: {
			cost: new Decimal("50000"),
			currencyDisplayName: "Unstable Matter",
			currencyInternalName: "points",
			currencyLayer() {
				return "UnsM";
			},
			title: "Exotic Matter Annihilation",
			onPurchase() {
				player.UMF.points = player.UMF.points.add(1);
			},
			description: "Disable Exotic Matter's nerf to Dark Matter, and gain an Ultimate Matter Fragment",
		},
	},
	hotkeys: [
		{
			key: "h", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
			description: "H: Hyper Rebirth", // The description of the hotkey that is displayed in the game's How To Play tab
			onPress() {
				if (player.HC.unlocked) doReset("HC");
			},
			unlocked() {
				return player.HC.unlocked;
			}, // Determines if you can use the hotkey, optional
		},
	],
	clickables: {
		11: {
			style: {
				width: "130px",
			},
			title: "Respec Paths",
			canClick() {
				return hasUpgrade("HC", 11) || hasUpgrade("HC", 12) || hasUpgrade("HC", 13) || hasUpgrade("HC", 14);
			},
			onClick() {
				player.HC.points = player.HC.total;
				player.HC.upgrades = [];
				player.HC.paths = [];
				const layersa = ["U", "R", "SR", "P", "HC", "C"];
				for (let index = 0; index < layersa.length; index++) {
					const element = layers[index];
					layers[layersa].doReset("HC");
				}
			},
		},
	},
});

addLayer("C", {
	name: "hyper-cash",
	resource: "Hyper Cash",
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	layerShown: false,
	row: 2,
	update(diff) {
		if (hasMilestone("HC", 0)) {
			player.C.points = player.C.points.add(new Decimal(hyperCashGain()[0]).times(diff));
		}
	},
	effect() {
		let base = [
			hCashB1(),
			player.C.points.add(1),
			player.C.points.add(10).max(1).log(10).add(10).max(1).log(10),
			player.C.points.pow(0.1).div(3).add(1),
		];
		if (hasMilestone("UMF", 3))
			base = [
				base[0],
				base[1].pow(milestoneEffect("UMF", 2)),
				base[2].pow(milestoneEffect("UMF", 2)),
				base[3].pow(milestoneEffect("UMF", 2)),
			];
		return base;
	},
	effectDescription() {
		let text;
		if (!hasUpgrade("HC", 33))
			text =
				"raising Cash gain by ^" +
				format(tmp.C.effect[0]) +
				"<br>Producing " +
				format(hyperCashGain()[0]) +
				"/sec" +
				"<br>Hyper Cash is reset on Hyper Reset";

		if (hasUpgrade("HC", 33))
			text =
				"raising Cash gain by ^" +
				format(tmp.C.effect[0]) +
				", boosting Rebirth Points gain by &times;" +
				format(tmp.C.effect[1]) +
				", boosting Super Rebirth Points gain by &times;" +
				format(tmp.C.effect[2]) +
				", boosting Hyper Essence gain by &times;" +
				format(tmp.C.effect[3]) +
				"<br>Producing " +
				format(hyperCashGain()[0]) +
				"/sec";

		if (hyperCashGain()[0].gte(100))
			text = text + "<br>Hyper Cash gain is softcapped past 100, reducing it /" + format(hyperCashGain()[1][0]);

		return text;
	},
	color: "#34eb67",
});

function hCashB1() {
	let boost = player.C.points.times(0.005).add(1).pow(0.15);
	if (boost.gte(2)) boost = boost.div(2).pow(0.1).times(2);
	return boost;
}

function hyperCashGain() {
	let HCgain = new Decimal(0);
	let softcaps = [];
	if (hasMilestone("HC", 0)) HCgain = HCgain.add(0.1);
	if (hasUpgrade("HC", 13)) HCgain = HCgain.times(player.points.add(10).max(1).log(10).pow(0.4));
	if (hasUpgrade("HC", 23)) HCgain = HCgain.times(10);
	if (HCgain.gte(100)) {
		softcaps.push(
			HCgain.div(
				new Decimal(100).times(new Decimal(10).pow(HCgain.div(100).max(1).log(10).add(1).max(1).log(10)))
			)
		);
		HCgain = new Decimal(100).times(new Decimal(10).pow(HCgain.div(100).max(1).log(10).add(1).max(1).log(10)));
	}
	return [HCgain, softcaps];
}
