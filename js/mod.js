let modInfo = {
	name: "The Ultimate Prestige Tree",
	author: "RaceDev",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Final",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff. <br>
		<h3>v0.1</h3><br>
		- Added Omega layer.<br>
		- Added more milestones.<br>
		- Added more upgrades.<br>`

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

    if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasMilestone('p', 0)) gain = gain.times(10)
	if (hasUpgrade('r', 11)) gain = gain.times(2)
	if (hasUpgrade('r', 12)) gain = gain.times(upgradeEffect('r', 12))
	if (hasUpgrade('r', 13)) gain = gain.pow(1.3)
	if (hasUpgrade('r', 15)) gain = gain.times(upgradeEffect('r', 15))
	if (hasUpgrade('p', 14)) gain = gain.times(10)
	if (hasMilestone('r', 0)) gain = gain.pow(1.5)
	if (hasMilestone('d', 0)) gain = gain.times(5)
	if (hasMilestone('d', 1)) gain = gain.pow(1.5)
	if (inChallenge('d', 11)) gain = gain.pow(0.01)
	if (hasMilestone('d', 3)) gain = gain.pow(1.5)
	if (hasMilestone('d', 5)) gain = gain.pow(2)
	if (hasMilestone('d', 6)) gain = gain.pow(1.3)
	if (hasMilestone('d', 7)) gain = gain.pow(10)
	if (hasMilestone('d', 8)) gain = gain.pow(3)
	if (hasUpgrade('d', 11)) gain = gain.tetrate(1.1)
	if (hasUpgrade('d', 12)) gain = gain.times(upgradeEffect('d', 12))
	if (hasMilestone('o', 2)) gain = gain.tetrate(1.5)
	if (hasMilestone('o', 5)) gain = gain.pow(100)
	if (hasMilestone('o', 7)) gain = gain.times("1e10000")
	
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"<br><h3> Endgame: 80 Omega points </h3>",
]

// Determines when the game "ends"
function isEndgame() {
	return player.o.points.gte(80)
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
