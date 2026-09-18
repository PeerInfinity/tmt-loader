let modInfo = {
	name: "The Size Tree",
	id: "SizingTree",
	author: "Endo",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "Endo",
	discordLink: "No.com",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 100,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "The Size Tree",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3</h3><br>
		- bug fixes: Fixing the bug where the times was broken<br>
		- Upgrades: some stuff (7)`

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
if (hasUpgrade('p', 12)) gain = gain.times(2)
if (hasUpgrade('p', 13)) gain = gain.times(2.5)
if (hasUpgrade('p', 14)) gain = gain.times(3)
if (hasUpgrade('p', 15)) gain = gain.times(3.7)
if (hasUpgrade('p', 21)) gain = gain.times(3.7)
if (hasUpgrade('p', 22)) gain = gain.times(3.5)
if (hasUpgrade('p', 23)) gain = gain.times(3)
if (hasUpgrade('n', 12)) gain = gain.times(10)
if (hasUpgrade('n', 17)) gain = gain.times(5)
if (hasUpgrade('p', 25)) gain = gain.times(2)
if (hasUpgrade('n', 14)) gain = gain.times(12)
if (hasUpgrade('p', 28)) gain = gain.times(1.25)
if (hasUpgrade('p', 27)) gain = gain.times(1.5)
if (hasUpgrade('p', 31)) gain = gain.times(2)
if (hasUpgrade('p', 32)) gain = gain.times(3)
if (hasUpgrade('p', 33)) gain = gain.times(4)
if (hasUpgrade('p', 34)) gain = gain.times(4)
if (hasUpgrade('p', 35)) gain = gain.times(3)
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
