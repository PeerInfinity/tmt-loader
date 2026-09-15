let modInfo = {
	name: "The ??? Tree",
	id: "cookina i changed my id",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.7",
	name: "A bit more content",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.6</h3><br>
		- Added things.<br>
		- Added stuff.`

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
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	    if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	    if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p',13))
	    if (hasUpgrade('pr', 11)) gain = gain.times(4)
	    	    if (hasUpgrade('pr', 12)) gain = gain.times(upgradeEffect('pr',12))
	    	    
	    	    
	    	    if (hasUpgrade('pr', 13)) gain = gain.times(player.pr.upgrades.length).add(1).pow(1.3)
	if (hasUpgrade('c',11)) gain = gain.times(4)
	  if (hasUpgrade('c', 13)) gain = gain.times(upgradeEffect('c',13))
	  if (hasUpgrade('p', 21)) gain = gain.times(2.8)
	    	  if (hasUpgrade('p', 23)) gain = gain.times(upgradeEffect('p',23))
	    	    if (hasUpgrade('pr', 31)) gain = gain.times(upgradeEffect('pr',31))
	 if (hasUpgrade('pr', 32)) gain = gain.times(4)
	 if (inChallenge('c', 11)) gain = gain.pow(0.5)
	 if (hasChallenge('c', 11)) gain = gain.times(100)
	 if (hasUpgrade('pr', 33)) gain = gain.times(4.5)
	  if (hasUpgrade('c', 21)) gain = gain.times(upgradeEffect('c',21))
	  if (hasUpgrade('c', 23)) gain = gain.times(24)
	    	  return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
  "Endgame: 2e30 points"
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("2e30"))
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