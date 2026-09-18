let modInfo = {
	name: "The Genesis Tree",
	id: "genesistree",
	author: "lingluo",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js","achievements.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Getting started",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added particle interaction layers.<br>
		- Added Space and Time layers.<br>
		- Added Mass layer but nothing in it yet.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
	let points = new Decimal(modInfo.initialStartPoints)
	if (hasMilestone('i',0)) points = points.add(10)
    return points
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade('p',11)
}

// Calculate points/sec!
function getPointGen() {
	if(!hasUpgrade('p',11)) return decimalZero
	
	let gain = new Decimal(1)
	if (hasUpgrade('p',12)) gain = gain.mul(layerEffect('p'))
	if (hasUpgrade('p',14)) gain = gain.mul(upgradeEffect('p',14))
	if (hasUpgrade('i',14)) gain = gain.mul(layerEffect('i'))
	if (player.t.unlocked) gain = gain.mul(layerEffect('t'))
	if (hasUpgrade('s',11)) gain = gain.mul(layerEffect('s'))
	
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	shiftAlias: false,
	controlAlias: false
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e1145141919810"))
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