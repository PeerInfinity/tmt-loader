let modInfo = {
	name: "The Colour Tree",
	author: "Grassyhead13",
	pointsName: "colour points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Alpha Release",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Released the game in alpha<br>
		- Added Layer 1 (White)<br><br>
	<h3>v0.2 (Upcoming)</h3><br>
		- Added Layer 2 (Red, Green, Blue)<br>
		- Added new achievements<br>
		- Added new White Point upgrades`
	

let winText = `Congratulations! You have reached the end and beaten The Colour Tree, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade('w', 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('w', 12)) gain = gain.times(2)
	if (hasUpgrade('w', 13)) gain = gain.times(upgradeEffect('w', 13))
	if (hasUpgrade('w', 14)) gain = gain.div(0.75)
	if (hasUpgrade('w', 21)) gain = gain.times(1.5)
	if (hasUpgrade('w', 23)) gain = gain.times(upgradeEffect('w', 23))
	if (hasUpgrade('w', 34)) gain = gain.times(upgradeEffect('w', 34))
	// if (hasUpgrade('r', 11)) gain = gain.times(2)
	// if (hasUpgrade('r', 12)) gain = gain.pow(1.1)
	// if (hasUpgrade('r', 13)) gain = gain.times(upgradeEffect('r', 13))
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
	return player.points.gte(new Decimal("e280000000"))
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
