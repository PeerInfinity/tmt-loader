let modInfo = {
	name: "The Nova Tree",
	id: "applelordthirdtree",
	author: "AppleLord",
	pointsName: "stardust",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.35.1",
	name: "Time 2/3",
}

let changelog = `<h1>Changelog:</h1><br>

	<h3>v0.35.1</h3><br>
		- Major bug fix.	

	<h3>v0.35</h3><br>
		- Did some more stuff with the time layer, there are now 12 achievements.	

	<h3>v0.32</h3><br>
		- Started off the time layer and god essence.	

	<h3>v0.3</h3><br>
		- Finished the void layer for now, May add more in the future as per usual.	

	<h3>v0.25</h3><br>
		- Started off the void layer.

		<br>
	<h3>v0.2</h3><br>
		- Finished the Nova layer, may need balancing in the future.`

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
	
	let gain = new Decimal(0.1)

	if (getBuyableAmount("n",11) > 0) gain = gain.times(buyableEffect("n",11))
	if (hasAchievement("a",13)) gain = gain.div(new Decimal(3))
	if (getBuyableAmount("n",13) > 0) gain = gain.times(buyableEffect("n",13))
	if (hasUpgrade("n",16)) gain = gain.times(100)
	if (hasMilestone("v",0)) gain = gain.times(3)
	if (hasMilestone("t",0)) gain = gain.times(2)
	if (hasMilestone("t",1)) gain = gain.times(2)
	gain = gain.times(player.timespeed)

	return gain
}
// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	crystalline: new Decimal(0),
	ngalaxies: new Decimal(0),
	novacap: "true",
	replicanticap: new Decimal(0),
	timespeed: new Decimal(1)
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

