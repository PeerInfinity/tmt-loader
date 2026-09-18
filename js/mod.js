let modInfo = {
	name: "The Random Updates Tree",
	author: "liam",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "3.1",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
<h3><br><br>v3.1</h3><br>
		added a milestone, a challenge, a new layer (energy), and 3 upgrades.<br>
		endgame: 3e12 energy<br>
<h3><br><br>v2.2</h3><br>
		added 3 milestones, nerfed addition effect, and added branches.<br>
		endgame: 20 addition<br>
<h3><br><br>v2.1</h3><br>
		added addition, an upgrade, and addition adds base point gain.<br>
		endgame: 5 addition<br>
<h3><br><br>v1.1</h3><br>
		1 layer, 4 upgrades, and made the game.<br>
		endgame: 50 prestige points<br>

	<h3><br><br>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

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

base = new Decimal(1)
mult = new Decimal(1)
exp = new Decimal(1)

if (hasUpgrade('p', 11)) base = base.plus(1)
if (hasUpgrade('p', 12)) mult = mult.times(2)
if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
if (hasUpgrade('p', 14)) base = base.plus(upgradeEffect('p', 14))
if (hasUpgrade('p', 15)) mult = mult.times(3)
base = base.add(tmp.a.effect)
if (hasMilestone('a', 1)) mult = mult.times(1.75)
if (hasMilestone('a', 3)) exp = exp.times(1.1)
exp = exp.times(tmp.e.effect)

	if (inChallenge('a', 11)) exp = exp.minus(0.8)
	return base.times(mult).pow(exp)
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