let modInfo = {
	name: "Testing Tree",
	id: "testingmodidk",
	author: "MVF",
	pointsName: "Quantities",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (5), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3.1.1",
	name: "Progressing...",
}

let changelog = `<h1>Changelog:</h1><br>
	<br>
	<h3>v0.3.1.1</h3><br>
		- Corrected the symbols from Protons and Electrons<br>
		- Updated TMT (2.6.4.3 -> 2.6.5)<br>
	<br>
	<h3>v0.3.1</h3><br>
		- Added 3 Milestones<br>
		- Added 5 Upgrades<br>
		- 2 new Layers soon...<br>
	<br>
	<h3>v0.3.0.1</h3><br>
		- Fixed things about Milestone Popups<br>
		(This made the game not to load)<br>
	<br>
	<h2>v0.3 - Progressing...</h2><br>
		- Added 4 Milestones and an Upgrade<br>
		- Started developing a new Layer (N)<br>
		- Adjusted some things<br>
	<br>
	<h3>v0.2.1</h3><br>
		- Minor adjustments<br>
		- Little grammar changes<br>
		- <u>Published this game on GitHub</u><br>

	<br>
	<h2>v0.2 - Getting Somewhere</h2><br>
		- Added a Layer (I)<br>
		- Added 2 Milestones<br>

	<br>
	<h2>v0.1 - Practically Nothing</h2><br>
		- Added 2 Layers (S and P)<br>
		- Added 8 Upgrades and 2 Milestones<br>
		- This is only the beginning of this garbage<br>
	
	<br>
	<h3>v0.0.1 - Absolutely Nothing</h3><br>
		- Started developing this <s>garbage</s> game`

let winText = `Congratulations! But... is this the end?`

//Congratulations! You have reached the end and beaten this game, but for now...

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

	if (hasUpgrade('s', 11)) gain = gain.times(5)
	if (hasUpgrade('s', 12)) gain = gain.times(upgradeEffect('s', 12))
	if (hasUpgrade('s', 14)) gain = gain.times(upgradeEffect('s', 14))
	if (player.prod.unlocked) gain = gain.times(tmp.prod.effect)
	if (player.n.unlocked) gain = gain.times(tmp.n.effect)

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
	let isEndgame = (player.n.points.gte(250000))

	return isEndgame
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