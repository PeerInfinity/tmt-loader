let modInfo = {
	name: "The Earth Tree",
	id: "saves1",
	author: "Onesmartshark",
	pointsName: "Grass",
	modFiles: ["layers.js", "tree.js"],

	discordName: "I will set this up later sorry",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.11",
	name: "VERCEL PORT AFTER NEARLY 2 YEARS",
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

	let gain = new Decimal(1)
	if (hasUpgrade('d', 11)) gain = gain.times(2)
	if (hasUpgrade('t', 11)) gain = gain.times(2)
	if (hasUpgrade('d', 12)) gain = gain.times(upgradeEffect('d', 12))
	if (hasUpgrade('d', 13)) gain = gain.times(2)
	if (hasUpgrade('s', 11)) gain = gain.times(2)
	if (hasUpgrade('c', 11)) gain = gain.times(2)
	if (hasUpgrade('d', 21)) gain = gain.times(3)
	if (hasUpgrade('d', 23)) gain = gain.times(4)
	if (hasUpgrade('d', 24)) gain = gain.times(2)
	if (hasUpgrade('d', 31)) gain = gain.times(6)
	if (hasUpgrade('d', 32)) gain = gain.times(1.5)
	if (hasUpgrade('co', 13)) gain = gain.times(0.5)
	if (hasUpgrade('co', 14)) gain = gain.times(0.5)
	if (hasUpgrade('sl', 11)) gain = gain.times(2)
	if (hasUpgrade('te', 11)) gain = gain.times(1000)
	if (hasUpgrade('f', 12)) gain = gain.times(3)
	if (hasUpgrade('cm', 11)) gain = gain.times(3)
	if (hasUpgrade('st', 14)) gain = gain.times(6)
	if (hasMilestone('sl', 3)) gain = gain.times(2)
	if (hasMilestone('sl', 8)) gain = gain.times(2)
	if (hasMilestone('sl', 9)) gain = gain.times(2)
	if (hasMilestone('sl', 11)) gain = gain.times(3)
	if (hasMilestone('g', 2) && !inChallenge('i', 11) && !inChallenge('i', 12) && !inChallenge('i', 21) && !inChallenge('i', 22)) gain = gain.times(4)
	if (hasMilestone('g', 3) && !inChallenge('i', 11) && !inChallenge('i', 12) && !inChallenge('i', 21) && !inChallenge('i', 22)) gain = gain.times(4)
	if (getBuyableAmount('cm', 11).gt(0)) gain = gain.times(new Decimal(2).pow(getBuyableAmount('cm', 11)))
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
	return player.points.gte(new Decimal("1e16"))
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
