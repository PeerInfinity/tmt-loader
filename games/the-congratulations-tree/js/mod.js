let modInfo = {
	name: "The Congratulations Tree",
	author: "Moon Charm Muahaha",
	pointsName: "Congratulations Buttons",
	modFiles: ["statix.js", "moon.js", "liz.js", "cud.js", "lostcat.js", "fizzy.js", "tree.js", "achievements.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(13), // Used for hard resets and new players
	offlineLimit: 1.3,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.13 (DEMO)",
	name: "God said: Let there be Congratulations",
}

let changelog =
	`<h1>Changelog:</h1><br>
	<h3>v0.13</h3><br>
		- Added the Fizzy Layer<br>
		- Reworked the Lostcat Layer<br>
		- Expanded the Moon, Liz, and Cud layers<br>
	<br><br>
	<h3>Release: v0.1</h3><br>
		- Added the Lostcat Layer<br>
	<br><br>
	<h3>Pre-Release: v0.013</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints() {
	return true
}

// Calculate points/sec!
function getPointGen() {
	if (!canGenPoints())
		return decimalZero

	let gain = decimalOne

	if (hasAchievement("achievements", 11)) {
		gain = gain.times(3.90)
	}
	if (hasAchievement("achievements", 13)) {
		gain = gain.times(7)
	}
	if (hasAchievement("achievements", 14)) {
		mult = mult.times(4)
	}

	if (hasUpgrade("main", 11)) {
		gain = gain.times(1.50)
	}
	if (hasUpgrade("liz", 11)) {
		gain = gain.times(7)
	}
	if (hasUpgrade("moon", 12)) {
		gain = gain.times(0.13)
	}
	if (hasUpgrade("main", 13)) {
		gain = gain.times(upgradeEffect("main", 13))
	}
	if (hasUpgrade("moon", 14)) {
		gain = gain.times(13)
	}
	if (hasUpgrade("liz", 14)) {
		gain = gain.times(0.1)
	}
	if (hasUpgrade("main", 15)) {
		gain = gain.times(upgradeEffect("main", 15))
	}
	if (hasUpgrade("main", 17)) {
		gain = gain.times(3)
	}
	if (hasUpgrade("main", 19)) {
		gain = gain.times(15)
	}
	if (hasUpgrade("main", 23)) {
		gain = gain.times(0.1)
	}
	if (hasUpgrade("main", 33)) {
		gain = gain.times(200)
	}
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return {
	}
}

// Display extra things at the top of the page
// Display extra things at the top of the page
var displayThings = []
displayThings[0] = "<br>"
displayThings[1] = "Waiting for tips to initialize..."

setInterval(function () {
	var tips = [
		"This tip is useless.",
		"Go play DAC",
		"Go play RGV",
		"Go play ST",
		"Cuddy Bluddy My Best Buddy",
		"Honestly quite incredible",
		"I'm statix and I voice fear!",
		"Hello there",
		"13",
		"Cone doesn't exist.",
		"meow",
		":3",
		"meow meow meow meow meow",
		"dr.sex",
		"Hey guys!"
	]
	tips.push('There are currently ' + tips.length + ' tips in the game')
	var rng = new Decimal(Math.random()).times(tips.length).floor()

	displayThings[1] = tips[rng]
}, 3000)

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e1313"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return (3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {
}