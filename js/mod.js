let modInfo = {
	name: "The Weight Tree",
	id: "weightful",
	author: "DifficultComplexity",
	pointsName: "g",
	modFiles: ["layers.js", "tree.js", "overweight.js", "comparison.js", "achievement.js", "universe.js", "singularity.js", "timetravel.js", "time.js", "space.js", "obesity.js"], // IMPORTANT: ADD THE FILES HERE TO BE MENTIONED!
    
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 24,  // In hours
}
// Set your version in num and name
let VERSION = {
	num: "1.0g",
	name: "The End.",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.01.4g</h3><br>
		- Added 5 Weight Buffs.<br>
		- Balanced up to 1 Overweight.<br>
		- Note from the creator: Im sorry, this changelog is outdated because i dont know how do i change it...`
	

let winText = `Contract! You came to an end, but now.`

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
	if (hasUpgrade('w', 11)) gain = gain.times(2) // Weight Upgrades
	if (hasUpgrade('w', 12)) gain = gain.times(upgradeEffect('w', 12))
	if (hasUpgrade('w', 13)) gain = gain.times(upgradeEffect('w', 13))
	if (hasUpgrade('w', 14)) gain = gain.times(upgradeEffect('w', 14))
	if (hasUpgrade('w', 15)) gain = gain.times(upgradeEffect('w', 15))
	if (hasMilestone('w', 1)) gain = gain.times(5)
	if (hasUpgrade('w', 23)) gain = gain.times(upgradeEffect('w', 23))
	if (hasUpgrade('w', 32)) gain = gain.times(upgradeEffect('w', 32))
	if (hasUpgrade('o', 12)) gain = gain.times(upgradeEffect('o', 12))
	if (hasUpgrade('o', 15)) gain = gain.times(10)
	if (hasUpgrade('c', 12)) gain = gain.times(upgradeEffect('c', 12)) // Comparison Upgrades
	if (hasUpgrade('u', 11)) gain = gain.times(upgradeEffect('u', 11))
	if (hasUpgrade('u', 12)) gain = gain.times(upgradeEffect('u', 12))
	if (hasUpgrade('u', 13)) gain = gain.times(upgradeEffect('u', 13))
	if (hasUpgrade('s', 11)) gain = gain.times(upgradeEffect('s', 11))
	if (hasUpgrade('s', 11)) gain = gain.times(upgradeEffect('s', 11))
	if (hasMilestone('t', 1)) gain = gain.times(player.t.points.pow(7))
	if (hasUpgrade("t", 21)) gain = gain.pow(player.tt.points.add(50).div(50))
	if (hasUpgrade("sa", 13)) gain = gain.times(upgradeEffect('sa', 13))
	if (hasUpgrade('o', 22)) gain = gain.pow(player.o.points.div(9900).add(1))
	if (hasUpgrade('w', 33)) gain = gain.pow(upgradeEffect('w', 33))
	if (inChallenge("c", 11)) gain = gain.pow(0.5)
	if (inChallenge("c", 12)) gain = gain.pow(0.75)
	if (inChallenge("c", 21)) gain = gain.times(1e-6)
	if (inChallenge("c", 22)) gain = gain.pow(0.8)
	if (inChallenge("c", 31)) gain = gain.pow(0.75)
	if (inChallenge("c", 32)) gain = gain.pow(0.75)
	if (inChallenge("c", 41)) gain = gain.pow(0.075)
	if (inChallenge("c", 42)) gain = gain.pow(0.0001)
	if (inChallenge("u", 11)) gain = gain.pow(0.4065)
	
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
	return player.points.gte('eee10')
	// player.li.points.gte(7.6e9)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(900) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
