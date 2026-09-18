let modInfo = {
	name: "The Infinity Tree",
	id: "mymod",
	author: "PikapikaHei",
	pointsName: "number",
	modFiles: ["_1number.js", 
		"_2infinity.js", "_2machines.js", 
		"_3velocity.js", "_3blackHole.js", "_3energy.js", 
		"_4spaceFragment.js", "_4generator.js", "_4space.js", "_4dilation.js",
		"_5universe.js", 
		"_6simulation.js", "_6darkMatter.js", "_6deterioration.js",
		"tree.js", "!achievement.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0.4",
	name: "I am a name..",
}

let changelog = `<h1>Changelog:</h1><br>
	I am a changelog...`

let winText = `YOU CHEATER`

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
	if(!canGenPoints()) return new Decimal(0)

	gain = Decimal.pow(10, getBuyableAmount('u', 11).add(player.u.freeLevel).pow(1.5))
	if (gain.ln(1)) gain = new Decimal(1)
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
	return player.points.gte(new Decimal("10^^1e10"))
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