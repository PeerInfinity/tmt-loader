addLayer("SR", {
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			tax: new Decimal(1),
		};
	},
	row: "2",
	image: "./resources/icons/super_rebirth.png",
	canBuyMax() {
		return hasMilestone(this.layer, 2);
	},
	color: "#eb1a3d",
	nodeStyle: {
		"background-color": "#750202",
	},
	resource: "Super Rebirth Points",
	requires() {
		let req = new Decimal(1e19);
		if (hasUpgrade("HC", 31)) req = req.div("1e9");
		if (hasUpgrade("HC", 34)) req = req.div(100000);
		return req;
	},
	type: "static",
	base: new Decimal(2),
	exponent: new Decimal(1),
	roundUpCost: true,
	baseResource: "RP",
	branches: ["R"],
	tabFormat: {
		Boosts: {
			content: ["main-display", "prestige-button", "resource-display", "upgrades", "milestones"],
		},
		Challenges: {
			content: [
				[
					"display-text",
					"Entering a challenge forces a Super Rebirth reset<br>Whilst inside of a challenge, various nerfs are applied to you<br>A challenge can be completed after reaching its goal, which will vary between the challenges<br>After completing a challenge, a powerful upgrade is applied for free",
				],
				"blank",
				"h-line",
				"blank",
				"challenges",
			],
		},
	},
	baseAmount() {
		return player.R.points;
	},
	layerShown() {
		return hasAchievement("A", 41);
	},
	effect() {
		let pow = new Decimal(1);
		if (hasUpgrade("R", 34)) pow = pow.add(1);
		return [player.SR.points.pow(pow).times(1.5).add(1), player.SR.points.pow(pow.sub(0.5)).add(1)];
	},
	effectDescription() {
		return (
			"boosting RP gain by &times;" +
			coolDynamicFormat(this.effect()[1], 2) +
			" and Cash gain by &times;" +
			coolDynamicFormat(this.effect()[0], 2)
		);
	},
	milestones: {
		0: {
			requirementDescription: "1 SRP",
			effectDescription: "Cash Upgrades 1-8 are kept on all resets, and Rebirth Buyables don't spend RP.",
			done() {
				return player.SR.points.gte(1);
			},
		},
		1: {
			requirementDescription: "2 SRP",
			effectDescription:
				"Keep first 4 Rebirth Upgrades on Super Rebirth, and keep Cash Upgrades 9-11 on all resets",
			done() {
				return player.SR.points.gte(2);
			},
		},
		2: {
			requirementDescription: "3 SRP",
			effectDescription: "Unlock a Cash buyable (kept on Rebirths), and the ability to buy max SRP",
			done() {
				return player.SR.points.gte(3);
			},
		},
		3: {
			requirementDescription: "5 SRP",
			effectDescription:
				"<b>ALL</b> buyables are kept on Super Rebirths, keep Rebirth Upgrade 6-7 on Super Rebirths, boost the Cash Buyable, and unlock the first challenge",
			done() {
				return player.SR.points.gte(5);
			},
			tooltip: "Cash Buyable boost: 1.1<sup>x</sup> &#8594; 1.3<sup>x</sup>",
		},
		4: {
			requirementDescription: "8 SRP",
			effectDescription: "Boost Cash gain ^1.1",
			done() {
				return player.SR.points.gte(8);
			},
		},
		5: {
			requirementDescription: "12 SRP",
			effectDescription:
				"Keep <b>ALL</b> Cash and Rebirth Upgrades on Rebirth and Super Rebirth, and unlock the second challenge",
			done() {
				return player.SR.points.gte(12);
			},
		},
		6: {
			requirementDescription: "18 SRP",
			effectDescription: "Unlock more upgrades (above milestone affects them)",
			done() {
				return player.SR.points.gte(18);
			},
		},
		7: {
			requirementDescription: "20 SRP",
			effectDescription: "Automate all currently unlocked buyables",
			done() {
				return player.SR.points.gte(20);
			},
		},
		8: {
			requirementDescription: "25 SRP",
			effectDescription: "Unlock Power",
			done() {
				return player.SR.points.gte(25);
			},
		},
		9: {
			requirementDescription: "100 SRP",
			effectDescription: "Every bought upgrade before Super Rebirth increases Cash gain by 40% (exponential)",
			done() {
				return player.SR.points.gte(100);
			},
			effect() {
				let upgs = new Decimal(1);

				if (hasUpgrade("U", 11)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 12)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 13)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 14)) upgs = upgs.times(1.4);

				if (hasUpgrade("U", 21)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 22)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 23)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 24)) upgs = upgs.times(1.4);

				if (hasUpgrade("U", 31)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 32)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 33)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 34)) upgs = upgs.times(1.4);

				if (hasUpgrade("U", 41)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 42)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 43)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 44)) upgs = upgs.times(1.4);

				if (hasUpgrade("U", 51)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 52)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 53)) upgs = upgs.times(1.4);
				if (hasUpgrade("U", 54)) upgs = upgs.times(1.4);

				if (hasUpgrade("R", 11)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 12)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 13)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 14)) upgs = upgs.times(1.4);

				if (hasUpgrade("R", 21)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 22)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 23)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 24)) upgs = upgs.times(1.4);

				if (hasUpgrade("R", 31)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 32)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 33)) upgs = upgs.times(1.4);
				if (hasUpgrade("R", 34)) upgs = upgs.times(1.4);

				return upgs;
			},
			tooltip() {
				return "Currently: &times;" + coolDynamicFormat(this.effect(), 2);
			},
		},
		10: {
			requirementDescription: "Unlock the Fourth Challenge",
			effectDescription: "Keep the fourth challenge unlocked even when Cash Upgrade 19 is locked or removed",
			done() {
				return hasUpgrade("U", 53);
			},
			unlocked() {
				return hasUpgrade("U", 53);
			},
		},
	},
	challenges: {
		11: {
			name: "Betrayed Gods",
			challengeDescription: "You cannot Rebirth",
			canComplete() {
				return player.points.gte(30000000);
			},
			unlocked() {
				return hasMilestone(this.layer, 3);
			},
			rewardDescription: "Gain 20% of RP gain every second",
			goalDescription: "Reach 30,000,000 Cash",
		},
		12: {
			name: "A Low Income Family<br>in the Midst of<br>Inflation",
			challengeDescription: "Cash gain ^0.5 and Rebirth requirement &times;10",
			canComplete() {
				return player.R.points.gte("1e15");
			},
			unlocked() {
				return hasMilestone(this.layer, 5);
			},
			rewardDescription: "Rebirth Requirement /10",
			goalDescription: "Reach 1e15 Rebirth Points",
		},
		21: {
			name: "Clicking Simulator<br>202X",
			challengeDescription: "Nothing is kept on any resets and all automation is disabled",
			canComplete() {
				return player.R.points.gte("1e20");
			},
			unlocked() {
				return hasMilestone("P", 1);
			},
			rewardDescription: "Boost automatic Rebirth Points gain by &times;10 and also reduce RP buyables scaling",
			goalDescription: "Reach 1e20 Rebirth Points",
			onEnter() {
				player.U.upgrades = [];
				player.R.upgrades = [];
				setBuyableAmount("U", 11, new Decimal(0));
				setBuyableAmount("R", 11, new Decimal(0));
				setBuyableAmount("R", 12, new Decimal(0));
			},
		},
		22: {
			name: "Sold Out",
			challengeDescription:
				"Cash Upgrades and The Machine are disabled, but, you passively gain 1 Cash per second",
			canComplete() {
				return player.R.points.gte("1e30");
			},
			unlocked() {
				return hasMilestone("SR", 10);
			},
			rewardDescription: "Unlock Power Pylon D, and Cash boosts Super Rebirth Points gain slightly",
			goalDescription: "Reach 4e36 Rebirth Points",
			rewardEffect() {
				return player.points.add(10).max(1).log(10).pow(0.1);
			},
			rewardDisplay() {
				return (
					"Raising Super Rebirth Points cost by ^" +
					coolDynamicFormat(new Decimal(1).div(tmp.SR.challenges[22].rewardEffect), 4)
				);
			},
		},
		31: {
			name: "Tax Evasion Simulator",
			challengeDescription() {
				return (
					"There is rapidly increasing Tax that divides Cash gain<br>" +
					formatWhole(challengeCompletions("SR", 31)) +
					"/4 Completions"
				);
			},
			canComplete() {
				return player.R.points.gte(
					new Decimal("1e50").times(new Decimal(1000).pow(challengeCompletions("SR", 31)))
				);
			},
			unlocked() {
				return hasMilestone("P", 7);
			},
			rewardDescription:
				"Boost each Power Pylon based on the previous Power Pylon<br>On first completion unlock Power Pylon E<br>On final completion unlock Power Pylon F",
			goalDescription() {
				let goal = new Decimal("1e50").times(new Decimal(1000).pow(challengeCompletions("SR", 31)));
				return "Reach " + coolDynamicFormat(goal, 0) + " Rebirth Points";
			},
			rewardEffect() {
				return new Decimal(50).div(new Decimal(1.5).pow(challengeCompletions("SR", 31)));
			},
			rewardDisplay() {
				return (
					"Multiplies by log<sub>" + coolDynamicFormat(this.rewardEffect(), 0) + "</sub> of previous Pylon"
				);
			},
			completionLimit: new Decimal(4),
			onEnter() {
				player.SR.tax = new Decimal(10).pow(challengeCompletions("SR", 31));
			},
			style() {
				if (challengeCompletions("SR", 31) < 4)
					return {
						width: "450px",
						"background-color": "#bf8f8f",
					};
				else if (inChallenge("SR", 31) && tmp.SR.challenges[31].canComplete)
					return {
						width: "450px",
						"background-color": "#ffbf00",
					};
				else
					return {
						width: "450px",
						"background-color": "#77bf5f",
					};
			},
		},
	},
	position: 0,
	gainExp() {
		let expo = new Decimal(1);
		if (hasChallenge("SR", 22)) expo = expo.times(player.points.add(10).max(1).log(10).pow(0.1));
		if (hasUpgrade("SR", 12)) expo = expo.times(1.5);
		return expo;
	},
	directMult() {
		let mult = new Decimal(1);
		mult = mult.times(tmp.HC.effect[1]);
		if (hasUpgrade("HC", 33)) mult = mult.times(tmp.C.effect[2]);
		mult = mult.times(tmp.UMF.effect2);
		return mult;
	},
	update(diff) {
		if (inChallenge("SR", 31)) {
			player.SR.tax = player.SR.tax.times(
				new Decimal(0.2)
					.times(new Decimal(2).pow(challengeCompletions("SR", 31)))
					.add(1)
					.pow(diff)
			);
		}
	},
	upgrades: {
		11: {
			unlocked() {
				return hasMilestone("P", 10);
			},
			cost: new Decimal("1e600"),
			currencyDisplayName: "Cash",
			currencyInternalName: "points",
			title: "Unstoppable",
			description: "Raise Rebirth Points gain by ^1.05",
		},
		12: {
			unlocked() {
				return hasMilestone("P", 10);
			},
			cost: new Decimal("1e270"),
			currencyDisplayName: "Rebirth Points",
			currencyInternalName: "points",
			currencyLayer() {
				return "R";
			},
			title: "Unyeilding",
			description: "Raise Super Rebirth Points cost by ^0.66",
		},
		13: {
			unlocked() {
				return hasMilestone("P", 10);
			},
			cost: new Decimal(2600),
			currencyDisplayName: "SRP",
			title: "Unlimited",
			description: "Raise Power Pylon effect by ^1.2",
		},
		14: {
			unlocked() {
				return hasMilestone("P", 10);
			},
			cost: new Decimal("1e160"),
			currencyDisplayName: "Power",
			currencyInternalName: "points",
			currencyLayer() {
				return "P";
			},
			title: "Unrelenting",
			description: "Automate the second Cash Buyable<br>And unlock another upgrade...",
		},
		21: {
			style: {
				width: "480px",
				"border-bottom-right-radius": "20px",
			},
			unlocked() {
				return hasUpgrade("SR", 14);
			},
			title: "Unending",
			description:
				"Unlock Hyper Rebirth<br>Hyper Rebirth Point gain is based on Cash, Super Rebirth Points, and Power",
			cost: new Decimal(5000),
		},
	},
	automate() {
		if (hasMilestone("HC", 3)) {
			buyUpgrade("SR", 11);
			buyUpgrade("SR", 12);
			buyUpgrade("SR", 13);
			buyUpgrade("SR", 14);
		}
		if (hasMilestone("UMF", 0)) {
			buyUpgrade("SR", 21);
		}
	},
	milestonePopups() {
		return !hasMilestone("HC", 1);
	},
	resetsNothing() {
		return hasMilestone("HC", 4);
	},
	autoPrestige() {
		return hasMilestone("HC", 5);
	},
	hotkeys: [
		{
			key: "s", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
			description: "S: Super Rebirth", // The description of the hotkey that is displayed in the game's How To Play tab
			onPress() {
				if (player.SR.unlocked) doReset("SR");
			},
			unlocked() {
				return player.SR.unlocked;
			}, // Determines if you can use the hotkey, optional
		},
	],
	doReset(resetlayer) {
		completeChallenge("SR");
		if (resetlayer === "HC") {
			player.SR.points = new Decimal(0);
			player.SR.milestones = [];
			player.SR.upgrades = [];
			if (!hasMilestone("HC", 2)) player.SR.challenges = { 11: 0, 12: 0, 21: 0, 22: 0, 31: 0 };
			player.SR.milestones.push(2, 6, 7);
			if (hasUpgrade("HC", 12)) player.SR.milestones.push(8);
			if (hasUpgrade("HC", 31)) player.SR.points.add(12);
		}
	},
});

addLayer("P", {
	name: "power",
	symbol: "P",
	image: "./resources/icons/power.png",
	row: "2",
	resource: "Power",
	color: "#ebe46a",
	type: "custom",
	baseAmount() {
		return player.SR.points;
	},
	baseResource: "SRP",
	resetsNothing: true,
	requires: new Decimal(25),
	getResetGain() {
		return new Decimal(1);
	},
	getNextAt() {
		return new Decimal(25);
	},
	canReset() {
		return !hasMilestone("P", 0) && player.SR.points.gte(25);
	},
	tooltip() {
		return coolDynamicFormat(player.P.points, 2) + " Power";
	},
	prestigeButtonText() {
		return "Unlock Power";
	},
	branches: [["SR", 1]],
	layerShown() {
		return hasAchievement("A", 45);
	},
	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			pylonA: new Decimal(1),
			pylonB: new Decimal(0),
			pylonC: new Decimal(0),
			pylonD: new Decimal(0),
			pylonE: new Decimal(0),
			pylonF: new Decimal(0),
			pylobA: new Decimal(0),
			pylobB: new Decimal(0),
			pylobC: new Decimal(0),
			pylobD: new Decimal(0),
			pylobE: new Decimal(0),
			pylobF: new Decimal(0),
		};
	},
	update(diff) {
		if (hasMilestone("SR", 8)) player.P.unlocked = true;
		if (hasMilestone("SR", 8)) player.P.points = player.P.points.add(tmp.P.clickables[11].effect.times(diff));
		if (hasMilestone("SR", 8)) player.P.pylonA = player.P.pylonA.add(tmp.P.clickables[12].effect.times(diff));
		if (hasMilestone("SR", 8)) player.P.pylonB = player.P.pylonB.add(tmp.P.clickables[13].effect.times(diff));
		if (hasMilestone("SR", 8)) player.P.pylonC = player.P.pylonC.add(tmp.P.clickables[14].effect.times(diff));
		if (hasMilestone("SR", 8)) player.P.pylonD = player.P.pylonD.add(tmp.P.clickables[15].effect.times(diff));
		if (hasMilestone("SR", 8)) player.P.pylonE = player.P.pylonE.add(tmp.P.clickables[16].effect.times(diff));
	},
	effect() {
		return player.P.points.div(100).add(1);
	},
	effectDescription() {
		return "boosting The Machine by &times;" + coolDynamicFormat(tmp.P.effect, 3);
	},
	position: 1,
	milestones: {
		0: {
			requirementDescription: "1 Power",
			effectDescription: "Unlock Power Pylons",
			done() {
				return player.P.points.gte(1);
			},
		},
		1: {
			requirementDescription: "2 Power Pylon A (PPyA)",
			effectDescription: "Unlock another challenge",
			done() {
				return player.P.pylobA.gte(2);
			},
		},
		2: {
			requirementDescription: "20 Power",
			effectDescription: "Unlock Power Pylon B (PPyB)",
			done() {
				return player.P.points.gte(20);
			},
		},
		3: {
			requirementDescription: "5 PPyB",
			effectDescription: "Each manually bought Power Pylon boosts its own type by &times;1.15 (exponential)",
			done() {
				return player.P.pylobB.gte(5);
			},
		},
		4: {
			requirementDescription: "15,000 Power",
			effectDescription: "Boost PPyA's effect by &times;5",
			done() {
				return player.P.points.gte(15000);
			},
		},
		5: {
			requirementDescription: "100,000 Power",
			effectDescription: "Unlock Power Pylon C",
			done() {
				return player.P.points.gte(100000);
			},
		},
		6: {
			requirementDescription: "1,000,000 Power",
			effectDescription: "Slightly reduce Power Pylon Costs, and unlock some more upgrades",
			done() {
				return player.P.points.gte("1e6");
			},
		},
		7: {
			requirementDescription: "123,456,789 Power",
			effectDescription: "Unlock the final challenge",
			done() {
				return player.P.points.gte("123456789");
			},
		},
		8: {
			requirementDescription: "1e18 Power",
			effectDescription: "Boost the first 16 Cash upgrades (Cash Upgrades v2)",
			done() {
				return player.P.points.gte("1e18");
			},
		},
		9: {
			requirementDescription: "1e20 Power",
			effectDescription: "Reduce PPyF cost by /SRP, PPyE by /SRP<sup>2</sup> ... PPyA by /SRP<sup>6</sup>",
			done() {
				return player.P.points.gte("1e20");
			},
		},
		10: {
			requirementDescription: "12 PPyF",
			effectDescription: "Unlock another Cash Buyable, and unlock some more Super Rebirth Upgrades",
			done() {
				return player.P.pylobF.gte(12);
			},
		},
		11: {
			requirementDescription: "1e60 Power",
			effectDescription: "Automate PPyA-C, and Power Pylons no longer spend their cost",
			done() {
				return player.P.points.gte("1e60");
			},
		},
		12: {
			requirementDescription: "1e120 Power",
			effectDescription: "Automate PPyD-E",
			done() {
				return player.P.points.gte("1e120");
			},
		},
	},
	tabFormat: {
		Boosts: {
			content: ["main-display", "blank", "milestones", "upgrades"],
		},
		"Power Pylons": {
			content: ["main-display", "clickables"],
		},
	},
	automate() {
		if (!hasMilestone("UMF", 1)) {
			if (hasMilestone("P", 11) || hasAchievement("A", 81)) {
				if (player.P.points.gte(tmp.P.clickables[11].cost) && (hasMilestone("P", 0) || hasUpgrade("HC", 32))) {
					player.P.pylonA = player.P.pylonA.add(1);
					player.P.pylobA = player.P.pylobA.add(1);
					if (hasMilestone("HC", 1)) {
						player.P.pylonA = player.P.pylonA.add(9);
						player.P.pylobA = player.P.pylobA.add(9);
					}
				}
				if (player.P.pylonA.gte(tmp.P.clickables[12].cost) && (hasMilestone("P", 2) || hasUpgrade("HC", 32))) {
					player.P.pylonB = player.P.pylonB.add(1);
					player.P.pylobB = player.P.pylobB.add(1);
					if (hasMilestone("HC", 1)) {
						player.P.pylonB = player.P.pylonB.add(9);
						player.P.pylobB = player.P.pylobB.add(9);
					}
				}
				if (player.P.pylonB.gte(tmp.P.clickables[13].cost) && (hasMilestone("P", 5) || hasUpgrade("HC", 32))) {
					player.P.pylonC = player.P.pylonC.add(1);
					player.P.pylobC = player.P.pylobC.add(1);
					if (hasMilestone("HC", 1)) {
						player.P.pylonC = player.P.pylonC.add(9);
						player.P.pylobC = player.P.pylobC.add(9);
					}
				}
			}
			if (hasMilestone("P", 12) || hasAchievement("A", 81)) {
				if (
					player.P.pylonC.gte(tmp.P.clickables[14].cost) &&
					(hasChallenge("SR", 22) || hasUpgrade("HC", 32))
				) {
					player.P.pylonD = player.P.pylonD.add(1);
					player.P.pylobD = player.P.pylobD.add(1);
					if (hasMilestone("HC", 1)) {
						player.P.pylonD = player.P.pylonD.add(9);
						player.P.pylobD = player.P.pylobD.add(9);
					}
				}
				if (
					player.P.pylonD.gte(tmp.P.clickables[15].cost) &&
					(hasChallenge("SR", 31) || hasUpgrade("HC", 32))
				) {
					player.P.pylonE = player.P.pylonE.add(1);
					player.P.pylobE = player.P.pylobE.add(1);
					if (hasMilestone("HC", 1)) {
						player.P.pylonE = player.P.pylonE.add(9);
						player.P.pylobE = player.P.pylobE.add(9);
					}
				}
			}
			if (hasUpgrade("HC", 32)) {
				if (player.P.pylonE.gte(tmp.P.clickables[16].cost)) {
					player.P.pylonF = player.P.pylonF.add(10);
					player.P.pylobF = player.P.pylobF.add(10);
				}
			}
		} else {
			buyMax("Power");
		}
	},
	clickables: {
		11: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon A",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" Power" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonA, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobA, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" Power/s"
				);
			},
			canClick() {
				return player[this.layer].points.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].points = player[this.layer].points.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonA = player.P.pylonA.add(amt);
				player.P.pylobA = player.P.pylobA.add(amt);
			},
			unlocked() {
				return hasMilestone("P", 0) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("A", player.P.pylonA, player.P.pylobA);
			},
			cost() {
				let expo = new Decimal(1.5);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(6));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				if (player.P.pylobA.gte(1001)) expo = expo.add(player.P.pylobA.sub(1000).div(100).pow(2));
				return expo.pow(player.P.pylobA).div(divi);
			},
		},
		12: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon B",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" PPyA" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonB, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobB, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" PPyA/s"
				);
			},
			canClick() {
				return player[this.layer].pylonA.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].pylonA = player[this.layer].pylonA.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonB = player.P.pylonB.add(amt);
				player.P.pylobB = player.P.pylobB.add(amt);
			},
			unlocked() {
				return hasMilestone("P", 2) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("B", player.P.pylonB, player.P.pylobB);
			},
			cost() {
				let expo = new Decimal(2);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(5));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (player.P.pylobB.gte(1001)) expo = expo.add(player.P.pylobB.sub(1000).div(100).pow(2));
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				return expo.pow(player.P.pylobB).div(divi);
			},
		},
		13: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon C",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" PPyB" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonC, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobC, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" PPyB/s"
				);
			},
			canClick() {
				return player[this.layer].pylonB.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].pylonB = player[this.layer].pylonB.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonC = player.P.pylonC.add(amt);
				player.P.pylobC = player.P.pylobC.add(amt);
			},
			unlocked() {
				return hasMilestone("P", 5) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("C", player.P.pylonC, player.P.pylobC);
			},
			cost() {
				let expo = new Decimal(2.5);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(4));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (player.P.pylobC.gte(1001)) expo = expo.add(player.P.pylobC.sub(1000).div(100));
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				return expo.pow(player.P.pylobC).div(divi);
			},
		},
		14: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon D",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" PPyC" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonD, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobD, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" PPyC/s"
				);
			},
			canClick() {
				return player[this.layer].pylonC.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].pylonC = player[this.layer].pylonC.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonD = player.P.pylonD.add(amt);
				player.P.pylobD = player.P.pylobD.add(amt);
			},
			unlocked() {
				return hasChallenge("SR", 22) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("D", player.P.pylonD, player.P.pylobD);
			},
			cost() {
				let expo = new Decimal(3);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(3));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (player.P.pylobD.gte(1001)) expo = expo.add(player.P.pylobD.sub(1000).div(100));
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				return expo.pow(player.P.pylobD).div(divi);
			},
		},
		15: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon E",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" PPyD" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonE, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobE, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" PPyD/s"
				);
			},
			canClick() {
				return player[this.layer].pylonD.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].pylonD = player[this.layer].pylonD.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonE = player.P.pylonE.add(amt);
				player.P.pylobE = player.P.pylobE.add(amt);
			},
			unlocked() {
				return hasChallenge("SR", 31) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("E", player.P.pylonE, player.P.pylobE);
			},
			cost() {
				let expo = new Decimal(3.5);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(2));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (player.P.pylobE.gte(1001)) expo = expo.add(player.P.pylobE.sub(1000).div(100));
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				return expo.pow(player.P.pylobE).div(divi);
			},
		},
		16: {
			style: {
				height: "100px",
				width: "200px",
			},
			title: "Power Pylon F",
			display() {
				return (
					"Cost: " +
					coolDynamicFormat(this.cost(), 2) +
					" PPyE" +
					"<br>Count: " +
					coolDynamicFormat(player.P.pylonF, 2) +
					" [" +
					coolDynamicFormat(player.P.pylobF, 0) +
					"]" +
					"<br>Producing +" +
					coolDynamicFormat(this.effect(), 3) +
					" PPyE/s"
				);
			},
			canClick() {
				return player[this.layer].pylonE.gte(this.cost());
			},
			onClick() {
				if (!hasMilestone("P", 11)) player[this.layer].pylonE = player[this.layer].pylonE.sub(this.cost());
				let amt = new Decimal(1);
				player.P.pylonF = player.P.pylonF.add(amt);
				player.P.pylobF = player.P.pylobF.add(amt);
			},
			unlocked() {
				return maxedChallenge("SR", 31) || hasUpgrade("HC", 33);
			},
			effect() {
				return pPylon("F", player.P.pylonF, player.P.pylobF);
			},
			cost() {
				let expo = new Decimal(4);
				let divi = new Decimal(1);
				if (hasMilestone("P", 6)) expo = expo.sub(0.05);
				if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1));
				if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
				if (player.P.pylobF.gte(1001)) expo = expo.add(player.P.pylobF.sub(1000).div(100));
				if (hasUpgrade("HC", 34)) divi = divi.times(100000);
				return expo.pow(player.P.pylobF).div(divi);
			},
		},
		21: {
			unlocked() {
				return true;
			},
			onClick() {
				buyMax("Power");
			},
			title: "Buy Max Power Pylons",
			canClick() {
				return true;
			},
		},
	},
	doReset(resetlayer) {
		if (resetlayer == "HC") {
			if (!hasUpgrade("HC", 32)) player.P.milestones = [8, 10];
			player.P.points = new Decimal(0);

			player.P.pylonA = new Decimal(1);
			player.P.pylonB = new Decimal(0);
			player.P.pylonC = new Decimal(0);
			player.P.pylonD = new Decimal(0);
			player.P.pylonE = new Decimal(0);
			player.P.pylonF = new Decimal(0);

			player.P.pylobA = new Decimal(0);
			player.P.pylobB = new Decimal(0);
			player.P.pylobC = new Decimal(0);
			player.P.pylobD = new Decimal(0);
			player.P.pylobE = new Decimal(0);
			player.P.pylobF = new Decimal(0);
			if (hasUpgrade("HC", 12)) player.P.points = player.P.points.add(1);
		}
	},
	milestonePopups() {
		return !hasMilestone("HC", 1);
	},
});

function pPylon(pylon, pylons, pylobs) {
	let effect = pylons.div(10);

	// Pylob Innate Bonus
	if (hasMilestone("P", 3)) effect = effect.times(new Decimal(1.15).pow(pylobs));

	// Super Layer
	if (hasMilestone("P", 4) && pylon == "A") effect = effect.times(5);
	if (hasUpgrade("HC", 14) && pylon == "A") effect = effect.times(100);
	if (hasUpgrade("HC", 41) && pylon == "A") effect = effect.times(tmp.UMF.effect2);
	if (hasUpgrade("U", 54 && (pylon == "A" || pylon == "B" || pylon == "C"))) effect = effect.times(2);

	if (hasChallenge("SR", 31) && pylon == "A")
		effect = effect.times(
			player.P.points.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);
	if (hasChallenge("SR", 31) && pylon == "B")
		effect = effect.times(
			player.P.pylonA.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);
	if (hasChallenge("SR", 31) && pylon == "C")
		effect = effect.times(
			player.P.pylonB.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);
	if (hasChallenge("SR", 31) && pylon == "D")
		effect = effect.times(
			player.P.pylonC.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);
	if (hasChallenge("SR", 31) && pylon == "E")
		effect = effect.times(
			player.P.pylonD.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);
	if (hasChallenge("SR", 31) && pylon == "F")
		effect = effect.times(
			player.P.pylonE.add(tmp.SR.challenges[31].rewardEffect).max(1).log(tmp.SR.challenges[31].rewardEffect)
		);

	effect = effect.times(tmp.U.buyables[12].effect);
	if (hasUpgrade("SR", 13)) effect = effect.pow(1.2);

	// Hyper Layer
	effect = effect.times(tmp.HC.effect[2]);
	if (hasUpgrade("HC", 12)) effect = effect.times(2);
	if (hasUpgrade("HC", 22)) effect = effect.times(5);
	if (hasUpgrade("HC", 24)) effect = effect.times(200);

	return effect;
}
