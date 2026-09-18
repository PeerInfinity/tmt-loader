let modInfo = {
	name: "The Broken Tree",
	id: "dumb",
	author: "A guy you'll never hear from again",
	pointsName: "ADHD",
	discordName: "DIO",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	name: "Oh wow, an update",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3</h3><br>
		- Added Attention spans.<br>
		- Added Hyperfixations.
		- Balancing fixes.
		- Added Doggo's. `

let winText = `Congratulations! You have succesfully fucked up. Thanks. Now i can start over`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("a", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade("a", 12)) gain = gain.times(upgradeEffect("a", 12))
	if (hasUpgrade("a", 13)) gain = gain.times(upgradeEffect("a", 13))
	if (hasUpgrade("a", 21)) gain = gain.times(upgradeEffect("a", 21))
	if (hasUpgrade("h", 13)) gain = gain.times(upgradeEffect("h", 13))
	if (hasUpgrade("g", 11)) gain = gain.times(upgradeEffect("g", 11))
	if (hasUpgrade("h", 11)) gain = gain.pow(upgradeEffect("h", 11))
	if (hasUpgrade("h", 11)) gain = gain.times(2)
	if (hasUpgrade("h", 12)) gain = gain.times(2)
	if (hasUpgrade("h", 13)) gain = gain.times(2)
	if (points > 1000) gain = gain.pow(0.5)
	
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
	return player.points.gte(new Decimal("1e2876e153"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}