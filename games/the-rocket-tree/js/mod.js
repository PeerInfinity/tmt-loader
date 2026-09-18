let modInfo = {
	name: "The Rocket Tree",
	id: "spaceonic2",
	author: "Secret1000",
	pointsName: "meters traveled",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (20), // Used for hard resets and new players
	offlineLimit: 3,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3 Sacrifice",
	name: "The Sacrifice",
}

let changelog = `<h1>Changelog:</h1><br>
        <h3>v0.3 Sacrifice</h3><br>
	        - Added a row of accomplishments.<br>
	        - Added the third layer, sacrifice.<br>
	        - Endgame: 1,000,000 SP.<br>
        <h3>v0.3α Saceifice</h3><br>
		- Added infoboxes, rocket power.<br>
		- Added an upgrade.<br>
                - Changed 1 to 3 offline limit.<br>
		- Endgame: 1e30 YFN.<br>
        <h3>v0.2.1 Bug Fix</h3><br>
		- Added a row of accomplishments, yfn.<br>
		- Changed yfn to lime.<br>
		- Endgame: 5,000 YFN.<br>
        <h3>v0.2 Year</h3><br>
		- Added the second layer, yfn.<br>
		- Added an upgrade.<br>
		- Endgame: 1,000 YFN.<br>
	<h3>v0.1 Rocket</h3><br>
		- Added the first layer, rocket power.<br>
		- Added an upgrade.<br>
		- Endgame: 100,000,000 Rocket Power.`

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
	if (hasUpgrade('r', 11)) gain = gain.times(upgradeEffect('r', 11))
        if (hasUpgrade('r', 12)) gain = gain.times(upgradeEffect('r', 12))
	if (hasUpgrade('r', 13)) gain = gain.times(upgradeEffect('r', 13))
	if (hasUpgrade('r', 14)) gain = gain.times(10)
	if (hasUpgrade('y', 11)) gain = gain.times(upgradeEffect('y', 11))
	if (hasUpgrade('y', 12)) gain = gain.times(upgradeEffect('y', 12))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Reach 1,000,000 SP to reach the endgame!"
]

// Determines when the game "ends"
function isEndgame() {
	return player.s.points.gte(new Decimal(1e6))
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
