let modInfo = {
	name: "The Greek Tree",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "side_layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Starting !",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.1: Release !</h3><br>
	- <b>Added <span style="color:#ff0000">alpha layer</span></b><br>
    - <small>Added 25 Upgrades.<br>
	- Added 6 Buyables.<br></small>
	- <b>Added <span style="color:#1663f1">beta layer</span></b><br>
    - <small>Added 25 Upgrades.<br>
	- Added 6 Milestones.<br>
	- Added 6 Buyables.<br></small>
	- <b>Added <span style="color:#fc8600">gamma layer</span></b><br>
    - <small>Added 25 Upgrades.<br>
	- Added 7 Milestones.<br></small>
	- <b>Added <span style="color:#ac00fc">delta layer</span></b><br>
    - <small>Added a new currency.<br>
	- Added 12 Upgrades.<br>
	- Added 6 Milestones.<br>
	- Added 2 Buyables.<br></small>
	<b>Added <span style="color:#FFFF00">achievements</span></b><br>
	- <small>Added 23 achievements <br></small>
	<b>Added <span style="color:#FFFFFF">statistic layer</span></b><br>`


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
	if (hasUpgrade('A',11)) gain = gain.times(2)
	if (hasUpgrade('A',12)) gain = gain.times(2)
	if (hasBuyable('A',11)) gain = gain.times(buyableEffect('A',11))
	if (hasUpgrade('A',23)) gain = gain.times(upgradeEffect('A',23))
	if (hasUpgrade('A',25)) gain = gain.times(upgradeEffect('A',25))
	if (hasUpgrade('A',26)) gain = gain.times(upgradeEffect('A',26))
	if (hasUpgrade('A',31)) gain = gain.times(upgradeEffect('A',31))
	if (hasUpgrade('A',34)) gain = gain.times(34)

	if (hasUpgrade('B',11)) gain = gain.times(upgradeEffect('B',11))
	if (hasUpgrade('B',12)) gain = gain.times(5)
	if (hasUpgrade('B',13)) gain = gain.times(10)
	if (hasUpgrade('B',15)) gain = gain.times(upgradeEffect('B',15))
	if (hasMilestone('B',3)) gain = gain.times(1e10)
	if (hasUpgrade('B',44)) gain = gain.times(getBuyableAmount('A',11).pow(4)).max(1)
	if (hasUpgrade('B',51)) gain = gain.times(upgradeEffect('B',51))

	if (hasUpgrade('G',11)) gain = gain.times(4)
	if (hasUpgrade('G',12)) gain = gain.times(1e15)
	if (hasUpgrade('G',13)) gain = gain.times(player.G.total.pow(32))
	if (hasUpgrade('G',25)) gain = gain.times(upgradeEffect('G',25))
	if (hasUpgrade('G',55)) gain = gain.times(upgradeEffect('G',55))

	if (hasUpgrade('D',12)) gain = gain.times(upgradeEffect('D',12))

	if (hasAchievement('ach',23)) gain = gain.times(23)

	if (player.D.dSeed.gte(1)) gain = gain.times(player.D.dSeed.pow(50000))
	// Apply point gain exponent (example: upgrades/buyables can increase this)
	let pointExp = new Decimal(1)
	try {
		if (hasUpgrade('B',31)) pointExp = pointExp.add(new Decimal(0.15))
		if (hasMilestone('G',0)) pointExp = pointExp.add(milestoneEffect('G',0))
		if (hasBuyable('B',22)) pointExp = pointExp.add(buyableEffect('B',22))
		if (hasBuyable('B',23)) pointExp = pointExp.add(buyableEffect('B',23))
	} catch (e) {}
	// Raise the per-second gain to the computed exponent
	gain = gain.pow(pointExp)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	'Endgame: ~1e413.5k,'
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e413500"))
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