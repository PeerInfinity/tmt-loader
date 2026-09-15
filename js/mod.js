let modInfo = {
	name: "The Layered Tree",
	id: "1stIcyDev",
	author: "TheIcyIcicle",
	pointsName: "Points",
	modFiles: ["prestige.js", "achievements.js", "power.js", "layers.js", "layerfragments.js", "tree.js"],

	discordName: "TheIcyIcicle",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 4,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.1",
	name: "POWAHHH",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0.1</h3><br>
		- So begins the Power Layer.<br>
		- Random Bug with Upgrade Keeping you get to have for now!<br>
		- Three new achievements (literally nothing)<br>
	<h3>v0.0.0</h3><br>
		- Three Layers.<br>
		- Multiple Upgrades.<br>
		- Probably some inflation<br>
		- Begin the Layers.`

let winText = `More New Layer Content When?`

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
	// additives
	if (hasUpgrade('p', 11)) gain = gain.add(1.5)
	// achievements
	if (hasAchievement('a', 13)) gain = gain.times(2.5)
	// layers
	if (hasUpgrade('l', 12)) gain = gain.times(5)
	if (hasUpgrade('l', 13)) gain = gain.times(1.75)
	if (hasUpgrade('l', 14)) gain = gain.times(2.5)
	if (hasUpgrade('l', 15)) gain = gain.times(5)
	// prestige
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 23)) gain = gain.times(upgradeEffect('p', 23))
	// power
	if (hasUpgrade('w', 11)) gain = gain.times(1.25)
	// exponents
	if (hasUpgrade('lf', 12)) gain = gain.pow(1.1)
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
	return (hasUpgrade('lf', 14) && player.points.gte('5e8'))
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