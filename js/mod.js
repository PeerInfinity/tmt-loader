let modInfo = {
	name: "The MJ Tree",
	id: "abc123",
	author: "Askinga",
	pointsName: "MJs",
	modFiles: ["layers.js", "layerss.js", "tree.js", "event.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "2.4.0",
	name: "It's time to learn (Part 2!)",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v2.4.0</h3><br>
		- More updates soon! Endgame: MJ School Upgrade 55.<br>
		- Added a new thing in the MJ Students tab. It boosts MJ Students! Added 10 upgrades, Added 3 achievements, (New softcap occurs at e2.000e10 MJs!!! The softcap is there to prevent inflation! The boost from the softcap is ^0.4!!)<br>
                - Check back here for more updates! Full changelog at <a href=https://galaxy.click/updates/355>galaxy.click/updates/355</a>`
  
let winText = `Congratulations! You have reached the end and beaten this game. Good job! 🏆`

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
	if (layers.Bo.effect().gte(1)) gain = gain.times(layers.Bo.effect())
        gain = gain.times(buyableEffect('Po', 11))
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12) && !inChallenge('SAC', 13) && !inChallenge('SAC', 19)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13) && !inChallenge('SAC', 13) && !inChallenge('SAC', 19)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 21)) gain = gain.times(10)
	if (hasUpgrade('p', 22)) gain = gain.times(upgradeEffect('p', 22))
	if (hasUpgrade('p', 24)) gain = gain.times(1000)
	if (hasUpgrade('S', 11)) gain = gain.times(10)
	if (hasUpgrade('GLA', 34)) gain = gain.times("e15000")
	if (hasUpgrade('S', 14)) gain = gain.pow(1.05)
	if (hasUpgrade('G', 11)) gain = gain.times(1e6)
	if (hasUpgrade('G', 12)) gain = gain.times(upgradeEffect('G', 12))
	if (hasUpgrade('H', 11)) gain = gain.times(1e50)
	if (hasUpgrade('H', 12)) gain = gain.times(1e20)
	if (hasUpgrade('L', 41) && !inChallenge('GLA', 11)) gain = gain.pow(1.01)
	if (hasMilestone('p', 0)) gain = gain.times(4)
	if (hasMilestone('p', 1)) gain = gain.times(15)
	if (hasMilestone('p', 2)) gain = gain.times(250)
        if (hasUpgrade('b', 11)) gain = gain.times(upgradeEffect('b', 11))
	if (hasAchievement('a', 21)) gain = gain.times(1.5)
        if (hasUpgrade('Po', 11)) gain = gain.times(100)
	if (hasUpgrade('UT', 11) && !inChallenge('GLA', 11)) gain = gain.times(1e10)
	if (hasUpgrade('UT', 22) && !inChallenge('GLA', 11)) gain = gain.pow(1.01)
	if (hasUpgrade('UT', 31) && !inChallenge('GLA', 11)) gain = gain.times(1e100)
	if (hasUpgrade('UT', 13) && !inChallenge('GLA', 11)) gain = gain.times(1e200)
	if (hasUpgrade('UT', 24) && !inChallenge('GLA', 11)) gain = gain.pow(1.02)
	if (hasUpgrade('p', 31)) gain = gain.times(1e50)
	if (hasUpgrade('UT', 26) && !inChallenge('GLA', 11)) gain = gain.times(1e150)
	if (hasUpgrade('UT', 33) && !inChallenge('GLA', 11)) gain = gain.times(1e300)
	if (hasUpgrade('GLA', 11)) gain = gain.times("e1000")
	if (hasUpgrade('GLA', 12)) gain = gain.times("e1500")
	if (hasUpgrade('GLA', 13) && !inChallenge('SAC', 16) && !inChallenge('SAC', 19)) gain = gain.times(upgradeEffect('GLA', 13))
	if (hasUpgrade('GLA', 14) && !inChallenge('SAC', 16) && !inChallenge('SAC', 19)) gain = gain.pow(1.1)
	if (hasUpgrade('GLA', 22)) gain = gain.times("e10000")
	if (hasUpgrade('GLA', 23)) gain = gain.times("e10000")
	if (hasMilestone('GLA', 0)) gain = gain.times("e10000")
	if (hasMilestone('L', 3)) gain = gain.times("e20000")
	if (hasUpgrade('GLA', 24)) gain = gain.times("e25000")
	if (hasUpgrade('GLA', 32)) gain = gain.times("e20000")
	if (hasUpgrade('GLA', 33)) gain = gain.times("e25000")
	if (hasUpgrade('GLA', 35)) gain = gain.times("e50000")
	if (inChallenge('GLA', 12)) gain = gain.pow(0.01)
	if (inChallenge('SAC', 11) || inChallenge('SAC', 19)) gain = gain.pow(0.005)
	if (hasChallenge('SAC', 11) && !inChallenge('SAC', 16)) gain = gain.pow(1.05)
	if (inChallenge('SAC', 12)) gain = gain.pow(0.00001)
	if (inChallenge('SAC', 14) || inChallenge('SAC', 19)) gain = gain.tetrate(0.9)
	if (inChallenge('SAC', 15)) gain = gain.pow(0.0001)
	if (inChallenge('SAC', 17)) gain = gain.pow(0.0987654321)
	if (hasChallenge('SAC', 17)) gain = gain.pow(1.02)
	if (inChallenge('SAC', 18)) gain = gain.tetrate(0.25)
	if (hasChallenge('SAC', 18)) gain = gain.pow(1.05)
	if (hasUpgrade('SCH', 11)) gain = gain.times("e1000000")
	if (hasUpgrade('SCH', 11)) gain = gain.pow(1.01)
	if (hasUpgrade('SCH', 14)) gain = gain.pow(1.1)
	if (hasUpgrade('SCH', 15)) gain = gain.times("e5000000")
	if (hasUpgrade('SCH', 22)) gain = gain.times(upgradeEffect('SCH', 22))
	if (hasUpgrade('SCH', 31)) gain = gain.times("e15000000")
	if (hasUpgrade('SCH', 32)) gain = gain.times("e20000000")
	gain = gain.times(tmp.SCH.powerEff)
	if (hasUpgrade('SCH', 53)) gain = gain.pow(1.01)
	if (player.points.gte("e2.000e10")) gain = gain.pow(0.4)
	if (inChallenge('SAC', 21)) gain = gain.pow(0)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
    () => "<br>Get MJ School Upgrade 55 to beat the game!",
	"<br>",
	() => (player.points.gte("e1.000e10")) ? "<span style=\"color: rgb(255, 0, 0); 0px 0px 10px;\">MJs are softcapped past e2.000e10 due to overpopulation! (^0.4)</span><br>" : "",
	"<br>",
]

// Determines when the game "ends"
function isEndgame() {
	return (hasUpgrade('SCH', 55))
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
