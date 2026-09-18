let modInfo = {
	name: "The Mathematical Tree",
	id: "IAmDeathItself",
	author: "Terper",
	pointsName: "points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: (1/30),  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.5",
	name: "So much content",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Added first layer.<br>
		- Added functions.<br>
		<h3>v0.2</h3><br>
		- Added layer 2 skeleton.<br>
		- Bugfixes.<br>
		<h3>v0.3</h3><br>
		- Continued layer 2, more stuff in layer 1.<br>
		- Bugfixes.<br>
		<h3>v0.4</h3><br>
		- Uninflatey and bugfixes.<br>
		- Content pog.<br>
		<h3>v0.5</h3><br>
		- Bugfixes.<br>
		- LOTS of content pog.<br>`

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
	if (hasUpgrade("p", 11)) gain = gain.add(layers.p.getBase())
	if (hasUpgrade("p", 12)) gain = gain.times(layers.p.getBase())
	if (hasUpgrade("p", 32)) gain = gain.pow(upgradeEffect("p", 32))
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
	return (player.points.gte(new Decimal('ee1.78e102')))
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