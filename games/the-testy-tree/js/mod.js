const BASEPOINTS = "numbers"
const FIRSTPOINTS = "Prestige Points"
const SECONDPOINTS = "Bubble Points"
const THIRDPOINTS = "Cash Points"
const FOURTHPOINTS = "Delta Points"


let modInfo = {
	name: "The Testy Tree",
	id: "testymod",
	author: "Rowan Trees",
	pointsName: BASEPOINTS,
	modFiles: ["tree.js", "Layers/p.js", "Layers/b.js", "Layers/a.js", "Layers/c.js", "Layers/d.js", "Layers/pp.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 3,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "First Version that works",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Got the game to the point where it is vaguely playable<br>
		- Added all of the basic stuff to make it work.`

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
	//showTab('none')
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasAchievement('a',13)) gain = gain.times(2)
	if (hasAchievement('a',14)) gain = gain.times(2)
	if (hasAchievement('a',21)) gain = gain.times(10)
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p',12))
	if (hasUpgrade('d', 11)) gain = gain.times(upgradeEffect('d',11))
//	console.log(upgradeEffect('p',12))
	if (inChallenge('d',11)) gain = gain.pow(0.2)
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
	return hasUpgrade('d',31)
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