let modInfo = {
	name: "Function of Time",
	author: "mikosss",
	pointsName: "time",
	modFiles: [
		"layers/01_f.js",
		"layers/02_u.js",
		"layers/03_res.js",
		"tree.js"
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Knowledgable Update",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3 style="background-image: radial-gradient(#234F1E, #234F1E);-webkit-background-clip: text;color: transparent;">v0.1: Knowledgable Update</h3><br>
		- Added Research.<br><br>
	<h3 style="background-image: linear-gradient(#63C5DA, #FFE338);-webkit-background-clip: text;color: transparent;">v0.0: Origins</h3><br>
		- Added f(t).<br>
		- Added U.`

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
	if (getBuyableAmount("f", 11).gte(1)) gain = gain.add(1)
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
	return hasUpgrade("res",105)
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