let modInfo = {
	name: "The Dotree",
	id: "dotree",
	author: "AppleLord",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "epic",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Just a backup incase things go wrong.`

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
	player.navTab = 'tree-tab'
	if(!canGenPoints())
		return new Decimal(0)
	let gain = new Decimal(1)
	if (hasUpgrade("d", 11)) gain = gain.times(upgradeEffect("d", 11))
	if (hasUpgrade("d", 13)) gain = gain.times(upgradeEffect("d", 13))
	if (hasUpgrade("d", 16)) gain = gain.times(upgradeEffect("d", 16))
	if (clickableEffect("c",11) > 1) gain = gain.times(clickableEffect("c",11))
	if (hasMilestone("v",2)) {if (clickableEffect("c",14) > 1) gain = gain.times(clickableEffect("c",14))}
	if (getBuyableAmount("cb",21)>0) {gain = gain.times(1000)}
	//if (clickableEffect("c",12) > 0) gain = gain.times(clickableEffect("c",12))
	//if (clickableEffect("c",13) > 0) gain = gain.times(clickableEffect("c",13))
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

