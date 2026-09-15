let modInfo = {
	name: "The Alphabetree",
	id: "Project2",
	author: "FlareZ",
	pointsName: "Letters",
	modFiles: ["layers.js", "tree.js"],

	discordName: "FlareZ's Fire Trees",
	discordLink: "https://discord.gg/TDhmQh4n",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 24,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.2.6",
	name: "When you find a bug nest:",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.2.6</h3><br>
		- Added more milestones.<br>
		- Changed/Added some more upgrades<br>
		- Fixed A, R, and S node colors<br>
		- Bug Fixed Upgrade A3 and C6<br>
		- Changed Upgrade B3's Description<br>
		- Changed Milestone B4's requirement<br>
		- Made the Version Numbers more precise<br>
		- Spammed some more updates<br>
		- Bug Fixed Milestone B5<br>
		- Swapped around Milestones A3 and B3<br>
		- Made you read all of this`

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
	gain = gain.div(player.points.max(10).log10().mul(gain.max(2).log2()))
	if (hasUpgrade('a', 11)) gain = gain.times(2)
	if (hasUpgrade('a', 12)) gain = gain.times(upgradeEffect('a', 12))
	if (hasUpgrade('a', 21)) gain = gain.times(3)
	if (hasMilestone('a', 2)) gain = gain.times(player.points.max(1).log10().add(1))
	if (hasUpgrade('b', 11)) gain = gain.times(upgradeEffect('b', 11))
	if (hasUpgrade('b', 22)) gain = gain.mul(player.points.max(1).log10(player.points.max(1).log10()).add(1))
	if (hasUpgrade('c', 13)) gain = gain.mul(upgradeEffect('c', 13))
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