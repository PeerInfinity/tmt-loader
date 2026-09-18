let modInfo = {
	name: "The Video Coin Tree",
	author: "Masutaki",
	pointsName: "Gold",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10),
	offlineLimit: 1,
}

let VERSION = {
	num: "0.1",
	name: "The Big Three",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 - The Big Three</h3><br>
		- Added Game.<br>
		- Added 3 layers.<br>
		- Added 3 challenges.`

let winText = `Congratulations! You have conquered the Death Egg Zone and completed the current version of the game.`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints() {
	return true
}

function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(0)

	if (hasUpgrade("g", 11)) {
		gain = gain.add(1)
	}

	if (hasUpgrade("g", 12)) {
		gain = gain.times(upgradeEffect("g", 12))
	}

	if (hasUpgrade("g", 14)) {
		gain = gain.times(3)
	}

	// Chemical Plant Zone disables all Rupee milestone multipliers.
	if (!inChallenge("s", 12)) {
		if (hasMilestone("r", 0)) {
			gain = gain.times(2)
		}

		if (hasMilestone("r", 2)) {
			gain = gain.times(2)
		}

		if (hasMilestone("r", 4)) {
			gain = gain.times(2)
		}
	}

	// Death Egg Zone disables Rupee upgrade effects.
	if (hasUpgrade("r", 11) && !inChallenge("s", 13)) {
		gain = gain.times(upgradeEffect("r", 11))
	}

	// Sonic the Hedgehog 2 boosts Gold.
	if (hasUpgrade("s", 12)) {
		gain = gain.times(upgradeEffect("s", 12))
	}

	return gain
}

function addedPlayerData() {
	return {}
}

var displayThings = []

function isEndgame() {
	return hasChallenge("s", 13)
}

var backgroundStyle = {}

function maxTickLength() {
	return 3600
}

function fixOldSave(oldVersion) {
}