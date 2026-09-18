let modInfo = {
	name: "The Space Tree",
	id: "test6",
	author: "ItzTeam",
	pointsName: "planck lenghts",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.1",
	name: "Nothing lol!!!",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congrats! You've just reached the current end.`

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
	gain = gain.times(player.a.points.add(1).pow(1.25))
	if (hasUpgrade('s', 11)) gain = gain.times(2)
	if (hasUpgrade('s', 12)) gain = gain.times(3)
	if (hasUpgrade('s', 14)) gain = gain.times(1.5)
	if (hasUpgrade('s', 21)) gain = gain.times(upgradeEffect('s', 21))
	if (hasUpgrade('s', 22)) gain = gain.times(upgradeEffect('s', 22))
	if (hasUpgrade('q', 11)) gain = gain.times(1.75)
	if (hasUpgrade('av', 11)) gain = gain.times(upgradeEffect('av', 11))
	if (hasUpgrade('av', 13)) gain = gain.times(upgradeEffect('av', 13))
	if (hasUpgrade('a', 11)) gain = gain.times(2.65)
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
	return player.points.gte(new Decimal("e160"))
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