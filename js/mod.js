let modInfo = {
	name: "The Periodic Tree",
	id: "mymod",
	author: "amogus22, King-B3H, FebruaryTheDuck",
	pointsName: "atoms",
	modFiles: ["layers.js", "tree.js", "currency-list.html"],

	discordName: "The Periodic Tree Discord",
	discordLink: "https://discord.gg/GTYKWmcq",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Small Beginnings",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Added Creation, Hydrogen, Helium, and Lithium.<br>
		- Beryllium is meant for WIP and a setup for next update.`

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

		let gain = new Decimal(0)
		//Hydrogen Upgrades
		if(hasUpgrade('h', 11)) gain = new Decimal(1)
		if(hasUpgrade('h', 12)) gain = gain.times(2)
		if(hasUpgrade('h', 13)) gain = gain.times(upgradeEffect('h',13))
		if(hasUpgrade('h', 21)) gain = gain.times(upgradeEffect('h',21))
		if(hasUpgrade('h', 22)) gain = gain.times(2)
		if(hasUpgrade('h', 23)) gain = gain.times(upgradeEffect('h',23))
		//Helium
		if(player.he.unlocked && tmp.he.effect.gt(0)){
			gain = gain.times(tmp.he.effect)
		}
		//Lithium
		if(player.l.unlocked && player.l.charge.gt(0)){
			gain = gain.times(tmp.l.chargeEff)
		}
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
