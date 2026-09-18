let modInfo = {
	name: "A game about Rocks",
	author: "Kolt3rbolter",
	pointsName: "Rocks",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.01",
	name: "The begining",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

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

	let gain = new Decimal(0)

	if (hasUpgrade('s', 11)) gain = gain.add(1)
	if (hasUpgrade('s', 12)) gain = gain.times(2)
	if (hasUpgrade('s', 13)) gain = gain.times(3)
	if (hasUpgrade('s', 14)) gain = gain.times(upgradeEffect('s', 14))
	if (hasUpgrade('s', 21)) gain = gain.times(2.5)
	if (hasUpgrade('s', 32)) gain = gain.times(upgradeEffect('s', 32))
	if (hasUpgrade('s', 41)) gain = gain.times(2)
	if (hasUpgrade('s', 51)) gain = gain.times(1.5)
	if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22))
	if (hasUpgrade('c', 23)) {
		gain = gain.pow(new Decimal(1).add(upgradeEffect('c', 23)))
	}
	if (hasUpgrade('I', 14)) gain = gain.times(1.25)
	if (hasMilestone('m', 2)) gain = gain.times(2)

	if (inChallenge('s', 11)) gain = gain.sqrt()
	if (inChallenge('s', 12)) gain = gain.cbrt()
	if (inChallenge('s', 21)) gain = gain.root(5)
	if (inChallenge('s', 22)) gain = gain.root(6)

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
