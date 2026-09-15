let modInfo = {
	name: "Arc Tree",
	author: "TEWAR",
	pointsName: "fragments",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (15), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.4",
	name: "World Tacks",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0.4 World Tracks</h3><br>
		- Call row5 completed.<br>
		- Building Library Layer.<br>
		- Bug fix.<br><br>
	<h3>v0.0.3 \"Now Everything Worked\"</h3><br>
		- Call row4 completed.<br>
		- Building Story Layer.<br>
		- Bug fix.<br><br>
	<h3>v0.0.2.1 Crimson and Ambivalence</h3><br>
		- Bug fix.<br><br>
	<h3>v0.0.2 Crimson and Ambivalence</h3><br>
		- Call row3 completed.<br>
		- Bug fix.<br><br>
	<h3>v0.0.1 A Glimpse of the World</h3><br>
		- Call row2 completed.<br><br>
	<h3>v0.0 Currently, nothing here.</h3><br>
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

	if(inChallenge('world', 22)) return player.world.points.pow(3);

	let gain = new Decimal(1)

	if (hasAchievement("a", 11)) gain = gain.add(1);

	if (hasUpgrade('mem', 11)) gain = gain.times(upgradeEffect('mem', 11));
	if (hasUpgrade('mem', 14)) gain = gain.times(upgradeEffect('mem', 14));
	if (hasUpgrade('mem', 22)) gain = gain.times(upgradeEffect('mem', 22));
	if (player.light.unlocked) gain = gain.times(tmp.light.effect);
	if (hasUpgrade('dark', 11) && !canReset('dark')) gain = gain.times(2)
	if (hasUpgrade('dark', 12)) gain = gain.times(upgradeEffect('dark', 12));
	if (player.lethe.unlocked) gain = gain.times(tmp.lethe.effect);
	if (hasUpgrade('kou', 15)) gain = gain.times(upgradeEffect('kou', 15))
	if (hasMilestone('lab', 0)) gain = gain.times(player.lab.power.div(10).max(1));
	if (hasMilestone('lab', 1)) gain = gain.times(player.lab.points.max(1));
	if (hasUpgrade('storylayer', 12)) gain = gain.times(tmp["zero"].challenges[11].effecttoFragMem);
	if (hasAchievement('a', 85)) gain = gain.times(achievementEffect('a', 85));

	if (hasUpgrade('kou', 21)) gain = gain.pow(1.025)
	if (hasUpgrade('lab', 73)) gain = gain.pow(buyableEffect('lab', 12).eff1());
	if (inChallenge('zero', 11)) gain = gain.pow(0.5);
	if (challengeCompletions('saya', 21)) gain = gain.pow(challengeEffect('saya', 21));
	if (player.world.restrictChallenge && !hasUpgrade('storylayer', 14)) gain = gain.pow(0.9);

	//tetrate
	if (inChallenge('saya',21) || layers['saya'].grid.ChallengeDepth()[3]>-1) gain = gain.tetrate(layers.saya.challenges[21].debuff())

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
	return player.points.gte(new Decimal("5e2000000000"))
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