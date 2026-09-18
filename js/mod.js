let modInfo = {
	name: "The Normal Tree",
	id: "normal",
	author: "Ozvali",
	pointsName: "points",
	modFiles: ["layers/prestige.js","layers/layer2.js","layers/layer3.js","layers/layer4.js","layers/b_layer1.js","layers/b_layer2.js", "layers/info.js","layers/layer5.js","layers/layer6.js","layers/layer7.js","layers/b_layer3.js","layers/g_layer1.js", "layers/playerinfo.js","layers/layer8.js","layers/layer9.js","layers/b_layer4.js","layers/layer10.js","layers/Ascend.js","layers/Ascend_b.js","layers/layer11.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 0.001,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.4",
	name: "Ascending Normality",
}

let changelog = `<h1>Changelog:</h1><br>
 <h3>v0.1.4:</h3><br>
 - Added 2 Layers<br>
 - Added 4 Ascension Challenges<br>
 - Refixed Balancing during Ascension Pre-150<br>
 - Fixed Ascension Scaling<br>
 - Refixed some formulas<br>
 - Added Generator Scaler<br>
 - <a>Endgame: 40 Key Prestige Points</a><br><br>
 <h3>v0.1.3: Ascending Normality</h3><br>
 - Added Ascension...<br>
 - Fixed 3 Milestones<br>
 - Readjusted iP & cB slightly<br>
 - Added 3 Scalers<br>
 - <a>Endgame: 150 Ascension Points</a><br><br>
	<h3>v0.1.2:</h3><br>
	- Added 4 Layers<br>
	- Fixed playerinfo.js without bugs on opening the Node<br>
	- Fixed fP & gP slightly.<br>
	- Added Generator Upgrades for later use.<br>
	- <a>Endgame: 70 Juggling Prestige Points</a><br><br>
	<h3>v0.1.1:</h3><br>
	- Added 3 Layers (Another Type of Layer)<br>
	- Moved All 'Prestige' and 'Booster' Content to Side-Layer (Also Info about the three types)<br>
	- Fixed 4 Milestones<br>
	- Adjusted 2 Milestones<br>
	- Fixed 1st Buffed Booster giving inflated points which caused the game into heavy inflation<br>
	- <a>Endgame: 50 Golden Prestige Points</a><br><br>
	
	<h3>v0.1: Normal Flattening</h3><br>
		- Added 8 Layers worth of <a>normal</a> content<br>
 - <a>Endgame: 25 Flattened Prestige Points</a><br>
`

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
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 13)) gain = gain.times(10)
if (hasMilestone('bP', 11)) gain = gain.times(3)
if (hasMilestone('dP', 12)) gain = gain.times(10)
if (hasUpgrade('eP', 14)) gain = gain.times(100)
if (player.b.unlocked) gain = gain.times(tmp.b.effect)
if (hasUpgrade('hP', 16)) gain = gain.pow(1.1)
if (hasUpgrade('Ab', 14)) gain = gain.pow(1.2)
if (hasMilestone('iP', 15)) gain = gain.times(1000000)
if (inChallenge('Ab', 11)) gain = gain.pow(0.06)
if (inChallenge('Ab', 12)) gain = gain.pow(0.001).minus(0.937)
if (inChallenge('Ab', 21)) gain = gain.pow(0.005).minus(0.877)
if (inChallenge('Ab', 21) && player.points.gte(1.5)) gain = gain.div(player.points.log10().add(1.1))
if (inChallenge('Ab', 11) && hasUpgrade('Ab', 22)) gain = gain.pow(1.3)
if (hasUpgrade('kP', 14)) gain = gain.pow(1.2)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
function(){
 let endgame = "<a>Endgame: 40 Key Prestige Points"
return endgame
},
function(){
 let cha = ""
 if (inChallenge('Ab', 21)) cha = "Point nerf formula: /1.1+log(points)"
return cha
},
]

// Determines when the game "ends"
function isEndgame() {
	return player.kP.points.gte(new Decimal(40))
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