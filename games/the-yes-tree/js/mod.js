let modInfo = {
	name: "The Yes Tree",
	id: "FortniteBattlePass",
	author: "Me",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "I don't have one... (Don't clcik it wil open up a useless tab.)",
	discordLink: "None",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 6,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.6",
	name: "ME USING SCRATCH FOR IDEAS Update!!!",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.6</h3><br>
		- Added QU.<br>
		- Most importantly... CREATIVITY!
		- (Leave this in always) To win get e280B points!`


let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["toggleAuto"]

function toggleAuto() {
	console.log("Kathulu is " + player.cb.auto);
	if (player.cb.auto) {
		player.cb.auto = false;
		console.log("1 Kathulu is now " + player.cb.auto);
	} else {
		player.cb.auto = true;
		console.log("2 Kathulu is now " + player.cb.auto);
	}
}

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
	if (hasUpgrade('p', 11)) gain = gain.times("2")
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 14)) gain = gain.times(4)
	if (hasUpgrade('p', 15)) gain = gain.times(100)
	if (hasUpgrade('r', 11)) gain = gain.times(10)
	if (hasUpgrade('r', 12)) gain = gain.times(1e6)
	if (hasUpgrade('r', 13)) gain = gain.times(1e50)
	if (hasUpgrade('sp', 11)) gain = gain.times(upgradeEffect('sp', 11))
	if (hasUpgrade('sr', 11)) gain = gain.times(10)
	if (hasUpgrade('b', 11)) gain = gain.times(5e69)
	if (hasUpgrade('ar', 11)) gain = gain.times(upgradeEffect('ar', 11))
	if (hasUpgrade('ar', 11)) gain = gain.times(1e6)
	if (hasUpgrade('ar', 13)) {
		if (hasUpgrade('ar', 14)) {
			console.log('***getting ANTI FARD')
			gain = gain.times(upgradeEffect('ar', 14))
		} else {
			gain = gain.times("e69")
			console.log('***getting FARD')
		}
	}
	if (hasUpgrade('ar', 15)) gain = gain.times(1e6)
	if (hasUpgrade('ar', 16)) gain = gain.times(1e9)
	if (hasUpgrade('y', 11)) gain = gain.times(1e20)
	if (hasUpgrade('y', 14)) gain = gain.times("e100")
	if (hasUpgrade('y', 16)) gain = gain.times("e100")
	if (hasUpgrade('c', 11)) gain = gain.times("e5000")
	if (hasUpgrade('cc', 13)) gain = gain.times("e25000")
	if (hasUpgrade('c2', 11)) gain = gain.times("e50000")
	if (hasUpgrade('v', 11)) gain = gain.times("1e150000")
	if (hasUpgrade('k', 11)) gain = gain.times(upgradeEffect('k', 11))
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
	return player.points.gte(new Decimal("e280000000000")) //e280B lol
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