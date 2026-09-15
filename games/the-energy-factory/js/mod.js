let modInfo = {
	name: "The Energy Factory",
	id: "mymod",
	author: "CharizUniv",
	pointsName: "Energy",
	modFiles: ["layers/energy.js", "layers/surge.js", "layers/energybank.js", "layers/achievements.js", "layers/automation.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "The Spark",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Added Energy Generators and Upgrades.<br>
		- Added Surges.<br>
		- Added Energy Banks.<br>
		- Current endgame of 1e1000 Energy.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
	var startingPoints = new Decimal(modInfo.initialStartPoints)

	if (hasAchievement("ach", 24)) {
		startingPoints = new Decimal(1000)
	}
	return startingPoints
}

function energyCap() {
	var inSurgeChallenge = (inChallenge("surge", 11) || inChallenge("surge", 12) || inChallenge("surge", 21) || inChallenge("surge", 22) || inChallenge("surge", 31) || inChallenge("surge", 32))

	if (hasMilestone("surge", 6) && !inSurgeChallenge) {
		return new Decimal(1e10).pow(100)
    }

	var pointHardcapPow = new Decimal(player.surge.points).add(1).min(5)

	if (inChallenge("surge", 32)) {
		var completions = new Decimal(challengeCompletions("surge", 32)).add(1).min(5)

		pointHardcapPow = pointHardcapPow.mul(completions)
	}
	if (inChallenge("surge", 31)) {
		var completions = new Decimal(challengeCompletions("surge", 31)).add(1).min(5)

        pointHardcapPow = pointHardcapPow.mul(completions)
	}

	return new Decimal(1e20).pow(pointHardcapPow)
}

function getEffectiveEnergy() {
	var effectiveEnergy = player.points.max(0)
	if (hasUpgrade("surge", 11)) {
		effectiveEnergy = effectiveEnergy.pow(upgradeEffect("surge", 11))
    }

	return effectiveEnergy
}

// Determines if it should show points/sec
function canGenPoints() {
	if (player.points.gt(energyCap())) {
		player.points = energyCap()
	}
	if (player.points.gte(energyCap())) {
		return false
	}
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	gain = gain.add(player.energy.firstGen)
	if (hasUpgrade("energy", 13)) {
		gain = gain.times(upgradeEffect("energy", 13))
	}

	gain = gain.times(player.energy.secondGen.add(new Decimal(1)))
	gain = gain.times(player.energy.thirdGen.add(new Decimal(1)))

	if (inChallenge("surge", 21)) {
		var completions = new Decimal(challengeCompletions("surge", 21)).add(1).min(5)
		var timeMod = new Decimal(5).sub(completions).mul(0.5).add(3).mul(30)

		var bonus = new Decimal(timeMod).mul(10).sub(player.surge.resetTime).div(timeMod)
		bonus = new Decimal(bonus).pow(2).div(100)
		if (new Decimal(player.surge.resetTime).gte(timeMod.mul(10))) {
			bonus = new Decimal(0)
        }

		gain = gain.times(bonus)
    }

	if (hasUpgrade("energy", 12)) {
		gain = gain.times(upgradeEffect("energy", 12))
	}
	if (hasUpgrade("energy", 23)) {
		gain = gain.times(upgradeEffect("energy", 23))
	}
	if (hasUpgrade("energy", 24) && player.surge.points.gte(2)) {
		gain = gain.times(upgradeEffect("energy", 24))
	}
	if (hasAchievement("ach", 22)) {
		gain = gain.times(achievementEffect("ach", 22))
	}
	if (hasUpgrade("surge", 14)) {
		gain = gain.times(upgradeEffect("energy", 12))
	}
	gain = gain.times(buyableEffect("energy", 41))

	/*if (hasUpgrade('p', 11)) gain = new Decimal(1);
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 14)) gain = gain.times(upgradeEffect('p', 14))
	if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31))
	if (hasUpgrade('p', 33)) gain = gain.times(upgradeEffect('p', 33))
	if (hasMilestone('b', 2)) gain = gain.times(temp.b.milestones[2].effect)
	if (player.b.points > 0) gain = gain.times(temp.b.effect.pointBoost)*/

	//gain = gain.times(b.effect().pointBoost)
	/*if (hasUpgrade('tb', 11)) {
		if (hasUpgrade('tb', 21)) {
			if (hasUpgrade('tb', 31)) gain = gain.times(upgradeEffect('tb', 31))
			else gain = gain.times(upgradeEffect('tb', 21))
		}
		else gain = gain.times(upgradeEffect('tb', 11))
	}*/
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function () {
		if (player.points.lt(getEffectiveEnergy())) {
			return "Effective Energy: " + format(getEffectiveEnergy())
		}
		return ""
	},
	function() {
		return "Energy is capped at " + format(energyCap()) + "."
	},
	function () {
		if (inChallenge("surge", 21)) {
			var completions = new Decimal(challengeCompletions("surge", 21)).add(1).min(5)
			var timeMod = new Decimal(5).sub(completions).mul(0.5).add(3).mul(30)

			var bonus = new Decimal(timeMod).mul(10).sub(player.surge.resetTime).div(timeMod)
			bonus = new Decimal(bonus).pow(2)
			if (new Decimal(player.surge.resetTime).gte(timeMod.mul(10))) {
				bonus = new Decimal(0)
			}

			return "Energy Production: " + format(bonus) + "%"
		}
	},
]

// Determines when the game "ends"
function isEndgame() {
	return hasMilestone("energybank", 5)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {
}