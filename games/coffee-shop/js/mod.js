let modInfo = {
	name: "Coffee Shop",
	author: "Moosiqe",
	pointsName: "Beans",
	modFiles: ["cups.js", "tree.js", "popularity.js", "barista.js", "stars.js", "lab.js", "warehouse.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}



// Set your version in num and name
let VERSION = {
	num: "0.11",
	name: "Release",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1 | Release</h3><br>
		- 3 Layers.<br>
		- A lot of BEANS <br><br>
	<h3>v0.11 | Mandatory bug fixes + QoL Update </h3><br>
		- corrected lab ratios; multiple combinations are possible now <br>
		- added presets once the recipe is found <br>
		- and other smaller changes`

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

function getGameSpeedMod() {
    let speed = 1;
    if (hasUpgrade('c', 35)) {
        let bonus = player.l.researchPoints.div(10).times(0.02);
        speed += bonus.toNumber();
    }
    return speed;
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	let gain = new Decimal(1)
    
	// --- Coffee Cups Upgrades ---
	if (hasUpgrade('c', 11)) gain = gain.times(upgradeEffect('c', 11))
	if (hasUpgrade('c', 12)) gain = gain.times(2)
	if (hasUpgrade('c', 13)) gain = gain.times(upgradeEffect('c', 13))
	if (hasUpgrade('c', 14)) gain = gain.times(4)
	if (hasUpgrade('c', 15)) gain = gain.times(upgradeEffect('c', 15))
	if (hasUpgrade('c', 21)) gain = gain.times(5)
	if (hasUpgrade('c', 22)) gain = gain.times(upgradeEffect('c', 22))
	if (hasUpgrade('c', 31)) gain = gain.times(upgradeEffect('c', 31))
	if (hasUpgrade('c', 32)) gain = gain.times(upgradeEffect('c', 32))
	if (hasUpgrade('c', 33)) gain = gain.times(upgradeEffect('c', 33))
	if (hasUpgrade('c', 64)) gain = gain.times(upgradeEffect('c', 64))
		
	
	// --- Popularity Upgrades & other ---
	//if (player.p.unlocked) {
        //let customerBoost = player.p.customers.times(0.1).add(1);
        //gain = gain.times(customerBoost);
    //}
	if (hasUpgrade('p', 11)) gain = gain.times(upgradeEffect('p', 11))
	if (hasUpgrade('p', 15)) {gain = gain.times(upgradeEffect('p', 15))}
	if (hasUpgrade('p', 22)) {gain = gain.times(upgradeEffect('p', 22))}
	if (hasUpgrade('p', 24)) {gain = gain.times(upgradeEffect('p', 24));}
	if (hasMilestone('p', 2)) {gain = gain.times("1e50");}
	// --- Barista Upgrades ---
	if (hasMilestone('b', 0)) {gain = gain.times(buyableEffect('b', 11))}

	// --- Milk Upgrades ---
	if (hasUpgrade('c', 41)) {gain = gain.times(upgradeEffect('c', 41))}
	if (hasUpgrade('c', 54)) {gain = gain.times(upgradeEffect('c', 54))}

	// --- Lab Upgrades ---
	if (buyableEffect('l', 51)) {gain = gain.times(buyableEffect('l', 51))}

	// --- Star Upgrades ---
	if (player.s.points.gt(0)) {
		let starExponent = player.s.points.times(0.03).add(1);
		gain = gain.pow(starExponent);
	}
	// --- Warehouse Upgrades ---
	if (hasUpgrade('w', 11)) {gain = gain.times(upgradeEffect('w', 11))}
    
	// --- Softcap 1 ---
	gain = softcap(gain, new Decimal("1e2500"), new Decimal(0.05));
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
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(10) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
