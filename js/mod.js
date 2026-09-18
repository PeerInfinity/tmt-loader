let modInfo = {
	name: "The Prestige Tree",
	id: "prestigetree",
	author: "redmountain",
	pointsName: "points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.2a",
	name: "",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1.2a</h3><br>
		- Fixed Some bugs.
	<br><br>
	<h3>v0.1.2</h3><br>
		- Fixed Some bugs.<br>
		- Added 4 Achievements.<br>
		- Added Some Upgrades and Milestones.<br>
		- Added Statistics Tab.
	<br><br>
	<h3>v0.1.1</h3><br>
		- Added Light Theme.<br><br>`

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

	let gainboost = new Decimal(1)
	let gainexp = new Decimal(1)
	let gain
	if (player.layer1.upgrades.includes(11)) gainboost = gainboost.times(2)
	if (player.layer1.upgrades.includes(12)) gainboost = gainboost.times(3)
	if (player.layer1.upgrades.includes(21)) gainboost = gainboost.times(4)
	if (player.layer1.upgrades.includes(22)) gainboost = gainboost.times(8)
	if (player.layer2.upgrades.includes(11)) gainboost = gainboost.times(5)
	if (player.layer2.upgrades.includes(12)) gainboost = gainboost.times(3)
	if (player.layer2.upgrades.includes(13)) gainboost = gainboost.times(player.layer2.points.pow(0.5).add(1).min(1e60))
	if (player.layer2.upgrades.includes(21)) gainboost = gainboost.times(8)
	if (player.layer3a.upgrades.includes(11) && player.layer1.resetTime < 1) gainboost = gainboost.times(5)
	if (player.layer3b.upgrades.includes(11)) gainboost = gainboost.times(new Decimal(player.timePlayed).div(6000).plus(1).log(2).plus(1).pow(2))
	if (player.layer3b.upgrades.includes(12)) gainboost = gainboost.times(new Decimal(1).add(new Decimal(player['achievements'].achievements.length).pow(1.5).div(5)))
	if (player.layer3b.upgrades.includes(21)) gainboost = gainboost.times(player.statistics.milestones.pow(1.5).add(1))
	if (player.layer4b.upgrades.includes(11)) gainexp = gainexp.times(1.1)

	let achievementboost = new Decimal(1)
	if (player.achievements.achievements.includes(15)) achievementboost = achievementboost.times(1.2)
	if (player.achievements.achievements.includes(25)) achievementboost = achievementboost.times(1.5)

	gain = new Decimal(1).times(player.layer1.points)
	gain2 =	player.layer1.points.pow(0.3).times(1e10)
	gain = gain.min(gain2)
	return gain.add(1).times(gainboost).pow(gainexp)
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e150"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}