let modInfo = {
	name: "The World Tree Nordrasil",
	id: "TWT",
	author: "Ya Boi Alex#3516",
	pointsName: "Essence",
	modFiles: [
							"utils/borderRadius.js",
							"Layers/Row0/Ground.js","Layers/Row0/River.js",
							"Layers/Row1/Grass.js","Layers/Row1/Stream.js",
							"Layers/Row2/Roots.js",
							"Layers/Row3/Energy.js",
							"Layers/SideTabs/GreaterEssence.js",
							 "tree.js"],


	discordName: "The World Tree Nordrasil",
	discordLink: "https://discord.gg/AyNVacrB",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1B",
	name: "The Roots",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1B</h3><br>
		- Game Created.<br>
		- Added The Base Tree Layout and Upgrades.`

let winText = `Congratulations! You have exceeded the bounds of the Tree Of Nordrasil's Branches.`

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

function calculateBaseGain(){
	let Base = new Decimal(1)
	Base = Base.add(layerEffect("Ground").baseGainIncrease)

	return Base
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)


	let BaseGain = calculateBaseGain()
	BaseGain = BaseGain.times(layerEffect("River").pointGainMulti.add("1"))


	return BaseGain
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
