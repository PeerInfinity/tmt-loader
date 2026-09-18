// Sonic challenges restart Gold and Gil while preserving both row-1 layers.
function resetSonicChallengeProgress() {
	player.points = getStartPoints()
	layerDataReset("g")
}

addLayer("g", {
	name: "Gil",
	symbol: "G",
	position: 0,
	row: 0,

	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
		}
	},

	color: "#F4D03F",
	requires: new Decimal(10),
	resource: "Gil",
	baseResource: "Gold",

	baseAmount() {
		return player.points
	},

	type: "normal",
	exponent: 0.5,

	gainMult() {
		let mult = new Decimal(1)

		if (hasUpgrade("g", 13)) {
			mult = mult.times(upgradeEffect("g", 13))
		}

		if (hasUpgrade("g", 15)) {
			mult = mult.times(2)
		}

		// Chemical Plant Zone disables Rupee milestones.
		if (!inChallenge("s", 12)) {
			if (hasMilestone("r", 1)) {
				mult = mult.times(2)
			}

			if (hasMilestone("r", 3)) {
				mult = mult.times(2)
			}
		}

		// Death Egg Zone disables Rupee upgrade effects.
		if (hasUpgrade("r", 12) && !inChallenge("s", 13)) {
			mult = mult.times(upgradeEffect("r", 12))
		}

		if (hasUpgrade("s", 13)) {
			mult = mult.times(upgradeEffect("s", 13))
		}

		return mult
	},

	gainExp() {
		return new Decimal(1)
	},

	passiveGeneration() {
		if (inChallenge("s", 11) || inChallenge("s", 13)) {
			return 0
		}

		if (!hasMilestone("r", 5)) {
			return 0
		}

		if (hasUpgrade("r", 13) && !inChallenge("s", 13)) {
			return 0.05
		}

		return 0.01
	},

	hotkeys: [
		{
			key: "g",
			description: "G: Reset for Gil",

			onPress() {
				if (canReset(this.layer)) {
					doReset(this.layer)
				}
			},
		},
	],

	upgrades: {
		11: {
			title: "FF I",
			description:
				"The beginning of the legend!<br><br>Start producing 1 Gold per second.",
			cost: new Decimal(1),
		},

		12: {
			title: "FF II",
			description:
				"The legend continues!<br><br>Increase Gold production based on your highest amount of Gil.",
			cost: new Decimal(3),

			unlocked() {
				return hasUpgrade("g", 11)
			},

			effect() {
				return player.g.best.add(1).pow(0.5)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		13: {
			title: "FF IV",
			description:
				"Wait... Where is III?<br><br>Increase Gil gain based on your current Gold.",
			cost: new Decimal(8),

			unlocked() {
				return hasUpgrade("g", 12)
			},

			effect() {
				return player.points.add(1).pow(0.25)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		14: {
			title: "FF V",
			description:
				"Now you have Blue Magic!<br><br>Multiply Gold production by 3.",
			cost: new Decimal(20),

			unlocked() {
				return hasUpgrade("g", 13)
			},
		},

		15: {
			title: "FF VI",
			description:
				"The GOAT.<br><br>Double Gil gain and unlock the Rupee layer.",
			cost: new Decimal(40),

			unlocked() {
				return hasUpgrade("g", 14)
			},
		},
	},

	doReset(resettingLayer) {
		if (layers[resettingLayer].row <= this.row) return

		let keptUpgrades = []

		if (resettingLayer === "r" && hasUpgrade("r", 14)) {
			keptUpgrades = [11, 12, 13, 14, 15]
		}

		layerDataReset(this.layer)
		player[this.layer].upgrades = keptUpgrades
	},

	automate() {
		if (!hasChallenge("s", 13)) return

		for (const id of [11, 12, 13, 14, 15]) {
			buyUpgrade("g", id)
		}
	},

	layerShown() {
		return true
	},
})

addLayer("r", {
	name: "Rupee",
	symbol: "R",
	branches: ["g"],
	position: 0,
	row: 1,

	startData() {
		return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	color: "#2ECC71",
	requires: new Decimal(75),
	resource: "Rupee",
	baseResource: "Gil",

	baseAmount() {
		return player.g.points
	},

	type: "static",
	exponent: 0.7,

	gainMult() {
		return new Decimal(1)
	},

	gainExp() {
		return new Decimal(1)
	},

	hotkeys: [
		{
			key: "r",
			description: "R: Reset for Rupees",

			onPress() {
				if (canReset(this.layer)) {
					doReset(this.layer)
				}
			},
		},
	],

	milestones: {
		0: {
			requirementDescription: "1 Rupee",

			done() {
				return player.r.best.gte(1)
			},

			effectDescription:
				"It's dangerous to go alone. Take this!<br>Double Gold production.",
		},

		1: {
			requirementDescription: "2 Rupees",

			done() {
				return player.r.best.gte(2)
			},

			effectDescription:
				"A familiar melody guides you forward.<br>Double Gil gain.",

			unlocked() {
				return hasMilestone("r", 0)
			},
		},

		2: {
			requirementDescription: "3 Rupees",

			done() {
				return player.r.best.gte(3)
			},

			effectDescription:
				"Hey, listen!<br>Double Gold production again.",

			unlocked() {
				return hasMilestone("r", 1)
			},
		},

		3: {
			requirementDescription: "4 Rupees",

			done() {
				return player.r.best.gte(4)
			},

			effectDescription:
				"Your wallet grows heavier.<br>Double Gil gain again.",

			unlocked() {
				return hasMilestone("r", 2)
			},
		},

		4: {
			requirementDescription: "5 Rupees",

			done() {
				return player.r.best.gte(5)
			},

			effectDescription:
				"The Triforce resonates with your journey.<br>Double Gold production again.",

			unlocked() {
				return hasMilestone("r", 3)
			},
		},

		5: {
			requirementDescription: "6 Rupees",

			done() {
				return player.r.best.gte(6)
			},

			effectDescription:
				"A new path opens.<br>Passively gain 1% of pending Gil per second and unlock Rupee upgrades.",

			unlocked() {
				return hasMilestone("r", 4)
			},
		},
	},

	upgrades: {
		11: {
			title: "The Legend of Zelda",
			description:
				"The adventure begins.<br><br>Your best Rupees boost Gold production.",
			cost: new Decimal(6),

			unlocked() {
				return hasMilestone("r", 5)
			},

			effect() {
				return player.r.best.add(1).pow(0.5)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		12: {
			title: "Zelda II: The Adventure of Link",
			description:
				"A different journey begins.<br><br>Your best Rupees boost Gil gain.",
			cost: new Decimal(9),

			unlocked() {
				return hasUpgrade("r", 11)
			},

			effect() {
				return player.r.best.add(1).pow(0.5)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		13: {
			title: "A Link to the Past",
			description:
				"The past empowers the present.<br><br>Increase passive Gil generation from 1% to 5% of pending Gil per second.",
			cost: new Decimal(13),

			unlocked() {
				return hasUpgrade("r", 12)
			},
		},

		14: {
			title: "Link's Awakening",
			description:
				"The dream continues.<br><br>Keep every Gil upgrade when performing a Rupee reset.",
			cost: new Decimal(18),

			unlocked() {
				return hasUpgrade("r", 13)
			},
		},

		15: {
			title: "Ocarina of Time",
			description:
				"The song of time reveals another path.<br><br>Unlock the Ring layer.",
			cost: new Decimal(25),

			unlocked() {
				return hasUpgrade("r", 14)
			},
		},
	},

	layerShown() {
		return player.r.unlocked || hasUpgrade("g", 15)
	},
})

addLayer("s", {
	name: "Rings",
	symbol: "O",
	branches: ["g"],
	position: 1,
	row: 1,

	startData() {
		return {
			unlocked: true,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
		}
	},

	// Sonic blue. This controls the node, upgrades and challenges.
	color: "#1E90FF",

	requires: new Decimal("1e6"),
	resource: "Rings",
	baseResource: "Gil",

	baseAmount() {
		return player.g.points
	},

	type: "normal",

	exponent() {
		return hasUpgrade("s", 14) ? 0.3 : 0.25
	},

	gainMult() {
		let mult = new Decimal(1)

		if (hasUpgrade("s", 11)) {
			mult = mult.times(2)
		}

		if (hasChallenge("s", 11)) {
			mult = mult.times(2)
		}

		if (hasChallenge("s", 12)) {
			mult = mult.times(3)
		}

		return mult
	},

	gainExp() {
		return new Decimal(1)
	},

	// Rings cannot be reset while inside a Sonic challenge.
	canReset() {
		return !player.s.activeChallenge &&
			player.g.points.gte(this.requires)
	},

	upgrades: {
		11: {
			title: "Sonic the Hedgehog",
			description:
				"The fastest thing alive enters the race.<br><br>Double Ring gain.",
			cost: new Decimal(10),
		},

		12: {
			title: "Sonic the Hedgehog 2",
			description:
				"A new friend joins the adventure.<br><br>Your best Rings boost Gold production.",
			cost: new Decimal(30),

			unlocked() {
				return hasUpgrade("s", 11)
			},

			effect() {
				return player.s.best.add(1).pow(0.15)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		13: {
			title: "Sonic CD",
			description:
				"The future changes the present.<br><br>Your best Rings boost Gil gain.",
			cost: new Decimal(75),

			unlocked() {
				return hasUpgrade("s", 12)
			},

			effect() {
				return player.s.best.add(1).pow(0.1)
			},

			effectDisplay() {
				return "x" + format(upgradeEffect(this.layer, this.id))
			},
		},

		14: {
			title: "Sonic the Hedgehog 3",
			description:
				"The race reaches new heights.<br><br>Improve the Ring gain exponent from 0.25 to 0.3.",
			cost: new Decimal(200),

			unlocked() {
				return hasUpgrade("s", 13)
			},
		},

		15: {
			title: "Sonic & Knuckles",
			description:
				"Rivals become allies.<br><br>Unlock Sonic challenges.",
			cost: new Decimal(500),

			unlocked() {
				return hasUpgrade("s", 14)
			},
		},
	},

	challenges: {
		11: {
			name: "Green Hill Zone",
			challengeDescription:
				"Passive Gil generation is disabled.",
			goalDescription:
				"Reach 100,000,000 Gil",
			rewardDescription:
				"Double Ring gain.",

			unlocked() {
				return hasUpgrade("s", 15)
			},

			canComplete() {
				return player.g.points.gte(new Decimal("1e8"))
			},

			onEnter() {
				resetSonicChallengeProgress()
			},

			onExit() {
				resetSonicChallengeProgress()
			},
		},

		12: {
			name: "Chemical Plant Zone",
			challengeDescription:
				"All Rupee milestone multipliers are disabled.",
			goalDescription:
				"Reach 100,000,000,000 Gil",
			rewardDescription:
				"Triple Ring gain.",

			unlocked() {
				return hasChallenge("s", 11)
			},

			canComplete() {
				return player.g.points.gte(new Decimal("1e11"))
			},

			onEnter() {
				resetSonicChallengeProgress()
			},

			onExit() {
				resetSonicChallengeProgress()
			},
		},

		13: {
			name: "Death Egg Zone",
			challengeDescription:
				"All Rupee upgrade effects and passive Gil generation are disabled.",
			goalDescription:
				"Reach 10,000,000,000 Gil",
			rewardDescription:
				"Automatically buy FF I, FF II, FF IV, FF V, and FF VI.",

			unlocked() {
				return hasChallenge("s", 12)
			},

			canComplete() {
				return player.g.points.gte(new Decimal("1e10"))
			},

			onEnter() {
				resetSonicChallengeProgress()
			},

			onExit() {
				resetSonicChallengeProgress()
			},
		},
	},

	layerShown() {
		return hasUpgrade("r", 15)
	},
})