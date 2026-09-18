let modInfo = {
	name: "Devourer of Flies",
	author: "THE ABSOLUTE OF FLIES aka Myxoedema",
	pointsName: "Flies",
	modFiles: ["layers.js", "tree.js"],
	get pointsName() {
        let gain = getPointGen()
        if (gain.gte("1e1000")) {
            return "Flies (softcapped)"
        }
        return "Flies"
    },

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	name: "Mutating and Infecting",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.4</h3><br>
		- Added 2 Layers and MUCH MORRE CONTENT
		<br>
	<h3>v0.3</h3><br>
		- Added 2 Layers and more content.
		<br>
	<h3>v0.2</h3><br>
		- Added 1 Layer and more content.
		<br>
	<h3>v0.1 Release</h3><br>
		- Added Game<br>
		- Added 4 Layers.`

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
	if (!inChallenge('h',41)) {
		if (hasUpgrade('w', 11)) gain = gain.times(2);
		if (hasUpgrade('w', 12)) gain = gain.times(1.5);
		if (hasUpgrade('w', 13)) gain = gain.times(upgradeEffect('w', 13));
		if (hasUpgrade('w', 22)) gain = gain.times(3);
		if (hasUpgrade('w', 23)) gain = gain.times(upgradeEffect('w', 23));
		if (hasUpgrade('w', 24)) gain = gain.times(upgradeEffect('w', 24));
	} else {
		if (hasUpgrade('w', 11)) gain = gain.times(1);
		if (hasUpgrade('w', 12)) gain = gain.times(1);
		if (hasUpgrade('w', 13)) gain = gain.times(1);
		if (hasUpgrade('w', 22)) gain = gain.times(1);
		if (hasUpgrade('w', 23)) gain = gain.times(1);
		if (hasUpgrade('w', 24)) gain = gain.times(1);
	}
	if (hasMilestone('f' ,1) && !inChallenge('h', 12)) gain = gain.times(4);
	if(!inChallenge('h', 21) && !inChallenge('h',41)){
        gain = gain.times(player.p.points.add(1).pow(0.9));
    };
	if (hasUpgrade('f', 11) && !inChallenge('h', 12)) gain = gain.times(upgradeEffect('f', 11));
	if(!inChallenge('h', 32)){
		gain = gain.times(buyableEffect('p', 11));
	}
    
	if (hasUpgrade('m', 11)) gain = gain.times(10);
	if (hasUpgrade('m', 12) && !inChallenge('h', 31)) gain = gain.times(upgradeEffect("m",12));
	if (hasUpgrade('m', 32)) gain = gain.times(upgradeEffect('m',32));
	if (hasUpgrade('f', 14)) gain = gain.times(upgradeEffect('f',14));
	if (hasUpgrade('f', 21)) gain = gain.times(upgradeEffect('f', 21));
	gain = gain.times(Decimal.pow(6, player.v.points));
	if (hasUpgrade('f', 24)) gain = gain.times(upgradeEffect('f',24));
	if (hasUpgrade('m', 63)) gain = gain.times(upgradeEffect('m',63));
	if (hasMilestone('v', 4)) gain = gain.times(milestoneEffect('v',4));
	
	if (inChallenge('h', 11)) {
        gain = gain.pow(0.75)
    };
	if (hasChallenge('h', 11)) {
        gain = gain.pow(challengeEffect('h', 11))
    };
	if (inChallenge('h', 22)) {
        gain = gain.pow(0.5)
    };
	if (hasChallenge('h', 22)) {
        gain = gain.pow(challengeEffect('h', 22))
    };
	if(hasChallenge('h',42)){
		gain = gain.pow(1.05)
	}
	if (inChallenge('h', 31)) {
        gain = gain.pow(0.5)
    };
	if (inChallenge('h', 32)) {
        gain = gain.pow(0.1)
    };
	if (inChallenge('h', 41)) {
        gain = gain.pow(0.2)
    };
	if (inChallenge('h', 42)) {
        gain = gain.pow(0.05)
    };
	if (hasUpgrade('e', 11)) gain = gain.times(100);
	if (hasUpgrade('e', 11)) mult = mult.pow(1.02);
	if (hasUpgrade('e', 21)) gain = gain.times(upgradeEffect('e',21));
	if (hasUpgrade('e', 33)) gain = gain.times(upgradeEffect('e',33));
	if (hasUpgrade('e', 41)) gain = gain.times(1e20);
	if (hasUpgrade('e', 62)) gain = gain.times(upgradeEffect('e',62));
	if (hasUpgrade('e', 64)) gain = gain.times(upgradeEffect('e',64));
	if (hasUpgrade('e', 75)) gain = gain.times(upgradeEffect('e',75));
	if (hasUpgrade('u', 12)) gain = gain.times(upgradeEffect('u',12));
	if (hasUpgrade('u', 27)) gain = gain.times(upgradeEffect('u',27));
	if (hasUpgrade('vi', 12)) gain = gain.times(upgradeEffect('vi',12));
	if (hasUpgrade('vi', 14)) gain = gain.times(upgradeEffect('vi',14));
	
	gain = softcap(gain,new Decimal("1e1000"),0.5)
	
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
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}