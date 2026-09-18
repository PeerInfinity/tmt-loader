addLayer("R", {
	name: "rebirth",
	// #region Softcap(?)
	softcap() {
		cap = new Decimal("1e17");
		if (player.points.gte("1e6363.2")) cap = new Decimal("e1686.89");
		return cap;
	},
	softcapPower() {
		let softness = new Decimal(0.25);
		if (player.points.gte("1e6363.2")) softness = softness.div(5);
		return softness;
	},
	// #endregion
	symbol: "R",
	image: "./resources/icons/rebirth.png",
	row: "1",
	type: "custom",
	canReset() {
		return this.baseAmount().gte(tmp.R.requires);
	},
	update(diff) {
		player.R.points = player.R.points.add(tmp.R.getResetGain.mul(tmp.R.passiveGen).mul(diff));
	},
	// #region Reset Gain
	getResetGain() {
		let baseGain = tmp.R.baseAmount.mul(tmp.R.gainMult).div(tmp.R.requires).pow(tmp.R.exponent);
		if (baseGain.gte(1e17)) baseGain = baseGain.div(1e17).pow(0.25).mul(1e17);
		if (baseGain.gte("1e2000")) baseGain = baseGain.div("1e2000").pow(0.2).mul("1e2000");
		baseGain = baseGain.mul(tmp.R.directMult);
		if (baseGain.gte("1e1000000"))
			baseGain = baseGain
				.div("1e1000000")
				.pow(Decimal.dOne.div(base.max(1).log(10).sub(9999999).pow(0.05)))
				.mul("1e1000000");
		return baseGain;
	},
	// #endregion
	// #region Softcaps
	softcapEffects() {
		let softcaps = [[]];
		let baseGain = tmp.R.baseAmount.mul(tmp.R.gainMult).div(tmp.R.requires).pow(tmp.R.exponent);
		let basedGain = baseGain;
		if (baseGain.gte(1e17)) {
			softcaps[0].push(baseGain.div(1e17).pow(0.75));
			baseGain = baseGain.div(1e17).pow(0.25).mul(1e17);
		}
		if (baseGain.gte("1e2000")) {
			softcaps[0].push(baseGain.div("1e2000").pow(0.8));
			baseGain = baseGain.div("1e2000").pow(0.2).mul("1e2000");
		}
		baseGain = baseGain.mul(tmp.R.directMult);
		basedGain = basedGain.mul(tmp.R.directMult);
		if (baseGain.gte("1e1000000")) {
			softcaps[0].push(
				baseGain.div(
					baseGain
						.div("1e1000000")
						.pow(new Decimal(1).div(base.max(1).log(10).sub(9999999).pow(0.05)))
						.mul("1e1000000")
				)
			);
			baseGain = baseGain
				.div("1e1000000")
				.pow(new Decimal(1).div(base.max(1).log(10).sub(9999999).pow(0.2)))
				.mul("1e1000000");
		}
		softcaps.push(basedGain);
		return softcaps;
	},
	// #endregion
	// #region Next At
	getNextAt() {
		let baseGain = tmp.R.getResetGain.add(1).floor();
		baseGain = baseGain.div(tmp.R.directMult);
		if (baseGain.gte("1e2000")) baseGain = baseGain.div("1e2000").pow(5).mul("1e2000");
		if (baseGain.gte(1e17)) baseGain = baseGain.div(1e17).pow(4).mul(1e17);
		baseGain = baseGain.pow(new Decimal(1).div(tmp.R.exponent)).div(tmp.R.gainMult).mul(tmp.R.requires);
		return baseGain;
	},
	// #endregion
	// #region Button Text
	prestigeButtonText() {
		if (inChallenge("SR", 11)) return "Challenges are stopping you from Rebirthing";

		if (tmp.R.getResetGain.lt(1)) return `Reach ${formatWhole(tmp.R.requires)} Cash to Rebirth`;
		if (tmp.R.getResetGain.lt(1000))
			return `Rebirth for ${formatWhole(tmp.R.getResetGain)} Rebirth Points, next at ${formatWhole(
				tmp.R.getNextAt
			)} Cash`;
		if (tmp.R.getResetGain.lt(1e17)) return `Rebirth for ${formatWhole(tmp.R.getResetGain)} Rebirth Points`;
		return `${formatWhole(tmp.R.getResetGain)} (${format(tmp.R.softcapEffects[1])} base) RP`;
	},
	// #endregion
	prestigeNotify() {
		return tmp.R.getResetGain.gte(player.R.points.div(5)) && this.passiveGen === 0;
	},
	baseResource: "Cash",
	resource: "Rebirth Points",
	baseAmount() {
		return player.points;
	},
	// #region Requirement
	requires() {
		if (inChallenge("SR", 11)) return new Decimal("eeeeeeeee10");

		let requirement = new Decimal(100000);
		if (hasChallenge("SR", 12)) requirement = requirement.div(10);
		if (inChallenge("SR", 12)) requirement = requirement.mul(10);
		if (hasUpgrade("HC", 34)) requirement = requirement.div(100000);
		return requirement;
	},
	// #endregion
	// #region Multiplier
	gainMult() {
		let mul = new Decimal(1);
		if (getClickableState("U", 11)) mul = mul.mul(2);
		if (getClickableState("U", 12)) mul = mul.mul(3);
		if (getClickableState("U", 13)) mul = mul.mul(4);
		if (hasUpgrade("U", 43) && !hasMilestone("P", 8)) mul = mul.mul(ue("U", 43)[0]);
		mul = mul.mul(tmp.R.buyables[11].effect);
		mul = mul.mul(tmp.SR.effect[0]);
		mul = mul.mul(tmp.U.buyables[11].effect);
		mul = mul.mul(machineBonuses());
		if (hasUpgrade("U", 52)) mul = mul.mul(player.P.points.add(3).max(1).log(3));
		return mul;
	},
	directMult() {
		let remult = new Decimal(1);
		if (hasUpgrade("HC", 21)) remult = remult.mul(10000);
		if (hasUpgrade("HC", 14)) remult = remult.mul(100);
		if (hasUpgrade("HC", 33)) remult = remult.mul(tmp.C.effect[1]);
		remult = remult.mul(tmp.UMF.effect2);
		return remult;
	},
	// #endregion
	// #region Exponent
	exponent() {
		let power = new Decimal(0.5);
		if (hasUpgrade("U", 32)) power = power.add(ue("U", 32));
		return power;
	},
	gainExp() {
		let exp = new Decimal(1);
		if (hasUpgrade("SR", 11)) exp = exp.mul(1.05);
		return exp;
	},
	// #endregion
	color: "#ba0022",
	branches: ["U"],
	// #region Effect
	effect() {
		let exp = new Decimal(0.6);
		if (hasUpgrade("U", 33)) exp = exp.add(ue("U", 33));
		if (hasUpgrade("U", 42)) exp = exp.add(ue("U", 42));
		if (hasUpgrade("R", 33)) exp = exp.add(0.2);
		return player.R.points.pow(exp).add(1);
	},
	// #endregion
	layerShown() {
		return hasAchievement("A", 12);
	},
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
		};
	},
	// #region Effect Description
	effectDescription() {
		let text = "boosting Cash gain by &times;" + format(tmp.R.effect, 2);
		if (tmp.R.getResetGain.gte(1e17))
			text =
				text +
				"<br>Rebirth Point gain past 1e17 is softcapped, reducing their gain by /" +
				format(tmp.R.softcapEffects[0][0]);
		if (tmp.R.getResetGain.gte("1e2000"))
			text =
				text +
				"<br>Rebirth Point gain past 1e2000 is softcapped again, further reducing their gain by /" +
				format(tmp.R.softcapEffects[0][1]);
		if (tmp.R.getResetGain.gte("1e1000000"))
			text =
				text +
				"<br>Rebirth Points have become victim to inflation, reducing their gain by /" +
				format(tmp.R.softcapEffects[0][2]);
		return text;
	},
	// #endregion
	upgrades: {
		// #region Rebirth Upgrade 1
		11: {
			title: "Five Dollars",
			description: () => `Boost Cash gain by &times;${formatWhole(ue("R", 11))}`,
			cost: new Decimal(1),
			effect: 5,
		},
		// #endregion
		// #region Rebirth Upgrade 2
		12: {
			title: "Moneybots",
			description: "Automate Cash Upgrades 1-8",
			cost: new Decimal(3),
		},
		// #endregion
		// #region Rebirth Upgrade 3
		13: {
			title: "I need more!",
			description: "Unlock four more Cash Upgrades",
			cost: new Decimal(15),
		},
		// #endregion
		// #region Rebirth Upgrade 4
		14: {
			title: "Underwhelming",
			description: "Double Cash gain",
			cost: new Decimal(100),
			effect: 2,
		},
		// #endregion
		// #region Rebirth Upgrade 5
		21: {
			title: "Mechanical Reconstruction",
			description: "Keep The Machine unlocked on Rebirth",
			cost: new Decimal(10000),
			unlocked() {
				return hasAchievement("A", 31);
			},
		},
		// #endregion
		// #region Rebirth Upgrade 6
		22: {
			title: "Repeated Costs",
			description: "Unlock Rebirth Buyable 1",
			cost: new Decimal(50000),
			unlocked() {
				return hasAchievement("A", 31);
			},
		},
		// #endregion
		// #region Rebirth Upgrade 7
		23: {
			title: "Repeated Repeated Costs",
			description: "Unlock Rebirth Buyable 2",
			cost: new Decimal(1000000),
			unlocked() {
				return hasAchievement("A", 31);
			},
		},
		// #endregion
		// #region Rebirth Upgrade 8
		24: {
			title: "Upgrading Revival",
			description: "Unlock more Cash & Rebirth Upgrades",
			cost: new Decimal("1e8"),
			unlocked() {
				return hasAchievement("A", 31);
			},
		},
		// #endregion
		// #region Rebirth Upgrade 9
		31: {
			title: "Doublatron 3000",
			description: "Increase maximum modes for The Machine to two",
			cost: new Decimal("1e16"),
			unlocked() {
				return hasUpgrade("R", 24);
			},
			style: {
				width: "240px",
			},
		},
		// #endregion
		// #region Rebirth Upgrade 10
		32: {
			title: "Machine automating Machine",
			description: "Automate The Machine, and remove maximum modes<br>Buff The Machine's individual modes",
			cost: new Decimal("1e18"),
			unlocked() {
				return hasUpgrade("R", 24);
			},
			style: {
				width: "240px",
			},
		},
		// #endregion
		// #region Rebirth Upgrade 11
		41: {
			title: "Rebirth Empowerment",
			description: "Boost Rebirth Points' effect on Cash gain",
			cost: new Decimal("1e23"),
			unlocked() {
				return hasMilestone("SR", 6);
			},
			tooltip: () => `^${format(0.8)} &#8594; ^${format(0.8 + ue("R", 41))}`,
			style: {
				width: "240px",
			},
			effect: 0.2,
		},
		// #endregion
		// #region Rebirth Upgrade 12
		42: {
			title: "Super Rebirth Empowerment",
			description: "Boost Super Rebirth Points' effect on Cash gain",
			cost: new Decimal("1e25"),
			unlocked() {
				return hasMilestone("SR", 6);
			},
			tooltip: "1.5&times;SRP &#8594; 1.5&times;SRP<sup>2</sup>",
			style: {
				width: "240px",
			},
		},
		// #endregion
	},
	buyables: {
		11: {
			cost(x) {
				scalar = 2;
				if (hasChallenge("SR", 21)) scalar = scalar - 0.5;
				return new Decimal(20000).mul(new Decimal(1.2).pow(new Decimal(x).pow(scalar)));
			},
			title: "Rebirth Booster",
			tooltip: "Base effect: 1.5<sup>x</sup><br>Base cost:20,000&times;(1.2<sup>x<sup>2</sup></sup>)",
			display() {
				return (
					"Multiply RP gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Effect: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				if (!hasMilestone("SR", 0)) player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("R", 22);
			},
			effect(x) {
				return new Decimal(1.5).add(tmp.R.buyables[12].effect).pow(x);
			},
		},
		12: {
			cost(x) {
				scalar = 2;
				if (hasChallenge("SR", 21)) scalar = scalar - 0.25;
				return new Decimal(1000000).mul(new Decimal(3).pow(new Decimal(x).pow(scalar)));
			},
			title: "Rebirth Booster<sup>2</sup>",
			tooltip: "Base effect: +x/4<br>Base cost:1,000,000&times;(3<sup>x<sup>2</sup></sup>)",
			display() {
				return (
					"Boost the previous buyables power<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Effect: +" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				if (!hasMilestone("SR", 0)) player[this.layer].points = player[this.layer].points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			unlocked() {
				return hasUpgrade("R", 23);
			},
			effect(x) {
				if (!hasUpgrade("U", 44)) return new Decimal(0.25).mul(x);
				if (hasUpgrade("U", 44) && !hasMilestone("P", 8)) return new Decimal(0.3).mul(x);
				if (hasUpgrade("U", 44) && hasMilestone("P", 8)) return new Decimal(0.4).mul(x);
			},
		},
	},
	doReset(resetlayer) {
		if (resetlayer == "SR") {
			player.R.points = new Decimal(0);
			if (!hasMilestone("SR", 5)) player.R.upgrades = [];
			if (!inChallenge("SR", 21)) {
				if (hasMilestone("SR", 1)) player.R.upgrades.push(11, 12, 13, 14);
				if (hasMilestone("SR", 3)) player.R.upgrades.push(22, 23);
				if (!hasMilestone("SR", 3)) setBuyableAmount("R", 11, new Decimal(0));
				if (!hasMilestone("SR", 3)) setBuyableAmount("R", 12, new Decimal(0));
				if (hasAchievement("A", 81)) player.R.upgrades.push(12, 21);
				if (hasMilestone("HC", 0)) player.R.upgrades.push(12, 21, 13, 22, 23, 24);
			}
			if (inChallenge("SR", 21)) player.R.upgrades = [];
		}
		if (resetlayer == "HC") {
			player.R.points = new Decimal(0);
			player.R.upgrades = [12, 21, 13, 22, 23, 24];
			setBuyableAmount("R", 11, new Decimal(0));
			setBuyableAmount("R", 12, new Decimal(0));
		}
	},
	passiveGen() {
		let passive = new Decimal(0);
		if (!inChallenge("SR", 21)) {
			if (hasChallenge("SR", 11)) passive = passive.add(0.2);
			if (hasChallenge("SR", 21)) passive = passive.mul(10);
		}
		return passive;
	},
	automate() {
		if (!inChallenge("SR", 21)) {
			if (!hasMilestone("UMF", 1)) {
				if (tmp.R.buyables[11].canAfford && (hasMilestone("SR", 7) || hasAchievement("A", 81))) {
					setBuyableAmount("R", 11, getBuyableAmount("R", 11).add(1));
					if (hasMilestone("HC", 1)) setBuyableAmount("R", 11, getBuyableAmount("R", 11).add(9));
					if (hasMilestone("UMF", 1)) setBuyableAmount("R", 11, getBuyableAmount("R", 11).add(40));
				}
				if (tmp.R.buyables[12].canAfford && (hasMilestone("SR", 7) || hasAchievement("A", 81))) {
					setBuyableAmount("R", 12, getBuyableAmount("R", 12).add(1));
					if (hasMilestone("HC", 1)) setBuyableAmount("R", 12, getBuyableAmount("R", 12).add(9));
					if (hasMilestone("UMF", 1)) setBuyableAmount("R", 12, getBuyableAmount("R", 12).add(40));
				}
			} else {
				buyMax("Rebirth");
			}
			if (hasMilestone("HC", 3)) {
				buyUpgrade("R", 11);
				buyUpgrade("R", 12);
				buyUpgrade("R", 13);
				buyUpgrade("R", 14);
				buyUpgrade("R", 21);
				buyUpgrade("R", 22);
				buyUpgrade("R", 23);
				buyUpgrade("R", 24);
				buyUpgrade("R", 31);
				buyUpgrade("R", 32);
				buyUpgrade("R", 33);
				buyUpgrade("R", 34);
			}
		}
	},
	hotkeys: [
		{
			key: "r", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
			description: "R: Rebirth", // The description of the hotkey that is displayed in the game's How To Play tab
			onPress() {
				if (player.R.unlocked) doReset("R");
			},
			unlocked() {
				return player.R.unlocked;
			}, // Determines if you can use the hotkey, optional
		},
	],
});
