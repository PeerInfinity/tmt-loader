let modInfo = {
	name: "The Atomic Tree",
	id: "atomictree",
	author: "cornucanis",
	pointsName: "aether",
	modFiles: [
		"layers.js",
		"tree.js",
		"layers/energy.js",
		"layers/protons.js",
		"layers/electrons.js",
		"layers/neutrons.js",
		"layers/elements.js",
		"layers/atoms.js",
		"layers/resons.js"
	],
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.5.1",
	name: "Resonate",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.5.1</h3><br>
		- Quick fix for broken upgrade<br><br>
	<h3>v0.5.0</h3><br>
		- Sped up electron era.<br>
		- Sped up electron era.<br>
		- Implemented atom classification fully.<br>
		- What, you want more? That classification algorithm was a huge pain to make work properly and efficiently.<br>
		- Fine, have another layer. Let there be resons! <br>
		* ENDGAME: Game should be balanced until ~2 resons.<br><br>
	<h3>v0.4.1</h3><br>
		- Added in the periodic table and a lot of backend work for classification. Classification feature is still not fully implemented, so don't expect it to work yet. It's just something pretty to look at for now.<br>
		* ENDGAME: Game should be balanced until ~20 atoms.<br><br>
	<h3>v0.4.0</h3><br>
		- Tweaked unclassified atom effect<br>
		- Added early milestones to atomic layer in preparation for classification, the atomic layer's unique feature.<br>
		* ENDGAME: Game should be balanced until ~20 atoms.<br><br>
	<h3>v0.3.1</h3><br>
		- Did a bit more balancing of the early game leading up to atomic reset.<br>
		* ENDGAME: Game should be balanced until reaching first atom reset.<br><br>
	<h3>v0.3.0</h3><br>
		- Rounded out neutron layer to prepare for next row.<br>
		- Added in barebones for atom layer (NOT FULLY IMPLEMENTED OR WORKING YET.)<br>
		- Softcapped some more early upgrades.<br>
		* ENDGAME: Game should be balanced until reaching first atom reset.<br><br>
	<h3>v0.2.0</h3><br>
		- Added electron layer<br>
		- Rebalanced early layers<br>
		- Softcapped a few upgrades<br>
		- Added barebones for neutron layer (NOT FULLY IMPLEMENTED OR WORKING YET.)<br>
		* ENDGAME: Game should be balanced until reaching neutrons<br><br>
	<h3>v0.1.1</h3><br>
		- Added more to proton layer and did some balancing.<br>
		* ENDGAME: Game should be balanced until ~10 protons<br><br>
	<h3>v0.1.0</h3><br>
		- Added proton layer - Barebones implementation, still not properly fleshed out.<br><br>
	<h3>v0.0.1</h3><br>
		- Rebalanced progression of energy layer in preparation for next layer<br><br>
	<h3>v0.0</h3><br>
		- Initial commit.<br>
		- Added energy layer (not yet fully balanced.)`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	let gen = false;
	if (hasEUpg(11)) gen = getEEff(11);
	return gen;
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	let elecEff = tmp.l.effect[1];
	let atomEff = tmp.a.effect;
	
	//currency effects
	if (player.p.unlocked) gain = gain.mul(tmp.p.effect);
	if (elecEff && elecEff.gte(1)) gain = gain.mul(elecEff);
	if (atomEff && atomEff.gte(1)) gain = gain.mul(atomEff);
	
	//upgrades
	if (hasEUpg(12)) gain = gain.mul(getEEff(12));
	if (hasEUpg(13)) gain = gain.mul(getEEff(13));
	if (hasEUpg(21)) gain = gain.mul(getEEff(21));
	if (hasEUpg(23)) gain = gain.mul(getEEff(23));
	if (hasEUpg(33)) gain = gain.mul(getEEff(33));
	if (hasPUpg(13)) gain = gain.mul(getPEff(13));
	
	//buyables
	if (getBuyableAmount("l", 11).gte(1)) gain = gain.mul(buyableEffect("l", 11));
	
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	forceSingleAtomTab:true
}}

// Display extra things at the top of the page
var displayThings = [
	"Current engdame: ~2 resons"
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