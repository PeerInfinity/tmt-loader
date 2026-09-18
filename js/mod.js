let modInfo = {
	name: "The Incremental Tree",
	author: "liam",
	pointsName: "points",
	modFiles: ["tree.js", "p.js", "m.js", "pt.js", "e.js", "n.js", 'r.js', 'q.js'],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1.5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "4.0.0",
	name: "science",
}

let changelog = `<h1>Changelog:</h1><br>
<h3>v4.0.0</h3><br>
		- Added about 30 upgrades<br>
		- Added 10 challenges<br>
		- Added 2 new layers<br>

<h3>v3</h3><br>
		- Added 24(?) upgrades<br>
		- Added 1 milestone<br>
		- Added 2 layers<br>
		


<h3>v2.1</h3><br>
		- Added upgrade names<br>

	<h3>v2</h3><br>
		- Added a lot of upgrades<br>
		- Added protons<br>






	<br><br><br><br><br>	- you found me!`

let winText = `Message from the dev: thank's for playing and beating my game! I hope you enjoyed it. Please comment any suggestions you have for a future update!`

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
	if (hasUpgrade("p", 11)) gain = gain.times(2);
	if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12));
	if (hasUpgrade("p", 13)) gain = gain.times(2.4);
	if (hasUpgrade("p", 14)) gain = gain.times(2);
	if (hasUpgrade("p", 21)) gain = gain.times(3.5);
	if (hasUpgrade("p", 23)) gain = gain.times(upgradeEffect("p", 23));
	if (hasUpgrade("p", 24)) gain = gain.times(4);
	if (hasUpgrade("p", 25)) gain = gain.times(3.4);

	if (hasUpgrade("m", 11)) gain = gain.times(4);
	if (hasUpgrade("m", 13)) gain = gain.times(1.5);
	if (hasUpgrade("m", 15)) gain = gain.times(4);
	if (hasUpgrade("m", 23) && hasUpgrade("p", 23)) gain = gain.times(upgradeEffect("p", 23));
	if (hasUpgrade("m", 25)) gain = gain.times(5);
	if (hasUpgrade("m", 35)) gain = gain.times(4);

	if (hasUpgrade("pt", 11)) gain = gain.times(8);
	if (hasUpgrade("pt", 13)) gain = gain.times(15);
	if (hasUpgrade("pt", 14)) gain = gain.times(upgradeEffect("pt", 14));
	if (hasUpgrade("pt", 21)) gain = gain.times(upgradeEffect("pt", 21));
	if (hasUpgrade("pt", 22)) gain = gain.times(10000);
	if (hasUpgrade("pt", 31)) gain = gain.times(1e15);
	if (hasUpgrade("pt", 35)) gain = gain.times(1000);

	if (hasUpgrade("e", 11)) gain = gain.times(1e6);

		if (hasUpgrade("m", 53)) gain = gain.times(1e70);
				if (hasUpgrade("pt", 44)) gain = gain.times(1.64e37);

	if (hasUpgrade("n", 12)) gain = gain.times(1e75);
	if (hasUpgrade("n", 13)) gain = gain.times(1e40);
	if (hasUpgrade("n", 14)) gain = gain.times(1e100);
	if (hasUpgrade("pt", 52)) gain = gain.times("1e2500");

	if (hasUpgrade("r", 11)) gain = gain.times("1e100");
	if (hasUpgrade("r", 13)) gain = gain.times("1e100");
    if (hasUpgrade("r", 22)) gain = gain.times("1e50");

    if (hasUpgrade("e", 14)) gain = gain.times("1e75000");










	if (hasUpgrade("m", 22)) gain = gain.pow(1.1);
	if (hasUpgrade("m", 32)) gain = gain.pow(1.08);

	if (hasUpgrade("pt", 25)) gain = gain.pow(1.12);

		if (hasUpgrade("e", 11)) gain = gain.pow(1.03);

				if (hasUpgrade("m", 44)) gain = gain.pow(1.025);
								if (hasUpgrade("m", 51)) gain = gain.pow(1.08);
	if (hasUpgrade("pt", 43)) gain = gain.pow(1.03);

		if (hasUpgrade("n", 11)) gain = gain.pow(1.01);
if (hasChallenge('n', 11)) gain = gain.pow(1.04)
if (hasChallenge('n', 31)) gain = gain.pow(1.05)
		if (hasUpgrade("r", 14)) gain = gain.pow(1.04);
		if (hasUpgrade("n", 23)) gain = gain.pow(1.03);
if (hasChallenge('r', 22)) gain = gain.pow(1.03)
if (hasChallenge('n', 32)) gain = gain.pow(1.03)


		if (hasUpgrade("q", 11)) gain = gain.pow(upgradeEffect('q', 11));




if (inChallenge('n', 11)) gain = gain.pow(0.12)
if (inChallenge('n', 32)) gain = gain.pow(0.5)

if (inChallenge('r', 22)) gain = gain.sub(gain).add(0.5)

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
		function() {if (true) return "endgame: e6,657,830 points"},


]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e6,657,830"))
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
