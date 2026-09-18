let modInfo = {
	name: "The Layerverse Tree",
	author: "kay",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 48,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "Release",
}

let changelog = `<h1>Changelog:</h1><br>

		  v1.0 <br>
		- added layers.<br>
		- added prestige.<br>
		- added ultra.<br>
		- added charge.<br>
		

		
		
		v0.0
		- Added nothing.<br>
		- Added nothing but again.<br>

`
		


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
if (hasUpgrade("l", 11)) gain = gain.times(2)
if (hasUpgrade("l", 12)) gain = gain.times(2)
if (hasUpgrade("l", 13)) gain = gain.times(3)
if (hasUpgrade("l", 14)) gain = gain.times(upgradeEffect("l", 14))
if (hasUpgrade("p", 11)) gain = gain.times(5)
if (hasUpgrade("p", 13)) gain = gain.times(1.5)
if (hasUpgrade("u", 11)) gain = gain.times(25)
if (hasUpgrade("u", 13)) gain = gain.times(100)
if (hasUpgrade("u", 12)) gain = gain.pow(1.13428342937462893423457284502347605082349856283465238475923)
if (hasChallenge("u", 11)) gain = gain.pow(1.15)
if (hasChallenge("u", 12)) gain = gain.pow(1.16)
if (inChallenge("u", 11)) gain = gain.pow(0.5)
if (inChallenge("u", 12)) gain = gain.pow(0.25)

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
	return(10) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}