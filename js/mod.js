let modInfo = {
	name: "An Operation Tree",
	author: "am30936",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "N/A",
	discordLink: "N/A",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3.1",
	name: "An Operation Tree",
}

let changelog = `<h1>Changelog:</h1><br>
	<br>
	<h3>v0.3.1</h3><br>
	- Added an effect to the 2nd, 3rd, and 7th Exponentiation milestones<br>
		- Decreased most row 1 and 2 Exponentiation upgrade costs<br>
		- Decreased Exponentiation milestones 3-6, 13-15 requirements<br>
		- Decreased Actualization upgrade 4 cost<br>
		- Buffed 4th Subtraction milestone<br>
		- Altered the 5th Division challenge reward formula<br>
		- Implemented Logarithm upgrade 8's effect<br>
		- Division challenges now save inside The Logarithm; removed the note on Division challenge 1<br>
		- Nerfed Exponentiation milestone 6<br>
		- Nerfed Root milestone 3<br>
		- Nerfed Achievement 16 reward<br>
		- Colorized effects of layer points based on the layer<br>
	<br>
	<br>
	<h3>v0.3</h3><br>
		- Added Exponentiation:<br>
			- 12 Upgrades<br>
			- 15 Milestones<br>
			- 1 Buyable<br>
		- Added Roots:<br>
			- 4 Upgrades<br>
			- 5 Milestones<br>
		- Added Logarithms:<br>
			- 12 Upgrades<br>
			- 1 Challenge<br>
		- Added 16 Achievements<br>
		- Added 1 Multiplication Buyable<br>
		- Added 1 Multiplication Milestone<br>
		- Added 1 Division Challenge<br>
		- Altered Subtraction effect formula<br>
		- Fixed Subtraction to actually need 4th Addition upgrade to prestige<br>
		- Made Division challenges slightly harder<br>
		- Increased 5th Multiplication upgrade cost: 6 -> 8<br>
		- Altered 7th Multiplication upgrade formula<br>
		- Fixed the 3rd Division upgrade desription<br>
		- Changed 3 Achievement names<br>
		- Included commas on numbers over 1,000<br>
		- Fixed the Changelog for 0.2
	<br>
	<br>
	<h3>v0.2</h3><br>
		- Added Multiplication:<br>
			- 12 Upgrades<br>
			- 6 Milestones<br>
		- Added Division:<br>
			- 4 Upgrades<br>
			- 4 Challenges<br>
		- Added 7 Achievements<br>
		- Added 1 Subtraction Milestone<br>
		- Rebalanced content from v0.1
	<br>
	<br>
	<h3>v0.1</h3><br>
		- Added Addition:<br>
			- 12 Upgrades<br>
		- Added Subtraction:<br>
			- 3 Milestones<br>
		- Added 5 Achievements`

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

	// Addition

	// Upgrade effects
	if (hasUpgrade('ap', 11)) gain = gain.add(upgradeEffect('ap', 11))
	if (hasUpgrade('ap', 12)) gain = gain.add(upgradeEffect('ap', 12))
	if (hasUpgrade('ap', 13)) gain = gain.add(upgradeEffect('ap', 13))
	if (hasUpgrade('ap', 21)) gain = gain.add(upgradeEffect('ap', 21))
	if (hasUpgrade('ap', 22)) gain = gain.add(upgradeEffect('ap', 22))
	if (hasUpgrade('ap', 23)) gain = gain.add(upgradeEffect('ap', 23))
	if (hasUpgrade('ap', 24)) gain = gain.add(upgradeEffect('ap', 24))
	if (hasUpgrade('ap', 32)) gain = gain.add(upgradeEffect('ap', 32))
	// Layer effects
	gain = gain.sub(tmp.sp.effect)
	// Multiplication

	// Achievemnt effects
	if (hasAchievement('ach', 21)) gain = gain.mul(1.2)
	if (hasAchievement('ach', 33)) gain = gain.mul(2)
	if (hasAchievement('ach', 42)) gain = gain.mul(2)
	// Layer effects
	if (player.mp.unlocked) gain = gain.mul(tmp.mp.effect)
	if (player.dp.unlocked && player.dp.total.gte(1)) gain = gain.div(tmp.dp.effect)
	// Upgrade effects
	if (hasUpgrade('mp', 11)) gain = gain.mul(upgradeEffect('mp', 11))
	if (hasUpgrade('mp', 12)) gain = gain.mul(upgradeEffect('mp', 12))
	if (hasUpgrade('mp', 13)) gain = gain.mul(upgradeEffect('mp', 13))
	// Challenge effects
	if (inChallenge('dp', 11) || inChallenge('dp', 22)) gain = gain.div(50)
	if (inChallenge('dp', 12) || inChallenge('dp', 22)) gain = gain.div(tmp.dp.challenges[12].effect)


	if (gain.lte(0)) gain = new Decimal(0)
	if (gain.lte(1) && hasUpgrade('ap', 11)) gain = new Decimal (1)
	// Exponentiation

	if (hasUpgrade('ep', 12)) gain = gain.pow(upgradeEffect('ep', 12))
	if (hasUpgrade('ep', 21)) gain = gain.pow(upgradeEffect('ep', 21))
	if (player.rp.unlocked && gain.gt(1)) gain = gain.root(tmp.rp.effect)
		
	if (gain.lte(1) && hasUpgrade('ap', 11)) gain = new Decimal(1)
	if (gain.gte(1) && inChallenge('lp', 11)) gain = gain.log(tmp.lp.challenges[11].effect)
	if (gain.lte(1) && hasUpgrade('ap', 11)) gain = new Decimal(1)

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
let displayThings = [
	"<br>",
	"Current Endgame: 1,000,000 Logarithm points",
	// endgame points ~ e200
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