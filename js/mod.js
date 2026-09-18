let modInfo = {
	name: "The History Tree",
	id: "akivn",
	author: "akivn",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "d.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "2016 update",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the present and beaten this game, but for now...`

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

	let gain = new Decimal(2)
	if (hasAchievement('b', 21)) gain = gain.add(1)
	if (hasUpgrade('a', 11)) gain = gain.times(2.4)
	if (hasUpgrade('a', 12)) gain = gain.times(upgradeEffect('a', 12))
	if (hasUpgrade('a', 13)) gain = gain.times(upgradeEffect('a', 13))
	if (hasUpgrade('a', 14)) gain = gain.times(upgradeEffect('a', 14))
	if (hasUpgrade('a', 21)) gain = gain.times(upgradeEffect('a', 21))
	if (hasUpgrade('a', 22)) gain = gain.times(upgradeEffect('a', 22))
	if (hasUpgrade('a', 23)) gain = gain.times(upgradeEffect('a', 23))
	if (hasUpgrade('c', 13)) gain = gain.times(upgradeEffect('c', 13))
	if (inChallenge('c', 12)) gain = gain.pow(0.5)
	if (hasMilestone('a', 0)) gain = gain.times(tmp.a.milestones[0].effect)
	
	gain = gain.times(tmp.b.effect)
	gain = gain.times(tmp.c.effect)
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
	return player.points.gte(new Decimal("1e83"))
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