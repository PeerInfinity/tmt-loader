let modInfo = {
	name: "The Upgrade Tree",
	id: "Upgrades",
	author: "KillOrDeath",
	pointsName: "points",
	modFiles: ["rebirth.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 24,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Starting Out",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 Starting Out</h3><br>
	- Added a Couple of Upgrades.<br>
	- Added a New Layer. <br>
	-Starting Out. <br>    
	<br>
<h2>v0</h2><br>
	<h5 style="opacity:0.5">- THE START OF A NEW LIFE-</h5>
	The beginning of everything. . .<br>
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
	return hasUpgrade("r", 11);
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1000)
  if (hasUpgrade('r', 12)) gain = gain.times(2);
	if (hasUpgrade('r', 13)) gain = gain.times(2);
	if (hasUpgrade('r', 14)) gain = gain.times(3);
	if (hasUpgrade('r', 21)) gain = gain.times(upgradeEffect('r', 21));
	if (hasUpgrade('r', 22)) gain = gain.times(20);
	if (hasUpgrade('r', 23)) gain = gain.times(20);
  if (hasUpgrade('r', 24)) gain = gain.times(upgradeEffect('r', 24));
  if (hasUpgrade('p', 11)) gain = gain.times(2);
  if (hasUpgrade("m", 11)) gain = gain.times(upgradeEffect('m', 11));
  if (hasChallenge('r', 11)) gain = gain.times(3);
  
 
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
	return player.points.gte(new Decimal("e280"))
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