addLayer("A", {
	name: "achievements",
	symbol: "🏆",
	row: "side",
	type: "none",
	resource: "achievements",
	color: "#FFEE88",
	tooltip: "Achievements",
	startData() {
		return {
			unlocked: true,
		};
	},
	update() {
		let title = "Create Incremental";
		if (!hasUpgrade("A", 21)) {
			title = "Create Incremental, " + formatWhole(player.points) + " Cash";
			changeFavicon("favicon.ico");
		}
		if (hasAchievement("A", 21) && !hasUpgrade("A", 43)) {
			title = "Create Incremental, " + formatWhole(player.R.points) + " RP";
			changeFavicon("rebirthfavicon.ico");
		}
		if (hasAchievement("A", 43) && !hasAchievement("A", 52)) {
			title = "Create Incremental, " + formatWhole(player.SR.points) + " SRP";
			changeFavicon("superrebirthfavicon.ico");
		}
		if (hasAchievement("A", 52) && !hasAchievement("A", 83)) {
			title =
				"Create Incremental, " +
				formatWhole(player.SR.points) +
				" SRP, " +
				formatWhole(player.P.points) +
				" Power";
			changeFavicon("powerfavicon.ico");
		}
		if (hasAchievement("A", 83) && !hasAchievement("A", 101)) {
			title =
				"Create Incremental, " +
				formatWhole(player.HC.points) +
				" HRP, " +
				formatWhole(player.C.points) +
				" Hyper Cash";
			changeFavicon("hyperrebirthfavicon.ico");
		}
		if (hasAchievement("A", 101)) {
			title = "Create Incremental, " + formatWhole(player.HC.points) + " HRP";
			changeFavicon("hyperrebirthfavicon.ico");
		}
		document.title = title;
	},
	tabFormat: {
		Achievements: {
			content: ["achievements"],
		},
		Secrets: {
			content: [
				[
					"layer-proxy",
					[
						"SA",
						[
							[
								"display-text",
								"Secret Achievements are not required for progression<br>Most Secret Achievements will become impossible if too much progression is made before unlocking them<br>Each Secret Achievement has its own color theme<br><br>Good luck<br><br>",
							],
							"h-line",
							"achievements",
						],
					],
				],
			],
		},
	},
	achievements: {
		// #region Achievement 1
		11: {
			name: "Freebie",
			tooltip: "Start producing Cash",
			done() {
				if (hasUpgrade("U", 11)) return true;
			},
		},
		// #endregion
		// #region Achievement 2
		12: {
			name: "100 antimatter is a lot!",
			tooltip: "Reach 100 Cash",
			done() {
				if (player.points.gte(100)) return true;
			},
		},
		// #endregion
		// #region Achievement 3
		13: {
			name: "We couldn't afford 9",
			tooltip: "Purchase Cash Upgrade 8",
			done() {
				if (hasUpgrade("U", 24)) return true;
			},
		},
		// #endregion
		// #region Achievement 4
		14: {
			name: "Who Wants to be a Millionaire?",
			tooltip: "Reach a <i>million</i> Cash",
			done() {
				if (player.points.gte(1000000)) return true;
			},
		},
		// #endregion
		// #region Achievement 5
		15: {
			name: "Very Rich Person",
			tooltip: "Become the richest person in the world",
			done() {
				if (player.points.gte("320e9")) return true;
			},
		},
		// #endregion
		// #region Achievement 6
		21: {
			name: "Take 2",
			tooltip: "Gain your first Rebirth Point",
			done() {
				if (player.R.points.gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 7
		22: {
			name: "More Upgrades! Yay!",
			tooltip: "Purchase Rebirth Upgrade 1",
			done() {
				if (hasUpgrade("R", 11)) return true;
			},
		},
		// #endregion
		// #region Achievement 8
		23: {
			name: "We <i>could</i> afford 9",
			tooltip: "Purchase Cash Upgrade 9",
			done() {
				if (hasUpgrade("U", 31)) return true;
			},
		},
		// #endregion
		// #region Achievement 9
		24: {
			name: "Life and Death",
			tooltip: "Purchase Rebirth Upgrade 5",
			done() {
				if (hasUpgrade("R", 21)) return true;
			},
		},
		// #endregion
		// #region Achievement 10
		25: {
			name: "Endless Cycle",
			tooltip: () => `Get ${formatWhole(1e5)} Rebirth Points`,
			done() {
				if (player.R.points.gte(100000)) return true;
			},
		},
		// #endregion
		// #region Achievement 11
		31: {
			name: "Mechanical Mechanic",
			tooltip: "Unlock The Machine<br>Reward: Automate Cash Upgrade 9",
			done() {
				if (hasUpgrade("U", 34)) return true;
			},
		},
		// #endregion
		// #region Achievement 12
		32: {
			name: "Both is good",
			tooltip: "Unlock the ability to use two of The Machines modes at once",
			done() {
				if (achievement33()) return true;
			},
		},
		// #endregion
		// #region Achievement 13
		33: {
			name: "Braindead",
			tooltip: "Remove the need to choose between modes<br>Reward: Automate Cash Upgrade 10-12",
			done() {
				if (hasUpgrade("R", 32)) return true;
			},
		},
		// #endregion
		// #region Achievement 14
		34: {
			name: "Infinite Upgrades",
			tooltip: "Purchase Rebirth Buyable 1",
			done() {
				if (getBuyableAmount("R", 11).gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 15
		35: {
			name: "Perfectly Balanced",
			tooltip: "Purchase Rebirth Buyable 2",
			done() {
				if (getBuyableAmount("R", 12).gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 16
		41: {
			name: "Wow, a content",
			tooltip: "Purchase Rebirth Upgrade 8",
			done() {
				if (hasUpgrade("R", 24)) return true;
			},
		},
		// #endregion
		// #region Achievement 17
		42: {
			name: "Super Duper Uber Rebirth",
			tooltip: () => `Reach ${format(1e19)} RP<br>Reward: Automation is never lost`,
			done() {
				if (player.R.points.gte("1e19")) return true;
			},
		},
		// #endregion
		// #region Achievement 18
		43: {
			name: "Can't wait for Hyper Rebirth",
			tooltip: "Perform a Super Rebirth",
			done() {
				if (player.SR.points.gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 19
		44: {
			name: "Monetary Incentive",
			tooltip: "Purchase Cash Buyable 1",
			done() {
				if (getBuyableAmount("U", 11).gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 20
		45: {
			name: "The Ninth Milestone is a Lie",
			tooltip: "Get Super Milestone 8",
			done() {
				if (hasMilestone("SR", 7)) return true;
			},
		},
		// #endregion
		// #region Achievement 21
		51: {
			name: "Unchallenged",
			tooltip: "Complete Super Challenge 1",
			done() {
				if (hasChallenge("SR", 11)) return true;
			},
		},
		// #endregion
		// #region Achievement 22
		52: {
			name: "Powerful",
			tooltip: "Unlock Power",
			done() {
				if (hasMilestone("SR", 8)) return true;
			},
		},
		// #endregion
		// #region Achievement 23
		53: {
			name: "Megawatt",
			tooltip: () => `Reach ${formatWhole(1e6)} Power`,
			done() {
				if (player.P.points.gte(1000000)) return true;
			},
		},
		// #endregion
		// #region Achievement 24
		54: {
			name: "Googology",
			tooltip: "Reach a Googol Cash",
			done() {
				if (player.points.gte("1e100")) return true;
			},
		},
		// #endregion
		// #region Achievement 25
		55: {
			name: "We couldn't afford 7",
			tooltip: "Purchase PPyF",
			done() {
				if (player.P.pylobF.gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 26
		61: {
			name: "Googology 2",
			tooltip: () => `Reach ${format(1e200)} Cash`,
			done() {
				if (player.points.gte("1e200")) return true;
			},
		},
		// #endregion
		// #region Achievement 27
		62: {
			name: "Rebirth Googology",
			tooltip: "Reach a Googol Rebirth Points",
			done() {
				if (player.R.points.gte("1e100")) return true;
			},
		},
		// #endregion
		// #region Achievement 28
		63: {
			name: "Power Hungry",
			tooltip: () => `Reach ${format(1e10)} Power`,
			done() {
				if (player.P.points.gte("1e50")) return true;
			},
		},
		// #endregion
		// #region Achievement 29
		64: {
			name: "Super Super Rebirth'd",
			tooltip: () => `Reach ${formatWhole(500)} SRP`,
			done() {
				if (player.SR.points.gte(500)) return true;
			},
		},
		// #endregion
		// #region Achievement 30
		65: {
			name: "To Infinity, and Beyond!",
			tooltip: "Reach Infinity",
			done() {
				if (player.points.gte(Decimal.dNumberMax)) return true;
			},
		},
		// #endregion
		// #region Achievement 31
		71: {
			name: "Kilometrerock",
			tooltip: "Get Power Milestone 12",
			done() {
				if (hasMilestone("P", 12)) return true;
			},
		},
		// #endregion
		// #region Achievement 32
		72: {
			name: "Super Upgraded",
			tooltip: "Purchase Super Upgrade 4",
			done() {
				if (hasUpgrade("SR", 14)) return true;
			},
		},
		// #endregion
		// #region Achievement 33
		73: {
			name: "Number go brrrrrrrrrrrrrr",
			tooltip: () => `Reach ${format('e1000')} Cash`,
			done() {
				if (player.points.gte("1e1000")) return true;
			},
		},
		// #endregion
		// #region Achievement 34
		74: {
			name: "Unlimited Power",
			tooltip: () => `Reach ${format(1e100)} Power`,
			done() {
				if (player.P.points.gte("1e100")) return true;
			},
		},
		// #endregion
		// #region Achievement 35
		75: {
			name: "Just getting started",
			tooltip: "Purchase Omega",
			done() {
				if (hasUpgrade("SR", 21)) return true;
			},
		},
		// #endregion
		// #region Achievement 36
		81: {
			name: "The Basic Path",
			tooltip: "Start the Basic Path",
			done() {
				if (hasUpgrade("HC", 11)) return true;
			},
		},
		// #endregion
		// #region Achievement 37
		82: {
			name: "The Machine's Path",
			tooltip: "Start the Machine's Path",
			done() {
				if (hasUpgrade("HC", 12)) return true;
			},
		},
		// #endregion
		// #region Achievement 38
		83: {
			name: "Hyper Rebirth?",
			tooltip: "Go Hyper",
			done() {
				if (player.HC.points.gte(1)) return true;
			},
		},
		// #endregion
		// #region Achievement 39
		84: {
			name: "The Hyper Path",
			tooltip: "Start the Hyper Path",
			done() {
				if (hasUpgrade("HC", 13)) return true;
			},
		},
		// #endregion
		// #region Achievement 40
		85: {
			name: "The Combined Path",
			tooltip: "Start the Combined Path",
			done() {
				if (hasUpgrade("HC", 14)) return true;
			},
		},
		// #endregion
		// #region Achievement 41
		91: {
			name: "Learning the Basics",
			tooltip: "Complete the Basic Path",
			done() {
				if (hasUpgrade("HC", 31)) return true;
			},
		},
		// #endregion
		// #region Achievement 42
		92: {
			name: "Complex Machinery",
			tooltip: "Complete the Machine's Path",
			done() {
				if (hasUpgrade("HC", 32)) return true;
			},
		},
		// #endregion
		// #region Achievement 43
		93: {
			name: "Master of Reality",
			tooltip: "Complete all Paths",
			done() {
				if (hasUpgrade("HC", 31) && hasUpgrade("HC", 32) && hasUpgrade("HC", 33) && hasUpgrade("HC", 34))
					return true;
			},
		},
		// #endregion
		// #region Achievement 44
		94: {
			name: "God of Hyperdeath",
			tooltip: "Complete the Hyper Path",
			done() {
				if (hasUpgrade("HC", 33)) return true;
			},
		},
		// #endregion
		// #region Achievement 45
		95: {
			name: "By Our Power Combined",
			tooltip: "Complete the Combined Path",
			done() {
				if (hasUpgrade("HC", 34)) return true;
			},
		},
		// #endregion
		// #region Achievement 46
		101: {
			name: "Material Possessions",
			tooltip: "Unlock the Matter Combustor",
			done() {
				if (hasUpgrade("HC", 41)) return true;
			},
		},
		// #endregion
		// #region Achievement 47
		102: {
			name: "Nothing Matters",
			tooltip: "Annihilate Matter",
			done() {
				if (hasUpgrade("HC", 51)) return true;
			},
		},
		// #endregion
		// #region Achievement 48
		103: {
			name: "Antimatter Dimensions",
			tooltip: "Annihilate Antimatter",
			done() {
				if (hasUpgrade("HC", 52)) return true;
			},
		},
		// #endregion
		// #region Achievement 49
		104: {
			name: "Born from Void",
			tooltip: "Annihilate Dark Matter",
			done() {
				if (hasUpgrade("HC", 53)) return true;
			},
		},
		// #endregion
		// #region Achievement 50
		105: {
			name: "Dying Stars",
			tooltip: "Annihilate Exotic Matter",
			done() {
				if (hasUpgrade("HC", 54)) return true;
			},
		},
		// #endregion
	},
});

addLayer("SA", {
	name: "secret-achievements",
	symbol: "🔮",
	// row: "side",
	type: "none",
	resource: "secretachievements",
	color: "#9966BB",
	tooltip: "SecretAchievements",
	tabFormat: [
		[
			"display-text",
			"Secret Achievements are only visible once completed<br>Most Secret Achievements will become impossible if too much progression is made before unlocking them<br>Each Secret Achievement will also eventually have its own exclusive visual theme (available in options) once I figure out how to do that<br>There will be a surprise for getting all of them once there are enough of them for it to be interesting",
		],
		[
			"display-text",
			"<br>There is currently 1 Secret Achievement<br>Every Secret Achievement has a hint when hovering over them to make them possible to obtain without searching up the answers (you'll do it anyways)",
		],
		"h-line",
		"achievements",
	],
	unlocked: true,
	achievements: {
		// #region Secret 1
		11: {
			name: "Out of Order",
			tooltip() {
				if (!hasAchievement(this.layer, this.id)) return "That's not going to do anything";
				return "Buy Cash Upgrade 7 before Cash Upgrade 3<br>Reward: unlock the quality theme<br>That's not going to do anything";
			},
			unlocked() {
				return true;
			},
			done() {
				return !hasUpgrade("U", 13) && hasUpgrade("U", 23);
			},
		},
		// #endregion
		// #region Secret 2
		12: {
			name: "Can't Escape the IRS",
			tooltip() {
				if (!hasAchievement(this.layer, this.id)) return "Infinite tax";
				return "Get Infinite tax<br>Reward: unlock the golden theme<br>Infinite Tax";
			},
			unlocked() {
				return true;
			},
			done() {
				return player.SR.tax.gte(Decimal.dNumberMax);
			},
		},
		// #endregion
		// #region Secret 3
		13: {
			name: "Blinded",
			tooltip() {
				if (!hasAchievement(this.layer, this.id)) return "ARGH, MY EYES!!";
				return "Use a bright theme<br>Reward: unlock the void theme<br>ARGH, MY EYES!!";
			},
			unlocked() {
				return true;
			},
			done() {
				return (
					options.theme == "quality" ||
					options.theme == "light" ||
					options.theme == "auqa" ||
					options.theme == "tnadrev" ||
					options.theme == "oryp" ||
					options.theme == "enacra"
				);
			},
		},
		// #endregion
		// #region Secret 4
		14: {
			name: "Following Instructions",
			tooltip() {
				if (!hasAchievement(this.layer, this.id)) return "Follow instructions";
				return "Import 'save'<br>Reward: unlock the light theme<br>Follow instructions";
			},
			unlocked() {
				return true;
			},
			done() {
				return player.SA14 === true;
			},
		},
		// #endregion
		// #region Secret 5
		15: {
			name: "Backup",
			tooltip() {
				if (!hasAchievement(this.layer, this.id)) return "No Hints Here!";
				return "Export your save<br>Reward: unlock the auqa, oryp, tnadrev and enacra themes";
			},
			unlocked() {
				return true;
			},
			done() {
				return player.SA15 === true;
			},
		},
		// #endregion
	},
});

addLayer("Sft", {
	name: "softcaps",
	symbol: "📈",
	row: "side",
	type: "none",
	resource: "(softcapped)",
	color: "#cccccc",
	tooltip: "Softcaps",
	startData() {
		return {
			unlocked: true,
		};
	},
	infoboxes: {
		general: {
			title: "Overall Information",
			body: "This tab contains spoilers, to a similar degree as reading the first few lines of every updates changelog<br><br>Softcaps have a start value and a power.<br>The power of a softcap is basically a divisor on the amount of OoM's (Order's of Magnitude) beyond the start value.<br>Some softcaps are also logarithmic, meaning that the amount of extra OoM's past the starting value is based on the log of OoM's past the start amount.",
		},
		rebirth: {
			title: "Rebirth Layer",
			body: "Rebirth Point Gain<br>Beyond 1e17 Rebirth Points, gain is softcapped with a power of 4<br>Beyond 1e2000 Rebirth Points, gain is softcapped again with a power of 5, multiplying to 20<br>All multipliers from Hyper or further bypass the first two softcaps",
			unlocked() {
				return player.R.unlocked;
			},
		},
		hyper: {
			title: "Hyper Rebirth Layer",
			body: "Hyper Cash Gain<br>Beyond 100, gain is logarithmically reduced<br><br>Hyper Essence<br>Beyond 2,500, the amount if softcapped with a power of 5",
			unlocked() {
				return player.HC.unlocked;
			},
		},
	},
	tabFormat: [
		["infobox", "general"],
		["infobox", "rebirth"],
		["infobox", "hyper"],
	],
	layerShown() {
		return false;
	},
});
