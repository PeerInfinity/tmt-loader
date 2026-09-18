let modInfo = {
	name: "The Floppa Tree",
	id: "mymoddddddddddddflopoaflopppaaaaaaaaaaaaaafloppaamogussusubaka1i13irjhierhnwfr",
	author: "Magmalis",
	pointsName: "floppa points",
	modFiles: ["floplayer.js", "dumplingslayer.js", "achlayer.js", "binguslayer.js", "tree.js"],

	discordName: "Floppa",
	discordLink: "https://youtu.be/bWp2buuDWMY?si=dq6sKF0ydWAMKO2z",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.31",
	name: "Bugfix",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.0</h3><br>
		- Added game.<br>
		- Added floppa.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
if (hasUpgrade('f', 11)) gain = gain.times(2)
if (hasUpgrade('f', 12)) gain = gain.times(4)
if (hasUpgrade("f", 13)) gain = gain.mul(upgradeEffect("f", 13))
if (hasUpgrade('f', 14)) gain = gain.times(2)
if (hasUpgrade("f", 15)) gain = gain.mul(upgradeEffect("f", 15))
if (hasUpgrade('f', 21)) gain = gain.times(3)
if (hasUpgrade('f', 22)) gain = gain.times(2)
if (hasUpgrade('f', 23)) gain = gain.times(1.5)
if (hasUpgrade('f', 24)) gain = gain.times(1000)
if (inChallenge("b", 11)) gain = gain.div(1e9)
if (hasChallenge("b", 11)) gain = gain.times(20)
if (hasUpgrade("b", 11)) gain = gain.mul(upgradeEffect("b", 11))
if (hasUpgrade("b", 12)) gain = gain.mul(upgradeEffect("b", 12))
if (hasUpgrade("b", 13)) gain = gain.mul(upgradeEffect("b", 13))
if (inChallenge("b", 12)) gain = gain.div(upgradeEffect("b", 12))
if (inChallenge("b", 12)) gain = gain.div(1e15)
if (hasChallenge("b", 12)) gain = gain.mul(upgradeEffect("b", 12))
if (hasChallenge("b", 12)) gain = gain.mul(1e10)
if (hasChallenge("b", 12)) gain = gain.div(upgradeEffect("f", 13))
if (inChallenge("b", 13)) gain = gain.div(upgradeEffect("f", 15))
if (inChallenge("b", 13)) gain = gain.div(upgradeEffect("f", 15))
if (inChallenge("b", 13)) gain = gain.div(upgradeEffect("f", 15))
if (inChallenge("b", 13)) gain = gain.div(upgradeEffect("f", 15))
if (hasChallenge("b", 13)) gain = gain.mul(1e15)
if (hasUpgrade("d", 11)) gain = gain.mul(10)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.d.points.gte(new Decimal("1"))
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
function fixOldSave(oldVersion){
}