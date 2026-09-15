let modInfo = {
	name: "The Upgradeverse Tree",
	author: "liam",
	pointsName: "points",
	modFiles: ["tree.js", 'up.js', 'p.js', 'sp.js', 'c.js', 'm.js', 'u.js'],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1.5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.1.0",
	name: "Automation",
}

let changelog = `<h1>Changelog:</h1><br>
<h3>v1.1.0 - The Mega Extension - 3/2/2026</h3><br>
		- Added 2 upgrade power upgrades<br>
		- Added more mega stuff<br>
		- Added a new layer, ultra prestige<br>

		<br><br> - Note from dev: Thanks for playing my game! You found a 'secret'`

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
	if (hasUpgrade('sp', 12)) gain = gain.add(2)
	if (hasUpgrade('mp', 21)) gain = gain.add(30)

	if (hasUpgrade('up', 11)) gain = gain.times(3)
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 14)) gain = gain.times(4)
	if (hasUpgrade('up', 13)) gain = gain.times(4)
	if (hasUpgrade('sp', 13)) gain = gain.times(2.5)
	if (hasUpgrade('up', 14)) gain = gain.times(5)
	if (hasUpgrade('c', 12)) gain = gain.times(upgradeEffect('c', 12))
	if (hasUpgrade('up', 15)) gain = gain.times(4)
	if (hasUpgrade('up', 14)) gain = gain.times(3)
	if (hasUpgrade('up', 21)) gain = gain.times(3.5)
	if (hasUpgrade('mp', 11)) gain = gain.times(200)
	if (hasUpgrade('c', 14)) gain = gain.times(1000)
	if (hasUpgrade('u', 11)) gain = gain.times(3000)

    

	if (hasUpgrade('mp', 11)) gain = gain.pow(1.005)

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
	return (hasUpgrade('u', 11))
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