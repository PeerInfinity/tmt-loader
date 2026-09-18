let modInfo = {
	name: "The Hyperoperator Tree",
	id: "The Hyperoperator Tree",
	author: "Increveloper",
	pointsName: "points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new ExpantaNum (0), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "2.0",
	name: "Logarithmic Exponents",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.0</h3><br>
		- Added 2 side layers.<br>
		- Added 3 progress layers.<br>
		- Added 58 upgrades.<br>
		- Added 3 buyables.<br>
		Current endgame: 12 Constant Points<br><br>

	<h3>v2.0</h3><br>
		- Added 1 progress layer.<br>
		- Added 22 upgrades.<br>
		- Added 9 buyables.<br>
		Current endgame: 120 Constant Points<br><br>
		`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "generateFromDimensions", "getTimeSinceReplicant", "gainMultPower", "replicate"]

function getStartPoints(){
    return new ExpantaNum(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return false
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new ExpantaNum(0)

	//let gain = player.perClick
	//player.efficiency.points = new ExpantaNum(100)
	//return gain.mul(player.efficiency.points).div(100)
}

function getPointsPerClick(){
	let gain = new ExpantaNum(1)

	gain = gain.mul(player.s.effectiveness)
	gain = gain.mul(player.s.amount)

	player.perClick = gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	perClick: new ExpantaNum(1),
	efficiency: {
		"points": new ExpantaNum(0),
		"successor": new ExpantaNum(0),
		"addition": new ExpantaNum(0),
		"multiplication": new ExpantaNum(0),
		"exponentiation": new ExpantaNum(0),
	},
	gain: new ExpantaNum(0),
	resetting: false,
	lastResetted: 0,
	lastTab: {
		"changelog-tab": {
			mainTabs: undefined,
		},
		st: {
			mainTabs: undefined,
		},
		c: {
			mainTabs: "Main",
		},
		s: {
			mainTabs: undefined,
		},
		a: {
			mainTabs: "Main",
		},
		m: {
			mainTabs: "Main",
		},
		e: {
			mainTabs: "Main",
		}
	}
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.c.points.gte(120)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
