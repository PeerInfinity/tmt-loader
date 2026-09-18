let modInfo = {
	name: "The Territory Tree",
	id: "777666",
	author: "diujpi",
	pointsName: "m^2",
	modFiles: ["prestige.js", "tree.js","expansions.js","semi-expansions.js","ascension.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Initial release.",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Initial release.`

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
	if (true) gain = gain.div(player.points.add(1))
	if (hasChallenge('e',21)) gain = gain.times(player.points.add(1))
	if (hasMilestone('p', 0)) gain = gain.times(2)
	if (hasUpgrade('p', 11)) gain = gain.times(3)
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 21)) gain = gain.times(upgradeEffect('p', 21))
	if (hasMilestone('e',0)) gain = gain.times(upgradeEffect('e',10))
	if (hasMilestone('e',1)) gain = gain.times(3)
	if (hasUpgrade('p', 23)) gain = gain.div(1.5)
	if (inChallenge('e', 12)) gain = gain.div(1000)
	if (hasUpgrade('p', 31)) gain = gain.pow(1.1)
	if (hasUpgrade('p', 33)) gain = gain.times(3.3)
	if (hasMilestone('se',0)) gain = gain.times(upgradeEffect('se',10))
	if (hasChallenge('se',12)) gain = gain.times(player.e.points)
	if (inChallenge('se',13)) gain = gain.pow(0.33333)
	gain = gain.times(buyableEffect('se', 11))
	if (inChallenge('e',21)) gain = player.p.points.add(1).pow(0.5)
	if (hasUpgrade('a', 11)) gain = gain.times(upgradeEffect('a', 11))
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
	return hasUpgrade('a',23)
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