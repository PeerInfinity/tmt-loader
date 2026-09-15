let modInfo = {
	name: "The Jax Tree",
	author: "jaxxie",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "The Jax Tree Server",
	discordLink: "https://discord.gg/gzZj2ENzZn",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "The Prestige Tree??",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2</h3><br>E
		- Prestige has 3 upgrades currently.<br>
		- Prestige MILESTONES<br>
	<h3>v0.1</h3><br>
		- Added the game.<br>
		- Yeah<br>
		- DISCORD INVITE LINK ONLY HAS 50 USES.`

let winText = `You won, for now... MUAAAAHAHAHAHAHAHAHAHAHAHAAHAHAHAAAAAAAEEEEE`

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
	// easier readability for upgrades cause im not very good at spotting stuff
		if (hasUpgrade('r', 11)) gain = gain.add(1)
		if (hasUpgrade('r', 12)) gain = gain.add(1)
		if (hasUpgrade('r', 14)) gain = gain.times(2)
		if (hasUpgrade('r', 15)) gain = gain.add(1)
		if (hasUpgrade('r', 21)) gain = gain.add(0.01)
		if (hasUpgrade('r', 22)) gain = gain.add(1)
		if (hasUpgrade('r', 23)) gain = gain.times(2)
			// r 24 is for reset points, so it is GONE here
		if (hasUpgrade('r', 25)) gain = gain.times(3)
		if (hasUpgrade('r', 31)) gain = gain.times(player.r.points.add(1).pow(0.5))
		if (hasUpgrade('r', 32)) gain = gain.times(player.points.add(1).pow(0.05))
		if (hasMilestone('p', 0)) gain = gain.times(3)
		if (hasUpgrade('p', 11)) gain = gain.times(2)
		if (hasUpgrade('reb', 11)) gain = gain.times(4)
	//
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
	return player.reb.points.gte(1)
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