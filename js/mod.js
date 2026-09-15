let modInfo = {
	name: "Justcubing97's Something Tree",
	author: "Justcubing97",
	pointsName: "Points",
	modFiles: ["achievements.js", "savebank.js", "unlock.js", "fundamental.js", "primitive.js", "numbercore.js", "corebooster.js", "arithmetic.js", "addition.js", "subtraction.js", "multiplication.js", "division.js", "dimension.js", "polygon.js",
		"planetary.js", "pbooster.js", "tree.js"],

	discordName: "Justcubing97's Server (DO NOT USE)",
	discordLink: "https://discord.gg/W7PMhx4mSs",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.5.9",
	name: "?!?",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.5.9</h3><br>
		- genuinely wtf happened <br>
		- Endgame: e1e11 Points. <br>
	<h3>v0.5.8</h3><br>
		- THE 6TH DIMENSION NOW EXISTS! <br>
		- Just more content in general. <br>
		- Endgame: 12th Polygon upgrades. <br>
	<h3>v0.5.7</h3><br>
		- Planetary Booster layer! <br>
		- Adjusted ALL hotkeys. <br>
		- Changed Arithmetic Challenge 6. <br>
		- Fixed a minor Core Booster issue. <br>
		- Changed the tooltip for Division a tiny bit. <br>
		- Revised Shape hardcap logic. <br>
		- And of course... MORE PLANETARY CONTENT! <br>
		- Endgame: 1e640 Shapes. <br>
		(the next day i had to fix a MAJOR bug with the 7th funda upgrade!)
	<h3>v0.5.6</h3><br>
		- Fixed a Division line saying \"Next Division at NaN Numbers\". <br>
		- Fixed a Constructor bug. <br>
		- Endgame: complete Arithmetic Challenge 6. <br>
	<h3>v0.5.5</h3><br>
		- More Planetary Generators. <br>
		- Functionality for more Planetary Challenges. <br>
		- More content! <br>
		- Fixed a Planet Power bug. <br>
		- Endgame: complete Arithmetic Challenge 6. <br>
	<h3>v0.5.4</h3><br>
		- Added buyable QoL - the layer node lights up cyan when a buyable is affordable. <br>
		- Minor naming changes. <br>
		- More content in the Planetary Layer. <br>
		- Slightly changed currency displays in nodes. <br>
		- Endgame: Planetary Challenges 1 and 6 completed. <br>
	<h3>v0.5.3</h3><br>
		- Edited the hardcap logic for Multiplication. <br>
		- Buffed the 1st Planetary Milestone and Planet Power. <br>
		- Fixed a bug with the Unlock layer - GOD I HATE LOGARITHMS- <br>
		- Changed progression in the Constructor Sacrifice. <br>
		- Endgame: 1 Planetary Fragment. <br>
	<h3>v0.5.2</h3><br>
		- Added a reset button for Core Boosters. <br>
		- Edited a save file that for some reason had residual Core Boosters. <br>
		- Endgame: 1 Planetary Fragment. <br>
	<h3>v0.5.1</h3><br>
		- Whoops! Readded an upgrade effect that made you stuck at 1e111 Operation Power. <br>
		- Changed the content of D11. <br>
		- Changed the unlock condition of the 5th Addition booster. <br>
		- Endgame: 1 Planetary Fragment. <br>
	<h3>v0.5</h3><br>
		- Planetary Fragment layer. <br>
		- Added the Constructor Sacrifice. <br>
		- Point softcap at e60M. <br>
		- More visual themes. <br>
		- Changed tree layout. <br>
		- Endgame: 1 Planetary Fragment. <br>
	<h3>v0.4.8</h3><br>
		- Core Booster layer. <br>
		- Added some softcaps and QoL. <br>
		- Savebanks implemented. <br>
		- Endgame: 1 Core Booster. <br>
	<h3>v0.4.7</h3><br>
		- Constructor tab in Polygon layer. <br>
		- Adjusted progression from Arithmetic to Polygon a LOT. <br>
		- Endgame: 4 Dimensions. <br>
	<h3>v0.4.6</h3><br>
		- Division layer. <br>
		- Number Core layer. <br>
		- Endgame: 10 Number Cores. <br>
		<i>0.4.5 was skipped because 0.4.6 added TWO layers instead of the usual one bug fix/QoL feature/layer.</i> <br>
	<h3>v0.4.4</h3><br>
		- Adjusted progression in Arithmetic layer. <br>
		- Endgame: 5 Polygonifications. <br>
	<h3>v0.4.3</h3><br>
		- Fixed an Addition booster bug. <br>
		- Adjusted progression in Fundamental and Primitive layers. <br>
		- Endgame: 5 Polygonifications. <br>
	<h3>v0.4.2</h3><br>
		- Fixed a bug that made the game unplayable. <br>
		- More Polygon content. <br>
		- Endgame: 5 Polygonifications. <br>
	<h3>v0.4.1</h3><br>
		- Fixed Arithmetic Challenge 1. <br>
		- Endgame: 1 Shape. <br>
	<h3>v0.4</h3><br>
		- Polygon layer. <br>
		- New currency: Shapes. <br>
		- 3 Arithmetic Challenges. <br>
		- 22 Achievements. <br>
		- Endgame: 1 Shape. <br>
	<h3>v0.3</h3><br>
		- Added Dimension and Multiplication layer. <br>
		- Added new currencies: Dimensions, Multiplication <br>
		- Added Arithmetic Challenges. <br>
		- Added more Achievements. <br>
		- Endgame: 3 Dimensions. <br>
	<h3>v0.2</h3><br>
		- Added Arithmetic layer. <br>
		- Added new currencies: Addition, Subtraction <br>
		- Endgame: 25 Operation Power. <br>
	<h3>v0.1</h3><br>
		- Added Unlock, Fundamental, and Primitive layers. <br>
		- Endgame: 1e15 Numbers. <br>`

let winText = `Congratulations! You have reached the end of JST for now, as of ${VERSION.num}. `

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "buyableScalings_NUMBERCORE"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {

	let gain = new Decimal(1)
	//add
	if (hasUpgrade("fundamental", 13)) gain = gain.add(1)
	if (hasUpgrade("fundamental", 16)) gain = gain.add(5)
	if (hasUpgrade("primitive", 11)) gain = gain.add(5)
	if (getClickableState("addition", 13) != "Inactive" && !inChallenge("arithmetic", 12)) gain = gain.add(clickableEffect("addition", 13))
	//mul
	if (hasUpgrade("fundamental", 11)) gain = gain.mul(2)
	if (hasUpgrade("fundamental", 12)) gain = gain.mul(3)
	if (hasUpgrade("fundamental", 15)) gain = gain.mul(3)
	if (hasUpgrade("fundamental", 16)) gain = gain.mul(15)
	if (hasUpgrade("fundamental", 17)) gain = gain.mul(upgradeEffect("fundamental", 17))
	if (hasMilestone("primitive", 1)) gain = gain.mul(50)
	if (hasUpgrade("fundamental", 26)) gain = gain.mul(25)
	if (hasUpgrade("arithmetic", 27)) gain = gain.mul(upgradeEffect("arithmetic", 27))
	if (!inChallenge("arithmetic", 11) && getClickableState("division", 11) != "Active") gain = gain.mul(buyableEffect("fundamental", 11))
	if (hasUpgrade("primitive", 14)) gain = gain.mul(upgradeEffect("primitive", 14))
	if (hasMilestone("primitive", 4)) gain = gain.mul(100)
	if (hasUpgrade("fundamental", 33)) gain = gain.mul(1000000)
	if (hasUpgrade("fundamental", 35)) gain = gain.mul(1000)
	if (hasUpgrade("arithmetic", 11)) gain = gain.mul(100)
	if (hasUpgrade("arithmetic", 14)) gain = gain.mul(upgradeEffect("arithmetic", 14))
	if (hasUpgrade("primitive", 23)) gain = gain.mul(1e10)
	if (hasUpgrade("subtraction", 13)) gain = gain.mul(100)
	if (hasUpgrade("arithmetic", 21)) gain = gain.mul(upgradeEffect("arithmetic", 21))
	if (hasUpgrade("multiplication", 21)) gain = gain.mul("1e15")
	if (hasUpgrade("arithmetic", 23)) gain = gain.mul("500")
	if (hasChallenge("arithmetic", 12)) gain = gain.mul("1e15")
	if (getBuyableAmount("multiplication", 11).gte(1)) gain = gain.mul(buyableEffect("multiplication", 11))
	if (hasUpgrade("division", 12)) gain = gain.mul(upgradeEffect("division", 12))
	if (hasUpgrade("multiplication", 64)) gain = gain.mul(upgradeEffect("multiplication", 64))
	if (player.multiplication.points.gte(1)) gain = gain.mul(player.multiplication.effect.add(1))
	if (hasMilestone("division", 4) && !inChallenge("polygon", 11)) gain = gain.mul(player.polygon.triEffect.add(1).pow("100").add(1))
	if (hasUpgrade("multiplication", 73)) gain = gain.mul("1e100")
	if (hasChallenge("arithmetic", 22)) gain = gain.mul("1e250")
	gain = gain.mul(player.corebooster.e4)
	if (hasMilestone("division", 6)) gain = gain.mul("1e250")
	if (hasMilestone("primitive", 12)) gain = gain.mul("1e350")
	if (challengeCompletions("polygon", 11) >= 1) gain = gain.mul(challengeEffect("polygon", 11)[0])
	gain = gain.mul(buyableEffect("fundamental", 22))
	if (hasMilestone("corebooster", 1)) gain = gain.mul(player.corebooster.e1.add(1).pow(100))
	if (hasUpgrade("division", 21)) gain = gain.mul(upgradeEffect("division", 21))
	if (hasMilestone("corebooster", 4)){
        let base = player.division.points
        let exp = new Decimal(100)
        base = base.pow(exp)
		gain = gain.mul(Decimal.max(base, decimalOne))
	}
	if (maxedChallenge("polygon", 11)) gain = gain.mul("1e5000")
	//Planetary+ multiplications!
	if (inChallenge("pbooster", 21)) gain = gain.mul(1)
	else if (player.planetary.planetPower.gt(0) && getClickableState("planetary", 12) && !inChallenge("pbooster", 11)) gain = gain.mul(player.planetary.planetPowerEffect)
	else if (player.planetary.planetPower.gt(0)) gain = gain.div(player.planetary.planetPowerEffect.pow(2.5))

	//exp
	if (hasUpgrade("arithmetic", 15)) gain = gain.pow(1.1)
	if (inChallenge("arithmetic", 11)) gain = gain.pow(0.8)
	if (inChallenge("arithmetic", 12)) gain = gain.pow(0.5)
	if (inChallenge("arithmetic", 13)) gain = gain.pow(0.75)
	if (hasChallenge("arithmetic", 13)) gain = gain.pow(1.05)
	if (hasUpgrade("arithmetic", 26)) gain = gain.pow(1.05)
	if (getClickableState("division", 11) != "Active") gain = gain.pow(buyableEffect("fundamental", 21))
	if (inChallenge("arithmetic", 21)) gain = gain.pow(0.1)
	if (player.polygon.hexagons.gte(1)) gain = gain.pow(player.polygon.hexEffect)
	if (inChallenge("arithmetic", 22)) gain = gain.pow(0.5)
	if (inChallenge("polygon", 11)) gain = gain.pow(0.1)
	if (hasUpgrade("division", 16)) gain = gain.pow(1.01)
	if (hasUpgrade("division", 26)) gain = gain.pow(1.001)
	if (hasUpgrade("division", 27)) gain = gain.pow(1.2)
	if (inChallenge("arithmetic", 23)) gain = gain.pow(0.005)
	if (hasUpgrade("fundamental", 52)) gain = gain.pow(1.05)

	//Planetary+ exponents!
	if (hasMilestone("planetary", 2)) gain = gain.pow(2)
	gain = gain.pow(new Decimal(1.001).pow(getBuyableAmount("planetary", 32)))

	//other hypers
	if (hasUpgrade("polygon", 21)) gain = gain.tetrate(decimalOne.add(decimalOne.div("1e12")))

	//final
	if (getClickableState("division", 11) == "Active") gain = gain.pow(0.3)
	if (getClickableState("division", 11) == "Active" && hasMilestone("polygon", 7)) gain = gain.mul("1e10")
	if (getClickableState("division", 11) == "Active") gain = gain.mul(buyableEffect("numbercore", 13))

	if (hasUpgrade("fundamental", 47)) gain = gain.mul("1e100")

	//SOFTCAP
	if (gain.gt("e60e6")){
		let remainder = gain.div("e60e6")
		remainder = remainder.pow(0.01)
		gain = remainder.mul("e60e6")
	}

	if (gain.gt("e5e10")){
		let remainder = gain.div("e5e10")
		remainder = remainder.pow(0.01)
		gain = remainder.mul("e5e10")
	}

	if (inChallenge("pbooster", 11)) gain = gain.log("1e6")
	if (inChallenge("pbooster", 12)) gain = gain.log(10)
	if (inChallenge("pbooster", 21)) gain = gain.div(player.planetary.planetPowerEffect.pow(0.75))

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Current endgame: e1e11 Points",
	"Justcubing97's Something Tree by Justcubing97",
	`<span style="color: #ff0000">THIS GAME IS NO LONGER BEING WORKED ON DUE TO IT BEING VERY UNBALANCED AND DIFFICULT FOR SOME PLAYERS. CHECK OUT JST:R (coming soon)</span>`,
	"<i>Check out the Unlock Layer every so often... there might be more documents you can read.</i>",
	function() {
		if (player.points.gte("e6e7")) return "<br><b>Point gain is softcapped by ^0.01 after e60,000,000!</b>"
		else return ""
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte("e1e11")
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

/*
addLayer("[LAYER HERE]", {
    name: "[LAYER HERE]", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "[SYMBOL HERE]", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: [POSITION HERE], // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "[COLOR HERE]",
    requires: new Decimal([NUMBER HERE]), // Can be a function that takes requirement increases into account
    resource: "[CURRENCY HERE]", // Name of prestige currency
    baseResource: "[CURRENCY HERE]", // Name of resource prestige is based on
    baseAmount() {return player.[LAYER HERE].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: [NUMBER HERE], // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        //exp 
        //other hypers
        //final
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    directMult() {
        let dMult = new Decimal(1)
        return dMult
    },
    row: [ROW HERE], // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "[KEY HERE]", description: "[KEY HERE]: Reset for [CURRENCY HERE", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.[LAYER HERE].unlocked},
    passiveGeneration() {[PASSIVE GEN REQUIREMENT HERE]},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    upgrades: {
        11: {
            title: "placeholder",
            description: "???",
            cost: new Decimal("1e234987234987234"),
        },
    },
    tooltip() {return format(player.[LAYER HERE].points) + " [CURRENCY HERE] (+" + format(getResetGain([LAYER HERE])) + " [CURRENCY HERE] on reset)"},
})
*/