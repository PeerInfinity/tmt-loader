let modInfo = {
	name: "The Reset Tree",
	id: "ItsResetTime",
	author: "Thaness0",
	pointsName: "points",
	modFiles: ["row-0 layers.js", "row-1 layers.js", "row-2 layers.js", "row-3 layers.js", "row-4 layers.js", "row-5 layers.js", "side-layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Reset^3 part 2",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0<br> The Basics of Reseting</h3><br>
	- Added reset layer, along with its first 6 upgrades, 3 milestones, and 1 buyable.<br>
	- Added ascension layer, along with its first 5 upgrades.<br>
	- Added prestige layer, along with its first 3 upgrades.<br>
	<h3>v0.1<br> New goals</h3><br>
		- Added 3 upgrades and 3 milestones for resets and 3 upgrades for prestige.<br>
		- Added achievement tab and first 12 achievements.<br>
		- Added rebirth layer but it doesn't do anything yet.<br>
		<h3>v0.2<br> Reset^3 part 1</h3><br>
		- Added 8 milestones and 5 upgrades for rebirth, along with 6 ascend upgrades.<br>
		- Added styling to achievement tab along with 6 new achievements.<br> (Styling makes it so achievements are sorted into sets; completing a set will change achievements to yellow)<br>
		- Added transcendence layer, along with first milestone and challenge (Challenge currently doesn't give a boost)<br>
		<h3>v0.3<br> Reset^3 part 2</h3><br>
		- Added 2 more milestones to transcendence layer, and 3 more challenges. challenge have been moved to ascenion. (Second row challenges no matter what I did just would not work)<br>
		- Added rewind layer, along with 2 buyables and a lot of upgrades (31)<br>
		- Fixed several issues<br>`

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
		if (hasMilestone('r', 0)) gain = gain.times(3)
		if (hasUpgrade('r', 11)) gain = gain.times(5)
		if (hasUpgrade('r', 12)) gain = gain.times(2)
		if (hasUpgrade('r', 23)) gain = gain.times(10)
		if (hasMilestone('r', 3)) gain = gain.times(5)
		if (hasMilestone('r', 4)) gain = gain.times(3)
		if (hasMilestone('r', 5)) gain = gain.times(5)
		if (hasMilestone('r', 7)) gain = gain.times(2.5)
		if (hasUpgrade('rb', 11)) gain = gain.times(15)
		if (inChallenge('a', 14)) gain = new Decimal(1)
		if (hasUpgrade('r', 13)) gain = gain.times(upgradeEffect('r', 13))
		if (hasUpgrade('a', 12)) gain = gain.times(upgradeEffect('a', 11).add(3)/4)
		if (hasUpgrade('a', 13) &! inChallenge('a', 12)) gain = gain.times(buyableEffect('r', 11))
		if (hasUpgrade('r', 31)) gain = gain.times(upgradeEffect('r', 13).add(4)/5)
		if (hasUpgrade('a', 22)) gain = gain.times(upgradeEffect('a', 22))
		if (hasMilestone('rb', 0)) gain = gain.times(player['rb'].points.add(1))
		if (hasChallenge('a', 14)) gain = gain.times(player['rb'].points.add(1))
		if (hasUpgrade('a', 23)) gain = gain.times(player['rb'].points.add(1).times(4))
		// dev crap below used for progressing really fast
	//gain = gain.times(485754)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
 `<h4 style='margin-top:5px;opacity:0.5'> current endgame: reach singularity</h4>`
]

// Determines when the game "ends"
function isEndgame() {
	//return player.points.gte(new Decimal("e280000000"))
	return player['s'].points.gte(1)
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