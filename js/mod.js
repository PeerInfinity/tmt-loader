let modInfo = {
	name: "The H2O Tree",
	id: "H2O",
	author: "cosmology101 and bdcl",
	pointsName: "vapor",
	modFiles: ["layers/achievements.js", "layers/hydrogen.js", "layers/oxygen.js", 
		   "layers/nitrogen.js", "layers/carbon.js", "layers/water.js", 
		   "layers/ammonia.js", "layers/carbondioxide.js","layers/discovery.js", "tree.js"],
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "In development",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Water milestones added.<br>
		- Added Water Layer.
 	<h3>v0.1</h3><br>
		- Still testing.<br>
		- Added Oxygen Layer.
 	<h3>v0.01</h3><br>
		- Still testing.<br>
		- Added three upgrades.`

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
	//MULTS
	if (hasUpgrade('h', 11)) gain = gain.times(2)
	if (hasUpgrade('h', 12)) gain = gain.times(upgradeEffect('h', 12))
	if (hasUpgrade('h', 13)) gain = gain.times(upgradeEffect('h', 13))
	if (hasUpgrade('h', 21)) gain = gain.times(upgradeEffect('h', 21))
	if (hasUpgrade('h', 22)) gain = gain.times(upgradeEffect('h', 22))
	if (hasUpgrade('o', 12)) gain = gain.times(upgradeEffect('o', 12))
	if (layerunlocked("w") && player.w.v.gte(1)) gain = gain.times(player.w.v.pow(0.15))
	if (hasUpgrade('co', 11)) gain = gain.times(upgradeEffect("co",11))
	//POWERS
	if (hasUpgrade('d', 11)) gain = gain.pow(upgradeEffect('d' , 11))
	if (hasUpgrade('c', 11)) gain = gain.pow(upgradeEffect("c",11))
	if (hasUpgrade('nh', 11)) gain = gain.pow(upgradeEffect('nh' , 11))
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
	return player.h.points.gte(new Decimal("e2800"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(0.04) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
