addLayer("U", {
	name: "upgrades", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "$", // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		};
	},
	color: "var(--points)",
	tooltip() {
		if (inChallenge("SR", 31)) return format(player.SR.tax, 2) + " Tax";
		else return format(player.points, 2) + " Cash";
	},
	deactivated() {
		return inChallenge("SR", 22);
	},
	resource: "Cash",
	type: "none",
	image: "./resources/icons/cash.png",
	row: 0, // Row the layer is in on the tree (0 is the first row)
	tabFormat: {
		// #region Upgrades Tab
		Upgrades: {
			content: [
				"main-display",
				[
					"display-text",
					() =>
						`<div style="margin-top: -18px;">${
							canGenPoints()
								? `(${
										tmp.other.oompsMag != 0
											? format(tmp.other.oomps) +
											  " OOM" +
											  (tmp.other.oompsMag < 0
													? "^OOM"
													: tmp.other.oompsMag > 1
													? "^" + tmp.other.oompsMag
													: "") +
											  "s"
											: formatSmall(getPointGen())
								  }/sec)`
								: ""
						}</div>`,
				],
				"buyables",
				"upgrades",
			],
		},
		// #endregion
		// #region Machine Tab
		"The Machine": {
			content: [
				"main-display",
				[
					"display-text",
					() => {
						if (hasUpgrade("U", 34) || hasUpgrade("R", 21)) {
							return `The Machine can provide boosts to both Cash and RP, but selected boost(s) cannot be deselected.<br>Bonus is reset on Rebirth.`;
						}
						return "The Machine needs Cash Upgrade 12 to be bought to function";
					},
				],
				"clickables",
				[
					"display-text",
					() => {
						if (hasAchievement("A", 33)) {
							return (
								"Your external bonuses to The Machine are multiplying Cash and RP gain by " +
								format(machineBonuses())
							);
						}
					},
				],
			],
			unlocked() {
				return hasAchievement("A", 31);
			},
		},
	},
	// #endregion
	upgrades: {
		// #region Cash Upgrade 1
		11: {
			title: "Economic Inflation",
			description: () => {
				return `Start generating ${formatWhole(tmp.U.upgrades[11].effect)} Cash each second`;
			},
			cost: new Decimal(0),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effect() {
				return hasMilestone("P", 8) ? 100 : 1;
			},
		},
		// #endregion
		// #region Cash Upgrade 2
		12: {
			title: "Money Printer",
			description: () => (hasMilestone("P", 8) ? "Quintuple Cash gain" : "Quadruple Cash gain"),
			cost: new Decimal(10),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effect: () => (hasMilestone("P", 8) ? 5 : 4),
		},
		// #endregion
		// #region Cash Upgrade 3
		13: {
			title: "Superinflation",
			description: "Multiply Cash gain based on itself",
			tooltip: () => `log<sub>${tmp.U.upgrades[13].base}</sub>($ + ${tmp.U.upgrades[13].base})`,
			cost: new Decimal(50),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effectDisplay() {
				return `&times;${format(tmp.U.upgrades[13].effect)}`;
			},
			base() {
				let base = 5;
				if (hasMilestone("P", 8)) base -= 0.5;
				if (hasUpgrade("U", 23)) base -= 2;
				return base;
			},
			effect: () => player.points.add(tmp.U.upgrades[13].base).max(1).log(tmp.U.upgrades[13].base).max(1),
		},
		// #endregion
		// #region Cash Upgrade 4
		14: {
			title: "Another Money Printer",
			description: () => (hasMilestone("P", 8) ? "Triple Cash gain" : "Double Cash gain"),
			cost: new Decimal(200),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effect: () => (hasMilestone("P", 8) ? 3 : 2),
		},
		// #endregion
		// #region Cash Upgrade 5
		21: {
			title: "Hyperinflation",
			description: () => `Raise Cash gain by ^${format(tmp.U.upgrades[21].effect)}`,
			cost: new Decimal(500),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effect: () => (hasMilestone("P", 8) ? 1.3 : 1.25),
		},
		// #endregion
		// #region Cash Upgrade 6
		22: {
			title: "Ultrainflation",
			description: "Multiply Cash gain based on itself again",
			tooltip: () =>
				`(log<sub>${formatWhole(tmp.U.upgrades[22].base[0])}</sub>($<sup>${format(
					tmp.U.upgrades[22].base[1]
				)}</sup> + ${formatWhole(tmp.U.upgrades[22].base[1])}))<sup>${format(0.5)}</sup>`,
			cost: new Decimal(2000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effectDisplay: () => `&times;${format(tmp.U.upgrades[22].effect)}`,
			base() {
				let base = [8, 1.5];
				if (hasMilestone("P", 8)) {
					base[0] -= 1;
					base[1] += 0.25;
				}
				return base;
			},
			effect: () =>
				player.points
					.pow(tmp.U.upgrades[22].base[1])
					.add(tmp.U.upgrades[22].base[0])
					.max(1)
					.log(tmp.U.upgrades[22].base[0])
					.max(1)
					.pow(0.5),
		},
		// #endregion
		// #region Cash Upgrade 7
		23: {
			title: "Super-Superinflation",
			description: "Improve the above upgrades effect",
			tooltip: () => "log<sub>b</sub> &#8594; log<sub>b-2</sub>",
			cost: new Decimal(15000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
		},
		// #endregion
		// #region Cash Upgrade 8
		24: {
			title: "Yet Another Money Printer",
			description: () =>
				hasMilestone("P", 8) ? "Double Cash gain" : `Multiple Cash gain by &times;${format(1.5)}`,
			cost: new Decimal(30000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			effect: () => (hasMilestone("P", 8) ? 2 : 1.5),
		},
		// #endregion
		// #region Cash Upgrade 9
		31: {
			title: "Gigainflation",
			description: "Multiply Cash gain based on itself yet again",
			tooltip: () =>
				`(log<sub>${formatWhole(tmp.U.upgrades[31].base[0])}</sub>($ + ${formatWhole(
					tmp.U.upgrades[31].base[0]
				)}))<sup>0.5</sup>`,
			cost: new Decimal(5000000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 13);
			},
			effectDisplay: () => `&times;${format(tmp.U.upgrades[31].effect)}`,
			base() {
				let base = [10];
				if (hasMilestone("P", 8)) base[0] -= 2;
				return base;
			},
			effect: () =>
				player.points.add(tmp.U.upgrades[31].base[0]).max(1).log(tmp.U.upgrades[31].base[0]).max(1).pow(0.5),
		},
		// #endregion
		// #region Cash Upgrade 10
		32: {
			title: "Curses",
			description: "Increase Rebirth Points gain relative to Cash",
			tooltip: () => `^${format(0.5)} &#8594; ^${format(0.5 + tmp.U.upgrades[32].effect)}`,
			cost: new Decimal(35000000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 13);
			},
			effect: () => (hasMilestone("P", 8) ? 0.3 : 0.2),
		},
		// #endregion
		// #region Cash Upgrade 11
		33: {
			title: "Blessings",
			description: "Increase Rebirth Points' boost to Cash gain",
			tooltip: () => `^${format(0.6)} &#8594; ^${format(0.6 + tmp.U.upgrades[33].effect)}`,
			cost: new Decimal(250000000),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 13);
			},
			effect: () => (hasMilestone("P", 8) ? 0.2 : 0.1),
		},
		// #endregion
		// #region Cash Upgrade 12
		34: {
			title: "Mechanic's Dream",
			description: () =>
				`Unlock The Machine${
					hasMilestone("P", 8) ? `<br>Boosts to The Machine are raised ^${format(ue("U", 34))}` : ""
				}`,
			cost: new Decimal("1e9"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 13);
			},
			effect: () => (hasMilestone("P", 8) ? 1.25 : 1),
		},
		// #endregion
		// #region Cash Upgrade 13
		41: {
			title: "Payraise",
			description: () => `Multiply Cash gain by &times;${formatWhole(ue("U", 41))}`,
			cost: new Decimal("1e13"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 24);
			},
			effect: () => (hasMilestone("P", 8) ? 1000 : 10),
		},
		// #endregion
		// #region Cash Upgrade 14
		42: {
			title: "Prayers",
			description: "Boost Rebirth Points' boost to Cash gain again",
			tooltip: () => `^${format(0.6 + ue("U", 33))} &#8594; ^${format(0.6 + ue("U", 33) + ue("U", 42))}`,
			cost: new Decimal("5e14"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 24);
			},
			effect: () => (hasMilestone("P", 8) ? 0.2 : 0.1),
		},
		// #endregion
		// #region Cash Upgrade 15
		43: {
			title: "Synergism",
			description: "Slightly boost Cash and Rebirth Points gain based on each other",
			tooltip: () =>
				`RP&times;log<sub>${tmp.U.upgrades[43].bases[1]}</sub>(log<sub>${tmp.U.upgrades[43].bases[0]}</sub>
				($+${tmp.U.upgrades[43].bases[0]})+${tmp.U.upgrades[43].bases[1]})<br>
				$&times;log<sub>${tmp.U.upgrades[43].bases[2]}</sub>(RP+${tmp.U.upgrades[43].bases[2]})`,
			cost: new Decimal("3e15"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("R", 24);
			},
			effectDisplay: () => `<br>RP &times;${format(ue("U", 43)[0])}<br>$ &times;${format(ue("U", 43)[1])}`,
			effect() {
				const bases = tmp.U.upgrades[43].bases;
				return [
					player.points.add(bases[0]).max(1).log(bases[0]).add(bases[1]).max(1).log(bases[1]),
					player.R.points.add(bases[2]).max(1).log(bases[2]),
				];
			},
			bases() {
				if (!hasMilestone("P", 8)) {
					return [10, 10, 10];
				}
				return [9, 8, 8];
			},
		},
		// #endregion
		// #region Cash Upgrade 16
		44: {
			title: "Ankh",
			description: "Boost Rebirth Buyable 2's effect slightly",
			cost: new Decimal("1e25"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			tooltip() {
				if (!hasMilestone("P", 8)) return "+0.05 to base";
				if (hasMilestone("P", 8)) return "+0.15 to base";
			},
			unlocked() {
				return hasUpgrade("R", 24);
			},
		},
		// #endregion
		// #region Cash Upgrade 17
		51: {
			title: "Tesla Coils",
			description: "Multiply Cash gain by Power",
			cost: new Decimal("1e80"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasMilestone("P", 6);
			},
			effectDisplay() {
				return "&times;" + format(player.P.points, 2);
			},
		},
		// #endregion
		// #region Cash Upgrade 18
		52: {
			title: "Heavenly Batteries",
			description: "Multiply Rebirth Points gain based on Power",
			cost: new Decimal("1e92"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			tooltip: "log<sub>3</sub>(Power + 3)",
			unlocked() {
				return hasMilestone("P", 6);
			},
			effectDisplay() {
				return "&times;" + format(player.P.points.add(3).max(1).log(3), 2);
			},
		},
		// #endregion
		// #region Cash Upgrade 19
		53: {
			title: "Maybe too much inflation",
			description: "Unlock another challenge<br>This unlock is permanent",
			cost: new Decimal("1e95"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasMilestone("P", 6);
			},
		},
		// #endregion
		// #region Cash Upgrade 20
		54: {
			title: "Powerup",
			description: "Double efficiency of the Power Pylons A-C",
			cost: new Decimal("1e100"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			unlocked() {
				return hasMilestone("P", 6);
			},
		},
		// #endregion
	},
	layerShown() {
		return true;
	},
	clickables: {
		// #region Cash Mode Clickable
		11: {
			title: "Cash Mode",
			display() {
				if (!getClickableState(this.layer, this.id))
					return "Quadruples Cash gain<br>Doubles Rebirth Points gain";
				else return "Quadruples Cash gain<br>Doubles Rebirth Points gain<br>ACTIVE";
			},
			canClick() {
				if (hasUpgrade("R", 32)) return true;
				if (!hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 12) && !getClickableState(this.layer, 13)) return true;
					else return false;
				}
				if (hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 12) || !getClickableState(this.layer, 13)) return true;
					else return false;
				}
			},
			onClick() {
				setClickableState(this.layer, this.id, true);
			},
		},
		// #endregion
		// #region Neutral Mode Clickable
		12: {
			title: "Neutral Mode",
			display() {
				if (!getClickableState(this.layer, this.id)) return "Triples Cash gain<br>Triples Rebirth Points gain";
				else return "Triples Cash gain<br>Triples Rebirth Points gain<br>ACTIVE";
			},
			canClick() {
				if (hasUpgrade("R", 32)) return true;
				if (!hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 11) && !getClickableState(this.layer, 13)) return true;
					else return false;
				}
				if (hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 11) || !getClickableState(this.layer, 13)) return true;
					else return false;
				}
			},
			onClick() {
				setClickableState(this.layer, this.id, true);
			},
		},
		// #endregion
		// #region Rebirth Mode Clickable
		13: {
			title: "Rebirth Mode",
			display() {
				if (!getClickableState(this.layer, this.id))
					return "Doubles Cash gain<br>Quadruples Rebirth Points gain";
				else return "Doubles Cash gain<br>Quadruples Rebirth Points gain<br>ACTIVE";
			},
			canClick() {
				if (hasUpgrade("R", 32)) return true;
				if (!hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 11) && !getClickableState(this.layer, 12)) return true;
					else return false;
				}
				if (hasUpgrade("R", 31)) {
					if (!getClickableState(this.layer, 11) || !getClickableState(this.layer, 12)) return true;
					else return false;
				}
			},
			onClick() {
				setClickableState(this.layer, this.id, true);
			},
		},
		// #endregion
	},
	buyables: {
		// #region Cash Buyable 1
		11: {
			cost(x) {
				let y = x;
				if (hasMilestone("UMF", 2)) y = y.div(tmp.UMF.milestones[2].effect);
				let base = new Decimal(1000000).times(new Decimal(10).pow(y));
				return base;
			},
			title: "Pay to Win Afterlife",
			effect(x) {
				let base;
				if (!hasMilestone("SR", 3)) base = new Decimal(1.1).pow(x);
				if (hasMilestone("SR", 3)) base = new Decimal(1.3).pow(x);
				if (base.gte("1e500000"))
					base = base
						.div("1e500000")
						.pow(new Decimal(1).div(base.max(1).log(10).sub(499999).pow(0.2)))
						.times("1e500000");
				return base;
			},
			softcap(x) {
				let base;
				let softcaps;
				if (!hasMilestone("SR", 3)) base = new Decimal(1.1).pow(x);
				if (hasMilestone("SR", 3)) base = new Decimal(1.3).pow(x);
				if (base.gte("1e500000")) {
					softcaps = base.div(
						base
							.div("1e500000")
							.pow(new Decimal(1).div(base.max(1).log(10).sub(499999).pow(0.2)))
							.times("1e500000")
					);
					base = base
						.div("1e500000")
						.pow(new Decimal(1).div(base.max(1).log(10).sub(499999).pow(0.2)))
						.times("1e500000");
				}
				return softcaps;
			},
			buy() {
				player.points = player.points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			canAfford() {
				return player.points.gte(this.cost());
			},
			display() {
				let text =
					"Boost Rebirth Points gain<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Effect: &times;" +
					coolDynamicFormat(this.effect(), 2);

				if (this.softcap(getBuyableAmount("U", 11)) !== null)
					text =
						text +
						"<br>Effect past &times;1e500,000 is softcapped, reducing it by /" +
						format(this.softcap(getBuyableAmount("U", 11)));

				return text;
			},
			tooltip: "Effect: 1.1<sup>x</sup><br>Cost: 1,000,000&times;10<sup>x</sup>",
			unlocked() {
				return hasMilestone("SR", 2);
			},
		},
		// #endregion
		// #region Cash Buyable 2
		12: {
			cost(x) {
				return new Decimal("1e400").times(new Decimal(100000).pow(x).pow(0.1).pow(x));
			},
			title: "Time Manipulator",
			effect(x) {
				return new Decimal(1.2).pow(x);
			},
			buy() {
				player.points = player.points.sub(this.cost());
				setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
			},
			canAfford() {
				return player.points.gte(this.cost());
			},
			display() {
				return (
					"Boost Power Pylon efficiency<br>Cost: " +
					coolDynamicFormat(this.cost(), 3) +
					"<br>Count: " +
					coolDynamicFormat(getBuyableAmount(this.layer, this.id), 0) +
					"<br>Effect: &times;" +
					coolDynamicFormat(this.effect(), 2)
				);
			},
			tooltip: "Effect: 1.2<sup>x</sup><br>Cost: 1e450&times; ((1e5<sup>x</sup>)<sup>0.1</sup>)<sup>x</sup>",
			unlocked() {
				return hasMilestone("P", 10);
			},
		},
		// #endregion
	},
	// #region Reset Function
	doReset(resetlayer) {
		if (resetlayer == "R") {
			if (!hasMilestone("SR", 5)) player.U.upgrades = [];
			if (!inChallenge("SR", 21)) {
				if (hasMilestone("SR", 0)) player.U.upgrades.push(11, 12, 13, 14, 21, 22, 23, 24);
				if (hasMilestone("SR", 1)) player.U.upgrades.push(31, 32, 33);
				if (hasUpgrade("R", 21)) player.U.upgrades.push(34);
				if (hasMilestone("SR", 5)) player.U.upgrades.push(34, 41, 42, 43, 44);
			}
			if (inChallenge("SR", 21)) player.U.upgrades = [];
		}
		if (resetlayer == "SR") {
			if (!hasMilestone("SR", 5)) player.U.upgrades = [];
			if (!inChallenge("SR", 21)) {
				if (hasMilestone("SR", 0)) player.U.upgrades.push(11, 12, 13, 14, 21, 22, 23, 24);
				if (hasMilestone("SR", 1)) player.U.upgrades.push(31, 32, 33);
				if (!hasMilestone("SR", 3)) setBuyableAmount("U", 11, new Decimal(0));
				if (hasMilestone("SR", 5)) player.U.upgrades.push(34, 41, 42, 43, 44);
			}
			if (inChallenge("SR", 21)) player.U.upgrades = [];
		}
		if (resetlayer == "HC") {
			player.U.points = new Decimal(0);
			player.U.upgrades = [];
			setBuyableAmount("U", 11, new Decimal(0));
			setBuyableAmount("U", 12, new Decimal(0));
			player.U.upgrades.push[34];
		}
		if (!hasUpgrade("R", 32)) {
			setClickableState("U", 11, false);
			setClickableState("U", 12, false);
			setClickableState("U", 13, false);
		}
		if (hasUpgrade("R", 32)) {
			setClickableState("U", 11, true);
			setClickableState("U", 12, true);
			setClickableState("U", 13, true);
		}
	},
	// #endregion
	// #region Automation
	automate() {
		player.U.points = player.points;
		if (!inChallenge("SR", 21)) {
			if (hasUpgrade("R", 12) || hasAchievement("A", 43)) {
				buyUpgrade("U", 11);
				buyUpgrade("U", 12);
				buyUpgrade("U", 13);
				buyUpgrade("U", 14);
				buyUpgrade("U", 21);
				buyUpgrade("U", 22);
				buyUpgrade("U", 23);
				buyUpgrade("U", 24);
			}
			if (hasAchievement("A", 31)) {
				buyUpgrade("U", 31);
			}
			if (hasAchievement("A", 33)) {
				buyUpgrade("U", 32);
				buyUpgrade("U", 33);
				buyUpgrade("U", 34);
			}
			if (!hasMilestone("UMF", 1)) {
				if (tmp.U.buyables[11].canAfford && (hasMilestone("SR", 7) || hasAchievement("A", 81))) {
					setBuyableAmount("U", 11, getBuyableAmount("U", 11).add(1));
					if (hasMilestone("HC", 1)) setBuyableAmount("U", 11, getBuyableAmount("U", 11).add(9));
					if (hasMilestone("UMF", 1)) setBuyableAmount("U", 11, getBuyableAmount("U", 11).add(9990));
				}
				if (tmp.U.buyables[12].canAfford && (hasUpgrade("SR", 14) || hasAchievement("A", 81))) {
					setBuyableAmount("U", 12, getBuyableAmount("U", 12).add(1));
					if (hasMilestone("HC", 1)) setBuyableAmount("U", 12, getBuyableAmount("U", 12).add(9));
					if (hasMilestone("UMF", 1)) setBuyableAmount("U", 12, getBuyableAmount("U", 12).add(40));
				}
			} else {
				buyMax("Cash");
			}
			if (hasMilestone("HC", 3)) {
				buyUpgrade("U", 41);
				buyUpgrade("U", 42);
				buyUpgrade("U", 43);
				buyUpgrade("U", 44);
				buyUpgrade("U", 51);
				buyUpgrade("U", 52);
				buyUpgrade("U", 53);
				buyUpgrade("U", 54);
			}
		}

		if (!hasUpgrade("U", 34) && !hasAchievement("A", 81)) {
			setClickableState("U", 11, false);
			setClickableState("U", 12, false);
			setClickableState("U", 13, false);
		}
		if (hasUpgrade("R", 32)) {
			setClickableState("U", 11, true);
			setClickableState("U", 12, true);
			setClickableState("U", 13, true);
		}
	},
	// #endregion
	softcapPower() {
		return getPointGen(false).div(getPointGen(true));
	},
});
