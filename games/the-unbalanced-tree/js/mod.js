let modInfo = {
	name: "The Unbalanced Tree",
	id: "tutr",
	author: "me",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "https://discord.gg/ySEkYU7eku",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 100000000000,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.3",
	name: "Dilation CUBED!!??!",
}

let changelog = `<h1>Changelog:</h1><br>
<h3>v0.1.3</h3><br>
		- Added more upgrades, 3 challenges and fixed balancing issues.<br>
		- Bumped Endgame to ~5000 RG.<br>
		- Note: game is finished!
<h3>v0.1.2</h3><br>
		- Added REALITY!!!<br>
		- Bumped Endgame to ~500 RG.<br>
<h3>v0.1.1</h3><br>
		- Added 6 more ECs and 5 milestones.<br>
<h3>v0.1</h3><br>
		- Added 6 ECs.<br>
<h3>v0.0.4</h3><br>
		- Added tons of upgrades.<br>
<h3>v0.0.3</h3><br>
		- Added Eternity, 3 challenges and an upgrade.<br>
<h3>v0.0.2</h3><br>
		- Added 3 challenges and 4 milestones.<br>
<h3>v0.0.1.7.1</h3><br>
		- Fixed an inflation bug.<br>
<h3>v0.0.1.7</h3><br>
		- Added 3 upgrades and a challenge.<br>
<h3>v0.0.1.6</h3><br>
		- Added tons of upgrades and fixed some bugs.<br>
<h3>v0.0.1.5.1</h3><br>
		- Added Infinity and an upgrade.<br>
<h3>v0.0.1.5</h3><br>
		- Added 4 upgrades.<br>
<h3>v0.0.1.4</h3><br>
		- Added 3 upgrades.<br>
<h3>v0.0.1.3</h3><br>
		- Added 2 upgrades.<br>
		- Fixed some bugs.<br>
<h3>v0.0.1.2.2</h3><br>
		- Added an upgrade.<br>
<h3>v0.0.1.2.1</h3><br>
		- Added a few more upgrades.<br>
<h3>v0.0.1.2</h3><br>
		- Added 1 more upgrade.<br>
	<h3>v0.0.1.1.1</h3><br>
		- Added 1 more upgrade.<br>
		<h3>v0.0.1.1</h3><br>
		- Added another upgrade.<br>
		<h3>v0.0.1</h3><br>
		- Added a few upgrades.<br>
		<h3>v0.0</h3><br>
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
	let gain = new Decimal(1)
	if (hasUpgrade('p', 11)) gain = gain.times(2);
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12));
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13));
	if (hasUpgrade('p', 14)) gain = gain.pow(1.25);
	if (hasUpgrade('p', 21)) gain = gain.pow(1.05);
	if (hasUpgrade('i', 11)) gain = gain.times(upgradeEffect('i', 11));
	if (hasUpgrade('i', 12)) gain = gain.pow(upgradeEffect('i', 12));
	if (hasUpgrade('i', 13)) gain = gain.times(upgradeEffect('i', 13));
	if (hasUpgrade('i', 14)) gain = gain.times(upgradeEffect('i', 14));
	if (hasUpgrade('i', 15)) gain = gain.times(upgradeEffect('i', 15));
	if (hasUpgrade('i', 16)) gain = gain.times(upgradeEffect('i', 16));
	if (hasUpgrade('i', 21)) gain = gain.times(upgradeEffect('i', 21));
	if (hasUpgrade('i', 22)) gain = gain.times(upgradeEffect('i', 22));
	if (hasUpgrade('i', 23)) gain = gain.times(upgradeEffect('i', 23));
	if (hasUpgrade('i', 24)) gain = gain.times(upgradeEffect('i', 24));
	if (hasUpgrade('inf', 11)) gain = gain.times(upgradeEffect('inf', 11));
	if (hasUpgrade('inf', 12)) gain = gain.pow(upgradeEffect('inf', 12));
	if (hasUpgrade('inf', 13)) gain = gain.pow(upgradeEffect('inf', 13));
	if (hasUpgrade('inf', 14)) gain = gain.pow(upgradeEffect('inf', 14));
	if (hasUpgrade('inf', 15)) gain = gain.times(upgradeEffect('inf', 15));
	if (hasUpgrade('inf', 21)) gain = gain.times(upgradeEffect('inf', 21));
	if (hasUpgrade('inf', 22)) gain = gain.times(upgradeEffect('inf', 22));
	if (hasUpgrade('inf', 23)) gain = gain.times(upgradeEffect('inf', 23));
	if (hasUpgrade('inf', 24)) gain = gain.times(upgradeEffect('inf', 24));
	if (inChallenge('inf', 11)) gain = gain.pow(0.5);
	if (hasChallenge('inf', 11)) gain = gain.pow(1.11);
	if (hasMilestone('inf', 0)) gain = gain.times(1e9);
	if (hasMilestone('inf', 1)) gain = gain.times(1e15);
	if (hasMilestone('inf', 2)) gain = gain.times(1e35);
	if (hasMilestone('inf', 3)) gain = gain.pow(1.1);
	if (hasMilestone('inf', 4)) gain = gain.pow(2);
	if (inChallenge('inf', 12)) gain = gain.div(1e25);
	if (hasChallenge('inf', 12)) gain = gain.times(1e100);
	if (inChallenge('inf', 21)) gain = log2(gain);
	if (hasChallenge('inf', 21)) gain = gain.pow(1.095);
	if (inChallenge('inf', 22)) gain = gain.pow(0.4);
	if (hasChallenge('inf', 22)) gain = gain.pow(1.0975);
	if (inChallenge('inf', 31)) gain = gain.div(1e35);
	if (hasChallenge('inf', 31)) gain = gain.times(1e125);
	if (inChallenge('inf', 32)) gain = log2(gain.pow(0.8));
	if (hasChallenge('inf', 32)) gain = gain.pow(1.09);
	if (hasUpgrade('e', 11)) gain = gain.times(upgradeEffect('e', 11));
	if (hasUpgrade('e', 12)) gain = gain.times(upgradeEffect('e', 12));
	if (hasUpgrade('e', 13)) gain = gain.times(upgradeEffect('e', 13));
	if (hasUpgrade('e', 14)) gain = gain.pow(upgradeEffect('e', 14));
	if (hasUpgrade('e', 15)) gain = gain.times(696969);
	if (hasUpgrade('e', 16)) gain = gain.times(6.9e69);
	if (hasUpgrade('e', 21)) gain = gain.pow(upgradeEffect('e', 21));
	if (hasUpgrade('e', 22)) gain = gain.pow(upgradeEffect('e', 22));
	if (hasUpgrade('e', 23)) gain = gain.times(upgradeEffect('e', 23));
	if (hasUpgrade('e', 24)) gain = gain.times(upgradeEffect('e', 24));
	if (inChallenge('e', 11)) gain = gain.pow(0.3);
	if (hasChallenge('e', 11)) gain = gain.pow(1.2);
	if (inChallenge('e', 12)) gain = gain.div(1e125);
	if (hasChallenge('e', 12)) gain = gain.times(1e200);
	if (inChallenge('e', 21)) gain = ln(gain);
	if (hasChallenge('e', 21)) gain = gain.pow(1.1);
	if (inChallenge('e', 22)) gain = gain.div(upgradeEffect('i', 15));
	if (hasChallenge('e', 22)) gain = gain.pow(1.16);
	if (inChallenge('e', 31)) gain = gain.log2(gain.pow(0.5));
	if (hasChallenge('e', 31)) gain = gain.times(1e500);
	if (inChallenge('e', 32)) gain = gain.div(upgradeEffect('i', 14));
	if (hasChallenge('e', 32)) gain = gain.pow(1.111);
	if (inChallenge('e', 41)) gain = gain.pow(0.2);
	if (hasChallenge('e', 41)) gain = gain.pow(1.25);
	if (inChallenge('e', 42)) gain = gain.div(1e300);
	if (hasChallenge('e', 42)) gain = gain.pow(1.09);
	if (inChallenge('e', 51)) gain = ln(gain.pow(0.6));
	if (hasChallenge('e', 51)) gain = gain.pow(1.1);
	if (inChallenge('e', 52)) gain = gain.div(upgradeEffect('i', 15).times((upgradeEffect('i', 14))));
	if (hasChallenge('e', 52)) gain = gain.pow(1.2);
	if (inChallenge('e', 61)) gain = gain.log2(gain.pow(0.35).div(1e50));
	if (hasChallenge('e', 61)) gain = gain.times(1e1111);
	if (inChallenge('e', 62)) gain = gain.div(upgradeEffect('i', 15).times((upgradeEffect('i', 14)).times((upgradeEffect('i', 16))).times((upgradeEffect('i', 17)))));
	if (hasChallenge('e', 62)) gain = gain.pow(1.111);
	if (hasMilestone('e', 0)) gain = gain.times(1e9);
	if (hasMilestone('e', 1)) gain = gain.times(1e15);
	if (hasMilestone('e', 2)) gain = gain.times(1e35);
	if (hasMilestone('e', 3)) gain = gain.pow(1.1);
	if (hasMilestone('e', 4)) gain = gain.pow(2);
	if (inChallenge('r', 11)) gain = gain.pow(gain.pow(0.75));
	if (hasUpgrade('r', 12)) gain = gain.times(upgradeEffect('r', 12));
	if (inChallenge('r', 12)) gain = gain.pow(gain.pow(0.57));
	if (inChallenge('r', 12)) gain = gain.pow(gain.pow(0.42));
	gain = gain.times(tmp.e.effect)
	gain = gain.times(tmp.r.effect)
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
	return player.r.points.gte(new Decimal("5000"))
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